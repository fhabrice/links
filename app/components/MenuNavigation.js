'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

/**
 * Menu de navigation principal (bureau + mobile burger).
 * Adapte automatiquement les ancres selon la page courante et met en évidence
 * la rubrique active (« Travailler avec nous »).
 */
export default function MenuNavigation() {
  const pathname = usePathname() || '/';
  const [ouvert, setOuvert] = useState(false);
  const navRef = useRef(null);
  const burgerRef = useRef(null);

  const surPageRecrutement = pathname.startsWith('/travailler-avec-nous');
  const prefixe = surPageRecrutement ? '/' : '';

  const liens = [
    ...(surPageRecrutement ? [{ href: '/', label: 'Accueil', actif: false }] : []),
    { href: `${prefixe}#specialites`, label: 'Spécialités', actif: false },
    { href: `${prefixe}#logiciels`, label: 'Logiciels', actif: false },
    { href: `${prefixe}#apropos`, label: 'À propos', actif: false },
    {
      href: surPageRecrutement ? '#candidature' : '/travailler-avec-nous',
      label: 'Travailler avec nous',
      actif: surPageRecrutement,
      miseEnAvant: !surPageRecrutement
    },
    { href: `${prefixe}#contact`, label: 'Contact', actif: false }
  ];

  useEffect(() => {
    setOuvert(false);
  }, [pathname]);

  useEffect(() => {
    function surTouche(e) {
      if (e.key === 'Escape') setOuvert(false);
    }
    function surClicExterieur(e) {
      if (
        ouvert &&
        navRef.current &&
        !navRef.current.contains(e.target) &&
        burgerRef.current &&
        !burgerRef.current.contains(e.target)
      ) {
        setOuvert(false);
      }
    }
    document.addEventListener('keydown', surTouche);
    document.addEventListener('click', surClicExterieur);
    return () => {
      document.removeEventListener('keydown', surTouche);
      document.removeEventListener('click', surClicExterieur);
    };
  }, [ouvert]);

  return (
    <>
      <button
        ref={burgerRef}
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
        ref={navRef}
        id="nav-principale"
        className={`nav${ouvert ? ' ouvert' : ''}`}
        aria-label="Navigation principale"
      >
        {liens.map((item) => {
          const classes = [
            'nav__lien',
            item.actif ? 'nav__lien--actif' : '',
            item.miseEnAvant ? 'nav__lien--recrutement' : ''
          ]
            .filter(Boolean)
            .join(' ');

          if (item.href.startsWith('#')) {
            return (
              <a
                key={item.href + item.label}
                href={item.href}
                className={classes}
                aria-current={item.actif ? 'page' : undefined}
                onClick={() => setOuvert(false)}
              >
                {item.label}
              </a>
            );
          }

          return (
            <Link
              key={item.href + item.label}
              href={item.href}
              className={classes}
              aria-current={item.actif ? 'page' : undefined}
              onClick={() => setOuvert(false)}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
