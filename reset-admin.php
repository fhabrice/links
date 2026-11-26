<?php
// reset-admin.php — à mettre dans public_html/linksmartec.com/ puis ouvrir https://linksmartec.com/reset-admin.php
// Supprime ce fichier juste après usage !
declare(strict_types=1);
require __DIR__ . '/app/bootstrap.php';

$store = lk_store();
$nouveau = '1989'; // ton nouveau code

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
        $u['identifiant'] = 'admin';
    }
    unset($u);
}
$store->ecrireSecurite($securite);

// Nettoie le bloqueur de tentatives
@unlink($store->dossierData() . '/tentatives.json');
@unlink($store->dossierData() . '/security.json');

echo "OK — mot de passe admin changé à : <b>1989</b><br>Identifiant : <b>admin</b><br><br>";
echo "⚠️ Supprime ce fichier reset-admin.php tout de suite !<br>";
echo "<a href='admin/'>Aller à l'admin</a>";
