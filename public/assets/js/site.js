/* =====================================================================
   LK-TECH (Linksmartech) — logique du site public
   Récupère le contenu depuis /api/site (aucune base à configurer côté client)
   et, en secours, depuis /data/site.json pour un hébergement 100 % statique.
   ===================================================================== */
(function () {
  'use strict';

  const CLE_PANIER = 'linkstech-panier';
  const IMAGE_SECOURS = '/assets/img/photo-manquante.svg';
  const etat = { contenu: null, reglages: {}, filtre: 'tout', panier: chargerPanier() };

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  /* ----------------------------- icônes SVG ------------------------------ */

  const ICONES = {
    code: '<path d="M8 6 3 12l5 6M16 6l5 6-5 6M13.5 4l-3 16"/>',
    reseau:
      '<circle cx="12" cy="5" r="2.5"/><circle cx="5" cy="19" r="2.5"/><circle cx="19" cy="19" r="2.5"/><path d="M12 7.5v3.5M10.3 12.7 6.6 16.6M13.7 12.7l3.7 3.9"/>',
    btp: '<path d="M3 21h18M6 21V9l6-4 6 4v12M10 21v-6h4v6"/>',
    solaire:
      '<circle cx="12" cy="12" r="4"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8"/>',
    electricite: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    cloud:
      '<path d="M18 18.5a4.5 4.5 0 0 0-.6-8.96 6 6 0 0 0-11.2 1.6A3.75 3.75 0 0 0 7 18.5z"/><path d="M12 12v4.5M10 14.5 12 12l2 2.5"/>',
    defaut: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>'
  };

  function iconeSvg(cle, taille = 24) {
    const trace = ICONES[cle] || ICONES.defaut;
    return `<svg viewBox="0 0 24 24" width="${taille}" height="${taille}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${trace}</svg>`;
  }

  /* ------------------------------ utilitaires ------------------------------ */

  function chargerPanier() {
    try {
      const brut = JSON.parse(localStorage.getItem(CLE_PANIER) || '[]');
      return Array.isArray(brut) ? brut : [];
    } catch {
      return [];
    }
  }

  function sauverPanier() {
    try {
      localStorage.setItem(CLE_PANIER, JSON.stringify(etat.panier));
    } catch { /* navigation privée : on ignore */ }
  }

  function prix(valeur) {
    const nombre = Number(valeur) || 0;
    return `$${nombre.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  function echapper(texte) {
    return String(texte ?? '').replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  /** Met en forme le nom de la marque : « LK-TECH » → LK[TECH avec tiret vert]. */
  function htmlNom(nom) {
    const brut = String(nom || 'LK-TECH').trim();
    if (brut.includes('-')) {
      const [tete, ...queue] = brut.split('-');
      return `${echapper(tete)}<i class="tiret">-</i>${echapper(queue.join('-'))}`;
    }
    return echapper(brut);
  }

  /** Filet de sécurité : une image indisponible n'apparaît jamais cassée. */
  function brancherImagesSecours(racine = document) {
    racine.querySelectorAll('img').forEach((img) => {
      if (img.dataset.secoursBranche) return;
      img.dataset.secoursBranche = '1';
      img.addEventListener('error', () => {
        if (img.src.endsWith(IMAGE_SECOURS)) return;
        img.src = IMAGE_SECOURS;
      });
    });
  }

  function toast(message) {
    const el = $('#toast');
    el.textContent = message;
    el.classList.add('visible');
    clearTimeout(toast._minuteur);
    toast._minuteur = setTimeout(() => el.classList.remove('visible'), 2600);
  }

  /* ------------------------------- chargement ------------------------------ */

  async function chargerContenu() {
    try {
      const reponse = await fetch('/api/site', { headers: { Accept: 'application/json' } });
      if (reponse.ok) return reponse.json();
    } catch { /* on tente le fichier statique */ }

    try {
      const reponse = await fetch('data/site.json', { cache: 'no-store' });
      if (reponse.ok) return reponse.json();
    } catch { /* on garde le contenu par défaut du serveur */ }

    return null;
  }

  /* -------------------------------- rendu --------------------------------- */

  function appliquerIdentite(identite) {
    if (!identite) return;
    document.title = `${identite.nomComplet || identite.nom} | ${identite.slogan || ''}`.trim();

    const logo = identite.logo || '/assets/img/logo.svg';
    const logoClair = identite.logoClair || logo;
    if ($('#logo-entete')) $('#logo-entete').src = logo;
    if ($('#logo-pied')) $('#logo-pied').src = logoClair;
    if ($('#favicon') && identite.favicon) $('#favicon').href = identite.favicon;

    if ($('#nom-entete')) $('#nom-entete').innerHTML = htmlNom(identite.nom);
    if ($('#nom-pied')) $('#nom-pied').innerHTML = htmlNom(identite.nom);
    if ($('#slogan-entete')) $('#slogan-entete').textContent = identite.slogan || '';

    $$('[data-champ="rccm"]').forEach((el) => { el.textContent = `RCCM : ${identite.rccm || ''}`; });
    $$('[data-champ="ville"]').forEach((el) => { el.textContent = `📍 ${identite.ville || ''}`; });
    $$('[data-champ="adresse"]').forEach((el) => { el.textContent = identite.ville || ''; });
    $$('[data-champ="telephone"]').forEach((el) => {
      el.textContent = `📞 ${identite.telephone || ''}`;
      if (el.dataset.lien === 'tel') el.href = `tel:${String(identite.telephone || '').replace(/[^+\d]/g, '')}`;
    });
    $$('[data-champ="email"]').forEach((el) => {
      el.textContent = identite.email || '';
      if (el.dataset.lien === 'mailto') el.href = `mailto:${identite.email || ''}`;
    });

    if (identite.couleurPrimaire) {
      document.documentElement.style.setProperty('--primaire', identite.couleurPrimaire);
      if (identite.couleurAccent) document.documentElement.style.setProperty('--accent', identite.couleurAccent);
    }

    const zone = $('#reseaux-sociaux');
    if (zone && Array.isArray(identite.reseaux)) {
      zone.innerHTML = identite.reseaux
        .filter((r) => r && r.url)
        .map((r) => `<a href="${echapper(r.url)}" target="_blank" rel="noopener">${echapper(r.nom)}</a>`)
        .join('');
    }
  }

  function rendreOngletsHero(hero) {
    const zone = $('#onglets-hero');
    if (!zone || !hero?.onglets) return;
    zone.innerHTML = hero.onglets
      .map(
        (onglet) =>
          `<button class="onglet" role="tab" data-onglet="${echapper(onglet.id)}">${echapper(onglet.libelle)}</button>`
      )
      .join('');

    zone.querySelectorAll('[data-onglet]').forEach((bouton) => {
      bouton.addEventListener('click', () => activerSpecialite(bouton.dataset.onglet, false));
    });

    activerSpecialite(hero.actif || hero.onglets[0]?.id, false);
  }

  /** Active une spécialité : onglet du hero + carte vedette. */
  function activerSpecialite(id, defiler = true) {
    const hero = etat.contenu?.hero;
    if (!hero?.onglets) return;
    const onglet = hero.onglets.find((o) => o.id === id) || hero.onglets[0];

    $$('#onglets-hero .onglet').forEach((b) => b.classList.toggle('actif', b.dataset.onglet === onglet.id));

    $('#hero-badge').textContent = onglet.badge || '';
    $('#hero-titre').innerHTML = `${echapper(onglet.titre)} <span class="accent">${echapper(onglet.titreAccent || '')}</span>.`;
    $('#hero-texte').textContent = onglet.description || '';
    const bouton = $('#hero-bouton');
    bouton.textContent = onglet.boutonTexte || 'Découvrir';
    bouton.href = onglet.boutonLien || '#services';

    rendreVedette(onglet.id);
    if (defiler) document.getElementById('accueil').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /** Carte vedette : un produit de la spécialité, sinon un appel au devis. */
  function rendreVedette(idSpecialite) {
    const produit = (etat.contenu.produits || []).find((p) => (p.filtre || p.categorie) === idSpecialite);
    const fiche = $('#fiche-vedette');

    if (produit) {
      $('#vedette-img').src = produit.image || IMAGE_SECOURS;
      $('#vedette-img').alt = produit.nom;
      $('#vedette-nom').textContent = produit.nom;
      $('#vedette-desc').textContent = produit.description || '';
      $('#vedette-prix').textContent = prix(produit.prix);
      $('#vedette-prix').hidden = false;
      const bouton = $('#vedette-ajouter');
      bouton.textContent = 'Ajouter au panier';
      bouton.onclick = () => ajouterAuPanier(produit.id);
      fiche?.classList.remove('fiche-produit--devis');
      return;
    }

    // Aucun produit dans cette spécialité : on propose une étude technique.
    const devis = etat.contenu.vedetteDevis || {};
    $('#vedette-img').src = devis.image || IMAGE_SECOURS;
    $('#vedette-img').alt = devis.titre || 'Demande de devis';
    $('#vedette-nom').textContent = devis.titre || 'Un projet ?';
    $('#vedette-desc').textContent = devis.texte || '';
    $('#vedette-prix').hidden = true;
    const bouton = $('#vedette-ajouter');
    bouton.textContent = devis.boutonTexte || 'Demander une étude';
    bouton.onclick = () => {
      const cible = document.querySelector(devis.boutonLien || '#contact');
      cible?.scrollIntoView({ behavior: 'smooth' });
    };
  }

  function rendreSpecialites() {
    const grille = $('#grille-specialites');
    if (!grille) return;
    grille.innerHTML = (etat.contenu.specialites || [])
      .map(
        (specialite) => `
        <article class="specialite apparait" data-specialite="${echapper(specialite.id)}" role="button" tabindex="0">
          <div class="specialite__icone">${iconeSvg(specialite.icone)}</div>
          <h3 class="specialite__titre">${echapper(specialite.titre)}</h3>
          <p class="specialite__texte">${echapper(specialite.texte)}</p>
        </article>`
      )
      .join('');

    grille.querySelectorAll('[data-specialite]').forEach((carte) => {
      const ouvrir = () => activerSpecialite(carte.dataset.specialite, true);
      carte.addEventListener('click', ouvrir);
      carte.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ouvrir(); }
      });
    });
  }

  function rendreServices(services) {
    const grille = $('#grille-services');
    if (!grille) return;
    grille.innerHTML = (services || [])
      .map(
        (service) => `
        <article class="carte-service apparait">
          ${
            service.image
              ? `<img src="${echapper(service.image)}" alt="${echapper(service.titre)}" loading="lazy">`
              : ''
          }
          <div class="carte-service__corps">
            ${service.image ? '' : `<div class="carte-service__icone">${iconeSvg(service.icone, 25)}</div>`}
            <h3 class="carte-service__titre">${echapper(service.titre)}</h3>
            <p class="carte-service__texte">${echapper(service.description)}</p>
          </div>
        </article>`
      )
      .join('');
  }

  function rendreEtapes(approche) {
    const grille = $('#grille-etapes');
    if (!grille || !approche) return;
    if (approche.titre) $('#approche-titre').textContent = approche.titre;
    if (approche.sousTitre && $('#approche-soustitre')) $('#approche-soustitre').textContent = approche.sousTitre;
    grille.innerHTML = (approche.etapes || [])
      .map(
        (etape) => `
        <article class="etape apparait">
          <span class="etape__num">${echapper(etape.numero)}</span>
          <h3 class="etape__titre">${echapper(etape.titre)}</h3>
          <p class="etape__texte">${echapper(etape.description)}</p>
        </article>`
      )
      .join('');
  }

  function rendreFiltres() {
    const zone = $('#filtres-boutique');
    if (!zone) return;
    const filtres = etat.contenu.boutique?.filtres || [
      { id: 'tout', libelle: 'Tout' },
      { id: 'informatique', libelle: 'Informatique' },
      { id: 'energie', libelle: 'Énergie renouvelable' },
      { id: 'terroir', libelle: 'Produits du terroir' }
    ];

    zone.innerHTML = filtres
      .map(
        (filtre) =>
          `<button class="filtre${filtre.id === etat.filtre ? ' actif' : ''}" data-filtre="${echapper(filtre.id)}">${echapper(filtre.libelle)}</button>`
      )
      .join('');

    zone.querySelectorAll('[data-filtre]').forEach((bouton) => {
      bouton.addEventListener('click', () => {
        etat.filtre = bouton.dataset.filtre;
        rendreFiltres();
        rendreProduits();
      });
    });
  }

  function rendreProduits() {
    const grille = $('#grille-produits');
    if (!grille) return;

    const liste = (etat.contenu.produits || []).filter(
      (produit) => etat.filtre === 'tout' || (produit.filtre || produit.categorie) === etat.filtre
    );

    if (!liste.length) {
      grille.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--ardoise-500)">Aucun produit dans cette catégorie pour le moment.</p>';
      return;
    }

    grille.innerHTML = liste
      .map(
        (produit) => `
        <article class="carte-produit apparait">
          <div class="carte-produit__media">
            <img src="${echapper(produit.image || IMAGE_SECOURS)}" alt="${echapper(produit.nom)}" loading="lazy">
            ${produit.badge ? `<span class="carte-produit__badge">${echapper(produit.badge)}</span>` : ''}
          </div>
          <div class="carte-produit__corps">
            <span class="carte-produit__cat">${echapper(libelleCategorie(produit))}</span>
            <h3 class="carte-produit__titre">${echapper(produit.nom)}</h3>
            <p class="carte-produit__desc">${echapper(produit.description)}</p>
            <div class="carte-produit__pied">
              <div>
                <div class="carte-produit__prix">${prix(produit.prix)}</div>
                ${
                  Number.isFinite(Number(produit.stock))
                    ? `<div class="carte-produit__stock">${Number(produit.stock) > 0 ? 'En stock' : 'Sur commande'}</div>`
                    : ''
                }
              </div>
              <button class="btn btn--petit" data-ajouter="${echapper(produit.id)}">Ajouter</button>
            </div>
          </div>
        </article>`
      )
      .join('');

    grille.querySelectorAll('[data-ajouter]').forEach((bouton) => {
      bouton.addEventListener('click', () => ajouterAuPanier(bouton.dataset.ajouter));
    });

    brancherImagesSecours(grille);
    observerApparitions();
  }

  function libelleCategorie(produit) {
    const libelles = { informatique: 'Informatique', energie: 'Énergie renouvelable', terroir: 'Produit du terroir' };
    return libelles[produit.filtre] || (produit.categorie === 'intl' ? 'Solution internationale' : 'Produit national');
  }

  /* -------------------------------- panier -------------------------------- */

  function ajouterAuPanier(idProduit) {
    const produit = (etat.contenu?.produits || []).find((p) => p.id === idProduit);
    if (!produit) return;
    const ligne = etat.panier.find((l) => l.id === idProduit);
    if (ligne) ligne.quantite += 1;
    else etat.panier.push({ id: produit.id, nom: produit.nom, prix: Number(produit.prix) || 0, image: produit.image, quantite: 1 });
    sauverPanier();
    rendrePanier();
    toast(`${produit.nom} ajouté au panier`);
  }

  function changerQuantite(idProduit, delta) {
    const ligne = etat.panier.find((l) => l.id === idProduit);
    if (!ligne) return;
    ligne.quantite += delta;
    if (ligne.quantite <= 0) etat.panier = etat.panier.filter((l) => l.id !== idProduit);
    sauverPanier();
    rendrePanier();
  }

  function rendrePanier() {
    const liste = $('#panier-liste');
    const compteur = $('#panier-compteur');
    if (!liste) return;

    const totalArticles = etat.panier.reduce((somme, l) => somme + l.quantite, 0);
    const total = etat.panier.reduce((somme, l) => somme + l.prix * l.quantite, 0);

    if (compteur) {
      compteur.textContent = totalArticles;
      compteur.hidden = totalArticles === 0;
    }
    $('#panier-total').textContent = prix(total);

    if (!etat.panier.length) {
      liste.innerHTML = '<p class="panier__vide">Votre panier est vide.<br>Parcourez la boutique pour ajouter des produits.</p>';
      return;
    }

    liste.innerHTML = etat.panier
      .map(
        (ligne) => `
        <div class="ligne-panier">
          <img src="${echapper(ligne.image || IMAGE_SECOURS)}" alt="${echapper(ligne.nom)}">
          <div>
            <div class="ligne-panier__nom">${echapper(ligne.nom)}</div>
            <div class="ligne-panier__prix">${prix(ligne.prix)} × ${ligne.quantite}</div>
            <div class="quantite" style="margin-top:.4rem">
              <button data-moins="${echapper(ligne.id)}" aria-label="Diminuer">−</button>
              <span>${ligne.quantite}</span>
              <button data-plus="${echapper(ligne.id)}" aria-label="Augmenter">+</button>
            </div>
          </div>
          <div>
            <div class="ligne-panier__prix" style="font-weight:700;color:var(--ardoise-900)">${prix(ligne.prix * ligne.quantite)}</div>
            <button class="ligne-suppr" data-suppr="${echapper(ligne.id)}">Retirer</button>
          </div>
        </div>`
      )
      .join('');

    brancherImagesSecours(liste);

    liste.querySelectorAll('[data-plus]').forEach((b) => b.addEventListener('click', () => changerQuantite(b.dataset.plus, 1)));
    liste.querySelectorAll('[data-moins]').forEach((b) => b.addEventListener('click', () => changerQuantite(b.dataset.moins, -1)));
    liste.querySelectorAll('[data-suppr]').forEach((b) =>
      b.addEventListener('click', () => {
        etat.panier = etat.panier.filter((l) => l.id !== b.dataset.suppr);
        sauverPanier();
        rendrePanier();
      })
    );

    // Commande via WhatsApp (aucun paiement en ligne requis)
    const telephone = String(etat.contenu?.identite?.telephone || '').replace(/[^\d]/g, '');
    const details = etat.panier.map((l) => `• ${l.nom} × ${l.quantite} = ${prix(l.prix * l.quantite)}`).join('\n');
    const texte = encodeURIComponent(`Bonjour ${etat.contenu?.identite?.nom || 'LK-TECH'}, je souhaite commander :\n${details}\n\nTotal : ${prix(total)}`);
    const bouton = $('#panier-commander');
    bouton.href = telephone ? `https://wa.me/${telephone}?text=${texte}` : '#contact';
    bouton.target = telephone ? '_blank' : '_self';
    bouton.rel = 'noopener';
  }

  function ouvrirPanier(ouvert) {
    $('#panier').classList.toggle('ouvert', ouvert);
    $('#panier').setAttribute('aria-hidden', String(!ouvert));
    $('#voile').classList.toggle('visible', ouvert);
  }

  /* ------------------------------- contact -------------------------------- */

  function brancherFormulaire() {
    const formulaire = $('#formulaire-contact');
    if (!formulaire) return;

    formulaire.addEventListener('submit', async (evenement) => {
      evenement.preventDefault();
      const bouton = $('#contact-envoyer');
      const succes = $('#contact-succes');
      const erreur = $('#contact-erreur');
      succes.classList.remove('visible');
      erreur.classList.remove('visible');

      const donnees = {
        nom: $('#c-nom').value.trim(),
        email: $('#c-email').value.trim(),
        telephone: $('#c-tel').value.trim(),
        sujet: $('#c-sujet').value,
        message: $('#c-message').value.trim()
      };

      if (!donnees.nom || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(donnees.email) || donnees.message.length < 5) {
        erreur.textContent = 'Merci de renseigner votre nom, un e-mail valide et un message.';
        erreur.classList.add('visible');
        return;
      }

      bouton.disabled = true;
      bouton.textContent = 'Envoi…';

      try {
        const reponse = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(donnees)
        });
        const resultat = await reponse.json().catch(() => ({}));
        if (!reponse.ok) throw new Error(resultat.erreur || "L'envoi a échoué.");

        succes.textContent = etat.contenu?.contact?.messageSucces || 'Merci ! Votre message a bien été envoyé.';
        succes.classList.add('visible');
        formulaire.reset();
        toast('Message envoyé ✔');
      } catch (e) {
        const email = etat.contenu?.identite?.email || 'contact@linkstech.cd';
        erreur.innerHTML = `${echapper(e.message)} Vous pouvez aussi nous écrire à <a href="mailto:${echapper(email)}"><strong>${echapper(email)}</strong></a>.`;
        erreur.classList.add('visible');
      } finally {
        bouton.disabled = false;
        bouton.textContent = 'Envoyer le message';
      }
    });
  }

  /* ------------------------------ animations ------------------------------ */

  let observateur = null;
  function observerApparitions() {
    if (!('IntersectionObserver' in window)) {
      $$('.apparait').forEach((el) => el.classList.add('visible'));
      return;
    }
    if (!observateur) {
      observateur = new IntersectionObserver(
        (entrees) => {
          entrees.forEach((entree) => {
            if (entree.isIntersecting) {
              entree.target.classList.add('visible');
              observateur.unobserve(entree.target);
            }
          });
        },
        { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
      );
    }
    $$('.apparait:not(.visible)').forEach((el) => observateur.observe(el));
  }

  /* --------------------------------- init --------------------------------- */

  async function initialiser() {
    const donnees = await chargerContenu();
    if (donnees) {
      etat.contenu = donnees.contenu;
      etat.reglages = donnees.reglages || {};
      appliquerIdentite(donnees.contenu.identite);
      rendreSpecialites();
      rendreOngletsHero(donnees.contenu.hero);
      rendreServices(donnees.contenu.services);
      rendreEtapes(donnees.contenu.approche);
      rendreFiltres();
      rendreProduits();

      if (donnees.contenu.boutique?.titre) $('#boutique-titre').textContent = donnees.contenu.boutique.titre;
      if (donnees.contenu.boutique?.sousTitre) $('#boutique-soustitre').textContent = donnees.contenu.boutique.sousTitre;
      if (donnees.contenu.pied?.description) $('#pied-description').textContent = donnees.contenu.pied.description;
      $('#pied-copyright').textContent = `© ${new Date().getFullYear()} ${
        donnees.contenu.identite?.nom || 'LK-TECH'
      } — ${donnees.contenu.pied?.mentions || 'Tous droits réservés.'}`;

      if (etat.reglages.portailClientActif === false) $('#btn-portail').hidden = true;
      $('#bandeau-maintenance').hidden = etat.reglages.maintenance !== true;
    }

    rendrePanier();
    brancherFormulaire();

    $('#btn-panier').addEventListener('click', () => ouvrirPanier(true));
    $('#panier-fermer').addEventListener('click', () => ouvrirPanier(false));
    $('#voile').addEventListener('click', () => ouvrirPanier(false));
    $('#panier-vider').addEventListener('click', () => {
      etat.panier = [];
      sauverPanier();
      rendrePanier();
      toast('Panier vidé');
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') ouvrirPanier(false);
    });

    const burger = $('#burger');
    burger?.addEventListener('click', () => {
      const nav = $('#nav');
      const ouvert = nav.classList.toggle('ouvert');
      burger.setAttribute('aria-expanded', String(ouvert));
    });
    $$('#nav .nav__lien').forEach((lien) =>
      lien.addEventListener('click', () => {
        $('#nav').classList.remove('ouvert');
        $('#burger').setAttribute('aria-expanded', 'false');
      })
    );

    brancherImagesSecours();
    observerApparitions();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialiser);
  else initialiser();
})();
