<?php
// Outil de maintenance local uniquement (CLI), désactivé par HTTP.
declare(strict_types=1);
// Cet outil de maintenance ne doit jamais être accessible depuis un navigateur.
if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

$nouveau = getenv('ADMIN_PASSWORD') ?: '';
if (strlen($nouveau) < 12) {
    fwrite(STDERR, "Définissez ADMIN_PASSWORD avec au moins 12 caractères pour cette opération locale.\n");
    exit(1);
}
require __DIR__ . '/app/bootstrap.php';
$store = lk_store();
$securite = $store->securite();
$hash = password_hash($nouveau, PASSWORD_DEFAULT);
if (empty($securite['utilisateurs'])) {
    $securite['utilisateurs'] = [[
        'id' => 'usr-' . bin2hex(random_bytes(6)),
        'identifiant' => 'admin',
        'motDePasse' => $hash,
        'role' => 'proprietaire',
        'creeLe' => date('c'),
    ]];
} else {
    foreach ($securite['utilisateurs'] as &$u) {
        $u['motDePasse'] = $hash;
    }
    unset($u);
}
$store->ecrireSecurite($securite);
@unlink($store->dossierData() . '/tentatives.json');
fwrite(STDOUT, "Accès administrateur réinitialisé. Aucun mot de passe n’est affiché.\n");
