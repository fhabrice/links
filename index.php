<?php
/**
 * LK-TECH (Linksmartech) — page d'accueil
 * Version PHP : fonctionne sur tout hébergement classique (cPanel, Apache, Nginx).
 *
 * @package LK-TECH
 */

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';

$base = base_url();
$contenu = contenu_public(lk_store()->contenu());
$identite = $contenu['identite'] ?? [];
$reglages = lk_store()->reglages();
$annoncesVitrine = lk_store()->listerAnnonces(['limit'=>6]);
require_once __DIR__ . '/app/UtilisateurAuth.php';
$utilisateurConnecte = null;
try { $ua = new UtilisateurAuth(lk_store()); $utilisateurConnecte = $ua->utilisateur(); } catch (Throwable $e) {}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?= htmlspecialchars(($identite['nom'] ?? 'LK-TECH'), ENT_QUOTES, 'UTF-8') ?> | Construire, digitaliser et connecter vos projets</title>
  <meta name="description" content="LK-TECH accompagne vos projets en génie civil, architecture & design, solutions digitales et énergie renouvelable, de la conception à la réalisation. Basée à Goma, RDC.">
  <meta name="theme-color" content="#16233F">
  <meta property="og:title" content="LK-TECH | Construire, digitaliser et connecter vos projets">
  <meta property="og:description" content="Génie civil, architecture, technologie et énergie : un partenaire pour concrétiser vos projets.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://www.linksmartec.com/">
  <meta property="og:site_name" content="LK-TECH">
  <link rel="canonical" href="https://www.linksmartec.com/">
  <link rel="icon" type="image/svg+xml" href="<?= $base ?>/assets/img/favicon.svg" id="favicon">
  <link rel="apple-touch-icon" href="<?= $base ?>/assets/img/logo.svg">
  <link rel="stylesheet" href="<?= $base ?>/assets/css/styles.css?v=20261126">
  <link rel="stylesheet" href="<?= $base ?>/assets/css/refonte.css?v=20261126-logiciels">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "LK-TECH (Linksmartech)",
    "url": "https://www.linksmartec.com",
    "email": "contact@linksmartec.com",
    "telephone": "+243 976 459 970",
    "description": "Génie civil, architecture & design, technologie et énergie renouvelable à Goma, RDC.",
    "areaServed": "Nord-Kivu, République Démocratique du Congo",
    "knowsAbout": ["Informatique", "Développement logiciel", "Réseaux", "Génie Civil", "Architecture", "BTP", "Énergie renouvelable", "Énergie solaire"]
  }
  </script>
<link rel="stylesheet" href="<?= $base ?>/assets/css/responsive.css?v=20261126-1">
</head>
<body>
  <a class="lien-evitement" href="#contenu-principal">Aller au contenu</a>

  <div class="bandeau-info" id="bandeau-maintenance" hidden>
    Site en cours de maintenance — certaines fonctions peuvent être momentanément indisponibles.
  </div>

  <!-- ============================== TOPBAR ============================== -->
  <div class="topbar">
    <div class="conteneur topbar__inner">
      <span class="topbar__rccm">GÉNIE CIVIL <span>·</span> ARCHITECTURE <span>·</span> TECHNOLOGIE <span>·</span> ÉNERGIE</span>
      <div class="topbar__infos">
        <span data-champ="ville">Goma, RDC</span>
        <a class="topbar__tel" data-champ="telephone" data-lien="tel" href="tel:+243976459970">+243 976 459 970</a>
        <div class="langues" data-sans-traduction>
          <label class="sr-only" for="choix-langue">Choisir la langue</label>
          <span class="langues__icone" aria-hidden="true"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.4 2.5 3.6 5.5 3.6 9s-1.2 6.5-3.6 9M12 3C9.6 5.5 8.4 8.5 8.4 12s1.2 6.5 3.6 9"/></svg></span>
          <select id="choix-langue" name="langue" aria-label="Choisir la langue">
            <option value="fr" lang="fr">Français</option>
            <option value="en" lang="en">English</option>
            <option value="sw" lang="sw">Kiswahili</option>
            <option value="ln" lang="ln">Lingala</option>
          </select>
        </div>
      </div>
    </div>
  </div>

  <!-- =============================== ENTÊTE ============================= -->
  <header class="entete">
    <div class="conteneur entete__inner">
      <a class="marque" href="#accueil" aria-label="Accueil LK-TECH">
        <img class="marque__logo" id="logo-entete" src="<?= $base ?>/assets/img/logo.svg" alt="Logo LK-TECH">
        <span class="marque__texte">
          <span class="marque__nom" id="nom-entete">LK<i class="tiret">-</i>TECH</span>
          <span class="marque__slogan">LINKS MARTECH</span>
        </span>
      </a>

      <nav class="nav" id="nav" aria-label="Navigation principale">
        <a class="nav__lien" href="#accueil">Accueil</a>
        <a class="nav__lien" href="#specialites">Expertises</a>
        <a class="nav__lien" href="#services">Solutions</a>
        <a class="nav__lien" href="#approche">Notre méthode</a>
        <a class="nav__lien" href="#logiciels">Logiciels</a>
        <a class="nav__lien" href="<?= $base ?>/opportunites.php">Opportunités</a>
        <a class="nav__lien" href="<?= $base ?>/a-propos">À propos</a>
        <a class="nav__lien" href="<?= $base ?>/travailler-avec-nous.php">Travailler avec nous</a>
        <a class="nav__lien" href="#contact">Contact</a>
        <a class="nav__lien" href="<?= $base ?>/admin/">🔒 Admin</a>
      </nav>

      <div class="entete__actions">
        <a class="btn btn--fantome btn--petit" href="tel:+243976459970" title="Appeler LK-TECH" aria-label="Appeler">📞 Appeler</a>
        <a class="btn btn--recrutement btn--petit" href="<?= $base ?>/travailler-avec-nous.php">Travailler avec nous</a>
        <button class="btn btn--fantome btn--petit panier-btn" id="btn-panier" type="button" aria-label="Ouvrir le panier">
          Panier
          <span class="panier-btn__compteur" id="panier-compteur" hidden>0</span>
        </button>
        <a class="btn btn--petit" id="btn-portail" href="#contact">Parlons de votre projet <span aria-hidden="true">↗</span></a>
        <button class="burger" id="burger" type="button" aria-label="Ouvrir le menu" aria-controls="nav" aria-expanded="false">☰</button>
      </div>
    </div>
  </header>

  <!-- ============================== ACCUEIL ============================== -->
  <main id="contenu-principal">
  <section class="hero" id="accueil" aria-labelledby="hero-titre">
    <div class="conteneur hero__inner">
      <div class="hero__grille">
        <div class="hero__contenu">
          <span class="badge-pilule" id="hero-badge">Ingénierie &amp; solutions intégrées · Goma, RDC</span>
          <h1 class="hero__titre" id="hero-titre">Construire, digitaliser, <span class="accent">faire avancer vos projets</span>.</h1>
          <p class="hero__texte" id="hero-texte">Vous souhaitez bâtir, développer votre activité ou gagner en autonomie énergétique ? Depuis Goma, LK-TECH associe ingénierie, architecture et numérique pour transformer vos ambitions en projets structurés, adaptés à votre budget et aux réalités du terrain.</p>
          <div class="hero__boutons">
            <a class="btn btn--accent" id="hero-bouton" href="#contact">Parlons de votre projet <span aria-hidden="true">↗</span></a>
            <a class="btn btn--fantome hero__secondaire" href="#collaborations">Explorer les collaborations <span aria-hidden="true">→</span></a>
          </div>
          <div class="hero__reperes" aria-label="Nos domaines d'activité">
            <span><i></i> Génie Civil</span><span><i></i> Architecture</span><span><i></i> Technologie</span><span><i></i> Énergie</span>
          </div>
        </div>
        <div class="hero__visuel">
          <img src="<?= $base ?>/assets/img/vedette-construction.jpg" alt="Chantier de construction, équipes au travail" fetchpriority="high">
          <div class="hero__visuel-note"><span class="hero__note-signe">LK<span>·</span></span><span>Des idées solides.<br><strong>Des solutions concrètes.</strong></span></div>
        </div>
      </div>
      <div class="hero__bas"><span>01 / UNE VISION INTÉGRÉE</span><a href="#presentation">Découvrir LK-TECH <span aria-hidden="true">↓</span></a></div>
    </div>
  </section>

  <div class="ruban" aria-label="Nos domaines d'expertise">
    <div class="conteneur ruban__inner">
      <span class="ruban__intro">NOS DOMAINES</span>
      <div class="ruban__liste" id="ruban-specialites"></div>
      <a class="ruban__contact" href="#contact">Nous contacter <span aria-hidden="true">↗</span></a>
    </div>
  </div>

  <section class="presentation" id="presentation">
    <div class="conteneur presentation__grille">
      <div class="presentation__image">
        <img src="<?= $base ?>/assets/img/portrait-expertise.jpg" alt="Illustration d’une collaboration autour de plans et d’outils numériques" loading="lazy">
        <div class="presentation__cartouche"><strong>De l'idée au terrain.</strong><span>Un accompagnement à chaque étape.</span></div>
        <small class="illustration-note">Visuel d’illustration généré par IA</small>
      </div>
      <div class="presentation__contenu">
        <p class="section__sur">À PROPOS DE LK-TECH <span class="section__trait"></span> 01</p>
        <h2 class="section__titre">Vos ambitions méritent<br><em>une vision d’ensemble.</em></h2>
        <p>Un bâtiment bien conçu, des outils numériques efficaces et une énergie adaptée sont autant de leviers pour développer une activité. LK-TECH (Links Martech) réunit ces compétences pour accompagner les particuliers, entreprises, institutions et organisations dans leurs projets à Goma et en RDC.</p>
        <p>Notre valeur ajoutée : relier les expertises pour vous aider à faire des choix cohérents, de l’étude à la mise en service. Nous partons de vos usages, de vos priorités et des contraintes du site pour construire une réponse technique lisible et un accompagnement adapté.</p>
        <div class="presentation__atouts"><span>✳ &nbsp; Expertise pluridisciplinaire</span><span>✳ &nbsp; Solutions adaptées au terrain</span></div>
        <a class="lien-fleche" href="<?= $base ?>/a-propos">En savoir plus sur nous <span aria-hidden="true">↗</span></a>
      </div>
    </div>
  </section>

  <section class="section section--gris" id="collaborations" aria-labelledby="collaborations-titre">
    <div class="conteneur">
      <div class="section__entete">
        <p class="section__sur">CLIENTS · INVESTISSEURS · PARTENAIRES · TALENTS</p>
        <h2 class="section__titre" id="collaborations-titre">Votre ambition, <em>notre point de départ.</em></h2>
        <p class="section__texte">Chaque collaboration commence par un objectif partagé. Découvrez comment avancer avec LK-TECH, selon votre projet et le rôle que vous souhaitez y jouer.</p>
      </div>
      <div class="grille-specialites">
        <article class="carte">
          <h3>Clients &amp; porteurs de projets</h3>
          <p>Construire un bâtiment, digitaliser une entreprise ou équiper un site en énergie : bénéficiez d’une lecture technique de vos besoins et d’une proposition adaptée à vos priorités.</p>
          <a class="lien-fleche" href="#contact">Présenter mon projet <span aria-hidden="true">↗</span></a>
        </article>
        <article class="carte">
          <h3>Investisseurs &amp; diaspora</h3>
          <p>Vous souhaitez explorer un projet immobilier, numérique ou énergétique en RDC ? Échangeons sur sa faisabilité technique, ses besoins et les modalités possibles de collaboration avant tout engagement.</p>
          <a class="lien-fleche" href="#contact">Échanger sur un investissement <span aria-hidden="true">↗</span></a>
        </article>
        <article class="carte">
          <h3>Entreprises &amp; partenaires</h3>
          <p>Bureaux d’études, fournisseurs, institutions et ONG : rapprochons nos compétences pour répondre à un appel à projets, équiper un site ou concevoir une intervention adaptée aux besoins locaux.</p>
          <a class="lien-fleche" href="#contact">Proposer un partenariat <span aria-hidden="true">↗</span></a>
        </article>
        <article class="carte">
          <h3>Talents &amp; professionnels</h3>
          <p>Ingénieurs, architectes, développeurs et techniciens : faites connaître votre savoir-faire et vos disponibilités pour contribuer aux projets de LK-TECH.</p>
          <a class="lien-fleche" href="<?= $base ?>/travailler-avec-nous.php">Faire connaître mes compétences <span aria-hidden="true">↗</span></a>
        </article>
      </div>
    </div>
  </section>

  <!-- ============================ SPÉCIALITÉS =========================== -->
  <section class="section" id="specialites">
    <div class="conteneur">
      <div class="section__entete">
        <p class="section__sur">CE QUE NOUS FAISONS <span class="section__trait"></span> 02</p>
        <h2 class="section__titre">Des expertises qui font <em>la différence.</em></h2>
        <p class="section__texte">Concevoir des espaces utiles, moderniser vos opérations, construire votre patrimoine et préparer votre autonomie énergétique : quatre expertises complémentaires au service de vos objectifs. Explorez les solutions adaptées à votre projet.</p>
      </div>
      <div class="grille-specialites" id="grille-specialites"></div>
    </div>
  </section>

  <!-- ============================== SERVICES ============================ -->
  <section class="section section--gris" id="services">
    <div class="conteneur">
      <div class="section__entete">
        <p class="section__sur">NOS SOLUTIONS <span class="section__trait"></span> 03</p>
        <h2 class="section__titre">Des réponses concrètes à <em>vos défis.</em></h2>
      </div>
      <div class="solutions-detail" id="solutions-detail">
        <div class="onglets" id="onglets-hero" role="tablist" aria-label="Explorer nos expertises"></div>
        <div class="solutions-detail__contenu" id="expertise-panel" role="tabpanel" tabindex="0">
          <div><span class="solutions-detail__badge" id="expertise-badge">Spécialité Informatique</span><h3 id="expertise-titre">Des solutions pensées pour votre activité.</h3></div>
          <div><p id="expertise-texte">Du diagnostic au déploiement, découvrez un accompagnement adapté à vos besoins.</p><a class="btn btn--accent" id="expertise-bouton" href="#contact">Parlons de votre besoin <span aria-hidden="true">↗</span></a></div>
        </div>
      </div>
      <div class="grille-services" id="grille-services"></div>
    </div>
  </section>

  <!-- ============================== APPROCHE ============================ -->
  <section class="section" id="approche">
    <div class="conteneur">
      <div class="section__entete">
        <p class="section__sur">NOTRE MÉTHODE <span class="section__trait"></span> 04</p>
        <h2 class="section__titre" id="approche-titre">Notre Approche</h2>
        <p class="section__texte" id="approche-soustitre">Des décisions mieux préparées, des étapes lisibles et un accompagnement après la mise en service.</p>
      </div>
      <div class="grille-etapes" id="grille-etapes"></div>
    </div>
  </section>

  <!-- ============================== BOUTIQUE ============================ -->
  <section class="section section--gris" id="logiciels">
    <div class="conteneur">
      <?php
        $logiciels = $contenu['logiciels'] ?? [];
        // « items » est partagé avec Next.js ; lire aussi l'ancien format « liste ».
        $catalogue = $logiciels['liste'] ?? $logiciels['items'] ?? [];
        $listeLogiciels = array_values(array_filter($catalogue, fn($l) => ($l['actif'] ?? true) !== false));
      ?>
      <div class="section__entete">
        <p class="section__sur">SOLUTIONS LOGICIELLES <span class="section__trait"></span> 05</p>
        <h2 class="section__titre"><?= e($logiciels['titre'] ?? 'Nos logiciels') ?></h2>
        <p class="section__texte"><?= e($logiciels['sousTitre'] ?? 'Des logiciels conçus par LK-TECH pour simplifier la gestion de votre entreprise') ?></p>
      </div>

      <div class="vitrine-logiciels">
        <?php foreach ($listeLogiciels as $log): ?>
          <article class="carte" style="display:flex;flex-direction:column;justify-content:space-between;background:#fff;border-radius:16px;padding:24px;border:1px solid rgba(15,23,42,.08);box-shadow:0 8px 24px rgba(15,23,42,.04);">
            <div>
              <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:8px;margin-bottom:12px;">
                <span style="font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#0284c7;background:#e0f2fe;padding:4px 10px;border-radius:999px;"><?= e($log['categorie'] ?? 'Logiciel LK-TECH') ?></span>
                <?php if (!empty($log['badge'])): ?>
                  <span style="font-size:.75rem;font-weight:600;color:#475569;"><?= e($log['badge']) ?></span>
                <?php endif; ?>
              </div>
              <h3 style="margin:0 0 8px;font-size:1.25rem;color:#0f172a;"><?= e($log['nom'] ?? '') ?></h3>
              <p style="margin:0 0 12px;font-weight:600;color:#334155;font-size:.95rem;"><?= e($log['pitch'] ?? $log['resume'] ?? '') ?></p>
              <p style="margin:0 0 16px;color:#475569;font-size:.9rem;line-height:1.55;"><?= e($log['explication'] ?? '') ?></p>
              <?php if (!empty($log['fonctionnalites']) && is_array($log['fonctionnalites'])): ?>
                <ul style="margin:0 0 20px;padding-left:18px;color:#334155;font-size:.88rem;line-height:1.6;">
                  <?php foreach ($log['fonctionnalites'] as $f): ?>
                    <li><?= e($f) ?></li>
                  <?php endforeach; ?>
                </ul>
              <?php endif; ?>
            </div>
            <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:12px;padding-top:16px;border-top:1px solid rgba(15,23,42,.08);">
              <div>
                <strong style="font-size:1.15rem;color:#0f172a;"><?= isset($log['prix']) && $log['prix'] !== '' ? e((string)$log['prix'] . ' ' . ($log['devise'] ?? 'USD')) : 'Sur devis' ?></strong>
                <?php if (!empty($log['typePrix'])): ?>
                  <span style="display:block;font-size:.75rem;color:#64748b;"><?= e($log['typePrix']) ?></span>
                <?php endif; ?>
              </div>
              <a href="#contact" class="btn btn--petit"><?= e($logiciels['texteBouton'] ?? 'Demander une démo') ?></a>
            </div>
          </article>
        <?php endforeach; ?>
        <?php if (!$listeLogiciels): ?>
          <p>Notre catalogue évolue. <a href="#contact">Contactez-nous pour découvrir les solutions disponibles.</a></p>
        <?php endif; ?>
      </div>
    </div>
  </section>

  <!-- =================== OPPORTUNITÉS & COLLABORATIONS ========================= -->
  <section class="section section--gris" id="opportunites">
    <div class="conteneur">
      <div class="section__entete">
        <p class="section__sur">OPPORTUNITÉS &amp; COLLABORATIONS <span class="section__trait"></span> 06</p>
        <h2 class="section__titre">Appels à projets &amp; <em>Offres d'emploi</em></h2>
        <p class="section__texte">Entreprises, porteurs de projets et talents : découvrez les annonces, proposez un appel à projet ou trouvez une occasion de mettre vos compétences au service de nouvelles réalisations. Créez votre compte pour publier et suivre vos démarches.</p>
        <?php if($utilisateurConnecte): ?>
          <p style="margin-top:.8rem;background:#ecfdf5;border:1px solid #a7f3d0;color:#065f46;padding:.6rem 1rem;border-radius:8px;display:inline-block;font-size:.9rem"><strong>Connecté :</strong> <?= htmlspecialchars($utilisateurConnecte['nom'] ?? $utilisateurConnecte['email']) ?> · <a href="<?= $base ?>/mon-espace.php" style="color:#065f46;text-decoration:underline">Mon espace</a></p>
        <?php else: ?>
          <p style="margin-top:.8rem;font-size:.9rem"><a href="<?= $base ?>/connexion.php" style="color:#16233F;font-weight:700">Se connecter</a> · <a href="<?= $base ?>/inscription.php" style="color:#2e9e5b;font-weight:700">Créer un compte</a></p>
        <?php endif; ?>
      </div>
      <div style="display:flex;gap:.6rem;margin-bottom:1.2rem;flex-wrap:wrap">
        <a href="<?= $base ?>/opportunites.php" class="btn btn--petit" style="background:#16233F;color:#fff">Voir toutes les opportunités ↗</a>
        <a href="<?= $base ?>/inscription.php" class="btn btn--fantome btn--petit">Publier une annonce</a>
        <a href="<?= $base ?>/mon-espace.php" class="btn btn--fantome btn--petit">Mon espace</a>
      </div>
      <?php if(empty($annoncesVitrine)): ?>
        <p style="background:#fff;border:1px dashed #cbd5e1;padding:1.5rem;border-radius:12px;text-align:center;color:#64748b">Aucune opportunité pour l'instant. <a href="<?= $base ?>/inscription.php">Soyez le premier à poster !</a></p>
      <?php else: ?>
      <div class="annonces-grille">
        <?php foreach($annoncesVitrine as $a): ?>
        <div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:1.2rem">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.6rem">
            <span style="font-size:.7rem;padding:.25rem .6rem;border-radius:999px;font-weight:800;text-transform:uppercase;<?php
              echo ($a['type']==='projet'?'background:#dbeafe;color:#1e40af':($a['type']==='emploi'?'background:#dcfce7;color:#166534':'background:#fef3c7;color:#92400e'));
            ?>"><?= htmlspecialchars($a['type']) ?></span>
            <span style="font-size:.78rem;color:#94a3b8"><?= htmlspecialchars($a['localisation']??'') ?></span>
          </div>
          <h3 style="font-size:1rem;margin:.4rem 0"><?= htmlspecialchars($a['titre']) ?></h3>
          <p style="color:#475569;font-size:.9rem;line-height:1.5"><?= nl2br(htmlspecialchars(mb_substr($a['description'],0,140))) ?>...</p>
          <?php if(!empty($a['budget'])): ?><p style="font-size:.85rem;margin-top:.5rem"><b><?= $a['type']==='emploi'?'Salaire':'Budget' ?>:</b> <?= htmlspecialchars($a['budget']) ?></p><?php endif; ?>
          <p style="font-size:.8rem;color:#94a3b8;margin-top:.5rem">Par <?= htmlspecialchars($a['auteurNom']??'Membre') ?> · <?= htmlspecialchars(date('d/m/Y', strtotime($a['creeLe']))) ?></p>
        </div>
        <?php endforeach; ?>
      </div>
      <?php endif; ?>
    </div>
  </section>

  <section class="appel appel--accueil">
    <div class="conteneur appel__inner">
      <div><p class="section__sur">UNE IDÉE À CONCRÉTISER ?</p><h2 class="appel__titre">Construisons la suite, <em>ensemble.</em></h2><p class="appel__texte">Vous portez un projet, recherchez une expertise technique ou envisagez un partenariat ? Échangeons sur vos objectifs, les ressources nécessaires et les prochaines étapes pour avancer ensemble.</p></div>
      <a class="btn btn--accent" href="#contact">Discuter de mon projet <span aria-hidden="true">↗</span></a>
    </div>
  </section>

  <!-- =============================== CONTACT ============================ -->
  <section class="section" id="contact">
    <div class="conteneur">
      <div class="section__entete">
        <p class="section__sur">PARLONS DE VOTRE PROJET <span class="section__trait"></span> 06</p>
        <h2 class="section__titre" id="contact-titre">Votre projet commence <em>ici.</em></h2>
        <p class="section__texte" id="contact-soustitre">Un besoin à résoudre, un projet à développer ou une collaboration à proposer ? Présentez vos objectifs, votre localisation et votre calendrier pour préparer un premier échange utile.</p>
      </div>

      <div class="grille-contact">
        <div class="contact-infos">
          <div class="info-bloc">
            <div class="info-bloc__icone">📍</div>
            <div><div class="info-bloc__titre">Adresse</div><div class="info-bloc__valeur" data-champ="adresse">Avenue du Lac, Goma, Nord-Kivu, RDC</div></div>
          </div>
          <div class="info-bloc">
            <div class="info-bloc__icone">📞</div>
            <div><div class="info-bloc__titre">Téléphone</div><a class="info-bloc__valeur" data-champ="telephone" data-lien="tel" href="tel:+243976459970">+243 976 459 970</a></div>
          </div>
          <div class="info-bloc">
            <div class="info-bloc__icone">✉️</div>
            <div><div class="info-bloc__titre">E-mail</div><a class="info-bloc__valeur" data-champ="email" data-lien="mailto" href="mailto:contact@linksmartec.com">contact@linksmartec.com</a></div>
          </div>
          <div class="info-bloc">
            <div class="info-bloc__icone">🌐</div>
            <div><div class="info-bloc__titre">Site web</div><div class="info-bloc__valeur"><a data-champ="siteWeb" data-lien="web" href="https://www.linksmartec.com">www.linksmartec.com</a></div></div>
          </div>
          <div class="info-bloc">
            <div class="info-bloc__icone">🕒</div>
            <div><div class="info-bloc__titre">Horaires</div><div class="info-bloc__valeur" data-champ="horaires">Lundi – Samedi : 08h00 – 18h00</div></div>
          </div>
        </div>

        <form class="formulaire" id="formulaire-contact" novalidate>
          <div class="alerte alerte--succes" id="contact-succes" role="status"></div>
          <div class="alerte alerte--erreur" id="contact-erreur" role="alert"></div>

          <div class="ligne-2">
            <div class="champ">
              <label for="c-nom">Nom complet *</label>
              <input id="c-nom" name="nom" type="text" autocomplete="name" required placeholder="Votre nom et prénom">
            </div>
            <div class="champ">
              <label for="c-email">E-mail *</label>
              <input id="c-email" name="email" type="email" autocomplete="email" required placeholder="vous@exemple.com">
            </div>
          </div>

          <div class="ligne-2">
            <div class="champ">
              <label for="c-tel">Téléphone</label>
              <input id="c-tel" name="telephone" type="tel" autocomplete="tel" placeholder="+243 …">
            </div>
            <div class="champ">
              <label for="c-sujet">Spécialité concernée</label>
              <select id="c-sujet" name="sujet">
                <option value="Informatique &amp; digital">Informatique &amp; digital</option>
                <option value="Génie Civil">Génie Civil</option>
                <option value="Architecture &amp; Design">Architecture &amp; Design</option>
                <option value="Énergie renouvelable">Énergie renouvelable</option>
                <option value="Commande boutique">Commande boutique</option>
                <option value="Partenariat">Partenariat</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
          </div>

          <div class="champ">
            <label for="c-message">Message *</label>
            <textarea id="c-message" name="message" rows="5" required placeholder="Décrivez votre besoin…"></textarea>
          </div>

          <button class="btn btn--bloc" type="submit" id="contact-envoyer">Envoyer le message</button>
          <p style="margin:0;font-size:.78rem;color:var(--ardoise-500)">Vos données servent uniquement à vous répondre.</p>
        </form>
      </div>
    </div>
  </section>


  <!-- =================== TRAVAILLER AVEC NOUS ========================= -->
  <section class="section section--gris" id="travailler-avec-nous">
    <div class="conteneur">
      <div class="section__entete">
        <p class="section__sur">CARRIÈRES &amp; COLLABORATIONS <span class="section__trait"></span> 07</p>
        <h2 class="section__titre">Travailler <em>avec nous</em></h2>
        <p class="section__texte" id="tw-soustitre">Envie de construire, concevoir, coder ou électrifier l’avenir avec nous ? Rejoignez LK-TECH à Goma.</p>
      </div>

      <div class="cand-avantages" id="tw-avantages" style="margin-bottom:1.5rem;">
        <article class="cand-avantage">
          <div class="cand-avantage__icone" aria-hidden="true">🏗️</div>
          <h3>Projets d’impact</h3>
          <p>Participez à des chantiers, aménagements et solutions numériques qui transforment Goma et l’Est de la RDC.</p>
        </article>
        <article class="cand-avantage">
          <div class="cand-avantage__icone" aria-hidden="true">💡</div>
          <h3>Équipe pluridisciplinaire</h3>
          <p>Collaborez au quotidien avec des ingénieurs civils, architectes, développeurs et spécialistes solaires.</p>
        </article>
        <article class="cand-avantage">
          <div class="cand-avantage__icone" aria-hidden="true">🌱</div>
          <h3>Évolution continue</h3>
          <p>Emploi CDI/CDD, stage académique ou professionnel, mission freelance et partenariat technique sur nos 4 pôles.</p>
        </article>
      </div>

      <div class="cand-poles">
        <article class="cand-pole">
          <div>
            <div class="cand-pole__entete">
              <span class="cand-pole__num">PÔLE 01</span>
              <span class="cand-pole__icone" aria-hidden="true">🏗️</span>
            </div>
            <h3>Génie Civil &amp; BTP</h3>
            <p>Études d’exécution, conduite de travaux, suivi de chantier et réhabilitation d’ouvrages.</p>
            <div class="cand-tags"><span class="cand-tag">Ingénieur BTP</span><span class="cand-tag">Chef de chantier</span><span class="cand-tag">Métreur</span></div>
          </div>
          <div class="cand-pole__pied">
            <a class="cand-pole__action" href="<?= $base ?>/travailler-avec-nous.php?domaine=G%C3%A9nie%20Civil#candidature">Postuler dans ce pôle <span aria-hidden="true">→</span></a>
          </div>
        </article>

        <article class="cand-pole">
          <div>
            <div class="cand-pole__entete">
              <span class="cand-pole__num">PÔLE 02</span>
              <span class="cand-pole__icone" aria-hidden="true">📐</span>
            </div>
            <h3>Architecture &amp; Design</h3>
            <p>Conception architecturale, plans 2D/3D, modélisation BIM et design d’espaces intérieurs.</p>
            <div class="cand-tags"><span class="cand-tag">Architecte</span><span class="cand-tag">Projeteur 3D / BIM</span><span class="cand-tag">Designer</span></div>
          </div>
          <div class="cand-pole__pied">
            <a class="cand-pole__action" href="<?= $base ?>/travailler-avec-nous.php?domaine=Architecture%20%26%20Design#candidature">Postuler dans ce pôle <span aria-hidden="true">→</span></a>
          </div>
        </article>

        <article class="cand-pole">
          <div>
            <div class="cand-pole__entete">
              <span class="cand-pole__num">PÔLE 03</span>
              <span class="cand-pole__icone" aria-hidden="true">💻</span>
            </div>
            <h3>Informatique &amp; Digital</h3>
            <p>Développement web/mobile, logiciels de gestion, administration systèmes, réseaux et cybersécurité.</p>
            <div class="cand-tags"><span class="cand-tag">Développeur Full-Stack</span><span class="cand-tag">Réseaux &amp; Cloud</span><span class="cand-tag">Support IT</span></div>
          </div>
          <div class="cand-pole__pied">
            <a class="cand-pole__action" href="<?= $base ?>/travailler-avec-nous.php?domaine=Informatique#candidature">Postuler dans ce pôle <span aria-hidden="true">→</span></a>
          </div>
        </article>

        <article class="cand-pole">
          <div>
            <div class="cand-pole__entete">
              <span class="cand-pole__num">PÔLE 04</span>
              <span class="cand-pole__icone" aria-hidden="true">☀️</span>
            </div>
            <h3>Énergie Renouvelable</h3>
            <p>Dimensionnement solaire photovoltaïque, systèmes hybrides, installation électrique et maintenance.</p>
            <div class="cand-tags"><span class="cand-tag">Technicien Solaire PV</span><span class="cand-tag">Électricien</span><span class="cand-tag">Ingénieur énergie</span></div>
          </div>
          <div class="cand-pole__pied">
            <a class="cand-pole__action" href="<?= $base ?>/travailler-avec-nous.php?domaine=%C3%89nergie%20renouvelable#candidature">Postuler dans ce pôle <span aria-hidden="true">→</span></a>
          </div>
        </article>
      </div>

      <div class="cand-accueil-cta">
        <div>
          <h3>Prêt à rejoindre l’aventure LK-TECH ?</h3>
          <p>Accédez à notre espace recrutement complet pour découvrir notre processus et déposer votre dossier en 3 étapes.</p>
        </div>
        <div class="cand-accueil-cta__actions">
          <a class="btn btn--accent" href="<?= $base ?>/travailler-avec-nous.php#candidature">Déposer ma candidature <span aria-hidden="true">↗</span></a>
          <a class="btn btn--contour-clair" href="tel:+243976459970">📞 +243 976 459 970</a>
        </div>
      </div>
    </div>
  </section>

  </main>

  <!-- =============================== PIED =============================== -->

  <?php require __DIR__ . '/app/partials/footer.php'; ?>

  <!-- =============================== PANIER ============================= -->
  <div class="voile" id="voile"></div>
  <aside class="panier" id="panier" role="dialog" aria-modal="true" aria-label="Panier" aria-hidden="true" inert>
    <div class="panier__entete">
      <h2 class="panier__titre">Votre panier</h2>
      <button class="panier__fermer" id="panier-fermer" aria-label="Fermer le panier">×</button>
    </div>
    <div class="panier__liste" id="panier-liste"></div>
    <div class="panier__pied">
      <div class="panier__total"><span>Total</span><span id="panier-total">$0.00</span></div>
      <a class="btn btn--accent btn--bloc" id="panier-commander" href="#contact">Commander via WhatsApp</a>
      <button class="btn btn--fantome btn--bloc btn--petit" id="panier-vider">Vider le panier</button>
    </div>
  </aside>

    <!-- Barre d'appel rapide (mobile) -->
  <div class="barre-appel" aria-label="Actions rapides">
    <a class="barre-appel__btn barre-appel__btn--tel" href="tel:+243976459970">📞 Appeler</a>
    <a class="barre-appel__btn barre-appel__btn--cta" href="<?= $base ?>/travailler-avec-nous.php">Travailler avec nous ↗</a>
  </div>

  <div class="toast" id="toast" role="status" aria-live="polite"></div>

  <script>window.LK_BASE = "<?= $base ?>";</script>
  <script>window.LK_SECOURS = "<?= $base ?>/assets/data/site.json";</script>
  <script src="<?= $base ?>/assets/i18n/traductions.js?v=20261126"></script>
  <script src="<?= $base ?>/assets/js/site.js?v=20261126"></script>
  <script src="<?= $base ?>/assets/js/candidature.js?v=20261126"></script>
</body>
</html>
