/* =====================================================================
   LK-TECH (Linksmartech) — interface d'administration
   Tout passe par l'API interne : l'admin n'a jamais à saisir de
   coordonnées de base de données.
   ===================================================================== */
(function () {
  'use strict';

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));
  const etat = { contenu: null, reglages: {}, messages: [], stats: {} };

  /* ------------------------------- outils -------------------------------- */

  async function api(chemin, options = {}) {
    const reponse = await fetch(chemin, {
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
      body: options.body ? JSON.stringify(options.body) : undefined
    });
    const resultat = await reponse.json().catch(() => ({}));
    if (!reponse.ok) throw new Error(resultat.erreur || `Erreur ${reponse.status}`);
    return resultat;
  }

  function toast(message) {
    const el = $('#toast');
    el.textContent = message;
    el.classList.add('visible');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove('visible'), 2500);
  }

  function echapper(texte) {
    return String(texte ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function fichierEnDataUrl(fichier) {
    return new Promise((resolve, reject) => {
      const lecteur = new FileReader();
      lecteur.onload = () => resolve(lecteur.result);
      lecteur.onerror = () => reject(new Error('Lecture du fichier impossible.'));
      lecteur.readAsDataURL(fichier);
    });
  }

  async function televerser(fichier) {
    const dataUrl = await fichierEnDataUrl(fichier);
    const resultat = await api('/api/admin/upload', { method: 'POST', body: { dataUrl } });
    return resultat.url;
  }

  /* ------------------------------ session -------------------------------- */

  async function verifierSession() {
    try {
      const { connecte } = await api('/api/admin/session');
      if (connecte) await afficherAdmin();
      else afficherConnexion();
    } catch {
      afficherConnexion();
    }
  }

  function afficherConnexion() {
    $('#vue-connexion').hidden = false;
    $('#vue-admin').hidden = true;
  }

  async function afficherAdmin() {
    $('#vue-connexion').hidden = true;
    $('#vue-admin').hidden = false;
    await chargerEtat();
  }

  async function chargerEtat() {
    const donnees = await api('/api/admin/state');
    etat.contenu = donnees.contenu;
    etat.reglages = donnees.reglages;
    etat.messages = donnees.messages || [];
    etat.stats = donnees.stats || {};

    $('#badge-pilote').textContent =
      donnees.pilote === 'mysql' ? 'Stockage : base de données détectée' : 'Stockage : local automatique';

    $('#stat-messages').textContent = etat.stats.messages ?? 0;
    $('#stat-non-lus').textContent = etat.stats.messagesNonLus ?? 0;
    $('#stat-produits').textContent = etat.stats.produits ?? (etat.contenu.produits || []).length;
    $('#stat-services').textContent = etat.stats.services ?? (etat.contenu.services || []).length;

    const puce = $('#puce-messages');
    puce.textContent = etat.stats.messagesNonLus ?? 0;
    puce.hidden = !etat.stats.messagesNonLus;

    $('#info-stockage').textContent =
      donnees.pilote === 'mysql'
        ? "Base de données MySQL détectée automatiquement dans l'environnement : votre contenu y est stocké. Vous n'avez rien à saisir."
        : "Stockage local automatique activé : aucune installation, aucune coordonnée MySQL demandée. Tout fonctionne déjà.";

    remplirIdentite();
    remplirHero();
    remplirSpecialites();
    remplirProduits();
    remplirServices();
    remplirApproche();
    remplirMessages();
    remplirReglages();
  }

  /* ------------------------------ identité ------------------------------- */

  function remplirIdentite() {
    const i = etat.contenu.identite || {};
    $('#i-nom').value = i.nom || '';
    $('#i-slogan').value = i.slogan || '';
    $('#i-rccm').value = i.rccm || '';
    $('#i-ville').value = i.ville || '';
    $('#i-tel').value = i.telephone || '';
    $('#i-tel2').value = i.telephoneSecondaire || '';
    $('#i-email').value = i.email || '';
    $('#i-horaires').value = etat.contenu.contact?.horaires || '';
    $('#i-couleur').value = i.couleurPrimaire || '#1e3a8a';
    $('#i-accent').value = i.couleurAccent || '#eab308';
    $('#i-description').value = etat.contenu.pied?.description || '';
    $('#apercu-logo').src = i.logo || '/assets/img/logo.svg';
    $('#apercu-logo-clair').src = i.logoClair || i.logo || '/assets/img/logo-clair.svg';
  }

  async function enregistrerIdentite() {
    etat.contenu.identite = {
      ...etat.contenu.identite,
      nom: $('#i-nom').value.trim(),
      slogan: $('#i-slogan').value.trim(),
      rccm: $('#i-rccm').value.trim(),
      ville: $('#i-ville').value.trim(),
      telephone: $('#i-tel').value.trim(),
      telephoneSecondaire: $('#i-tel2').value.trim(),
      email: $('#i-email').value.trim(),
      couleurPrimaire: $('#i-couleur').value,
      couleurAccent: $('#i-accent').value
    };
    etat.contenu.contact = { ...(etat.contenu.contact || {}), horaires: $('#i-horaires').value.trim() };
    etat.contenu.pied = { ...(etat.contenu.pied || {}), description: $('#i-description').value.trim() };

    await api('/api/admin/contenu', { method: 'PUT', body: { contenu: etat.contenu } });
    toast('Identité enregistrée ✔');
  }

  async function televerserLogo(fichier, variante = 'principal') {
    if (!fichier) return;
    if (fichier.size > 4 * 1024 * 1024) return toast("L'image dépasse 4 Mo.");
    const url = await televerser(fichier);
    if (variante === 'clair') {
      etat.contenu.identite.logoClair = url;
      $('#apercu-logo-clair').src = url;
    } else {
      etat.contenu.identite.logo = url;
      $('#apercu-logo').src = url;
    }
    await api('/api/admin/contenu', { method: 'PUT', body: { contenu: etat.contenu } });
    toast(variante === 'clair' ? 'Logo (variante claire) mis à jour ✔' : 'Logo mis à jour ✔');
  }

  /* -------------------------------- hero --------------------------------- */

  function remplirHero() {
    const zone = $('#zones-hero');
    zone.innerHTML = (etat.contenu.hero?.onglets || [])
      .map(
        (onglet, index) => `
        <div class="panneau" data-onglet="${index}">
          <h3>Onglet : ${echapper(onglet.libelle)}</h3>
          <div class="grille-2">
            <div class="champ"><label>Libellé de l'onglet</label><input data-cle="libelle" value="${echapper(onglet.libelle)}"></div>
            <div class="champ"><label>Badge</label><input data-cle="badge" value="${echapper(onglet.badge)}"></div>
          </div>
          <div class="grille-2">
            <div class="champ"><label>Titre</label><input data-cle="titre" value="${echapper(onglet.titre)}"></div>
            <div class="champ"><label>Mot mis en avant</label><input data-cle="titreAccent" value="${echapper(onglet.titreAccent)}"></div>
          </div>
          <div class="champ"><label>Description</label><textarea data-cle="description" rows="2">${echapper(onglet.description)}</textarea></div>
          <div class="grille-2">
            <div class="champ"><label>Texte du bouton</label><input data-cle="boutonTexte" value="${echapper(onglet.boutonTexte)}"></div>
            <div class="champ"><label>Lien du bouton</label><input data-cle="boutonLien" value="${echapper(onglet.boutonLien)}"></div>
          </div>
        </div>`
      )
      .join('');
  }

  async function enregistrerHero() {
    $$('#zones-hero [data-onglet]').forEach((panneau) => {
      const index = Number(panneau.dataset.onglet);
      panneau.querySelectorAll('[data-cle]').forEach((champ) => {
        etat.contenu.hero.onglets[index][champ.dataset.cle] = champ.value;
      });
    });
    await api('/api/admin/contenu', { method: 'PUT', body: { contenu: etat.contenu } });
    toast('Bannière enregistrée ✔');
    remplirHero();
  }

  /* ----------------------------- spécialités ----------------------------- */

  function remplirSpecialites() {
    const zone = $('#zones-specialites');
    if (!zone) return;

    zone.innerHTML = (etat.contenu.specialites || [])
      .map(
        (specialite, index) => `
        <div class="panneau" data-specialite="${index}">
          <div class="grille-2">
            <div class="champ"><label>Titre</label><input data-cle="titre" value="${echapper(specialite.titre)}"></div>
            <div class="champ"><label>Icône</label>
              <select data-cle="icone">
                ${[['code', 'Informatique / code'], ['reseau', 'Réseau'], ['btp', 'Construction'], ['solaire', 'Solaire'], ['electricite', 'Électricité'], ['cloud', 'Cloud & sécurité']]
                  .map(([valeur, libelle]) => `<option value="${valeur}"${specialite.icone === valeur ? ' selected' : ''}>${libelle}</option>`)
                  .join('')}
              </select>
            </div>
          </div>
          <div class="champ"><label>Texte</label><textarea data-cle="texte" rows="2">${echapper(specialite.texte)}</textarea></div>
        </div>`
      )
      .join('');

    const devis = etat.contenu.vedetteDevis || {};
    $('#vd-badge').value = devis.badge || '';
    $('#vd-titre').value = devis.titre || '';
    $('#vd-texte').value = devis.texte || '';
    $('#vd-bouton').value = devis.boutonTexte || '';
    $('#vd-lien').value = devis.boutonLien || '';
  }

  async function enregistrerSpecialites() {
    $$('#zones-specialites [data-specialite]').forEach((panneau) => {
      const index = Number(panneau.dataset.specialite);
      panneau.querySelectorAll('[data-cle]').forEach((champ) => {
        etat.contenu.specialites[index][champ.dataset.cle] = champ.value;
      });
    });

    etat.contenu.vedetteDevis = {
      ...(etat.contenu.vedetteDevis || {}),
      badge: $('#vd-badge').value.trim(),
      titre: $('#vd-titre').value.trim(),
      texte: $('#vd-texte').value.trim(),
      boutonTexte: $('#vd-bouton').value.trim(),
      boutonLien: $('#vd-lien').value.trim()
    };

    await api('/api/admin/contenu', { method: 'PUT', body: { contenu: etat.contenu } });
    toast('Spécialités enregistrées ✔');
  }

  /* ------------------------------ produits ------------------------------- */

  function remplirProduits() {
    const corps = $('#corps-produits');
    const produits = etat.contenu.produits || [];
    if (!produits.length) {
      corps.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--ardoise-500);padding:2rem">Aucun produit pour le moment.</td></tr>';
      return;
    }
    corps.innerHTML = produits
      .map(
        (produit) => `
        <tr>
          <td><img src="${echapper(produit.image || '')}" alt=""></td>
          <td>
            <strong>${echapper(produit.nom)}</strong><br>
            <span style="font-size:.78rem;color:var(--ardoise-500)">${echapper(produit.description || '')}</span>
          </td>
          <td><span class="puce puce--info">${
            { informatique: 'Informatique', energie: 'Énergie', terroir: 'Terroir' }[produit.filtre] ||
            (produit.categorie === 'intl' ? 'International' : 'National')
          }</span></td>
          <td>$${Number(produit.prix || 0).toFixed(2)}</td>
          <td>${Number(produit.stock || 0)}</td>
          <td><span class="puce ${produit.actif === false ? 'puce--inactif' : 'puce--actif'}">${produit.actif === false ? 'Masqué' : 'Visible'}</span></td>
          <td style="white-space:nowrap">
            <button class="btn btn--petit btn--fantome" data-modifier="${echapper(produit.id)}">Modifier</button>
            <button class="btn btn--petit btn--fantome" data-basculer="${echapper(produit.id)}">${produit.actif === false ? 'Afficher' : 'Masquer'}</button>
            <button class="btn btn--petit btn--fantome" data-supprimer="${echapper(produit.id)}" style="color:var(--danger)">Supprimer</button>
          </td>
        </tr>`
      )
      .join('');

    corps.querySelectorAll('[data-modifier]').forEach((b) => b.addEventListener('click', () => ouvrirProduit(b.dataset.modifier)));
    corps.querySelectorAll('[data-supprimer]').forEach((b) =>
      b.addEventListener('click', async () => {
        if (!confirm('Supprimer définitivement ce produit ?')) return;
        await api(`/api/admin/produits/${b.dataset.supprimer}`, { method: 'DELETE' });
        await chargerEtat();
        toast('Produit supprimé');
      })
    );
    corps.querySelectorAll('[data-basculer]').forEach((b) =>
      b.addEventListener('click', async () => {
        const produit = etat.contenu.produits.find((p) => p.id === b.dataset.basculer);
        await api(`/api/admin/produits/${b.dataset.basculer}`, { method: 'PUT', body: { actif: produit.actif === false } });
        await chargerEtat();
      })
    );
  }

  function ouvrirProduit(idProduit) {
    const produit = idProduit ? (etat.contenu.produits || []).find((p) => p.id === idProduit) : null;
    $('#panneau-produit').hidden = false;
    $('#titre-panneau-produit').textContent = produit ? 'Modifier le produit' : 'Nouveau produit';
    $('#p-id').value = produit?.id || '';
    $('#p-nom').value = produit?.nom || '';
    $('#p-prix').value = produit?.prix ?? '';
    $('#p-description').value = produit?.description || '';
    $('#p-filtre').value = produit?.filtre ?? 'informatique';
    $('#p-stock').value = produit?.stock ?? 0;
    $('#p-badge').value = produit?.badge || '';
    $('#p-image').value = produit?.image || '';
    $('#p-actif').checked = produit?.actif !== false;
    $('#panneau-produit').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  async function enregistrerProduit() {
    const idProduit = $('#p-id').value;
    const donnees = {
      nom: $('#p-nom').value.trim(),
      prix: Number($('#p-prix').value) || 0,
      description: $('#p-description').value.trim(),
      filtre: $('#p-filtre').value,
      // La catégorie technique découle de la spécialité choisie.
      categorie: $('#p-filtre').value === 'terroir' ? 'local' : 'intl',
      stock: Number($('#p-stock').value) || 0,
      badge: $('#p-badge').value.trim(),
      image: $('#p-image').value.trim(),
      actif: $('#p-actif').checked
    };
    if (!donnees.nom) return toast('Le nom du produit est obligatoire.');

    const fichier = $('#p-fichier').files[0];
    if (fichier) {
      donnees.image = await televerser(fichier);
      $('#p-image').value = donnees.image;
    }

    if (idProduit) await api(`/api/admin/produits/${idProduit}`, { method: 'PUT', body: donnees });
    else await api('/api/admin/produits', { method: 'POST', body: donnees });

    $('#panneau-produit').hidden = true;
    $('#p-fichier').value = '';
    await chargerEtat();
    toast('Produit enregistré ✔');
  }

  /* ------------------------------ services ------------------------------- */

  function remplirServices() {
    const zone = $('#zones-services');
    zone.innerHTML = (etat.contenu.services || [])
      .map(
        (service, index) => `
        <div class="panneau" data-service="${index}">
          <div class="grille-2">
            <div class="champ"><label>Titre</label><input data-cle="titre" value="${echapper(service.titre)}"></div>
            <div class="champ"><label>Image (URL)</label><input data-cle="image" value="${echapper(service.image)}"></div>
          </div>
          <div class="champ"><label>Description</label><textarea data-cle="description" rows="2">${echapper(service.description)}</textarea></div>
          <button class="btn btn--petit btn--fantome" data-retirer-service="${index}" style="color:var(--danger);justify-self:start">Retirer ce service</button>
        </div>`
      )
      .join('');

    zone.querySelectorAll('[data-retirer-service]').forEach((b) =>
      b.addEventListener('click', () => {
        collecterServices();
        etat.contenu.services.splice(Number(b.dataset.retirerService), 1);
        remplirServices();
      })
    );
  }

  function collecterServices() {
    $$('#zones-services [data-service]').forEach((panneau) => {
      const index = Number(panneau.dataset.service);
      panneau.querySelectorAll('[data-cle]').forEach((champ) => {
        etat.contenu.services[index][champ.dataset.cle] = champ.value;
      });
    });
  }

  async function enregistrerServices() {
    collecterServices();
    await api('/api/admin/contenu', { method: 'PUT', body: { contenu: etat.contenu } });
    toast('Services enregistrés ✔');
  }

  /* ------------------------------- approche ------------------------------ */

  function remplirApproche() {
    const approche = etat.contenu.approche || { etapes: [] };
    $('#a-titre').value = approche.titre || '';
    $('#a-soustitre').value = approche.sousTitre || '';
    $('#zones-etapes').innerHTML = (approche.etapes || [])
      .map(
        (etape, index) => `
        <div class="panneau" data-etape="${index}">
          <div class="grille-2">
            <div class="champ"><label>Numéro</label><input data-cle="numero" value="${echapper(etape.numero)}"></div>
            <div class="champ"><label>Titre</label><input data-cle="titre" value="${echapper(etape.titre)}"></div>
          </div>
          <div class="champ"><label>Description</label><textarea data-cle="description" rows="2">${echapper(etape.description)}</textarea></div>
          <button class="btn btn--petit btn--fantome" data-retirer-etape="${index}" style="color:var(--danger);justify-self:start">Retirer cette étape</button>
        </div>`
      )
      .join('');

    $('#zones-etapes').querySelectorAll('[data-retirer-etape]').forEach((b) =>
      b.addEventListener('click', () => {
        collecterApproche();
        etat.contenu.approche.etapes.splice(Number(b.dataset.retirerEtape), 1);
        remplirApproche();
      })
    );
  }

  function collecterApproche() {
    etat.contenu.approche.titre = $('#a-titre').value.trim();
    etat.contenu.approche.sousTitre = $('#a-soustitre').value.trim();
    $$('#zones-etapes [data-etape]').forEach((panneau) => {
      const index = Number(panneau.dataset.etape);
      panneau.querySelectorAll('[data-cle]').forEach((champ) => {
        etat.contenu.approche.etapes[index][champ.dataset.cle] = champ.value;
      });
    });
  }

  async function enregistrerApproche() {
    collecterApproche();
    await api('/api/admin/contenu', { method: 'PUT', body: { contenu: etat.contenu } });
    toast('Approche enregistrée ✔');
  }

  /* ------------------------------- messages ------------------------------ */

  function remplirMessages() {
    const zone = $('#liste-messages');
    const messages = etat.messages || [];
    if (!messages.length) {
      zone.innerHTML = '<div class="panneau" style="text-align:center;color:var(--ardoise-500)">Aucun message pour le moment.</div>';
      $('#apercu-messages').innerHTML = '<p style="color:var(--ardoise-500);font-size:.9rem;margin:0">Pas encore de message.</p>';
      return;
    }

    zone.innerHTML = messages
      .map(
        (message) => `
        <div class="panneau" style="${message.lu ? '' : 'border-left:4px solid var(--accent)'}">
          <div style="display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap;align-items:center">
            <div>
              <strong>${echapper(message.nom)}</strong>
              <span style="color:var(--ardoise-500);font-size:.86rem"> — ${echapper(message.email)} ${
                message.telephone ? `· ${echapper(message.telephone)}` : ''
              }</span>
              <div style="font-size:.76rem;color:var(--ardoise-500);margin-top:.2rem">
                ${new Date(message.recuLe).toLocaleString('fr-FR')} · ${echapper(message.sujet || '')}
              </div>
            </div>
            <div style="display:flex;gap:.4rem">
              <a class="btn btn--petit btn--fantome" href="mailto:${echapper(message.email)}?subject=Réponse LK-TECH">Répondre</a>
              <button class="btn btn--petit btn--fantome" data-lu="${echapper(message.id)}">${message.lu ? 'Marquer non lu' : 'Marquer lu'}</button>
              <button class="btn btn--petit btn--fantome" data-effacer="${echapper(message.id)}" style="color:var(--danger)">Supprimer</button>
            </div>
          </div>
          <p style="margin:.9rem 0 0;font-size:.92rem;white-space:pre-wrap">${echapper(message.message)}</p>
        </div>`
      )
      .join('');

    $('#apercu-messages').innerHTML = messages
      .slice(0, 5)
      .map(
        (message) => `
        <div style="padding:.65rem 0;border-bottom:1px solid var(--ardoise-100);font-size:.9rem">
          <strong>${echapper(message.nom)}</strong>
          <span style="color:var(--ardoise-500)"> — ${echapper((message.message || '').slice(0, 90))}${(message.message || '').length > 90 ? '…' : ''}</span>
        </div>`
      )
      .join('');

    zone.querySelectorAll('[data-lu]').forEach((b) =>
      b.addEventListener('click', async () => {
        const message = etat.messages.find((m) => m.id === b.dataset.lu);
        await api(`/api/admin/messages/${b.dataset.lu}`, { method: 'PATCH', body: { lu: !message.lu } });
        await chargerEtat();
      })
    );

    zone.querySelectorAll('[data-effacer]').forEach((b) =>
      b.addEventListener('click', async () => {
        if (!confirm('Supprimer ce message ?')) return;
        await api(`/api/admin/messages/${b.dataset.effacer}`, { method: 'DELETE' });
        await chargerEtat();
        toast('Message supprimé');
      })
    );
  }

  /* ------------------------------- réglages ------------------------------ */

  function remplirReglages() {
    $('#r-devise').value = etat.reglages.devise || 'USD';
    $('#r-portail').checked = etat.reglages.portailClientActif !== false;
    $('#r-maintenance').checked = etat.reglages.maintenance === true;
  }

  async function enregistrerReglages() {
    await api('/api/admin/reglages', {
      method: 'PUT',
      body: {
        reglages: {
          devise: $('#r-devise').value.trim() || 'USD',
          portailClientActif: $('#r-portail').checked,
          maintenance: $('#r-maintenance').checked
        }
      }
    });
    toast('Réglages enregistrés ✔');
  }

  /* ------------------------------ évènements ----------------------------- */

  function brancherEvenements() {
    // Connexion / déconnexion
    $('#formulaire-connexion').addEventListener('submit', async (evenement) => {
      evenement.preventDefault();
      const erreur = $('#connexion-erreur');
      const bouton = $('#bouton-connexion');
      erreur.classList.remove('visible');
      bouton.disabled = true;
      bouton.textContent = 'Connexion…';
      try {
        await api('/api/admin/login', {
          method: 'POST',
          body: { identifiant: $('#identifiant').value.trim(), motDePasse: $('#motDePasse').value }
        });
        $('#motDePasse').value = '';
        await afficherAdmin();
      } catch (e) {
        erreur.textContent = e.message;
        erreur.classList.add('visible');
      } finally {
        bouton.disabled = false;
        bouton.textContent = 'Se connecter';
      }
    });

    $('#bouton-deconnexion').addEventListener('click', async () => {
      await api('/api/admin/logout', { method: 'POST' });
      afficherConnexion();
    });

    // Navigation
    $$('#menu-admin button').forEach((bouton) => {
      bouton.addEventListener('click', () => {
        $$('#menu-admin button').forEach((b) => b.classList.remove('actif'));
        bouton.classList.add('actif');
        $$('.vue').forEach((vue) => vue.classList.remove('active'));
        $(`#vue-${bouton.dataset.vue}`).classList.add('active');
      });
    });

    // Identité
    $('#enregistrer-identite').addEventListener('click', () => enregistrerIdentite().catch((e) => toast(e.message)));
    $('#fichier-logo').addEventListener('change', (e) => televerserLogo(e.target.files[0], 'principal').catch((err) => toast(err.message)));
    $('#fichier-logo-clair').addEventListener('change', (e) => televerserLogo(e.target.files[0], 'clair').catch((err) => toast(err.message)));
    $('#enregistrer-specialites').addEventListener('click', () => enregistrerSpecialites().catch((e) => toast(e.message)));

    // Hero
    const zoneHero = $('#zones-hero');
    const boutonHero = document.createElement('div');
    boutonHero.className = 'barre-actions';
    boutonHero.innerHTML = '<button class="btn" id="enregistrer-hero">Enregistrer la bannière</button>';
    zoneHero.after(boutonHero);
    $('#enregistrer-hero').addEventListener('click', () => enregistrerHero().catch((e) => toast(e.message)));

    // Produits
    $('#nouveau-produit').addEventListener('click', () => ouvrirProduit(null));
    $('#rafraichir-produits').addEventListener('click', () => chargerEtat().then(() => toast('Liste actualisée')));
    $('#enregistrer-produit').addEventListener('click', () => enregistrerProduit().catch((e) => toast(e.message)));
    $('#annuler-produit').addEventListener('click', () => { $('#panneau-produit').hidden = true; });

    // Services
    $('#ajouter-service').addEventListener('click', () => {
      collecterServices();
      etat.contenu.services.push({ titre: 'Nouveau service', description: '', image: '' });
      remplirServices();
    });
    $('#enregistrer-services').addEventListener('click', () => enregistrerServices().catch((e) => toast(e.message)));

    // Approche
    $('#ajouter-etape').addEventListener('click', () => {
      collecterApproche();
      etat.contenu.approche.etapes.push({
        numero: String(etat.contenu.approche.etapes.length + 1).padStart(2, '0'),
        titre: 'Nouvelle étape',
        description: ''
      });
      remplirApproche();
    });
    $('#enregistrer-approche').addEventListener('click', () => enregistrerApproche().catch((e) => toast(e.message)));

    // Réglages
    $('#enregistrer-reglages').addEventListener('click', () => enregistrerReglages().catch((e) => toast(e.message)));

    // Sécurité
    $('#enregistrer-mdp').addEventListener('click', async () => {
      const succes = $('#mdp-succes');
      const erreur = $('#mdp-erreur');
      succes.classList.remove('visible');
      erreur.classList.remove('visible');
      try {
        await api('/api/admin/mot-de-passe', {
          method: 'POST',
          body: { actuel: $('#mdp-actuel').value, nouveau: $('#mdp-nouveau').value }
        });
        succes.textContent = 'Mot de passe mis à jour.';
        succes.classList.add('visible');
        $('#mdp-actuel').value = '';
        $('#mdp-nouveau').value = '';
      } catch (e) {
        erreur.textContent = e.message;
        erreur.classList.add('visible');
      }
    });

    // Système
    $('#bouton-reinitialiser').addEventListener('click', async () => {
      if (!confirm('Restaurer le contenu d\'origine du site ? Vos messages seront conservés.')) return;
      await api('/api/admin/reinitialiser', { method: 'POST' });
      await chargerEtat();
      toast('Contenu réinitialisé');
    });
  }

  /* --------------------------------- init --------------------------------- */

  brancherEvenements();
  verifierSession();
})();
