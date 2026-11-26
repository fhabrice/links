const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
// Isoler le test des clés cloud et du contenu réel.
process.env.NEXT_PUBLIC_SUPABASE_URL = '';
process.env.SUPABASE_SERVICE_ROLE_KEY = '';
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lk-logiciels-'));
process.env.LK_DATA_DIR = dir;
const { lireContenu } = require('../lib/store');
const defaults = require('../lib/defaults-fallback.json').contenu;
const legacy = require('../lib/logiciels-anciens-exemples.json');
const save = (logiciels) => fs.writeFileSync(path.join(dir, 'contenu.json'), JSON.stringify({ logiciels }));
(async () => {
  try {
    assert.deepEqual((await lireContenu()).logiciels, defaults.logiciels);
    save(legacy);
    assert.deepEqual((await lireContenu()).logiciels, defaults.logiciels, 'anciens exemples remplacés');
    const custom = structuredClone(legacy);
    custom.items[0].nom = 'Mon logiciel';
    save(custom);
    assert.deepEqual((await lireContenu()).logiciels, custom, 'personnalisation conservée');
    const empty = { ...defaults.logiciels, items: [] };
    save(empty);
    assert.deepEqual((await lireContenu()).logiciels, empty, 'suppression volontaire conservée');
    const hidden = structuredClone(defaults.logiciels);
    hidden.items.forEach(item => { item.actif = false; });
    save(hidden);
    assert.deepEqual((await lireContenu()).logiciels, hidden, 'masquage volontaire conservé');
    console.log('OK : catalogue Node par défaut / ancien / personnalisé / vide / masqué.');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
