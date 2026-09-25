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
            'realisations' => count($contenu['realisations'] ?? []),
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
