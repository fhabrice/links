'use client';

import { useState } from 'react';

/**
 * Gestion de TOUT le contenu éditorial du site :
 * identité, hero, spécialités, à propos + éditeur JSON avancé
 * (services, approche, boutique, vedetteDevis, contact…).
 */
export default function OngletContenu({ contenu, sauvegarder }) {
  const [c, setC] = useState(contenu);
  const [etatSauvegarde, setEtatSauvegarde] = useState(null);
  const [ongletHero, setOngletHero] = useState(0);
  const [jsonTexte, setJsonTexte] = useState('');
  const [erreurJson, setErreurJson] = useState('');

  /** Modifie un champ imbriqué, ex. champ(['identite','nom'], 'LK-TECH'). */
  function champ(chemin, valeur) {
    setC((prec) => {
      const copie = structuredClone(prec);
      let cible = copie;
      for (let i = 0; i < chemin.length - 1; i++) {
        const cle = chemin[i];
        if (!cible[cle] || typeof cible[cle] !== 'object') cible[cle] = {};
        cible = cible[cle];
      }
      cible[chemin[chemin.length - 1]] = valeur;
      return copie;
    });
    setEtatSauvegarde(null);
  }

  function ajouterItem(cle, modele) {
    setC((prec) => {
      const copie = structuredClone(prec);
      if (!Array.isArray(copie[cle])) copie[cle] = [];
      copie[cle].push(modele);
      return copie;
    });
  }

  function supprimerItem(cle, index) {
    setC((prec) => {
      const copie = structuredClone(prec);
      copie[cle].splice(index, 1);
      return copie;
    });
  }

  async function enregistrer() {
    setEtatSauvegarde({ statut: 'envoi', texte: 'Enregistrement…' });
    const resultat = await sauvegarder(c);
    setEtatSauvegarde(
      resultat.ok
        ? { statut: 'ok', texte: '✅ Contenu enregistré — actualisez la page d’accueil pour voir le résultat.' }
        : { statut: 'erreur', texte: resultat.erreur || 'Erreur lors de l’enregistrement.' }
    );
  }

  function chargerJson() {
    setJsonTexte(JSON.stringify(c, null, 2));
    setErreurJson('');
  }

  function appliquerJson() {
    try {
      const objet = JSON.parse(jsonTexte);
      if (!objet || typeof objet !== 'object') throw new Error('invalide');
      setC(objet);
      setErreurJson('');
      setEtatSauvegarde(null);
    } catch {
      setErreurJson('JSON invalide : vérifiez la syntaxe (virgules, guillemets…).');
    }
  }

  const hero = c.hero || {};
  const ongletsHero = Array.isArray(hero.onglets) ? hero.onglets : [];
  const ongletActuel = ongletsHero[ongletHero] || null;
  const specialites = Array.isArray(c.specialites) ? c.specialites : [];
  const apropos = c.apropos || {};
  const chiffres = Array.isArray(apropos.chiffres) ? apropos.chiffres : [];
  const identite = c.identite || {};

  return (
    <>
      {/* --------------------- IDENTITÉ --------------------- */}
      <div className="admin-section">
        <h3>🏛 Identité de l’entreprise</h3>
        <p className="aide-section">
          Nom, slogan et coordonnées affichés dans l’en-tête, le hero et le pied de
          page.
        </p>
        <div className="grille-2">
          <div className="champ">
            <label>Nom affiché</label>
            <input
              value={identite.nomLong || ''}
              onChange={(e) => champ(['identite', 'nomLong'], e.target.value)}
            />
          </div>
          <div className="champ">
            <label>Slogan</label>
            <input
              value={identite.slogan || ''}
              onChange={(e) => champ(['identite', 'slogan'], e.target.value)}
            />
          </div>
          <div className="champ">
            <label>Téléphone</label>
            <input
              value={identite.telephone || ''}
              onChange={(e) => champ(['identite', 'telephone'], e.target.value)}
            />
          </div>
          <div className="champ">
            <label>E-mail</label>
            <input
              value={identite.email || ''}
              onChange={(e) => champ(['identite', 'email'], e.target.value)}
            />
          </div>
          <div className="champ">
            <label>Ville / adresse</label>
            <input
              value={identite.ville || ''}
              onChange={(e) => champ(['identite', 'ville'], e.target.value)}
            />
          </div>
          <div className="champ">
            <label>RCCM</label>
            <input
              value={identite.rccm || ''}
              onChange={(e) => champ(['identite', 'rccm'], e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ----------------------- HERO ----------------------- */}
      <div className="admin-section">
        <h3>🚀 Bannière d’accueil (hero)</h3>
        <p className="aide-section">
          Le texte de la grande bannière. Trois onglets existent : Informatique,
          Construction, Énergie.
        </p>
        <div className="grille-2">
          <div className="champ">
            <label>Onglet affiché par défaut</label>
            <select
              value={hero.actif || ''}
              onChange={(e) => champ(['hero', 'actif'], e.target.value)}
            >
              {ongletsHero.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.libelle || o.id}
                </option>
              ))}
            </select>
          </div>
          <div className="champ">
            <label>Modifier l’onglet</label>
            <select
              value={ongletHero}
              onChange={(e) => setOngletHero(Number(e.target.value))}
            >
              {ongletsHero.map((o, i) => (
                <option key={o.id} value={i}>
                  {o.libelle || o.id}
                </option>
              ))}
            </select>
          </div>
        </div>
        {ongletActuel && (
          <>
            <div className="grille-2">
              <div className="champ">
                <label>Badge</label>
                <input
                  value={ongletActuel.badge || ''}
                  onChange={(e) => champ(['hero', 'onglets', ongletHero, 'badge'], e.target.value)}
                />
              </div>
              <div className="champ">
                <label>Titre (avant l’accent)</label>
                <input
                  value={ongletActuel.titre || ''}
                  onChange={(e) => champ(['hero', 'onglets', ongletHero, 'titre'], e.target.value)}
                />
              </div>
              <div className="champ">
                <label>Titre accentué (en vert)</label>
                <input
                  value={ongletActuel.titreAccent || ''}
                  onChange={(e) =>
                    champ(['hero', 'onglets', ongletHero, 'titreAccent'], e.target.value)
                  }
                />
              </div>
              <div className="champ">
                <label>Bouton — texte</label>
                <input
                  value={ongletActuel.boutonTexte || ''}
                  onChange={(e) =>
                    champ(['hero', 'onglets', ongletHero, 'boutonTexte'], e.target.value)
                  }
                />
              </div>
            </div>
            <div className="champ">
              <label>Description</label>
              <textarea
                rows={3}
                value={ongletActuel.description || ''}
                onChange={(e) =>
                  champ(['hero', 'onglets', ongletHero, 'description'], e.target.value)
                }
              />
            </div>
          </>
        )}
      </div>

      {/* -------------------- SPÉCIALITÉS -------------------- */}
      <div className="admin-section">
        <h3>🧩 Cartes « Nos spécialités »</h3>
        <p className="aide-section">Les trois cartes affichées sous la bannière.</p>
        {specialites.map((s, i) => (
          <div className="item-bloc" key={i}>
            <div className="entete-item">
              <strong>Carte {i + 1}</strong>
              <button
                className="mini-bouton danger"
                onClick={() => supprimerItem('specialites', i)}
              >
                Supprimer
              </button>
            </div>
            <div className="grille-2">
              <div className="champ">
                <label>Titre</label>
                <input
                  value={s.titre || ''}
                  onChange={(e) => champ(['specialites', i, 'titre'], e.target.value)}
                />
              </div>
              <div className="champ">
                <label>Icône (code / btp / energie)</label>
                <input
                  value={s.icone || ''}
                  onChange={(e) => champ(['specialites', i, 'icone'], e.target.value)}
                />
              </div>
            </div>
            <div className="champ">
              <label>Texte</label>
              <textarea
                rows={2}
                value={s.texte || ''}
                onChange={(e) => champ(['specialites', i, 'texte'], e.target.value)}
              />
            </div>
          </div>
        ))}
        <button
          className="mini-bouton"
          onClick={() =>
            ajouterItem('specialites', {
              id: `spec-${Date.now()}`,
              icone: 'code',
              titre: 'Nouvelle spécialité',
              texte: 'Décrivez cette spécialité…'
            })
          }
        >
          + Ajouter une spécialité
        </button>
      </div>

      {/* -------------------- À PROPOS --------------------- */}
      <div className="admin-section">
        <h3>ℹ️ Section « À propos »</h3>
        <div className="grille-2">
          <div className="champ">
            <label>Titre</label>
            <input
              value={apropos.titre || ''}
              onChange={(e) => champ(['apropos', 'titre'], e.target.value)}
            />
          </div>
        </div>
        <div className="champ">
          <label>Texte</label>
          <textarea
            rows={3}
            value={apropos.texte || ''}
            onChange={(e) => champ(['apropos', 'texte'], e.target.value)}
          />
        </div>
        <p className="aide-section">Chiffres clés affichés en cartes :</p>
        {chiffres.map((ch, i) => (
          <div className="item-bloc" key={i}>
            <div className="entete-item">
              <strong>Chiffre {i + 1}</strong>
              <button
                className="mini-bouton danger"
                onClick={() => {
                  setC((prec) => {
                    const copie = structuredClone(prec);
                    copie.apropos.chiffres.splice(i, 1);
                    return copie;
                  });
                }}
              >
                Supprimer
              </button>
            </div>
            <div className="grille-2">
              <div className="champ">
                <label>Valeur</label>
                <input
                  value={ch.valeur || ''}
                  onChange={(e) => champ(['apropos', 'chiffres', i, 'valeur'], e.target.value)}
                />
              </div>
              <div className="champ">
                <label>Libellé</label>
                <input
                  value={ch.libelle || ''}
                  onChange={(e) => champ(['apropos', 'chiffres', i, 'libelle'], e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}
        <button
          className="mini-bouton"
          onClick={() =>
            setC((prec) => {
              const copie = structuredClone(prec);
              if (!copie.apropos) copie.apropos = {};
              if (!Array.isArray(copie.apropos.chiffres)) copie.apropos.chiffres = [];
              copie.apropos.chiffres.push({ valeur: '0', libelle: 'Nouveau chiffre' });
              return copie;
            })
          }
        >
          + Ajouter un chiffre
        </button>
      </div>

      {/* ------------------ JSON AVANCÉ -------------------- */}
      <div className="admin-section">
        <h3>🔧 Avancé — tout le reste en JSON</h3>
        <p className="aide-section">
          Services, approche, boutique, coordonnées de contact… : chargez le JSON,
          modifiez, appliquez, puis enregistrez.
        </p>
        <div className="barre-actions" style={{ marginTop: 0, marginBottom: '0.7rem' }}>
          <button className="mini-bouton" onClick={chargerJson}>
            Charger le contenu actuel
          </button>
          <button className="mini-bouton" onClick={appliquerJson} disabled={!jsonTexte}>
            Appliquer au contenu
          </button>
        </div>
        <textarea
          className="json-zone"
          value={jsonTexte}
          onChange={(e) => setJsonTexte(e.target.value)}
          placeholder='Cliquez sur « Charger le contenu actuel »…'
          spellCheck={false}
        />
        {erreurJson && <div className="alerte" style={{ marginTop: '0.7rem' }}>{erreurJson}</div>}
      </div>

      {/* --------------------- SAUVEGARDE ------------------- */}
      <div className="barre-actions">
        <button className="bouton bouton-vert" onClick={enregistrer} disabled={etatSauvegarde?.statut === 'envoi'}>
          {etatSauvegarde?.statut === 'envoi' ? 'Enregistrement…' : '💾 Enregistrer tout le contenu'}
        </button>
        {etatSauvegarde && (
          <span
            className={
              etatSauvegarde.statut === 'erreur' ? 'retour-admin erreur' : 'retour-admin ok'
            }
          >
            {etatSauvegarde.texte}
          </span>
        )}
      </div>
    </>
  );
}
