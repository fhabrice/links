'use strict';

const textes = require('./recrutement-public.json');

/** Projection publique : conserver les destinataires et réglages dans l'admin. */
function contenuPublic(contenu) {
  const copie = structuredClone(contenu);
  const tw = copie.travaillerAvecNous || {};
  const defaut = require('./defaults-fallback.json').contenu.travaillerAvecNous;
  const privees = [defaut.emailDestination, tw.emailDestination, tw.googleForm?.gmailDestination]
    .filter((adresse) => typeof adresse === 'string' && adresse.trim())
    .map((adresse) => adresse.trim().toLowerCase());
  const contientAdresse = (texte) => typeof texte === 'string' && privees.some((a) => texte.toLowerCase().includes(a));
  // Corriger aussi les anciens textes déjà enregistrés dans la base de données.
  if (contientAdresse(tw.texte)) tw.texte = textes.texte;
  if (contientAdresse(tw.formulaire?.sousTitre)) tw.formulaire.sousTitre = textes.sousTitre;
  delete tw.emailDestination;
  if (tw.googleForm) tw.googleForm = { actionUrl: tw.googleForm.actionUrl || '' };

  function masquer(valeur) {
    if (typeof valeur === 'string') {
      for (const adresse of privees) {
        const regex = new RegExp(adresse.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        valeur = valeur.replace(regex, 'notre équipe de recrutement');
      }
      return valeur;
    }
    if (Array.isArray(valeur)) return valeur.map(masquer);
    if (valeur && typeof valeur === 'object') {
      for (const cle of Object.keys(valeur)) valeur[cle] = masquer(valeur[cle]);
    }
    return valeur;
  }
  return masquer(copie);
}

module.exports = { contenuPublic };
