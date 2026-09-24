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
// Deux emplacements : la version Node.js (public/) et la version PHP (php/assets/).
// Dans la version PHP, le dossier data/ est protégé, le fichier de secours vit
// donc avec les ressources publiques.
const CIBLES = [
  path.join(RACINE, 'public', 'data', 'site.json'),
  path.join(RACINE, 'php', 'assets', 'data', 'site.json')
];

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

  for (const cible of CIBLES) {
    fs.mkdirSync(path.dirname(cible), { recursive: true });
    fs.writeFileSync(cible, JSON.stringify(charge, null, 2), 'utf8');
    console.log(`   Contenu statique écrit dans ${path.relative(RACINE, cible)}`);
  }
}

construire();
