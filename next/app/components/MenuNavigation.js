'use client';

import { useState } from 'react';

const LIENS = [
  ['#specialites', 'Spécialités'],
  ['#produits', 'Boutique'],
  ['#apropos', 'À propos'],
  ['#contact', 'Contact']
];

/**
 * Menu de navigation de l'en-tête.
 * Sur mobile (≤ 640px) les liens sont repliés derrière un bouton burger ;
 * sur grand écran le menu s'affiche en ligne et le burger reste masqué.
 */
export default function MenuNavigation() {
  const [ouvert, setOuvert] = useState(false);

  return (
    <>
      <button
        className="burger"
        type="button"
        aria-label={ouvert ? 'Fermer le menu' : 'Ouvrir le menu'}
        aria-expanded={ouvert}
        aria-controls="nav-principale"
        onClick={() => setOuvert((v) => !v)}
      >
        {ouvert ? '✕' : '☰'}
      </button>
      <nav
        id="nav-principale"
        className={`nav${ouvert ? ' ouvert' : ''}`}
        aria-label="Navigation principale"
      >
        {LIENS.map(([href, texte]) => (
          <a key={href} href={href} onClick={() => setOuvert(false)}>
            {texte}
          </a>
        ))}
      </nav>
    </>
  );
}
