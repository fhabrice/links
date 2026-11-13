import { json, corpsRequete, exigerSession } from '../../../../lib/http';
import { lireContenu, ecrireContenu, journaliser } from '../../../../lib/store';

export const dynamic = 'force-dynamic';

export async function PUT(requete) {
  const { utilisateur, refus } = await exigerSession(requete);
  if (refus) return refus;

  const corps = await corpsRequete(requete);
  if (!corps.contenu || typeof corps.contenu !== 'object') {
    return json({ erreur: 'Contenu invalide.' }, { code: 400 });
  }

  await ecrireContenu(corps.contenu);
  await journaliser('contenu-maj', { par: utilisateur.identifiant });
  return json({ ok: true, contenu: await lireContenu() });
}
