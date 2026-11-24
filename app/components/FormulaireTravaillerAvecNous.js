'use client';
import { useState } from 'react';

export default function FormulaireTravaillerAvecNous({ compact = false }) {
  const [etat, setEtat] = useState('repos'); // repos | envoi | succes | erreur
  const [msg, setMsg] = useState('');

  async function envoyer(e) {
    e.preventDefault();
    const form = e.target;
    const fd = new FormData(form);
    const payload = Object.fromEntries(fd.entries());
    payload.consentement = fd.get('consentement') === 'on';

    if (!payload.consentement) {
      setEtat('erreur');
      setMsg("Veuillez accepter la politique de confidentialité.");
      return;
    }

    setEtat('envoi');
    setMsg('');
    try {
      const res = await fetch('/api/candidature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.erreur || "Erreur lors de l'envoi.");
      setEtat('succes');
      setMsg(data.message || "Merci ! Votre candidature a bien été envoyée. Nous vous recontactons rapidement. Un e-mail de confirmation vous a été envoyé via notre Google Form.");
      form.reset();
    } catch (err) {
      setEtat('erreur');
      setMsg(err.message || "Impossible d'envoyer la candidature.");
    }
  }

  return (
    <form onSubmit={envoyer} className={`formulaire formulaire--candidature ${compact ? 'formulaire--compact' : ''}`} noValidate>
      {etat === 'succes' && <div className="alerte alerte--succes" role="status">{msg}</div>}
      {etat === 'erreur' && <div className="alerte alerte--erreur" role="alert">{msg}</div>}

      <div className="ligne-2">
        <div className="champ">
          <label htmlFor="tw-civilite">Civilité</label>
          <select id="tw-civilite" name="civilite" defaultValue="M.">
            <option value="M.">M.</option>
            <option value="Mme">Mme</option>
            <option value="Autre">Autre</option>
          </select>
        </div>
        <div className="champ">
          <label htmlFor="tw-domaine">Domaine / Pôle *</label>
          <select id="tw-domaine" name="domaine" required>
            <option value="">— Choisir —</option>
            <option value="Génie Civil">Génie Civil</option>
            <option value="Architecture & Design">Architecture & Design</option>
            <option value="Informatique">Informatique</option>
            <option value="Énergie renouvelable">Énergie renouvelable</option>
            <option value="Autre">Autre</option>
          </select>
        </div>
      </div>

      <div className="ligne-2">
        <div className="champ">
          <label htmlFor="tw-nom">Nom *</label>
          <input id="tw-nom" name="nom" required placeholder="Votre nom" autoComplete="family-name" />
        </div>
        <div className="champ">
          <label htmlFor="tw-prenom">Prénom *</label>
          <input id="tw-prenom" name="prenom" required placeholder="Votre prénom" autoComplete="given-name" />
        </div>
      </div>

      <div className="ligne-2">
        <div className="champ">
          <label htmlFor="tw-email">E-mail *</label>
          <input id="tw-email" name="email" type="email" required placeholder="vous@exemple.com" autoComplete="email" />
        </div>
        <div className="champ">
          <label htmlFor="tw-tel">Téléphone *</label>
          <input id="tw-tel" name="telephone" type="tel" required placeholder="+243 ..." autoComplete="tel" />
        </div>
      </div>

      <div className="ligne-2">
        <div className="champ">
          <label htmlFor="tw-ville">Ville / Pays</label>
          <input id="tw-ville" name="ville" placeholder="Goma, RDC" autoComplete="address-level2" />
        </div>
        <div className="champ">
          <label htmlFor="tw-naissance">Date de naissance</label>
          <input id="tw-naissance" name="dateNaissance" type="date" />
        </div>
      </div>

      <div className="ligne-2">
        <div className="champ">
          <label htmlFor="tw-type">Type de collaboration *</label>
          <select id="tw-type" name="typeCollaboration" required>
            <option value="">— Choisir —</option>
            <option value="Emploi">Emploi (CDI/CDD)</option>
            <option value="Stage">Stage</option>
            <option value="Freelance / Consultant">Freelance / Consultant</option>
            <option value="Partenariat">Partenariat</option>
            <option value="Autre">Autre</option>
          </select>
        </div>
        <div className="champ">
          <label htmlFor="tw-exp">Expérience</label>
          <select id="tw-exp" name="experience">
            <option value="">— Choisir —</option>
            <option value="0-1 an">0-1 an</option>
            <option value="1-3 ans">1-3 ans</option>
            <option value="3-5 ans">3-5 ans</option>
            <option value="5+ ans">5+ ans</option>
          </select>
        </div>
      </div>

      <div className="ligne-2">
        <div className="champ">
          <label htmlFor="tw-dispo">Disponibilité</label>
          <select id="tw-dispo" name="disponibilite">
            <option value="">— Choisir —</option>
            <option value="Immédiate">Immédiate</option>
            <option value="1 mois">1 mois</option>
            <option value="3 mois">3 mois</option>
            <option value="À discuter">À discuter</option>
          </select>
        </div>
        <div className="champ">
          <label htmlFor="tw-liencv">Lien CV / Portfolio</label>
          <input id="tw-liencv" name="lienCv" type="url" placeholder="https://drive.google.com/... ou LinkedIn" />
        </div>
      </div>

      <div className="champ">
        <label htmlFor="tw-message">Motivation / Message *</label>
        <textarea id="tw-message" name="message" rows={5} required placeholder="Présentez-vous, vos compétences et pourquoi vous souhaitez rejoindre LK-TECH…"></textarea>
      </div>

      <div className="champ champ--check">
        <label className="check-label">
          <input type="checkbox" name="consentement" required />
          <span>J'accepte que mes données soient utilisées pour traiter ma candidature et transmises à notre Google Form / Gmail conformément à la politique de confidentialité. *</span>
        </label>
      </div>

      <button className="btn btn--bloc" type="submit" disabled={etat === 'envoi'}>
        {etat === 'envoi' ? 'Envoi en cours…' : 'Envoyer ma candidature'} <span aria-hidden="true">↗</span>
      </button>
      <p className="form-note">Vos données sont envoyées à notre équipe, à notre Google Form et notifiées par e-mail (Gmail). Aucune utilisation commerciale.</p>
    </form>
  );
}
