import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { PHP } from '@php-wasm/universal';
import { loadNodeRuntime } from '@php-wasm/node';

// Un vrai moteur PHP, mais un système de fichiers en mémoire : ni données
// locales, ni base distante, ni secrets de l'hébergement ne sont utilisés.
const root = path.resolve(import.meta.dirname, '..');
const php = new PHP(await loadNodeRuntime('8.3', {
  emscriptenOptions: { processId: process.pid }
}));
function copy(relative) {
  const source = path.join(root, relative);
  const dest = `/site/${relative}`;
  if (fs.statSync(source).isDirectory()) {
    php.mkdir(dest);
    for (const entry of fs.readdirSync(source)) copy(path.join(relative, entry));
  } else if (/\.(php|json)$/.test(relative)) {
    php.writeFile(dest, fs.readFileSync(source));
  }
}
const pages = ['index.php', 'a-propos.php', 'travailler-avec-nous.php',
  'opportunites.php', 'connexion.php', 'inscription.php', 'verifier-email.php', 'mon-espace.php'];
const defaults = JSON.parse(fs.readFileSync(path.join(root, 'app/defaults.json')));
try {
  php.mkdir('/site');
  copy('app');
  copy('lib');
  for (const page of pages) copy(page);
  php.mkdir('/site/config');
  // Même si le poste de test possède des variables MySQL, ne jamais les utiliser.
  php.writeFile('/site/config/database.php', '<?php return ["enabled" => false];');
  php.mkdir('/site/data');
  php.writeFile('/site/data/utilisateurs.json', JSON.stringify([
    { id: 'test', nom: 'Membre test', email: 'test@example.invalid' }
  ]));

  async function render(page, base = '') {
    const prefix = page === 'mon-espace.php'
      ? `require '/site/app/bootstrap.php'; $_COOKIE['lm_user'] = (new UtilisateurAuth(lk_store()))->creerSession(['id'=>'test', 'email'=>'test@example.invalid']);`
      : '';
    const result = await php.run({
      code: `<?php ${prefix} require '/site/${page}';`,
      $_SERVER: { SCRIPT_NAME: `${base}/${page}`, REQUEST_URI: `${base}/${page}` }
    });
    assert.equal(result.exitCode, 0, `${page}: ${result.errors}`);
    assert.equal(result.errors, '', `${page}: erreur PHP`);
    assert.equal((result.text.match(/<footer\b/g) || []).length, 1, `${page}: un footer unique`);
    assert.ok(result.text.includes('</body>'), `${page}: document complet`);
    assert.ok(result.text.includes(`href="${base}/#logiciels"`), `${page}: lien logiciels`);
    assert.ok(result.text.includes('contact@linksmartec.com'), `${page}: coordonnées sans JS`);
    return result.text;
  }

  for (const base of ['', '/sous-dossier']) {
    for (const page of pages) await render(page, base);
  }
  let html = await render('index.php');
  for (const name of ['SAFISAHA', 'LITO FINANCE', 'Youpendimmoselect']) {
    assert.match(html, new RegExp(`<h3[^>]*>${name}</h3>`), `${name}: carte exposée sans JavaScript`);
  }
  assert.ok(html.includes('Sur devis'));

  // Une configuration explicite de l'admin reste prioritaire sur les modèles.
  const content = structuredClone(defaults.contenu);
  content.logiciels.items[0].nom = '<Logiciel personnalisé>';
  content.logiciels.items[1].actif = false;
  php.writeFile('/site/data/content.json', JSON.stringify(content));
  html = await render('index.php');
  assert.match(html, /<h3[^>]*>&lt;Logiciel personnalisé&gt;<\/h3>/);
  assert.doesNotMatch(html, /<h3[^>]*>LITO FINANCE<\/h3>/);

  content.logiciels.items = [];
  php.writeFile('/site/data/content.json', JSON.stringify(content));
  html = await render('index.php');
  assert.ok(html.includes('Notre catalogue évolue.'));
  assert.doesNotMatch(html, /<h3[^>]*>SAFISAHA<\/h3>/);

  const oldContent = structuredClone(defaults.contenu);
  oldContent.logiciels = JSON.parse(fs.readFileSync(path.join(root, 'lib/logiciels-anciens-exemples.json')));
  php.writeFile('/site/data/content.json', JSON.stringify(oldContent));
  html = await render('index.php');
  assert.match(html, /<h3[^>]*>SAFISAHA<\/h3>/, 'les anciens exemples intacts sont actualisés');
  assert.doesNotMatch(html, /<h3[^>]*>GomaGest<\/h3>/);
  oldContent.logiciels.items[0].nom = 'Catalogue personnalisé';
  php.writeFile('/site/data/content.json', JSON.stringify(oldContent));
  html = await render('index.php');
  assert.match(html, /<h3[^>]*>Catalogue personnalisé<\/h3>/);

  const fallback = JSON.parse(fs.readFileSync(path.join(root, 'assets/data/site.json')));
  assert.deepEqual(fallback.contenu.logiciels, defaults.contenu.logiciels);
  console.log('OK : 8 pages PHP complètes, footer unique, racine/sous-dossier, échantillons SSR, édition/masquage/suppression et secours synchronisé.');
} finally {
  php.exit();
}
