'use strict';

/**
 * Couche de stockage auto-configurée.
 *
 * Principe : l'application ne demande JAMAIS de coordonnées MySQL.
 *  1. Elle regarde si un accès MySQL est déjà fourni par l'environnement
 *     (variables MYSQL_* ou fichier config/database.json préparé par l'hébergeur).
 *  2. Si oui, elle se connecte, crée les tables manquantes et remplit les
 *     données par défaut toute seule.
 *  3. Sinon — ou si la connexion échoue — elle bascule silencieusement sur un
 *     stockage JSON local (data/*.json), créé automatiquement.
 *
 * Résultat : le site et l'admin fonctionnent dès le premier lancement,
 * sans écran d'installation et sans saisie de mot de passe de base de données.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const { CONTENU_DEFAUT, REGLAGES_DEFAUT } = require('./defaults');

const RACINE = path.join(__dirname, '..');
const DOSSIER_DATA = path.join(RACINE, 'data');
const FICHIER_CONFIG = path.join(RACINE, 'config', 'database.json');

/* ------------------------------------------------------------------ */
/* Utilitaires                                                         */
/* ------------------------------------------------------------------ */

function lireJson(chemin, defaut = null) {
  try {
    return JSON.parse(fs.readFileSync(chemin, 'utf8'));
  } catch {
    return defaut;
  }
}

function ecrireJson(chemin, valeur) {
  fs.mkdirSync(path.dirname(chemin), { recursive: true });
  const tmp = `${chemin}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(valeur, null, 2), 'utf8');
  fs.renameSync(tmp, chemin);
}

function id(prefixe = 'id') {
  return `${prefixe}-${crypto.randomBytes(6).toString('hex')}`;
}

/** Fusionne les valeurs par défaut avec un contenu enregistré (migration douce). */
function fusionner(defaut, valeur) {
  if (Array.isArray(defaut)) return Array.isArray(valeur) ? valeur : defaut;
  if (defaut && typeof defaut === 'object') {
    if (!valeur || typeof valeur !== 'object') return defaut;
    const sortie = {};
    for (const cle of new Set([...Object.keys(defaut), ...Object.keys(valeur)])) {
      sortie[cle] = fusionner(defaut[cle], valeur[cle]);
    }
    return sortie;
  }
  return valeur === undefined || valeur === null ? defaut : valeur;
}

/**
 * Détecte une configuration MySQL déjà présente dans l'environnement.
 * Aucune donnée n'est demandée à l'utilisateur : soit elle existe, soit on
 * utilise le stockage JSON.
 */
function detecterConfigMysql() {
  const fichier = lireJson(FICHIER_CONFIG, null) || {};
  const env = process.env;

  const candidat = {
    host: env.MYSQL_HOST || env.DB_HOST || fichier.host || null,
    port: Number(env.MYSQL_PORT || env.DB_PORT || fichier.port || 3306),
    user: env.MYSQL_USER || env.DB_USER || fichier.user || null,
    password: env.MYSQL_PASSWORD || env.DB_PASSWORD || fichier.password || '',
    database: env.MYSQL_DATABASE || env.DB_NAME || fichier.database || null
  };

  const complet = Boolean(candidat.host && candidat.user && candidat.database);
  return { actif: complet && fichier.enabled !== false, ...candidat, source: complet ? (env.MYSQL_HOST ? 'variables d\'environnement' : 'config/database.json') : null };
}

/* ------------------------------------------------------------------ */
/* Pilote JSON (par défaut, zéro configuration)                         */
/* ------------------------------------------------------------------ */

class StockageJson {
  constructor() {
    this.nom = 'JSON (data/)';
    this.fichierContenu = path.join(DOSSIER_DATA, 'content.json');
    this.fichierMessages = path.join(DOSSIER_DATA, 'messages.json');
    this.fichierSecurite = path.join(DOSSIER_DATA, 'security.json');
    this.fichierReglages = path.join(DOSSIER_DATA, 'settings.json');
  }

  async init() {
    fs.mkdirSync(path.join(DOSSIER_DATA, 'uploads'), { recursive: true });
    if (!fs.existsSync(this.fichierContenu)) ecrireJson(this.fichierContenu, CONTENU_DEFAUT);
    if (!fs.existsSync(this.fichierReglages)) ecrireJson(this.fichierReglages, REGLAGES_DEFAUT);
    if (!fs.existsSync(this.fichierMessages)) ecrireJson(this.fichierMessages, []);
    if (!fs.existsSync(this.fichierSecurite)) {
      ecrireJson(this.fichierSecurite, {
        utilisateurs: [
          {
            id: id('usr'),
            identifiant: 'admin',
            motDePasse: process.env.ADMIN_PASSWORD || 'linksmartech',
            role: 'proprietaire',
            creeLe: new Date().toISOString()
          }
        ]
      });
    }
    return this;
  }

  async lireContenu() {
    const brut = lireJson(this.fichierContenu, {});
    const fusion = fusionner(CONTENU_DEFAUT, brut);
    if (JSON.stringify(fusion) !== JSON.stringify(brut)) ecrireJson(this.fichierContenu, fusion);
    return fusion;
  }

  async ecrireContenu(contenu) {
    ecrireJson(this.fichierContenu, contenu);
    return contenu;
  }

  async lireReglages() {
    return fusionner(REGLAGES_DEFAUT, lireJson(this.fichierReglages, {}));
  }

  async ecrireReglages(reglages) {
    const fusion = fusionner(REGLAGES_DEFAUT, reglages);
    ecrireJson(this.fichierReglages, fusion);
    return fusion;
  }

  async lireMessages() {
    return lireJson(this.fichierMessages, []);
  }

  async ajouterMessage(message) {
    const messages = await this.lireMessages();
    const complet = { id: id('msg'), ...message, recuLe: new Date().toISOString(), lu: false };
    messages.unshift(complet);
    ecrireJson(this.fichierMessages, messages.slice(0, 500));
    return complet;
  }

  async marquerMessage(idMessage, lu = true) {
    const messages = await this.lireMessages();
    const cible = messages.find((m) => m.id === idMessage);
    if (cible) cible.lu = lu;
    ecrireJson(this.fichierMessages, messages);
    return cible || null;
  }

  async supprimerMessage(idMessage) {
    const messages = (await this.lireMessages()).filter((m) => m.id !== idMessage);
    ecrireJson(this.fichierMessages, messages);
    return true;
  }

  async lireSecurite() {
    return lireJson(this.fichierSecurite, { utilisateurs: [] });
  }

  async ecrireSecurite(securite) {
    ecrireJson(this.fichierSecurite, securite);
    return securite;
  }

  async journaliser(action, details = {}) {
    const fichier = path.join(DOSSIER_DATA, 'journal.json');
    const lignes = lireJson(fichier, []);
    lignes.unshift({ date: new Date().toISOString(), action, ...details });
    ecrireJson(fichier, lignes.slice(0, 200));
  }

  async statistiques() {
    const [messages, contenu] = await Promise.all([this.lireMessages(), this.lireContenu()]);
    return {
      messages: messages.length,
      messagesNonLus: messages.filter((m) => !m.lu).length,
      produits: (contenu.produits || []).length,
      services: (contenu.services || []).length,
      realisations: (contenu.realisations || []).length
    };
  }
}

/* ------------------------------------------------------------------ */
/* Pilote MySQL (optionnel, détecté automatiquement)                    */
/* ------------------------------------------------------------------ */

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS lm_documents (
     cle VARCHAR(64) NOT NULL PRIMARY KEY,
     valeur LONGTEXT NOT NULL,
     majLe TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS lm_messages (
     id VARCHAR(64) NOT NULL PRIMARY KEY,
     nom VARCHAR(190), email VARCHAR(190), telephone VARCHAR(60),
     sujet VARCHAR(190), message TEXT,
     lu TINYINT(1) NOT NULL DEFAULT 0,
     recuLe DATETIME NOT NULL
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS lm_journal (
     id INT AUTO_INCREMENT PRIMARY KEY,
     date DATETIME NOT NULL, action VARCHAR(120), details TEXT
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
];

class StockageMysql {
  constructor(config, connexion) {
    this.nom = `MySQL (${config.database}@${config.host})`;
    this.db = connexion;
  }

  static async creer(config) {
    const mysql = require('mysql2/promise'); // dépendance optionnelle
    const connexion = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      charset: 'utf8mb4',
      multipleStatements: false
    });
    const stockage = new StockageMysql(config, connexion);
    await stockage.init();
    return stockage;
  }

  async init() {
    for (const requete of SCHEMA) await this.db.query(requete);
    const contenu = await this.lireDocument('contenu');
    if (!contenu) await this.ecrireDocument('contenu', CONTENU_DEFAUT);
    const reglages = await this.lireDocument('reglages');
    if (!reglages) await this.ecrireDocument('reglages', REGLAGES_DEFAUT);
    const securite = await this.lireDocument('securite');
    if (!securite) {
      await this.ecrireDocument('securite', {
        utilisateurs: [
          {
            id: id('usr'),
            identifiant: 'admin',
            motDePasse: process.env.ADMIN_PASSWORD || 'linksmartech',
            role: 'proprietaire',
            creeLe: new Date().toISOString()
          }
        ]
      });
    }
    return this;
  }

  async lireDocument(cle) {
    const [lignes] = await this.db.query('SELECT valeur FROM lm_documents WHERE cle = ? LIMIT 1', [cle]);
    if (!lignes.length) return null;
    try {
      return JSON.parse(lignes[0].valeur);
    } catch {
      return null;
    }
  }

  async ecrireDocument(cle, valeur) {
    await this.db.query(
      'INSERT INTO lm_documents (cle, valeur) VALUES (?, ?) ON DUPLICATE KEY UPDATE valeur = VALUES(valeur)',
      [cle, JSON.stringify(valeur)]
    );
    return valeur;
  }

  async lireContenu() {
    const brut = (await this.lireDocument('contenu')) || {};
    const fusion = fusionner(CONTENU_DEFAUT, brut);
    if (JSON.stringify(fusion) !== JSON.stringify(brut)) await this.ecrireDocument('contenu', fusion);
    return fusion;
  }

  ecrireContenu(contenu) {
    return this.ecrireDocument('contenu', contenu);
  }

  async lireReglages() {
    return fusionner(REGLAGES_DEFAUT, (await this.lireDocument('reglages')) || {});
  }

  ecrireReglages(reglages) {
    return this.ecrireDocument('reglages', fusionner(REGLAGES_DEFAUT, reglages));
  }

  async lireMessages() {
    const [lignes] = await this.db.query(
      'SELECT id, nom, email, telephone, sujet, message, lu, recuLe FROM lm_messages ORDER BY recuLe DESC LIMIT 500'
    );
    return lignes.map((l) => ({ ...l, lu: Boolean(l.lu), recuLe: new Date(l.recuLe).toISOString() }));
  }

  async ajouterMessage(message) {
    const complet = { id: id('msg'), ...message, recuLe: new Date().toISOString(), lu: false };
    await this.db.query(
      'INSERT INTO lm_messages (id, nom, email, telephone, sujet, message, lu, recuLe) VALUES (?, ?, ?, ?, ?, ?, 0, NOW())',
      [complet.id, message.nom, message.email, message.telephone || null, message.sujet || null, message.message]
    );
    return complet;
  }

  async marquerMessage(idMessage, lu = true) {
    await this.db.query('UPDATE lm_messages SET lu = ? WHERE id = ?', [lu ? 1 : 0, idMessage]);
    return { id: idMessage, lu };
  }

  async supprimerMessage(idMessage) {
    await this.db.query('DELETE FROM lm_messages WHERE id = ?', [idMessage]);
    return true;
  }

  lireSecurite() {
    return this.lireDocument('securite').then((s) => s || { utilisateurs: [] });
  }

  ecrireSecurite(securite) {
    return this.ecrireDocument('securite', securite);
  }

  async journaliser(action, details = {}) {
    await this.db.query('INSERT INTO lm_journal (date, action, details) VALUES (NOW(), ?, ?)', [
      action,
      JSON.stringify(details)
    ]);
  }

  async statistiques() {
    const [[{ total }]] = await this.db.query('SELECT COUNT(*) AS total FROM lm_messages');
    const [[{ nonLus }]] = await this.db.query('SELECT COUNT(*) AS nonLus FROM lm_messages WHERE lu = 0');
    const contenu = await this.lireContenu();
    return {
      messages: total,
      messagesNonLus: nonLus,
      produits: (contenu.produits || []).length,
      services: (contenu.services || []).length,
      realisations: (contenu.realisations || []).length
    };
  }
}

/* ------------------------------------------------------------------ */
/* Fabrique                                                            */
/* ------------------------------------------------------------------ */

/**
 * Renvoie le stockage à utiliser. Jamais bloquant : en cas de souci MySQL,
 * on continue sur le stockage JSON et on l'indique dans les logs.
 */
async function creerStockage({ silencieux = false } = {}) {
  const config = detecterConfigMysql();
  const log = (...args) => {
    if (!silencieux) console.log(...args);
  };

  if (config.actif) {
    try {
      require.resolve('mysql2/promise');
      const stockage = await StockageMysql.creer(config);
      log(`   Base de données : ${stockage.nom} — détectée via ${config.source}`);
      return { stockage, pilote: 'mysql', config };
    } catch (erreur) {
      log('   Base de données : MySQL indisponible, bascule automatique sur le stockage local.');
      log(`   (${erreur.message})`);
    }
  }

  const stockage = await new StockageJson().init();
  log(`   Base de données : ${stockage.nom} — aucune configuration nécessaire`);
  return { stockage, pilote: 'json', config };
}

module.exports = {
  creerStockage,
  detecterConfigMysql,
  fusionner,
  id,
  lireJson,
  ecrireJson,
  DOSSIER_DATA,
  FICHIER_CONFIG
};
