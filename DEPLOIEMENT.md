# Mettre le site LK-TECH en ligne

Ce guide couvre les façons d'héberger le site, de la plus simple à la plus
complète. Choisissez **une seule** option selon votre budget et vos compétences.

> **Rappel important** : le site n'utilise aucune base de données obligatoire.
> Il n'y a **rien à installer ni à configurer** : on copie les fichiers, et c'est
> en ligne. La façon la plus simple est la **version PHP** (Option 1) : quelques
> fichiers à téléverser, aucun logiciel à installer. Les options suivantes
> concernent la version Node.js (dossier `node/`), pour un VPS ou une plateforme
> managée — et l'**option 7 (Netlify)** pour un hébergement statique gratuit
> sans serveur.

---

## ⚡ Avant tout : ce que vous devez savoir

| Point | À retenir |
| --- | --- |
| **Le domaine** | Enregistrez `linksmartec.com` chez un registraire (Namecheap, OVH, Google Domains, ou un prestataire local) puis faites pointer son DNS vers votre hébergeur. |
| **Les données** | Le contenu (textes, produits, messages) est enregistré dans un dossier `data/` (à la racine pour la version PHP, dans `node/` pour la version Node.js). **Il doit donc être conservé entre deux redémarrages.** Chaque option ci-dessous explique comment. |
| **Le mot de passe admin** | Par défaut : `admin` / `linksmartech`. Changez-le dès la mise en ligne (admin → *Sécurité*) **et** en définissant `ADMIN_PASSWORD`. |
| **HTTPS** | Indispensable. Toutes les options ci-dessous permettent le certificat gratuit (Let's Encrypt / AutoSSL). |
| **Coût** | De 0 € (offres gratuites, avec limites) à ~5 €/mois (VPS ou mutualisé). |

---

## Option 1 — **Version PHP** *(le plus simple : aucun logiciel à installer)*

C'est la voie recommandée si vous avez un hébergement classique (cPanel, Hostinger,
OVH, Namecheap…), même sans « Setup Node.js App ». Le site PHP **est à la racine du
dépôt** : c'est exactement le même site que la version Node.js (mêmes pages, même
administration, même API JSON).

1. Téléversez **tout le contenu du dépôt** dans `public_html/` (FTP ou
   gestionnaire de fichiers). Le dossier `node/` (version Node.js) est inutile
   sur un hébergement PHP : vous pouvez le sauter ou le supprimer après coup.
2. Vérifiez que `data/` est accessible en écriture (`0755`).
3. Ouvrez votre domaine → le site s'affiche, l'administration est sur `/admin`
   (`admin` / `linksmartech`).

**Prérequis :** PHP 7.4 ou supérieur (8 conseillé) et Apache avec `mod_rewrite`
(le cas par défaut partout). Sur Nginx, la configuration équivalente est donnée
dans `LISEZ-MOI.md`.

Aucune commande à taper, aucun écran d'installation, aucun champ MySQL.
Le détail complet est dans **`LISEZ-MOI.md`** (sous-dossier, Nginx, sauvegarde,
passage à MySQL, migration depuis la version Node.js).

> ⚠️ Les deux versions ne partagent pas leurs données : la version PHP écrit dans
> `data/` et `uploads/` à la racine, la version Node.js dans `node/data/`.

---

## Option 2 — **Version Node.js** sur cPanel / Plesk *(Passenger)*

**Pour qui ?** Vous avez déjà un hébergement web classique (Hostinger, Namecheap, OVH,
un hébergeur local…). C'est l'option la plus courante et la moins chère.

**Prérequis :** que votre hébergeur propose « **Setup Node.js App** » (Phusion Passenger).

1. Dans cPanel, ouvrez **Setup Node.js App** → *Create Application*
   - **Node.js version** : 18 ou 20
   - **Application root** : `linksmartec`
   - **Application URL** : `linksmartec.com` (ou `www.linksmartec.com`)
   - **Application startup file** : `node/server.js`
2. Téléversez tout le contenu du dépôt dans le dossier `linksmartec`
   (Gestionnaire de fichiers, FTP, ou *Git Version Control* de cPanel).
3. Cliquez sur **Run NPM Install** (même sans dépendance : cPanel prépare l'environnement).
4. Onglet **Environment variables**, ajoutez :
   - `SESSION_SECRET` = une longue chaîne aléatoire
   - `ADMIN_PASSWORD` = votre mot de passe
5. **Restart** → le site est en ligne.
6. Onglet **SSL/TLS Status** → **Run AutoSSL** (HTTPS gratuit).

📄 Un modèle de `.htaccess` et la procédure détaillée : `node/deploy/cpanel-passenger.txt`

> ⚠️ Vérifiez que le dossier `node/data` est accessible en écriture
> (Gestionnaire de fichiers → clic droit sur `node/data` → *Change Permissions* → `0755`).

**Coût :** souvent déjà inclus dans votre hébergement mutualisé.

---

## Option 3 — **Version Node.js** sur VPS *(Nginx + systemd)*

**Pour qui ?** Vous voulez la maîtrise totale, de bonnes performances et un coût fixe.
Un VPS d'entrée de gamme suffit largement (1 vCPU / 1 Go de RAM).

**Fournisseurs courants :** Contabo, Hetzner, DigitalOcean, Hostinger VPS, Vultr —
à partir de ~4 €/mois.

```bash
# 1) Se connecter au serveur
ssh root@IP_DU_SERVEUR

# 2) Installer Node.js 20 et Nginx
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs nginx git

# 3) Récupérer le site
mkdir -p /var/www && cd /var/www
git clone https://github.com/fhabrice/links.git linksmartec
cd linksmartec

# 4) Créer les réglages
cat > node/.env <<'EOF'
SESSION_SECRET=remplacez-par-une-longue-chaine-aleatoire
ADMIN_PASSWORD=votre-mot-de-passe-admin
PORT=3000
EOF

# 5) Créer le dossier de données accessible en écriture
mkdir -p node/data/uploads && chown -R www-data:www-data /var/www/linksmartec

# 6) Installer le service (démarrage automatique + redémarrage en cas de plantage)
cp node/deploy/linksmartec.service /etc/systemd/system/
systemctl daemon-reload && systemctl enable --now linksmartec
systemctl status linksmartec     # doit afficher « active (running) »

# 7) Configurer Nginx (nom de domaine → site)
cp node/deploy/nginx-linksmartec.conf /etc/nginx/sites-available/linksmartec
ln -s /etc/nginx/sites-available/linksmartec /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# 8) HTTPS gratuit
apt install -y certbot python3-certbot-nginx
certbot --nginx -d linksmartec.com -d www.linksmartec.com
```

**DNS à créer chez votre registraire :**

| Type | Nom | Valeur |
| --- | --- | --- |
| A | `@` (linksmartec.com) | IP de votre VPS |
| A | `www` | IP de votre VPS |

**Mise à jour du site plus tard :**

```bash
cd /var/www/linksmartec && git pull && systemctl restart linksmartec
```

**Coût :** ~4 à 8 €/mois — et vous pouvez héberger d'autres projets sur le même serveur.

---

## Option 4 — **Version Node.js** sur plateforme managée (Render, Railway, Koyeb…)

**Pour qui ?** Vous voulez déployer en quelques minutes sans administrer de serveur.
Le fichier `render.yaml` est déjà prêt dans le dépôt.

### Render

1. Créez un compte sur [render.com](https://render.com) et connectez votre GitHub.
2. **New** → **Blueprint** → choisissez le dépôt `links` → *Apply*.
   Render lit `render.yaml` : le site se construit et démarre tout seul.
3. Render vous demande `ADMIN_PASSWORD` : saisissez votre mot de passe.
4. **Settings → Custom Domains** → ajoutez `www.linksmartec.com` puis
   `linksmartec.com`, et suivez les instructions DNS affichées.
5. HTTPS est automatique.

| Type | Nom | Valeur |
| --- | --- | --- |
| CNAME | `www` | `votre-service.onrender.com` |
| A / ALIAS | `@` | adresse fournie par Render |

> ⚠️ **Le disque persistant** (`disk:` dans `render.yaml`) est nécessaire pour ne pas
> perdre les données à chaque déploiement. Il est inclus dans l'offre *Starter*.
> Sur l'**offre gratuite** (sans disque), deux solutions :
> - exportez régulièrement vos données (admin → *Stockage & sauvegarde* → *Exporter*), ou
> - renseignez les variables `MYSQL_*` d'une base MySQL — le site s'y connectera **tout seul**
>   (voir l'option 4 de cette page).

### Railway

1. [railway.app](https://railway.app) → **New Project** → *Deploy from GitHub repo*.
2. Railway détecte Node.js et utilise `Procfile` (`web: cd node && node server.js`).
3. **Settings → Volumes** → ajoutez un volume monté sur `/app/data`
   (indispensable pour conserver vos données).
4. **Variables** : `SESSION_SECRET`, `ADMIN_PASSWORD`.
5. **Settings → Networking → Custom Domain** → `www.linksmartec.com`.

**Coût :** offre gratuite limitée, puis ~5 $/mois.

---

## Option 5 — Base MySQL fournie par l'hébergeur *(facultatif, les deux versions)*

Si votre hébergeur vous a attribué une base MySQL (fréquent en mutualisé), vous pouvez
l'utiliser **sans rien saisir dans l'interface** : renseignez simplement les variables
d'environnement, le site les détecte et crée ses tables tout seul.

```
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=utilisateur
MYSQL_PASSWORD=motdepasse
MYSQL_DATABASE=linksmartec
```

En cas d'indisponibilité de la base, le site **continue de fonctionner** sur son stockage
local — aucune page d'erreur, aucune configuration à refaire.

> Ceci est facultatif : sur un VPS ou avec un disque persistant, le stockage local suffit.

---

## Option 6 — Site 100 % statique *(sans admin)*

**Pour qui ?** Vous ne voulez qu'une vitrine en ligne, sans administration ni formulaire
enregistré côté serveur. Fonctionne sur **Netlify, Vercel, GitHub Pages ou tout espace
d'hébergement statique**.

> 💡 **Pour Netlify spécifiquement, préférez l'option 7 ci-dessous** : elle génère
> aussi les fiches produit en HTML et branche le formulaire de contact sur
> Netlify Forms (messages reçus par e-mail).

1. Générez le contenu statique :
   ```bash
   node tools/build-fallback.js
   ```
2. Publiez le dossier **`public/`** entier.
3. Le site s'affiche : le contenu provient de `public/data/site.json` et les images de
   `public/assets/img/`.
4. Le formulaire de contact bascule automatiquement sur l'adresse e-mail
   `contact@linksmartec.com`.

⚠️ Dans ce mode : **pas d'administration**, **pas de panier enregistré**, et les
modifications nécessitent de regénérer `site.json` puis de republier.

---

## Option 7 — **Netlify** *(gratuit, statique optimisé)*

**Pour qui ?** Un site public rapide et gratuit (100 Go de trafic/mois inclus),
sans gérer de serveur. La boutique, le panier et la commande WhatsApp fonctionnent
entièrement dans le navigateur ; le formulaire de contact passe par **Netlify Forms**
(vous recevez les messages dans le tableau de bord Netlify et par e-mail).

⚠️ **Limites de ce mode** : pas d'administration en ligne ni d'API — les
modifications de contenu se font en local puis sont republiées (voir plus bas).
Pour un site avec admin en ligne, utilisez l'option 1 (PHP), 2, 3 ou 4.

### Mise en ligne (10 minutes)

1. **Poussez ce dépôt sur GitHub** (il y est probablement déjà) — la branche
   `main` suffit.
2. Sur [app.netlify.com](https://app.netlify.com) → **Add new site → Import an
   existing project → GitHub** → choisissez le dépôt.
3. Netlify lit automatiquement **`netlify.toml`** : rien à remplir.
   - Build command : `node tools/build-netlify.js`
   - Publish directory : `netlify-dist`
4. **Deploy** — le site est en ligne sur `https://votre-site.netlify.app`.
5. **Votre domaine** : *Domain management → Add a domain* → `linksmartec.com`,
   puis chez votre registraire, remplacez les enregistrements DNS par ceux
   affichés par Netlify (ou laissez Netlify gérer le DNS). Le HTTPS est
   automatique.
6. **Définissez l'URL publique** : *Site configuration → Environment variables →*
   `SITE_URL` = `https://www.linksmartec.com` (utilisée dans `robots.txt` et
   `sitemap.xml`), puis redéployez.

### Recevoir les messages du formulaire

1. Dans Netlify → **Forms** : le formulaire `contact` apparaît après le premier
   déploiement.
2. *Forms → Settings and forms → Form notifications → Add notification →
   Email notification* → votre adresse (`contact@linksmartec.com`).
3. Chaque message est visible dans l'onglet Forms et arrivé par e-mail.

### Modifier le contenu du site

Le contenu publié est « figé » au moment du déploiement. Pour le modifier :

1. **En local** : lancez la version Node (`node node/server.js`), connectez-vous
   à l'administration (`/admin`) et faites vos modifications — ou éditez
   directement les valeurs par défaut (`node/src/defaults.js`).
2. **Exportez** : admin → *Stockage & sauvegarde → Exporter mes données (JSON)*.
3. **Enregistrez le fichier** à la racine du dépôt sous le nom
   **`contenu-site.json`** et téléversez dans ce même fichier les images
   personnalisées en les plaçant dans le dossier **`images-site/`** (créez-le).
4. `git push` → Netlify reconstruit et republie le site automatiquement.

Sans fichier `contenu-site.json`, le site publie les valeurs par défaut du dépôt.

### Ce qui fonctionne en mode Netlify

| Fonction | État |
| --- | --- |
| Vitrine complète (accueil, à propos, spécialités, services) | ✅ |
| Boutique + filtres + panier + commande WhatsApp | ✅ (navigateur) |
| Fiches produit `/produit/{slug}` (SSR, SEO, JSON-LD) | ✅ générées à chaque déploiement |
| Formulaire de contact | ✅ via Netlify Forms (e-mail) |
| Page 404, sitemap, robots.txt, HTTPS | ✅ |
| Administration en ligne, API, téléversement en production | ❌ (hébergement statique) |

---

## Comparatif rapide

| | Coût | Difficulté | Admin en ligne | Données conservées |
| --- | --- | --- | --- | --- |
| **1. PHP (mutualisé)** | inclus | ⭐ facile | ✅ | ✅ (disque du serveur) |
| **2. Node sur cPanel** | inclus | ⭐⭐ facile | ✅ | ✅ (disque du serveur) |
| **3. Node sur VPS** | 4–8 €/mois | ⭐⭐⭐ technique | ✅ | ✅ (disque du serveur) |
| **4. Render / Railway** | 0–5 $/mois | ⭐⭐ simple | ✅ | ⚠️ avec disque persistant |
| **5. + MySQL** | selon hébergeur | ⭐ facile | ✅ | ✅ |
| **6. Statique brut** | 0 € | ⭐ facile | ❌ | — |
| **7. Netlify** | 0 € | ⭐ facile | ❌ (contenu via git) | messages : Netlify Forms |

---

## ✅ Liste de contrôle avant la mise en ligne

- [ ] Domaine `linksmartec.com` enregistré et DNS pointés vers l'hébergeur
- [ ] HTTPS activé (cadenas visible dans le navigateur)
- [ ] `SESSION_SECRET` défini (longue chaîne aléatoire)
- [ ] `ADMIN_PASSWORD` défini, **et** mot de passe changé dans admin → *Sécurité*
- [ ] Site ouvert sur `https://www.linksmartec.com` : pages accueil et *À propos* OK
- [ ] Formulaire de contact testé → message visible dans admin → *Messages*
- [ ] Dossier `data` accessible en écriture (sinon les modifications ne s'enregistrent pas)
- [ ] Une **sauvegarde** effectuée (admin → *Stockage & sauvegarde* → *Exporter mes données*)
- [ ] Coordonnées vérifiées : téléphone, e-mail, adresse, RCCM

---

## 🔐 Sauvegarde et restauration

**Sauvegarder** — deux méthodes :

```bash
# A) Copie complète (recommandé) : tout est dans le dossier data
tar czf sauvegarde-linksmartec-$(date +%F).tar.gz data/            # version PHP
tar czf sauvegarde-linksmartec-node-$(date +%F).tar.gz node/data/  # version Node.js

# B) Depuis l'interface : admin → Stockage & sauvegarde → « Exporter mes données »
```

**Restaurer** — redéposez le dossier `data/` au même emplacement, puis redémarrez :

```bash
systemctl restart linksmartec        # sur VPS
# ou cliquez sur « Restart » dans cPanel / Render / Railway
```

Programmez une sauvegarde hebdomadaire (sur VPS) :

```bash
crontab -e
# tous les lundis à 3 h du matin
0 3 * * 1 tar czf /root/sauvegardes/linksmartec-$(date +\%F).tar.gz -C /var/www/linksmartec data/
```

---

## 🆘 En cas de problème

| Symptôme | Cause probable | Solution |
| --- | --- | --- |
| Page blanche / 502 | Le processus Node n'a pas démarré | Vérifiez les journaux (`journalctl -u linksmartec -n 50`), puis `cd node && node server.js` à la main pour voir l'erreur |
| Erreur 500 en PHP | Droits ou version de PHP | Vérifiez que `data/` est en `0755`, et consultez le journal d'erreurs de l'hébergeur (cPanel → *Errors*) |
| Les modifications ne s'enregistrent pas | Dossier `data` non accessible en écriture | `chown -R www-data:www-data /var/www/linksmartec/data` (VPS) ou permissions `0755` (cPanel) |
| Données perdues après un redéploiement | Pas de disque persistant | Ajoutez un disque (Render/Railway) ou passez au VPS, puis restaurez votre sauvegarde |
| Image trop lourde refusée | Limite de 4 Mo par image | Compressez l'image (`convert photo.jpg -resize 1200x -quality 82 photo.jpg`) |
| Le domaine affiche l'ancien site | DNS en cours de propagation | Patientez de 1 à 24 h, videz le cache du navigateur |
| Connexion admin impossible | Mot de passe perdu | Supprimez `data/security.json` (PHP) ou `node/data/security.json` (Node), rechargez : le compte `admin` / `linksmartech` est recréé (vous ne perdez que le mot de passe) |

---

## Pour aller plus loin

- Nouvelle **page Réalisations / Portfolio** : sur le modèle de la page *À propos*
- **Multilingue** (français / anglais / swahili) pour les partenaires internationaux
- **Statistiques** de visites et suivi des conversions du formulaire

Dites-moi ce que vous préférez et je le mets en place.
