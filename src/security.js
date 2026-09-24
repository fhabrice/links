'use strict';

/**
 * Authentification de l'admin : hachage scrypt + sessions signées (HMAC).
 * Aucun service externe, aucune base à configurer.
 */

const crypto = require('crypto');

const DUREE_SESSION_MS = 12 * 60 * 60 * 1000; // 12 h
let secretSession = crypto.randomBytes(32);

function definirSecret(secret) {
  if (secret) secretSession = Buffer.from(String(secret));
}

/* --------------------------- mots de passe --------------------------- */

function hacher(motDePasse) {
  const sel = crypto.randomBytes(16);
  const derive = crypto.scryptSync(String(motDePasse), sel, 64);
  return `scrypt$${sel.toString('hex')}$${derive.toString('hex')}`;
}

function verifier(motDePasse, empreinte) {
  try {
    const [algo, selHex, deriveHex] = String(empreinte).split('$');
    if (algo !== 'scrypt') return false;
    const derive = crypto.scryptSync(String(motDePasse), Buffer.from(selHex, 'hex'), 64);
    const attendu = Buffer.from(deriveHex, 'hex');
    return derive.length === attendu.length && crypto.timingSafeEqual(derive, attendu);
  } catch {
    return false;
  }
}

/** Les mots de passe stockés en clair (seed) sont hachés à la volée. */
function estHache(valeur) {
  return typeof valeur === 'string' && valeur.startsWith('scrypt$');
}

/* ----------------------------- sessions ------------------------------ */

function signer(charge) {
  const corps = Buffer.from(JSON.stringify(charge)).toString('base64url');
  const signature = crypto.createHmac('sha256', secretSession).update(corps).digest('base64url');
  return `${corps}.${signature}`;
}

function verifierJeton(jeton) {
  if (!jeton || typeof jeton !== 'string' || !jeton.includes('.')) return null;
  const [corps, signature] = jeton.split('.');
  const attendu = crypto.createHmac('sha256', secretSession).update(corps).digest('base64url');
  if (
    signature.length !== attendu.length ||
    !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(attendu))
  ) {
    return null;
  }
  try {
    const charge = JSON.parse(Buffer.from(corps, 'base64url').toString('utf8'));
    if (!charge.exp || charge.exp < Date.now()) return null;
    return charge;
  } catch {
    return null;
  }
}

function creerJeton(utilisateur) {
  return signer({
    sub: utilisateur.id,
    identifiant: utilisateur.identifiant,
    role: utilisateur.role,
    exp: Date.now() + DUREE_SESSION_MS
  });
}

/* -------------------------- anti-force brute ------------------------- */

const tentatives = new Map();

function tropDeTentatives(cle) {
  const entree = tentatives.get(cle);
  if (!entree) return false;
  if (Date.now() - entree.debut > 10 * 60 * 1000) {
    tentatives.delete(cle);
    return false;
  }
  return entree.compteur >= 8;
}

function noterEchec(cle) {
  const entree = tentatives.get(cle) || { compteur: 0, debut: Date.now() };
  entree.compteur += 1;
  tentatives.set(cle, entree);
}

function reinitialiserTentatives(cle) {
  tentatives.delete(cle);
}

module.exports = {
  hacher,
  verifier,
  estHache,
  creerJeton,
  verifierJeton,
  definirSecret,
  tropDeTentatives,
  noterEchec,
  reinitialiserTentatives,
  DUREE_SESSION_MS
};
