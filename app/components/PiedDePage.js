import Link from 'next/link';

/** Pied de page commun des pages publiques. */
export default function PiedDePage({ contenu, maintenance = false }) {
  const identite = contenu.identite || {};
  const pied = contenu.pied || {};
  const specialites = contenu.specialites || [];
  return (
      <footer className="pied" aria-label="Pied de page LK-TECH">
        <div className="conteneur">
          <div className="pied__invitation">
            <div><h2>Un logiciel ou un projet en tête ?</h2><p>Échangeons sur la solution adaptée à vos besoins.</p></div>
            <a className="bouton bouton-vert" href="/#contact">Contacter LK-TECH ↗</a>
          </div>
          <div className="pied__grille">
            <div>
              <img className="pied__logo" src={identite.logoClair || '/assets/img/logo-clair.svg'} alt="Logo LK-TECH" width="46" height="46" />
              <div className="pied__nom">{identite.nom || 'LK-TECH'}</div>
              <p className="pied__texte">{pied.description || 'LK-TECH réunit génie civil, architecture & design, technologie et énergie pour transformer vos idées en solutions concrètes. Basés à Goma, nous avançons avec vous, de la conception à la réalisation.'}</p>
            </div>
            <div>
              <h4 className="pied__titre">Navigation</h4>
              <div className="pied__liens">
                <Link href="/">Accueil</Link>
                <Link href="/#specialites">Spécialités</Link>
                <Link href="/#logiciels">Nos logiciels</Link>
                <Link href="/#collaborations">Investir &amp; collaborer</Link>
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
            <span>Goma, République démocratique du Congo {maintenance ? '· Mode maintenance' : ''}</span>
          </div>
        </div>
      </footer>
  );
}
