import { json } from '../../../../lib/http';
import { utilisateurCourant, cookieEfface } from '../../../../lib/auth';
import { sb, supabasePret } from '../../../../lib/supabase';

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
  if ((await supabasePret()) && utilisateur?.jeton) {
    try {
      await sb().auth.admin.signOut(utilisateur.jeton);
    } catch {
      /* cookie effacé dans tous les cas */
    }
  }
  return json({ ok: true }, { entetes: { 'Set-Cookie': cookieEfface() } });
}
