<?php
/**
 * LK-TECH (Linksmartech) — page « Travailler avec nous » (Recrutement & Collaborations)
 * Version PHP : fonctionne sur tout hébergement classique (cPanel, Apache, Nginx).
 *
 * @package LK-TECH
 */

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';

$base = base_url();
$contenu = lk_store()->contenu();
$identite = $contenu['identite'] ?? [];
$tw = $contenu['travaillerAvecNous'] ?? [];
$gform = $tw['googleForm'] ?? [];

$telephoneBrut = (string) ($identite['telephone'] ?? '+243 976 459 970');
$telephoneLien = preg_replace('/[^+\d]/', '', $telephoneBrut) ?: '+243976459970';
$emailContact = (string) ($identite['email'] ?? 'contact@linksmartec.com');
$villeContact = (string) ($identite['ville'] ?? 'Goma, Nord-Kivu, RDC');

$avantages = !empty($tw['avantages']) && is_array($tw['avantages']) ? $tw['avantages'] : [
    [
        'icone' => '🏗️',
        'titre' => 'Projets d’impact concret',
        'texte' => 'Participez à des chantiers, infrastructures et solutions numériques qui transforment durablement Goma et l’Est de la RDC.',
    ],
    [
        'icone' => '💡',
        'titre' => 'Équipe pluridisciplinaire',
        'texte' => 'Collaborez au quotidien avec des ingénieurs civils, architectes, développeurs logiciels et spécialistes en énergie solaire.',
    ],
    [
        'icone' => '🌱',
        'titre' => 'Progression & mentorat',
        'texte' => 'Bénéficiez d’un encadrement technique rigoureux, de formations terrain et de perspectives d’évolution au sein de nos 4 pôles.',
    ],
];

$polesRecrutement = [
    [
        'num' => 'PÔLE 01',
        'icone' => '🏗️',
        'valeur' => 'Génie Civil',
        'titre' => 'Génie Civil & BTP',
        'texte' => 'Études techniques, dimensionnement d’ouvrages, suivi d’exécution, gros œuvre, second œuvre et réhabilitation de bâtiments.',
        'profils' => ['Ingénieur civil', 'Conducteur de travaux', 'Chef de chantier', 'Métreur / Technicien BTP'],
    ],
    [
        'num' => 'PÔLE 02',
        'icone' => '📐',
        'valeur' => 'Architecture & Design',
        'titre' => 'Architecture & Design',
        'texte' => 'Conception architecturale bioclimatique, plans 2D/3D, modélisation BIM, aménagement intérieur et maîtrise d’œuvre esthétique.',
        'profils' => ['Architecte', 'Projeteur 3D / BIM', 'Designer d’intérieur', 'Dessinateur bâtiment'],
    ],
    [
        'num' => 'PÔLE 03',
        'icone' => '💻',
        'valeur' => 'Informatique',
        'titre' => 'Informatique & Solutions Digitales',
        'texte' => 'Développement d’applications web/mobiles et progiciels métiers, réseaux d’entreprise, serveurs, cloud et cybersécurité.',
        'profils' => ['Développeur Full-Stack', 'Ingénieur systèmes & réseaux', 'Technicien IT', 'UI/UX Designer'],
    ],
    [
        'num' => 'PÔLE 04',
        'icone' => '☀️',
        'valeur' => 'Énergie renouvelable',
        'titre' => 'Énergie Renouvelable & Électricité',
        'texte' => 'Audit énergétique, dimensionnement photovoltaïque, installation de systèmes solaires hybrides, autonomie et maintenance.',
        'profils' => ['Ingénieur énergéticien', 'Technicien solaire PV', 'Électricien bâtiment', 'Chargé de maintenance'],
    ],
];
?>
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Travailler avec nous | <?= htmlspecialchars($identite['nom'] ?? 'LK-TECH', ENT_QUOTES, 'UTF-8') ?> — Carrières &amp; Recrutement</title>
  <meta name="description" content="Rejoignez LK-TECH à Goma : carrières, stages, freelances et partenariats en génie civil, architecture &amp; design, informatique et énergie renouvelable.">
  <meta name="theme-color" content="#16233F">
  <link rel="icon" type="image/svg+xml" href="<?= $base ?>/assets/img/favicon.svg">
  <link rel="apple-touch-icon" href="<?= $base ?>/assets/img/logo.svg">
  <link rel="stylesheet" href="<?= $base ?>/assets/css/styles.css?v=20261126">
  <link rel="stylesheet" href="<?= $base ?>/assets/css/refonte.css?v=20261126">
</head>
<body>
  <a class="lien-evitement" href="#contenu-principal">Aller au contenu</a>

  <!-- ============================== TOPBAR ============================== -->
  <div class="topbar">
    <div class="conteneur topbar__inner">
      <span class="topbar__rccm">GÉNIE CIVIL <span>·</span> ARCHITECTURE <span>·</span> TECHNOLOGIE <span>·</span> ÉNERGIE</span>
      <div class="topbar__infos">
        <span data-champ="ville"><?= htmlspecialchars($villeContact, ENT_QUOTES, 'UTF-8') ?></span>
        <a class="topbar__tel" data-champ="telephone" data-lien="tel" href="tel:<?= htmlspecialchars($telephoneLien, ENT_QUOTES, 'UTF-8') ?>"><?= htmlspecialchars($telephoneBrut, ENT_QUOTES, 'UTF-8') ?></a>
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
      <a class="marque" href="<?= $base ?>/" aria-label="Accueil LK-TECH">
        <img class="marque__logo" id="logo-entete" src="<?= $base ?>/assets/img/logo.svg" alt="Logo LK-TECH">
        <span class="marque__texte">
          <span class="marque__nom" id="nom-entete">LK<i class="tiret">-</i>TECH</span>
          <span class="marque__slogan">LINKS MARTECH</span>
        </span>
      </a>

      <nav class="nav" id="nav" aria-label="Navigation principale">
        <a class="nav__lien" href="<?= $base ?>/">Accueil</a>
        <a class="nav__lien" href="<?= $base ?>/#specialites">Expertises</a>
        <a class="nav__lien" href="<?= $base ?>/#services">Solutions</a>
        <a class="nav__lien" href="<?= $base ?>/#logiciels">Logiciels</a>
        <a class="nav__lien" href="<?= $base ?>/opportunites.php">Opportunités</a>
        <a class="nav__lien" href="<?= $base ?>/a-propos">À propos</a>
        <a class="nav__lien nav__lien--actif" href="#candidature" aria-current="page">Travailler avec nous</a>
        <a class="nav__lien" href="<?= $base ?>/#contact">Contact</a>
      </nav>

      <div class="entete__actions">
        <a class="btn btn--fantome btn--petit" href="tel:<?= htmlspecialchars($telephoneLien, ENT_QUOTES, 'UTF-8') ?>" title="Appeler LK-TECH">📞 Appeler</a>
        <a class="btn btn--accent btn--petit" href="#candidature">Postuler <span aria-hidden="true">↓</span></a>
        <button class="burger" id="burger" type="button" aria-label="Ouvrir le menu" aria-controls="nav" aria-expanded="false">☰</button>
      </div>
    </div>
  </header>

  <!-- ============================ CONTENU =============================== -->
  <main id="contenu-principal">

    <!-- 00 · HERO CARRIÈRES -->
    <section class="cand-hero">
      <div class="conteneur">
        <nav class="fil-ariane" aria-label="Fil d'Ariane">
          <a href="<?= $base ?>/">Accueil</a> <span aria-hidden="true">›</span> <span>Travailler avec nous</span>
        </nav>

        <div class="cand-hero__grille">
          <div>
            <span class="cand-badge"><?= htmlspecialchars($tw['surTitre'] ?? 'CARRIÈRES & COLLABORATIONS · GOMA, RDC', ENT_QUOTES, 'UTF-8') ?></span>
            <h1 class="cand-hero__titre">Construisez l’avenir <em>avec LK-TECH.</em></h1>
            <p class="cand-hero__soustitre"><?= htmlspecialchars($tw['soustitre'] ?? $tw['sousTitre'] ?? 'Envie de bâtir, concevoir, coder ou électrifier des projets durables ? Rejoignez nos équipes.', ENT_QUOTES, 'UTF-8') ?></p>
            <p class="cand-hero__texte"><?= htmlspecialchars($tw['texte'] ?? 'Nous recrutons régulièrement des talents en génie civil, architecture & design, informatique et énergie renouvelable. Que vous soyez jeune diplômé, ingénieur confirmé, stagiaire ou consultant freelance, déposez votre candidature en quelques minutes.', ENT_QUOTES, 'UTF-8') ?></p>

            <div class="cand-hero__actions">
              <a class="btn btn--accent" href="#candidature">Déposer ma candidature <span aria-hidden="true">↓</span></a>
              <a class="btn btn--contour-clair" href="#poles-recrutement">Découvrir nos 4 pôles <span aria-hidden="true">→</span></a>
            </div>
          </div>

          <aside class="cand-hero__carte" aria-label="Synthèse recrutement LK-TECH">
            <p class="cand-hero__carte-sur">ENGAGEMENT RH · LK-TECH</p>
            <h2>Pourquoi nous rejoindre ?</h2>
            <div class="cand-chiffres">
              <div class="cand-chiffre"><strong>4 pôles</strong><span>Métiers complémentaires</span></div>
              <div class="cand-chiffre"><strong>48 h</strong><span>Délai moyen d’analyse</span></div>
              <div class="cand-chiffre"><strong>4 formats</strong><span>CDI, Stage, Freelance, Partenariat</span></div>
              <div class="cand-chiffre"><strong>Goma</strong><span>Rayonnement Nord-Kivu &amp; RDC</span></div>
            </div>
            <ul class="cand-points">
              <li>Chantiers et projets numériques à fort impact local</li>
              <li>Encadrement par des ingénieurs et architectes expérimentés</li>
              <li>Culture de rigueur, d’innovation et de transparence</li>
              <li>Traitement confidentiel et retour personnalisé sur chaque dossier</li>
            </ul>
            <div class="cand-hero__carte-pied">
              <span aria-hidden="true">✉️</span>
              <span>Réception directe par notre cellule recrutement &amp; direction technique.</span>
            </div>
          </aside>
        </div>
      </div>
    </section>

    <!-- 01 · AVANTAGES -->
    <section class="section" id="avantages">
      <div class="conteneur">
        <div class="section__entete">
          <p class="section__sur">POURQUOI NOUS REJOINDRE <span class="section__trait"></span> 01</p>
          <h2 class="section__titre">Un environnement conçu pour faire grandir <em>vos compétences.</em></h2>
          <p class="section__texte">Chez LK-TECH, chaque collaborateur contribue directement à la réussite technique des ouvrages et solutions livrés à nos clients.</p>
        </div>

        <div class="cand-avantages">
          <?php foreach ($avantages as $av): ?>
            <article class="cand-avantage">
              <div class="cand-avantage__icone" aria-hidden="true"><?= htmlspecialchars($av['icone'] ?? '★', ENT_QUOTES, 'UTF-8') ?></div>
              <h3><?= htmlspecialchars($av['titre'] ?? '', ENT_QUOTES, 'UTF-8') ?></h3>
              <p><?= htmlspecialchars($av['texte'] ?? '', ENT_QUOTES, 'UTF-8') ?></p>
            </article>
          <?php endforeach; ?>
        </div>
      </div>
    </section>

    <!-- 02 · NOS 4 PÔLES QUI RECRUTENT -->
    <section class="section section--gris" id="poles-recrutement">
      <div class="conteneur">
        <div class="section__entete">
          <p class="section__sur">NOS DOMAINES DE RECRUTEMENT <span class="section__trait"></span> 02</p>
          <h2 class="section__titre">Quatre pôles d’excellence, <em>une même exigence.</em></h2>
          <p class="section__texte">Sélectionnez le pôle correspondant à votre spécialité pour pré-remplir directement votre formulaire de candidature.</p>
        </div>

        <div class="cand-poles">
          <?php foreach ($polesRecrutement as $pole): ?>
            <article class="cand-pole">
              <div>
                <div class="cand-pole__entete">
                  <span class="cand-pole__num"><?= htmlspecialchars($pole['num'], ENT_QUOTES, 'UTF-8') ?></span>
                  <span class="cand-pole__icone" aria-hidden="true"><?= htmlspecialchars($pole['icone'], ENT_QUOTES, 'UTF-8') ?></span>
                </div>
                <h3><?= htmlspecialchars($pole['titre'], ENT_QUOTES, 'UTF-8') ?></h3>
                <p><?= htmlspecialchars($pole['texte'], ENT_QUOTES, 'UTF-8') ?></p>
                <div class="cand-tags" aria-label="Profils recherchés">
                  <?php foreach ($pole['profils'] as $profil): ?>
                    <span class="cand-tag"><?= htmlspecialchars($profil, ENT_QUOTES, 'UTF-8') ?></span>
                  <?php endforeach; ?>
                </div>
              </div>
              <div class="cand-pole__pied">
                <a class="cand-pole__action" href="#candidature" data-choisir-domaine="<?= htmlspecialchars($pole['valeur'], ENT_QUOTES, 'UTF-8') ?>">
                  Postuler dans ce pôle <span aria-hidden="true">→</span>
                </a>
              </div>
            </article>
          <?php endforeach; ?>
        </div>
      </div>
    </section>

    <!-- 03 · MODES DE COLLABORATION & PROCESSUS -->
    <section class="section" id="processus">
      <div class="conteneur">
        <div class="section__entete">
          <p class="section__sur">PARCOURS CANDIDAT <span class="section__trait"></span> 03</p>
          <h2 class="section__titre">Un processus simple, <em>transparent et structuré.</em></h2>
          <p class="section__texte">Choisissez votre format de collaboration et suivez les quatre étapes clés de notre recrutement.</p>
        </div>

        <div class="cand-modes" aria-label="Modes de collaboration">
          <button type="button" class="cand-mode" data-choisir-type="Emploi">
            <span class="cand-mode__badge">Format 01</span>
            <strong>Emploi (CDI / CDD)</strong>
            <span>Intégrez durablement nos équipes techniques et projets structurants à Goma.</span>
          </button>
          <button type="button" class="cand-mode" data-choisir-type="Stage">
            <span class="cand-mode__badge">Format 02</span>
            <strong>Stage académique &amp; pro</strong>
            <span>Apprenez sur le terrain aux côtés de nos ingénieurs, architectes et développeurs.</span>
          </button>
          <button type="button" class="cand-mode" data-choisir-type="Freelance / Consultant">
            <span class="cand-mode__badge">Format 03</span>
            <strong>Freelance / Consultant</strong>
            <span>Intervenez sur des missions ciblées d’expertise, d’étude ou de développement.</span>
          </button>
          <button type="button" class="cand-mode" data-choisir-type="Partenariat">
            <span class="cand-mode__badge">Format 04</span>
            <strong>Partenariat technique</strong>
            <span>Unissons nos savoir-faire pour répondre ensemble à des marchés d’envergure.</span>
          </button>
        </div>

        <div class="cand-etapes">
          <article class="cand-etape">
            <span class="cand-etape__num">01</span>
            <h3>Dépôt du dossier</h3>
            <p>Remplissez le formulaire ci-dessous avec votre parcours, vos motivations et un lien vers votre CV ou portfolio.</p>
          </article>
          <article class="cand-etape">
            <span class="cand-etape__num">02</span>
            <h3>Analyse sous 48 h</h3>
            <p>Votre candidature est examinée conjointement par le responsable du pôle concerné et la direction.</p>
          </article>
          <article class="cand-etape">
            <span class="cand-etape__num">03</span>
            <h3>Entretien &amp; échange</h3>
            <p>Rencontre dans nos bureaux à Goma ou en visioconférence autour de vos réalisations et d’un cas concret.</p>
          </article>
          <article class="cand-etape">
            <span class="cand-etape__num">04</span>
            <h3>Intégration</h3>
            <p>Proposition claire, accueil au sein de l’équipe et démarrage accompagné sur nos outils et projets.</p>
          </article>
        </div>
      </div>
    </section>

    <!-- 04 · FORMULAIRE DE CANDIDATURE -->
    <section class="section section--gris" id="candidature">
      <div class="conteneur">
        <div class="section__entete">
          <p class="section__sur">DÉPOSER VOTRE DOSSIER <span class="section__trait"></span> 04</p>
          <h2 class="section__titre"><?= htmlspecialchars($tw['formulaire']['titre'] ?? 'Candidature complète', ENT_QUOTES, 'UTF-8') ?></h2>
          <p class="section__texte"><?= htmlspecialchars($tw['formulaire']['sousTitre'] ?? 'Complétez les trois étapes ci-dessous. Votre dossier est transmis directement à notre équipe de recrutement.', ENT_QUOTES, 'UTF-8') ?></p>
        </div>

        <div class="cand-dossier__grille">
          <!-- Colonne latérale RH -->
          <aside class="cand-sidebar" aria-label="Coordonnées recrutement">
            <div class="cand-rh-carte">
              <p class="cand-rh-carte__sur">CONTACT RECRUTEMENT</p>
              <h3>Besoin d’un renseignement ?</h3>
              <p>Notre équipe est joignable du lundi au samedi de 08h00 à 18h00 pour toute question relative aux postes, stages ou partenariats.</p>

              <div class="cand-rh-liste">
                <div class="cand-rh-item">
                  <span class="cand-rh-item__icone" aria-hidden="true">📞</span>
                  <div>
                    <small>Téléphone direct</small>
                    <a href="tel:<?= htmlspecialchars($telephoneLien, ENT_QUOTES, 'UTF-8') ?>" data-champ="telephone" data-lien="tel"><?= htmlspecialchars($telephoneBrut, ENT_QUOTES, 'UTF-8') ?></a>
                  </div>
                </div>
                <div class="cand-rh-item">
                  <span class="cand-rh-item__icone" aria-hidden="true">✉️</span>
                  <div>
                    <small>E-mail RH &amp; Direction</small>
                    <a href="mailto:<?= htmlspecialchars($emailContact, ENT_QUOTES, 'UTF-8') ?>" data-champ="email" data-lien="mailto"><?= htmlspecialchars($emailContact, ENT_QUOTES, 'UTF-8') ?></a>
                  </div>
                </div>
                <div class="cand-rh-item">
                  <span class="cand-rh-item__icone" aria-hidden="true">📍</span>
                  <div>
                    <small>Siège &amp; Bureaux</small>
                    <strong data-champ="ville"><?= htmlspecialchars($villeContact, ENT_QUOTES, 'UTF-8') ?></strong>
                  </div>
                </div>
              </div>

              <a class="btn btn--accent btn--bloc" href="tel:<?= htmlspecialchars($telephoneLien, ENT_QUOTES, 'UTF-8') ?>">📞 Appeler maintenant</a>
            </div>

            <div class="cand-checklist">
              <h4>Conseils pour votre dossier</h4>
              <ul class="cand-points">
                <li>Précisez le pôle qui correspond le mieux à votre profil</li>
                <li>Ajoutez un lien Google Drive, Dropbox, GitHub ou LinkedIn accessible</li>
                <li>Décrivez vos réalisations concrètes ou projets académiques</li>
                <li>Indiquez clairement votre disponibilité de démarrage</li>
              </ul>
            </div>
          </aside>

          <!-- Formulaire structuré en 3 étapes -->
          <form class="formulaire formulaire--candidature" id="formulaire-candidature" novalidate>
            <div class="alerte alerte--succes" id="cand-succes" role="status" hidden></div>
            <div class="alerte alerte--erreur" id="cand-erreur" role="alert" hidden></div>

            <!-- Étape 1 -->
            <div class="form-groupe">
              <div class="form-groupe__entete">
                <span class="form-groupe__num" aria-hidden="true">1</span>
                <h3 class="form-groupe__titre">Identité &amp; coordonnées</h3>
              </div>

              <div class="ligne-2">
                <div class="champ">
                  <label for="cand-civilite">Civilité</label>
                  <select id="cand-civilite" name="civilite">
                    <option value="M.">Monsieur (M.)</option>
                    <option value="Mme">Madame (Mme)</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
                <div class="champ">
                  <label for="cand-ville">Ville / Pays</label>
                  <input id="cand-ville" name="ville" type="text" placeholder="Ex. : Goma, RDC" autocomplete="address-level2">
                </div>
              </div>

              <div class="ligne-2">
                <div class="champ">
                  <label for="cand-nom">Nom *</label>
                  <input id="cand-nom" name="nom" type="text" required placeholder="Votre nom" autocomplete="family-name">
                </div>
                <div class="champ">
                  <label for="cand-prenom">Prénom *</label>
                  <input id="cand-prenom" name="prenom" type="text" required placeholder="Votre prénom" autocomplete="given-name">
                </div>
              </div>

              <div class="ligne-2">
                <div class="champ">
                  <label for="cand-email">Adresse e-mail *</label>
                  <input id="cand-email" name="email" type="email" required placeholder="vous@exemple.com" autocomplete="email">
                </div>
                <div class="champ">
                  <label for="cand-tel">Téléphone / WhatsApp *</label>
                  <input id="cand-tel" name="telephone" type="tel" required placeholder="+243 …" autocomplete="tel">
                </div>
              </div>

              <div class="champ">
                <label for="cand-naissance">Date de naissance (optionnel)</label>
                <input id="cand-naissance" name="dateNaissance" type="date">
              </div>
            </div>

            <!-- Étape 2 -->
            <div class="form-groupe">
              <div class="form-groupe__entete">
                <span class="form-groupe__num" aria-hidden="true">2</span>
                <h3 class="form-groupe__titre">Pôle visé &amp; profil professionnel</h3>
              </div>

              <div class="ligne-2">
                <div class="champ">
                  <label for="cand-domaine">Domaine / Pôle souhaité *</label>
                  <select id="cand-domaine" name="domaine" required>
                    <option value="">— Sélectionner un pôle —</option>
                    <option value="Génie Civil">Génie Civil &amp; BTP</option>
                    <option value="Architecture & Design">Architecture &amp; Design</option>
                    <option value="Informatique">Informatique &amp; Digital</option>
                    <option value="Énergie renouvelable">Énergie renouvelable</option>
                    <option value="Autre">Autre / Support transversal</option>
                  </select>
                </div>
                <div class="champ">
                  <label for="cand-type">Type de collaboration *</label>
                  <select id="cand-type" name="typeCollaboration" required>
                    <option value="">— Sélectionner un format —</option>
                    <option value="Emploi">Emploi (CDI / CDD)</option>
                    <option value="Stage">Stage académique ou professionnel</option>
                    <option value="Freelance / Consultant">Freelance / Consultant</option>
                    <option value="Partenariat">Partenariat technique</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
              </div>

              <div class="ligne-2">
                <div class="champ">
                  <label for="cand-exp">Années d’expérience</label>
                  <select id="cand-exp" name="experience">
                    <option value="">— Sélectionner —</option>
                    <option value="0-1 an">Débutant / 0 à 1 an</option>
                    <option value="1-3 ans">1 à 3 ans</option>
                    <option value="3-5 ans">3 à 5 ans</option>
                    <option value="5+ ans">Plus de 5 ans</option>
                  </select>
                </div>
                <div class="champ">
                  <label for="cand-dispo">Disponibilité</label>
                  <select id="cand-dispo" name="disponibilite">
                    <option value="">— Sélectionner —</option>
                    <option value="Immédiate">Immédiate</option>
                    <option value="1 mois">Sous 1 mois</option>
                    <option value="3 mois">Sous 3 mois</option>
                    <option value="À discuter">À convenir</option>
                  </select>
                </div>
              </div>

              <div class="champ">
                <label for="cand-liencv">Lien CV / Portfolio (Google Drive, LinkedIn, GitHub…)</label>
                <input id="cand-liencv" name="lienCv" type="url" placeholder="https://drive.google.com/… ou https://linkedin.com/in/…">
              </div>
            </div>

            <!-- Étape 3 -->
            <div class="form-groupe">
              <div class="form-groupe__entete">
                <span class="form-groupe__num" aria-hidden="true">3</span>
                <h3 class="form-groupe__titre">Présentation &amp; motivation</h3>
              </div>

              <div class="champ">
                <label for="cand-message">Votre parcours et vos motivations *</label>
                <textarea id="cand-message" name="message" rows="5" required placeholder="Présentez votre parcours, vos compétences clés, vos réalisations et ce que vous souhaitez apporter chez LK-TECH…"></textarea>
              </div>

              <div class="champ champ--check">
                <label class="check-label">
                  <input type="checkbox" name="consentement" required>
                  <span>J’accepte que mes informations soient traitées de manière confidentielle par LK-TECH dans le cadre de l’étude de ma candidature. *</span>
                </label>
              </div>
            </div>

            <button class="btn btn--accent btn--bloc" type="submit" id="cand-envoyer">
              <?= htmlspecialchars($tw['formulaire']['boutonTexte'] ?? 'Envoyer ma candidature', ENT_QUOTES, 'UTF-8') ?> <span aria-hidden="true">↗</span>
            </button>
            <p class="form-note">Vos données sont strictement réservées au recrutement LK-TECH. Aucune utilisation commerciale.</p>
            <p class="form-note" id="cand-gform-direct" <?= empty($gform['actionUrl']) ? 'hidden' : '' ?>>
              Vous pouvez également remplir ce dossier via notre <a href="<?= htmlspecialchars(!empty($gform['actionUrl']) ? str_replace('/formResponse', '/viewform', (string) $gform['actionUrl']) : '#', ENT_QUOTES, 'UTF-8') ?>" id="lien-google-form" target="_blank" rel="noopener" style="color:var(--accent-sombre);font-weight:700;text-decoration:underline;">formulaire Google Form externe ↗</a>.
            </p>
          </form>
        </div>
      </div>
    </section>

  </main>

  <!-- =============================== PIED =============================== -->
  <?php require __DIR__ . '/app/partials/footer.php'; ?>

  <!-- Barre d'appel rapide (mobile) -->
  <div class="barre-appel" aria-label="Actions rapides">
    <a class="barre-appel__btn barre-appel__btn--tel" href="tel:<?= htmlspecialchars($telephoneLien, ENT_QUOTES, 'UTF-8') ?>">📞 Appeler</a>
    <a class="barre-appel__btn barre-appel__btn--cta" href="#candidature">Postuler ↓</a>
  </div>

  <div class="toast" id="toast" role="status" aria-live="polite"></div>
  <script>window.LK_BASE = "<?= $base ?>"; window.LK_SECOURS = "<?= $base ?>/assets/data/site.json";</script>
  <script src="<?= $base ?>/assets/i18n/traductions.js?v=20261126"></script>
  <script src="<?= $base ?>/assets/js/site.js?v=20261126"></script>
  <script src="<?= $base ?>/assets/js/candidature.js?v=20261126"></script>
</body>
</html>
