<?php
declare(strict_types=1);
require_once __DIR__ . '/app/bootstrap.php';
$base = base_url();
$annonces = lk_store()->listerAnnonces(['limit'=>100]);
$filtre = $_GET['type'] ?? '';
if ($filtre) $annonces = array_filter($annonces, fn($a)=>($a['type']??'')===$filtre);
?>
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Opportunités — LK-TECH</title>
<link rel="stylesheet" href="<?= $base ?>/assets/css/styles.css?v=20261126">
<link rel="stylesheet" href="<?= $base ?>/assets/css/refonte.css?v=20261126">
<style>.badge{font-size:.7rem;padding:.25rem .6rem;border-radius:999px;font-weight:800;text-transform:uppercase}.badge-projet{background:#dbeafe;color:#1e40af}.badge-emploi{background:#dcfce7;color:#166534}.badge-service{background:#fef3c7;color:#92400e}</style>
</head>
<body>
<header style="background:#fff;border-bottom:1px solid #e2e8f0;padding:1rem">
<div style="max-width:1100px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.75rem">
<a href="<?= $base ?>/" style="font-weight:800;color:#16233F;text-decoration:none">← LK-TECH</a>
<div style="display:flex;align-items:center;flex-wrap:wrap;gap:.75rem">
<a href="<?= $base ?>/opportunites.php">Tout</a>
<a href="?type=projet">Projets</a>
<a href="?type=emploi">Emplois</a>
<a href="?type=service">Services</a>
<a href="<?= $base ?>/travailler-avec-nous.php" style="color:#2e9e5b;font-weight:700">Travailler avec nous</a>
<a href="<?= $base ?>/inscription.php" style="background:#16233F;color:#fff;padding:.5rem 1rem;border-radius:8px;text-decoration:none">Publier</a>
</div>
</div>
</header>
<div style="max-width:1100px;margin:2rem auto;padding:0 1rem">
<h1 style="font-size:1.7rem;font-weight:800">Opportunités de la communauté</h1>
<p style="color:#64748b">Projets, offres d'emploi et services postés par les membres.</p>
<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:1.2rem;margin-top:1.5rem">
<?php foreach($annonces as $a): ?>
<div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:1.2rem">
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.6rem">
<span class="badge badge-<?= htmlspecialchars($a['type']) ?>"><?= htmlspecialchars($a['type']) ?></span>
<span style="font-size:.8rem;color:#94a3b8"><?= htmlspecialchars($a['localisation']??'') ?></span>
</div>
<h3 style="font-size:1rem;margin:.4rem 0"><?= htmlspecialchars($a['titre']) ?></h3>
<p style="color:#475569;font-size:.9rem;line-height:1.5"><?= nl2br(htmlspecialchars(mb_substr($a['description'],0,180))) ?>...</p>
<?php if(!empty($a['budget'])): ?><p style="font-size:.85rem;margin-top:.5rem"><b><?= $a['type']==='emploi'?'Salaire':'Budget' ?>:</b> <?= htmlspecialchars($a['budget']) ?></p><?php endif; ?>
<p style="font-size:.8rem;color:#94a3b8;margin-top:.5rem">Par <?= htmlspecialchars($a['auteurNom']??'Membre') ?> · <?= htmlspecialchars($a['creeLe']) ?></p>
<button onclick="signaler('<?= htmlspecialchars($a['id']) ?>')" style="margin-top:.7rem;background:#f1f5f9;border:1px solid #e2e8f0;padding:.3rem .6rem;border-radius:8px;font-size:.8rem;cursor:pointer">🚩 Signaler</button>
</div>
<?php endforeach; ?>
<?php if(empty($annonces)): ?><p style="color:#94a3b8">Aucune annonce pour l'instant. <a href="<?= $base ?>/inscription.php">Soyez le premier à poster !</a></p><?php endif; ?>
</div>
</div>
<script>
async function signaler(id){
 if(!confirm('Signaler cette annonce ?')) return;
 await fetch('<?= $base ?>/api/index.php?chemin=/api/annonces/'+id+'/signaler',{method:'POST'});
 alert('Signalée. Merci pour votre vigilance.');
}
</script>
</body></html>
