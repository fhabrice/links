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
  const specialites = contenu.specialites || [];
  const aPropos = contenu.apropos || {};
  const logiciels = contenu.logiciels || {};
  const tw = contenu.travaillerAvecNous || {};
  const pied = contenu.pied || {};

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
            <a className="btn btn--fantome btn--petit" href={`tel:${(identite.telephone || '+243976459970').replace(/\s/g,'')}`} title="Appeler LK-TECH">
              📞 Appeler
            </a>
            <Link href="/admin" className="nav-admin" title="Espace d'administration">
              🔒 Admin
            </Link>
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="conteneur hero-grille">
          <div className="hero-contenu">
            <span className="badge">Ingénierie &amp; solutions intégrées · Goma, RDC</span>
            <h1>
              Construire, digitaliser, <em>faire avancer vos projets.</em>
            </h1>
            <p>Vous souhaitez bâtir, développer votre activité ou gagner en autonomie énergétique ? Depuis Goma, LK-TECH associe ingénierie, architecture et numérique pour transformer vos ambitions en projets structurés, adaptés à votre budget et aux réalités du terrain.</p>
            <div className="boutons">
              <a className="bouton bouton-vert" href="#contact">
                Parlons de votre projet ↗
              </a>
              <a className="bouton bouton-fantome" href="#collaborations">
                Explorer les collaborations
              </a>
              <Link className="bouton bouton-fantome" href="/travailler-avec-nous">
                Travailler avec nous ↗
              </Link>
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

  <section className="section section--gris" id="collaborations" aria-labelledby="collaborations-titre">
    <div className="conteneur">
      <div className="section__entete">
        <p className="section__sur">CLIENTS · INVESTISSEURS · PARTENAIRES · TALENTS</p>
        <h2 className="section__titre" id="collaborations-titre">Votre ambition, <em>notre point de départ.</em></h2>
        <p className="section__texte">Chaque collaboration commence par un objectif partagé. Découvrez comment avancer avec LK-TECH, selon votre projet et le rôle que vous souhaitez y jouer.</p>
      </div>
      <div className="grille">
        <article className="carte">
          <h3>Clients &amp; porteurs de projets</h3>
          <p>Construire un bâtiment, digitaliser une entreprise ou équiper un site en énergie : bénéficiez d’une lecture technique de vos besoins et d’une proposition adaptée à vos priorités.</p>
          <a className="accueil-collaboration-lien" href="#contact">Présenter mon projet <span aria-hidden="true">↗</span></a>
        </article>
        <article className="carte">
          <h3>Investisseurs &amp; diaspora</h3>
          <p>Vous souhaitez explorer un projet immobilier, numérique ou énergétique en RDC ? Échangeons sur sa faisabilité technique, ses besoins et les modalités possibles de collaboration avant tout engagement.</p>
          <a className="accueil-collaboration-lien" href="#contact">Échanger sur un investissement <span aria-hidden="true">↗</span></a>
        </article>
        <article className="carte">
          <h3>Entreprises &amp; partenaires</h3>
          <p>Bureaux d’études, fournisseurs, institutions et ONG : rapprochons nos compétences pour répondre à un appel à projets, équiper un site ou concevoir une intervention adaptée aux besoins locaux.</p>
          <a className="accueil-collaboration-lien" href="#contact">Proposer un partenariat <span aria-hidden="true">↗</span></a>
        </article>
        <article className="carte">
          <h3>Talents &amp; professionnels</h3>
          <p>Ingénieurs, architectes, développeurs et techniciens : faites connaître votre savoir-faire et vos disponibilités pour contribuer aux projets de LK-TECH.</p>
          <a className="accueil-collaboration-lien" href="/travailler-avec-nous">Faire connaître mes compétences <span aria-hidden="true">↗</span></a>
        </article>
      </div>
    </div>
  </section>


      <section className="section" id="specialites">
        <div className="conteneur">
          <h2>Quatre expertises pour faire avancer vos projets</h2>
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
          <h2>Votre projet commence ici.</h2>
          <p className="sous-titre">Un besoin à résoudre, un projet à développer ou une collaboration à proposer ? Présentez vos objectifs, votre localisation et votre calendrier pour préparer un premier échange utile.</p>
          <p className="sous-titre">
            {identite.telephone} · {identite.email} · {identite.ville}
          </p>
          <FormulaireContact />
        </div>
      </section>

      {/* Travailler avec nous */}
      <section className="section section--gris" id="travailler-avec-nous">
        <div className="conteneur">
          <div className="section__entete">
            <p className="section__sur">CARRIÈRES &amp; COLLABORATIONS <span className="section__trait"></span></p>
            <h2 className="section__titre">Travailler <em>avec nous</em></h2>
            <p className="section__texte">{tw.soustitre || tw.sousTitre || 'Envie de construire, concevoir, coder ou électrifier l’avenir avec nous ? Rejoignez LK-TECH à Goma.'}</p>
          </div>

          {(tw.avantages || []).length > 0 && (
            <div className="cand-avantages" style={{ marginBottom: '1.5rem' }}>
              {tw.avantages.map((a) => (
                <article key={a.titre} className="cand-avantage">
                  <div className="cand-avantage__icone" aria-hidden="true">{a.icone}</div>
                  <h3>{a.titre}</h3>
                  <p>{a.texte}</p>
                </article>
              ))}
            </div>
          )}

          <div className="cand-poles">
            <article className="cand-pole">
              <div>
                <div className="cand-pole__entete">
                  <span className="cand-pole__num">PÔLE 01</span>
                  <span className="cand-pole__icone" aria-hidden="true">🏗️</span>
                </div>
                <h3>Génie Civil &amp; BTP</h3>
                <p>Études d’exécution, conduite de travaux, suivi de chantier et réhabilitation d’ouvrages.</p>
                <div className="cand-tags">
                  <span className="cand-tag">Ingénieur BTP</span>
                  <span className="cand-tag">Chef de chantier</span>
                  <span className="cand-tag">Métreur</span>
                </div>
              </div>
              <div className="cand-pole__pied">
                <Link className="cand-pole__action" href="/travailler-avec-nous?domaine=G%C3%A9nie%20Civil#candidature">
                  Postuler dans ce pôle <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>

            <article className="cand-pole">
              <div>
                <div className="cand-pole__entete">
                  <span className="cand-pole__num">PÔLE 02</span>
                  <span className="cand-pole__icone" aria-hidden="true">📐</span>
                </div>
                <h3>Architecture &amp; Design</h3>
                <p>Conception architecturale, plans 2D/3D, modélisation BIM et design d’espaces intérieurs.</p>
                <div className="cand-tags">
                  <span className="cand-tag">Architecte</span>
                  <span className="cand-tag">Projeteur 3D / BIM</span>
                  <span className="cand-tag">Designer</span>
                </div>
              </div>
              <div className="cand-pole__pied">
                <Link className="cand-pole__action" href="/travailler-avec-nous?domaine=Architecture%20%26%20Design#candidature">
                  Postuler dans ce pôle <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>

            <article className="cand-pole">
              <div>
                <div className="cand-pole__entete">
                  <span className="cand-pole__num">PÔLE 03</span>
                  <span className="cand-pole__icone" aria-hidden="true">💻</span>
                </div>
                <h3>Informatique &amp; Digital</h3>
                <p>Développement web/mobile, logiciels de gestion, administration systèmes, réseaux et cybersécurité.</p>
                <div className="cand-tags">
                  <span className="cand-tag">Développeur Full-Stack</span>
                  <span className="cand-tag">Réseaux &amp; Cloud</span>
                  <span className="cand-tag">Support IT</span>
                </div>
              </div>
              <div className="cand-pole__pied">
                <Link className="cand-pole__action" href="/travailler-avec-nous?domaine=Informatique#candidature">
                  Postuler dans ce pôle <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>

            <article className="cand-pole">
              <div>
                <div className="cand-pole__entete">
                  <span className="cand-pole__num">PÔLE 04</span>
                  <span className="cand-pole__icone" aria-hidden="true">☀️</span>
                </div>
                <h3>Énergie Renouvelable</h3>
                <p>Dimensionnement solaire photovoltaïque, systèmes hybrides, installation électrique et maintenance.</p>
                <div className="cand-tags">
                  <span className="cand-tag">Technicien Solaire PV</span>
                  <span className="cand-tag">Électricien</span>
                  <span className="cand-tag">Ingénieur énergie</span>
                </div>
              </div>
              <div className="cand-pole__pied">
                <Link className="cand-pole__action" href="/travailler-avec-nous?domaine=%C3%89nergie%20renouvelable#candidature">
                  Postuler dans ce pôle <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>
          </div>

          <div className="cand-accueil-cta">
            <div>
              <h3>Prêt à rejoindre l’aventure LK-TECH ?</h3>
              <p>Accédez à notre espace recrutement complet pour découvrir notre processus et déposer votre dossier en 3 étapes.</p>
            </div>
            <div className="cand-accueil-cta__actions">
              <Link className="btn btn--accent" href="/travailler-avec-nous#candidature">
                Déposer ma candidature <span aria-hidden="true">↗</span>
              </Link>
              <a className="btn btn--contour-clair" href={`tel:${(identite.telephone || '+243976459970').replace(/\s/g, '')}`}>
                📞 {identite.telephone || '+243 976 459 970'}
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="pied">
        <div className="conteneur">
          <div className="pied__grille">
            <div>
              <img className="pied__logo" src={identite.logoClair || '/assets/img/logo-clair.svg'} alt="Logo LK-TECH" width="46" height="46" />
              <div className="pied__nom">LK<i className="tiret">-</i>TECH</div>
              <p className="pied__texte">{pied.description || 'LK-TECH réunit génie civil, architecture & design, technologie et énergie pour transformer vos idées en solutions concrètes. Basés à Goma, nous avançons avec vous, de la conception à la réalisation.'}</p>
            </div>
            <div>
              <h4 className="pied__titre">Navigation</h4>
              <div className="pied__liens">
                <Link href="/">Accueil</Link>
                <Link href="/#specialites">Spécialités</Link>
                <Link href="/#logiciels">Logiciels</Link>
                <Link href="/#apropos">À propos</Link>
                <Link href="/travailler-avec-nous">Travailler avec nous</Link>
                <Link href="/#contact">Contact</Link>
                <Link href="/admin">🔒 Admin</Link>
              </div>
            </div>
            <div>
              <h4 className="pied__titre">Nos spécialités</h4>
              <div className="pied__liens">
                {specialites.map(s => <span key={s.id}>{s.titre}</span>)}
                {specialites.length===0 && <><span>Génie Civil</span><span>Architecture & Design</span><span>Informatique</span><span>Énergie</span></>}
              </div>
            </div>
            <div>
              <h4 className="pied__titre">Coordonnées</h4>
              <div className="pied__liens">
                <span>{identite.ville || 'Goma, Nord-Kivu, RDC'}</span>
                <a href={`tel:${(identite.telephone||'+243976459970').replace(/\s/g,'')}`}>{identite.telephone || '+243 976 459 970'}</a>
                <a href={`mailto:${identite.email || 'contact@linksmartec.com'}`}>{identite.email || 'contact@linksmartec.com'}</a>
                <a href={`https://${identite.siteWeb || 'www.linksmartec.com'}`} target="_blank" rel="noreferrer">{identite.siteWeb || 'www.linksmartec.com'}</a>
                <span>{identite.rccm ? `RCCM : ${identite.rccm}` : ''}</span>
              </div>
            </div>
          </div>
          <div className="pied__bas">
            <span>© {new Date().getFullYear()} LK-TECH — {pied.mentions || 'Tous droits réservés.'}</span>
            <span>Goma, République démocratique du Congo {reglages.maintenance ? '· Mode maintenance' : ''} · {pilote === 'supabase' ? 'Supabase connecté' : 'Stockage local'}</span>
          </div>
        </div>
      </footer>
    </>
  );
}
