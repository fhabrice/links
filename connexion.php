<?php
declare(strict_types=1);
require_once __DIR__ . '/app/bootstrap.php';
$base = base_url();
$identite = lk_store()->contenu()['identite'] ?? [];
?>
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Connexion — <?= htmlspecialchars($identite['nom']??'LK-TECH',ENT_QUOTES,'UTF-8') ?></title>
<link rel="stylesheet" href="<?= $base ?>/assets/css/styles.css">
<link rel="stylesheet" href="<?= $base ?>/assets/css/refonte.css">
</head>
<body>
<div style="min-height:100vh;display:grid;place-items:center;padding:2rem;background:#f1f5f9">
<form id="form-log" style="background:#fff;padding:2rem;border-radius:16px;width:min(420px,100%);box-shadow:0 8px 30px rgba(0,0,0,.08)">
<h1 style="font-size:1.4rem;font-weight:800;margin-bottom:.3rem">Se connecter</h1>
<p style="color:#64748b;font-size:.9rem;margin-bottom:1.5rem">Accédez à votre espace.</p>
<div id="msg" style="display:none;padding:.7rem 1rem;border-radius:8px;margin-bottom:1rem;font-size:.9rem"></div>
<div class="champ" style="margin-bottom:1rem"><label>Email</label><input name="email" type="email" required style="width:100%;padding:.7rem;border:1px solid #e2e8f0;border-radius:8px"></div>
<div class="champ" style="margin-bottom:1.5rem"><label>Mot de passe</label><input name="motDePasse" type="password" required style="width:100%;padding:.7rem;border:1px solid #e2e8f0;border-radius:8px"></div>
<button type="submit" id="btn" style="width:100%;background:#16233F;color:#fff;padding:.8rem;border:0;border-radius:10px;font-weight:700;cursor:pointer">Se connecter</button>
<p style="text-align:center;margin-top:1rem;font-size:.85rem">Pas de compte ? <a href="<?= $base ?>/inscription.php">S'inscrire</a> · <a href="<?= $base ?>/">Accueil</a></p>
</form>
</div>
<script>
document.getElementById('form-log').addEventListener('submit', async e=>{
 e.preventDefault();
 const fd=new FormData(e.target); const data=Object.fromEntries(fd.entries());
 const btn=document.getElementById('btn'); const msg=document.getElementById('msg');
 btn.disabled=true; btn.textContent='Connexion...';
 try{
  const r=await fetch('<?= $base ?>/api/index.php?chemin=/api/connexion',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
  const j=await r.json();
  if(!r.ok) throw new Error(j.erreur||'Erreur');
  location.href='<?= $base ?>/mon-espace.php';
 }catch(err){ msg.style.display='block'; msg.style.background='#fee2e2'; msg.style.color='#991b1b'; msg.textContent=err.message; btn.disabled=false; btn.textContent='Se connecter'; }
});
</script>
</body></html>
