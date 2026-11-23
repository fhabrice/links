<?php
/**
 * LK-TECH — configuration MySQL FACULTATIVE.
 *
 * ⚠️  Ce fichier n'est PAS nécessaire : sans lui, le site enregistre son
 *     contenu dans le dossier data/ et tout fonctionne normalement.
 *
 * À utiliser UNIQUEMENT si votre hébergeur vous a déjà attribué une base
 * MySQL. Dans ce cas :
 *   1. renommez ce fichier en « database.php » ;
 *   2. renseignez les accès ci-dessous ;
 *   3. rechargez le site : les tables sont créées automatiquement.
 *
 * L'administrateur du site ne demande JAMAIS ces informations.
 *
 * @package LK-TECH
 */

return [
    'enabled' => true,
    'host' => 'localhost',
    'port' => 3306,
    'user' => 'utilisateur_mysql',
    'password' => 'mot_de_passe_mysql',
    'database' => 'linksmartec',
];
