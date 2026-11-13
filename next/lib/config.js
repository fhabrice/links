'use strict';

/** Détection du pilote de stockage : 'supabase' ou 'local'. */

function supabaseConfigure() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

function modePilote() {
  return supabaseConfigure() ? 'supabase' : 'local';
}

module.exports = { supabaseConfigure, modePilote };
