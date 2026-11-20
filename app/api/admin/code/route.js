import { json, corpsRequete, exigerSession } from '../../../../lib/http';
import { sb, supabasePret } from '../../../../lib/supabase';
import {
  lireSecurite,
  ecrireSecurite,
  hacher,
  verifierHachage,
  journaliser
} from '../../../../lib/store';
import { cookieSession } from '../../../../lib/auth';

export const dynamic = 'force-dynamic';

/** PUT /api/admin/code — changer le code d'accès de l'administration. */
export async function PUT(requete) {
  const { utilisateur, refus } = await exigerSession(requete);
  if (refus) return refus;

  const corps = await corpsRequete(requete);
  const ancienCode = String(corps.ancienCode ?? '');
  const nouveauCode = String(corps.nouveauCode ?? '');

  if (!ancienCode) {
    return json({ erreur: 'Entrez votre code actuel.' }, { code: 400 });
  }
  if (nouveauCode.length < 6) {
    return json(
      { erreur: 'Le nouveau code doit contenir au moins 6 caractères.' },
      { code: 400 }
    );
  }
  if (nouveauCode === ancienCode) {
    return json({ erreur: 'Le nouveau code doit être différent de l’actuel.' }, { code: 400 });
  }

  /* ---------------------- Mode Supabase ---------------------- */
  if (await supabasePret()) {
    const email =
      process.env.SUPABASE_ADMIN_EMAIL ||
      (utilisateur.identifiant.includes('@') ? utilisateur.identifiant : null);
    if (!email) {
      return json({ erreur: 'SUPABASE_ADMIN_EMAIL non configuré.' }, { code: 500 });
    }

    // 1. Vérifier l'ancien code
    let session = null;
    try {
      const { data, error } = await sb().auth.signInWithPassword({
        email,
        password: ancienCode
      });
      if (error || !data?.session) {
        return json({ erreur: 'Code actuel incorrect.' }, { code: 401 });
      }
      session = data.session;
    } catch {
      return json({ erreur: 'Supabase injoignable pour vérifier le code.' }, { code: 502 });
    }

    // 2. Mettre à jour le mot de passe (= le code)
    const { error: errMaj } = await sb().auth.admin.updateUserById(session.user.id, {
      password: nouveauCode
    });
    if (errMaj) {
      return json({ erreur: 'Impossible de changer le code.' }, { code: 500 });
    }

    // 3. Reconnecter avec le nouveau code pour renouveler le cookie
    let entetes = {};
    try {
      const reconnexion = await sb().auth.signInWithPassword({
        email,
        password: nouveauCode
      });
      if (reconnexion?.data?.session) {
        entetes = { 'Set-Cookie': cookieSession(reconnexion.data.session.access_token) };
      }
    } catch {
      /* le cookie actuel reste valable jusqu'à expiration */
    }

    await journaliser('code-change', { par: utilisateur.identifiant });
    return json({ ok: true, message: 'Code d’accès mis à jour.' }, { entetes });
  }

  /* ------------------------ Mode local ------------------------ */
  const donnees = await lireSecurite();
  const admin = (donnees.utilisateurs || []).find(
    (u) => u.identifiant.toLowerCase() === 'admin'
  );
  if (!admin || !verifierHachage(ancienCode, admin.motDePasse)) {
    return json({ erreur: 'Code actuel incorrect.' }, { code: 401 });
  }

  admin.motDePasse = hacher(nouveauCode);
  await ecrireSecurite(donnees);
  await journaliser('code-change', { par: utilisateur.identifiant });
  return json({ ok: true, message: 'Code d’accès mis à jour.' });
}
