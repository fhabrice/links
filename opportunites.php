<?php
require_once __DIR__ . '/app/bootstrap.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$base = base_url();
$dataDir = __DIR__ . '/data';
if (!is_dir($dataDir)) {
    @mkdir($dataDir, 0755, true);
}

$fichierMembres = $dataDir . '/membres.json';
$fichierOpp = $dataDir . '/opportunites.json';
$fichierCand = $dataDir . '/candidatures.json';

function lire_json_local(string $fichier, array $defaut = []): array {
    if (!is_file($fichier)) return $defaut;
    $contenu = @file_get_contents($fichier);
    $data = $contenu ? json_decode($contenu, true) : null;
    return is_array($data) ? $data : $defaut;
}

function ecrire_json_local(string $fichier, array $data): void {
    @file_put_contents($fichier, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
}

$defautOpportunites = [
    [
        'id' => 'opp-1',
        'type' => 'Appel à projets',
        'titre' => 'Digitalisation des PME & commerces à Goma',
        'categorie' => 'Informatique',
        'lieu' => 'Goma, Nord-Kivu',
        'budget' => '1 500 – 5 000 $US',
        'dateLimite' => '2026-12-30',
        'description' => 'Nous recherchons des partenaires, développeurs ou porteurs de projets pour déployer des outils de gestion (caisse, stock, facturation) auprès des PME locales.',
        'auteur' => 'LK-TECH',
        'creeLe' => '2026-11-20',
    ],
    [
        'id' => 'opp-2',
        'type' => 'Offre d\'emploi',
        'titre' => 'Développeur Web Full-Stack (PHP / JavaScript)',
        'categorie' => 'Informatique',
        'lieu' => 'Goma / Hybride',
        'budget' => 'Selon profil',
        'dateLimite' => '2026-12-15',
        'description' => 'Rejoignez l\'équipe LK-TECH pour concevoir des sites web, applications métiers et plateformes sur mesure pour nos clients.',
        'auteur' => 'LK-TECH',
        'creeLe' => '2026-11-20',
    ],
    [
        'id' => 'opp-3',
        'type' => 'Offre d\'emploi',
        'titre' => 'Technicien(ne) Énergie Solaire & Installations',
        'categorie' => 'Énergie renouvelable',
        'lieu' => 'Goma & environs',
        'budget' => 'Selon expérience',
        'dateLimite' => '2026-12-20',
        'description' => 'Dimensionnement, installation et maintenance de kits solaires résidentiels et professionnels.',
        'auteur' => 'LK-TECH',
        'creeLe' => '2026-11-20',
    ],
];

if (!is_file($fichierOpp)) {
    ecrire_json_local($fichierOpp, $defautOpportunites);
}

$membres = lire_json_local($fichierMembres, []);
$opportunites = lire_json_local($fichierOpp, $defautOpportunites);
$candidatures = lire_json_local($fichierCand, []);

$messageSucces = '';
$messageErreur = '';

$membreConnecte = $_SESSION['membre_lk'] ?? null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    if ($action === 'inscription') {
        $nom = trim((string)($_POST['nom'] ?? ''));
        $email = strtolower(trim((string)($_POST['email'] ?? '')));
        $tel = trim((string)($_POST['telephone'] ?? ''));
        $mdp = (string)($_POST['mot_de_passe'] ?? '');
        $profil = trim((string)($_POST['profil'] ?? 'Candidat / Porteur de projet'));

        if ($nom === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($mdp) < 4) {
            $messageErreur = 'Veuillez renseigner un nom, un e-mail valide et un mot de passe (4 caractères minimum).';
        } else {
            $existe = false;
            foreach ($membres as $m) {
                if (($m['email'] ?? '') === $email) { $existe = true; break; }
            }
            if ($existe) {
                $messageErreur = 'Un compte existe déjà avec cet e-mail. Connectez-vous.';
            } else {
                $nouveau = [
                    'id' => 'mbr-' . bin2hex(random_bytes(4)),
                    'nom' => $nom,
                    'email' => $email,
                    'telephone' => $tel,
                    'profil' => $profil,
                    'hash' => password_hash($mdp, PASSWORD_DEFAULT),
                    'creeLe' => date('c'),
                ];
                $membres[] = $nouveau;
                ecrire_json_local($fichierMembres, $membres);
                $_SESSION['membre_lk'] = [
                    'id' => $nouveau['id'],
                    'nom' => $nouveau['nom'],
                    'email' => $nouveau['email'],
                    'telephone' => $nouveau['telephone'],
                    'profil' => $nouveau['profil'],
                ];
                $membreConnecte = $_SESSION['membre_lk'];
                $messageSucces = 'Compte créé avec succès ! Vous pouvez maintenant postuler et publier des appels à projets.';
            }
        }
    } elseif ($action === 'connexion') {
        $email = strtolower(trim((string)($_POST['email'] ?? '')));
        $mdp = (string)($_POST['mot_de_passe'] ?? '');
        $trouve = null;
        foreach ($membres as $m) {
            if (($m['email'] ?? '') === $email && password_verify($mdp, $m['hash'] ?? '')) {
                $trouve = $m;
                break;
            }
        }
        if ($trouve) {
            $_SESSION['membre_lk'] = [
                'id' => $trouve['id'],
                'nom' => $trouve['nom'],
                'email' => $trouve['email'],
                'telephone' => $trouve['telephone'] ?? '',
                'profil' => $trouve['profil'] ?? '',
            ];
            $membreConnecte = $_SESSION['membre_lk'];
            $messageSucces = 'Connexion réussie. Bienvenue ' . e($membreConnecte['nom']) . ' !';
        } else {
            $messageErreur = 'E-mail ou mot de passe incorrect.';
        }
    } elseif ($action === 'deconnexion') {
        unset($_SESSION['membre_lk']);
        $membreConnecte = null;
        $messageSucces = 'Vous êtes déconnecté.';
    } elseif ($action === 'postuler') {
        $oppId = trim((string)($_POST['opp_id'] ?? ''));
        $nom = trim((string)($_POST['nom'] ?? ($membreConnecte['nom'] ?? '')));
        $email = strtolower(trim((string)($_POST['email'] ?? ($membreConnecte['email'] ?? ''))));
        $tel = trim((string)($_POST['telephone'] ?? ($membreConnecte['telephone'] ?? '')));
        $lienCv = trim((string)($_POST['lien_cv'] ?? ''));
        $motivation = trim((string)($_POST['motivation'] ?? ''));

        if ($oppId === '' || $nom === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || $motivation === '') {
            $messageErreur = 'Veuillez remplir tous les champs obligatoires pour postuler.';
        } else {
            $oppTitre = $oppId;
            foreach ($opportunites as $o) {
                if (($o['id'] ?? '') === $oppId) { $oppTitre = $o['titre']; break; }
            }
            $candidatures[] = [
                'id' => 'cand-' . bin2hex(random_bytes(4)),
                'oppId' => $oppId,
                'oppTitre' => $oppTitre,
                'membreId' => $membreConnecte['id'] ?? null,
                'nom' => $nom,
                'email' => $email,
                'telephone' => $tel,
                'lienCv' => $lienCv,
                'motivation' => $motivation,
                'statut' => 'En attente',
                'creeLe' => date('Y-m-d H:i'),
            ];
            ecrire_json_local($fichierCand, $candidatures);
            $messageSucces = 'Votre candidature pour « ' . e($oppTitre) . ' » a bien été envoyée !';
        }
    } elseif ($action === 'publier') {
        if (!$membreConnecte) {
            $messageErreur = 'Connectez-vous ou inscrivez-vous pour publier un appel à projet ou une offre.';
        } else {
            $type = trim((string)($_POST['type'] ?? 'Appel à projets'));
            $titre = trim((string)($_POST['titre'] ?? ''));
            $categorie = trim((string)($_POST['categorie'] ?? 'Informatique'));
            $lieu = trim((string)($_POST['lieu'] ?? 'Goma, Nord-Kivu'));
            $budget = trim((string)($_POST['budget'] ?? 'À discuter'));
            $dateLimite = trim((string)($_POST['date_limite'] ?? date('Y-m-d', strtotime('+30 days'))));
            $description = trim((string)($_POST['description'] ?? ''));

            if ($titre === '' || $description === '') {
                $messageErreur = 'Veuillez indiquer un titre et une description.';
            } else {
                array_unshift($opportunites, [
                    'id' => 'opp-' . bin2hex(random_bytes(4)),
                    'type' => $type,
                    'titre' => $titre,
                    'categorie' => $categorie,
                    'lieu' => $lieu,
                    'budget' => $budget,
                    'dateLimite' => $dateLimite,
                    'description' => $description,
                    'auteur' => $membreConnecte['nom'],
                    'creeLe' => date('Y-m-d'),
                ]);
                ecrire_json_local($fichierOpp, $opportunites);
                $messageSucces = 'Votre publication « ' . e($titre) . ' » est maintenant en ligne !';
            }
        }
    }
}

$filtreType = $_GET['type'] ?? 'tout';
$opportunitesFiltrees = array_values(array_filter($opportunites, function ($o) use ($filtreType) {
    if ($filtreType === 'tout') return true;
    return ($o['type'] ?? '') === $filtreType;
}));

$mesCandidatures = [];
if ($membreConnecte) {
    $mesCandidatures = array_values(array_filter($candidatures, function ($c) use ($membreConnecte) {
        return ($c['email'] ?? '') === ($membreConnecte['email'] ?? '');
    }));
}
?>
<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Appels à projets &amp; Offres d'emploi — LK-TECH</title>
  <link rel="icon" type="image/svg+xml" href="<?= $base ?>/assets/img/favicon.svg">
  <link rel="stylesheet" href="<?= $base ?>/assets/css/styles.css">
  <link rel="stylesheet" href="<?= $base ?>/assets/css/refonte.css">
  <style>
    .opp-grille { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-top: 24px; }
    .opp-carte { background: #fff; border: 1px solid rgba(15,23,42,.1); border-radius: 14px; padding: 22px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 6px 20px rgba(15,23,42,.04); }
    .opp-badge { display: inline-block; font-size: .75rem; font-weight: 700; padding: 4px 10px; border-radius: 999px; background: #e0f2fe; color: #0369a1; }
    .opp-badge--emploi { background: #dcfce7; color: #15803d; }
    .opp-panel { background: #fff; border: 1px solid rgba(15,23,42,.1); border-radius: 14px; padding: 24px; margin-top: 24px; }
    .opp-form-grille { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; }
    .opp-champ { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
    .opp-champ input, .opp-champ select, .opp-champ textarea { padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font: inherit; }
    .alerte-ok { background: #dcfce7; color: #166534; padding: 12px 16px; border-radius: 10px; margin-bottom: 16px; font-weight: 600; }
    .alerte-err { background: #fee2e2; color: #991b1b; padding: 12px 16px; border-radius: 10px; margin-bottom: 16px; font-weight: 600; }
  </style>
</head>
<body>
  <header class="entete">
    <div class="conteneur entete__inner">
      <a class="marque" href="<?= $base ?>/" aria-label="Accueil LK-TECH">
        <img class="marque__logo" src="<?= $base ?>/assets/img/logo.svg" alt="Logo LK-TECH">
        <span class="marque__texte">
          <span class="marque__nom">LK<i class="tiret">-</i>TECH</span>
          <span class="marque__slogan">LINKS MARTECH</span>
        </span>
      </a>
      <nav class="nav" id="nav">
        <a class="nav__lien" href="<?= $base ?>/">Accueil</a>
        <a class="nav__lien" href="<?= $base ?>/#logiciels">Logiciels</a>
        <a class="nav__lien" href="<?= $base ?>/opportunites.php">Appels à projets</a>
        <a class="nav__lien" href="<?= $base ?>/a-propos">À propos</a>
        <a class="nav__lien" href="<?= $base ?>/#contact">Contact</a>
        <a class="nav__lien" href="<?= $base ?>/admin/">🔒 Admin</a>
      </nav>
      <div class="entete__actions">
        <button class="burger" id="burger" aria-label="Ouvrir le menu" aria-controls="nav" aria-expanded="false">☰</button>
      </div>
    </div>
  </header>

  <main class="section">
    <div class="conteneur">
      <div class="section__entete">
        <p class="section__sur">OPPORTUNITÉS &amp; COLLABORATIONS</p>
        <h1 class="section__titre">Appels à projets &amp; Offres d'emploi</h1>
        <p class="section__texte">Postulez aux offres en cours ou créez votre compte pour soumettre un appel à projet et suivre vos candidatures.</p>
      </div>

      <?php if ($messageSucces): ?><div class="alerte-ok"><?= $messageSucces ?></div><?php endif; ?>
      <?php if ($messageErreur): ?><div class="alerte-err"><?= e($messageErreur) ?></div><?php endif; ?>

      <!-- Espace membre -->
      <section class="opp-panel">
        <?php if ($membreConnecte): ?>
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
            <div>
              <strong>Connecté : <?= e($membreConnecte['nom']) ?></strong> (<?= e($membreConnecte['email']) ?>)
              <span style="color:#64748b;font-size:.9rem;">— <?= count($mesCandidatures) ?> candidature(s) envoyée(s)</span>
            </div>
            <form method="post" style="margin:0;">
              <input type="hidden" name="action" value="deconnexion">
              <button type="submit" class="btn btn--fantome btn--petit">Se déconnecter</button>
            </form>
          </div>
        <?php else: ?>
          <div class="opp-form-grille">
            <form method="post">
              <h3 style="margin-top:0;">Créer un compte (Inscription)</h3>
              <input type="hidden" name="action" value="inscription">
              <div class="opp-champ"><label>Nom complet *</label><input type="text" name="nom" required></div>
              <div class="opp-champ"><label>E-mail *</label><input type="email" name="email" required></div>
              <div class="opp-champ"><label>Téléphone</label><input type="text" name="telephone" placeholder="+243..."></div>
              <div class="opp-champ"><label>Mot de passe * (min. 4 car.)</label><input type="password" name="mot_de_passe" required></div>
              <button type="submit" class="btn btn--petit">S'inscrire et participer</button>
            </form>
            <form method="post">
              <h3 style="margin-top:0;">Déjà inscrit ? Connexion</h3>
              <input type="hidden" name="action" value="connexion">
              <div class="opp-champ"><label>E-mail *</label><input type="email" name="email" required></div>
              <div class="opp-champ"><label>Mot de passe *</label><input type="password" name="mot_de_passe" required></div>
              <button type="submit" class="btn btn--fantome btn--petit">Se connecter</button>
            </form>
          </div>
        <?php endif; ?>
      </section>

      <!-- Filtres -->
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:24px;">
        <a href="?type=tout" class="btn btn--petit <?= $filtreType === 'tout' ? '' : 'btn--fantome' ?>">Tout (<?= count($opportunites) ?>)</a>
        <a href="?type=Appel+%C3%A0+projets" class="btn btn--petit <?= $filtreType === 'Appel à projets' ? '' : 'btn--fantome' ?>">Appels à projets</a>
        <a href="?type=Offre+d%27emploi" class="btn btn--petit <?= $filtreType === "Offre d'emploi" ? '' : 'btn--fantome' ?>">Offres d'emploi</a>
      </div>

      <!-- Liste des opportunités -->
      <div class="opp-grille">
        <?php foreach ($opportunitesFiltrees as $opp): ?>
          <?php $estEmploi = ($opp['type'] ?? '') === "Offre d'emploi"; ?>
          <article class="opp-carte">
            <div>
              <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:10px;">
                <span class="opp-badge <?= $estEmploi ? 'opp-badge--emploi' : '' ?>"><?= e($opp['type'] ?? '') ?></span>
                <span style="font-size:.8rem;color:#64748b;"><?= e($opp['categorie'] ?? '') ?></span>
              </div>
              <h3 style="margin:0 0 8px;"><?= e($opp['titre'] ?? '') ?></h3>
              <p style="font-size:.9rem;color:#475569;line-height:1.55;"><?= e($opp['description'] ?? '') ?></p>
              <p style="font-size:.82rem;color:#64748b;margin:10px 0 0;">
                📍 <?= e($opp['lieu'] ?? '') ?> · 💰 <?= e($opp['budget'] ?? '') ?> · ⏳ Limite : <?= e($opp['dateLimite'] ?? '') ?>
              </p>
            </div>
            <details style="margin-top:16px;border-top:1px solid #e2e8f0;padding-top:12px;">
              <summary class="btn btn--petit" style="cursor:pointer;list-style:none;display:inline-block;">Postuler à cette offre</summary>
              <form method="post" style="margin-top:12px;">
                <input type="hidden" name="action" value="postuler">
                <input type="hidden" name="opp_id" value="<?= e($opp['id']) ?>">
                <div class="opp-champ"><label>Nom complet *</label><input type="text" name="nom" value="<?= e($membreConnecte['nom'] ?? '') ?>" required></div>
                <div class="opp-champ"><label>E-mail *</label><input type="email" name="email" value="<?= e($membreConnecte['email'] ?? '') ?>" required></div>
                <div class="opp-champ"><label>Téléphone</label><input type="text" name="telephone" value="<?= e($membreConnecte['telephone'] ?? '') ?>"></div>
                <div class="opp-champ"><label>Lien CV / Portfolio (optionnel)</label><input type="url" name="lien_cv" placeholder="https://..."></div>
                <div class="opp-champ"><label>Motivation / Proposition *</label><textarea name="motivation" rows="3" required></textarea></div>
                <button type="submit" class="btn btn--petit">Envoyer ma candidature</button>
              </form>
            </details>
          </article>
        <?php endforeach; ?>
      </div>

      <!-- Publier un appel à projet / offre (membres connectés) -->
      <section class="opp-panel" id="publier">
        <h2 style="margin-top:0;">Publier un appel à projet ou une offre d'emploi</h2>
        <?php if ($membreConnecte): ?>
          <form method="post">
            <input type="hidden" name="action" value="publier">
            <div class="opp-form-grille">
              <div class="opp-champ">
                <label>Type *</label>
                <select name="type">
                  <option value="Appel à projets">Appel à projets</option>
                  <option value="Offre d'emploi">Offre d'emploi</option>
                </select>
              </div>
              <div class="opp-champ"><label>Titre *</label><input type="text" name="titre" required></div>
              <div class="opp-champ"><label>Catégorie</label><input type="text" name="categorie" value="Informatique"></div>
              <div class="opp-champ"><label>Lieu</label><input type="text" name="lieu" value="Goma, Nord-Kivu"></div>
              <div class="opp-champ"><label>Budget / Rémunération</label><input type="text" name="budget" placeholder="Ex: 2 000 $US"></div>
              <div class="opp-champ"><label>Date limite</label><input type="date" name="date_limite" value="<?= date('Y-m-d', strtotime('+30 days')) ?>"></div>
            </div>
            <div class="opp-champ"><label>Description détaillée *</label><textarea name="description" rows="4" required></textarea></div>
            <button type="submit" class="btn btn--petit">Publier maintenant</button>
          </form>
        <?php else: ?>
          <p style="color:#475569;">Inscrivez-vous ou connectez-vous ci-dessus pour publier votre propre appel à projet ou offre d'emploi.</p>
        <?php endif; ?>
      </section>
    </div>
  </main>

  <footer class="pied">
    <div class="conteneur">
      <div class="pied__grille">
        <div>
          <img class="pied__logo" src="<?= $base ?>/assets/img/logo-clair.svg" alt="Logo LK-TECH">
          <div class="pied__nom">LK<i class="tiret">-</i>TECH</div>
          <p class="pied__texte">LK-TECH réunit construction, technologie et énergie pour transformer vos idées en solutions concrètes. Basés à Goma, nous avançons avec vous, de la conception à la réalisation.</p>
        </div>
        <div>
          <h4 class="pied__titre">Navigation</h4>
          <div class="pied__liens">
            <a href="<?= $base ?>/">Accueil</a>
            <a href="<?= $base ?>/#specialites">Spécialités</a>
            <a href="<?= $base ?>/#logiciels">Logiciels</a>
            <a href="<?= $base ?>/opportunites.php">Appels à projets &amp; Emplois</a>
            <a href="<?= $base ?>/a-propos">À propos</a>
            <a href="<?= $base ?>/#contact">Contact</a>
            <a href="<?= $base ?>/admin/">🔒 Espace admin</a>
          </div>
        </div>
        <div>
          <h4 class="pied__titre">Coordonnées</h4>
          <div class="pied__liens">
            <span>Goma, Nord-Kivu, RDC</span>
            <a href="mailto:contact@linksmartec.com">contact@linksmartec.com</a>
          </div>
        </div>
      </div>
    </div>
  </footer>

  <script>
    (function () {
      var burger = document.getElementById('burger');
      var nav = document.getElementById('nav');
      if (burger && nav) {
        burger.addEventListener('click', function () {
          var ouvert = nav.classList.toggle('nav--ouvert');
          burger.setAttribute('aria-expanded', ouvert ? 'true' : 'false');
        });
      }
    })();
  </script>
</body>
</html>
