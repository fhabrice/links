# LK-TECH — Backend Next.js + Supabase

Version **Next.js 15** (App Router) du site LK-TECH, avec **Supabase** comme
backend (PostgreSQL + Auth + RLS). Zéro configuration obligatoire : sans clés
Supabase, le site tourne avec un stockage local JSON (`next/data/`), puis
**bascule automatiquement** sur Supabase dès que les variables sont présentes.

## Démarrage

```bash
cd next
npm install
npm run dev          # http://localhost:3000
# ou version production (build automatique au 1er lancement) :
npm start            # start.js : build si nécessaire, puis next start
```

> 🌐 **Mise en ligne sur cPanel** : voir le guide pas-à-pas
> [`DEPLOIEMENT-CPANEL.md`](DEPLOIEMENT-CPANEL.md)
> (Plan B : Render / Vercel en fin de guide).

- **Site** : `/` — vitrine + boutique + formulaire de contact,
  avec **bouton 🔒 Admin** dans l'en-tête et le pied de page
- **Admin** : `/admin` — connexion par **code d'accès**
  (code initial : `linksmartech`, à changer dans *Réglages & sécurité*).
  Back-office complet : **contenu du site** (identité, hero, spécialités,
  à propos, JSON avancé), **produits**, **messages**, **réglages**,
  changement de code.
- **API** : `GET /api/health`, `GET /api/site`, `POST /api/contact`,
  et l'ensemble `/api/admin/*` (session, state, contenu, réglages,
  code, produits CRUD, messages)

## Connecter Supabase (3 étapes)

1. **Créer le projet** sur [supabase.com](https://supabase.com) (plan gratuit).
2. **Exécuter le schéma** : Dashboard → *SQL Editor* → *New query* → coller le
   contenu de [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql)
   → *Run*. (RLS est activé : aucune lecture publique directe, seul le backend
   avec la clé `service_role` accède aux tables.)
3. **Créer l'administrateur** : Dashboard → *Authentication* → *Users* →
   *Add user* (e-mail + mot de passe, *auto-confirm* activé), puis renseigner
   dans `next/.env.local` (copier de `.env.local.example`) :

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...        # Project Settings → API → service_role
   SUPABASE_ADMIN_EMAIL=admin@linksmartec.com     # l'e-mail créé à l'étape 2
   ```

Redémarrez le serveur : `GET /api/health` renvoie alors `"pilote":"supabase"`.
Au premier démarrage, le contenu et les produits par défaut sont **automatiquement
semés** dans Postgres (depuis `app/defaults.json`, source partagée du dépôt).

> 🔑 La clé `service_role` secrète ne quitte jamais le serveur Next.js — elle
> n'est jamais envoyée au navigateur. Le front n'utilise que les routes API.

## API — résumé

| Méthode | Route | Accès | Rôle |
| --- | --- | --- | --- |
| GET | `/api/health` | public | état + pilote (`local`/`supabase`) |
| GET | `/api/site` | public | contenu éditorial + réglages |
| POST | `/api/contact` | public | enregistre un message (validé) |
| POST | `/api/admin/login` | public | connexion par `{ code }` (Supabase Auth ou compte local), cookie `lk_session` HttpOnly |
| PUT | `/api/admin/code` | session | changer le code d'accès (`ancienCode` / `nouveauCode`) |
| POST | `/api/admin/logout` | session | déconnexion |
| GET | `/api/admin/session` | session | état de la session |
| GET | `/api/admin/state` | session | stats + contenu + réglages |
| PUT | `/api/admin/contenu` | session | remplace le contenu éditorial |
| PUT | `/api/admin/reglages` | session | remplace les réglages |
| GET/POST | `/api/admin/produits` | session | liste / création |
| PUT/DELETE | `/api/admin/produits/:id` | session | modification / suppression |
| GET | `/api/admin/messages` | session | liste des messages |
| PATCH/DELETE | `/api/admin/messages/:id` | session | lu/non-lu / suppression |

Sécurité : sessions signées HMAC (12 h) ou jetons Supabase Auth, limitation de
débit sur la connexion (5 essais / 10 min), échappement/sanitisation des
entrées, RLS sur toutes les tables Supabase.

## Structure

```
next/
├── app/                  # Pages (App Router) + routes API
│   ├── page.js           # Vitrine publique
│   ├── admin/page.js     # Espace d'administration
│   └── api/…             # Route handlers
├── lib/
│   ├── store.js          # Couche de données (Supabase OU local JSON)
│   ├── supabase.js       # Client serveur (clé service_role)
│   ├── auth.js           # Sessions (cookies signés / Supabase Auth)
│   └── http.js           # Helpers des route handlers
├── supabase/migrations/  # Schéma SQL à exécuter sur Supabase
└── data/                 # Stockage local (ignoré par git)
```
