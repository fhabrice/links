'use client';

import { useState } from 'react';
import { api } from './api-client';

/** Réglages du site + changement du code d'accès. */
export default function OngletReglages({ reglages, rafraichir }) {
  const [r, setR] = useState(reglages);
  const [msg, setMsg] = useState(null);
  const [codeF, setCodeF] = useState({ ancien: '', nouveau: '', confirmation: '' });
  const [msgCode, setMsgCode] = useState(null);

  async function enregistrer() {
    setMsg({ statut: 'envoi', texte: 'Enregistrement…' });
    const { ok, donnees } = await api('/api/admin/reglages', {
      method: 'PUT',
      body: JSON.stringify({ reglages: r })
    });
    setMsg(
      ok
        ? { statut: 'ok', texte: '✅ Réglages enregistrés.' }
        : { statut: 'erreur', texte: donnees.erreur || 'Erreur.' }
    );
    if (ok) rafraichir();
  }

  async function changerCode(evenement) {
    evenement.preventDefault();
    setMsgCode(null);
    if (codeF.nouveau !== codeF.confirmation) {
      setMsgCode({ statut: 'erreur', texte: 'La confirmation ne correspond pas.' });
      return;
    }
    const { ok, donnees } = await api('/api/admin/code', {
      method: 'PUT',
      body: JSON.stringify({ ancienCode: codeF.ancien, nouveauCode: codeF.nouveau })
    });
    setMsgCode(
      ok
        ? { statut: 'ok', texte: '✅ Code d’accès changé. Utilisez-le dès la prochaine connexion.' }
        : { statut: 'erreur', texte: donnees.erreur || 'Erreur.' }
    );
    if (ok) setCodeF({ ancien: '', nouveau: '', confirmation: '' });
  }

  return (
    <>
      <div className="admin-section">
        <h3>⚙️ Réglages généraux</h3>
        <div className="grille-2">
          <div className="champ">
            <label>Devise affichée</label>
            <select
              value={r.devise || 'USD'}
              onChange={(e) => setR({ ...r, devise: e.target.value })}
            >
              <option value="USD">USD ($)</option>
              <option value="CDF">CDF (Franc congolais)</option>
            </select>
          </div>
          <div className="champ">
            <label>État du site</label>
            <select
              value={r.maintenance ? 'maintenance' : 'en-ligne'}
              onChange={(e) => setR({ ...r, maintenance: e.target.value === 'maintenance' })}
            >
              <option value="en-ligne">✅ En ligne</option>
              <option value="maintenance">🛠 En maintenance</option>
            </select>
          </div>
          <div className="champ">
            <label>Portail client</label>
            <select
              value={r.portailClientActif ? 'oui' : 'non'}
              onChange={(e) => setR({ ...r, portailClientActif: e.target.value === 'oui' })}
            >
              <option value="oui">Activé</option>
              <option value="non">Désactivé</option>
            </select>
          </div>
        </div>
        <div className="barre-actions">
          <button className="bouton bouton-clair" onClick={enregistrer} disabled={msg?.statut === 'envoi'}>
            Enregistrer les réglages
          </button>
          {msg && (
            <span className={msg.statut === 'erreur' ? 'retour-admin erreur' : 'retour-admin ok'}>
              {msg.texte}
            </span>
          )}
        </div>
      </div>

      <div className="admin-section">
        <h3>🔑 Sécurité — changer le code d’accès</h3>
        <p className="aide-section">
          Le code unique qui ouvre l’administration (6 caractères minimum). Conservez-le
          en lieu sûr.
        </p>
        <form onSubmit={changerCode}>
          <div className="grille-2">
            <div className="champ">
              <label>Code actuel</label>
              <input
                type="password"
                value={codeF.ancien}
                onChange={(e) => setCodeF({ ...codeF, ancien: e.target.value })}
                required
                autoComplete="current-password"
              />
            </div>
            <div className="champ">
              <label>Nouveau code</label>
              <input
                type="password"
                value={codeF.nouveau}
                onChange={(e) => setCodeF({ ...codeF, nouveau: e.target.value })}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>
            <div className="champ">
              <label>Confirmer le nouveau code</label>
              <input
                type="password"
                value={codeF.confirmation}
                onChange={(e) => setCodeF({ ...codeF, confirmation: e.target.value })}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>
          </div>
          <button className="bouton bouton-clair" type="submit">
            Changer le code
          </button>
          {msgCode && (
            <div
              className={`retour-admin ${msgCode.statut === 'erreur' ? 'erreur' : 'ok'}`}
              style={{ marginTop: '0.8rem' }}
            >
              {msgCode.texte}
            </div>
          )}
        </form>
      </div>
    </>
  );
}
