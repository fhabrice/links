'use strict';

/**
 * Routeur de l'API Linksmartech.
 *
 * Aucune route ne réclame de coordonnées de base de données : la persistance est
 * entièrement prise en charge par src/store.js (JSON local ou MySQL détecté).
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const securite = require('./security');
const { fusionner, DOSSIER_DATA } = require('./store');
const { CONTENU_DEFAUT, REGLAGES_DEFAUT } = require('./defaults');

const COOKIE = 'lm_session';

/* ------------------------------ outils ------------------------------- */

function lireCookies(entetes = {}) {
  const brut = entetes.cookie || '';
  return Object.fromEntries(
    brut
      .split(';')
      .map((partie) => partie.trim().split('='))
      .filter((paire) => paire.length === 2)
      .map(([cle, valeur]) => [cle, decodeURIComponent(valeur)])
  );
}

function jetonDe(requete) {
  const cookies = lireCookies(requete.entetes);
  if (cookies[COOKIE]) return cookies[COOKIE];
  const auth = requete.entetes.authorization || '';
  if (auth.startsWith('Bearer ')) return auth.slice(7);
  return null;
}

async function utilisateurCourant(requete, contexte) {
  const charge = securite.verifierJeton(jetonDe(requete));
  if (!charge) return null;
  const securite_ = await contexte.stockage.lireSecurite();
  const utilisateur = (securite_.utilisateurs || []).find((u) => u.id === charge.sub);
  return utilisateur || null;
}

function nettoyer(texte, longueurMax = 400) {
  return String(texte ?? '')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .trim()
    .slice(0, longueurMax);
}

function emailValide(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

/* ----------------------- contenu public (vitrine) -------------------- */

function contenuVitrine(contenu, reglages) {
  const copie = JSON.parse(JSON.stringify(contenu));
  copie.produits = (copie.produits || []).filter((p) => p.actif !== false);
  copie.identite = copie.identite || {};
  return {
    contenu: copie,
    reglages: {
      devise: reglages.devise || 'USD',
      portailClientActif: reglages.portailClientActif !== false,
      maintenance: reglages.maintenance === true
    }
  };
}

/* --------------------------------- API ------------------------------- */

async function traiter(requete) {
  const { methode, chemin, corps, contexte } = requete;
  const { stockage } = contexte;

  /* ============================ PUBLIC ============================ */

  if (chemin === '/api/health' && methode === 'GET') {
    return {
      corps: {
        statut: 'ok',
        pilote: contexte.pilote,
        horodatage: new Date().toISOString()
      }
    };
  }

  if (chemin === '/api/site' && methode === 'GET') {
    const [contenu, reglages] = await Promise.all([
      stockage.lireContenu(),
      stockage.lireReglages()
    ]);
    return { corps: contenuVitrine(contenu, reglages), entetes: { 'Cache-Control': 'no-store' } };
  }

  if (chemin === '/api/contact' && methode === 'POST') {
    const message = {
      nom: nettoyer(corps.nom, 120),
      email: nettoyer(corps.email, 160),
      telephone: nettoyer(corps.telephone, 40),
      sujet: nettoyer(corps.sujet, 140) || 'Demande via le site',
      message: nettoyer(corps.message, 4000)
    };

    if (!message.nom || !emailValide(message.email) || message.message.length < 5) {
      return { code: 400, corps: { erreur: 'Merci de renseigner votre nom, un e-mail valide et un message.' } };
    }

    const enregistre = await stockage.ajouterMessage(message);
    await stockage.journaliser('message-rec', { id: enregistre.id, email: message.email });
    return { code: 201, corps: { ok: true, id: enregistre.id, message: 'Message enregistré.' } };
  }

  /* ======================== AUTHENTIFICATION ====================== */

  if (chemin === '/api/admin/login' && methode === 'POST') {
    const identifiant = nettoyer(corps.identifiant, 80);
    const motDePasse = String(corps.motDePasse ?? '');
    const cle = `${identifiant}|${requete.entetes['x-forwarded-for'] || 'local'}`;

    if (securite.tropDeTentatives(cle)) {
      return { code: 429, corps: { erreur: 'Trop de tentatives. Réessayez dans quelques minutes.' } };
    }

    const donnees = await stockage.lireSecurite();
    const utilisateur = (donnees.utilisateurs || []).find(
      (u) => u.identifiant.toLowerCase() === identifiant.toLowerCase()
    );

    // Le mot de passe de départ est haché à la volée puis remplacé par son empreinte.
    let valide = false;
    if (utilisateur) {
      if (securite.estHache(utilisateur.motDePasse)) {
        valide = securite.verifier(motDePasse, utilisateur.motDePasse);
      } else {
        valide = utilisateur.motDePasse === motDePasse;
        if (valide) {
          utilisateur.motDePasse = securite.hacher(motDePasse);
          await stockage.ecrireSecurite(donnees);
        }
      }
    }

    if (!valide) {
      securite.noterEchec(cle);
      await stockage.journaliser('connexion-echouee', { identifiant });
      return { code: 401, corps: { erreur: 'Identifiant ou mot de passe incorrect.' } };
    }

    securite.reinitialiserTentatives(cle);
    const jeton = securite.creerJeton(utilisateur);
    await stockage.journaliser('connexion', { identifiant: utilisateur.identifiant });

    return {
      corps: {
        ok: true,
        utilisateur: { identifiant: utilisateur.identifiant, role: utilisateur.role }
      },
      entetes: { 'X-Session-Token': jeton },
      cookie: `${COOKIE}=${encodeURIComponent(jeton)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${
        securite.DUREE_SESSION_MS / 1000
      }`
    };
  }

  /* --- À partir d'ici, tout exige une session valide --- */
  const utilisateur = await utilisateurCourant(requete, contexte);
  if (chemin.startsWith('/api/admin/')) {
    if (chemin === '/api/admin/session' && methode === 'GET') {
      return {
        corps: utilisateur
          ? { connecte: true, utilisateur: { identifiant: utilisateur.identifiant, role: utilisateur.role } }
          : { connecte: false }
      };
    }
    if (chemin === '/api/admin/logout' && methode === 'POST') {
      return { corps: { ok: true }, cookie: `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0` };
    }
    if (!utilisateur) {
      return { code: 401, corps: { erreur: 'Session expirée. Reconnectez-vous.' } };
    }
  }

  /* ========================== TABLEAU DE BORD ===================== */

  if (chemin === '/api/admin/state' && methode === 'GET') {
    const [contenu, reglages, stats, messages] = await Promise.all([
      stockage.lireContenu(),
      stockage.lireReglages(),
      stockage.statistiques(),
      stockage.lireMessages()
    ]);
    return {
      corps: {
        contenu,
        reglages,
        stats,
        messages: messages.slice(0, 50),
        pilote: contexte.pilote
      }
    };
  }

  if (chemin === '/api/admin/contenu' && methode === 'PUT') {
    const actuel = await stockage.lireContenu();
    const fusionne = fusionner(actuel, corps.contenu || corps);
    const enregistre = await stockage.ecrireContenu(fusionne);
    await stockage.journaliser('contenu-modifie', { utilisateur: utilisateur.identifiant });
    return { corps: { ok: true, contenu: enregistre } };
  }

  if (chemin === '/api/admin/reglages' && methode === 'PUT') {
    const enregistre = await stockage.ecrireReglages(corps.reglages || corps);
    await stockage.journaliser('reglages-modifies', { utilisateur: utilisateur.identifiant });
    return { corps: { ok: true, reglages: enregistre } };
  }

  /* ============================= PRODUITS ========================= */

  if (chemin === '/api/admin/produits' && methode === 'POST') {
    const contenu = await stockage.lireContenu();
    const produit = {
      id: `p-${crypto.randomBytes(5).toString('hex')}`,
      nom: nettoyer(corps.nom, 140) || 'Nouveau produit',
      description: nettoyer(corps.description, 600),
      prix: Number(corps.prix) || 0,
      devise: nettoyer(corps.devise, 8) || 'USD',
      categorie: corps.categorie === 'intl' ? 'intl' : 'local',
      badge: nettoyer(corps.badge, 40),
      image: nettoyer(corps.image, 500),
      stock: Number(corps.stock) || 0,
      actif: corps.actif !== false
    };
    contenu.produits = [produit, ...(contenu.produits || [])];
    await stockage.ecrireContenu(contenu);
    await stockage.journaliser('produit-ajoute', { id: produit.id });
    return { code: 201, corps: { ok: true, produit } };
  }

  if (chemin.startsWith('/api/admin/produits/') && methode === 'PUT') {
    const idProduit = chemin.split('/').pop();
    const contenu = await stockage.lireContenu();
    const index = (contenu.produits || []).findIndex((p) => p.id === idProduit);
    if (index === -1) return { code: 404, corps: { erreur: 'Produit introuvable.' } };
    contenu.produits[index] = { ...contenu.produits[index], ...corps };
    await stockage.ecrireContenu(contenu);
    await stockage.journaliser('produit-modifie', { id: idProduit });
    return { corps: { ok: true, produit: contenu.produits[index] } };
  }

  if (chemin.startsWith('/api/admin/produits/') && methode === 'DELETE') {
    const idProduit = chemin.split('/').pop();
    const contenu = await stockage.lireContenu();
    contenu.produits = (contenu.produits || []).filter((p) => p.id !== idProduit);
    await stockage.ecrireContenu(contenu);
    await stockage.journaliser('produit-supprime', { id: idProduit });
    return { corps: { ok: true } };
  }

  /* ======================== SERVICES / ÉTAPES ===================== */

  if (chemin === '/api/admin/services' && methode === 'PUT') {
    const contenu = await stockage.lireContenu();
    contenu.services = Array.isArray(corps.services) ? corps.services : contenu.services;
    await stockage.ecrireContenu(contenu);
    return { corps: { ok: true, services: contenu.services } };
  }

  /* ============================ MESSAGES ========================== */

  if (chemin === '/api/admin/messages' && methode === 'GET') {
    return { corps: { messages: await stockage.lireMessages() } };
  }

  if (chemin.startsWith('/api/admin/messages/')) {
    const idMessage = chemin.split('/').pop();
    if (methode === 'PATCH') {
      const message = await stockage.marquerMessage(idMessage, corps.lu !== false);
      return { corps: { ok: true, message } };
    }
    if (methode === 'DELETE') {
      await stockage.supprimerMessage(idMessage);
      return { corps: { ok: true } };
    }
  }

  /* ============================= UPLOADS ========================== */

  if (chemin === '/api/admin/upload' && methode === 'POST') {
    const chaine = String(corps.dataUrl || '');
    const correspondance = chaine.match(/^data:(image\/(png|jpeg|jpg|webp|svg\+xml|gif));base64,(.+)$/i);
    if (!correspondance) {
      return { code: 400, corps: { erreur: 'Image invalide (PNG, JPG, WEBP, SVG ou GIF attendu).' } };
    }
    const extension = correspondance[2].toLowerCase().replace('jpeg', 'jpg').replace('svg+xml', 'svg');
    const donnees = Buffer.from(correspondance[3], 'base64');
    if (donnees.length > 4 * 1024 * 1024) {
      return { code: 413, corps: { erreur: "L'image dépasse 4 Mo." } };
    }
    const nom = `img-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${extension}`;
    const dossier = path.join(DOSSIER_DATA, 'uploads');
    fs.mkdirSync(dossier, { recursive: true });
    fs.writeFileSync(path.join(dossier, nom), donnees);
    await stockage.journaliser('image-televersee', { nom });
    return { code: 201, corps: { ok: true, url: `/uploads/${nom}` } };
  }

  /* ======================= MOT DE PASSE / EXPORT ==================== */

  if (chemin === '/api/admin/mot-de-passe' && methode === 'POST') {
    const actuel = String(corps.actuel ?? '');
    const nouveau = String(corps.nouveau ?? '');
    if (nouveau.length < 6) {
      return { code: 400, corps: { erreur: 'Le nouveau mot de passe doit contenir au moins 6 caractères.' } };
    }
    const donnees = await stockage.lireSecurite();
    const cible = (donnees.utilisateurs || []).find((u) => u.id === utilisateur.id);
    const correct =
      securite.estHache(cible.motDePasse) && securite.verifier(actuel, cible.motDePasse)
        ? true
        : !securite.estHache(cible.motDePasse) && cible.motDePasse === actuel;
    if (!correct) return { code: 401, corps: { erreur: 'Mot de passe actuel incorrect.' } };

    cible.motDePasse = securite.hacher(nouveau);
    await stockage.ecrireSecurite(donnees);
    await stockage.journaliser('mot-de-passe-modifie', { utilisateur: utilisateur.identifiant });
    return { corps: { ok: true, message: 'Mot de passe mis à jour.' } };
  }

  if (chemin === '/api/admin/export' && methode === 'GET') {
    const [contenu, reglages, messages] = await Promise.all([
      stockage.lireContenu(),
      stockage.lireReglages(),
      stockage.lireMessages()
    ]);
    return {
      corps: { exporteLe: new Date().toISOString(), contenu, reglages, messages },
      entetes: { 'Content-Disposition': 'attachment; filename="linksmartech-export.json"' }
    };
  }

  if (chemin === '/api/admin/reinitialiser' && methode === 'POST') {
    await stockage.ecrireContenu(CONTENU_DEFAUT);
    await stockage.ecrireReglages(REGLAGES_DEFAUT);
    await stockage.journaliser('contenu-reinitialise', { utilisateur: utilisateur.identifiant });
    return { corps: { ok: true, contenu: CONTENU_DEFAUT } };
  }

  return { code: 404, corps: { erreur: 'Route API inconnue.' } };
}

module.exports = { traiter, contenuVitrine };
