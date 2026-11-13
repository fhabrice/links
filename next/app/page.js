import Link from 'next/link';
import { lireContenu, lireReglages, listerProduits, modePilote } from '../lib/store';
import FormulaireContact from './components/FormulaireContact';

export const dynamic = 'force-dynamic';

const ICONES = { code: '</>', btp: '⌂', energie: '⚡' };

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
  const [contenu, reglages, produits, pilote] = await Promise.all([
    lireContenu(),
    lireReglages(),
    listerProduits(),
    Promise.resolve(modePilote())
  ]);

  const identite = contenu.identite || {};
  const hero = (contenu.hero?.onglets || []).find(
    (t) => t.id === contenu.hero?.actif
  ) || contenu.hero?.onglets?.[0];
  const specialites = contenu.specialites || [];
  const aPropos = contenu.apropos || {};
  const vedette = produits.slice(0, 6);

  return (
    <>
      <header className="entete">
        <div className="conteneur">
          <div className="logo">
            LK<span>-TECH</span>
          </div>
          <nav className="nav">
            <a href="#specialites">Spécialités</a>
            <a href="#produits">Boutique</a>
            <a href="#apropos">À propos</a>
            <a href="#contact">Contact</a>
            <Link href="/admin">Administration</Link>
          </nav>
        </div>
      </header>

      <section className="hero">
        <div className="conteneur">
          {hero?.badge && <span className="badge">{hero.badge}</span>}
          <h1>
            {hero?.titre} <em>{hero?.titreAccent}</em>
          </h1>
          <p>{hero?.description}</p>
          <div className="boutons">
            <a className="bouton bouton-vert" href="#produits">
              {hero?.boutonTexte || 'Découvrir nos offres'}
            </a>
            <a className="bouton bouton-fantome" href="#contact">
              Nous contacter
            </a>
          </div>
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

      <section className="section" id="produits" style={{ background: '#eef2f7' }}>
        <div className="conteneur">
          <h2>Boutique</h2>
          <p className="sous-titre">
            Une sélection de matériel et de kits, disponibles à {identite.ville}.
          </p>
          <div className="grille">
            {vedette.map((p) => (
              <div className="carte" key={p.id}>
                {p.badge && <span className="produit-badge">{p.badge}</span>}
                <h3>{p.nom}</h3>
                <p>{p.description}</p>
                <div className="produit-meta">
                  <span className="produit-prix">{formaterPrix(p)}</span>
                  <span className="produit-stock">{p.stock} en stock</span>
                </div>
              </div>
            ))}
            {!vedette.length && <p className="vide">Aucun produit disponible pour le moment.</p>}
          </div>
        </div>
      </section>

      <section className="section" id="apropos">
        <div className="conteneur">
          <h2>{aPropos.titre || 'À propos de nous'}</h2>
          <p className="sous-titre">{aPropos.texte || ''}</p>
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
          <span>
            © {new Date().getFullYear()} {identite.nomLong || 'LK-TECH'} — RCCM{' '}
            {identite.rccm || '—'}
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
