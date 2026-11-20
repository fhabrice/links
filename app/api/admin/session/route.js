import { json } from '../../../../lib/http';
import { utilisateurCourant } from '../../../../lib/auth';

export const dynamic = 'force-dynamic';

/** Indique si une session admin est active (cookie lk_session). */
export async function GET(requete) {
  const utilisateur = await utilisateurCourant(requete);
  return json({
    connecte: Boolean(utilisateur),
    utilisateur: utilisateur
      ? { identifiant: utilisateur.identifiant, role: utilisateur.role }
      : null
  });
}
