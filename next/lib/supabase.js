'use strict';

/**
 * Client Supabase côté serveur (clé service_role — jamais exposée au
 * navigateur). Retourne null tant que les variables d'environnement
 * ne sont pas renseignées : le site utilise alors le stockage local.
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

module.exports = { sb };
