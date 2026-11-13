'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from './api-client';

export default function OngletProduits({ rafraichir }) {
  const [produits, setProduits] = useState(null);
  const [erreur, setErreur] = useState('');

  const chargerProduits = useCallback(async () => {
    const { ok, donnees } = await api('/api/admin/produits');
    if (ok) setProduits(donnees.produits);
  }, []);

  useEffect(() => {
    chargerProduits();
  }, [chargerProduits]);

  async function ajouter(evenement) {
    evenement.preventDefault();
    setErreur('');
    const formulaire = evenement.currentTarget;
    const donnees = Object.fromEntries(new FormData(formulaire).entries());
    const { ok, donnees: resultat } = await api('/api/admin/produits', {
      method: 'POST',
      body: JSON.stringify({
        ...donnees,
        prix: Number(donnees.prix) || 0,
        stock: Number(donnees.stock) || 0,
        actif: true
      })
    });
    if (!ok) {
      setErreur(resultat.erreur || 'Erreur.');
      return;
    }
    formulaire.reset();
    chargerProduits();
    rafraichir();
  }

  async function basculerActif(produit) {
    await api(`/api/admin/produits/${produit.id}`, {
      method: 'PUT',
      body: JSON.stringify({ produit: { ...produit, actif: !produit.actif } })
    });
    chargerProduits();
  }

  async function supprimer(produit) {
    if (!confirm(`Supprimer « ${produit.nom} » ?`)) return;
    await api(`/api/admin/produits/${produit.id}`, { method: 'DELETE' });
    chargerProduits();
    rafraichir();
  }

  if (produits === null) return <p className="vide">Chargement des produits…</p>;

  return (
    <>
      <div className="admin-section">
        <h3>Ajouter un produit</h3>
        <p className="aide-section">
          Il apparaît aussitôt dans la boutique de la page d’accueil.
        </p>
        {erreur && <div className="alerte">{erreur}</div>}
        <form onSubmit={ajouter}>
          <div className="grille-2">
            <div className="champ">
              <label>Nom *</label>
              <input name="nom" required maxLength={200} />
            </div>
            <div className="champ">
              <label>Prix (USD)</label>
              <input name="prix" type="number" min="0" step="0.01" defaultValue="0" />
            </div>
            <div className="champ">
              <label>Stock</label>
              <input name="stock" type="number" min="0" defaultValue="0" />
            </div>
            <div className="champ">
              <label>Catégorie</label>
              <select name="filtre" defaultValue="informatique">
                <option value="informatique">Informatique</option>
                <option value="construction">Construction</option>
                <option value="energie">Énergie</option>
              </select>
            </div>
            <div className="champ">
              <label>Badge (facultatif)</label>
              <input name="badge" maxLength={40} placeholder="Best-seller…" />
            </div>
            <div className="champ">
              <label>Lien d’image (facultatif)</label>
              <input name="image" maxLength={300} placeholder="/assets/img/…" />
            </div>
          </div>
          <div className="champ">
            <label>Description</label>
            <input name="description" maxLength={2000} placeholder="Courte description…" />
          </div>
          <button className="bouton bouton-clair" type="submit">
            Ajouter le produit
          </button>
        </form>
      </div>

      {!produits.length && <p className="vide">Aucun produit.</p>}
      {!!produits.length && (
        <table className="tableau">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Catégorie</th>
              <th>Prix</th>
              <th>Stock</th>
              <th>État</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {produits.map((p) => (
              <tr key={p.id}>
                <td>{p.nom}</td>
                <td>{p.filtre || '—'}</td>
                <td>
                  {p.prix} {p.devise}
                </td>
                <td>{p.stock}</td>
                <td>{p.actif ? '✅ Actif' : '⏸️ Inactif'}</td>
                <td>
                  <div className="actions">
                    <button className="mini-bouton" onClick={() => basculerActif(p)}>
                      {p.actif ? 'Désactiver' : 'Activer'}
                    </button>
                    <button className="mini-bouton danger" onClick={() => supprimer(p)}>
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
