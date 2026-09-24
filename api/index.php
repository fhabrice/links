<?php
/**
 * LK-TECH — point d'entrée de l'API JSON.
 *
 * Toutes les requêtes /api/... arrivent ici (voir .htaccess à la racine).
 *
 * @package LK-TECH
 */

declare(strict_types=1);

require_once __DIR__ . '/../app/bootstrap.php';

$methode = strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET'));

// Reconstitution du chemin demandé, en tenant compte d'une installation
// éventuelle dans un sous-dossier (ex. /linksmartec/api/site).
$uri = (string) parse_url((string) ($_SERVER['REQUEST_URI'] ?? '/'), PHP_URL_PATH);
$dossierApi = rtrim(str_replace('\\', '/', dirname((string) ($_SERVER['SCRIPT_NAME'] ?? '/api/index.php'))), '/');
$suffixe = $dossierApi !== '' && str_starts_with($uri, $dossierApi) ? substr($uri, strlen($dossierApi)) : $uri;
$chemin = '/api' . $suffixe;

try {
    $api = new Api(lk_store(), lk_auth(), LK_RACINE);
    $reponse = $api->traiter($methode, $chemin, lire_corps());

    repondre_json($reponse['corps'], $reponse['code'], $reponse['entetes']);
} catch (Throwable $erreur) {
    error_log('[LK-TECH] ' . $erreur->getMessage() . ' @ ' . $erreur->getFile() . ':' . $erreur->getLine());
    repondre_json(['erreur' => 'Erreur interne du serveur.'], 500);
}
