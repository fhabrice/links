/* =====================================================================
   Linksmartech — logique du site public
   Récupère le contenu depuis /api/site (aucune base à configurer côté client)
   et, en secours, depuis /data/site.json pour un hébergement 100 % statique.
   ===================================================================== */
(function () {
  'use strict';

  const CLE_PANIER = 'linksmartech-panier';
  const etat = { contenu: null, reglages: {}, filtre: 'tout', panier: chargerPanier() };

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

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
    ['#logo-entete', '#logo-pied'].forEach((sel) => { const el = $(sel); if (el) el.src = logo; });
    const favicon = $('#favicon');
    if (favicon && identite.favicon) favicon.href = identite.favicon;

    const nom = (identite.nom || 'LINKS MARTECH').toUpperCase();
    const coupe = nom.indexOf('MARTECH');
    const htmlNom = coupe > 0
      ? `${echapper(nom.slice(0, coupe))}<span>${echapper(nom.slice(coupe))}</span>`
      : echapper(nom);

    if ($('#nom-entete')) $('#nom-entete').innerHTML = htmlNom;
    if ($('#slogan-entete')) $('#slogan-entete').textContent = identite.slogan || '';
    if ($('#nom-pied')) $('#nom-pied').innerHTML = coupe > 0
      ? `${echapper(nom.slice(0, coupe))}<span style="color:#3b82f6">${echapper(nom.slice(coupe))}</span>`
      : echapper(nom);

    $$('[data-champ="rccm"]').forEach((el) => { el.textContent = `RCCM : ${identite.rccm || ''}`; });
    $$('[data-champ="ville"]').forEach((el) => { el.textContent = `📍 ${identite.ville || ''}`; });
    $$('[data-champ="adresse"]').forEach((el) => { el.textContent = identite.ville || ''; });
    $$('[data-champ="telephone"]').forEach((el) => {
      el.textContent = `📞 ${identite.telephone || ''}`;
      if (el.dataset.lien === 'tel') {
        el.textContent = `📞 ${identite.telephone || ''}`;
        el.href = `tel:${String(identite.telephone || '').replace(/[^+\d]/g, '')}`;
      }
    });
    $$('[data-champ="email"]').forEach((el) => {
      el.textContent = identite.email || '';
      if (el.dataset.lien === 'mailto') el.href = `mailto:${identite.email || ''}`;
    });

    // Couleurs de marque pilotées par l'admin
    if (identite.couleurPrimaire) {
      document.documentElement.style.setProperty('--primaire', identite.couleurPrimaire);
      if (identite.couleurAccent) document.documentElement.style.setProperty('--accent', identite.couleurAccent);
    }

    // Réseaux sociaux
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
      bouton.addEventListener('click', () => activerOnglet(bouton.dataset.onglet));
    });

    activerOnglet(hero.actif || hero.onglets[0]?.id);
  }

  function activerOnglet(id) {
    const hero = etat.contenu?.hero;
    if (!hero?.onglets) return;
    const onglet = hero.onglets.find((o) => o.id === id) || hero.onglets[0];

    $$('#onglets-hero .onglet').forEach((b) => b.classList.toggle('actif', b.dataset.onglet === onglet.id));

    $('#hero-badge').textContent = onglet.badge || '';
    $('#hero-titre').innerHTML = `${echapper(onglet.titre)} <span class="accent">${echapper(onglet.titreAccent || '')}</span>.`;
    $('#hero-texte').textContent = onglet.description || '';
    const bouton = $('#hero-bouton');
    bouton.textContent = onglet.boutonTexte || 'Découvrir';
    bouton.href = onglet.boutonLien || '#boutique';

    // Le produit vedette suit l'onglet actif
    const produit =
      (etat.contenu.produits || []).find((p) => p.categorie === onglet.id) || (etat.contenu.produits || [])[0];
    if (produit) {
      $('#vedette-img').src = produit.image || '';
      $('#vedette-img').alt = produit.nom;
      $('#vedette-nom').textContent = produit.nom;
      $('#vedette-desc').textContent = produit.description || '';
      $('#vedette-prix').textContent = prix(produit.prix);
      $('#vedette-ajouter').onclick = () => ajouterAuPanier(produit.id);
    }
  }

  function rendreServices(services) {
    const grille = $('#grille-services');
    if (!grille) return;
    grille.innerHTML = (services || [])
      .map(
        (service) => `
        <article class="carte-service apparait">
          <img src="${echapper(service.image || '')}" alt="${echapper(service.titre)}" loading="lazy">
          <div class="carte-service__corps">
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
    const categories = ['tout', ...new Set((etat.contenu.produits || []).map((p) => p.categorie).filter(Boolean))];
    const libelles = { tout: 'Tout', local: 'Produits Nationaux', intl: 'Solutions Internationales' };

    zone.innerHTML = categories
      .map(
        (cat) =>
          `<button class="filtre${cat === etat.filtre ? ' actif' : ''}" data-filtre="${echapper(cat)}">${
            libelles[cat] || echapper(cat)
          }</button>`
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
      (produit) => etat.filtre === 'tout' || produit.categorie === etat.filtre
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
            <img src="${echapper(produit.image || '')}" alt="${echapper(produit.nom)}" loading="lazy">
            ${produit.badge ? `<span class="carte-produit__badge">${echapper(produit.badge)}</span>` : ''}
          </div>
          <div class="carte-produit__corps">
            <span class="carte-produit__cat">${
              produit.categorie === 'intl' ? 'Solution internationale' : 'Produit national'
            }</span>
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

    observerApparitions();
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
          <img src="${echapper(ligne.image || '')}" alt="${echapper(ligne.nom)}">
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
    const texte = encodeURIComponent(`Bonjour Linksmartech, je souhaite commander :\n${details}\n\nTotal : ${prix(total)}`);
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
        // Secours : ouverture du client mail si l'API n'est pas joignable
        const email = etat.contenu?.identite?.email || 'contact@linksmartech.com';
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
      rendreOngletsHero(donnees.contenu.hero);
      rendreServices(donnees.contenu.services);
      rendreEtapes(donnees.contenu.approche);
      rendreFiltres();
      rendreProduits();

      if (donnees.contenu.boutique?.titre) $('#boutique-titre').textContent = donnees.contenu.boutique.titre;
      if (donnees.contenu.boutique?.sousTitre) $('#boutique-soustitre').textContent = donnees.contenu.boutique.sousTitre;
      if (donnees.contenu.pied?.description) $('#pied-description').textContent = donnees.contenu.pied.description;
      $('#pied-copyright').textContent = `© ${new Date().getFullYear()} ${
        donnees.contenu.identite?.nomComplet || 'Linksmartech'
      } — ${donnees.contenu.pied?.mentions || 'Tous droits réservés.'}`;

      if (etat.reglages.portailClientActif === false) $('#btn-portail').hidden = true;
      $('#bandeau-maintenance').hidden = etat.reglages.maintenance !== true;
    }

    rendrePanier();
    brancherFormulaire();

    // Interactions d'interface (indépendantes du contenu)
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

    observerApparitions();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialiser);
  else initialiser();
})();
