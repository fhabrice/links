<?php
declare(strict_types=1);
require_once __DIR__ . '/app/bootstrap.php';
$base = base_url();
$contenu = lk_store()->contenu();
$identite = $contenu['identite'] ?? [];
$tw = $contenu['travaillerAvecNous'] ?? [];
$gform = $tw['googleForm'] ?? [];
?>
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Travailler avec nous | <?= htmlspecialchars($identite['nom'] ?? 'LK-TECH', ENT_QUOTES, 'UTF-8') ?> — Recrutement</title>
  <meta name="description" content="Rejoignez LK-TECH à Goma : génie civil, architecture & design, informatique, énergie. Candidature transmise à notre Google Form et Gmail.">
  <meta name="theme-color" content="#16233F">
  <link rel="icon" type="image/svg+xml" href="<?= $base ?>/assets/img/favicon.svg">
  <link rel="stylesheet" href="<?= $base ?>/assets/css/styles.css">
  <link rel="stylesheet" href="<?= $base ?>/assets/css/refonte.css">
  <style>
    .hero-cand { background: linear-gradient(135deg,#111d34 0%,#16233f 55%,#1e3a2f 100%); color:#fff; padding:3.5rem 1.25rem; }
    .hero-cand__grid { display:grid; grid-template-columns:1.1fr .9fr; gap:2.5rem; align-items:center; }
    @media(max-width:880px){ .hero-cand__grid{grid-template-columns:1fr} }
    .hero-cand h1{ font-size:clamp(2rem,4vw,3rem); line-height:1.1; margin:.6rem 0 1rem; }
    .hero-cand p{ color:#cbd5e1; line-height:1.7; max-width:36rem; }
    .hero-cand .btn{ margin-top:1rem; }
    .cand-avantages{ display:grid; grid-template-columns:repeat(3,1fr); gap:1rem; }
    @media(max-width:780px){ .cand-avantages{grid-template-columns:1fr} }
  </style>
</head>
<body>
  <div class="topbar">
    <div class="conteneur topbar__inner">
      <span class="topbar__rccm">GÉNIE CIVIL <span>·</span> ARCHITECTURE <span>·</span> TECHNOLOGIE <span>·</span> ÉNERGIE</span>
      <div class="topbar__infos">
        <span data-champ="ville">Goma, RDC</span>
        <a class="topbar__tel" data-champ="telephone" data-lien="tel" href="tel:+243976459970">+243 976 459 970</a>
      </div>
    </div>
  </div>

  <header class="entete">
    <div class="conteneur entete__inner">
      <a class="marque" href="<?= $base ?>/" aria-label="Accueil LK-TECH">
        <img class="marque__logo" src="<?= $base ?>/assets/img/logo.svg" alt="Logo LK-TECH">
        <span class="marque__texte"><span class="marque__nom">LK<i class="tiret">-</i>TECH</span><span class="marque__slogan">LINKS MARTECH</span></span>
      </a>
      <nav class="nav" id="nav">
        <a class="nav__lien" href="<?= $base ?>/">Accueil</a>
        <a class="nav__lien" href="<?= $base ?>/a-propos">À propos</a>
        <a class="nav__lien" href="<?= $base ?>/opportunites.php">Opportunités</a>
        <a class="nav__lien" href="<?= $base ?>/travailler-avec-nous.php">Travailler avec nous</a>
        <a class="nav__lien" href="<?= $base ?>/#contact">Contact</a>
      </nav>
      <div class="entete__actions">
        <a class="btn btn--fantome btn--petit" href="tel:+243976459970">📞 Appeler</a>
        <a class="btn btn--petit" href="#candidature">Postuler</a>
        <button class="burger" id="burger" aria-label="Ouvrir le menu" aria-controls="nav" aria-expanded="false">☰</button>
      </div>
    </div>
  </header>

  <section class="hero-cand">
    <div class="conteneur hero-cand__grid">
      <div>
        <p class="section__sur" style="color:#57bb7b"><?= htmlspecialchars($tw['surTitre'] ?? 'REJOIGNEZ L’AVENTURE', ENT_QUOTES, 'UTF-8') ?></p>
        <h1><?= htmlspecialchars($tw['titre'] ?? 'Travailler avec nous', ENT_QUOTES, 'UTF-8') ?></h1>
        <p><?= htmlspecialchars($tw['soustitre'] ?? $tw['sousTitre'] ?? 'Envie de construire, coder ou électrifier l’avenir avec nous ?', ENT_QUOTES, 'UTF-8') ?></p>
        <p style="margin-top:1rem; font-size:.92rem; color:#e2e8f0;"><?= htmlspecialchars($tw['texte'] ?? '', ENT_QUOTES, 'UTF-8') ?></p>
        <div style="display:flex; gap:.8rem; flex-wrap:wrap; margin-top:1.4rem;">
          <a class="btn btn--accent" href="#candidature">✉️ Envoyer ma candidature</a>
          <a class="btn btn--fantome" style="color:#fff; border-color:rgba(255,255,255,.35)" href="tel:+243976459970">📞 Appeler maintenant</a>
        </div>
      </div>
      <div style="background:#fff; color:#0f172a; border-radius:6px; padding:1.4rem; box-shadow:0 12px 40px rgba(0,0,0,.18);">
        <h3 style="margin:0 0 .6rem;">Pourquoi nous rejoindre ?</h3>
        <ul style="margin:0; padding-left:1.2rem; line-height:1.7; color:#475569; font-size:.92rem;">
          <li>Projets concrets à Goma et dans l'Est de la RDC</li>
          <li>Équipe pluridisciplinaire (ingénieurs, architectes, développeurs)</li>
          <li>Formation continue et évolution au sein des 4 pôles</li>
          <li>Réponse rapide à chaque candidature via e-mail / Google Form</li>
        </ul>
        <p style="margin:1rem 0 0; font-size:.8rem; color:#64748b;">📧 Chaque candidature est enregistrée, envoyée à notre Google Form et notifiée par Gmail.</p>
      </div>
    </div>
  </section>

  <?php if (!empty($tw['avantages'])): ?>
  <section class="section">
    <div class="conteneur">
      <div class="cand-avantages">
        <?php foreach ($tw['avantages'] as $av): ?>
          <div class="carte">
            <div style="font-size:1.6rem;"><?= htmlspecialchars($av['icone'] ?? '★', ENT_QUOTES, 'UTF-8') ?></div>
            <h3 style="margin:.6rem 0 .4rem;"><?= htmlspecialchars($av['titre'] ?? '', ENT_QUOTES, 'UTF-8') ?></h3>
            <p style="color:#64748b; line-height:1.6; font-size:.92rem;"><?= htmlspecialchars($av['texte'] ?? '', ENT_QUOTES, 'UTF-8') ?></p>
          </div>
        <?php endforeach; ?>
      </div>
    </div>
  </section>
  <?php endif; ?>

  <section class="section section--gris" id="candidature">
    <div class="conteneur">
      <div class="section__entete">
        <p class="section__sur">CANDIDATURE <span class="section__trait"></span> 07</p>
        <h2 class="section__titre"><?= htmlspecialchars($tw['formulaire']['titre'] ?? 'Candidature complète', ENT_QUOTES, 'UTF-8') ?></h2>
        <p class="section__texte"><?= htmlspecialchars($tw['formulaire']['sousTitre'] ?? 'Remplissez ce formulaire : il est envoyé à notre équipe, à notre Google Form et à notre Gmail.', ENT_QUOTES, 'UTF-8') ?></p>
        <?php if (empty($gform['actionUrl'])): ?>
          <p style="margin-top:.8rem; background:#fff7ed; border:1px solid #fed7aa; padding:.7rem 1rem; border-radius:4px; font-size:.86rem; color:#9a3412;">ℹ️ Google Form non encore configuré — les candidatures sont enregistrées localement et consultables dans l'admin. <a href="<?= $base ?>/docs/CONFIG_GOOGLE_FORM.md" target="_blank" style="text-decoration:underline;">Voir comment connecter votre Google Form / Gmail</a>.</p>
        <?php else: ?>
          <p style="margin-top:.8rem; background:#f0fdf4; border:1px solid #bbf7d0; padding:.7rem 1rem; border-radius:4px; font-size:.86rem; color:#166534;">✅ Connecté à Google Form → chaque candidature alimente automatiquement votre Google Sheets et déclenche une notification Gmail vers <?= htmlspecialchars($gform['gmailDestination'] ?? $identite['email'] ?? '', ENT_QUOTES, 'UTF-8') ?>.</p>
        <?php endif; ?>
      </div>

      <div class="grille-contact">
        <div class="contact-infos">
          <div class="info-bloc"><div class="info-bloc__icone">📞</div><div><div class="info-bloc__titre">Appeler</div><a class="info-bloc__valeur" href="tel:+243976459970" data-champ="telephone" data-lien="tel">+243 976 459 970</a><p style="font-size:.82rem;color:#64748b;margin-top:.3rem;">Lun–Sam 08h00–18h00 · Réponse rapide</p><a class="btn btn--petit" href="tel:+243976459970" style="margin-top:.6rem;">📞 Appeler maintenant</a></div></div>
          <div class="info-bloc"><div class="info-bloc__icone">✉️</div><div><div class="info-bloc__titre">E-mail RH</div><a class="info-bloc__valeur" href="mailto:contact@linksmartec.com" data-champ="email" data-lien="mailto">contact@linksmartec.com</a><p style="font-size:.82rem;color:#64748b;">Candidatures &amp; partenariats</p></div></div>
          <div class="info-bloc"><div class="info-bloc__icone">📍</div><div><div class="info-bloc__titre">Adresse</div><div class="info-bloc__valeur" data-champ="ville">Goma, Nord-Kivu, RDC</div><div class="info-bloc__valeur" data-champ="adresse">Avenue du Lac, Goma</div></div></div>
          <div class="info-bloc"><div class="info-bloc__icone">🔗</div><div><div class="info-bloc__titre">Google Form / Gmail</div><p style="font-size:.85rem;color:#475569;line-height:1.6;">Chaque envoi est : 1) enregistré sur le site, 2) transféré à votre Google Form (si configuré), 3) notifié par e-mail. Configurez l'URL Form Response dans l'admin pour activer le flux complet.</p></div></div>
        </div>

        <form class="formulaire formulaire--candidature" id="formulaire-candidature" novalidate>
          <div class="alerte alerte--succes" id="cand-succes" role="status"></div>
          <div class="alerte alerte--erreur" id="cand-erreur" role="alert"></div>

          <div class="ligne-2">
            <div class="champ">
              <label for="cand-civilite">Civilité</label>
              <select id="cand-civilite" name="civilite">
                <option value="M.">M.</option>
                <option value="Mme">Mme</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
            <div class="champ">
              <label for="cand-domaine">Domaine / Pôle *</label>
              <select id="cand-domaine" name="domaine" required>
                <option value="">— Choisir —</option>
                <option value="Génie Civil">Génie Civil</option>
                <option value="Architecture & Design">Architecture & Design</option>
                <option value="Informatique">Informatique</option>
                <option value="Énergie renouvelable">Énergie renouvelable</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
          </div>

          <div class="ligne-2">
            <div class="champ"><label for="cand-nom">Nom *</label><input id="cand-nom" name="nom" type="text" required placeholder="Votre nom" autocomplete="family-name"></div>
            <div class="champ"><label for="cand-prenom">Prénom *</label><input id="cand-prenom" name="prenom" type="text" required placeholder="Votre prénom" autocomplete="given-name"></div>
          </div>

          <div class="ligne-2">
            <div class="champ"><label for="cand-email">E-mail *</label><input id="cand-email" name="email" type="email" required placeholder="vous@exemple.com" autocomplete="email"></div>
            <div class="champ"><label for="cand-tel">Téléphone *</label><input id="cand-tel" name="telephone" type="tel" required placeholder="+243 ..." autocomplete="tel"></div>
          </div>

          <div class="ligne-2">
            <div class="champ"><label for="cand-ville">Ville / Pays</label><input id="cand-ville" name="ville" type="text" placeholder="Goma, RDC"></div>
            <div class="champ"><label for="cand-naissance">Date de naissance</label><input id="cand-naissance" name="dateNaissance" type="date"></div>
          </div>

          <div class="ligne-2">
            <div class="champ">
              <label for="cand-type">Type de collaboration *</label>
              <select id="cand-type" name="typeCollaboration" required>
                <option value="">— Choisir —</option>
                <option value="Emploi">Emploi (CDI/CDD)</option>
                <option value="Stage">Stage</option>
                <option value="Freelance / Consultant">Freelance / Consultant</option>
                <option value="Partenariat">Partenariat</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
            <div class="champ">
              <label for="cand-exp">Expérience</label>
              <select id="cand-exp" name="experience">
                <option value="">— Choisir —</option>
                <option value="0-1 an">0-1 an</option>
                <option value="1-3 ans">1-3 ans</option>
                <option value="3-5 ans">3-5 ans</option>
                <option value="5+ ans">5+ ans</option>
              </select>
            </div>
          </div>

          <div class="ligne-2">
            <div class="champ">
              <label for="cand-dispo">Disponibilité</label>
              <select id="cand-dispo" name="disponibilite">
                <option value="">— Choisir —</option>
                <option value="Immédiate">Immédiate</option>
                <option value="1 mois">1 mois</option>
                <option value="3 mois">3 mois</option>
                <option value="À discuter">À discuter</option>
              </select>
            </div>
            <div class="champ"><label for="cand-liencv">Lien CV / Portfolio</label><input id="cand-liencv" name="lienCv" type="url" placeholder="https://drive.google.com/... ou LinkedIn"></div>
          </div>

          <div class="champ"><label for="cand-message">Motivation / Message *</label><textarea id="cand-message" name="message" rows="5" required placeholder="Présentez-vous, vos compétences et pourquoi vous souhaitez rejoindre LK-TECH…"></textarea></div>

          <div class="champ champ--check">
            <label class="check-label" style="display:flex; gap:.6rem; align-items:flex-start; font-size:.85rem; line-height:1.5; color:#475569;">
              <input type="checkbox" name="consentement" required style="margin-top:.3rem;"> <span>J'accepte que mes données soient utilisées pour traiter ma candidature et transmises à notre Google Form / Gmail conformément à la politique de confidentialité. *</span>
            </label>
          </div>

          <button class="btn btn--bloc" type="submit" id="cand-envoyer">Envoyer ma candidature <span aria-hidden="true">↗</span></button>
          <p style="margin:.6rem 0 0; font-size:.78rem; color:#64748b; text-align:center;">Vos données sont envoyées à notre équipe, à notre Google Form et notifiées par e-mail (Gmail). Aucune utilisation commerciale.</p>
        </form>
      </div>
    </div>
  </section>

  <footer class="pied">
    <div class="conteneur">
      <div class="pied__grille">
        <div>
          <img class="pied__logo" src="<?= $base ?>/assets/img/logo-clair.svg" alt="Logo LK-TECH">
          <div class="pied__nom">LK<i class="tiret">-</i>TECH</div>
          <p class="pied__texte" id="pied-description"><?= htmlspecialchars($contenu['pied']['description'] ?? '', ENT_QUOTES, 'UTF-8') ?></p>
        </div>
        <div>
          <h4 class="pied__titre">Navigation</h4>
          <div class="pied__liens">
            <a href="<?= $base ?>/">Accueil</a>
            <a href="<?= $base ?>/a-propos">À propos</a>
            <a href="<?= $base ?>/opportunites.php">Opportunités</a>
            <a href="<?= $base ?>/travailler-avec-nous.php">Travailler avec nous</a>
            <a href="<?= $base ?>/#contact">Contact</a>
          </div>
        </div>
        <div>
          <h4 class="pied__titre">Nos spécialités</h4>
          <div class="pied__liens" id="pied-specialites"></div>
        </div>
        <div>
          <h4 class="pied__titre">Coordonnées</h4>
          <div class="pied__liens">
            <span data-champ="ville">Goma, Nord-Kivu, RDC</span>
            <a data-champ="telephone" data-lien="tel" href="tel:+243976459970">+243 976 459 970</a>
            <a data-champ="email" data-lien="mailto" href="mailto:contact@linksmartec.com">contact@linksmartec.com</a>
            <span data-champ="rccm">RCCM : CD-GOM-01-2024-A-002698</span>
          </div>
        </div>
      </div>
      <div class="pied__bas">
        <span id="pied-copyright">© 2026 LK-TECH — Tous droits réservés.</span>
        <span>Goma, République démocratique du Congo</span>
      </div>
    </div>
  </footer>

  <div class="barre-appel" aria-label="Actions rapides">
    <a class="barre-appel__btn barre-appel__btn--tel" href="tel:+243976459970">📞 Appeler</a>
    <a class="barre-appel__btn barre-appel__btn--cta" href="#candidature">Postuler ↗</a>
  </div>

  <div class="toast" id="toast" role="status" aria-live="polite"></div>
  <script>window.LK_BASE="<?= $base ?>"; window.LK_SECOURS="<?= $base ?>/assets/data/site.json";</script>
  <script src="<?= $base ?>/assets/i18n/traductions.js"></script>
  <script src="<?= $base ?>/assets/js/site.js"></script>
  <script src="<?= $base ?>/assets/js/candidature.js"></script>
</body>
</html>
