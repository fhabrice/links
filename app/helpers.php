<?php
/**
 * LK-TECH (Linksmartec) — fonctions utilitaires.
 *
 * @package LK-TECH
 */

declare(strict_types=1);

/** Adresse de base de l'application : '' à la racine, '/dossier' dans un sous-dossier. */
function base_url(): string
{
    static $base = null;
    if ($base !== null) {
        return $base;
    }

    $script = str_replace('\\', '/', (string) ($_SERVER['SCRIPT_NAME'] ?? ''));
    $script = (string) preg_replace('#/(api|admin)/index\.php$#', '', $script);
    $script = (string) preg_replace('#/(index|a-propos)\.php$#', '', $script);

    $base = rtrim($script, '/');
    return $base;
}

/** Envoie une réponse JSON puis s'arrête. */
function repondre_json($donnees, int $code = 200, array $entetes = []): void
{
    if (!headers_sent()) {
        http_response_code($code);
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-store');
        header('X-Content-Type-Options: nosniff');
        foreach ($entetes as $nom => $valeur) {
            header($nom . ': ' . $valeur);
        }
    }

    echo json_encode($donnees, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
}

/** Lit un fichier JSON ; renvoie $defaut en cas d'absence ou de contenu invalide. */
function lire_json(string $chemin, $defaut = null)
{
    if (!is_file($chemin)) {
        return $defaut;
    }

    $brut = file_get_contents($chemin);
    if ($brut === false || $brut === '') {
        return $defaut;
    }

    $donnees = json_decode($brut, true);
    return is_array($donnees) ? $donnees : $defaut;
}

/** Écrit un fichier JSON de façon atomique (écriture temporaire puis renommage). */
function ecrire_json(string $chemin, $valeur): bool
{
    $dossier = dirname($chemin);
    if (!is_dir($dossier) && !mkdir($dossier, 0775, true) && !is_dir($dossier)) {
        return false;
    }

    $temporaire = $chemin . '.tmp';
    $contenu = json_encode($valeur, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    if ($contenu === false || file_put_contents($temporaire, $contenu) === false) {
        return false;
    }

    return rename($temporaire, $chemin);
}

/**
 * Fusionne les valeurs par défaut avec un contenu enregistré.
 * Permet d'ajouter de nouveaux réglages dans une mise à jour sans rien casser.
 */
function fusionner($defaut, $valeur)
{
    if (is_array($defaut) && array_is_list($defaut)) {
        return is_array($valeur) && array_is_list($valeur) ? $valeur : $defaut;
    }

    if (is_array($defaut)) {
        if (!is_array($valeur)) {
            return $defaut;
        }

        $sortie = [];
        foreach (array_unique(array_merge(array_keys($defaut), array_keys($valeur))) as $cle) {
            $sortie[$cle] = array_key_exists($cle, $defaut)
                ? fusionner($defaut[$cle], $valeur[$cle] ?? null)
                : $valeur[$cle];
        }
        return $sortie;
    }

    return $valeur === null ? $defaut : $valeur;
}

/** Génère un identifiant unique. */
function identifiant(string $prefixe = 'id'): string
{
    return $prefixe . '-' . bin2hex(random_bytes(6));
}

/** Nettoie un texte saisi par un visiteur (longueur + caractères de contrôle). */
function nettoyer($texte, int $longueurMax = 400): string
{
    $texte = (string) $texte;
    $texte = (string) preg_replace('/[\x00-\x1F\x7F]/u', ' ', $texte);
    $texte = trim($texte);

    return mb_substr($texte, 0, $longueurMax);
}

/** Vérifie la forme d'une adresse e-mail. */
function email_valide(string $email): bool
{
    return (bool) preg_match('/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/', $email);
}

/** Lecture du corps de la requête (JSON ou formulaire). */
function lire_corps(): array
{
    static $corps = null;
    if ($corps !== null) {
        return $corps;
    }

    $brut = file_get_contents('php://input');
    if ($brut === false || $brut === '') {
        $corps = $_POST ?: [];
        return $corps;
    }

    $donnees = json_decode($brut, true);
    if (is_array($donnees)) {
        $corps = $donnees;
        return $corps;
    }

    parse_str($brut, $formulaire);
    $corps = $formulaire ?: [];
    return $corps;
}
