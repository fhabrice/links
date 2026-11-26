<?php
/**
 * LK-TECH — stockage auto-configuré (version PHP).
 *
 *  1. Aucune coordonnée MySQL n'est jamais demandée à l'utilisateur.
 *  2. Si l'hébergeur fournit déjà un accès MySQL (variables d'environnement
 *     ou fichier config/database.php), la base est utilisée automatiquement :
 *     les tables sont créées et remplies au premier lancement.
 *  3. Sinon — ou en cas d'échec — le contenu est enregistré dans dossier
 *     data/ au format JSON, créé automatiquement.
 *
 * @package LK-TECH
 */

declare(strict_types=1);

final class Store
{
    private const TABLES = [
        'lm_documents' => "CREATE TABLE IF NOT EXISTS lm_documents (
            cle VARCHAR(64) NOT NULL PRIMARY KEY,
            valeur LONGTEXT NOT NULL,
            majLe TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

        'lm_messages' => "CREATE TABLE IF NOT EXISTS lm_messages (
            id VARCHAR(64) NOT NULL PRIMARY KEY,
            nom VARCHAR(190) NULL, email VARCHAR(190) NULL, telephone VARCHAR(60) NULL,
            sujet VARCHAR(190) NULL, message TEXT NULL,
            lu TINYINT(1) NOT NULL DEFAULT 0,
            recuLe DATETIME NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

        'lm_candidatures' => "CREATE TABLE IF NOT EXISTS lm_candidatures (
            id VARCHAR(64) NOT NULL PRIMARY KEY,
            civilite VARCHAR(30) NULL, nom VARCHAR(190) NULL, prenom VARCHAR(190) NULL,
            email VARCHAR(190) NULL, telephone VARCHAR(60) NULL, ville VARCHAR(190) NULL,
            dateNaissance VARCHAR(30) NULL, domaine VARCHAR(190) NULL,
            typeCollaboration VARCHAR(120) NULL, experience VARCHAR(120) NULL,
            disponibilite VARCHAR(120) NULL, message TEXT NULL, lienCv VARCHAR(500) NULL,
            consentement TINYINT(1) NOT NULL DEFAULT 0, lu TINYINT(1) NOT NULL DEFAULT 0,
            recuLe DATETIME NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

        'lm_utilisateurs' => "CREATE TABLE IF NOT EXISTS lm_utilisateurs (
            id VARCHAR(64) NOT NULL PRIMARY KEY,
            nom VARCHAR(190) NOT NULL, email VARCHAR(190) NOT NULL, telephone VARCHAR(60) NULL,
            motDePasse TEXT NOT NULL, emailVerifie TINYINT(1) NOT NULL DEFAULT 0,
            jetonVerification VARCHAR(128) NULL, jetonExpiration DATETIME NULL,
            role VARCHAR(20) NOT NULL DEFAULT 'membre',
            creeLe DATETIME NOT NULL, majLe TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY unique_email (email)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

        'lm_annonces' => "CREATE TABLE IF NOT EXISTS lm_annonces (
            id VARCHAR(64) NOT NULL PRIMARY KEY,
            userId VARCHAR(64) NOT NULL, type ENUM('projet','emploi','service') NOT NULL,
            titre VARCHAR(190) NOT NULL, description TEXT NOT NULL,
            budget VARCHAR(100) NULL, localisation VARCHAR(190) NULL,
            contactEmail VARCHAR(190) NULL, contactTel VARCHAR(60) NULL,
            statut ENUM('publie','signale','archive') NOT NULL DEFAULT 'publie',
            vues INT NOT NULL DEFAULT 0, signalements INT NOT NULL DEFAULT 0,
            creeLe DATETIME NOT NULL, majLe TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_userId (userId), INDEX idx_type (type), INDEX idx_statut (statut)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

        'lm_journal' => "CREATE TABLE IF NOT EXISTS lm_journal (
            id INT AUTO_INCREMENT PRIMARY KEY,
            date DATETIME NOT NULL, action VARCHAR(120) NULL, details TEXT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
    ];

    private string $racine;
    private string $dossierData;
    private string $dossierUploads;
    private ?PDO $pdo = null;
    private array $defauts;

    private function __construct(string $racine)
    {
        $this->racine = rtrim($racine, '/');
        $this->dossierData = $this->racine . '/data';
        $this->dossierUploads = $this->racine . '/uploads';

        $this->defauts = lire_json($this->racine . '/app/defaults.json', ['contenu' => [], 'reglages' => []]);
    }

    /** Point d'entrée : prépare le stockage (MySQL détecté, sinon JSON). */
    public static function creer(string $racine): self
    {
        $store = new self($racine);

        if ($store->preparerMysql()) {
            return $store;
        }

        $store->preparerDossiers();
        $store->amorcerJson();

        return $store;
    }

    public function pilote(): string
    {
        return $this->pdo !== null ? 'mysql' : 'json';
    }

    public function dossierData(): string
    {
        return $this->dossierData;
    }

    public function dossierUploads(): string
    {
        return $this->dossierUploads;
    }

    /* ------------------------------------------------------------------ */
    /* Contenu du site                                                     */
    /* ------------------------------------------------------------------ */

    public function contenu(): array
    {
        $defaut = (array) ($this->defauts['contenu'] ?? []);

        if ($this->pdo !== null) {
            $brut = $this->lireDocument('contenu') ?? [];
            $fusion = fusionner($defaut, $brut);
            if ($fusion !== $brut) {
                $this->ecrireDocument('contenu', $fusion);
            }
            return $fusion;
        }

        $brut = lire_json($this->dossierData . '/content.json', []);
        $fusion = fusionner($defaut, $brut);
        if ($fusion !== $brut) {
            ecrire_json($this->dossierData . '/content.json', $fusion);
        }
        return $fusion;
    }

    public function ecrireContenu(array $contenu): array
    {
        if ($this->pdo !== null) {
            $this->ecrireDocument('contenu', $contenu);
            return $contenu;
        }

        ecrire_json($this->dossierData . '/content.json', $contenu);
        return $contenu;
    }

    /* ------------------------------------------------------------------ */
    /* Réglages                                                            */
    /* ------------------------------------------------------------------ */

    public function reglages(): array
    {
        $defaut = (array) ($this->defauts['reglages'] ?? []);

        if ($this->pdo !== null) {
            return fusionner($defaut, $this->lireDocument('reglages') ?? []);
        }

        return fusionner($defaut, lire_json($this->dossierData . '/settings.json', []));
    }

    public function ecrireReglages(array $reglages): array
    {
        $fusion = fusionner((array) ($this->defauts['reglages'] ?? []), $reglages);

        if ($this->pdo !== null) {
            $this->ecrireDocument('reglages', $fusion);
            return $fusion;
        }

        ecrire_json($this->dossierData . '/settings.json', $fusion);
        return $fusion;
    }

    /* ------------------------------------------------------------------ */
    /* Messages du formulaire de contact                                   */
    /* ------------------------------------------------------------------ */

    public function messages(): array
    {
        if ($this->pdo !== null) {
            $lignes = $this->pdo
                ->query('SELECT id, nom, email, telephone, sujet, message, lu, recuLe FROM lm_messages ORDER BY recuLe DESC LIMIT 500')
                ->fetchAll();

            return array_map(static function (array $ligne): array {
                $ligne['lu'] = (bool) $ligne['lu'];
                return $ligne;
            }, $lignes);
        }

        return lire_json($this->dossierData . '/messages.json', []);
    }

    public function ajouterMessage(array $message): array
    {
        $complet = array_merge($message, [
            'id' => identifiant('msg'),
            'recuLe' => date('Y-m-d H:i:s'),
            'lu' => false,
        ]);

        if ($this->pdo !== null) {
            $requete = $this->pdo->prepare(
                'INSERT INTO lm_messages (id, nom, email, telephone, sujet, message, lu, recuLe)
                 VALUES (:id, :nom, :email, :telephone, :sujet, :message, 0, NOW())'
            );
            $requete->execute([
                ':id' => $complet['id'],
                ':nom' => $message['nom'] ?? null,
                ':email' => $message['email'] ?? null,
                ':telephone' => $message['telephone'] ?? null,
                ':sujet' => $message['sujet'] ?? null,
                ':message' => $message['message'] ?? null,
            ]);
            return $complet;
        }

        $messages = $this->messages();
        array_unshift($messages, $complet);
        ecrire_json($this->dossierData . '/messages.json', array_slice($messages, 0, 500));

        return $complet;
    }

    public function marquerMessage(string $id, bool $lu = true): ?array
    {
        if ($this->pdo !== null) {
            $requete = $this->pdo->prepare('UPDATE lm_messages SET lu = :lu WHERE id = :id');
            $requete->execute([':lu' => $lu ? 1 : 0, ':id' => $id]);
            return ['id' => $id, 'lu' => $lu];
        }

        $messages = $this->messages();
        $trouve = null;
        foreach ($messages as $index => $message) {
            if (($message['id'] ?? null) === $id) {
                $messages[$index]['lu'] = $lu;
                $trouve = $messages[$index];
            }
        }
        ecrire_json($this->dossierData . '/messages.json', $messages);

        return $trouve;
    }

    public function supprimerMessage(string $id): bool
    {
        if ($this->pdo !== null) {
            $requete = $this->pdo->prepare('DELETE FROM lm_messages WHERE id = :id');
            $requete->execute([':id' => $id]);
            return true;
        }

        $messages = array_values(array_filter(
            $this->messages(),
            static fn (array $message): bool => ($message['id'] ?? null) !== $id
        ));
        ecrire_json($this->dossierData . '/messages.json', $messages);

        return true;
    }


    /* ------------------------------------------------------------------ */
    /* Candidatures « Travailler avec nous »                               */
    /* ------------------------------------------------------------------ */

    public function candidatures(): array
    {
        if ($this->pdo !== null) {
            $lignes = $this->pdo
                ->query('SELECT id, civilite, nom, prenom, email, telephone, ville, dateNaissance, domaine, typeCollaboration, experience, disponibilite, message, lienCv, consentement, lu, recuLe FROM lm_candidatures ORDER BY recuLe DESC LIMIT 500')
                ->fetchAll();
            return array_map(static function (array $ligne): array {
                $ligne['lu'] = (bool) $ligne['lu'];
                $ligne['consentement'] = (bool) $ligne['consentement'];
                return $ligne;
            }, $lignes);
        }
        return lire_json($this->dossierData . '/candidatures.json', []);
    }

    public function ajouterCandidature(array $donnees): array
    {
        $complet = array_merge($donnees, [
            'id' => identifiant('cand'),
            'recuLe' => date('Y-m-d H:i:s'),
            'lu' => false,
        ]);
        if ($this->pdo !== null) {
            $requete = $this->pdo->prepare(
                'INSERT INTO lm_candidatures (id, civilite, nom, prenom, email, telephone, ville, dateNaissance, domaine, typeCollaboration, experience, disponibilite, message, lienCv, consentement, lu, recuLe) VALUES (:id, :civilite, :nom, :prenom, :email, :telephone, :ville, :dateNaissance, :domaine, :typeCollaboration, :experience, :disponibilite, :message, :lienCv, :consentement, 0, NOW())'
            );
            $requete->execute([
                ':id' => $complet['id'],
                ':civilite' => $donnees['civilite'] ?? null,
                ':nom' => $donnees['nom'] ?? null,
                ':prenom' => $donnees['prenom'] ?? null,
                ':email' => $donnees['email'] ?? null,
                ':telephone' => $donnees['telephone'] ?? null,
                ':ville' => $donnees['ville'] ?? null,
                ':dateNaissance' => $donnees['dateNaissance'] ?? null,
                ':domaine' => $donnees['domaine'] ?? null,
                ':typeCollaboration' => $donnees['typeCollaboration'] ?? null,
                ':experience' => $donnees['experience'] ?? null,
                ':disponibilite' => $donnees['disponibilite'] ?? null,
                ':message' => $donnees['message'] ?? null,
                ':lienCv' => $donnees['lienCv'] ?? null,
                ':consentement' => !empty($donnees['consentement']) ? 1 : 0,
            ]);
            return $complet;
        }
        $list = $this->candidatures();
        array_unshift($list, $complet);
        ecrire_json($this->dossierData . '/candidatures.json', array_slice($list, 0, 1000));
        return $complet;
    }

    public function marquerCandidature(string $id, bool $lu = true): ?array
    {
        if ($this->pdo !== null) {
            $requete = $this->pdo->prepare('UPDATE lm_candidatures SET lu = :lu WHERE id = :id');
            $requete->execute([':lu' => $lu ? 1 : 0, ':id' => $id]);
            return ['id' => $id, 'lu' => $lu];
        }
        $list = $this->candidatures();
        $trouve = null;
        foreach ($list as $index => $c) {
            if (($c['id'] ?? null) === $id) {
                $list[$index]['lu'] = $lu;
                $trouve = $list[$index];
            }
        }
        ecrire_json($this->dossierData . '/candidatures.json', $list);
        return $trouve;
    }

    public function supprimerCandidature(string $id): bool
    {
        if ($this->pdo !== null) {
            $requete = $this->pdo->prepare('DELETE FROM lm_candidatures WHERE id = :id');
            $requete->execute([':id' => $id]);
            return true;
        }
        $list = array_values(array_filter($this->candidatures(), static fn (array $c): bool => ($c['id'] ?? null) !== $id));
        ecrire_json($this->dossierData . '/candidatures.json', $list);
        return true;
    }

    /* ------------------------------------------------------------------ */
    /* Utilisateurs communautaires (Inscription / Connexion)               */
    /* ------------------------------------------------------------------ */

    public function trouverUtilisateurParEmail(string $email): ?array
    {
        $email = mb_strtolower(trim($email));
        if ($this->pdo !== null) {
            $q = $this->pdo->prepare('SELECT * FROM lm_utilisateurs WHERE email = :email LIMIT 1');
            $q->execute([':email' => $email]);
            $row = $q->fetch();
            return $row ?: null;
        }
        $users = lire_json($this->dossierData . '/utilisateurs.json', []);
        foreach ($users as $u) if (mb_strtolower($u['email'] ?? '') === $email) return $u;
        return null;
    }

    public function trouverUtilisateurParId(string $id): ?array
    {
        if ($this->pdo !== null) {
            $q = $this->pdo->prepare('SELECT * FROM lm_utilisateurs WHERE id = :id LIMIT 1');
            $q->execute([':id' => $id]);
            $row = $q->fetch();
            return $row ?: null;
        }
        $users = lire_json($this->dossierData . '/utilisateurs.json', []);
        foreach ($users as $u) if (($u['id'] ?? null) === $id) return $u;
        return null;
    }

    public function creerUtilisateur(array $donnees): array
    {
        $id = identifiant('usr');
        $jeton = bin2hex(random_bytes(32));
        $user = [
            'id' => $id,
            'nom' => trim($donnees['nom'] ?? ''),
            'email' => mb_strtolower(trim($donnees['email'] ?? '')),
            'telephone' => trim($donnees['telephone'] ?? ''),
            'motDePasse' => password_hash((string)($donnees['motDePasse'] ?? ''), PASSWORD_DEFAULT),
            'emailVerifie' => 0,
            'jetonVerification' => $jeton,
            'jetonExpiration' => date('Y-m-d H:i:s', time() + 86400),
            'role' => 'membre',
            'creeLe' => date('Y-m-d H:i:s'),
        ];
        if ($this->pdo !== null) {
            $q = $this->pdo->prepare('INSERT INTO lm_utilisateurs (id, nom, email, telephone, motDePasse, emailVerifie, jetonVerification, jetonExpiration, role, creeLe) VALUES (:id,:nom,:email,:tel,:mdp,0,:jeton,:exp,:role,NOW())');
            $q->execute([':id'=>$user['id'],':nom'=>$user['nom'],':email'=>$user['email'],':tel'=>$user['telephone'],':mdp'=>$user['motDePasse'],':jeton'=>$jeton,':exp'=>$user['jetonExpiration'],':role'=>'membre']);
        } else {
            $users = lire_json($this->dossierData . '/utilisateurs.json', []);
            $users[] = $user;
            ecrire_json($this->dossierData . '/utilisateurs.json', $users);
        }
        // Envoi email vérification
        $lien = base_url() . '/verifier-email.php?token=' . $jeton;
        $sujet = 'Confirmez votre inscription LK-TECH';
        $corps = "Bonjour " . $user['nom'] . ",\n\nMerci pour votre inscription sur LK-TECH.\nConfirmez votre email en cliquant :\n" . $lien . "\n\nCe lien expire dans 24h.\n\n— LK-TECH";
        @mail($user['email'], $sujet, $corps, "From: LK-TECH <no-reply@linksmartec.com>\r\nContent-Type: text/plain; charset=UTF-8\r\n");
        $this->journaliser('utilisateur-inscription', ['id'=>$id,'email'=>$user['email']]);
        return $user;
    }

    public function verifierEmail(string $jeton): bool
    {
        $jeton = trim($jeton);
        if (!$jeton) return false;
        if ($this->pdo !== null) {
            $q = $this->pdo->prepare('SELECT id, jetonExpiration FROM lm_utilisateurs WHERE jetonVerification = :j LIMIT 1');
            $q->execute([':j'=>$jeton]);
            $row = $q->fetch();
            if (!$row) return false;
            if (strtotime($row['jetonExpiration'] ?? '') < time()) return false;
            $this->pdo->prepare('UPDATE lm_utilisateurs SET emailVerifie = 1, jetonVerification = NULL, jetonExpiration = NULL WHERE id = :id')->execute([':id'=>$row['id']]);
            $this->journaliser('email-verifie', ['id'=>$row['id']]);
            return true;
        }
        $users = lire_json($this->dossierData . '/utilisateurs.json', []);
        $ok=false;
        foreach ($users as $i=>$u) if (($u['jetonVerification'] ?? null) === $jeton) {
            if (strtotime($u['jetonExpiration'] ?? '') < time()) return false;
            $users[$i]['emailVerifie']=1; $users[$i]['jetonVerification']=null; $users[$i]['jetonExpiration']=null; $ok=true;
        }
        if ($ok) ecrire_json($this->dossierData . '/utilisateurs.json', $users);
        return $ok;
    }

    public function verifierMotDePasseUtilisateur(string $email, string $mdp): ?array
    {
        $user = $this->trouverUtilisateurParEmail($email);
        if (!$user) return null;
        if (!password_verify($mdp, $user['motDePasse'] ?? '')) return null;
        return $user;
    }

    /* ------------------------------------------------------------------ */
    /* Annonces (Projet / Emploi / Service)                               */
    /* ------------------------------------------------------------------ */

    public function listerAnnonces(array $opts=[]): array
    {
        $type = $opts['type'] ?? null;
        $statut = $opts['statut'] ?? null;
        $userId = $opts['userId'] ?? null;
        $limit = (int)($opts['limit'] ?? 500);
        if ($this->pdo !== null) {
            $sql='SELECT a.*, u.nom as auteurNom FROM lm_annonces a LEFT JOIN lm_utilisateurs u ON u.id=a.userId WHERE 1=1';
            $params=[];
            if ($type) { $sql.=' AND a.type = :t'; $params[':t']=$type; }
            if ($statut) { $sql.=' AND a.statut = :s'; $params[':s']=$statut; }
            elseif (!($opts['admin'] ?? false)) { $sql.=" AND a.statut = 'publie'"; }
            if ($userId) { $sql.=' AND a.userId = :uid'; $params[':uid']=$userId; }
            $sql.=' ORDER BY a.creeLe DESC LIMIT '. max(1, min(500,$limit));
            $q=$this->pdo->prepare($sql); $q->execute($params); return $q->fetchAll();
        }
        $all = lire_json($this->dossierData . '/annonces.json', []);
        $filtre = array_filter($all, fn($a)=> (!$type || ($a['type']??null)===$type) && (!$statut || ($a['statut']??null)===$statut) && (!$userId || ($a['userId']??null)===$userId));
        if (!($opts['admin'] ?? false)) $filtre=array_filter($filtre, fn($a)=>($a['statut']??'publie')==='publie');
        usort($filtre, fn($a,$b)=> strcmp($b['creeLe']??'', $a['creeLe']??''));
        return array_slice(array_values($filtre),0,$limit);
    }

    public function ajouterAnnonce(string $userId, array $d): array
    {
        $annonce = [
            'id'=>identifiant('ann'),
            'userId'=>$userId,
            'type'=> in_array($d['type']??'', ['projet','emploi','service']) ? $d['type'] : 'projet',
            'titre'=>mb_substr(trim($d['titre']??''),0,190),
            'description'=>mb_substr(trim($d['description']??''),0,5000),
            'budget'=>mb_substr(trim($d['budget']??''),0,100),
            'localisation'=>mb_substr(trim($d['localisation']??''),0,190),
            'contactEmail'=>mb_substr(trim($d['contactEmail']??''),0,190),
            'contactTel'=>mb_substr(trim($d['contactTel']??''),0,60),
            'statut'=>'publie',
            'vues'=>0,'signalements'=>0,
            'creeLe'=>date('Y-m-d H:i:s'),
        ];
        if ($this->pdo !== null) {
            $this->pdo->prepare('INSERT INTO lm_annonces (id,userId,type,titre,description,budget,localisation,contactEmail,contactTel,statut,vues,signalements,creeLe) VALUES (:id,:uid,:type,:titre,:desc,:budget,:loc,:email,:tel,:statut,0,0,NOW())')->execute([
                ':id'=>$annonce['id'],':uid'=>$userId,':type'=>$annonce['type'],':titre'=>$annonce['titre'],':desc'=>$annonce['description'],':budget'=>$annonce['budget'],':loc'=>$annonce['localisation'],':email'=>$annonce['contactEmail'],':tel'=>$annonce['contactTel'],':statut'=>'publie'
            ]);
        } else {
            $all=lire_json($this->dossierData . '/annonces.json', []); array_unshift($all,$annonce); ecrire_json($this->dossierData . '/annonces.json', array_slice($all,0,1000));
        }
        $this->journaliser('annonce-cree',['id'=>$annonce['id'],'userId'=>$userId,'type'=>$annonce['type']]);
        return $annonce;
    }

    public function signalerAnnonce(string $id): bool
    {
        if ($this->pdo !== null) {
            $this->pdo->prepare('UPDATE lm_annonces SET signalements = signalements + 1, statut = IF(signalements >= 2, "signale", statut) WHERE id = :id')->execute([':id'=>$id]);
            return true;
        }
        $all=lire_json($this->dossierData . '/annonces.json', []); foreach($all as $i=>$a) if(($a['id']??null)===$id){ $all[$i]['signalements']= (int)($a['signalements']??0)+1; if($all[$i]['signalements']>=3) $all[$i]['statut']='signale';}
        ecrire_json($this->dossierData . '/annonces.json', $all); return true;
    }

    public function modererAnnonce(string $id, string $statut): bool
    {
        $statut = in_array($statut, ['publie','archive','signale']) ? $statut : 'publie';
        if ($this->pdo !== null) { $this->pdo->prepare('UPDATE lm_annonces SET statut = :s WHERE id = :id')->execute([':s'=>$statut,':id'=>$id]); return true; }
        $all=lire_json($this->dossierData . '/annonces.json', []); foreach($all as $i=>$a) if(($a['id']??null)===$id) $all[$i]['statut']=$statut; ecrire_json($this->dossierData . '/annonces.json', $all); return true;
    }

    public function supprimerAnnonce(string $id): bool
    {
        if ($this->pdo !== null) { $this->pdo->prepare('DELETE FROM lm_annonces WHERE id = :id')->execute([':id'=>$id]); return true; }
        $all=array_values(array_filter(lire_json($this->dossierData . '/annonces.json', []), fn($a)=>($a['id']??null)!==$id)); ecrire_json($this->dossierData . '/annonces.json', $all); return true;
    }

    public function envoyerCandidatureParEmail(array $candidature): array
    {
        $contenu = $this->contenu();
        $dest = trim((string)($contenu['travaillerAvecNous']['emailDestination'] ?? $contenu['travaillerAvecNous']['googleForm']['gmailDestination'] ?? 'fabricenzarubara@gmail.com'));
        if ($dest === '') $dest = 'fabricenzarubara@gmail.com';
        $sujet = 'Nouvelle candidature LK-TECH : ' . ($candidature['prenom'] ?? '') . ' ' . ($candidature['nom'] ?? '') . ' — ' . ($candidature['domaine'] ?? 'Candidature');
        $corps = "Nouvelle candidature reçue via le site LK-TECH\n\n";
        foreach (['civilite','nom','prenom','email','telephone','ville','dateNaissance','domaine','typeCollaboration','experience','disponibilite','message','lienCv'] as $k) {
            $v = $candidature[$k] ?? '';
            if ($v !== '') $corps .= ucfirst($k) . " : " . $v . "\n";
        }
        $corps .= "\nReçu le : " . date('c') . "\nID : " . ($candidature['id'] ?? '') . "\n";
        $corps .= "\n—\nCeci est un message automatique du site LK-TECH (Travailler avec nous).\n";
        $headers = "From: LK-TECH <no-reply@linksmartec.com>\r\n";
        $headers .= "Reply-To: " . ($candidature['email'] ?? $dest) . "\r\n";
        $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
        $headers .= "X-Mailer: LK-TECH PHP\r\n";
        // Tentative d'envoi via mail() — fonctionne sur la plupart des hébergements cPanel
        $ok = false;
        $err = '';
        if (function_exists('mail')) {
            $ok = @mail($dest, $sujet, $corps, $headers);
            if (!$ok) $err = 'mail() a échoué (vérifiez la config SMTP de l hébergeur)';
        } else {
            $err = 'mail() non disponible sur ce serveur';
        }
        $this->journaliser('candidature-email', ['dest' => $dest, 'ok' => $ok, 'id' => $candidature['id'] ?? '', 'erreur' => $err]);
        return ['ok' => $ok, 'dest' => $dest, 'erreur' => $err];
    }

    public function transfererVersGoogleForm(array $candidature): array
    {
        $contenu = $this->contenu();
        $cfg = $contenu['travaillerAvecNous']['googleForm'] ?? [];
        $actionUrl = trim((string)($cfg['actionUrl'] ?? ''));
        if ($actionUrl === '' || strpos($actionUrl, 'docs.google.com') === false) {
            return ['ok' => false, 'raison' => 'non-configure'];
        }
        $map = $cfg['fieldMap'] ?? [];
        $params = [];
        foreach (['civilite','nom','prenom','email','telephone','ville','dateNaissance','domaine','typeCollaboration','experience','disponibilite','message','lienCv'] as $k) {
            $entry = trim((string)($map[$k] ?? ''));
            if ($entry !== '' && !empty($candidature[$k])) {
                $params[$entry] = (string)$candidature[$k];
            }
        }
        if (!$params) return ['ok' => false, 'raison' => 'map-vide'];
        $ch = curl_init($actionUrl);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => http_build_query($params),
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 8,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_HTTPHEADER => ['Content-Type: application/x-www-form-urlencoded'],
        ]);
        $rep = curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $err = curl_error($ch);
        curl_close($ch);
        $this->journaliser('candidature-googleform', ['id' => $candidature['id'] ?? '', 'code' => $code, 'erreur' => $err]);
        return ['ok' => $code >= 200 && $code < 400, 'code' => $code, 'erreur' => $err];
    }

    /* ------------------------------------------------------------------ */
    /* Comptes d'administration                                            */
    /* ------------------------------------------------------------------ */


    public function securite(): array
    {
        $defaut = ['utilisateurs' => [$this->compteInitial()]];

        if ($this->pdo !== null) {
            $donnees = $this->lireDocument('securite');
            if (!$donnees) {
                $this->ecrireDocument('securite', $defaut);
                return $defaut;
            }
            return $donnees;
        }

        if (!is_file($this->dossierData . '/security.json')) {
            ecrire_json($this->dossierData . '/security.json', $defaut);
            return $defaut;
        }

        return lire_json($this->dossierData . '/security.json', $defaut);
    }

    public function ecrireSecurite(array $securite): array
    {
        if ($this->pdo !== null) {
            $this->ecrireDocument('securite', $securite);
            return $securite;
        }

        ecrire_json($this->dossierData . '/security.json', $securite);
        return $securite;
    }

    /** Compte créé au premier démarrage : admin / (ADMIN_PASSWORD ou linksmartech). */
    private function compteInitial(): array
    {
        $motDePasse = getenv('ADMIN_PASSWORD') ?: 'linksmartech';

        return [
            'id' => identifiant('usr'),
            'identifiant' => 'admin',
            'motDePasse' => password_hash($motDePasse, PASSWORD_DEFAULT),
            'role' => 'proprietaire',
            'creeLe' => date('c'),
        ];
    }

    /* ------------------------------------------------------------------ */
    /* Journal des actions                                                 */
    /* ------------------------------------------------------------------ */

    public function journaliser(string $action, array $details = []): void
    {
        if ($this->pdo !== null) {
            $requete = $this->pdo->prepare('INSERT INTO lm_journal (date, action, details) VALUES (NOW(), :action, :details)');
            $requete->execute([':action' => $action, ':details' => json_encode($details, JSON_UNESCAPED_UNICODE)]);
            return;
        }

        $fichier = $this->dossierData . '/journal.json';
        $lignes = lire_json($fichier, []) ?: [];
        array_unshift($lignes, array_merge(['date' => date('c'), 'action' => $action], $details));
        ecrire_json($fichier, array_slice($lignes, 0, 200));
    }

    /* ------------------------------------------------------------------ */
    /* Statistiques du tableau de bord                                     */
    /* ------------------------------------------------------------------ */

    public function statistiques(): array
    {
        $messages = $this->messages();
        $contenu = $this->contenu();

        return [
            'messages' => count($messages),
            'messagesNonLus' => count(array_filter($messages, static fn (array $m): bool => empty($m['lu']))),
            'produits' => count($contenu['produits'] ?? []),
            'services' => count($contenu['services'] ?? []),
        ];
    }

    /* ------------------------------------------------------------------ */
    /* Pilote MySQL (facultatif, détecté automatiquement)                  */
    /* ------------------------------------------------------------------ */

    private function preparerMysql(): bool
    {
        $config = $this->configMysql();
        if ($config === null) {
            return false;
        }

        try {
            if (!class_exists('PDO') || !in_array('mysql', PDO::getAvailableDrivers(), true)) {
                return false;
            }

            $dsn = sprintf('mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4', $config['host'], $config['port'], $config['database']);
            $pdo = new PDO($dsn, $config['user'], $config['password'], [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);

            foreach (self::TABLES as $requete) {
                $pdo->exec($requete);
            }

            $this->pdo = $pdo;
            $this->preparerDossiers();

            if (!$this->lireDocument('contenu')) {
                $this->ecrireDocument('contenu', (array) ($this->defauts['contenu'] ?? []));
            }
            if (!$this->lireDocument('reglages')) {
                $this->ecrireDocument('reglages', (array) ($this->defauts['reglages'] ?? []));
            }
            if (!$this->lireDocument('securite')) {
                $this->ecrireDocument('securite', ['utilisateurs' => [$this->compteInitial()]]);
            }

            return true;
        } catch (Throwable $erreur) {
            // Base indisponible : on continue silencieusement sur le stockage local.
            $this->pdo = null;
            return false;
        }
    }

    /**
     * Une configuration MySQL n'est utilisée que si elle est DÉJÀ fournie
     * par l'hébergeur : variables d'environnement, ou fichier
     * config/database.php. Aucun écran ne la demande jamais.
     */
    private function configMysql(): ?array
    {
        $fichier = $this->racine . '/config/database.php';
        $depuisFichier = is_file($fichier) ? (array) require $fichier : [];

        $hote = getenv('MYSQL_HOST') ?: getenv('DB_HOST') ?: ($depuisFichier['host'] ?? null);
        $utilisateur = getenv('MYSQL_USER') ?: getenv('DB_USER') ?: ($depuisFichier['user'] ?? null);
        $base = getenv('MYSQL_DATABASE') ?: getenv('DB_NAME') ?: ($depuisFichier['database'] ?? null);

        if (($depuisFichier['enabled'] ?? true) === false) {
            return null;
        }

        if (!$hote || !$utilisateur || !$base) {
            return null;
        }

        return [
            'host' => (string) $hote,
            'port' => (int) (getenv('MYSQL_PORT') ?: getenv('DB_PORT') ?: ($depuisFichier['port'] ?? 3306)),
            'user' => (string) $utilisateur,
            'password' => (string) (getenv('MYSQL_PASSWORD') ?: getenv('DB_PASSWORD') ?: ($depuisFichier['password'] ?? '')),
            'database' => (string) $base,
        ];
    }

    private function lireDocument(string $cle): ?array
    {
        if ($this->pdo === null) {
            return null;
        }

        $requete = $this->pdo->prepare('SELECT valeur FROM lm_documents WHERE cle = :cle LIMIT 1');
        $requete->execute([':cle' => $cle]);
        $valeur = $requete->fetchColumn();

        if ($valeur === false || $valeur === null) {
            return null;
        }

        $donnees = json_decode((string) $valeur, true);
        return is_array($donnees) ? $donnees : null;
    }

    private function ecrireDocument(string $cle, array $valeur): void
    {
        if ($this->pdo === null) {
            return;
        }

        $requete = $this->pdo->prepare(
            'INSERT INTO lm_documents (cle, valeur) VALUES (:cle, :valeur)
             ON DUPLICATE KEY UPDATE valeur = VALUES(valeur)'
        );
        $requete->execute([
            ':cle' => $cle,
            ':valeur' => json_encode($valeur, JSON_UNESCAPED_UNICODE),
        ]);
    }

    /* ------------------------------------------------------------------ */
    /* Dossiers de travail                                                 */
    /* ------------------------------------------------------------------ */

    private function preparerDossiers(): void
    {
        foreach ([$this->dossierData, $this->dossierUploads] as $dossier) {
            if (!is_dir($dossier)) {
                @mkdir($dossier, 0775, true);
            }
        }

        // Protection : ces dossiers ne doivent jamais être servis directement.
        $this->protegerDossier($this->dossierData);
        $this->protegerDossier($this->dossierUploads);
    }

    private function protegerDossier(string $dossier): void
    {
        $htaccess = $dossier . '/.htaccess';
        if (is_dir($dossier) && !is_file($htaccess)) {
            @file_put_contents($htaccess, "Require all denied\n<IfModule !mod_authz_core.c>\n  Order allow,deny\n  Deny from all\n</IfModule>\n");
        }
    }

    private function amorcerJson(): void
    {
        if (!is_file($this->dossierData . '/content.json')) {
            ecrire_json($this->dossierData . '/content.json', (array) ($this->defauts['contenu'] ?? []));
        }
        if (!is_file($this->dossierData . '/settings.json')) {
            ecrire_json($this->dossierData . '/settings.json', (array) ($this->defauts['reglages'] ?? []));
        }
        if (!is_file($this->dossierData . '/messages.json')) {
            ecrire_json($this->dossierData . '/messages.json', []);
        }
        if (!is_file($this->dossierData . '/candidatures.json')) {
            ecrire_json($this->dossierData . '/candidatures.json', []);
        }
        if (!is_file($this->dossierData . '/security.json')) {
            ecrire_json($this->dossierData . '/security.json', ['utilisateurs' => [$this->compteInitial()]]);
        }

        // Le dossier uploads reçoit des images : jamais de code exécutable.
        $garde = $this->dossierUploads . '/.htaccess';
        if (is_dir($this->dossierUploads) && !is_file($garde)) {
            @file_put_contents($garde, "php_flag engine off\n<FilesMatch \"\\.(php|phtml|php[0-9])$\">\n  Require all denied\n</FilesMatch>\nOptions -Indexes\n");
        }
    }
}
