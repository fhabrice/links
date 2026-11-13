import { json, exigerSession } from '../../../../lib/http';
import { lireContenu, lireReglages, statistiques } from '../../../../lib/store';

export const dynamic = 'force-dynamic';

export async function GET(requete) {
  const { utilisateur, refus } = await exigerSession(requete);
  if (refus) return refus;

  const [stats, contenu, reglages] = await Promise.all([
    statistiques(),
    lireContenu(),
    lireReglages()
  ]);

  return json({
    utilisateur: { identifiant: utilisateur.identifiant, role: utilisateur.role },
    stats,
    contenu,
    reglages
  });
}
