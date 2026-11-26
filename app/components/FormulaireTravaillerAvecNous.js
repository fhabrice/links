'use client';

import { useEffect, useRef, useState } from 'react';

const DOMAINES = [
  { value: 'Génie Civil', label: 'Génie Civil & BTP' },
  { value: 'Architecture & Design', label: 'Architecture & Design' },
  { value: 'Informatique', label: 'Informatique & Digital' },
  { value: 'Énergie renouvelable', label: 'Énergie renouvelable' },
  { value: 'Autre', label: 'Autre / Support transversal' }
];

const TYPES_COLLAB = [
  { value: 'Emploi', label: 'Emploi (CDI / CDD)' },
  { value: 'Stage', label: 'Stage académique ou professionnel' },
  { value: 'Freelance / Consultant', label: 'Freelance / Consultant' },
  { value: 'Partenariat', label: 'Partenariat technique' },
  { value: 'Autre', label: 'Autre' }
];

export default function FormulaireTravaillerAvecNous({ compact = false, boutonTexte = 'Envoyer ma candidature' }) {
  const [etat, setEtat] = useState('repos'); // repos | envoi | succes | erreur
  const [msg, setMsg] = useState('');
  const [domaine, setDomaine] = useState('');
  const [typeCollaboration, setTypeCollaboration] = useState('');
  const [champSurligne, setChampSurligne] = useState('');
  const formRef = useRef(null);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const d = params.get('domaine');
      const t = params.get('type');
      if (d) {
        const trouve = DOMAINES.find((o) => o.value.toLowerCase() === d.toLowerCase());
        if (trouve) setDomaine(trouve.value);
      }
      if (t) {
        const trouveType = TYPES_COLLAB.find((o) => o.value.toLowerCase() === t.toLowerCase());
        if (trouveType) setTypeCollaboration(trouveType.value);
      }
    } catch {}

    function surClicDelegue(e) {
      const btnDomaine = e.target.closest('[data-choisir-domaine]');
      if (btnDomaine) {
        const val = btnDomaine.getAttribute('data-choisir-domaine');
        const trouve = DOMAINES.find((o) => o.value.toLowerCase() === String(val || '').toLowerCase());
        if (trouve) {
          e.preventDefault();
          setDomaine(trouve.value);
          setChampSurligne('domaine');
          setTimeout(() => setChampSurligne(''), 1800);
          document.getElementById('candidature')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        return;
      }

      const btnType = e.target.closest('[data-choisir-type]');
      if (btnType) {
        const val = btnType.getAttribute('data-choisir-type');
        const trouveType = TYPES_COLLAB.find((o) => o.value.toLowerCase() === String(val || '').toLowerCase());
        if (trouveType) {
          e.preventDefault();
          setTypeCollaboration(trouveType.value);
          setChampSurligne('type');
          setTimeout(() => setChampSurligne(''), 1800);
          document.getElementById('candidature')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }

    document.addEventListener('click', surClicDelegue);
    return () => document.removeEventListener('click', surClicDelegue);
  }, []);

  async function envoyer(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = Object.fromEntries(fd.entries());
    payload.consentement = fd.get('consentement') === 'on';

    if (!payload.domaine) {
      setEtat('erreur');
      setMsg('Merci de choisir le domaine / pôle souhaité.');
      return;
    }
    if (!payload.nom?.trim() || !payload.prenom?.trim() || !payload.email?.trim()) {
      setEtat('erreur');
      setMsg('Merci de renseigner vos nom, prénom et adresse e-mail.');
      return;
    }
    if (!payload.typeCollaboration) {
      setEtat('erreur');
      setMsg('Merci d’indiquer le type de collaboration recherché.');
      return;
    }
    if (!payload.message || payload.message.trim().length < 10) {
      setEtat('erreur');
      setMsg('Merci de rédiger quelques lignes de motivation (10 caractères minimum).');
      return;
    }
    if (!payload.consentement) {
      setEtat('erreur');
      setMsg('Veuillez cocher la case d’acceptation du traitement de votre candidature.');
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
      if (!res.ok) throw new Error(data.erreur || "Erreur lors de l'envoi de la candidature.");
      setEtat('succes');
      setMsg(data.message || 'Merci ! Votre candidature a bien été enregistrée. Notre équipe vous recontacte sous 48 h.');
      form.reset();
      setDomaine('');
      setTypeCollaboration('');
    } catch (err) {
      setEtat('erreur');
      setMsg(err.message || "Impossible d'envoyer la candidature pour le moment.");
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={envoyer}
      className={`formulaire formulaire--candidature${compact ? ' formulaire--compact' : ''}`}
      noValidate
    >
      {etat === 'succes' && (
        <div className="alerte alerte--succes visible" role="status">
          {msg}
        </div>
      )}
      {etat === 'erreur' && (
        <div className="alerte alerte--erreur visible" role="alert">
          {msg}
        </div>
      )}

      {/* Étape 1 */}
      <div className="form-groupe">
        <div className="form-groupe__entete">
          <span className="form-groupe__num" aria-hidden="true">1</span>
          <h3 className="form-groupe__titre">Identité &amp; coordonnées</h3>
        </div>

        <div className="ligne-2">
          <div className="champ">
            <label htmlFor="tw-civilite">Civilité</label>
            <select id="tw-civilite" name="civilite" defaultValue="M.">
              <option value="M.">Monsieur (M.)</option>
              <option value="Mme">Madame (Mme)</option>
              <option value="Autre">Autre</option>
            </select>
          </div>
          <div className="champ">
            <label htmlFor="tw-ville">Ville / Pays</label>
            <input id="tw-ville" name="ville" type="text" placeholder="Ex. : Goma, RDC" autoComplete="address-level2" />
          </div>
        </div>

        <div className="ligne-2">
          <div className="champ">
            <label htmlFor="tw-nom">Nom *</label>
            <input id="tw-nom" name="nom" type="text" required placeholder="Votre nom" autoComplete="family-name" />
          </div>
          <div className="champ">
            <label htmlFor="tw-prenom">Prénom *</label>
            <input id="tw-prenom" name="prenom" type="text" required placeholder="Votre prénom" autoComplete="given-name" />
          </div>
        </div>

        <div className="ligne-2">
          <div className="champ">
            <label htmlFor="tw-email">Adresse e-mail *</label>
            <input id="tw-email" name="email" type="email" required placeholder="vous@exemple.com" autoComplete="email" />
          </div>
          <div className="champ">
            <label htmlFor="tw-tel">Téléphone / WhatsApp *</label>
            <input id="tw-tel" name="telephone" type="tel" required placeholder="+243 …" autoComplete="tel" />
          </div>
        </div>

        <div className="champ">
          <label htmlFor="tw-naissance">Date de naissance (optionnel)</label>
          <input id="tw-naissance" name="dateNaissance" type="date" />
        </div>
      </div>

      {/* Étape 2 */}
      <div className="form-groupe">
        <div className="form-groupe__entete">
          <span className="form-groupe__num" aria-hidden="true">2</span>
          <h3 className="form-groupe__titre">Pôle visé &amp; profil professionnel</h3>
        </div>

        <div className="ligne-2">
          <div className="champ">
            <label htmlFor="tw-domaine">Domaine / Pôle souhaité *</label>
            <select
              id="tw-domaine"
              name="domaine"
              required
              value={domaine}
              onChange={(e) => setDomaine(e.target.value)}
              className={champSurligne === 'domaine' ? 'champ-surligne' : undefined}
            >
              <option value="">— Sélectionner un pôle —</option>
              {DOMAINES.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>
          <div className="champ">
            <label htmlFor="tw-type">Type de collaboration *</label>
            <select
              id="tw-type"
              name="typeCollaboration"
              required
              value={typeCollaboration}
              onChange={(e) => setTypeCollaboration(e.target.value)}
              className={champSurligne === 'type' ? 'champ-surligne' : undefined}
            >
              <option value="">— Sélectionner un format —</option>
              {TYPES_COLLAB.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="ligne-2">
          <div className="champ">
            <label htmlFor="tw-exp">Années d’expérience</label>
            <select id="tw-exp" name="experience" defaultValue="">
              <option value="">— Sélectionner —</option>
              <option value="0-1 an">Débutant / 0 à 1 an</option>
              <option value="1-3 ans">1 à 3 ans</option>
              <option value="3-5 ans">3 à 5 ans</option>
              <option value="5+ ans">Plus de 5 ans</option>
            </select>
          </div>
          <div className="champ">
            <label htmlFor="tw-dispo">Disponibilité</label>
            <select id="tw-dispo" name="disponibilite" defaultValue="">
              <option value="">— Sélectionner —</option>
              <option value="Immédiate">Immédiate</option>
              <option value="1 mois">Sous 1 mois</option>
              <option value="3 mois">Sous 3 mois</option>
              <option value="À discuter">À convenir</option>
            </select>
          </div>
        </div>

        <div className="champ">
          <label htmlFor="tw-liencv">Lien CV / Portfolio (Google Drive, LinkedIn, GitHub…)</label>
          <input id="tw-liencv" name="lienCv" type="url" placeholder="https://drive.google.com/… ou https://linkedin.com/in/…" />
        </div>
      </div>

      {/* Étape 3 */}
      <div className="form-groupe">
        <div className="form-groupe__entete">
          <span className="form-groupe__num" aria-hidden="true">3</span>
          <h3 className="form-groupe__titre">Présentation &amp; motivation</h3>
        </div>

        <div className="champ">
          <label htmlFor="tw-message">Votre parcours et vos motivations *</label>
          <textarea
            id="tw-message"
            name="message"
            rows={5}
            required
            placeholder="Présentez votre parcours, vos compétences clés, vos réalisations et ce que vous souhaitez apporter chez LK-TECH…"
          />
        </div>

        <div className="champ champ--check">
          <label className="check-label">
            <input type="checkbox" name="consentement" required />
            <span>
              J’accepte que mes informations soient traitées de manière confidentielle par LK-TECH dans le cadre de l’étude de ma candidature. *
            </span>
          </label>
        </div>
      </div>

      <button className="btn btn--accent btn--bloc" type="submit" disabled={etat === 'envoi'}>
        {etat === 'envoi' ? 'Envoi de votre dossier en cours…' : boutonTexte} <span aria-hidden="true">↗</span>
      </button>
      <p className="form-note">
        Vos données sont strictement réservées au recrutement LK-TECH. Aucune utilisation commerciale.
      </p>
    </form>
  );
}
