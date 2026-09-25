'use strict';

/**
 * Génère un site public 100 % statique, prêt pour Netlify (ou tout hébergement
 * statique : Vercel, Cloudflare Pages, GitHub Pages…).
 *
 *   node tools/build-netlify.js
 *
 * Ce que produit le dossier netlify-dist/ :
 *   • la page d'accueil et la page « À propos » (contenu rendu par le navigateur
 *     depuis data/site.json, comme sur tout hébergement sans serveur) ;
 *   • une fiche produit HTML par produit actif : produit/{slug}/index.html —
 *     réutilisant exactement le gabarit de la version serveur (SSR) ;
 *   • le formulaire de contact branché sur Netlify Forms ;
 *   • une page 404, robots.txt et sitemap.xml.
 *
 * Source du contenu (priorité décroissante) :
 *   1. contenu-site.json   (à la racine : export de l'admin « Exporter mes
 *                           données (JSON) », commité dans le dépôt) ;
 *   2. node/data/content.json (contenu modifié via l'admin local) ;
 *   3. les valeurs par défaut (node/src/defaults.js).
 *
 * Images téléversées depuis l'admin : placez-les dans le dossier `images-site/`
 * (commité) — elles sont publiées dans uploads/.
 *
 * L'administration et l'API ne tournent pas sur un hébergement statique :
 * voir DEPLOIEMENT.md (Option 7 — Netlify).
 */

const fs = require('fs');
const path = require('path');

const { CONTENU_DEFAUT, REGLAGES_DEFAUT } = require('../node/src/defaults');
const { slugProduit } = require('../node/src/slug');
const { rendrePageProduit } = require('../node/src/produitPage');

const RACINE = path.join(__dirname, '..');
const SOURCE = path.join(RACINE, 'node', 'public');
const CIBLE = path.join(RACINE, 'netlify-dist');

/** URL publique du site (sitemap, robots.txt). Sur Netlify : réglage
 *  « Site configuration → Environment variables → SITE_URL ». */
const URL_SITE = (process.env.SITE_URL || 'https://www.linksmartec.com').replace(/\/+$/, '');

/* ------------------------------ contenu ---------------------------------- */

function lireContenu() {
  const sources = [
    // 1. Export admin commité dans le dépôt (formats : {contenu, …} ou contenu nu)
    { chemin: path.join(RACINE, 'contenu-site.json'), enveloppe: true },
    // 2. Contenu de l'admin local (node/server.js en cours d'utilisation)
    { chemin: path.join(RACINE, 'node', 'data', 'content.json'), enveloppe: false }
  ];

  for (const source of sources) {
    if (!fs.existsSync(source.chemin)) continue;
    try {
      const brut = JSON.parse(fs.readFileSync(source.chemin, 'utf8'));
      const contenu = source.enveloppe && brut && brut.contenu ? brut.contenu : brut;
      if (contenu && Array.isArray(contenu.produits)) {
        console.log(`   Contenu lu : ${path.relative(RACINE, source.chemin)}`);
        return contenu;
      }
      console.warn(`   ⚠️ ${path.relative(RACINE, source.chemin)} : format ignoré (produits introuvables).`);
    } catch (erreur) {
      console.warn(`   ⚠️ ${path.relative(RACINE, source.chemin)} illisible : ${erreur.message}`);
    }
  }

  console.log('   Contenu lu : valeurs par défaut (node/src/defaults.js)');
  return CONTENU_DEFAUT;
}

/* ------------------------------ fichiers --------------------------------- */

function copierDossier(depuis, vers) {
  fs.mkdirSync(vers, { recursive: true });
  for (const entree of fs.readdirSync(depuis, { withFileTypes: true })) {
    const source = path.join(depuis, entree.name);
    const cible = path.join(vers, entree.name);
    if (entree.isDirectory()) copierDossier(source, cible);
    else fs.copyFileSync(source, cible);
  }
}

/** Recopie un dossier s'il existe (images téléversées, par exemple). */
function copierSiPresent(depuis, vers) {
  if (!fs.existsSync(depuis)) return 0;
  let total = 0;
  const compter = (d) => {
    for (const entree of fs.readdirSync(d, { withFileTypes: true })) {
      if (entree.isDirectory()) compter(path.join(d, entree.name));
      else total += 1;
    }
  };
  compter(depuis);
  if (total > 0) {
    copierDossier(depuis, vers);
    console.log(`   ${total} image(s) publiée(s) : ${path.relative(RACINE, depuis)} → uploads/`);
  }
  return total;
}

/* --------------------------- transformations ------------------------------ */

/** Marque la page comme « statique » : le formulaire passera par Netlify Forms. */
function marquerStatique(html) {
  const marqueur = '  <script src="/assets/js/site.js"></script>';
  if (!html.includes(marqueur)) throw new Error('Balise site.js introuvable dans la page.');
  return html.replace(
    marqueur,
    '  <script>window.LK_STATIQUE = true; window.LK_SECOURS = "/data/site.json";</script>\n' + marqueur
  );
}

/** Branche le formulaire de contact sur Netlify Forms (déclaré dans le HTML). */
function brancherNetlifyForms(html) {
  const formulaire = '<form class="formulaire" id="formulaire-contact" novalidate>';
  if (!html.includes(formulaire)) return html; // page sans formulaire
  return html.replace(
    formulaire,
    [
      '<form class="formulaire" id="formulaire-contact" name="contact" method="POST"',
      '      action="/merci/" data-netlify="true" netlify-honeypot="piege" novalidate>',
      '            <input type="hidden" name="form-name" value="contact">',
      '            <p hidden aria-hidden="true"><label>Ne pas remplir ce champ <input name="piege" tabindex="-1" autocomplete="off"></label></p>'
    ].join('\n')
  );
}

/** Page de remerciement affichée si JavaScript est désactivé (action= du formulaire). */
function pageMerci() {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Message envoyé | LK-TECH</title>
  <meta name="robots" content="noindex">
  <link rel="icon" type="image/svg+xml" href="/assets/img/favicon.svg">
  <link rel="stylesheet" href="/assets/css/styles.css">
</head>
<body>
  <section class="section" style="min-height:70vh;display:grid;place-items:center">
    <div class="conteneur" style="text-align:center">
      <p style="font-size:4rem;margin:0">✅</p>
      <h1 class="section__titre" style="margin:.5rem 0 1rem">Message envoyé, merci !</h1>
      <p style="color:var(--ardoise-500);max-width:34rem;margin:0 auto 1.75rem">
        Votre message est bien arrivé. Notre équipe vous répondra dans les plus brefs délais.
      </p>
      <a class="btn btn--accent" href="/">← Retour à l'accueil</a>
    </div>
  </section>
</body>
</html>
`;
}

/** Page 404 servie automatiquement par Netlify pour les adresses inconnues. */
function page404() {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page introuvable | LK-TECH</title>
  <meta name="robots" content="noindex">
  <link rel="icon" type="image/svg+xml" href="/assets/img/favicon.svg">
  <link rel="stylesheet" href="/assets/css/styles.css">
</head>
<body>
  <section class="page-entete">
    <div class="conteneur">
      <nav class="fil-ariane" aria-label="Fil d'Ariane">
        <a href="/">Accueil</a> <span aria-hidden="true">›</span> <span>Page introuvable</span>
      </nav>
      <h1 class="page-entete__titre">Cette page n'existe pas ou a été déplacée</h1>
      <p class="page-entete__texte">Le contenu recherché a peut-être changé d'adresse. Retrouvez toute notre offre ci-dessous.</p>
    </div>
  </section>
  <section class="section">
    <div class="conteneur" style="text-align:center">
      <p style="font-size:4rem;margin:0">🧭</p>
      <p style="max-width:34rem;margin:0 auto 1.75rem;color:var(--ardoise-500)">
        Matériel informatique, solutions solaires et produits du terroir du Kivu.
      </p>
      <a class="btn btn--accent" href="/#boutique">Voir la boutique</a>
      <a class="btn btn--fantome" href="/">Retour à l'accueil</a>
    </div>
  </section>
</body>
</html>
`;
}

/* ------------------------------- sitemap ---------------------------------- */

function construireSitemap(contenu) {
  const lignes = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    '  <url>',
    `    <loc>${URL_SITE}/</loc>`,
    '    <changefreq>weekly</changefreq>',
    '    <priority>1.0</priority>',
    '  </url>',
    '  <url>',
    `    <loc>${URL_SITE}/a-propos.html</loc>`,
    '    <changefreq>monthly</changefreq>',
    '    <priority>0.8</priority>',
    '  </url>'
  ];

  for (const produit of contenu.produits || []) {
    if (produit.actif === false) continue;
    lignes.push(
      '  <url>',
      `    <loc>${URL_SITE}/produit/${encodeURIComponent(slugProduit(produit))}</loc>`,
      '    <changefreq>weekly</changefreq>',
      '    <priority>0.7</priority>',
      '  </url>'
    );
  }

  lignes.push('</urlset>', '');
  return lignes.join('\n');
}

/* -------------------------------- build ----------------------------------- */

function construire() {
  console.log('\n  LK-TECH — génération du site statique pour Netlify\n');

  const contenu = lireContenu();

  // Repartir d'un dossier propre.
  fs.rmSync(CIBLE, { recursive: true, force: true });
  fs.mkdirSync(path.join(CIBLE, 'data'), { recursive: true });

  /* ---- 1. Pages publiques et ressources (sans l'administration) ---- */
  for (const fichier of ['index.html', 'a-propos.html']) {
    let page = fs.readFileSync(path.join(SOURCE, fichier), 'utf8');
    page = brancherNetlifyForms(marquerStatique(page));
    fs.writeFileSync(path.join(CIBLE, fichier), page, 'utf8');
    console.log(`   Page : ${fichier}`);
  }
  copierDossier(path.join(SOURCE, 'assets'), path.join(CIBLE, 'assets'));
  console.log('   Ressources : assets/ (design, logo, images, scripts)');

  /* ---- 2. Contenu de secours : le navigateur rend le site depuis ce JSON ---- */
  const contenuPublic = JSON.parse(JSON.stringify(contenu));
  contenuPublic.produits = (contenuPublic.produits || []).filter((p) => p.actif !== false);
  const secours = {
    contenu: contenuPublic,
    reglages: {
      devise: REGLAGES_DEFAUT.devise,
      portailClientActif: REGLAGES_DEFAUT.portailClientActif,
      maintenance: false
    },
    genereLe: new Date().toISOString(),
    note: 'Site statique généré par tools/build-netlify.js.'
  };
  fs.writeFileSync(path.join(CIBLE, 'data', 'site.json'), JSON.stringify(secours, null, 2), 'utf8');
  console.log(`   Contenu de secours : data/site.json (${contenuPublic.produits.length} produits)`);

  /* ---- 3. Fiches produit : une page HTML par produit actif ---- */
  const produits = (contenu.produits || []).filter((p) => p.actif !== false);
  const slugsUtilises = new Set();
  let fiches = 0;
  for (const produit of produits) {
    const slug = slugProduit(produit);
    if (slugsUtilises.has(slug)) {
      console.warn(`   ⚠️ Slug « ${slug} » déjà utilisé : la fiche de « ${produit.nom} » est ignorée (renommage conseillé).`);
      continue;
    }
    slugsUtilises.add(slug);

    const similaires = produits
      .filter((p) => p.id !== produit.id && (p.filtre || p.categorie) === (produit.filtre || produit.categorie))
      .slice(0, 4);

    let page = rendrePageProduit({ contenu, produit, similaires });
    page = marquerStatique(page);
    const dossier = path.join(CIBLE, 'produit', slug);
    fs.mkdirSync(dossier, { recursive: true });
    fs.writeFileSync(path.join(dossier, 'index.html'), page, 'utf8');
    fiches += 1;
  }
  console.log(`   Fiches produit : ${fiches} page(s) dans produit/{slug}/`);

  /* ---- 4. Images téléversées (admin local ou dossier commité images-site/) ---- */
  copierSiPresent(path.join(RACINE, 'node', 'data', 'uploads'), path.join(CIBLE, 'uploads'));
  copierSiPresent(path.join(RACINE, 'images-site'), path.join(CIBLE, 'uploads'));

  /* ---- 5. Pages utilitaires ---- */
  fs.mkdirSync(path.join(CIBLE, 'merci'), { recursive: true });
  fs.writeFileSync(path.join(CIBLE, 'merci', 'index.html'), pageMerci(), 'utf8');
  fs.writeFileSync(path.join(CIBLE, '404.html'), page404(), 'utf8');
  fs.writeFileSync(
    path.join(CIBLE, 'robots.txt'),
    `# LK-TECH — ${URL_SITE}\nUser-agent: *\nAllow: /\n\nSitemap: ${URL_SITE}/sitemap.xml\n`,
    'utf8'
  );
  fs.writeFileSync(path.join(CIBLE, 'sitemap.xml'), construireSitemap(contenu), 'utf8');
  console.log('   Utilitaires : 404.html, merci/, robots.txt, sitemap.xml');

  console.log(`\n   ✔ Site statique prêt : ${path.relative(RACINE, CIBLE)}/`);
  console.log('     Déploiement Netlify : dépôt GitHub + netlify.toml (build automatique).\n');
}

construire();
