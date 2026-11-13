#!/usr/bin/env node
'use strict';

/**
 * Démarrage intelligent pour hébergement partagé (cPanel / Phusion Passenger).
 *
 *  1. Construit le site Next.js au premier lancement (.next absent)
 *  2. Puis lance `next start` sur le port imposé par l'hébergeur
 *     (variable d'environnement PORT) ou sur celui donné par -p.
 *
 * Usage :
 *   node start.js              # port PORT ou 3000
 *   node start.js -p 3000      # port explicite
 *   FORCE_BUILD=1 node start.js  # force un rebuild
 */

const fs = require('fs');
const path = require('path');
const { spawn, spawnSync } = require('child_process');

const RACINE = __dirname;
const nextBin = require.resolve('next/dist/bin/next');

function portDemarrage() {
  const args = process.argv.slice(2);
  const i = args.findIndex((a) => a === '-p' || a === '--port');
  if (i !== -1 && args[i + 1]) return Number(args[i + 1]);
  return Number(process.env.PORT) || 3000;
}

function buildSiBesoin() {
  const marqueur = path.join(RACINE, '.next', 'BUILD_ID');
  if (fs.existsSync(marqueur) && !process.env.FORCE_BUILD) {
    console.log('[LK-TECH] Build existant détecté — pas de reconstruction.');
    return;
  }
  console.log('[LK-TECH] Construction du site Next.js (premier démarrage)…');
  const resultat = spawnSync(process.execPath, [nextBin, 'build'], {
    cwd: RACINE,
    stdio: 'inherit',
    env: process.env
  });
  if (resultat.status !== 0) {
    console.error('[LK-TECH] Échec du build. Vérifiez la mémoire disponible et les logs.');
    process.exit(resultat.status || 1);
  }
  console.log('[LK-TECH] Build terminé ✓');
}

buildSiBesoin();

const port = portDemarrage();
console.log(`[LK-TECH] Démarrage de Next.js sur le port ${port}…`);

const enfant = spawn(process.execPath, [nextBin, 'start', '-p', String(port)], {
  cwd: RACINE,
  stdio: 'inherit',
  env: process.env
});

enfant.on('exit', (code) => process.exit(code ?? 0));
process.on('SIGTERM', () => enfant.kill('SIGTERM'));
process.on('SIGINT', () => enfant.kill('SIGINT'));
