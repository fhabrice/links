import { json, corpsRequete, nettoyer } from '../../../../lib/http';
import { sb } from '../../../../lib/supabase';
import { supabaseConfigure, lireSecurite, verifierHachage, journaliser } from '../../../../lib/store';
import { creerJeton, cookieSession } from '../../../../lib/auth';
import { tropDeTentatives, noterEchec, reinitialiserTentatives } from '../../../../lib/rate-limit';

export const dynamic = 'force-dynamic';

function ipDe(requete) {
  return (
    requete.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    requete.headers.get('x-real-ip') ||
    'local'
  );
}

export async function POST(requete) {
  const corps = await corpsRequete(requete);
  const identifiant = nettoyer(corps.identifiant, 80);
  const motDePasse = String(corps.motDePasse ?? '');
  const cle = `${identifiant}|${ipDe(requete)}`;

  if (!identifiant || !motDePasse) {
    return json({ erreur: 'Identifiant et mot de passe requis.' }, { code: 400 });
  }

  if (tropDeTentatives(cle)) {
    return json(
      { erreur: 'Trop de tentatives. Réessayez dans quelques minutes.' },
      { code: 429 }
    );
  }

  /* ---------------- Mode Supabase (Supabase Auth) ---------------- */
  if (supabaseConfigure()) {
    const email = identifiant.includes('@')
      ? identifiant
      : process.env.SUPABASE_ADMIN_EMAIL || `${identifiant}@linksmartec.com`;

    const { data, error } = await sb().auth.signInWithPassword({
      email,
      password: motDePasse
    });

    if (error || !data?.session) {
      noterEchec(cle);
      await journaliser('connexion-echouee', { identifiant });
      return json({ erreur: 'Identifiant ou mot de passe incorrect.' }, { code: 401 });
    }

    reinitialiserTentatives(cle);
    await journaliser('connexion', { identifiant: email });
    return json(
      {
        ok: true,
        utilisateur: { identifiant: email, role: 'admin' },
        pilote: 'supabase'
      },
      { entetes: { 'Set-Cookie': cookieSession(data.session.access_token) } }
    );
  }

  /* ---------------- Mode local (JSON) ---------------- */
  const donnees = await lireSecurite();
  const utilisateur = (donnees.utilisateurs || []).find(
    (u) => u.identifiant.toLowerCase() === identifiant.toLowerCase()
  );

  if (!utilisateur || !verifierHachage(motDePasse, utilisateur.motDePasse)) {
    noterEchec(cle);
    await journaliser('connexion-echouee', { identifiant });
    return json({ erreur: 'Identifiant ou mot de passe incorrect.' }, { code: 401 });
  }

  reinitialiserTentatives(cle);
  const jeton = creerJeton({
    identifiant: utilisateur.identifiant,
    role: utilisateur.role || 'admin'
  });
  await journaliser('connexion', { identifiant: utilisateur.identifiant });

  return json(
    {
      ok: true,
      utilisateur: { identifiant: utilisateur.identifiant, role: utilisateur.role || 'admin' },
      pilote: 'local'
    },
    { entetes: { 'Set-Cookie': cookieSession(jeton) } }
  );
}
