'use strict';

/**
 * Rend la fiche produit (version Node.js) : /produit/{slug}.
 *
 * Miroir de la page PHP « produit.php » : même structure, mêmes styles, mêmes
 * données structurées. Le contenu est rendu côté serveur à partir du stockage
 * (JSON local ou MySQL) pour un référencement et un partage optimal.
 */

const { slugProduit } = require('./slug');

/* ------------------------------ utilitaires ------------------------------ */

function echap(texte) {
  return String(texte ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function prixFormate(valeur) {
  const nombre = Number(valeur) || 0;
  return `$${nombre.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function urlImage(chemin) {
  const valeur = String(chemin || '').trim();
  if (!valeur) return '/assets/img/photo-manquante.svg';
  if (/^(https?:|data:)/i.test(valeur)) return valeur;
  return '/' + valeur.replace(/^\/+/, '');
}

function telLien(telephone) {
  return `tel:${String(telephone || '').replace(/[^+\d]/g, '')}`;
}

/* ------------------------------ pièces communes -------------------------- */

function entete(contenu, { avecPanier = true } = {}) {
  const identite = contenu.identite || {};
  return `
  <div class="topbar">
    <div class="conteneur topbar__inner">
      <span class="topbar__rccm" data-champ="rccm">RCCM : ${echap(identite.rccm || '')}</span>
      <div class="topbar__infos">
        <span data-champ="ville">📍 ${echap(identite.ville || '')}</span>
        <a class="topbar__tel" data-champ="telephone" data-lien="tel" href="${echap(telLien(identite.telephone))}">📞 ${echap(identite.telephone || '')}</a>
      </div>
    </div>
  </div>

  <header class="entete">
    <div class="conteneur entete__inner">
      <a class="marque" href="/" aria-label="Accueil Linkstech">
        <img class="marque__logo" id="logo-entete" src="/assets/img/logo.svg" alt="Logo Linkstech">
        <span class="marque__texte">
          <span class="marque__nom" id="nom-entete">Linkstech</span>
          <span class="marque__slogan" id="slogan-entete">${echap(identite.slogan || '')}</span>
        </span>
      </a>

      <nav class="nav" id="nav">
        <a class="nav__lien" href="/">Accueil</a>
        <a class="nav__lien" href="/#specialites">Spécialités</a>
        <a class="nav__lien" href="/#boutique" style="color:var(--primaire)">Boutique</a>
        <a class="nav__lien" href="/#services">Services</a>
        <a class="nav__lien" href="/a-propos.html">À propos</a>
        <a class="nav__lien" href="/#contact">Contact</a>
      </nav>

      <div class="entete__actions">
        ${avecPanier ? `
        <button class="btn btn--fantome btn--petit panier-btn" id="btn-panier" aria-label="Ouvrir le panier">
          🛒 Panier
          <span class="panier-btn__compteur" id="panier-compteur" hidden>0</span>
        </button>` : ''}
        <a class="btn btn--petit" id="btn-portail" href="/#contact">Devis gratuit</a>
        <button class="burger" id="burger" aria-label="Ouvrir le menu" aria-expanded="false">☰</button>
      </div>
    </div>
  </header>`;
}

function pied(contenu) {
  const identite = contenu.identite || {};
  const annee = new Date().getFullYear();
  const nomSite = identite.nomComplet || identite.nom || 'Linkstech';
  const siteWeb = String(identite.siteWeb || '').replace(/^https?:\/\//i, '').replace(/\/+$/, '');
  return `
  <footer class="pied">
    <div class="conteneur">
      <div class="pied__grille">
        <div>
          <img class="pied__logo" id="logo-pied" src="/assets/img/logo-clair.svg" alt="Logo Linkstech">
          <div class="pied__nom" id="nom-pied">Linkstech</div>
          <p class="pied__texte" id="pied-description">${echap((contenu.pied || {}).description || '')}</p>
        </div>
        <div>
          <h4 class="pied__titre">Navigation</h4>
          <div class="pied__liens">
            <a href="/">Accueil</a>
            <a href="/#boutique">Boutique</a>
            <a href="/#services">Services</a>
            <a href="/a-propos.html">À propos</a>
            <a href="/#contact">Contact</a>
          </div>
        </div>
        <div>
          <h4 class="pied__titre">Nos spécialités</h4>
          <div class="pied__liens" id="pied-specialites"></div>
        </div>
        <div>
          <h4 class="pied__titre">Coordonnées</h4>
          <div class="pied__liens">
            <span data-champ="ville">${echap(identite.ville || '')}</span>
            <a data-champ="telephone" data-lien="tel" href="${echap(telLien(identite.telephone))}">${echap(identite.telephone || '')}</a>
            <a data-champ="email" data-lien="mailto" href="mailto:${echap(identite.email || '')}">${echap(identite.email || '')}</a>
            <a data-champ="siteWeb" data-lien="web" href="https://${echap(siteWeb)}">${echap(siteWeb)}</a>
            <span data-champ="rccm">RCCM : ${echap(identite.rccm || '')}</span>
          </div>
          <div class="pied__liens" id="reseaux-sociaux" style="margin-top:1rem"></div>
        </div>
      </div>
      <div class="pied__bas">
        <span id="pied-copyright">© ${annee} ${echap(nomSite)} — Tous droits réservés.</span>
        <span>Conçu à Goma 🇨🇩</span>
      </div>
    </div>
  </footer>

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

  <script src="/assets/js/site.js"></script>
</body>
</html>`;
}

/* --------------------------------- page ---------------------------------- */

function libelleCategorie(produit) {
  const libelles = { informatique: 'Informatique', energie: 'Énergie renouvelable', terroir: 'Produit du terroir' };
  return libelles[produit.filtre] || (produit.categorie === 'intl' ? 'Solution internationale' : 'Produit national');
}

/** Rend la page complète. produit = null → page « produit introuvable » (404). */
function rendrePageProduit({ contenu, produit = null, similaires = [] }) {
  const identite = contenu.identite || {};
  const nomSite = identite.nomComplet || identite.nom || 'Linkstech';

  let tete = '';
  let corps = '';

  if (!produit) {
    tete = `
  <title>Produit introuvable | ${echap(nomSite)}</title>
  <meta name="robots" content="noindex">
  <meta name="theme-color" content="#16233F">`;

    corps = `
  <section class="page-entete">
    <div class="conteneur">
      <nav class="fil-ariane" aria-label="Fil d'Ariane">
        <a href="/">Accueil</a> <span aria-hidden="true">›</span> <a href="/#boutique">Boutique</a>
      </nav>
      <h1 class="page-entete__titre">Ce produit est introuvable</h1>
      <p class="page-entete__texte">Il a peut-être été retiré de la boutique ou l'adresse est incorrecte. Retrouvez toute notre offre ci-dessous.</p>
    </div>
  </section>

  <section class="section">
    <div class="conteneur" style="text-align:center">
      <p style="font-size:4rem;margin:0">🔎</p>
      <p style="max-width:34rem;margin:0 auto 1.75rem;color:var(--ardoise-500)">Parcourez la boutique ${echap(nomSite)} : matériel informatique, solutions solaires et produits du terroir du Kivu.</p>
      <a class="btn btn--accent" href="/#boutique">Voir tous les produits</a>
    </div>
  </section>`;
  } else {
    const slug = slugProduit(produit);
    const categorie = libelleCategorie(produit);
    const enStock = Number(produit.stock) > 0;

    // Galerie : image principale puis images complémentaires, sans doublons.
    const galerie = [];
    for (const image of [produit.image, ...(Array.isArray(produit.images) ? produit.images : [])]) {
      const valeur = String(image || '').trim();
      if (valeur && !galerie.includes(valeur)) galerie.push(valeur);
    }

    const paragraphes = String(produit.descriptionLongue || '')
      .replace(/\r\n/g, '\n')
      .split('\n')
      .map((p) => p.trim())
      .filter(Boolean);

    const specifications = (Array.isArray(produit.specifications) ? produit.specifications : [])
      .map((s) => ({ label: String(s?.label || '').trim(), valeur: String(s?.valeur || '').trim() }))
      .filter((s) => s.label || s.valeur);

    const descriptionMeta = (paragraphes[0] || produit.description || '').replace(/\s+/g, ' ').slice(0, 158);

    const origine = 'https://' + (String(identite.siteWeb || 'www.linksmartec.com').replace(/^https?:\/\//i, '').replace(/\/+$/, ''));
    const lienCanonique = `${origine}/produit/${encodeURIComponent(slug)}`;
    const imagesAbsolues = galerie.map((image) => (/^https?:/i.test(image) ? image : origine + urlImage(image)));

    const donneesProduit = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: produit.nom,
      description: descriptionMeta,
      image: imagesAbsolues.length ? imagesAbsolues : [`${origine}/assets/img/photo-manquante.svg`],
      sku: produit.id,
      brand: { '@type': 'Brand', name: identite.nom || 'Linkstech' },
      offers: {
        '@type': 'Offer',
        url: lienCanonique,
        price: Number(produit.prix || 0).toFixed(2),
        priceCurrency: produit.devise || 'USD',
        availability: enStock ? 'https://schema.org/InStock' : 'https://schema.org/PreOrder',
        itemCondition: 'https://schema.org/NewCondition',
        seller: { '@type': 'Organization', name: nomSite }
      }
    };
    const donneesFilAriane = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Accueil', item: `${origine}/` },
        { '@type': 'ListItem', position: 2, name: 'Boutique', item: `${origine}/#boutique` },
        { '@type': 'ListItem', position: 3, name: produit.nom }
      ]
    };

    const telephone = String(identite.telephone || '').replace(/\D/g, '');
    const messageWhatsApp = `Bonjour ${identite.nom || 'Linkstech'}, je suis intéressé(e) par « ${produit.nom} » (${prixFormate(produit.prix)}). Est-il disponible ?`;
    const lienWhatsApp = telephone ? `https://wa.me/${telephone}?text=${encodeURIComponent(messageWhatsApp)}` : '/#contact';

    tete = `
  <title>${echap(produit.nom)} | ${echap(nomSite)} — Boutique</title>
  <meta name="description" content="${echap(descriptionMeta)}">
  <meta name="theme-color" content="#16233F">
  <meta property="og:title" content="${echap(produit.nom)} — ${echap(prixFormate(produit.prix))}">
  <meta property="og:description" content="${echap(descriptionMeta)}">
  <meta property="og:type" content="product">
  <meta property="og:url" content="${echap(lienCanonique)}">
  <meta property="og:site_name" content="${echap(nomSite)}">
${imagesAbsolues.slice(0, 3).map((image) => `  <meta property="og:image" content="${echap(image)}">`).join('\n')}
  <meta name="twitter:card" content="summary_large_image">
  <link rel="canonical" href="${echap(lienCanonique)}">
  <script type="application/ld+json">${JSON.stringify(donneesProduit)}</script>
  <script type="application/ld+json">${JSON.stringify(donneesFilAriane)}</script>`;

    const miniatures = galerie.length > 1
      ? `
          <div class="galerie-produit__miniatures" id="produit-miniatures">
${galerie.map((image, index) => `            <button type="button" class="galerie-produit__miniature${index === 0 ? ' actif' : ''}" data-miniature="${echap(urlImage(image))}" aria-label="Voir l'image ${index + 1}"><img src="${echap(urlImage(image))}" alt="" loading="lazy"></button>`).join('\n')}
          </div>`
      : '';

    corps = `
  <section class="page-entete">
    <div class="conteneur">
      <nav class="fil-ariane" aria-label="Fil d'Ariane">
        <a href="/">Accueil</a> <span aria-hidden="true">›</span>
        <a href="/#boutique">Boutique</a> <span aria-hidden="true">›</span>
        <span>${echap(produit.nom)}</span>
      </nav>
      <p class="section__sur">${echap(categorie)}</p>
      <h1 class="page-entete__titre">${echap(produit.nom)}</h1>
      <p class="page-entete__texte">${echap(produit.description)}</p>
    </div>
  </section>

  <section class="section">
    <div class="conteneur">
      <div class="produit-fiche" id="produit-fiche" data-id="${echap(produit.id)}" data-ssr>

        <div class="galerie-produit">
          <img class="galerie-produit__principale" id="produit-image" src="${echap(urlImage(galerie[0]))}" alt="${echap(produit.nom)}">${miniatures}
        </div>

        <div class="produit-infos">
${produit.badge ? `          <span class="produit-badge">${echap(produit.badge)}</span>\n` : ''}          <div class="produit-prix">
            ${echap(prixFormate(produit.prix))}
            <span class="produit-prix__devise">${echap(produit.devise || 'USD')}</span>
          </div>
          <div class="produit-etat ${enStock ? 'produit-etat--stock' : 'produit-etat--commande'}">
            ${enStock ? '● En stock — disponible immédiatement' : '◐ Sur commande — délai de 3 à 10 jours'}
          </div>

          <p class="produit-desc">${echap(produit.description)}</p>

          <div class="produit-actions">
            <button class="btn btn--accent" data-ajouter="${echap(produit.id)}">🛒 Ajouter au panier</button>
            <a class="btn btn--fantome" id="produit-whatsapp" href="${echap(lienWhatsApp)}" target="_blank" rel="noopener">💬 Commander sur WhatsApp</a>
          </div>
          <p class="produit-note">Paiement à la livraison · Livraison et installation possibles à Goma et dans tout le Nord-Kivu.</p>

          <dl class="produit-meta">
            <div><dt>Référence</dt><dd>${echap(produit.id)}</dd></div>
            <div><dt>Catégorie</dt><dd>${echap(categorie)}</dd></div>
${specifications.length ? '            <div><dt>Garantie &amp; services</dt><dd>Suivi après-vente assuré par nos équipes</dd></div>\n' : ''}          </dl>
        </div>
      </div>
    </div>
  </section>
${paragraphes.length ? `
  <section class="section section--gris">
    <div class="conteneur">
      <div class="section__entete">
        <p class="section__sur">En détail</p>
        <h2 class="section__titre">Description</h2>
      </div>
      <div class="prose-produit">
${paragraphes.map((p) => `        <p>${echap(p)}</p>`).join('\n')}
      </div>
    </div>
  </section>
` : ''}${specifications.length ? `
  <section class="section">
    <div class="conteneur">
      <div class="section__entete">
        <p class="section__sur">Fiche technique</p>
        <h2 class="section__titre">Caractéristiques techniques</h2>
      </div>
      <table class="specs">
        <tbody>
${specifications.map((s) => `          <tr><th scope="row">${echap(s.label)}</th><td>${echap(s.valeur)}</td></tr>`).join('\n')}
        </tbody>
      </table>
    </div>
  </section>
` : ''}${similaires.length ? `
  <section class="section section--gris" id="similaires">
    <div class="conteneur">
      <div class="section__entete">
        <p class="section__sur">Dans la même catégorie</p>
        <h2 class="section__titre">Vous aimerez aussi</h2>
      </div>
      <div class="grille-produits">
${similaires.map((similaire) => {
    const lien = `/produit/${encodeURIComponent(slugProduit(similaire))}`;
    return `        <article class="carte-produit apparait">
          <a class="carte-produit__media" href="${echap(lien)}">
            <img src="${echap(urlImage(similaire.image))}" alt="${echap(similaire.nom)}" loading="lazy">
${similaire.badge ? `            <span class="carte-produit__badge">${echap(similaire.badge)}</span>\n` : ''}          </a>
          <div class="carte-produit__corps">
            <span class="carte-produit__cat">${echap(libelleCategorie(similaire))}</span>
            <h3 class="carte-produit__titre"><a href="${echap(lien)}">${echap(similaire.nom)}</a></h3>
            <p class="carte-produit__desc">${echap(similaire.description)}</p>
            <div class="carte-produit__pied">
              <div>
                <div class="carte-produit__prix">${echap(prixFormate(similaire.prix))}</div>
                <div class="carte-produit__stock">${Number(similaire.stock) > 0 ? 'En stock' : 'Sur commande'}</div>
              </div>
              <button class="btn btn--petit" data-ajouter="${echap(similaire.id)}">Ajouter</button>
            </div>
          </div>
        </article>`;
  }).join('\n')}
      </div>
    </div>
  </section>
` : ''}
  <section class="appel">
    <div class="conteneur appel__inner">
      <div>
        <h2 class="appel__titre">Une question sur ce produit ?</h2>
        <p class="appel__texte">Nos techniciens vous conseillent sur la compatibilité, l'installation et les options de financement.</p>
      </div>
      <div class="appel__actions">
        <a class="btn btn--accent" href="/#contact">Demander conseil</a>
        <a class="btn btn--fantome" data-champ="telephone" data-lien="tel" href="${echap(telLien(identite.telephone))}" style="--btn-texte:#fff;border-color:rgba(255,255,255,.35)">📞 Nous appeler</a>
      </div>
    </div>
  </section>`;
  }

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
${tete.trim().split('\n').map((l) => '  ' + l.trim()).filter(Boolean).join('\n')}
  <link rel="icon" type="image/svg+xml" href="/assets/img/favicon.svg" id="favicon">
  <link rel="apple-touch-icon" href="/assets/img/logo.svg">
  <link rel="stylesheet" href="/assets/css/styles.css">
</head>
<body>

  <div class="bandeau-info" id="bandeau-maintenance" hidden>
    Site en cours de maintenance — certaines fonctions peuvent être momentanément indisponibles.
  </div>

${entete(contenu)}

${corps.trim()}

${pied(contenu)}`;
}

module.exports = { rendrePageProduit, libelleCategorie };
