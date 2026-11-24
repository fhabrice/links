'use strict';

/**
 * Couche de données du backend Next.js.
 *
 *  • Si NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY sont
 *    définies → tout passe par Supabase (Postgres), avec RLS activé et
 *    aucune politique anon : seul le serveur Next.js écrit/lit.
 *  • Sinon → stockage local JSON dans next/data/ (zéro configuration).
 *
 * Dans les deux cas, le contenu par défaut est importé de app/defaults.json
 * (source partagée avec les versions PHP et Node.js du dépôt).
 */

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { sb, supabasePret } = require('./supabase');
const { supabaseConfigure, modePilote } = require('./config');
const { dossierData } = require('./auth');

/* ------------------------------------------------------------------ */
/* Utilitaires communs                                                 */
/* ------------------------------------------------------------------ */

function lireJson(nom, defaut) {
  try {
    return JSON.parse(fs.readFileSync(path.join(dossierData(), nom), 'utf8'));
  } catch {
    return defaut;
  }
}

function ecrireJson(nom, valeur) {
  fs.mkdirSync(dossierData(), { recursive: true });
  fs.writeFileSync(
    path.join(dossierData(), nom),
    JSON.stringify(valeur, null, 2)
  );
}

let cacheDefauts = null;
function defauts() {
  if (cacheDefauts) return cacheDefauts;
  const candidats = [
    path.join(process.cwd(), 'lib', 'defaults-fallback.json'),
    path.join(__dirname, 'defaults-fallback.json')
  ];
  for (const fichier of candidats) {
    try {
      cacheDefauts = JSON.parse(fs.readFileSync(fichier, 'utf8'));
      return cacheDefauts;
    } catch {
      /* essai suivant */
    }
  }
  cacheDefauts = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'lib', 'defaults-fallback.json'), 'utf8')
  );
  return cacheDefauts;
}

function hacher(motDePasse, sel) {
  const s = sel || crypto.randomBytes(16).toString('hex');
  const empreinte = crypto.scryptSync(String(motDePasse), s, 32).toString('hex');
  return `${s}$${empreinte}`;
}

function verifierHachage(motDePasse, enregistre) {
  try {
    const [sel, empreinte] = String(enregistre).split('$');
    const test = hacher(motDePasse, sel);
    const a = Buffer.from(empreinte, 'hex');
    const b = Buffer.from(test.split('$')[1], 'hex');
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

function idUnique(prefixe) {
  return `${prefixe}-${crypto.randomUUID()}`;
}

/** Pilote réellement actif : 'supabase' si configuré ET joignable. */
async function piloteActif() {
  return (await supabasePret()) ? 'supabase' : 'local';
}

/* ------------------------------------------------------------------ */
/* Semis automatique (une fois par processus)                          */
/* ------------------------------------------------------------------ */

let semence = null;
async function semerSupabase() {
  if (semence) return semence;
  semence = (async () => {
    const base = sb();
    if (!base) return;
    const d = defauts();

    const { count: nbContenu, error: errC } = await base
      .from('contenu')
      .select('*', { count: 'exact', head: true });
    if (errC) throw errC;
    if (!nbContenu) {
      await base.from('contenu').insert({ cle: 'principal', donnees: d.contenu });
    }

    const { count: nbProduits, error: errP } = await base
      .from('produits')
      .select('*', { count: 'exact', head: true });
    if (errP) throw errP;
    if (!nbProduits) {
      const lignes = (d.contenu.produits || []).map((p, i) => ({
        id: p.id,
        nom: p.nom,
        description: p.description || '',
        prix: p.prix || 0,
        devise: p.devise || 'USD',
        filtre: p.filtre || '',
        categorie: p.categorie || '',
        badge: p.badge || '',
        image: p.image || '',
        stock: p.stock || 0,
        actif: p.actif !== false,
        ordre: i
      }));
      if (lignes.length) await base.from('produits').insert(lignes);
    }
  })();
  return semence;
}

/* ------------------------------------------------------------------ */
/* Contenu & réglages                                                  */
/* ------------------------------------------------------------------ */

async function lireContenu() {
  // Les clés manquantes dans le contenu enregistré (ex. « logiciels »,
  // ajoutées après coup) sont complétées depuis les défauts.
  const base = defauts().contenu;
  if (await supabasePret()) {
    await semerSupabase();
    const { data, error } = await sb()
      .from('contenu')
      .select('donnees')
      .eq('cle', 'principal')
      .maybeSingle();
    if (error) throw error;
    return { ...base, ...(data?.donnees || {}) };
  }
  return { ...base, ...(lireJson('contenu.json', null) || {}) };
}

async function ecrireContenu(contenu) {
  if (await supabasePret()) {
    await semerSupabase();
    const { error } = await sb()
      .from('contenu')
      .upsert({ cle: 'principal', donnees: contenu, maj_le: new Date().toISOString() });
    if (error) throw error;
    return contenu;
  }
  ecrireJson('contenu.json', contenu);
  return contenu;
}

async function lireReglages() {
  if (await supabasePret()) {
    await semerSupabase();
    const { data, error } = await sb()
      .from('reglages')
      .select('donnees')
      .eq('cle', 'principal')
      .maybeSingle();
    if (error) throw error;
    return data?.donnees || defauts().reglages;
  }
  return lireJson('reglages.json', defauts().reglages);
}

async function ecrireReglages(reglages) {
  if (await supabasePret()) {
    const { error } = await sb()
      .from('reglages')
      .upsert({ cle: 'principal', donnees: reglages, maj_le: new Date().toISOString() });
    if (error) throw error;
    return reglages;
  }
  ecrireJson('reglages.json', reglages);
  return reglages;
}

/* ------------------------------------------------------------------ */
/* Produits                                                            */
/* ------------------------------------------------------------------ */

function versLigneProduit(p) {
  return {
    id: p.id || idUnique('p'),
    nom: String(p.nom || '').slice(0, 200),
    description: String(p.description || '').slice(0, 2000),
    prix: Number(p.prix) || 0,
    devise: p.devise || 'USD',
    filtre: p.filtre || '',
    categorie: p.categorie || '',
    badge: p.badge || '',
    image: p.image || '',
    stock: Number(p.stock) || 0,
    actif: p.actif !== false,
    ordre: Number(p.ordre) || 0
  };
}

async function listerProduits({ admin = false } = {}) {
  if (await supabasePret()) {
    await semerSupabase();
    let q = sb().from('produits').select('*').order('ordre', { ascending: true });
    if (!admin) q = q.eq('actif', true);
    const { data, error } = await q;
    if (error) throw error;
    return data || [];
  }
  const produits = lireJson('produits.json', defauts().contenu.produits || []);
  return admin ? produits : produits.filter((p) => p.actif !== false);
}

async function ajouterProduit(produit) {
  const ligne = versLigneProduit(produit);
  if (await supabasePret()) {
    const { data, error } = await sb().from('produits').insert(ligne).select().single();
    if (error) throw error;
    return data;
  }
  const produits = lireJson('produits.json', defauts().contenu.produits || []);
  produits.push(ligne);
  ecrireJson('produits.json', produits);
  return ligne;
}

async function modifierProduit(id, patch) {
  if (await supabasePret()) {
    const { data, error } = await sb()
      .from('produits')
      .update(versLigneProduit({ ...patch, id }))
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  }
  const produits = lireJson('produits.json', defauts().contenu.produits || []);
  const index = produits.findIndex((p) => p.id === id);
  if (index === -1) return null;
  produits[index] = { ...produits[index], ...versLigneProduit({ ...produits[index], ...patch, id }) };
  ecrireJson('produits.json', produits);
  return produits[index];
}

async function supprimerProduit(id) {
  if (await supabasePret()) {
    const { error } = await sb().from('produits').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
  const produits = lireJson('produits.json', defauts().contenu.produits || []);
  const reste = produits.filter((p) => p.id !== id);
  if (reste.length === produits.length) return false;
  ecrireJson('produits.json', reste);
  return true;
}

/* ------------------------------------------------------------------ */
/* Messages de contact                                                 */
/* ------------------------------------------------------------------ */

async function ajouterMessage(message) {
  const ligne = {
    id: idUnique('msg'),
    nom: String(message.nom || '').slice(0, 120),
    email: String(message.email || '').slice(0, 160),
    telephone: String(message.telephone || '').slice(0, 40),
    sujet: String(message.sujet || 'Demande via le site').slice(0, 140),
    message: String(message.message || '').slice(0, 4000),
    lu: false
  };
  if (await supabasePret()) {
    const { data, error } = await sb()
      .from('messages')
      .insert({ ...ligne, recu_le: new Date().toISOString() })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
  const messages = lireJson('messages.json', []);
  messages.unshift({ ...ligne, recuLe: new Date().toISOString() });
  ecrireJson('messages.json', messages.slice(0, 500));
  return ligne;
}

async function listerMessages() {
  if (await supabasePret()) {
    const { data, error } = await sb()
      .from('messages')
      .select('*')
      .order('recu_le', { ascending: false })
      .limit(500);
    if (error) throw error;
    return data || [];
  }
  return lireJson('messages.json', []);
}

async function marquerMessage(id, lu) {
  if (await supabasePret()) {
    const { data, error } = await sb()
      .from('messages')
      .update({ lu: Boolean(lu) })
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  }
  const messages = lireJson('messages.json', []);
  const cible = messages.find((m) => m.id === id);
  if (!cible) return null;
  cible.lu = Boolean(lu);
  ecrireJson('messages.json', messages);
  return cible;
}

async function supprimerMessage(id) {
  if (await supabasePret()) {
    const { error } = await sb().from('messages').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
  const messages = lireJson('messages.json', []);
  const reste = messages.filter((m) => m.id !== id);
  if (reste.length === messages.length) return false;
  ecrireJson('messages.json', reste);
  return true;
}

/* ------------------------------------------------------------------ */
/* Candidatures « Travailler avec nous »                               */
/* ------------------------------------------------------------------ */

async function ajouterCandidature(donnees) {
  const ligne = {
    id: idUnique('cand'),
    civilite: String(donnees.civilite || '').slice(0, 20),
    nom: String(donnees.nom || '').slice(0, 120),
    prenom: String(donnees.prenom || '').slice(0, 120),
    email: String(donnees.email || '').slice(0, 160),
    telephone: String(donnees.telephone || '').slice(0, 40),
    ville: String(donnees.ville || '').slice(0, 120),
    dateNaissance: String(donnees.dateNaissance || '').slice(0, 20),
    domaine: String(donnees.domaine || '').slice(0, 140),
    typeCollaboration: String(donnees.typeCollaboration || '').slice(0, 80),
    experience: String(donnees.experience || '').slice(0, 80),
    disponibilite: String(donnees.disponibilite || '').slice(0, 80),
    message: String(donnees.message || '').slice(0, 5000),
    lienCv: String(donnees.lienCv || '').slice(0, 500),
    consentement: Boolean(donnees.consentement),
    lu: false
  };
  if (await supabasePret()) {
    const { data, error } = await sb()
      .from('candidatures')
      .insert({ ...ligne, recu_le: new Date().toISOString() })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
  const candidatures = lireJson('candidatures.json', []);
  candidatures.unshift({ ...ligne, recuLe: new Date().toISOString() });
  ecrireJson('candidatures.json', candidatures.slice(0, 1000));
  return ligne;
}

async function listerCandidatures() {
  if (await supabasePret()) {
    const { data, error } = await sb()
      .from('candidatures')
      .select('*')
      .order('recu_le', { ascending: false })
      .limit(500);
    if (error) throw error;
    return data || [];
  }
  return lireJson('candidatures.json', []);
}

async function marquerCandidature(id, lu) {
  if (await supabasePret()) {
    const { data, error } = await sb()
      .from('candidatures')
      .update({ lu: Boolean(lu) })
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  }
  const list = lireJson('candidatures.json', []);
  const cible = list.find((c) => c.id === id);
  if (!cible) return null;
  cible.lu = Boolean(lu);
  ecrireJson('candidatures.json', list);
  return cible;
}

async function supprimerCandidature(id) {
  if (await supabasePret()) {
    const { error } = await sb().from('candidatures').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
  const list = lireJson('candidatures.json', []);
  const reste = list.filter((c) => c.id !== id);
  if (reste.length === list.length) return false;
  ecrireJson('candidatures.json', reste);
  return true;
}

/**
 * Transfère une candidature vers Google Form si configuré.
 * Ne fait jamais échouer la requête principale : erreurs loggées seulement.
 */
async function transfererVersGoogleForm(candidature, contenu) {
  try {
    const cfg = contenu?.travaillerAvecNous?.googleForm || {};
    const actionUrl = String(cfg.actionUrl || '').trim();
    if (!actionUrl || !actionUrl.includes('docs.google.com')) return { ok: false, raison: 'non-configure' };
    const map = cfg.fieldMap || {};
    const params = new URLSearchParams();
    function add(key, valeur) {
      const entry = map[key];
      if (entry && String(entry).trim() && valeur) params.set(String(entry).trim(), String(valeur));
    }
    add('nom', candidature.nom);
    add('prenom', candidature.prenom);
    add('email', candidature.email);
    add('telephone', candidature.telephone);
    add('ville', candidature.ville);
    add('domaine', candidature.domaine);
    add('typeCollaboration', candidature.typeCollaboration);
    add('experience', candidature.experience);
    add('disponibilite', candidature.disponibilite);
    add('message', candidature.message);
    add('lienCv', candidature.lienCv);
    add('civilite', candidature.civilite);
    add('dateNaissance', candidature.dateNaissance);
    // Google Form attend un POST form-encoded
    const res = await fetch(actionUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });
    await journaliser('candidature-googleform', { id: candidature.id, status: res.status, ok: res.ok });
    return { ok: res.ok, status: res.status };
  } catch (e) {
    await journaliser('candidature-googleform-erreur', { erreur: String(e?.message || e) });
    return { ok: false, raison: 'erreur' };
  }
}

/* ------------------------------------------------------------------ */
/* Statistiques & journal                                              */
/* ------------------------------------------------------------------ */

async function statistiques() {
  const produits = await listerProduits({ admin: true });
  if (await supabasePret()) {
    const { count: total, error } = await sb()
      .from('messages')
      .select('*', { count: 'exact', head: true });
    if (error) throw error;
    const { count: nonLus, error: err2 } = await sb()
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('lu', false);
    if (err2) throw err2;
    const { count: totalCand, error: err3 } = await sb()
      .from('candidatures')
      .select('*', { count: 'exact', head: true });
    const candidatures = totalCand || 0;
    const { count: nonLues, error: err4 } = await sb()
      .from('candidatures')
      .select('*', { count: 'exact', head: true })
      .eq('lu', false);
    return {
      mode: await piloteActif(),
      messages: total || 0,
      messagesNonLus: nonLus || 0,
      candidatures,
      candidaturesNonLues: nonLues || 0,
      produits: produits.length
    };
  }
  const messages = lireJson('messages.json', []);
  const candidatures = lireJson('candidatures.json', []);
  return {
    mode: await piloteActif(),
    messages: messages.length,
    messagesNonLus: messages.filter((m) => !m.lu).length,
    candidatures: candidatures.length,
    candidaturesNonLues: candidatures.filter((c) => !c.lu).length,
    produits: produits.length
  };
}

async function journaliser(type, details = {}) {
  try {
    if (await supabasePret()) {
      await sb().from('journal').insert({ type, details });
      return;
    }
    const entrees = lireJson('journal.json', []);
    entrees.unshift({ type, details, le: new Date().toISOString() });
    ecrireJson('journal.json', entrees.slice(0, 500));
  } catch {
    /* le journal ne doit jamais faire échouer une requête */
  }
}

/* ------------------------------------------------------------------ */
/* Comptes (mode local uniquement — Supabase Auth gère le mode remote) */
/* ------------------------------------------------------------------ */

async function lireSecurite() {
  const fichier = path.join(dossierData(), 'securite.json');
  try {
    return JSON.parse(fs.readFileSync(fichier, 'utf8'));
  } catch {
    const defaut = {
      utilisateurs: [
        {
          identifiant: 'admin',
          role: 'admin',
          motDePasse: hacher('linksmartech')
        }
      ]
    };
    ecrireJson('securite.json', defaut);
    return defaut;
  }
}

async function ecrireSecurite(donnees) {
  ecrireJson('securite.json', donnees);
}

module.exports = {
  modePilote,
  piloteActif,
  supabaseConfigure,
  defauts,
  hacher,
  verifierHachage,
  lireContenu,
  ecrireContenu,
  lireReglages,
  ecrireReglages,
  listerProduits,
  ajouterProduit,
  modifierProduit,
  supprimerProduit,
  ajouterMessage,
  listerMessages,
  marquerMessage,
  supprimerMessage,
  ajouterCandidature,
  listerCandidatures,
  marquerCandidature,
  supprimerCandidature,
  transfererVersGoogleForm,
  statistiques,
  journaliser,
  lireSecurite,
  ecrireSecurite
};
