'use client';

import { useEffect, useState, useCallback } from 'react';

async function api(url, options = {}) {
  const reponse = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
  });
  const donnees = await reponse.json().catch(() => ({}));
  return { ok: reponse.ok, code: reponse.status, donnees };
}

export default function Admin() {
  const [session, setSession] = useState('chargement');
  const [etat, setEtat] = useState(null);
  const [erreur, setErreur] = useState('');
  const [onglet, setOnglet] = useState('messages');

  const chargerEtat = useCallback(async () => {
    const { ok, donnees } = await api('/api/admin/state');
    if (ok) setEtat(donnees);
    else setSession('deconnecte');
  }, []);

  useEffect(() => {
    (async () => {
      const { ok, donnees } = await api('/api/admin/session');
      if (ok && donnees.connecte) {
        setSession('connecte');
        await chargerEtat();
      } else {
        setSession('deconnecte');
      }
    })();
  }, [chargerEtat]);

  async function connexion(evenement) {
    evenement.preventDefault();
    setErreur('');
    const donnees = Object.fromEntries(new FormData(evenement.currentTarget).entries());
    const { ok, donnees: resultat } = await api('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify(donnees)
    });
    if (!ok) {
      setErreur(resultat.erreur || 'Connexion refusée.');
      return;
    }
    setSession('connecte');
    await chargerEtat();
  }

  async function deconnexion() {
    await api('/api/admin/logout', { method: 'POST' });
    setSession('deconnecte');
    setEtat(null);
  }

  if (session === 'chargement') {
    return (
      <div className="carte-login">
        <p className="vide">Chargement…</p>
      </div>
    );
  }

  if (session === 'deconnecte') {
    return (
      <div className="admin-entete">
        <div className="conteneur">
          <h1>LK-TECH · Administration</h1>
        </div>
        <div className="conteneur" style={{ paddingBottom: '2rem' }}>
          <form className="carte-login" onSubmit={connexion}>
            <h2>Connexion</h2>
            <p className="aide">
              Mode Supabase Auth si les clés sont configurées, sinon compte local
              (admin / linksmartech).
            </p>
            {erreur && <div className="alerte">{erreur}</div>}
            <div className="champ">
              <label htmlFor="identifiant">Identifiant</label>
              <input id="identifiant" name="identifiant" autoComplete="username" required />
            </div>
            <div className="champ">
              <label htmlFor="motDePasse">Mot de passe</label>
              <input
                id="motDePasse"
                name="motDePasse"
                type="password"
                autoComplete="current-password"
                required
              />
            </div>
            <button className="bouton bouton-vert" type="submit">
              Se connecter
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="admin-entete">
        <div className="conteneur">
          <h1>LK-TECH · Administration</h1>
          <div className="actions" style={{ alignItems: 'center' }}>
            <span className={`pilote ${etat?.stats?.mode || ''}`}>
              {etat?.stats?.mode === 'supabase' ? 'Supabase' : 'Stockage local'}
            </span>
            <span style={{ fontSize: '0.85rem', color: '#b9c4d8' }}>
              {etat?.utilisateur?.identifiant}
            </span>
            <button className="mini-bouton" onClick={deconnexion}>
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="section">
        <div className="conteneur">
          <div className="stats">
            <div className="stat">
              <div className="valeur">{etat?.stats?.messages ?? '—'}</div>
              <div className="libelle">Messages reçus</div>
            </div>
            <div className="stat">
              <div className="valeur">{etat?.stats?.messagesNonLus ?? '—'}</div>
              <div className="libelle">Non lus</div>
            </div>
            <div className="stat">
              <div className="valeur">{etat?.stats?.produits ?? '—'}</div>
              <div className="libelle">Produits</div>
            </div>
          </div>

          <div className="onglets">
            <button
              className={`onglet ${onglet === 'messages' ? 'actif' : ''}`}
              onClick={() => setOnglet('messages')}
            >
              Messages
            </button>
            <button
              className={`onglet ${onglet === 'produits' ? 'actif' : ''}`}
              onClick={() => setOnglet('produits')}
            >
              Produits
            </button>
          </div>

          {onglet === 'messages' && <OngletMessages />}
          {onglet === 'produits' && <OngletProduits charger={chargerEtat} />}
        </div>
      </main>
    </>
  );
}

function OngletMessages() {
  const [messages, setMessages] = useState(null);

  const recharger = useCallback(async () => {
    const { ok, donnees } = await api('/api/admin/messages');
    if (ok) setMessages(donnees.messages);
  }, []);

  useEffect(() => {
    recharger();
  }, [recharger]);

  async function basculerLu(message) {
    await api(`/api/admin/messages/${message.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ lu: !message.lu })
    });
    recharger();
  }

  async function supprimer(message) {
    if (!confirm('Supprimer ce message ?')) return;
    await api(`/api/admin/messages/${message.id}`, { method: 'DELETE' });
    recharger();
  }

  if (messages === null) return <p className="vide">Chargement des messages…</p>;
  if (!messages.length)
    return <p className="vide">Aucun message pour l’instant — teste le formulaire de contact.</p>;

  return (
    <table className="tableau">
      <thead>
        <tr>
          <th>De</th>
          <th>Sujet</th>
          <th>Message</th>
          <th>Reçu le</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {messages.map((m) => (
          <tr key={m.id} className={m.lu ? '' : 'non-lu'}>
            <td>
              {m.nom}
              <br />
              <small style={{ color: '#6b7686' }}>{m.email}</small>
            </td>
            <td>{m.sujet}</td>
            <td style={{ maxWidth: 320 }}>
              {m.message.length > 120 ? `${m.message.slice(0, 120)}…` : m.message}
            </td>
            <td>{new Date(m.recu_le || m.recuLe).toLocaleString('fr-FR')}</td>
            <td>
              <div className="actions">
                <button className="mini-bouton" onClick={() => basculerLu(m)}>
                  {m.lu ? 'Marquer non lu' : 'Marquer lu'}
                </button>
                <button className="mini-bouton danger" onClick={() => supprimer(m)}>
                  Supprimer
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function OngletProduits({ charger: rafraichirGlobal }) {
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
    rafraichirGlobal();
  }

  async function supprimer(produit) {
    if (!confirm(`Supprimer « ${produit.nom} » ?`)) return;
    await api(`/api/admin/produits/${produit.id}`, { method: 'DELETE' });
    chargerProduits();
    rafraichirGlobal();
  }

  if (produits === null) return <p className="vide">Chargement des produits…</p>;

  return (
    <>
      <form className="carte" style={{ marginBottom: '1.5rem' }} onSubmit={ajouter}>
        <h3 style={{ marginBottom: '1rem', color: '#16233f' }}>Ajouter un produit</h3>
        {erreur && <div className="alerte">{erreur}</div>}
        <div className="grille" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
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
        </div>
        <div className="champ">
          <label>Description</label>
          <input name="description" maxLength={2000} placeholder="Courte description…" />
        </div>
        <button className="bouton bouton-clair" type="submit">
          Ajouter
        </button>
      </form>

      {!produits.length && <p className="vide">Aucun produit.</p>}
      {!!produits.length && (
        <table className="tableau">
          <thead>
            <tr>
              <th>Nom</th>
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
                <td>
                  {p.prix} {p.devise}
                </td>
                <td>{p.stock}</td>
                <td>{p.actif ? 'Actif' : 'Inactif'}</td>
                <td>
                  <div className="actions">
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
