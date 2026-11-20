import { json, corpsRequete, exigerSession } from '../../../../lib/http';
import { lireContenu, ecrireContenu, journaliser } from '../../../../lib/store';

export const dynamic = 'force-dynamic';

function texte(valeur, max) {
  return String(valeur ?? '').trim().slice(0, max);
}

/**
 * Enregistre la section « Nos logiciels » (vitrine de vente).
 * Le reste du contenu du site est préservé.
 */
export async function PUT(requete) {
  const { utilisateur, refus } = await exigerSession(requete);
  if (refus) return refus;

  const corps = await corpsRequete(requete);
  const brut = corps.logiciels;
  if (!brut || typeof brut !== 'object' || Array.isArray(brut)) {
    return json({ erreur: 'Données de logiciels invalides.' }, { code: 400 });
  }

  const itemsBruts = Array.isArray(brut.items) ? brut.items : [];
  const items = itemsBruts.map((l, i) => ({
    id: texte(l.id, 60) || `log-${Date.now()}-${i}`,
    nom: texte(l.nom, 120),
    icone: texte(l.icone, 8) || '💾',
    badge: texte(l.badge, 60),
    pitch: texte(l.pitch, 160),
    explication: texte(l.explication, 2500),
    fonctionnalites: (Array.isArray(l.fonctionnalites) ? l.fonctionnalites : [])
      .map((f) => texte(f, 160))
      .filter(Boolean)
      .slice(0, 12),
    prix: Number(l.prix) || 0,
    devise: l.devise === 'CDF' ? 'CDF' : 'USD',
    typePrix: texte(l.typePrix, 60),
    actif: l.actif !== false
  }));

  if (items.some((l) => !l.nom)) {
    return json(
      { erreur: 'Chaque logiciel doit avoir un nom.' },
      { code: 400 }
    );
  }

  const logiciels = {
    titre: texte(brut.titre, 200) || 'Nos logiciels',
    sousTitre: texte(brut.sousTitre, 600),
    texteBouton: texte(brut.texteBouton, 80) || 'Demander une démo',
    items
  };

  const contenu = await lireContenu();
  contenu.logiciels = logiciels;
  await ecrireContenu(contenu);
  await journaliser('logiciels-maj', {
    par: utilisateur.identifiant,
    nb: items.length
  });

  return json({ ok: true, logiciels });
}
