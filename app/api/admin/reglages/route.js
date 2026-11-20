import { json, corpsRequete, exigerSession } from '../../../../lib/http';
import { ecrireReglages, journaliser } from '../../../../lib/store';

export const dynamic = 'force-dynamic';

export async function PUT(requete) {
  const { utilisateur, refus } = await exigerSession(requete);
  if (refus) return refus;

  const corps = await corpsRequete(requete);
  if (!corps.reglages || typeof corps.reglages !== 'object') {
    return json({ erreur: 'Réglages invalides.' }, { code: 400 });
  }

  await ecrireReglages(corps.reglages);
  await journaliser('reglages-maj', { par: utilisateur.identifiant });
  return json({ ok: true });
}
