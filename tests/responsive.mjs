import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { PHP } from '@php-wasm/universal';
import { loadNodeRuntime } from '@php-wasm/node';
import { chromium } from 'playwright';

// Rendu PHP réel en mémoire ; API de l'admin simulée uniquement dans le navigateur
// de test. Aucune donnée ni authentification de production n'est modifiée.
const root = path.resolve(import.meta.dirname, '..');
const seed = JSON.parse(fs.readFileSync(path.join(root, 'app/defaults.json')));
const php = new PHP(await loadNodeRuntime('8.3', {emscriptenOptions: {processId: process.pid}}));
const pages = ['index.php', 'a-propos.php', 'travailler-avec-nous.php', 'opportunites.php',
  'connexion.php', 'inscription.php', 'verifier-email.php', 'mon-espace.php', 'admin/index.php'];
const fixtures = new Map();
const messages = [{id:'message-test',nom:'Client'.repeat(25),email:'contact'.repeat(16)+'@example.invalid',sujet:'Projet'.repeat(30),message:'Détails du projet '.repeat(40),recuLe:new Date().toISOString()}];
let browser;
try {
  function copy(rel) {
    const from = path.join(root, rel), to = `/site/${rel}`;
    if (fs.statSync(from).isDirectory()) {
      php.mkdir(to);
      for (const entry of fs.readdirSync(from)) copy(path.join(rel, entry));
    } else if (/\.(php|json)$/.test(rel)) php.writeFile(to, fs.readFileSync(from));
  }
  php.mkdir('/site'); copy('app'); copy('lib'); copy('admin');
  php.mkdir('/site/config');
  php.writeFile('/site/config/database.php', '<?php return ["enabled"=>false];');
  php.mkdir('/site/data');
  php.writeFile('/site/data/utilisateurs.json', JSON.stringify([{id:'test',nom:'Membre test',email:'test@example.invalid'}]));
  for (const file of pages) {
    if (!file.startsWith('admin/')) copy(file);
    const auth = file === 'mon-espace.php'
      ? "require '/site/app/bootstrap.php'; $_COOKIE['lm_user']=(new UtilisateurAuth(lk_store()))->creerSession(['id'=>'test','email'=>'test@example.invalid']);"
      : '';
    const result = await php.run({code:`<?php ${auth} require '/site/${file}';`, $_SERVER:{SCRIPT_NAME:`/${file}`,REQUEST_URI:`/${file}`}});
    assert.equal(result.exitCode, 0, result.errors);
    fixtures.set(`/${file}`, result.text);
  }
  browser = await chromium.launch({headless:true,
    ...(process.env.CHROMIUM_PATH ? {executablePath: process.env.CHROMIUM_PATH} : {}),
    args:['--no-sandbox','--disable-dev-shm-usage']});
  const context = await browser.newContext({locale:'fr-FR', reducedMotion:'reduce'});
  let connected = false;
  await context.route('**/api/**', async route => {
    const url = new URL(route.request().url());
    let body = {};
    if (url.pathname.endsWith('/session')) body = {connecte:connected};
    else if (url.pathname.endsWith('/state')) body = {...seed, stats:{},messages,utilisateur:{identifiant:'test'}};
    else if (url.pathname.endsWith('/messages')) body = {messages};
    else if (url.pathname.endsWith('/produits')) body = {produits:seed.contenu.produits};
    else if (url.pathname.endsWith('/site')) body = seed;
    await route.fulfill({json:body});
  });
  await context.route('http://php.test/**', async route => {
    const url = new URL(route.request().url());
    if (url.pathname.startsWith('/api/')) return route.fallback();
    if (fixtures.has(url.pathname)) return route.fulfill({contentType:'text/html',body:fixtures.get(url.pathname)});
    const file = path.join(root, decodeURIComponent(url.pathname));
    if (!url.pathname.startsWith('/assets/') || !fs.existsSync(file)) return route.fulfill({status:404,body:''});
    const mime = {'.css':'text/css','.js':'application/javascript','.svg':'image/svg+xml','.json':'application/json','.jpg':'image/jpeg','.png':'image/png'};
    await route.fulfill({contentType:mime[path.extname(file)] || 'application/octet-stream',body:fs.readFileSync(file)});
  });
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  page.setDefaultNavigationTimeout(20000);
  async function fits(label) {
    // Attendre la mise en page, les polices/images et le remplacement des contenus.
    if (process.env.DEBUG_RESPONSIVE) console.log(label);
    await page.evaluate(async () => {
      await document.fonts.ready;
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    });
    const sizes = await page.evaluate(() => ({
      width:innerWidth, scroll:document.documentElement.scrollWidth,
      offenders:[...document.querySelectorAll('body *')].filter(e=>{
        const r=e.getBoundingClientRect();
        return r.width && r.right > innerWidth+1 && !e.closest('.tableau-defilant,.admin-menu,.admin-onglets,.ruban__liste,.panier');
      }).slice(0,8).map(e=>({tag:e.tagName, cls:e.className,width:e.getBoundingClientRect().width}))
    }));
    assert.ok(sizes.scroll <= sizes.width+1, `${label}: ${JSON.stringify(sizes)}`);
  }
  for (const width of [320,375,768,1024,1440]) {
    await page.setViewportSize({width,height:900});
    connected = false;
    for (const file of pages) {
      await page.goto(`http://php.test/${file}`);
      await fits(`PHP ${file} ${width}`);
      if (process.env.RESPONSIVE_SCREENSHOTS && file === 'index.php' && width === 375) {
        fs.mkdirSync(process.env.RESPONSIVE_SCREENSHOTS, {recursive:true});
        await page.screenshot({path:path.join(process.env.RESPONSIVE_SCREENSHOTS, 'php-mobile.png')});
      }
      if (file === 'admin/index.php') {
        assert.equal(await page.locator('#motDePasse').getAttribute('type'),'password');
        assert.equal(await page.locator('#motDePasse').inputValue(),'');
      }
      const burger=page.locator('#burger');
      if (await burger.isVisible()) {
        await burger.click();
        assert.equal(await burger.getAttribute('aria-expanded'),'true');
        await fits(`PHP menu ouvert ${file} ${width}`);
        await page.keyboard.press('Escape');
        assert.equal(await burger.getAttribute('aria-expanded'),'false');
      }
    }
    connected = true;
    await page.goto('http://php.test/admin/index.php');
    await page.locator('#vue-admin').waitFor({state:'visible'});
    for (const tab of ['tableau','produits','logiciels','identite','messages','securite']) {
      await page.locator(`[data-vue="${tab}"]`).click();
      await fits(`PHP admin ${tab} ${width}`);
    }
    if (process.env.NEXT_TEST_URL) {
      const base=process.env.NEXT_TEST_URL;
      connected=false;
      for (const route of ['/','/travailler-avec-nous','/admin']) {
        await page.goto(base+route);
        await fits(`Next ${route} ${width}`);
        if (route === '/admin') {
          assert.equal(await page.locator('#code').getAttribute('type'), 'password');
          assert.equal(await page.locator('#code').inputValue(), '');
        }
        const burger=page.locator('.burger');
        if (await burger.isVisible()) {
          await burger.click();
          assert.equal(await burger.getAttribute('aria-expanded'),'true');
          await fits(`Next menu ${route} ${width}`);
          await page.keyboard.press('Escape');
          assert.equal(await burger.getAttribute('aria-expanded'),'false');
        }
      }
      connected=true;
      await page.goto(base+'/admin');
      await page.locator('.admin-onglets').waitFor();
      for (const label of ['Messages','Produits','Logiciels','Contenu du site','Réglages & sécurité']) {
        await page.locator('.admin-onglets button').filter({hasText:label}).click();
        await fits(`Next admin ${label} ${width}`);
      }
    }
    console.log(`OK : largeur ${width}px (pages publiques, menus, connexion et administration).`);
  }
  await context.close();
} finally {
  if (browser) await browser.close();
  php.exit();
}
