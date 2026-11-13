import { json, corpsRequete, exigerSession } from '../../../../../lib/http';
import { marquerMessage, supprimerMessage, journaliser } from '../../../../../lib/store';

export const dynamic = 'force-dynamic';

export async function PATCH(requete, contexte) {
  const { utilisateur, refus } = await exigerSession(requete);
  if (refus) return refus;

  const { id } = await contexte.params;
  const corps = await corpsRequete(requete);
  const modifie = await marquerMessage(id, corps.lu);
  if (!modifie) return json({ erreur: 'Message introuvable.' }, { code: 404 });

  await journaliser('message-lu', { id, lu: Boolean(corps.lu), par: utilisateur.identifiant });
  return json({ ok: true, message: modifie });
}

export async function DELETE(requete, contexte) {
  const { utilisateur, refus } = await exigerSession(requete);
  if (refus) return refus;

  const { id } = await contexte.params;
  const supprime = await supprimerMessage(id);
  if (!supprime) return json({ erreur: 'Message introuvable.' }, { code: 404 });

  await journaliser('message-supprime', { id, par: utilisateur.identifiant });
  return json({ ok: true });
}
