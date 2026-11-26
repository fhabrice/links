<?php
declare(strict_types=1);
require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/UtilisateurAuth.php';
$ua = new UtilisateurAuth(lk_store());
$user = $ua->utilisateur();
if (!$user) { header('Location: '.base_url().'/connexion.php'); exit; }
$base = base_url();
$mesAnnonces = lk_store()->listerAnnonces(['userId'=>$user['id'],'admin'=>true,'limit'=>100]);
?>
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Mon espace — <?= htmlspecialchars($user['nom'],ENT_QUOTES,'UTF-8') ?></title>
<link rel="stylesheet" href="<?= $base ?>/assets/css/styles.css">
<link rel="stylesheet" href="<?= $base ?>/assets/css/refonte.css">
<style>
.annonce-carte{border:1px solid #e2e8f0;border-radius:12px;padding:1rem;background:#fff}
.badge-projet{background:#dbeafe;color:#1e40af}.badge-emploi{background:#dcfce7;color:#166534}.badge-service{background:#fef3c7;color:#92400e}
.badge{font-size:.7rem;padding:.2rem .5rem;border-radius:999px;font-weight:800;text-transform:uppercase}
</style>
</head>
<body>
<header style="background:#16233F;color:#fff;padding:1rem">
<div style="max-width:1000px;margin:0 auto;display:flex;justify-content:space-between;align-items:center">
<span>👤 <?= htmlspecialchars($user['nom']) ?> — <?= htmlspecialchars($user['email']) ?></span>
<div><a href="<?= $base ?>/" style="color:#fff;margin-right:1rem">Accueil</a><a href="<?= $base ?>/opportunites.php" style="color:#fff;margin-right:1rem">Voir vitrine</a><button onclick="fetch('<?= $base ?>/api/index.php?chemin=/api/deconnexion',{method:'POST'}).then(()=>location.href='<?= $base ?>/')" style="background:#fff;color:#16233F;border:0;padding:.4rem .8rem;border-radius:8px;cursor:pointer">Déconnexion</button></div>
</div>
</header>
<div style="max-width:1000px;margin:1.5rem auto;padding:0 1rem">
<h1 style="font-size:1.5rem;font-weight:800">Mon espace</h1>
<p style="color:#64748b">Postez un projet, une offre d'emploi ou un service.</p>

<div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:1.5rem;margin:1.5rem 0">
<h3>Publier une annonce</h3>
<div id="msg2" style="display:none;padding:.6rem 1rem;border-radius:8px;margin-bottom:1rem;font-size:.9rem"></div>
<form id="form-annonce">
<div style="display:flex;gap:1rem;margin-bottom:1rem">
<select name="type" style="padding:.6rem;border:1px solid #e2e8f0;border-radius:8px"><option value="projet">Projet</option><option value="emploi">Offre d'emploi</option><option value="service">Offre de service</option></select>
<input name="localisation" placeholder="Localisation (ex: Goma)" style="flex:1;padding:.6rem;border:1px solid #e2e8f0;border-radius:8px">
</div>
<input name="titre" placeholder="Titre (ex: Recherche maçon pour chantier 2 pièces)" required style="width:100%;padding:.7rem;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:1rem">
<textarea name="description" placeholder="Description détaillée (20+ caractères)" required style="width:100%;padding:.7rem;border:1px solid #e2e8f0;border-radius:8px;min-height:100px;margin-bottom:1rem"></textarea>
<div style="display:flex;gap:1rem;margin-bottom:1rem">
<input name="budget" placeholder="Budget / Rémunération (ex: 500 USD)" style="flex:1;padding:.6rem;border:1px solid #e2e8f0;border-radius:8px">
<input name="contactTel" placeholder="Téléphone de contact" style="flex:1;padding:.6rem;border:1px solid #e2e8f0;border-radius:8px">
</div>
<input name="contactEmail" placeholder="Email de contact (optionnel)" style="width:100%;padding:.6rem;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:1rem">
<button type="submit" style="width:100%;background:#2e9e5b;color:#fff;padding:.8rem;border:0;border-radius:10px;font-weight:700;cursor:pointer">Publier</button>
</form>
</div>

<h2 style="margin:1.5rem 0 1rem">Mes annonces (<?= count($mesAnnonces) ?>)</h2>
<?php if(!$mesAnnonces): ?><p style="color:#94a3b8">Aucune annonce pour l'instant.</p><?php endif; ?>
<div style="display:grid;gap:1rem">
<?php foreach($mesAnnonces as $a): ?>
<div class="annonce-carte">
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.5rem">
<span class="badge badge-<?= htmlspecialchars($a['type']) ?>"><?= htmlspecialchars($a['type']) ?></span>
<span style="font-size:.8rem;color:#94a3b8"><?= htmlspecialchars($a['creeLe']) ?> — <?= htmlspecialchars($a['statut']) ?></span>
</div>
<h4 style="margin:.3rem 0"><?= htmlspecialchars($a['titre']) ?></h4>
<p style="color:#475569;font-size:.9rem"><?= nl2br(htmlspecialchars(mb_substr($a['description'],0,200))) ?>...</p>
<?php if(!empty($a['budget'])): ?><p style="font-size:.85rem"><b>Budget:</b> <?= htmlspecialchars($a['budget']) ?></p><?php endif; ?>
<button onclick="supprimerAnnonce('<?= htmlspecialchars($a['id']) ?>')" style="margin-top:.5rem;background:#fee2e2;color:#991b1b;border:0;padding:.4rem .7rem;border-radius:8px;cursor:pointer">Supprimer</button>
</div>
<?php endforeach; ?>
</div>
</div>
<script>
document.getElementById('form-annonce').addEventListener('submit', async e=>{
 e.preventDefault();
 const d=Object.fromEntries(new FormData(e.target).entries());
 const msg=document.getElementById('msg2');
 const r=await fetch('<?= $base ?>/api/index.php?chemin=/api/annonces',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)});
 const j=await r.json();
 if(!r.ok){ msg.style.display='block'; msg.style.background='#fee2e2'; msg.style.color='#991b1b'; msg.textContent=j.erreur; return; }
 msg.style.display='block'; msg.style.background='#ecfdf5'; msg.style.color='#065f46'; msg.textContent='Annonce publiée !'; setTimeout(()=>location.reload(),800);
});
async function supprimerAnnonce(id){
 if(!confirm('Supprimer cette annonce ?')) return;
 await fetch('<?= $base ?>/api/index.php?chemin=/api/annonces/'+id,{method:'DELETE'});
 location.reload();
}
</script>
</body></html>
