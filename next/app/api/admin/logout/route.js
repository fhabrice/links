import { json } from '../../../../lib/http';
import { utilisateurCourant, cookieEfface } from '../../../../lib/auth';
import { sb } from '../../../../lib/supabase';
import { supabaseConfigure } from '../../../../lib/store';

export const dynamic = 'force-dynamic';

export async function GET(requete) {
  const utilisateur = await utilisateurCourant(requete);
  return json({
    connecte: Boolean(utilisateur),
    utilisateur: utilisateur
      ? { identifiant: utilisateur.identifiant, role: utilisateur.role }
      : null
  });
}

export async function POST(requete) {
  const utilisateur = await utilisateurCourant(requete);
  if (supabaseConfigure() && utilisateur?.jeton) {
    try {
      await sb().auth.admin.signOut(utilisateur.jeton);
    } catch {
      /* cookie effacé dans tous les cas */
    }
  }
  return json({ ok: true }, { entetes: { 'Set-Cookie': cookieEfface() } });
}
