'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from './api-client';

export default function OngletMessages() {
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
    return (
      <p className="vide">
        Aucun message pour l’instant — teste le formulaire de contact sur la page
        d’accueil.
      </p>
    );

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
              {m.telephone ? (
                <>
                  <br />
                  <small style={{ color: '#6b7686' }}>{m.telephone}</small>
                </>
              ) : null}
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
