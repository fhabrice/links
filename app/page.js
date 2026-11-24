import Link from 'next/link';
import { lireContenu, lireReglages, piloteActif } from '../lib/store';
import FormulaireContact from './components/FormulaireContact';
import FormulaireTravaillerAvecNous from './components/FormulaireTravaillerAvecNous';
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
            <a className="btn btn--fantome btn--petit" href={`tel:${(identite.telephone || '+243976459970').replace(/\s/g,'')}`} title="Appeler LK-TECH">
              📞 Appeler
            </a>
            <Link className="btn btn--fantome btn--petit" href="/travailler-avec-nous" style={{borderColor:'#2e9e5b'}}>
              Travailler avec nous
            </Link>
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

      {/* Travailler avec nous */}
      <section className="section section--gris" id="travailler-avec-nous">
        <div className="conteneur">
          <div className="section__entete">
            <p className="section__sur">REJOIGNEZ L’AVENTURE</p>
            <h2 className="section__titre">Travailler <em>avec nous</em></h2>
            <p className="section__texte">{tw.soustitre || tw.sousTitre || 'Envie de construire, coder ou électrifier l’avenir avec nous ? Rejoignez LK-TECH à Goma.'}</p>
            <p style={{marginTop:'.6rem', color:'#475569', maxWidth:'48rem', lineHeight:1.7}}>{tw.texte}</p>
          </div>

          {(tw.avantages||[]).length>0 && (
            <div className="grille" style={{marginBottom:'2rem'}}>
              {tw.avantages.map(a=>(
                <div key={a.titre} className="carte">
                  <div style={{fontSize:'1.5rem'}}>{a.icone}</div>
                  <h3>{a.titre}</h3>
                  <p>{a.texte}</p>
                </div>
              ))}
            </div>
          )}

          <div className="grille" style={{gridTemplateColumns:'1fr 1.4fr', gap:'2rem'}}>
            <div>
              <div className="carte" style={{textAlign:'left'}}>
                <h3>📞 Appeler</h3>
                <p>Une question avant de postuler ? Appelez-nous directement.</p>
                <a className="bouton bouton-vert" href={`tel:${(identite.telephone||'+243976459970').replace(/\s/g,'')}`}>
                  {identite.telephone || '+243 976 459 970'}
                </a>
                <p style={{fontSize:'.82rem', color:'#64748b', marginTop:'.6rem'}}>Lun–Sam 08h00–18h00 · Réponse rapide</p>
              </div>
              <div className="carte" style={{marginTop:'1rem'}}>
                <h3>🔗 Google Form / Gmail</h3>
                <p style={{fontSize:'.88rem', color:'#475569', lineHeight:1.6}}>
                  Chaque candidature est : 1) enregistrée, 2) envoyée directement à fabricenzarubara@gmail.com, 3) consultable dans l'admin.
                  {tw.googleForm?.actionUrl ? ` Envoyé à ${tw.emailDestination || tw.googleForm?.gmailDestination || 'fabricenzarubara@gmail.com'}` : ' À configurer dans l’admin.'}
                </p>
                <Link href="/travailler-avec-nous" className="bouton bouton-fantome" style={{marginTop:'.6rem'}}>Page dédiée ↗</Link>
              </div>
            </div>
            <div>
              <h3 style={{marginBottom:'1rem'}}>{tw.formulaire?.titre || 'Candidature complète'}</h3>
              <p style={{color:'#64748b', marginBottom:'1rem', fontSize:'.9rem'}}>{tw.formulaire?.sousTitre || 'Remplissez ce formulaire : il est envoyé à notre équipe, à notre Google Form et à notre Gmail.'}</p>
              <FormulaireTravaillerAvecNous />
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
                <Link href="/#specialites">Expertises</Link>
                <Link href="/travailler-avec-nous">Travailler avec nous</Link>
                <Link href="/a-propos">À propos</Link>
                <Link href="/opportunites">Opportunités</Link>
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
