'use client';

import { useState } from 'react';

export default function FormulaireContact() {
  const [etat, setEtat] = useState({ statut: 'vide' });

  async function envoyer(evenement) {
    evenement.preventDefault();
    const formulaire = evenement.currentTarget;
    const donnees = Object.fromEntries(new FormData(formulaire).entries());
    setEtat({ statut: 'envoi' });
    try {
      const reponse = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(donnees)
      });
      const resultat = await reponse.json();
      if (!reponse.ok) {
        setEtat({ statut: 'erreur', texte: resultat.erreur || 'Erreur.' });
        return;
      }
      formulaire.reset();
      setEtat({ statut: 'ok', texte: resultat.message || 'Message envoyé !' });
    } catch {
      setEtat({ statut: 'erreur', texte: 'Impossible d’envoyer le message.' });
    }
  }

  return (
    <form className="formulaire" onSubmit={envoyer}>
      <div>
        <label htmlFor="nom">Nom complet *</label>
        <input id="nom" name="nom" required maxLength={120} placeholder="Votre nom" />
      </div>
      <div>
        <label htmlFor="email">E-mail *</label>
        <input id="email" name="email" type="email" required maxLength={160} placeholder="vous@exemple.com" />
      </div>
      <div>
        <label htmlFor="telephone">Téléphone</label>
        <input id="telephone" name="telephone" maxLength={40} placeholder="+243 …" />
      </div>
      <div>
        <label htmlFor="sujet">Sujet</label>
        <input id="sujet" name="sujet" maxLength={140} placeholder="Votre demande" />
      </div>
      <div className="large">
        <label htmlFor="message">Message *</label>
        <textarea id="message" name="message" required minLength={5} maxLength={4000} placeholder="Décrivez votre projet…" />
      </div>
      <div className="large">
        <button className="bouton bouton-vert" type="submit" disabled={etat.statut === 'envoi'}>
          {etat.statut === 'envoi' ? 'Envoi en cours…' : 'Envoyer le message'}
        </button>
      </div>
      {etat.texte && (
        <div className={`retour ${etat.statut === 'ok' ? 'ok' : 'erreur'}`}>{etat.texte}</div>
      )}
    </form>
  );
}
