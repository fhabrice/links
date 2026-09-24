<?php
/**
 * LK-TECH — authentification de l'administration (version PHP).
 *
 * Choix techniques :
 *  - mots de passe hachés avec password_hash() (bcrypt ou argon2 selon le serveur) ;
 *  - session par cookie signé (HMAC-SHA256) plutôt que par session PHP :
 *    cela fonctionne sur tous les hébergements, y compris ceux dont le dossier
 *    de sessions est mal configuré, et reste valable même après un redémarrage ;
 *  - limitation du nombre de tentatives de connexion.
 *
 * @package LK-TECH
 */

declare(strict_types=1);

final class Auth
{
    private const DUREE_SESSION = 43200;      // 12 h
    private const MAX_TENTATIVES = 8;
    private const FENETRE_TENTATIVES = 600;   // 10 min
    private const COOKIE = 'lm_session';

    private Store $store;
    private string $fichierTentatives;

    public function __construct(Store $store)
    {
        $this->store = $store;
        $this->fichierTentatives = $store->dossierData() . '/tentatives.json';
    }

    /* ------------------------------------------------------------------ */
    /* Session                                                             */
    /* ------------------------------------------------------------------ */

    /** Utilisateur connecté (d'après le cookie signé), ou null. */
    public function utilisateur(): ?array
    {
        $jeton = $_COOKIE[self::COOKIE] ?? '';
        $charge = $this->verifierJeton(is_string($jeton) ? $jeton : '');

        if ($charge === null) {
            return null;
        }

        foreach ($this->store->securite()['utilisateurs'] ?? [] as $utilisateur) {
            if (($utilisateur['id'] ?? null) === ($charge['sub'] ?? null)) {
                return $utilisateur;
            }
        }

        return null;
    }

    /**
     * Vérifie un identifiant et un mot de passe.
     *
     * @return array{ok:bool, message?:string, utilisateur?:array, jeton?:string}
     */
    public function connecter(string $identifiant, string $motDePasse): array
    {
        $cle = mb_strtolower($identifiant);

        if ($this->tropDeTentatives($cle)) {
            return ['ok' => false, 'message' => 'Trop de tentatives. Réessayez dans quelques minutes.'];
        }

        $securite = $this->store->securite();
        $utilisateurs = $securite['utilisateurs'] ?? [];

        foreach ($utilisateurs as $index => $utilisateur) {
            if (mb_strtolower((string) ($utilisateur['identifiant'] ?? '')) !== $cle) {
                continue;
            }

            $empreinte = (string) ($utilisateur['motDePasse'] ?? '');

            if (str_starts_with($empreinte, 'scrypt$')) {
                // Compte créé par la version Node.js : les mots de passe sont
                // hachés différemment. Solution documentée : supprimer
                // data/security.json pour recréer le compte admin.
                return [
                    'ok' => false,
                    'message' => "Ce compte provient de la version Node.js. Supprimez le fichier data/security.json puis rechargez cette page pour recréer le compte administrateur.",
                ];
            }

            if (str_starts_with($empreinte, '$')) {
                $valide = password_verify($motDePasse, $empreinte);
            } else {
                // Mot de passe encore en clair (compte initial) : haché aussitôt.
                $valide = hash_equals($empreinte, $motDePasse);
                if ($valide) {
                    $utilisateurs[$index]['motDePasse'] = password_hash($motDePasse, PASSWORD_DEFAULT);
                    $securite['utilisateurs'] = $utilisateurs;
                    $this->store->ecrireSecurite($securite);
                }
            }

            if (!$valide) {
                break;
            }

            $this->reinitialiserTentatives($cle);
            $this->store->journaliser('connexion', ['identifiant' => $utilisateur['identifiant']]);

            return [
                'ok' => true,
                'utilisateur' => $utilisateur,
                'jeton' => $this->creerJeton($utilisateur),
            ];
        }

        $this->noterEchec($cle);
        $this->store->journaliser('connexion-echouee', ['identifiant' => $identifiant]);

        return ['ok' => false, 'message' => 'Identifiant ou mot de passe incorrect.'];
    }

    /** Entête Set-Cookie à renvoyer pour ouvrir une session. */
    public function enteteSession(string $jeton): string
    {
        return $this->enteteCookie($jeton, time() + self::DUREE_SESSION);
    }

    /** Entête Set-Cookie à renvoyer pour fermer la session. */
    public function enteteDeconnexion(): string
    {
        return $this->enteteCookie('', time() - 3600);
    }

    /* ------------------------------------------------------------------ */
    /* Mot de passe                                                        */
    /* ------------------------------------------------------------------ */

    /** @return array{ok:bool, message:string} */
    public function changerMotDePasse(array $utilisateur, string $actuel, string $nouveau): array
    {
        if (mb_strlen($nouveau) < 6) {
            return ['ok' => false, 'message' => 'Le nouveau mot de passe doit contenir au moins 6 caractères.'];
        }

        $securite = $this->store->securite();
        $utilisateurs = $securite['utilisateurs'] ?? [];
        $trouve = false;

        foreach ($utilisateurs as $index => $compte) {
            if (($compte['id'] ?? null) !== ($utilisateur['id'] ?? null)) {
                continue;
            }

            $empreinte = (string) ($compte['motDePasse'] ?? '');
            $correct = str_starts_with($empreinte, '$')
                ? password_verify($actuel, $empreinte)
                : hash_equals($empreinte, $actuel);

            if (!$correct) {
                return ['ok' => false, 'message' => 'Mot de passe actuel incorrect.'];
            }

            $utilisateurs[$index]['motDePasse'] = password_hash($nouveau, PASSWORD_DEFAULT);
            $trouve = true;
        }

        if (!$trouve) {
            return ['ok' => false, 'message' => 'Compte introuvable.'];
        }

        $securite['utilisateurs'] = $utilisateurs;
        $this->store->ecrireSecurite($securite);
        $this->store->journaliser('mot-de-passe-modifie', ['identifiant' => $utilisateur['identifiant'] ?? '']);

        return ['ok' => true, 'message' => 'Mot de passe mis à jour.'];
    }

    /* ------------------------------------------------------------------ */
    /* Jeton signé (HMAC-SHA256)                                           */
    /* ------------------------------------------------------------------ */

    private function creerJeton(array $utilisateur): string
    {
        $charge = [
            'sub' => $utilisateur['id'] ?? '',
            'identifiant' => $utilisateur['identifiant'] ?? '',
            'role' => $utilisateur['role'] ?? 'proprietaire',
            'exp' => time() + self::DUREE_SESSION,
        ];

        $corps = $this->base64url_encode((string) json_encode($charge));
        $signature = hash_hmac('sha256', $corps, $this->secret(), true);

        return $corps . '.' . $this->base64url_encode($signature);
    }

    private function verifierJeton(string $jeton): ?array
    {
        if ($jeton === '' || substr_count($jeton, '.') !== 1) {
            return null;
        }

        [$corps, $signature] = explode('.', $jeton, 2);
        $signatureAttendue = $this->base64url_encode(hash_hmac('sha256', $corps, $this->secret(), true));

        if (!hash_equals($signatureAttendue, $signature)) {
            return null;
        }

        $charge = json_decode((string) $this->base64url_decode($corps), true);
        if (!is_array($charge) || ($charge['exp'] ?? 0) < time()) {
            return null;
        }

        return $charge;
    }

    private function base64url_encode(string $donnees): string
    {
        return rtrim(strtr(base64_encode($donnees), '+/', '-_'), '=');
    }

    private function base64url_decode(string $donnees): string
    {
        $reste = strlen($donnees) % 4;
        if ($reste > 0) {
            $donnees .= str_repeat('=', 4 - $reste);
        }

        return (string) base64_decode(strtr($donnees, '-_', '+/'), true);
    }

    /**
     * Clé de signature : celle de l'hébergeur si elle est fournie, sinon une clé
     * générée une seule fois et conservée dans data/secret.key.
     */
    private function secret(): string
    {
        static $secret = null;
        if ($secret !== null) {
            return $secret;
        }

        $environnement = getenv('SESSION_SECRET') ?: getenv('APP_SECRET') ?: '';
        if ($environnement !== '') {
            $secret = hash('sha256', $environnement);
            return $secret;
        }

        $fichier = $this->store->dossierData() . '/secret.key';
        if (is_file($fichier)) {
            $contenu = trim((string) file_get_contents($fichier));
            if ($contenu !== '') {
                $secret = $contenu;
                return $secret;
            }
        }

        $secret = bin2hex(random_bytes(32));
        @file_put_contents($fichier, $secret);

        return $secret;
    }

    private function enteteCookie(string $valeur, int $expire): string
    {
        $securise = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
            || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');

        return sprintf(
            '%s=%s; Expires=%s; Max-Age=%d; Path=/; HttpOnly; SameSite=Lax%s',
            self::COOKIE,
            $valeur,
            gmdate('D, d M Y H:i:s', $expire) . ' GMT',
            max(0, $expire - time()),
            $securise ? '; Secure' : ''
        );
    }

    /* ------------------------------------------------------------------ */
    /* Limitation des tentatives                                           */
    /* ------------------------------------------------------------------ */

    public function tropDeTentatives(string $cle): bool
    {
        $tentatives = lire_json($this->fichierTentatives, []) ?: [];
        $entree = $tentatives[$cle] ?? null;

        if (!$entree) {
            return false;
        }

        if (time() - (int) ($entree['debut'] ?? 0) > self::FENETRE_TENTATIVES) {
            unset($tentatives[$cle]);
            ecrire_json($this->fichierTentatives, $tentatives);
            return false;
        }

        return (int) ($entree['compteur'] ?? 0) >= self::MAX_TENTATIVES;
    }

    public function noterEchec(string $cle): void
    {
        $tentatives = lire_json($this->fichierTentatives, []) ?: [];
        $entree = $tentatives[$cle] ?? ['compteur' => 0, 'debut' => time()];

        if (time() - (int) $entree['debut'] > self::FENETRE_TENTATIVES) {
            $entree = ['compteur' => 0, 'debut' => time()];
        }

        $entree['compteur'] = (int) $entree['compteur'] + 1;
        $tentatives[$cle] = $entree;

        ecrire_json($this->fichierTentatives, $tentatives);
    }

    public function reinitialiserTentatives(string $cle): void
    {
        $tentatives = lire_json($this->fichierTentatives, []) ?: [];
        unset($tentatives[$cle]);
        ecrire_json($this->fichierTentatives, $tentatives);
    }
}
