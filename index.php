<?php
/**
 * Linkstech — page d'accueil
 * Version PHP : fonctionne sur tout hébergement classique (cPanel, Apache, Nginx).
 *
 * @package Linkstech
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
  <title>Linkstech | Construire. Digitaliser. Impacter. — RDC · Kenya · Canada</title>
  <meta name="description" content="Linkstech développe des solutions de construction et de technologie et facilite les connexions commerciales à l'échelle internationale. Basée en RDC, au Kenya et au Canada.">
  <meta name="theme-color" content="#16233F">
  <meta property="og:title" content="Linkstech — Construire. Digitaliser. Impacter.">
  <meta property="og:description" content="Nous connectons les services aux clients, les marchés aux entreprises. Construction, technologie, connexions et impact.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://www.linksmartec.com/">
  <meta property="og:site_name" content="Linkstech">
  <link rel="canonical" href="https://www.linksmartec.com/">
  <link rel="icon" type="image/svg+xml" href="<?= $base ?>/assets/img/favicon.svg" id="favicon">
  <link rel="apple-touch-icon" href="<?= $base ?>/assets/img/logo.svg">
  <link rel="stylesheet" href="<?= $base ?>/assets/css/styles.css">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Linkstech",
    "url": "https://www.linksmartec.com",
    "email": "contact@linksmartec.com",
    "telephone": "+243 976 459 970",
    "description": "Solutions de construction et de technologie, connexions commerciales à l'échelle internationale.",
    "areaServed": ["République Démocratique du Congo", "Kenya", "Canada"],
    "knowsAbout": ["Construction", "Génie civil", "Développement logiciel", "Énergies renouvelables", "Connexions aux marchés"]
  }
  </script>
</head>
<body>

  <div class="bandeau-info" id="bandeau-maintenance" hidden>
    Site en cours de maintenance — certaines fonctions peuvent être momentanément indisponibles.
  </div>

  <!-- ============================== TOPBAR ============================== -->
  <div class="topbar">
    <div class="conteneur topbar__inner">
      <span class="topbar__rccm" data-champ="rccm">RCCM : CD-GOM-01-2024-A-002698</span>
      <div class="topbar__infos">
        <span data-champ="ville">📍 RDC · Kenya · Canada</span>
        <a class="topbar__tel" data-champ="telephone" data-lien="tel" href="tel:+243976459970">📞 +243 976 459 970</a>
      </div>
    </div>
  </div>

  <!-- =============================== ENTÊTE ============================= -->
  <header class="entete">
    <div class="conteneur entete__inner">
      <a class="marque" href="#accueil" aria-label="Accueil Linkstech">
        <img class="marque__logo" id="logo-entete" src="<?= $base ?>/assets/img/logo.svg" alt="Logo Linkstech">
        <span class="marque__texte">
          <span class="marque__nom" id="nom-entete">Linkstech</span>
          <span class="marque__slogan" id="slogan-entete">Construire. Digitaliser. Impacter.</span>
        </span>
      </a>

      <nav class="nav" id="nav">
        <a class="nav__lien" href="#accueil">Accueil</a>
        <a class="nav__lien" href="#specialites">Spécialités</a>
        <a class="nav__lien" href="#boutique">Boutique</a>
        <a class="nav__lien" href="#realisations">Réalisations</a>
        <a class="nav__lien" href="#services">Expertises</a>
        <a class="nav__lien" href="<?= $base ?>/a-propos">À propos</a>
        <a class="nav__lien" href="#contact">Contact</a>
      </nav>

      <div class="entete__actions">
        <button class="btn btn--fantome btn--petit panier-btn" id="btn-panier" aria-label="Ouvrir le panier">
          🛒 Panier
          <span class="panier-btn__compteur" id="panier-compteur" hidden>0</span>
        </button>
        <a class="btn btn--petit" id="btn-portail" href="#contact">Être mis en relation</a>
        <button class="burger" id="burger" aria-label="Ouvrir le menu" aria-expanded="false">☰</button>
      </div>
    </div>
  </header>

  <!-- ======================= RUBAN DES SPÉCIALITÉS ====================== -->
  <div class="ruban">
    <div class="conteneur ruban__inner">
      <span class="ruban__intro">Nos spécialités</span>
      <div class="ruban__liste" id="ruban-specialites"></div>
    </div>
  </div>

  <!-- ================================ HERO ============================== -->
  <section class="hero" id="accueil">
    <div class="conteneur hero__inner">
      <div class="onglets" id="onglets-hero" role="tablist">
        <button class="onglet actif" role="tab" data-onglet="connexions">Connexions &amp; marchés</button>
        <button class="onglet" role="tab" data-onglet="construction">Construction</button>
        <button class="onglet" role="tab" data-onglet="informatique">Technologie</button>
        <button class="onglet" role="tab" data-onglet="energie">Énergie</button>
      </div>

      <div class="hero__grille">
        <div>
          <span class="badge-pilule" id="hero-badge">Notre promesse</span>
          <h1 class="hero__titre" id="hero-titre">Nous connectons <span class="accent">services et marchés</span>.</h1>
          <p class="hero__texte" id="hero-texte">Basée en RDC, au Kenya et au Canada, Linkstech développe des solutions de construction et de technologie et facilite les connexions commerciales à l'échelle internationale.</p>
          <div class="hero__boutons">
            <a class="btn btn--accent" id="hero-bouton" href="#contact">Être mis en relation</a>
            <a class="btn btn--fantome" href="#realisations" style="--btn-texte:#fff;border-color:rgba(255,255,255,.35)">Voir les réalisations</a>
          </div>
          <div class="hero__stats">
            <div class="hero__stat"><strong>04</strong><span>Pôles d'expertise</span></div>
            <div class="hero__stat"><strong>06+</strong><span>Solutions réalisées</span></div>
            <div class="hero__stat"><strong>Global</strong><span>Notre ambition</span></div>
          </div>
        </div>

        <div>
          <article class="fiche-produit" id="fiche-vedette">
            <img class="fiche-produit__img" id="vedette-img" src="<?= $base ?>/assets/img/produits/ordinateur.jpg" alt="Produit vedette">
            <div class="fiche-produit__corps">
              <h3 class="fiche-produit__titre" id="vedette-nom">Ordinateur portable professionnel</h3>
              <p class="fiche-produit__desc" id="vedette-desc">Core i5 / 16 Go / SSD 512 Go — configuré et garanti 1 an.</p>
              <div class="fiche-produit__pied">
                <span class="fiche-produit__prix" id="vedette-prix">$780.00</span>
                <button class="btn btn--accent btn--petit" id="vedette-ajouter">Ajouter au panier</button>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>

  <!-- ============================ SPÉCIALITÉS =========================== -->
  <section class="section" id="specialites">
    <div class="conteneur">
      <div class="section__entete">
        <p class="section__sur">Nos quatre pôles</p>
        <h2 class="section__titre">Construction · Technologie · Connexions · Impact</h2>
        <p class="section__texte">Quatre pôles complémentaires, une même exigence : construire, digitaliser, connecter et renforcer les capacités — de la RDC à l'international.</p>
      </div>
      <div class="grille-specialites" id="grille-specialites"></div>
    </div>
  </section>

  <!-- ============================== BOUTIQUE ============================ -->
  <section class="section section--gris" id="boutique">
    <div class="conteneur">
      <div class="section__entete">
        <p class="section__sur">Notre offre</p>
        <h2 class="section__titre" id="boutique-titre">Boutique</h2>
        <p class="section__texte" id="boutique-soustitre">Matériel informatique, solaire et produits du terroir</p>
      </div>

      <div class="filtres" id="filtres-boutique"></div>
      <div class="grille-produits" id="grille-produits"></div>
    </div>
  </section>

  <!-- ============================== SERVICES ============================ -->
  <section class="section" id="services">
    <div class="conteneur">
      <div class="section__entete">
        <p class="section__sur">Nos expertises</p>
        <h2 class="section__titre">Ce que nous faisons concrètement</h2>
      </div>
      <div class="grille-services" id="grille-services"></div>
    </div>
  </section>

  <!-- ============================ RÉALISATIONS =========================== -->
  <section class="section section--gris" id="realisations">
    <div class="conteneur">
      <div class="section__entete">
        <p class="section__sur">Réalisations sélectionnées</p>
        <h2 class="section__titre">Des projets qui parlent pour notre savoir-faire.</h2>
        <p class="section__texte">Digital, construction ou connexions : une sélection de réalisations représentatives de notre manière de travailler.</p>
      </div>
      <div class="filtres" id="filtres-realisations" role="group" aria-label="Filtrer les réalisations"></div>
      <div class="grille-realisations" id="grille-realisations"></div>
      <p class="section__texte" style="margin-top:2rem"><a class="lien-ancre" href="#contact">Vous avez un projet similaire ? Parlons-en →</a></p>
    </div>
  </section>

  <!-- ============================== APPROCHE ============================ -->
  <section class="section" id="approche">
    <div class="conteneur">
      <div class="section__entete">
        <p class="section__sur">Méthode</p>
        <h2 class="section__titre" id="approche-titre">Notre Approche</h2>
        <p class="section__texte" id="approche-soustitre">Une méthode éprouvée, du diagnostic à la pérennisation</p>
      </div>
      <div class="grille-etapes" id="grille-etapes"></div>
    </div>
  </section>

  <!-- =============================== CONTACT ============================ -->
  <section class="section" id="contact">
    <div class="conteneur">
      <div class="section__entete">
        <p class="section__sur">Écrivez-nous</p>
        <h2 class="section__titre" id="contact-titre">Votre connexion commence ici</h2>
        <p class="section__texte" id="contact-soustitre">Trouvez le bon service, le bon client ou le bon marché</p>
      </div>

      <div class="grille-contact">
        <div class="contact-infos">
          <div class="info-bloc">
            <div class="info-bloc__icone">📍</div>
            <div><div class="info-bloc__titre">Adresse</div><div class="info-bloc__valeur" data-champ="adresse">Avenue du Lac, Goma, Nord-Kivu, RDC</div></div>
          </div>
          <div class="info-bloc">
            <div class="info-bloc__icone">📞</div>
            <div><div class="info-bloc__titre">Téléphone</div><div class="info-bloc__valeur" data-champ="telephone">+243 976 459 970</div></div>
          </div>
          <div class="info-bloc">
            <div class="info-bloc__icone">✉️</div>
            <div><div class="info-bloc__titre">E-mail</div><div class="info-bloc__valeur" data-champ="email">contact@linksmartec.com</div></div>
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
          <div class="alerte alerte--succes" id="contact-succes"></div>
          <div class="alerte alerte--erreur" id="contact-erreur"></div>

          <div class="ligne-2">
            <div class="champ">
              <label for="c-nom">Nom complet *</label>
              <input id="c-nom" name="nom" type="text" required placeholder="Ex. Fabrice Nzarubara">
            </div>
            <div class="champ">
              <label for="c-email">E-mail *</label>
              <input id="c-email" name="email" type="email" required placeholder="vous@exemple.com">
            </div>
          </div>

          <div class="ligne-2">
            <div class="champ">
              <label for="c-tel">Téléphone</label>
              <input id="c-tel" name="telephone" type="tel" placeholder="+243 …">
            </div>
            <div class="champ">
              <label for="c-sujet">Service recherché</label>
              <select id="c-sujet" name="sujet">
                <option>Construction &amp; Génie civil</option>
                <option>Solutions informatiques</option>
                <option>Études &amp; accompagnement</option>
                <option>Digitalisation d'entreprise</option>
                <option>Connexion aux marchés &amp; services</option>
                <option>ONG, associations &amp; bailleurs de fonds</option>
                <option>Outils de suivi &amp; réalisation</option>
                <option>Encadrement &amp; formation</option>
                <option>Création d'entreprises &amp; startups</option>
                <option>Commande boutique</option>
                <option>Autre demande</option>
              </select>
            </div>
          </div>

          <div class="champ">
            <label for="c-message">Message *</label>
            <textarea id="c-message" name="message" rows="5" required placeholder="Décrivez-nous votre besoin…"></textarea>
          </div>

          <button class="btn btn--bloc" type="submit" id="contact-envoyer">Envoyer le message</button>
          <p style="margin:0;font-size:.78rem;color:var(--ardoise-500)">Vos données servent uniquement à vous répondre.</p>
        </form>
      </div>
    </div>
  </section>

  <!-- =============================== PIED =============================== -->
  <footer class="pied">
    <div class="conteneur">
      <div class="pied__grille">
        <div>
          <img class="pied__logo" id="logo-pied" src="<?= $base ?>/assets/img/logo-clair.svg" alt="Logo Linkstech">
          <div class="pied__nom" id="nom-pied">Linkstech</div>
          <p class="pied__texte" id="pied-description">Linkstech développe des solutions de construction et de technologie et facilite les connexions commerciales à l'échelle internationale. Nous accompagnons entreprises, ONG, institutions et porteurs de startups, de l'étude à la réalisation.</p>
        </div>
        <div>
          <h4 class="pied__titre">Navigation</h4>
          <div class="pied__liens">
            <a href="#accueil">Accueil</a>
            <a href="#specialites">Spécialités</a>
            <a href="#boutique">Boutique</a>
            <a href="#services">Expertises</a>
            <a href="#realisations">Réalisations</a>
            <a href="<?= $base ?>/a-propos">À propos</a>
            <a href="#contact">Contact</a>
          </div>
        </div>
        <div>
          <h4 class="pied__titre">Nos pôles</h4>
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
        <span id="pied-copyright">© 2026 Linkstech — Tous droits réservés.</span>
        <span>RDC · Kenya · Canada</span>
      </div>
    </div>
  </footer>

  <!-- =============================== PANIER ============================= -->
  <div class="voile" id="voile"></div>
  <aside class="panier" id="panier" aria-label="Panier" aria-hidden="true">
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

  <div class="toast" id="toast" role="status" aria-live="polite"></div>

  <script>window.LK_BASE = "<?= $base ?>";</script>
  <script>window.LK_SECOURS = "<?= $base ?>/assets/data/site.json";</script>
  <script src="<?= $base ?>/assets/js/site.js"></script>
</body>
</html>
