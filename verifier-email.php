<?php
declare(strict_types=1);
require_once __DIR__ . '/app/bootstrap.php';
$token = $_GET['token'] ?? '';
$ok = $token ? lk_store()->verifierEmail($token) : false;
$base = base_url();
?>
<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Vérification</title>
<link rel="stylesheet" href="<?= $base ?>/assets/css/styles.css"><link rel="stylesheet" href="<?= $base ?>/assets/css/refonte.css?v=20261126-footer-fix"><link rel="stylesheet" href="<?= $base ?>/assets/css/responsive.css?v=20261126-1">
</head><body>
<div style="min-height:100vh;display:grid;place-items:center;padding:clamp(1rem,4vw,2rem);background:#f1f5f9">
<div style="background:#fff;padding:clamp(1rem,4vw,2rem);border-radius:16px;width:min(420px,100%);text-align:center;box-shadow:0 8px 30px rgba(0,0,0,.08)">
<?php if($ok): ?>
<h1 style="color:#065f46">✅ Email vérifié !</h1><p>Votre compte est activé.</p><a href="<?= $base ?>/connexion.php" style="display:inline-block;margin-top:1rem;background:#16233F;color:#fff;padding:.7rem 1.2rem;border-radius:10px;text-decoration:none">Se connecter</a>
<?php else: ?>
<h1 style="color:#991b1b">❌ Lien invalide ou expiré</h1><p>Demandez un nouvel envoi ou réinscrivez-vous.</p><a href="<?= $base ?>/inscription.php" style="display:inline-block;margin-top:1rem;background:#16233F;color:#fff;padding:.7rem 1.2rem;border-radius:10px;text-decoration:none">S'inscrire</a>
<?php endif; ?>
</div></div><?php require __DIR__ . '/app/partials/footer.php'; ?>
</body></html>
