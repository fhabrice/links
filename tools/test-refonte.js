'use strict';

// Tests sans dépendance : node --test tools/test-refonte.js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { traiter } = require('../node/src/api');
const { CONTENU_DEFAUT } = require('../node/src/defaults');
const root = path.join(__dirname, '..');
const lire = (f) => fs.readFileSync(path.join(root, f), 'utf8');

test('Les ressources publiques PHP et Node sont identiques', () => {
  for (const f of ['css/refonte.css', 'js/site.js', 'img/portrait-expertise.jpg']) {
    assert.deepEqual(fs.readFileSync(path.join(root, 'assets', f)), fs.readFileSync(path.join(root, 'node/public/assets', f)), f);
  }
});

test('Les contenus initiaux et les fichiers de secours sont synchronisés', () => {
  assert.deepEqual(JSON.parse(lire('app/defaults.json')).contenu, CONTENU_DEFAUT);
  for (const f of ['assets/data/site.json', 'node/public/data/site.json']) {
    assert.deepEqual(JSON.parse(lire(f)).contenu, CONTENU_DEFAUT, f);
  }
});

test('Les deux accueils conservent les points de branchement et les ancres', () => {
  for (const f of ['index.php', 'node/public/index.html']) {
    const html = lire(f);
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
    assert.equal(new Set(ids).size, ids.length, `${f}: identifiants uniques`);
    for (const id of ['hero-titre', 'onglets-hero', 'expertise-panel', 'grille-produits', 'vedette-img', 'formulaire-contact', 'panier']) {
      assert.ok(ids.includes(id), `${f}: ${id}`);
    }
    for (const match of html.matchAll(/href="#([^"]+)"/g)) {
      assert.ok(ids.includes(match[1]), `${f}: ancre ${match[1]}`);
    }
    assert.match(html, /assets\/css\/refonte.css/);
    assert.match(html, /id="panier"[^>]*inert/);
  }
});

test('Les ressources locales de la page statique existent', () => {
  const html = lire('node/public/index.html');
  for (const match of html.matchAll(/(?:src|href)="(\/assets\/[^\"]+)"/g)) {
    assert.ok(fs.existsSync(path.join(root, 'node/public', match[1])), match[1]);
  }
});

test('Le formulaire valide et enregistre une demande sans toucher aux données du site', async () => {
  const messages = [];
  const stockage = {
    ajouterMessage: async (message) => { messages.push(message); return { id: 'test-1' }; },
    journaliser: async () => {}
  };
  const requete = { methode: 'POST', chemin: '/api/contact', contexte: { stockage } };
  const invalide = await traiter({ ...requete, corps: { nom: '', email: 'invalide', message: '' } });
  assert.equal(invalide.code, 400);
  assert.equal(messages.length, 0);
  const valide = await traiter({ ...requete, corps: { nom: 'Test', email: 'test@example.com', telephone: '', sujet: 'Construction', message: 'Je souhaite une étude de mon projet.' } });
  assert.equal(valide.code, 201);
  assert.equal(valide.corps.ok, true);
  assert.equal(messages.length, 1);
  assert.equal(messages[0].sujet, 'Construction');
});

test('Le dictionnaire de traduction est complet et cohérent', () => {
  global.window = {};
  require('../assets/i18n/traductions.js');
  const lignes = global.window.LK_TRADUCTIONS;
  delete global.window;
  assert.ok(Array.isArray(lignes) && lignes.length > 200, 'dictionnaire chargé');
  const normaliser = (texte) => String(texte).replace(/\s+/g, ' ').trim();
  const cles = new Set();
  for (const ligne of lignes) {
    assert.equal(ligne.length, 4, `4 langues pour « ${ligne[0]} »`);
    ligne.forEach((valeur) => assert.ok(normaliser(valeur), `valeur vide pour « ${ligne[0]} »`));
    const cle = normaliser(ligne[0]);
    assert.ok(!cles.has(cle), `doublon : « ${cle} »`);
    cles.add(cle);
  }
  // Les deux fichiers publics embarquent le sélecteur et le dictionnaire.
  for (const f of ['index.php', 'node/public/index.html', 'a-propos.php', 'node/public/a-propos.html']) {
    const html = lire(f);
    assert.match(html, /id="choix-langue"/, `${f}: sélecteur de langue`);
    assert.match(html, /assets\/i18n\/traductions\.js/, `${f}: dictionnaire chargé avant site.js`);
    assert.ok(html.indexOf('assets/i18n/traductions.js') < html.indexOf('assets/js/site.js'), `${f}: ordre des scripts`);
  }
  assert.deepEqual(
    fs.readFileSync(path.join(root, 'assets/i18n/traductions.js')),
    fs.readFileSync(path.join(root, 'node/public/assets/i18n/traductions.js')),
    'copies PHP/Node identiques'
  );
});
