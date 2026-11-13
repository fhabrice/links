'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from './api-client';
import OngletMessages from './OngletMessages';
import OngletProduits from './OngletProduits';
import OngletContenu from './OngletContenu';
import OngletReglages from './OngletReglages';

const ONGLETS = [
  ['messages', '📨 Messages'],
  ['produits', '🛒 Produits'],
  ['contenu', '📝 Contenu du site'],
  ['reglages', '⚙️ Réglages & sécurité']
];

export default function Admin() {
  const [session, setSession] = useState('chargement');
  const [etat, setEtat] = useState(null);
  const [erreur, setErreur] = useState('');
  const [onglet, setOnglet] = useState('contenu');

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
      body: JSON.stringify({ code: donnees.code })
    });
    if (!ok) {
      setErreur(resultat.erreur || 'Code refusé.');
      return;
    }
    setSession('connecte');
    setOnglet('contenu');
    await chargerEtat();
  }

  async function deconnexion() {
    await api('/api/admin/logout', { method: 'POST' });
    setSession('deconnecte');
    setEtat(null);
  }

  /** Sauvegarde du contenu éditorial (appelée par OngletContenu). */
  async function sauvegarderContenu(contenu) {
    const { ok, donnees } = await api('/api/admin/contenu', {
      method: 'PUT',
      body: JSON.stringify({ contenu })
    });
    if (ok) await chargerEtat();
    return { ok, erreur: donnees.erreur };
  }

  /* ---------------------- CONNEXION PAR CODE ----------------------
     Le formulaire est aussi rendu pendant la vérification de session
     (« chargement ») : la phrase d'aide reste donc visible dès la
     première réponse du serveur, même sans JavaScript. */
  if (session !== 'connecte') {
    return (
      <>
        <div className="admin-entete">
          <div className="conteneur">
            <h1>LK-TECH · Administration</h1>
            <span className="pilote">Espace réservé</span>
          </div>
        </div>
        <div className="conteneur" style={{ paddingBottom: '3rem' }}>
          <form className="carte-login" onSubmit={connexion}>
            <h2>🔒 Accès administration</h2>
            <p className="aide">
              Entrez le code d’accès du site pour gérer tout le contenu.
              <br />
              Vous pourrez le changer dans Réglages → Sécurité.
            </p>
            {erreur && <div className="alerte">{erreur}</div>}
            <div className="champ">
              <label htmlFor="code">Code d’accès</label>
              <input
                id="code"
                name="code"
                type="password"
                required
                autoFocus
                autoComplete="current-password"
                placeholder="••••••••"
              />
            </div>
            <button className="bouton bouton-vert" type="submit" style={{ width: '100%' }}>
              Entrer
            </button>
          </form>
        </div>
      </>
    );
  }

  /* ------------------------- BACK-OFFICE ------------------------- */
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
            {ONGLETS.map(([cle, libelle]) => (
              <button
                key={cle}
                className={`onglet ${onglet === cle ? 'actif' : ''}`}
                onClick={() => setOnglet(cle)}
              >
                {libelle}
              </button>
            ))}
          </div>

          {onglet === 'messages' && <OngletMessages />}
          {onglet === 'produits' && <OngletProduits rafraichir={chargerEtat} />}
          {onglet === 'contenu' && etat?.contenu && (
            <OngletContenu contenu={etat.contenu} sauvegarder={sauvegarderContenu} />
          )}
          {onglet === 'reglages' && etat?.reglages && (
            <OngletReglages reglages={etat.reglages} rafraichir={chargerEtat} />
          )}
        </div>
      </main>
    </>
  );
}
