<?php
/**
 * LK-TECH (Linksmartech) — amorçage commun à toutes les pages.
 *
 * @package LK-TECH
 */

declare(strict_types=1);

// Les erreurs ne doivent jamais s'afficher dans la page : elles partent au journal.
ini_set('display_errors', '0');
ini_set('log_errors', '1');
error_reporting(E_ALL);

// Certains hébergements économiques n'activent pas mbstring : on prévoit
// des équivalents, pour que le site fonctionne partout.
if (!function_exists('mb_internal_encoding')) {
    function mb_internal_encoding($encodage = null)
    {
        return true;
    }
}
if (!function_exists('mb_strlen')) {
    function mb_strlen($chaine, $encodage = null)
    {
        return strlen((string) $chaine);
    }
}
if (!function_exists('mb_substr')) {
    function mb_substr($chaine, $debut, $longueur = null, $encodage = null)
    {
        return $longueur === null ? substr((string) $chaine, $debut) : substr((string) $chaine, $debut, $longueur);
    }
}
if (!function_exists('mb_strtolower')) {
    function mb_strtolower($chaine, $encodage = null)
    {
        return strtolower((string) $chaine);
    }
}

mb_internal_encoding('UTF-8');
date_default_timezone_set('Africa/Lubumbashi'); // heure locale de la RDC

require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/Store.php';
require_once __DIR__ . '/Auth.php';
require_once __DIR__ . '/Api.php';

if (!defined('LK_RACINE')) {
    define('LK_RACINE', dirname(__DIR__));
}

/** Instance de stockage partagée par la requête. */
function lk_store(): Store
{
    static $store = null;
    if ($store === null) {
        $store = Store::creer(LK_RACINE);
    }

    return $store;
}

/** Instance d'authentification partagée par la requête. */
function lk_auth(): Auth
{
    static $auth = null;
    if ($auth === null) {
        $auth = new Auth(lk_store());
    }

    return $auth;
}

/** Version de l'application (affichée dans l'administration). */
const LK_VERSION = '1.0.0';
