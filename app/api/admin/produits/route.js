import { json, corpsRequete, nettoyer, exigerSession } from '../../../../lib/http';
import { listerProduits, ajouterProduit, journaliser } from '../../../../lib/store';

export const dynamic = 'force-dynamic';

export async function GET(requete) {
  const { refus } = await exigerSession(requete);
  if (refus) return refus;
  return json({ produits: await listerProduits({ admin: true }) });
}

export async function POST(requete) {
  const { utilisateur, refus } = await exigerSession(requete);
  if (refus) return refus;

  const corps = await corpsRequete(requete);
  if (!nettoyer(corps.nom, 200)) {
    return json({ erreur: 'Le nom du produit est requis.' }, { code: 400 });
  }

  const cree = await ajouterProduit(corps);
  await journaliser('produit-ajoute', { id: cree.id, par: utilisateur.identifiant });
  return json({ ok: true, produit: cree }, { code: 201 });
}
