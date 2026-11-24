import Link from 'next/link';
import { lireContenu } from '../../lib/store';
import FormulaireTravaillerAvecNous from '../components/FormulaireTravaillerAvecNous';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Travailler avec nous | LK-TECH — Recrutement & collaboration',
  description: 'Rejoignez LK-TECH à Goma : génie civil, architecture & design, informatique, énergie. Envoyez votre candidature, transmise à notre Google Form et Gmail.'
};

export default async function TravaillerAvecNous() {
  const contenu = await lireContenu();
  const identite = contenu.identite || {};
  const tw = contenu.travaillerAvecNous || {};

  return (
    <>
      <header className="entete">
        <div className="conteneur entete__inner">
          <Link href="/" className="marque" aria-label="Accueil LK-TECH">
            <img className="marque__logo" src={identite.logo || '/assets/img/logo.svg'} alt="" width="39" height="46" />
            <span className="marque__texte"><span className="marque__nom">LK<i className="tiret">-</i>TECH</span><span className="marque__slogan">LINKS MARTECH</span></span>
          </Link>
          <nav className="nav">
            <Link className="nav__lien" href="/">Accueil</Link>
            <Link className="nav__lien" href="/a-propos">À propos</Link>
            <Link className="nav__lien" href="/opportunites">Opportunités</Link>
            <Link className="nav__lien" href="/travailler-avec-nous">Travailler avec nous</Link>
          </nav>
          <div className="entete__actions">
            <a className="btn btn--petit btn--fantome" href={`tel:${(identite.telephone||'+243976459970').replace(/\s/g,'')}`}>📞 Appeler</a>
            <Link className="btn btn--petit" href="/#contact">Contact</Link>
          </div>
        </div>
      </header>

      <section className="page-entete">
        <div className="conteneur">
          <nav className="fil-ariane"><Link href="/">Accueil</Link> <span>›</span> <span>Travailler avec nous</span></nav>
          <p className="section__sur">{tw.surTitre || 'REJOIGNEZ L’AVENTURE'}</p>
          <h1 className="page-entete__titre">{tw.titre || 'Travailler avec nous'}</h1>
          <p className="page-entete__texte">{tw.soustitre || tw.sousTitre || 'Envie de construire, coder ou électrifier l’avenir avec nous ?'}</p>
        </div>
      </section>

      <section className="section">
        <div className="conteneur">
          <p style={{maxWidth:'48rem', color:'#475569', lineHeight:1.7}}>{tw.texte}</p>
          {(tw.avantages||[]).length>0 && (
            <div className="grille" style={{marginTop:'2rem'}}>
              {tw.avantages.map(a=>(
                <div key={a.titre} className="carte" style={{textAlign:'left'}}>
                  <div style={{fontSize:'1.5rem'}}>{a.icone}</div>
                  <h3>{a.titre}</h3>
                  <p>{a.texte}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section section--gris" id="candidature">
        <div className="conteneur">
          <div className="section__entete">
            <p className="section__sur">CANDIDATURE</p>
            <h2 className="section__titre">{tw.formulaire?.titre || 'Candidature complète'}</h2>
            <p className="section__texte">{tw.formulaire?.sousTitre || 'Remplissez ce formulaire : il est envoyé à notre équipe, à notre Google Form et à notre Gmail.'}</p>
          </div>
          <div className="grille-contact">
            <div className="contact-infos">
              <div className="info-bloc"><div className="info-bloc__icone">📞</div><div><div className="info-bloc__titre">Appeler</div><a className="info-bloc__valeur" href={`tel:${(identite.telephone||'+243976459970').replace(/\s/g,'')}`}>{identite.telephone||'+243 976 459 970'}</a><p style={{fontSize:'.82rem',color:'#64748b',marginTop:'.4rem'}}>Lun–Sam 08h–18h</p></div></div>
              <div className="info-bloc"><div className="info-bloc__icone">✉️</div><div><div className="info-bloc__titre">E-mail RH</div><a className="info-bloc__valeur" href={`mailto:${identite.email||'contact@linksmartec.com'}`}>{identite.email||'contact@linksmartec.com'}</a></div></div>
              <div className="info-bloc"><div className="info-bloc__icone">📍</div><div><div className="info-bloc__titre">Adresse</div><div className="info-bloc__valeur">{identite.ville||'Goma, Nord-Kivu, RDC'}</div></div></div>
              <div className="info-bloc"><div className="info-bloc__icone">🔗</div><div><div className="info-bloc__titre">Google Form</div><p style={{fontSize:'.85rem',color:'#475569'}}>{tw.googleForm?.actionUrl ? 'Connecté → réponses dans Google Sheets + Gmail' : 'À configurer dans l’admin (voir documentation). En attendant, les candidatures sont enregistrées localement et visibles dans l’admin.'}</p></div></div>
            </div>
            <FormulaireTravaillerAvecNous />
          </div>
        </div>
      </section>

      <footer className="pied">
        <div className="conteneur">
          <div className="pied__grille">
            <div>
              <img className="pied__logo" src={identite.logoClair || '/assets/img/logo-clair.svg'} alt="" width="46" height="46" />
              <div className="pied__nom">LK<i className="tiret">-</i>TECH</div>
              <p className="pied__texte">{contenu.pied?.description}</p>
            </div>
            <div>
              <h4 className="pied__titre">Navigation</h4>
              <div className="pied__liens">
                <Link href="/">Accueil</Link>
                <Link href="/#specialites">Expertises</Link>
                <Link href="/opportunites">Opportunités</Link>
                <Link href="/travailler-avec-nous">Travailler avec nous</Link>
                <Link href="/a-propos">À propos</Link>
                <Link href="/#contact">Contact</Link>
              </div>
            </div>
            <div>
              <h4 className="pied__titre">Nos spécialités</h4>
              <div className="pied__liens">
                {(contenu.specialites||[]).map(s=><span key={s.id}>{s.titre}</span>)}
              </div>
            </div>
            <div>
              <h4 className="pied__titre">Coordonnées</h4>
              <div className="pied__liens">
                <span>{identite.ville}</span>
                <a href={`tel:${(identite.telephone||'').replace(/\s/g,'')}`}>{identite.telephone}</a>
                <a href={`mailto:${identite.email}`}>{identite.email}</a>
                <span>{identite.rccm && `RCCM : ${identite.rccm}`}</span>
              </div>
            </div>
          </div>
          <div className="pied__bas">
            <span>© {new Date().getFullYear()} LK-TECH — Tous droits réservés.</span>
            <span>Goma, République démocratique du Congo</span>
          </div>
        </div>
      </footer>
    </>
  );
}
