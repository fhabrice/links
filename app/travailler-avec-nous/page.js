import Link from 'next/link';
import { lireContenu } from '../../lib/store';
import FormulaireTravaillerAvecNous from '../components/FormulaireTravaillerAvecNous';
import MenuNavigation from '../components/MenuNavigation';
import PiedDePage from '../components/PiedDePage';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Travailler avec nous | LK-TECH — Carrières & Recrutement',
  description:
    'Rejoignez LK-TECH à Goma : carrières, stages, freelances et partenariats en génie civil, architecture & design, informatique et énergie renouvelable.'
};

const AVANTAGES_DEFAUT = [
  {
    icone: '🏗️',
    titre: 'Projets d’impact concret',
    texte:
      'Participez à des chantiers, infrastructures et solutions numériques qui transforment durablement Goma et l’Est de la RDC.'
  },
  {
    icone: '💡',
    titre: 'Équipe pluridisciplinaire',
    texte:
      'Collaborez au quotidien avec des ingénieurs civils, architectes, développeurs logiciels et spécialistes en énergie solaire.'
  },
  {
    icone: '🌱',
    titre: 'Progression & mentorat',
    texte:
      'Bénéficiez d’un encadrement technique rigoureux, de formations terrain et de perspectives d’évolution au sein de nos 4 pôles.'
  }
];

const POLES_RECRUTEMENT = [
  {
    num: 'PÔLE 01',
    icone: '🏗️',
    valeur: 'Génie Civil',
    titre: 'Génie Civil & BTP',
    texte:
      'Études techniques, dimensionnement d’ouvrages, suivi d’exécution, gros œuvre, second œuvre et réhabilitation de bâtiments.',
    profils: ['Ingénieur civil', 'Conducteur de travaux', 'Chef de chantier', 'Métreur / Technicien BTP']
  },
  {
    num: 'PÔLE 02',
    icone: '📐',
    valeur: 'Architecture & Design',
    titre: 'Architecture & Design',
    texte:
      'Conception architecturale bioclimatique, plans 2D/3D, modélisation BIM, aménagement intérieur et maîtrise d’œuvre esthétique.',
    profils: ['Architecte', 'Projeteur 3D / BIM', 'Designer d’intérieur', 'Dessinateur bâtiment']
  },
  {
    num: 'PÔLE 03',
    icone: '💻',
    valeur: 'Informatique',
    titre: 'Informatique & Solutions Digitales',
    texte:
      'Développement d’applications web/mobiles et progiciels métiers, réseaux d’entreprise, serveurs, cloud et cybersécurité.',
    profils: ['Développeur Full-Stack', 'Ingénieur systèmes & réseaux', 'Technicien IT', 'UI/UX Designer']
  },
  {
    num: 'PÔLE 04',
    icone: '☀️',
    valeur: 'Énergie renouvelable',
    titre: 'Énergie Renouvelable & Électricité',
    texte:
      'Audit énergétique, dimensionnement photovoltaïque, installation de systèmes solaires hybrides, autonomie et maintenance.',
    profils: ['Ingénieur énergéticien', 'Technicien solaire PV', 'Électricien bâtiment', 'Chargé de maintenance']
  }
];

export default async function TravaillerAvecNous() {
  const contenu = await lireContenu();
  const identite = contenu.identite || {};
  const tw = contenu.travaillerAvecNous || {};
  const gform = tw.googleForm || {};

  const telephoneBrut = identite.telephone || '+243 976 459 970';
  const telephoneLien = telephoneBrut.replace(/\s+/g, '');
  const emailContact = identite.email || 'contact@linksmartec.com';
  const villeContact = identite.ville || 'Goma, Nord-Kivu, RDC';
  const avantages = (tw.avantages || []).length > 0 ? tw.avantages : AVANTAGES_DEFAUT;

  return (
    <>
      <header className="entete">
        <div className="conteneur">
          <Link href="/" className="logo" aria-label="Accueil LK-TECH">
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
          </Link>
          <div className="entete-actions">
            <MenuNavigation />
            <a className="btn btn--fantome btn--petit" href={`tel:${telephoneLien}`} title="Appeler LK-TECH">
              📞 Appeler
            </a>
            <a className="btn btn--accent btn--petit" href="#candidature">
              Postuler ↓
            </a>
          </div>
        </div>
      </header>

      <main>
        {/* 00 · HERO CARRIÈRES */}
        <section className="cand-hero">
          <div className="conteneur">
            <nav className="fil-ariane" aria-label="Fil d'Ariane">
              <Link href="/">Accueil</Link> <span aria-hidden="true">›</span> <span>Travailler avec nous</span>
            </nav>

            <div className="cand-hero__grille">
              <div>
                <span className="cand-badge">
                  {tw.surTitre || 'CARRIÈRES & COLLABORATIONS · GOMA, RDC'}
                </span>
                <h1 className="cand-hero__titre">
                  Construisez l’avenir <em>avec LK-TECH.</em>
                </h1>
                <p className="cand-hero__soustitre">
                  {tw.soustitre ||
                    tw.sousTitre ||
                    'Envie de bâtir, concevoir, coder ou électrifier des projets durables ? Rejoignez nos équipes.'}
                </p>
                <p className="cand-hero__texte">
                  {tw.texte ||
                    'Nous recrutons régulièrement des talents en génie civil, architecture & design, informatique et énergie renouvelable. Que vous soyez jeune diplômé, ingénieur confirmé, stagiaire ou consultant freelance, déposez votre candidature en quelques minutes.'}
                </p>

                <div className="cand-hero__actions">
                  <a className="btn btn--accent" href="#candidature">
                    Déposer ma candidature <span aria-hidden="true">↓</span>
                  </a>
                  <a className="btn btn--contour-clair" href="#poles-recrutement">
                    Découvrir nos 4 pôles <span aria-hidden="true">→</span>
                  </a>
                </div>
              </div>

              <aside className="cand-hero__carte" aria-label="Synthèse recrutement LK-TECH">
                <p className="cand-hero__carte-sur">ENGAGEMENT RH · LK-TECH</p>
                <h2>Pourquoi nous rejoindre ?</h2>
                <div className="cand-chiffres">
                  <div className="cand-chiffre">
                    <strong>4 pôles</strong>
                    <span>Métiers complémentaires</span>
                  </div>
                  <div className="cand-chiffre">
                    <strong>48 h</strong>
                    <span>Délai moyen d’analyse</span>
                  </div>
                  <div className="cand-chiffre">
                    <strong>4 formats</strong>
                    <span>CDI, Stage, Freelance, Partenariat</span>
                  </div>
                  <div className="cand-chiffre">
                    <strong>Goma</strong>
                    <span>Rayonnement Nord-Kivu &amp; RDC</span>
                  </div>
                </div>
                <ul className="cand-points">
                  <li>Chantiers et projets numériques à fort impact local</li>
                  <li>Encadrement par des ingénieurs et architectes expérimentés</li>
                  <li>Culture de rigueur, d’innovation et de transparence</li>
                  <li>Traitement confidentiel et retour personnalisé sur chaque dossier</li>
                </ul>
                <div className="cand-hero__carte-pied">
                  <span aria-hidden="true">✉️</span>
                  <span>Réception directe par notre cellule recrutement &amp; direction technique.</span>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* 01 · AVANTAGES */}
        <section className="section" id="avantages">
          <div className="conteneur">
            <div className="section__entete">
              <p className="section__sur">
                POURQUOI NOUS REJOINDRE <span className="section__trait"></span> 01
              </p>
              <h2 className="section__titre">
                Un environnement conçu pour faire grandir <em>vos compétences.</em>
              </h2>
              <p className="section__texte">
                Chez LK-TECH, chaque collaborateur contribue directement à la réussite technique des ouvrages et solutions livrés à nos clients.
              </p>
            </div>

            <div className="cand-avantages">
              {avantages.map((a) => (
                <article key={a.titre} className="cand-avantage">
                  <div className="cand-avantage__icone" aria-hidden="true">
                    {a.icone || '★'}
                  </div>
                  <h3>{a.titre}</h3>
                  <p>{a.texte}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 02 · NOS 4 PÔLES QUI RECRUTENT */}
        <section className="section section--gris" id="poles-recrutement">
          <div className="conteneur">
            <div className="section__entete">
              <p className="section__sur">
                NOS DOMAINES DE RECRUTEMENT <span className="section__trait"></span> 02
              </p>
              <h2 className="section__titre">
                Quatre pôles d’excellence, <em>une même exigence.</em>
              </h2>
              <p className="section__texte">
                Sélectionnez le pôle correspondant à votre spécialité pour pré-remplir directement votre formulaire de candidature.
              </p>
            </div>

            <div className="cand-poles">
              {POLES_RECRUTEMENT.map((pole) => (
                <article key={pole.valeur} className="cand-pole">
                  <div>
                    <div className="cand-pole__entete">
                      <span className="cand-pole__num">{pole.num}</span>
                      <span className="cand-pole__icone" aria-hidden="true">
                        {pole.icone}
                      </span>
                    </div>
                    <h3>{pole.titre}</h3>
                    <p>{pole.texte}</p>
                    <div className="cand-tags" aria-label="Profils recherchés">
                      {pole.profils.map((p) => (
                        <span key={p} className="cand-tag">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="cand-pole__pied">
                    <a
                      className="cand-pole__action"
                      href="#candidature"
                      data-choisir-domaine={pole.valeur}
                    >
                      Postuler dans ce pôle <span aria-hidden="true">→</span>
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 03 · MODES DE COLLABORATION & PROCESSUS */}
        <section className="section" id="processus">
          <div className="conteneur">
            <div className="section__entete">
              <p className="section__sur">
                PARCOURS CANDIDAT <span className="section__trait"></span> 03
              </p>
              <h2 className="section__titre">
                Un processus simple, <em>transparent et structuré.</em>
              </h2>
              <p className="section__texte">
                Choisissez votre format de collaboration et suivez les quatre étapes clés de notre recrutement.
              </p>
            </div>

            <div className="cand-modes" aria-label="Modes de collaboration">
              <button type="button" className="cand-mode" data-choisir-type="Emploi">
                <span className="cand-mode__badge">Format 01</span>
                <strong>Emploi (CDI / CDD)</strong>
                <span>Intégrez durablement nos équipes techniques et projets structurants à Goma.</span>
              </button>
              <button type="button" className="cand-mode" data-choisir-type="Stage">
                <span className="cand-mode__badge">Format 02</span>
                <strong>Stage académique &amp; pro</strong>
                <span>Apprenez sur le terrain aux côtés de nos ingénieurs, architectes et développeurs.</span>
              </button>
              <button type="button" className="cand-mode" data-choisir-type="Freelance / Consultant">
                <span className="cand-mode__badge">Format 03</span>
                <strong>Freelance / Consultant</strong>
                <span>Intervenez sur des missions ciblées d’expertise, d’étude ou de développement.</span>
              </button>
              <button type="button" className="cand-mode" data-choisir-type="Partenariat">
                <span className="cand-mode__badge">Format 04</span>
                <strong>Partenariat technique</strong>
                <span>Unissons nos savoir-faire pour répondre ensemble à des marchés d’envergure.</span>
              </button>
            </div>

            <div className="cand-etapes">
              <article className="cand-etape">
                <span className="cand-etape__num">01</span>
                <h3>Dépôt du dossier</h3>
                <p>
                  Remplissez le formulaire ci-dessous avec votre parcours, vos motivations et un lien vers votre CV ou portfolio.
                </p>
              </article>
              <article className="cand-etape">
                <span className="cand-etape__num">02</span>
                <h3>Analyse sous 48 h</h3>
                <p>
                  Votre candidature est examinée conjointement par le responsable du pôle concerné et la direction.
                </p>
              </article>
              <article className="cand-etape">
                <span className="cand-etape__num">03</span>
                <h3>Entretien &amp; échange</h3>
                <p>
                  Rencontre dans nos bureaux à Goma ou en visioconférence autour de vos réalisations et d’un cas concret.
                </p>
              </article>
              <article className="cand-etape">
                <span className="cand-etape__num">04</span>
                <h3>Intégration</h3>
                <p>
                  Proposition claire, accueil au sein de l’équipe et démarrage accompagné sur nos outils et projets.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* 04 · FORMULAIRE DE CANDIDATURE */}
        <section className="section section--gris" id="candidature">
          <div className="conteneur">
            <div className="section__entete">
              <p className="section__sur">
                DÉPOSER VOTRE DOSSIER <span className="section__trait"></span> 04
              </p>
              <h2 className="section__titre">{tw.formulaire?.titre || 'Candidature complète'}</h2>
              <p className="section__texte">
                {tw.formulaire?.sousTitre ||
                  'Complétez les trois étapes ci-dessous. Votre dossier est transmis directement à notre équipe de recrutement.'}
              </p>
            </div>

            <div className="cand-dossier__grille">
              <aside className="cand-sidebar" aria-label="Coordonnées recrutement">
                <div className="cand-rh-carte">
                  <p className="cand-rh-carte__sur">CONTACT RECRUTEMENT</p>
                  <h3>Besoin d’un renseignement ?</h3>
                  <p>
                    Notre équipe est joignable du lundi au samedi de 08h00 à 18h00 pour toute question relative aux postes, stages ou partenariats.
                  </p>

                  <div className="cand-rh-liste">
                    <div className="cand-rh-item">
                      <span className="cand-rh-item__icone" aria-hidden="true">
                        📞
                      </span>
                      <div>
                        <small>Téléphone direct</small>
                        <a href={`tel:${telephoneLien}`}>{telephoneBrut}</a>
                      </div>
                    </div>
                    <div className="cand-rh-item">
                      <span className="cand-rh-item__icone" aria-hidden="true">
                        ✉️
                      </span>
                      <div>
                        <small>E-mail RH &amp; Direction</small>
                        <a href={`mailto:${emailContact}`}>{emailContact}</a>
                      </div>
                    </div>
                    <div className="cand-rh-item">
                      <span className="cand-rh-item__icone" aria-hidden="true">
                        📍
                      </span>
                      <div>
                        <small>Siège &amp; Bureaux</small>
                        <strong>{villeContact}</strong>
                      </div>
                    </div>
                  </div>

                  <a className="btn btn--accent btn--bloc" href={`tel:${telephoneLien}`}>
                    📞 Appeler maintenant
                  </a>
                </div>

                <div className="cand-checklist">
                  <h4>Conseils pour votre dossier</h4>
                  <ul className="cand-points">
                    <li>Précisez le pôle qui correspond le mieux à votre profil</li>
                    <li>Ajoutez un lien Google Drive, Dropbox, GitHub ou LinkedIn accessible</li>
                    <li>Décrivez vos réalisations concrètes ou projets académiques</li>
                    <li>Indiquez clairement votre disponibilité de démarrage</li>
                  </ul>
                  {gform.actionUrl && (
                    <p style={{ marginTop: '1rem', fontSize: '0.82rem', color: '#475569' }}>
                      ✅ Formulaire synchronisé avec Google Form.
                    </p>
                  )}
                </div>
              </aside>

              <FormulaireTravaillerAvecNous
                boutonTexte={tw.formulaire?.boutonTexte || 'Envoyer ma candidature'}
              />
            </div>
          </div>
        </section>
      </main>

      <PiedDePage contenu={contenu} />

      <div className="barre-appel" aria-label="Actions rapides">
        <a className="barre-appel__btn barre-appel__btn--tel" href={`tel:${telephoneLien}`}>
          📞 Appeler
        </a>
        <a className="barre-appel__btn barre-appel__btn--cta" href="#candidature">
          Postuler ↓
        </a>
      </div>
    </>
  );
}
