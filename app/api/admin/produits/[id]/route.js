import { json, corpsRequete, exigerSession } from '../../../../../lib/http';
import {
  listerProduits,
  modifierProduit,
  supprimerProduit,
  journaliser
} from '../../../../../lib/store';

export const dynamic = 'force-dynamic';

export async function PUT(requete, contexte) {
  const { utilisateur, refus } = await exigerSession(requete);
  if (refus) return refus;

  const { id } = await contexte.params;
  const corps = await corpsRequete(requete);
  const modifie = await modifierProduit(id, corps.produit || corps);
  if (!modifie) return json({ erreur: 'Produit introuvable.' }, { code: 404 });

  await journaliser('produit-modifie', { id, par: utilisateur.identifiant });
  return json({ ok: true, produit: modifie });
}

export async function DELETE(requete, contexte) {
  const { utilisateur, refus } = await exigerSession(requete);
  if (refus) return refus;

  const { id } = await contexte.params;
  const supprime = await supprimerProduit(id);
  if (!supprime) return json({ erreur: 'Produit introuvable.' }, { code: 404 });

  await journaliser('produit-supprime', { id, par: utilisateur.identifiant });
  return json({ ok: true });
}
