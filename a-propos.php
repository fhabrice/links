<?php
/**
 * LK-TECH (Linksmartech) — page « À propos »
 * Version PHP : fonctionne sur tout hébergement classique (cPanel, Apache, Nginx).
 *
 * @package LK-TECH
 */

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';

$base = base_url();
$contenu = lk_store()->contenu();
$identite = $contenu['identite'] ?? [];
$reglages = lk_store()->reglages();
?>
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>À propos | LK-TECH — Construire. Digitaliser. Impacter.</title>
  <meta name="description" content="LK-TECH (Linksmartech) : un seul partenaire, quatre expertises fortes. Présent en RDC, au Kenya et au Canada — mission, vision, valeurs et pôles de compétences.">
  <meta name="theme-color" content="#16233F">
  <meta property="og:title" content="À propos de LK-TECH">
  <meta property="og:description" content="Un seul partenaire. Quatre expertises fortes — LK-TECH, de la RDC à l'international.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://www.linksmartec.com/a-propos.php">
  <link rel="canonical" href="https://www.linksmartec.com/a-propos.php">
  <link rel="icon" type="image/svg+xml" href="<?= $base ?>/assets/img/favicon.svg" id="favicon">
  <link rel="apple-touch-icon" href="<?= $base ?>/assets/img/logo.svg">
  <link rel="stylesheet" href="<?= $base ?>/assets/css/styles.css">
</head>
<body>

  <!-- ============================== TOPBAR ============================== -->
  <div class="topbar">
    <div class="conteneur topbar__inner">
      <span class="topbar__rccm" data-champ="rccm">RCCM : CD-GOM-01-2024-A-002698</span>
      <div class="topbar__infos">
        <span data-champ="ville">📍 Goma, RDC</span>
        <a class="topbar__tel" data-champ="telephone" data-lien="tel" href="tel:+243976459970">📞 +243 976 459 970</a>
      </div>
    </div>
  </div>

  <!-- =============================== ENTÊTE ============================= -->
  <header class="entete">
    <div class="conteneur entete__inner">
      <a class="marque" href="<?= $base ?>/" aria-label="Accueil LK-TECH">
        <img class="marque__logo" id="logo-entete" src="<?= $base ?>/assets/img/logo.svg" alt="Logo LK-TECH">
        <span class="marque__texte">
          <span class="marque__nom" id="nom-entete">LK<i class="tiret">-</i>TECH</span>
          <span class="marque__slogan" id="slogan-entete">Informatique · Construction · Énergie renouvelable</span>
        </span>
      </a>

      <nav class="nav" id="nav">
        <a class="nav__lien" href="<?= $base ?>/">Accueil</a>
        <a class="nav__lien" href="<?= $base ?>/#specialites">Spécialités</a>
        <a class="nav__lien" href="<?= $base ?>/#boutique">Boutique</a>
        <a class="nav__lien" href="<?= $base ?>/#services">Services</a>
        <a class="nav__lien" href="<?= $base ?>/a-propos" style="color:var(--primaire)">À propos</a>
        <a class="nav__lien" href="<?= $base ?>/#contact">Contact</a>
      </nav>

      <div class="entete__actions">
        <a class="btn btn--accent btn--petit" href="<?= $base ?>/#contact">Devis gratuit</a>
        <button class="burger" id="burger" aria-label="Ouvrir le menu" aria-expanded="false">☰</button>
      </div>
    </div>
  </header>

  <!-- ========================= EN-TÊTE DE PAGE ========================== -->
  <section class="page-entete">
    <div class="conteneur">
      <nav class="fil-ariane" aria-label="Fil d'Ariane">
        <a href="<?= $base ?>/">Accueil</a> <span aria-hidden="true">›</span> <span>À propos</span>
      </nav>
      <p class="section__sur" id="apropos-sur">Notre entreprise</p>
      <h1 class="page-entete__titre" id="apropos-titre">À propos de LK-TECH</h1>
      <p class="page-entete__texte" id="apropos-soustitre">Un seul partenaire. Quatre expertises fortes.</p>
    </div>
  </section>

  <!-- ========================== PRÉSENTATION =========================== -->
  <section class="section">
    <div class="conteneur">
      <div class="grille-presentation">
        <div id="apropos-intro"></div>
        <figure class="presentation-figure">
          <img id="apropos-image" src="<?= $base ?>/assets/img/vedette-construction.jpg" alt="Équipes LK-TECH sur un chantier à Goma">
          <figcaption>Goma, Nord-Kivu — études, réalisation et maintenance.</figcaption>
        </figure>
      </div>
    </div>
  </section>

  <!-- ============================= CHIFFRES ============================ -->
  <section class="bande-chiffres">
    <div class="conteneur">
      <div class="grille-chiffres" id="apropos-chiffres"></div>
    </div>
  </section>

  <!-- ========================= LES TROIS PILIERS ======================= -->
  <section class="section">
    <div class="conteneur">
      <div class="section__entete">
        <p class="section__sur">Ce que nous maîtrisons</p>
        <h2 class="section__titre">Nos trois spécialités</h2>
      </div>
      <div class="grille-piliers" id="apropos-piliers"></div>
    </div>
  </section>

  <!-- ========================== MISSION / VISION ======================= -->
  <section class="section section--gris">
    <div class="conteneur">
      <div class="grille-2-colonnes">
        <article class="carte-mission">
          <span class="carte-mission__etiquette">Notre mission</span>
          <p id="apropos-mission">…</p>
        </article>
        <article class="carte-mission carte-mission--accent">
          <span class="carte-mission__etiquette">Notre vision</span>
          <p id="apropos-vision">…</p>
        </article>
      </div>
    </div>
  </section>

  <!-- ============================= VALEURS ============================= -->
  <section class="section">
    <div class="conteneur">
      <div class="section__entete">
        <p class="section__sur">Ce qui nous guide</p>
        <h2 class="section__titre">Nos valeurs</h2>
      </div>
      <div class="grille-valeurs" id="apropos-valeurs"></div>
    </div>
  </section>

  <!-- ============================ HISTORIQUE =========================== -->
  <section class="section section--gris">
    <div class="conteneur">
      <div class="section__entete">
        <p class="section__sur">Notre parcours</p>
        <h2 class="section__titre">Quelques étapes</h2>
      </div>
      <div class="frise" id="apropos-histoire"></div>
    </div>
  </section>

  <!-- ========================== POURQUOI NOUS ========================== -->
  <section class="section">
    <div class="conteneur">
      <div class="section__entete">
        <p class="section__sur">Travailler avec nous</p>
        <h2 class="section__titre">Pourquoi nous choisir</h2>
      </div>
      <div class="grille-raisons" id="apropos-raisons"></div>
    </div>
  </section>

  <!-- =============================== CTA ============================== -->
  <section class="appel">
    <div class="conteneur appel__inner">
      <div>
        <h2 class="appel__titre" id="apropos-cta-titre">Un projet en tête ?</h2>
        <p class="appel__texte" id="apropos-cta-texte">Décrivez-nous votre besoin : nous revenons vers vous avec une proposition claire.</p>
      </div>
      <div class="appel__actions">
        <a class="btn btn--accent" id="apropos-cta-bouton" href="<?= $base ?>/#contact">Demander un devis</a>
        <a class="btn btn--fantome" id="apropos-cta-appel" data-champ="telephone" data-lien="tel" href="tel:+243976459970" style="--btn-texte:#fff;border-color:rgba(255,255,255,.35)">📞 Nous appeler</a>
      </div>
    </div>
  </section>

  <!-- =============================== PIED =============================== -->
  <footer class="pied">
    <div class="conteneur">
      <div class="pied__grille">
        <div>
          <img class="pied__logo" id="logo-pied" src="<?= $base ?>/assets/img/logo-clair.svg" alt="Logo LK-TECH">
          <div class="pied__nom" id="nom-pied">LK<i class="tiret">-</i>TECH</div>
          <p class="pied__texte" id="pied-description">LK-TECH (Linksmartech) développe des solutions de construction et de technologie et facilite les connexions commerciales à l'échelle internationale. Nous accompagnons entreprises, ONG, institutions et porteurs de startups, de l'étude à la réalisation.</p>
        </div>
        <div>
          <h4 class="pied__titre">Navigation</h4>
          <div class="pied__liens">
            <a href="<?= $base ?>/">Accueil</a>
            <a href="<?= $base ?>/#boutique">Boutique</a>
            <a href="<?= $base ?>/#services">Services</a>
            <a href="<?= $base ?>/a-propos">À propos</a>
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
            <a data-champ="siteWeb" data-lien="web" href="https://www.linksmartec.com">www.linksmartec.com</a>
            <span data-champ="rccm">RCCM : CD-GOM-01-2024-A-002698</span>
          </div>
          <div class="pied__liens" id="reseaux-sociaux" style="margin-top:1rem"></div>
        </div>
      </div>
      <div class="pied__bas">
        <span id="pied-copyright">© 2026 LK-TECH — Tous droits réservés.</span>
        <span>Conçu à Goma 🇨🇩</span>
      </div>
    </div>
  </footer>

  <div class="toast" id="toast" role="status" aria-live="polite"></div>

  <script>window.LK_BASE = "<?= $base ?>";</script>
  <script>window.LK_SECOURS = "<?= $base ?>/assets/data/site.json";</script>
  <script src="<?= $base ?>/assets/js/site.js"></script>
</body>
</html>
