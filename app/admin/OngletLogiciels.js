'use client';

import { useEffect, useState } from 'react';
import { api } from './api-client';
import exemples from '../../lib/logiciels-exemples.json';

const FORM_VIDE = {
  nom: '',
  icone: '💾',
  badge: 'Conçu par LK-TECH',
  pitch: '',
  explication: '',
  fonctionnalites: '',
  prix: '',
  devise: 'USD',
  typePrix: 'licence annuelle',
  actif: true
};

/**
 * Onglet « Logiciels » — publication des logiciels à vendre
 * depuis l'espace d'administration (section « Nos logiciels »).
 */
export default function OngletLogiciels({ logiciels, rafraichir }) {
  const [titre, setTitre] = useState(logiciels?.titre || 'Nos logiciels');
  const [sousTitre, setSousTitre] = useState(logiciels?.sousTitre || '');
  const [texteBouton, setTexteBouton] = useState(
    logiciels?.texteBouton || 'Demander une démo'
  );
  const [items, setItems] = useState(logiciels?.items || []);
  const [form, setForm] = useState(FORM_VIDE);
  const [editionId, setEditionId] = useState(null);
  const [erreur, setErreur] = useState('');
  const [retour, setRetour] = useState(null);
  const [envoi, setEnvoi] = useState(false);

  // Resynchronisation après un enregistrement (nouvelles données du serveur).
  useEffect(() => {
    if (!logiciels) return;
    setTitre(logiciels.titre || 'Nos logiciels');
    setSousTitre(logiciels.sousTitre || '');
    setTexteBouton(logiciels.texteBouton || 'Demander une démo');
    setItems(logiciels.items || []);
  }, [logiciels]);

  function construire(itemsMaj) {
    return { titre, sousTitre, texteBouton, items: itemsMaj };
  }

  async function envoyer(itemsMaj, message) {
    setErreur('');
    setRetour(null);
    setEnvoi(true);
    try {
      const { ok, donnees } = await api('/api/admin/logiciels', {
        method: 'PUT',
        body: JSON.stringify({ logiciels: construire(itemsMaj) })
      });
      if (!ok) {
        setErreur(donnees.erreur || 'Enregistrement impossible.');
        return false;
      }
      setRetour({ statut: 'ok', texte: `✅ ${message}` });
      rafraichir();
      return true;
    } catch {
      setErreur('Connexion impossible. Réessayez : vos modifications sont conservées.');
      return false;
    } finally {
      setEnvoi(false);
    }
  }

  function enregistrerSection(evenement) {
    evenement.preventDefault();
    envoyer(items, 'Paramètres de la section enregistrés.');
  }

  async function enregistrerLogiciel(evenement) {
    evenement.preventDefault();
    const donnees = Object.fromEntries(
      new FormData(evenement.currentTarget).entries()
    );
    const nom = String(donnees.nom || '').trim();
    if (!nom) {
      setErreur('Le nom du logiciel est requis.');
      return;
    }
    const item = {
      id: editionId || `log-${Date.now()}`,
      nom,
      icone: String(donnees.icone || '').trim() || '💾',
      badge: String(donnees.badge || '').trim(),
      pitch: String(donnees.pitch || '').trim(),
      explication: String(donnees.explication || '').trim(),
      fonctionnalites: String(donnees.fonctionnalites || '')
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean),
      prix: String(donnees.prix ?? '').trim() === '' ? null : Number(donnees.prix),
      devise: donnees.devise === 'CDF' ? 'CDF' : 'USD',
      typePrix: String(donnees.typePrix || '').trim(),
      actif: donnees.actif === 'on'
    };
    const itemsMaj = editionId
      ? items.map((i) => (i.id === editionId ? item : i))
      : [...items, item];
    const ok = await envoyer(
      itemsMaj,
      editionId
        ? `« ${item.nom} » mis à jour.`
        : `« ${item.nom} » publié — visible sur la page d'accueil.`
    );
    if (ok) {
      setEditionId(null);
      setForm(FORM_VIDE);
    }
  }

  function modifier(item) {
    setErreur('');
    setRetour(null);
    setEditionId(item.id);
    setForm({
      nom: item.nom || '',
      icone: item.icone || '💾',
      badge: item.badge || '',
      pitch: item.pitch || '',
      explication: item.explication || '',
      fonctionnalites: (item.fonctionnalites || []).join('\n'),
      prix: String(item.prix ?? ''),
      devise: item.devise || 'USD',
      typePrix: item.typePrix || '',
      actif: item.actif !== false
    });
    document
      .getElementById('logiciel-formulaire')
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function annulerEdition() {
    setEditionId(null);
    setForm(FORM_VIDE);
    setErreur('');
    setRetour(null);
  }

  function basculer(item) {
    const itemsMaj = items.map((i) =>
      i.id === item.id ? { ...i, actif: i.actif === false } : i
    );
    envoyer(
      itemsMaj,
      item.actif !== false
        ? `« ${item.nom} » dépublié (masqué du site).`
        : `« ${item.nom} » publié !`
    );
  }

  function supprimer(item) {
    if (!confirm(`Supprimer définitivement « ${item.nom} » ?`)) return;
    envoyer(
      items.filter((i) => i.id !== item.id),
      `« ${item.nom} » supprimé.`
    );
  }

  const champ = (cle) => ({
    name: cle,
    value: form[cle],
    onChange: (e) => setForm({ ...form, [cle]: e.target.value })
  });

  return (
    <>
      {/* ---------- Paramètres de la section ---------- */}
      <div className="admin-section">
        <h3>🧩 Section « Nos logiciels » (page d’accueil)</h3>
        <p className="aide-section">
          Titre et texte affichés au-dessus de la vitrine de logiciels.
        </p>
        <form onSubmit={enregistrerSection}>
          <div className="grille-2">
            <div className="champ">
              <label>Titre de la section</label>
              <input
                value={titre}
                onChange={(e) => setTitre(e.target.value)}
                maxLength={200}
              />
            </div>
            <div className="champ">
              <label>Texte du bouton</label>
              <input
                value={texteBouton}
                onChange={(e) => setTexteBouton(e.target.value)}
                maxLength={80}
              />
            </div>
          </div>
          <div className="champ">
            <label>Sous-titre</label>
            <input
              value={sousTitre}
              onChange={(e) => setSousTitre(e.target.value)}
              maxLength={600}
            />
          </div>
          <button className="bouton bouton-clair" type="submit" disabled={envoi}>
            {envoi ? 'Enregistrement…' : 'Enregistrer la section'}
          </button>
        </form>
      </div>

      <div className="admin-section">
        <h3>Charger la sélection LK-TECH</h3>
        <p className="aide-section">SAFISAHA, LITO FINANCE et Youpendimmoselect sont des fiches de départ : modifiez leur nom, leur présentation, leurs fonctionnalités et leur tarif. Ce bouton remplace le catalogue actuel uniquement après confirmation.</p>
        <button className="bouton bouton-clair" disabled={envoi} onClick={async () => {
          if (!confirm('Remplacer les logiciels actuels par SAFISAHA, LITO FINANCE et Youpendimmoselect ?')) return;
          if (await envoyer(structuredClone(exemples), 'Sélection LK-TECH chargée.')) {
            setEditionId(null);
            setForm(FORM_VIDE);
          }
        }}>Charger les 3 logiciels LK-TECH</button>
      </div>

      {/* ---------- Formulaire d'ajout / édition ---------- */}
      <div className="admin-section" id="logiciel-formulaire">
        <h3>
          {editionId
            ? `✏️ Modifier « ${form.nom} »`
            : '🚀 Publier un logiciel à vendre'}
        </h3>
        <p className="aide-section">
          Il apparaît aussitôt dans la vitrine de la page d’accueil, avec son
          explication et ses fonctionnalités.
        </p>
        {erreur && <div className="alerte">{erreur}</div>}
        <form onSubmit={enregistrerLogiciel} key={editionId || 'nouveau'}>
          <div className="grille-2">
            <div className="champ">
              <label>Nom *</label>
              <input {...champ('nom')} required maxLength={120} placeholder="SAFISAHA, LITO FINANCE…" />
            </div>
            <div className="champ">
              <label>Icône (emoji)</label>
              <input {...champ('icone')} maxLength={8} placeholder="📦" />
            </div>
            <div className="champ">
              <label>Prix (laisser vide pour « Sur devis »)</label>
              <input {...champ('prix')} type="number" min="0" step="1" placeholder="Vide : sur devis" />
            </div>
            <div className="champ">
              <label>Devise</label>
              <select {...champ('devise')}>
                <option value="USD">USD ($)</option>
                <option value="CDF">CDF (FC)</option>
              </select>
            </div>
            <div className="champ">
              <label>Type de licence</label>
              <input
                {...champ('typePrix')}
                maxLength={60}
                placeholder="licence annuelle…"
              />
            </div>
            <div className="champ">
              <label>Badge</label>
              <input
                {...champ('badge')}
                maxLength={60}
                placeholder="Conçu par LK-TECH…"
              />
            </div>
          </div>
          <div className="champ">
            <label>Accroche (phrase courte)</label>
            <input
              {...champ('pitch')}
              maxLength={160}
              placeholder="Gestion de stock & point de vente…"
            />
          </div>
          <div className="champ">
            <label>Explication du logiciel</label>
            <textarea
              {...champ('explication')}
              rows={4}
              maxLength={2500}
              placeholder="Ce que fait le logiciel, pour qui, et pourquoi il est utile…"
            />
          </div>
          <div className="champ">
            <label>Fonctionnalités (une par ligne)</label>
            <textarea
              {...champ('fonctionnalites')}
              rows={4}
              placeholder={'Stock et ventes en temps réel\nFactures imprimables\n…'}
            />
          </div>
          <div className="champ">
            <label className="logiciel-check">
              <input
                type="checkbox"
                name="actif"
                checked={form.actif}
                onChange={(e) => setForm({ ...form, actif: e.target.checked })}
              />{' '}
              Publier sur le site (visible dans la vitrine)
            </label>
          </div>
          <div className="actions">
            <button className="bouton bouton-vert" type="submit" disabled={envoi}>
              {envoi
                ? 'Enregistrement…'
                : editionId
                  ? '💾 Enregistrer les modifications'
                  : '🚀 Publier le logiciel'}
            </button>
            {editionId && (
              <button className="mini-bouton" type="button" onClick={annulerEdition}>
                Annuler
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ---------- Liste des logiciels ---------- */}
      <div className="admin-section">
        <h3>📚 Logiciels publiés ({items.length})</h3>
        {retour && (
          <span className={`retour-admin ${retour.statut}`}>{retour.texte}</span>
        )}
        {!items.length && (
          <p className="vide">Aucun logiciel — publiez le premier ci-dessus.</p>
        )}
        {!!items.length && (
          <div className="tableau-defilant" role="region" aria-label="Liste des logiciels" tabIndex={0}>
            <table className="tableau">
              <thead>
                <tr>
                  <th>Logiciel</th>
                  <th>Prix</th>
                  <th>Publication</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((l) => (
                  <tr key={l.id}>
                    <td>
                      <strong>
                        {l.icone} {l.nom}
                      </strong>
                      {l.pitch && <div className="logiciel-pitch">{l.pitch}</div>}
                    </td>
                    <td>
                      {l.prix == null || l.prix === '' ? 'Sur devis' : `${l.prix} ${l.devise}`}
                      {l.typePrix && (
                        <div className="logiciel-type">{l.typePrix}</div>
                      )}
                    </td>
                    <td>{l.actif !== false ? '✅ Publié' : '⏸️ Brouillon'}</td>
                    <td>
                      <div className="actions">
                        <button className="mini-bouton" onClick={() => modifier(l)}>
                          Modifier
                        </button>
                        <button className="mini-bouton" onClick={() => basculer(l)}>
                          {l.actif !== false ? 'Dépublier' : 'Publier'}
                        </button>
                        <button
                          className="mini-bouton danger"
                          onClick={() => supprimer(l)}
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
