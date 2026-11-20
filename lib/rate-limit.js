'use strict';

/** Limitation de débit simple, en mémoire (anti force brute sur /admin). */

const tentatives = new Map();
const FENETRETE_MS = 10 * 60 * 1000;
const SEUIL = 5;

function purger() {
  const maintenant = Date.now();
  for (const [cle, liste] of tentatives) {
    const recentes = liste.filter((t) => maintenant - t < FENETRETE_MS);
    if (recentes.length) tentatives.set(cle, recentes);
    else tentatives.delete(cle);
  }
}

function tropDeTentatives(cle) {
  purger();
  return (tentatives.get(cle) || []).length >= SEUIL;
}

function noterEchec(cle) {
  purger();
  const liste = tentatives.get(cle) || [];
  liste.push(Date.now());
  tentatives.set(cle, liste);
}

function reinitialiserTentatives(cle) {
  tentatives.delete(cle);
}

module.exports = { tropDeTentatives, noterEchec, reinitialiserTentatives };
