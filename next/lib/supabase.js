'use strict';

/**
 * Client Supabase côté serveur (clé secret — jamais exposée au navigateur).
 *
 *  • Retourne null tant que les variables d'environnement ne sont pas
 *    renseignées : le site utilise alors le stockage local.
 *  • `supabasePret()` teste la joignabilité du projet (cache 60 s) pour
 *    basculer proprement en mode local si Supabase est hors ligne —
 *    le site reste disponible au lieu de tomber en panne.
 */

const { createClient } = require('@supabase/supabase-js');
const { supabaseConfigure } = require('./config');

let client = null;

function sb() {
  if (!supabaseConfigure()) return null;
  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false
        }
      }
    );
  }
  return client;
}

/* Test de joignabilité mis en cache (60 s) : évite un appel réseau à
   chaque requête, et permet un repli local si Supabase est injoignable. */
let etatJoignabilite = { valeur: null, le: 0 };
const DUREE_CACHE_MS = 60 * 1000;

async function supabasePret() {
  if (!supabaseConfigure()) return false;
  const maintenant = Date.now();
  if (
    etatJoignabilite.valeur !== null &&
    maintenant - etatJoignabilite.le < DUREE_CACHE_MS
  ) {
    return etatJoignabilite.valeur;
  }

  let pret = false;
  try {
    const reponse = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/health`,
      {
        headers: { apikey: process.env.SUPABASE_SERVICE_ROLE_KEY },
        signal: AbortSignal.timeout(4000)
      }
    );
    pret = reponse.ok;
  } catch {
    pret = false;
  }
  etatJoignabilite = { valeur: pret, le: maintenant };
  return pret;
}

module.exports = { sb, supabasePret };
