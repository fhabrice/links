import { json, corpsRequete, nettoyer, emailValide } from '../../../lib/http';
import { ajouterMessage, journaliser } from '../../../lib/store';

export const dynamic = 'force-dynamic';

export async function POST(requete) {
  const corps = await corpsRequete(requete);
  const message = {
    nom: nettoyer(corps.nom, 120),
    email: nettoyer(corps.email, 160),
    telephone: nettoyer(corps.telephone, 40),
    sujet: nettoyer(corps.sujet, 140) || 'Demande via le site',
    message: nettoyer(corps.message, 4000)
  };

  if (!message.nom || !emailValide(message.email) || message.message.length < 5) {
    return json(
      { erreur: 'Merci de renseigner votre nom, un e-mail valide et un message.' },
      { code: 400 }
    );
  }

  const enregistre = await ajouterMessage(message);
  await journaliser('message-recu', { id: enregistre.id, email: message.email });
  return json({ ok: true, id: enregistre.id, message: 'Message enregistré.' }, { code: 201 });
}
