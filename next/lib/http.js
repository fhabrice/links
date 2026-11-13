'use strict';

/** Petits helpers pour les route handlers Next.js. */

const { utilisateurCourant } = require('./auth');

function json(donnees, { code = 200, entetes = {} } = {}) {
  return new Response(JSON.stringify(donnees), {
    status: code,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...entetes }
  });
}

async function corpsRequete(requete) {
  try {
    return await requete.json();
  } catch {
    return {};
  }
}

function nettoyer(valeur, max = 200) {
  return String(valeur ?? '').trim().slice(0, max);
}

function emailValide(valeur) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valeur);
}

/** Renvoie l'utilisateur connecté ou une Response d'erreur (401). */
async function exigerSession(requete) {
  const utilisateur = await utilisateurCourant(requete);
  if (!utilisateur) {
    return { utilisateur: null, refus: json({ erreur: 'Session expirée.' }, { code: 401 }) };
  }
  return { utilisateur, refus: null };
}

module.exports = { json, corpsRequete, nettoyer, emailValide, exigerSession };
