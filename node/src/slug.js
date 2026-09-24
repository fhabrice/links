'use strict';

/**
 * Slugs des fiches produit.
 *
 * Même translittération que la version PHP (app/helpers.php) et le site public
 * (assets/js/site.js) : « Kit solaire hybride 5 kVA » → « kit-solaire-hybride-5-kva ».
 */

const TRANSLIT = {
  à: 'a', á: 'a', â: 'a', ã: 'a', ä: 'a', å: 'a',
  è: 'e', é: 'e', ê: 'e', ë: 'e',
  ì: 'i', í: 'i', î: 'i', ï: 'i',
  ò: 'o', ó: 'o', ô: 'o', õ: 'o', ö: 'o',
  ù: 'u', ú: 'u', û: 'u', ü: 'u',
  ç: 'c', ñ: 'n', ý: 'y', ÿ: 'y',
  œ: 'oe', æ: 'ae', ß: 'ss'
};

function slugifier(texte, longueurMax = 90) {
  let valeur = String(texte || '').trim().toLowerCase();
  valeur = valeur.replace(/[àáâãäåèéêëìíîïòóôõöùúûüçñýÿœæß]/g, (c) => TRANSLIT[c] || '-');
  valeur = valeur.replace(/[^a-z0-9]+/g, '-');
  valeur = valeur.replace(/^-+|-+$/g, '').slice(0, longueurMax);
  valeur = valeur.replace(/-+$/g, '');
  return valeur || 'produit';
}

/** Slug d'un produit : champ « slug » personnalisé, sinon déduit du nom. */
function slugProduit(produit) {
  const personnalise = String(produit?.slug || '').trim();
  return personnalise || slugifier(produit?.nom || '');
}

/**
 * Retrouve un produit actif à partir d'un segment d'URL : identifiant interne,
 * slug personnalisé ou slug déduit du nom.
 */
function trouverProduit(produits, segment) {
  const cible = String(segment || '').trim().replace(/^\/+|\/+$/g, '');
  if (!cible) return null;

  const actifs = (Array.isArray(produits) ? produits : []).filter((p) => p && p.actif !== false);

  const parId = actifs.find((p) => p.id === cible);
  if (parId) return parId;

  const parSlug = actifs.find((p) => String(p.slug || '').trim() === cible && String(p.slug).trim() !== '');
  if (parSlug) return parSlug;

  return actifs.find((p) => slugifier(p.nom) === cible) || null;
}

module.exports = { slugifier, slugProduit, trouverProduit };
