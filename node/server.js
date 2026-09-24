'use strict';

/**
 * Serveur HTTP Linksmartech.
 *  - Zéro dépendance obligatoire (Node 18+).
 *  - Sert le site public (public/) et l'espace d'administration (/admin).
 *  - API JSON auto-configurée : aucune installation, aucun MySQL à saisir.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const { creerStockage, DOSSIER_DATA } = require('./src/store');
const api = require('./src/api');
const securite = require('./src/security');

const RACINE = __dirname;
const PUBLIC = path.join(RACINE, 'public');
const PORT = Number(process.env.PORT || 3000);
const HOTE = process.env.HOST || '0.0.0.0';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.woff2': 'font/woff2',
  '.pdf': 'application/pdf'
};

function lireCorps(req, limite = 8 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    let taille = 0;
    const morceaux = [];
    req.on('data', (bloc) => {
      taille += bloc.length;
      if (taille > limite) {
        reject(new Error('Requête trop volumineuse'));
        req.destroy();
        return;
      }
      morceaux.push(bloc);
    });
    req.on('end', () => {
      if (!morceaux.length) return resolve({});
      const brut = Buffer.concat(morceaux).toString('utf8');
      try {
        resolve(JSON.parse(brut));
      } catch {
        resolve(Object.fromEntries(new URLSearchParams(brut)));
      }
    });
    req.on('error', reject);
  });
}

function envoyerJson(res, code, donnees, entetes = {}) {
  const corps = JSON.stringify(donnees);
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Content-Length': Buffer.byteLength(corps),
    ...entetes
  });
  res.end(corps);
}

function servirFichier(res, chemin, { cache = false } = {}) {
  fs.stat(chemin, (erreur, stats) => {
    if (erreur || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(erreur404());
      return;
    }
    const extension = path.extname(chemin).toLowerCase();
    res.writeHead(200, {
      'Content-Type': TYPES[extension] || 'application/octet-stream',
      'Content-Length': stats.size,
      'Cache-Control': cache ? 'public, max-age=86400' : 'no-cache'
    });
    fs.createReadStream(chemin).pipe(res);
  });
}

function erreur404() {
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Page introuvable | LK-TECH</title>
  <style>body{font-family:Inter,system-ui,sans-serif;background:#0f172a;color:#e2e8f0;display:grid;place-items:center;height:100vh;margin:0;text-align:center}
  a{color:#eab308;font-weight:700}h1{font-size:4rem;margin:0}</style></head>
  <body><div><h1>404</h1><p>Cette page n'existe pas ou a été déplacée.</p><p><a href="/">Retour à l'accueil</a></p></div></body></html>`;
}

/** Retire les clés sensibles avant d'exposer le contenu publiquement. */
function contenuPublic(contenu) {
  const copie = JSON.parse(JSON.stringify(contenu));
  if (copie.produits) copie.produits = copie.produits.filter((p) => p.actif !== false);
  return copie;
}

async function demarrer() {
  console.log("\n  LK-TECH (Linksmartech) — démarrage");
  const { stockage, pilote } = await creerStockage();
  securite.definirSecret(process.env.SESSION_SECRET || 'linksmartech-local-session');

  const contexte = { stockage, pilote, PUBLIC, DOSSIER_DATA };

  const serveur = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const chemin = decodeURIComponent(url.pathname);

    try {
      /* -------------------------- API -------------------------- */
      if (chemin.startsWith('/api/')) {
        const corps = req.method === 'GET' || req.method === 'DELETE' ? {} : await lireCorps(req);
        const resultat = await api.traiter({
          methode: req.method,
          chemin,
          parametres: url.searchParams,
          corps,
          entetes: req.headers,
          requete: req,
          contexte
        });

        if (resultat?.fichier) {
          return servirFichier(res, resultat.fichier);
        }

        const entetes = { ...(resultat?.entetes || {}) };
        if (resultat?.cookie) entetes['Set-Cookie'] = resultat.cookie;
        return envoyerJson(res, resultat?.code || 200, resultat?.corps ?? { ok: true }, entetes);
      }

      /* --------------------- Contenu public --------------------- */
      if (chemin === '/api' || chemin === '/') {
        return servirFichier(res, path.join(PUBLIC, 'index.html'));
      }

      /* ------------------------ Uploads ------------------------ */
      if (chemin.startsWith('/uploads/')) {
        const cible = path.join(DOSSIER_DATA, 'uploads', path.basename(chemin));
        return servirFichier(res, cible, { cache: true });
      }

      /* ------------------ Pages statiques nommées ---------------- */
      if (chemin === '/a-propos' || chemin === '/a-propos/') {
        return servirFichier(res, path.join(PUBLIC, 'a-propos.html'));
      }

      /* --------------------- Espace admin ---------------------- */
      if (chemin === '/admin' || chemin === '/admin/' || chemin === '/admin/index.html') {
        return servirFichier(res, path.join(PUBLIC, 'admin', 'index.html'));
      }

      /* ------------------------ Statique ----------------------- */
      const cible = path.join(PUBLIC, chemin);
      if (cible.startsWith(PUBLIC)) {
        return servirFichier(res, cible, { cache: /\.(png|jpe?g|webp|svg|woff2)$/i.test(chemin) });
      }

      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(erreur404());
    } catch (erreur) {
      console.error('Erreur serveur :', erreur);
      envoyerJson(res, 500, { erreur: 'Erreur interne du serveur', detail: erreur.message });
    }
  });

  serveur.listen(PORT, HOTE, () => {
    console.log(`   Site public      : http://localhost:${PORT}`);
    console.log(`   Administration   : http://localhost:${PORT}/admin`);

    if (process.env.ADMIN_PASSWORD) {
      console.log('   Compte admin     : admin — mot de passe défini par ADMIN_PASSWORD');
    } else {
      console.log('   Compte admin     : admin / linksmartech');
      console.log('   ⚠️  Mot de passe par défaut : à changer dès la mise en ligne');
      console.log('      (admin → Sécurité, ou variable ADMIN_PASSWORD)');
    }
    console.log(`   Données          : ${process.env.NODE_ENV === 'production' ? 'dossier data/ — prévoir un disque persistant' : 'dossier data/'}\n`);
  });

  return { serveur, stockage, pilote };
}

if (require.main === module) {
  demarrer().catch((erreur) => {
    console.error('Impossible de démarrer :', erreur);
    process.exit(1);
  });
}

module.exports = { demarrer, contenuPublic };
