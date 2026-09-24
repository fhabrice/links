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
    $script = (string) preg_replace('#/(index|a-propos|produit)\.php$#', '', $script);

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

/**
 * Comme nettoyer(), mais préserve les sauts de ligne (textes sur plusieurs
 * paragraphes, ex. la description longue d'un produit).
 */
function nettoyer_multiligne($texte, int $longueurMax = 4000): string
{
    $texte = (string) $texte;
    // Caractères de contrôle, sauf \n (0x0A) et \r (0x0D, normalisé en \n).
    $texte = (string) preg_replace('/[\x00-\x09\x0B-\x1F\x7F]/u', ' ', $texte);
    $texte = str_replace("\r\n", "\n", $texte);
    $texte = (string) preg_replace("/\n{3,}/", "\n\n", $texte);
    $texte = trim($texte);

    return mb_substr($texte, 0, $longueurMax);
}

/**
 * Convertit un titre en identifiant d'URL : « Kit solaire hybride 5 kVA »
 * devient « kit-solaire-hybride-5-kva ». Les accents courants (français et
 * langues congolaises) sont translittérés ; tout le reste non alphanumérique
 * devient un tiret. Le résultat est identique côté JavaScript (site.js).
 */
function slugifier(string $texte, int $longueurMax = 90): string
{
    static $translit = null;
    if ($translit === null) {
        $translit = [
            'à' => 'a', 'á' => 'a', 'â' => 'a', 'ã' => 'a', 'ä' => 'a', 'å' => 'a',
            'è' => 'e', 'é' => 'e', 'ê' => 'e', 'ë' => 'e',
            'ì' => 'i', 'í' => 'i', 'î' => 'i', 'ï' => 'i',
            'ò' => 'o', 'ó' => 'o', 'ô' => 'o', 'õ' => 'o', 'ö' => 'o',
            'ù' => 'u', 'ú' => 'u', 'û' => 'u', 'ü' => 'u',
            'ç' => 'c', 'ñ' => 'n', 'ý' => 'y', 'ÿ' => 'y',
            'œ' => 'oe', 'æ' => 'ae', 'ß' => 'ss',
        ];
    }

    $texte = mb_strtolower(trim($texte));
    $texte = strtr($texte, $translit);
    $texte = (string) preg_replace('/[^a-z0-9]+/', '-', $texte);
    $texte = trim($texte, '-');
    $texte = mb_substr($texte, 0, $longueurMax);
    $texte = rtrim($texte, '-');

    return $texte !== '' ? $texte : 'produit';
}

/** Slug d'un produit : champ « slug » personnalisé, sinon déduit du nom. */
function slug_produit(array $produit): string
{
    $personnalise = trim((string) ($produit['slug'] ?? ''));
    if ($personnalise !== '') {
        return $personnalise;
    }

    return slugifier((string) ($produit['nom'] ?? ''));
}

/**
 * Retrouve un produit actif à partir d'un segment d'URL : identifiant interne,
 * slug personnalisé ou slug déduit du nom.
 */
function trouver_produit(array $produits, string $segment): ?array
{
    $segment = trim($segment, "/ \t\n\r");
    if ($segment === '') {
        return null;
    }

    foreach ($produits as $produit) {
        if (($produit['id'] ?? '') === $segment) {
            return $produit;
        }
    }

    foreach ($produits as $produit) {
        if (trim((string) ($produit['slug'] ?? '')) !== '' && trim((string) $produit['slug']) === $segment) {
            return $produit;
        }
    }

    foreach ($produits as $produit) {
        if (slugifier((string) ($produit['nom'] ?? '')) === $segment) {
            return $produit;
        }
    }

    return null;
}

/**
 * Nettoie une liste de spécifications [{label, valeur}] venant de l'admin :
 * lignes vides écartées, 30 lignes maximum.
 */
function nettoyer_specifications($brut): array
{
    if (!is_array($brut)) {
        return [];
    }

    $sortie = [];
    foreach ($brut as $ligne) {
        if (!is_array($ligne)) {
            continue;
        }
        $label = nettoyer($ligne['label'] ?? '', 100);
        $valeur = nettoyer($ligne['valeur'] ?? '', 200);
        if ($label === '' && $valeur === '') {
            continue;
        }
        $sortie[] = ['label' => $label, 'valeur' => $valeur];
        if (count($sortie) >= 30) {
            break;
        }
    }

    return $sortie;
}

/** Nettoie une liste d'images (galerie produit) : 12 URL maximum. */
function nettoyer_images($brut): array
{
    if (!is_array($brut)) {
        return [];
    }

    $sortie = [];
    foreach ($brut as $image) {
        $image = nettoyer($image, 500);
        if ($image === '') {
            continue;
        }
        $sortie[] = $image;
        if (count($sortie) >= 12) {
            break;
        }
    }

    return $sortie;
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
