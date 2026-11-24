import Link from 'next/link';
import { lireContenu, lireReglages, piloteActif } from '../lib/store';
import FormulaireContact from './components/FormulaireContact';
import MenuNavigation from './components/MenuNavigation';

export const dynamic = 'force-dynamic';

const ICONES = { code: '</>', btp: '⌂', architecture: '◧', energie: '⚡', solaire: '☀️' };

function formaterPrix(produit) {
  try {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: produit.devise === 'USD' ? 'USD' : 'CDF',
      maximumFractionDigits: 0
    }).format(produit.prix);
  } catch {
    return `${produit.prix} ${produit.devise || ''}`;
  }
}

export default async function Accueil() {
  const [contenu, reglages, pilote] = await Promise.all([
    lireContenu(),
    lireReglages(),
    piloteActif()
  ]);

  const identite = contenu.identite || {};
  const hero = (contenu.hero?.onglets || []).find(
    (t) => t.id === contenu.hero?.actif
  ) || contenu.hero?.onglets?.[0];
  const specialites = contenu.specialites || [];
  const aPropos = contenu.apropos || {};
  const logiciels = contenu.logiciels || {};

  return (
    <>
      <header className="entete">
        <div className="conteneur">
          <div className="logo">
            <img
              className="logo-marque"
              src={identite.logoClair || '/assets/img/logo-clair.svg'}
              alt=""
              width="34"
              height="39"
            />
            <span className="logo-texte">
              LK<span>-TECH</span>
            </span>
          </div>
          <div className="entete-actions">
            <MenuNavigation />
            <Link href="/admin" className="nav-admin" title="Espace d'administration">
              🔒 Admin
            </Link>
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="conteneur hero-grille">
          <div className="hero-contenu">
            {hero?.badge && <span className="badge">{hero.badge}</span>}
            <h1>
              {hero?.titre} <em>{hero?.titreAccent}</em>
            </h1>
            <p>{hero?.description}</p>
            <div className="boutons">
              <a className="bouton bouton-vert" href="#logiciels">
                {hero?.boutonTexte || 'Découvrir nos offres'}
              </a>
              <a className="bouton bouton-fantome" href="#contact">
                Nous contacter
              </a>
            </div>
          </div>
          <div className="hero-visuel">
            <img
              src={
                contenu.vedetteDevis?.image ||
                '/assets/img/vedette-construction.jpg'
              }
              alt="Équipes LK-TECH sur un chantier de construction à Goma"
              width="640"
              height="480"
            />
          </div>
        </div>
        <div className="conteneur hero-specialites" aria-label="Nos spécialités">
          {specialites.map((s) => (
            <div className="hero-specialite" key={s.id}>
              <span className="hero-specialite-icone" aria-hidden="true">
                {ICONES[s.icone] || '★'}
              </span>
              <div>
                <strong>{s.titre}</strong>
                <p>{s.texte}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section" id="specialites">
        <div className="conteneur">
          <h2>Nos spécialités</h2>
          <p className="sous-titre">
            {identite.nomLong || 'LK-TECH'} — {identite.slogan}
          </p>
          <div className="grille">
            {specialites.map((s) => (
              <div className="carte" key={s.id}>
                <div className="icone">{ICONES[s.icone] || '★'}</div>
                <h3>{s.titre}</h3>
                <p>{s.texte}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="logiciels" style={{ background: '#eef2f7' }}>
        <div className="conteneur">
          <h2>{logiciels.titre || 'Nos logiciels'}</h2>
          <p className="sous-titre">
            {logiciels.sousTitre ||
              'Des logiciels conçus par LK-TECH, avec pour chacun une explication complète.'}
          </p>
          <div className="logiciels-grille">
            {(logiciels.items || [])
              .filter((l) => l.actif !== false)
              .map((l) => (
                <article className="carte carte-logiciel" key={l.id}>
                  <div className="logiciel-entete">
                    <span className="logiciel-icone" aria-hidden="true">
                      {l.icone || '💾'}
                    </span>
                    <div>
                      <h3>{l.nom}</h3>
                      <p className="logiciel-pitch">{l.pitch}</p>
                    </div>
                  </div>
                  {l.badge && <span className="produit-badge">{l.badge}</span>}
                  <p className="logiciel-explication">{l.explication}</p>
                  {(l.fonctionnalites || []).length > 0 && (
                    <ul className="logiciel-fonctions">
                      {l.fonctionnalites.map((f) => (
                        <li key={f}>{f}</li>
                      ))}
                    </ul>
                  )}
                  <div className="logiciel-pied">
                    <div className="logiciel-prix">
                      <span className="produit-prix">{formaterPrix(l)}</span>
                      {l.typePrix && (
                        <span className="logiciel-type">{l.typePrix}</span>
                      )}
                    </div>
                    <a className="bouton bouton-vert" href="#contact">
                      {logiciels.texteBouton || 'Demander une démo'}
                    </a>
                  </div>
                </article>
              ))}
            {!(logiciels.items || []).length && (
              <p className="vide">Les logiciels arrivent bientôt.</p>
            )}
          </div>
        </div>
      </section>

      <section className="section" id="apropos">
        <div className="conteneur">
          <h2>{aPropos.titre || 'À propos de nous'}</h2>
          <div className="apropos-grille">
            <div className="apropos-visuel">
              <img
                src="/assets/img/portrait-expertise.jpg"
                alt="Collaboration autour de plans et d’outils numériques"
                loading="lazy"
                width="560"
                height="420"
              />
            </div>
            <p className="apropos-texte">
              {aPropos.texte || (aPropos.intro || []).join(' ')}
            </p>
          </div>
          <div className="grille">
            {(aPropos.chiffres || []).map((c) => (
              <div className="carte" key={c.libelle}>
                <div className="stat">
                  <div className="valeur">{c.valeur}</div>
                  <div className="libelle">{c.libelle}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section contact" id="contact">
        <div className="conteneur">
          <h2>Parlons de votre projet</h2>
          <p className="sous-titre">
            {identite.telephone} · {identite.email} · {identite.ville}
          </p>
          <FormulaireContact />
        </div>
      </section>

      <footer className="pied">
        <div className="conteneur">
          <span className="pied-signature">
            <img
              className="pied-marque"
              src={identite.logoClair || '/assets/img/logo-clair.svg'}
              alt=""
              width="26"
              height="30"
            />
            © {new Date().getFullYear()} {identite.nomLong || 'LK-TECH'} · RCCM{' '}
            {identite.rccm || '—'} ·{' '}
            <Link href="/admin" className="lien-admin-pied">
              Administration
            </Link>
          </span>
          <span>
            Backend : Next.js + Supabase
            {pilote === 'supabase' ? ' (connecté)' : ' (stockage local)'}
            {reglages.maintenance ? ' · Mode maintenance' : ''}
          </span>
        </div>
      </footer>
    </>
  );
}
