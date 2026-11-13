'use strict';

/**
 * Sessions signées (HMAC-SHA256) pour le mode local, et lecture des
 * jetons Supabase Auth pour le mode Supabase.
 */

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { sb } = require('./supabase');
const { supabaseConfigure } = require('./config');

const NOM_COOKIE = 'lk_session';
const DUREE_SESSION_MS = 12 * 60 * 60 * 1000; // 12 h

function dossierData() {
  return process.env.LK_DATA_DIR || path.join(process.cwd(), 'data');
}

function secretLocal() {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;
  const fichier = path.join(dossierData(), '.session-secret');
  try {
    return fs.readFileSync(fichier, 'utf8');
  } catch {
    fs.mkdirSync(dossierData(), { recursive: true });
    const cle = crypto.randomBytes(32).toString('hex');
    fs.writeFileSync(fichier, cle, { mode: 0o600 });
    return cle;
  }
}

function creerJeton(payload) {
  const corps = Buffer.from(
    JSON.stringify({ ...payload, exp: Date.now() + DUREE_SESSION_MS })
  ).toString('base64url');
  const signature = crypto
    .createHmac('sha256', secretLocal())
    .update(corps)
    .digest('base64url');
  return `${corps}.${signature}`;
}

function lireJetonLocal(token) {
  if (!token || !token.includes('.')) return null;
  const [corps, signature] = token.split('.');
  const attendue = crypto
    .createHmac('sha256', secretLocal())
    .update(corps)
    .digest('base64url');
  const a = Buffer.from(signature);
  const b = Buffer.from(attendue);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(corps, 'base64url').toString('utf8'));
    if (!payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

/** Renvoie l'utilisateur courant (cookie) ou null. */
async function utilisateurCourant(requete) {
  const token =
    requete.cookies?.get?.(NOM_COOKIE)?.value ||
    (requete.headers?.get?.('cookie') || '')
      .split(';')
      .map((b) => b.trim())
      .find((b) => b.startsWith(`${NOM_COOKIE}=`))
      ?.slice(NOM_COOKIE.length + 1);

  if (!token) return null;

  if (supabaseConfigure()) {
    try {
      const { data, error } = await sb().auth.getUser(token);
      if (error || !data?.user) return null;
      return {
        identifiant: data.user.email,
        role: 'admin',
        jeton: token,
        pilote: 'supabase'
      };
    } catch {
      return null;
    }
  }

  const payload = lireJetonLocal(decodeURIComponent(token));
  if (!payload) return null;
  return { ...payload, pilote: 'local' };
}

/** Valeur d'en-tête Set-Cookie complète. */
function cookieSession(valeur) {
  return `${NOM_COOKIE}=${encodeURIComponent(valeur)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${
    DUREE_SESSION_MS / 1000
  }`;
}

function cookieEfface() {
  return `${NOM_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

module.exports = {
  NOM_COOKIE,
  DUREE_SESSION_MS,
  creerJeton,
  utilisateurCourant,
  cookieSession,
  cookieEfface,
  dossierData
};
