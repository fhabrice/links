# 🚀 Déployer la version Next.js sur un hébergement cPanel

> **À retenir** : la version Next.js vit dans le dossier `next/` du dépôt.
> Les anciens fichiers (`index.php` à la racine, `node/`) servent les
> **anciennes** versions — c'est pour ça que le bouton 🔒 Admin n'apparaît
> pas encore sur ton site en ligne.

---

## 0. Vérifier une chose importante

Dans ton **cPanel**, cherche l'application **« Setup Node.js App »**
(souvent dans la section *Software* — parfois appelée *Node.js* ou
*Application Manager*).

| Cas | Que faire |
| --- | --- |
| ✅ Tu la trouves | suis les étapes 1 à 5 ci-dessous |
| ❌ Elle n'est pas là | ton hébergement est **PHP uniquement** → Next.js ne peut pas y tourner : vois le **Plan B** en fin de guide |

---

## 1. Préparer les fichiers

Sur GitHub : **Code → Download ZIP**, puis extrait l'archive.
Tu n'as besoin que du dossier **`next/`** — et **sans** :

- `next/node_modules/` (recréé automatiquement)
- `next/.next/` (recréé au premier démarrage)
- `next/data/` (recréé automatiquement)

En terminal (si tu as git), depuis la racine du dépôt :

```bash
zip -r site-next.zip next \
  -x "next/node_modules/*" -x "next/.next/*" -x "next/data/*" -x "next/.env.local"
```

> 🔑 Si tu utilises **Supabase**, tu peux inclure `next/.env.local`
> (il contient tes clés) — ou le téléverser séparément à l'étape 3.

---

## 2. Créer l'application Node dans cPanel

**Setup Node.js App → Create Application** puis :

| Champ | Valeur |
| --- | --- |
| **Domain** | `www.linksmartec.com` (ton domaine principal) |
| **Application root** | `nextapp` *(dossier dans ton home, à côté de `public_html` — ne pas mélanger avec l'ancien site PHP)* |
| **Application startup file** | `start.js` |
| **Environment** | `Production` |
| **Node.js version** | 20 (ou la plus récente proposée) |

**Environment Variables** (facultatif, mais recommandé) :

```
SESSION_SECRET = <une phrase aléatoire longue>
```

Clique **Create/Save** — cPanel exécute tout seul `npm install`.

---

## 3. Téléverser les fichiers

1. **File Manager** → va dans le dossier `nextapp` créé à l'étape 2
2. **Upload** → sélectionne `site-next.zip` → **Extract**
3. Vérifie que le dossier contient bien : `package.json`, `start.js`,
   `app/`, `lib/`, `public/`, `supabase/`…
4. *(Supabase uniquement)* Upload aussi `next/.env.local` à la racine
   de `nextapp`

---

## 4. Build & démarrage

1. Retourne dans **Setup Node.js App** → clique **Start**
   (ou *Restart*)
2. **Premier lancement** : le site se construit tout seul
   (`[LK-TECH] Construction du site…`) — ça prend 30 à 90 secondes
   - ⏱ Si l'hébergeur coupe pour « timeout » → **clique Start une
     deuxième fois** : le build est déjà terminé, démarre instantanément
3. **Teste** : ouvre `https://www.linksmartec.com/api/health`

   → `"statut":"ok"` signifie que c'est en marche 🎉

4. Ouvre `https://www.linksmartec.com/` → le **bouton 🔒 Admin** est
   dans l'en-tête !

**Si ça ne démarre pas** : *Logs* dans Setup Node.js App → envoie-moi
l'erreur. Les causes fréquentes : mémoire insuffisante pour le build
(demande à ton hébergeur 512 Mo pour Node), ou mauvais *startup file*.

---

## 5. Après la mise en ligne

1. **Ancien site PHP** : une fois le nouveau confirmé, renomme
   `public_html` en `public_html-ancien` (File Manager) pour éviter
   deux sites en double. Garde-le une semaine par sécurité.
2. **Code d'administration** : sur le nouveau site, va sur `/admin`
   (code par défaut `linksmartech`) → *Réglages & sécurité* →
   **change le code immédiatement**.
3. **Supabase** (pour une vraie base en ligne) :
   - Exécute le SQL de `next/supabase/migrations/0001_init.sql`
     (SQL Editor du projet Supabase)
   - Crée le compte admin : *Authentication → Users → Add user*
     (`admin@linksmartec.com`, mot de passe = ton code)
   - Mets à jour `.env.local` si besoin → redémarre l'app
   - Vérifie : `/api/health` affiche `"pilote":"supabase"` au lieu de
     `"local"`

---

## Plan B — si cPanel n'a PAS de Node.js

Next.js réserve alors un hébergeur compatible. Deux solutions simples :

### B1. Render (gratuit, le dépôt est déjà prêt)

1. [render.com](https://render.com) → **New → Blueprint** → choisis
   `fhabrice/links`
2. Dans `render.yaml`, remplace les commandes par :

   ```yaml
   buildCommand: cd next && npm install && npm run build
   startCommand: cd next && npm start
   disk:
     mountPath: /opt/render/project/src/next/data
   ```

3. Ajoute ton domaine dans *Settings → Custom Domains* (Render guide
   la configuration DNS)
4. Ajoute les variables Supabase dans *Environment* si tu les utilises

### B2. Vercel (gratuit)

```bash
cd next
npx vercel --prod
```

Le dossier de projet est `next/` — c'est tout.

---

## Dépannage rapide

| Symptôme | Cause / solution |
| --- | --- |
| 404 sur tout | L'app Node n'est pas rattachée au domaine → vérifie le *Domain* de l'application |
| Le vieux site s'affiche | Le domaine pointe encore sur `public_html` → réassigne-le dans Setup Node.js App |
| `EADDRINUSE` | Un ancien process tourne → Restart dans cPanel |
| Build échoue (mémoire) | Demande plus de RAM à l'hébergeur, ou passe par Render (Plan B1) |
| Bouton Admin absent | Tu es sur l'**ancienne** version → vérifie que `start.js` est bien le *startup file* |
