# Mettre le site LK-TECH en ligne

Ce guide couvre les quatre façons d'héberger le site, de la plus simple à la plus
complète. Choisissez **une seule** option selon votre budget et vos compétences.

> **Rappel important** : le site n'utilise aucune base de données obligatoire.
> Il n'y a **rien à installer ni à configurer** : on copie les fichiers, on lance
> `node server.js`, et c'est en ligne.

---

## ⚡ Avant tout : ce que vous devez savoir

| Point | À retenir |
| --- | --- |
| **Le domaine** | Enregistrez `linksmartec.com` chez un registraire (Namecheap, OVH, Google Domains, ou un prestataire local) puis faites pointer son DNS vers votre hébergeur. |
| **Les données** | Le contenu (textes, produits, messages) est enregistré dans le dossier `data/`. **Il doit donc être conservé entre deux redémarrages.** Chaque option ci-dessous explique comment. |
| **Le mot de passe admin** | Par défaut : `admin` / `linksmartech`. Changez-le dès la mise en ligne (admin → *Sécurité*) **et** en définissant `ADMIN_PASSWORD`. |
| **HTTPS** | Indispensable. Toutes les options ci-dessous permettent le certificat gratuit (Let's Encrypt / AutoSSL). |
| **Coût** | De 0 € (offres gratuites, avec limites) à ~5 €/mois (VPS ou mutualisé). |

---

## Option 1 — Hébergement mutualisé cPanel *(le plus simple)*

**Pour qui ?** Vous avez déjà un hébergement web classique (Hostinger, Namecheap, OVH,
un hébergeur local…). C'est l'option la plus courante et la moins chère.

**Prérequis :** que votre hébergeur propose « **Setup Node.js App** » (Phusion Passenger).

1. Dans cPanel, ouvrez **Setup Node.js App** → *Create Application*
   - **Node.js version** : 18 ou 20
   - **Application root** : `linksmartec`
   - **Application URL** : `linksmartec.com` (ou `www.linksmartec.com`)
   - **Application startup file** : `server.js`
2. Téléversez tout le contenu du dépôt dans le dossier `linksmartec`
   (Gestionnaire de fichiers, FTP, ou *Git Version Control* de cPanel).
3. Cliquez sur **Run NPM Install** (même sans dépendance : cPanel prépare l'environnement).
4. Onglet **Environment variables**, ajoutez :
   - `SESSION_SECRET` = une longue chaîne aléatoire
   - `ADMIN_PASSWORD` = votre mot de passe
5. **Restart** → le site est en ligne.
6. Onglet **SSL/TLS Status** → **Run AutoSSL** (HTTPS gratuit).

📄 Un modèle de `.htaccess` et la procédure détaillée : `deploy/cpanel-passenger.txt`

> ⚠️ Vérifiez que le dossier `data` est accessible en écriture
> (Gestionnaire de fichiers → clic droit sur `data` → *Change Permissions* → `0755`).

**Coût :** souvent déjà inclus dans votre hébergement mutualisé.

---

## Option 2 — VPS *(recommandé pour la production)*

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
cat > .env <<'EOF'
SESSION_SECRET=remplacez-par-une-longue-chaine-aleatoire
ADMIN_PASSWORD=votre-mot-de-passe-admin
PORT=3000
EOF

# 5) Créer le dossier de données accessible en écriture
mkdir -p data/uploads && chown -R www-data:www-data /var/www/linksmartec

# 6) Installer le service (démarrage automatique + redémarrage en cas de plantage)
cp deploy/linksmartec.service /etc/systemd/system/
systemctl daemon-reload && systemctl enable --now linksmartec
systemctl status linksmartec     # doit afficher « active (running) »

# 7) Configurer Nginx (nom de domaine → site)
cp deploy/nginx-linksmartec.conf /etc/nginx/sites-available/linksmartec
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

## Option 3 — Plateforme managée (Render, Railway, Koyeb…)

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
2. Railway détecte Node.js et utilise `Procfile` (`web: node server.js`).
3. **Settings → Volumes** → ajoutez un volume monté sur `/app/data`
   (indispensable pour conserver vos données).
4. **Variables** : `SESSION_SECRET`, `ADMIN_PASSWORD`.
5. **Settings → Networking → Custom Domain** → `www.linksmartec.com`.

**Coût :** offre gratuite limitée, puis ~5 $/mois.

---

## Option 4 — Base MySQL fournie par l'hébergeur *(facultatif)*

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

## Option 5 — Site 100 % statique *(sans admin)*

**Pour qui ?** Vous ne voulez qu'une vitrine en ligne, sans administration ni formulaire
enregistré côté serveur. Fonctionne sur **Netlify, Vercel, GitHub Pages ou tout espace
d'hébergement statique**.

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

## Comparatif rapide

| | Coût | Difficulté | Admin en ligne | Données conservées |
| --- | --- | --- | --- | --- |
| **1. cPanel mutualisé** | inclus | ⭐ facile | ✅ | ✅ (disque du serveur) |
| **2. VPS** | 4–8 €/mois | ⭐⭐⭐ technique | ✅ | ✅ (disque du serveur) |
| **3. Render / Railway** | 0–5 $/mois | ⭐⭐ simple | ✅ | ⚠️ avec disque persistant |
| **4. + MySQL** | selon hébergeur | ⭐ facile | ✅ | ✅ |
| **5. Statique** | 0 € | ⭐ facile | ❌ | — |

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
tar czf sauvegarde-linksmartec-$(date +%F).tar.gz data/

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
| Page blanche / 502 | Le processus Node n'a pas démarré | Vérifiez les journaux (`journalctl -u linksmartec -n 50`), puis `node server.js` à la main pour voir l'erreur |
| Les modifications ne s'enregistrent pas | Dossier `data` non accessible en écriture | `chown -R www-data:www-data /var/www/linksmartec/data` (VPS) ou permissions `0755` (cPanel) |
| Données perdues après un redéploiement | Pas de disque persistant | Ajoutez un disque (Render/Railway) ou passez au VPS, puis restaurez votre sauvegarde |
| Image trop lourde refusée | Limite de 4 Mo par image | Compressez l'image (`convert photo.jpg -resize 1200x -quality 82 photo.jpg`) |
| Le domaine affiche l'ancien site | DNS en cours de propagation | Patientez de 1 à 24 h, videz le cache du navigateur |
| Connexion admin impossible | Mot de passe perdu | Supprimez `data/security.json` puis redémarrez : le compte `admin` / `linksmartech` est recréé (vous ne perdez que le mot de passe) |

---

## Pour aller plus loin

- Nouvelle **page Réalisations / Portfolio** : sur le modèle de la page *À propos*
- **Multilingue** (français / anglais / swahili) pour les partenaires internationaux
- **Statistiques** de visites et suivi des conversions du formulaire

Dites-moi ce que vous préférez et je le mets en place.
