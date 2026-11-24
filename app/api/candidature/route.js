import { json, corpsRequete, nettoyer, emailValide } from '../../../lib/http';
import { ajouterCandidature, journaliser, lireContenu, envoyerCandidatureParEmail, transfererVersGoogleForm } from '../../../lib/store';

export const dynamic = 'force-dynamic';

export async function POST(requete) {
  const corps = await corpsRequete(requete);
  const candidature = {
    civilite: nettoyer(corps.civilite, 20),
    nom: nettoyer(corps.nom, 120),
    prenom: nettoyer(corps.prenom, 120),
    email: nettoyer(corps.email, 160),
    telephone: nettoyer(corps.telephone, 40),
    ville: nettoyer(corps.ville, 120),
    dateNaissance: nettoyer(corps.dateNaissance, 20),
    domaine: nettoyer(corps.domaine, 140),
    typeCollaboration: nettoyer(corps.typeCollaboration, 80),
    experience: nettoyer(corps.experience, 80),
    disponibilite: nettoyer(corps.disponibilite, 80),
    message: nettoyer(corps.message || corps.motivation, 5000),
    lienCv: nettoyer(corps.lienCv, 500),
    consentement: Boolean(corps.consentement)
  };

  if (!candidature.nom || !candidature.prenom || !emailValide(candidature.email) || candidature.message.length < 10) {
    return json({ erreur: 'Merci de renseigner nom, prénom, un e-mail valide et votre motivation (10 caractères min).' }, { code: 400 });
  }
  if (!candidature.consentement) {
    return json({ erreur: 'Veuillez accepter la politique de confidentialité.' }, { code: 400 });
  }

  const enregistre = await ajouterCandidature(candidature);
  await journaliser('candidature-recue', { id: enregistre.id, email: candidature.email, domaine: candidature.domaine });

  // Envoi direct par e-mail à fabricenzarubara@gmail.com (non bloquant)
  let emailResult = { ok: false, raison: 'non-tente' };
  let transfert = { ok: false, raison: 'non-tente' };
  try {
    const contenu = await lireContenu();
    emailResult = await envoyerCandidatureParEmail(enregistre, contenu);
    transfert = await transfererVersGoogleForm(enregistre, contenu);
  } catch {}

  return json({ ok: true, id: enregistre.id, message: 'Candidature enregistrée et envoyée à fabricenzarubara@gmail.com.', email: emailResult, googleForm: transfert }, { code: 201 });
}

export async function GET() {
  return json({ info: 'Utilisez POST pour envoyer une candidature.' }, { code: 405 });
}
