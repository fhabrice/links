'use strict';

/**
 * Génère public/data/site.json : une copie statique du contenu par défaut.
 * Utile si le site est déposé sur un hébergement sans Node (GitHub Pages,
 * cPanel statique…) : le front-end se rabat automatiquement sur ce fichier.
 */

const fs = require('fs');
const path = require('path');
const { CONTENU_DEFAUT, REGLAGES_DEFAUT } = require('../src/defaults');

const RACINE = path.join(__dirname, '..');
const DOSSIER = path.join(RACINE, 'public', 'data');
const CIBLE = path.join(DOSSIER, 'site.json');

function construire() {
  const charge = {
    contenu: CONTENU_DEFAUT,
    reglages: {
      devise: REGLAGES_DEFAUT.devise,
      portailClientActif: REGLAGES_DEFAUT.portailClientActif,
      maintenance: false
    },
    genereLe: new Date().toISOString(),
    note: 'Fichier de secours statique généré par tools/build-fallback.js.'
  };

  fs.mkdirSync(DOSSIER, { recursive: true });
  fs.writeFileSync(CIBLE, JSON.stringify(charge, null, 2), 'utf8');
  console.log(`   Contenu statique écrit dans ${path.relative(RACINE, CIBLE)}`);
}

construire();
