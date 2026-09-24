# LK-TECH — site institutionnel &amp; e-commerce

Site web de **LK-TECH** (Linksmartech, Goma, Nord-Kivu, RDC), spécialiste en
**informatique**, **construction** et **énergie renouvelable** : vitrine institutionnelle,
boutique en ligne, services, formulaire de contact et **espace d'administration complet**.

| | |
| --- | --- |
| 🌐 Site officiel | **[www.linksmartec.com](https://www.linksmartec.com)** |
| ✉️ E-mail | **[contact@linksmartec.com](mailto:contact@linksmartec.com)** |
| 📞 Téléphone | +243 976 459 970 |
| 📍 Adresse | Avenue du Lac, Goma, Nord-Kivu, RDC |

> ### 🔑 L'essentiel
> **Aucune base de données à configurer.** Le site et l'administration démarrent
> immédiatement, sans écran d'installation et **sans jamais demander de coordonnées MySQL**.
> Le contenu est enregistré automatiquement dans un stockage local (`data/`).

---

## 1. Démarrage

> **Deux versions équivalentes dans ce dépôt**
> | Version | Où | Pour qui |
> | --- | --- | --- |
> | **PHP 8** *(la version principale)* | **racine du dépôt** | hébergement mutualisé classique (cPanel, FTP) — *rien à installer* |
> | Node.js 18+ | dossier `node/` | serveur dédié, VPS, Render/Railway, Docker |
>
> Les deux servent **les mêmes pages, la même administration et la même API JSON**,
> et partagent le même contenu par défaut (`node/src/defaults.js` / `app/defaults.json`).
> Guide PHP : **`LISEZ-MOI.md`**.

### Version PHP (racine)

Téléversez le contenu du dépôt dans `public_html/` : c'est tout.
L'administration est sur `/admin` (`admin` / `linksmartech`).
Détail : **`LISEZ-MOI.md`**.

### Version Node.js

```bash
cd node
node server.js      # http://localhost:3000
```

| Adresse | Description |
| --- | --- |
| https://www.linksmartec.com | Site public (en production) |
| https://www.linksmartec.com/a-propos.html | Page « À propos » |
| https://www.linksmartec.com/admin | Espace d'administration |
| http://localhost:3000 | Site public (en local) |
| http://localhost:3000/a-propos | Page « À propos » (en local) |
| http://localhost:3000/admin | Administration (en local) |

**Identifiants par défaut :** `admin` / `linksmartech`
(à changer dès la première connexion, onglet **Sécurité**).

Node.js 18 ou supérieur est requis. Aucune commande `npm install` n'est nécessaire :
le projet ne dépend d'aucun paquet externe.

Pour changer le port : `PORT=8080 node node/server.js`.

---

## 2. Identité visuelle (logo LK-TECH)

Le logo est fourni en **vectoriel (SVG)**, donc net à toutes les tailles, sans fond blanc :

| Fichier | Usage |
| --- | --- |
| `public/assets/img/logo.svg` | Monogramme « lk » — en-tête, admin, favicon |
| `public/assets/img/logo-clair.svg` | Variante pour fonds sombres — pied de page |
| `public/assets/img/favicon.svg` | Icône de l'onglet du navigateur |
| `public/assets/img/logo-lk-tech.svg` | Logo complet (monogramme + LK-TECH + LINKS MARTECH) |
| `public/assets/img/logo-lk-tech-clair.svg` | Logo complet, variante fond sombre |

Charte reprise du logo : **bleu marine `#16233F`**, **vert `#2E9E5B`**, gris `#8A9099`.
Ces couleurs pilotent tout le site via les variables CSS `--primaire` et `--accent`.

Deux façons de les personnaliser :

1. **Depuis l'admin** — onglet *Identité & logo* : téléversez votre logo principal
   **et** sa variante claire, puis ajustez les deux couleurs.
   (PNG, JPG, WEBP ou SVG — 4 Mo max.)
2. **Par fichier** — remplacez simplement les SVG du tableau ci-dessus.

---

## 3. Les trois spécialités

Elles structurent toute la navigation et le contenu :

| Spécialité | Onglet de la bannière | Services associés |
| --- | --- | --- |
| **Informatique** | « Nous concevons vos systèmes d'information » | Développement logiciel & Web, Réseaux & Systèmes, Cybersécurité & Cloud |
| **Construction** | « Nous bâtissons des infrastructures durables » | Construction & BTP, Électricité & Réseaux |
| **Énergie renouvelable** | « L'énergie solaire pour tous » | Énergie solaire & renouvelable |

- La section **Spécialités** de la page d'accueil est cliquable : elle active l'onglet
  correspondant et le produit mis en avant dans la bannière.
- Si aucune marchandise n'est disponible pour une spécialité, la carte affiche une
  **demande d'étude technique** (modifiable dans l'admin → *Spécialités*).
- La boutique est filtrée par spécialité : *Tout · Informatique · Énergie renouvelable · Produits du terroir*.

---

## 4. La page « À propos »

Accessible depuis le menu (**À propos**) et à l'adresse `/a-propos`
(ou `/a-propos.html`). Elle présente l'entreprise en huit blocs :

1. **En-tête** — sur-titre, titre, sous-titre et fil d'Ariane ;
2. **Présentation** — trois paragraphes et une image de votre choix ;
3. **Chiffres clés** — expérience, projets livrés, pôles, satisfaction ;
4. **Les trois spécialités** — informatique, construction, énergie renouvelable ;
5. **Mission & vision** ;
6. **Valeurs** — intégrité, qualité, proximité, innovation ;
7. **Parcours** — une frise chronologique (2016 → 2024) ;
8. **Pourquoi nous choisir** + bandeau d'appel au devis.

Tout ce contenu se modifie dans l'admin, onglet **À propos** (ajout et retrait
d'éléments inclus). Les boutons de spécialité de cette page renvoient vers
l'accueil en activant l'onglet correspondant.

---

## 5. Ce que l'on peut gérer depuis l'admin

| Onglet | Contenu modifiable |
| --- | --- |
| **Tableau de bord** | Statistiques, derniers messages reçus |
| **Identité & logo** | Nom, slogan, RCCM, ville, téléphones, e-mail, **site web**, horaires, **logos (principal + clair)**, couleurs, texte du pied de page |
| **Bannière d'accueil** | Les trois onglets de spécialité et leur produit vedette |
| **Spécialités** | Les trois pôles d'expertise (titre, icône, texte) et la carte « demande d'étude » |
| **À propos** | Toute la page : présentation, image, mission, vision, chiffres, spécialités, valeurs, parcours, arguments et bandeau d'appel |
| **Produits** | Ajout, modification, masquage, suppression, **téléversement d'image**, prix, stock, badge, spécialité |
| **Services** | Les six prestations (titre, icône ou image, description) |
| **Approche** | Les étapes de la méthode de travail |
| **Messages** | Boîte de réception du formulaire de contact (lu / non lu, réponse, suppression) |
| **Réglages** | Devise, bouton « Devis gratuit », bandeau de maintenance |
| **Sécurité** | Changement du mot de passe d'administration |
| **Stockage & sauvegarde** | Mode de stockage actif, export JSON complet, réinitialisation du contenu |

Chaque enregistrement est immédiatement visible sur le site public.

---

## 6. Où sont stockées les données ?

Le site choisit **tout seul**, dans cet ordre :

1. **Stockage local (par défaut, zéro configuration)** — dossier `data/` :
   - `content.json` — textes, spécialités, produits, services
   - `settings.json` — réglages
   - `messages.json` — messages du formulaire
   - `security.json` — comptes admin (mots de passe hachés en scrypt)
   - `uploads/` — images téléversées depuis l'admin
   - `journal.json` — historique des actions

2. **MySQL, uniquement s'il est déjà fourni par l'hébergeur.**
   Le site le détecte *automatiquement* si les variables d'environnement
   `MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE` existent
   (ou si un fichier `config/database.json` est présent — voir `config/database.example.json`).
   Les tables nécessaires sont créées et remplies sans aucune intervention.
   En cas d'indisponibilité, le site bascule sans erreur sur le stockage local.

**Il n'existe donc plus aucun formulaire réclamant des coordonnées MySQL.**

---

## 7. Images

Toutes les images du site sont **hébergées localement** dans `public/assets/img/`
(produits, chantier, logo) : le site s'affiche correctement même avec une connexion
faible ou un CDN inaccessible. Les visuels de produits sont des images d'illustration —
remplacez-les par vos photos réelles depuis l'admin (*Produits* → téléverser une image).

Une image manquante est automatiquement remplacée par un visuel aux couleurs de la marque.

---

## 8. Sauvegarde

- **Export complet** : onglet *Stockage & sauvegarde* → *Exporter mes données (JSON)*.
- **Sauvegarde manuelle** : copiez le dossier `data/` (il contient tout).
- **Réinitialisation** : bouton *Réinitialiser le contenu* (les messages sont conservés).

---

## 9. Structure du projet

```
links/
├── index.php                  ⬅︎ VERSION PHP (hébergement classique) — accueil
├── a-propos.php               Page « À propos »
├── admin/                     Espace d'administration
├── api/                       API JSON
├── app/                       Code de l'application + contenu par défaut (protégé)
├── assets/                    Design, JavaScript, logo, images, contenu de secours
├── data/ · uploads/           Données et images (créés automatiquement, protégés)
├── config/                    Configuration MySQL optionnelle (exemple fourni)
├── .htaccess                  Adresses propres, sécurité, cache (Apache)
├── LISEZ-MOI.md               Mode d'emploi PHP (3 étapes)
├── node/                      Version Node.js (serveur dédié / VPS)
│   ├── server.js              Serveur HTTP + routage (sans dépendance)
│   ├── src/                   API JSON, contenu par défaut, hachage, stockage
│   ├── public/                Pages HTML, design, JavaScript, images
│   ├── deploy/                Fichiers prêts à l'emploi : systemd, Nginx, cPanel
│   └── data/ · config/        Données et configuration MySQL (non versionnées)
├── tools/build-fallback.js    Regénère le contenu statique de secours (2 versions)
├── Dockerfile · Procfile · render.yaml    Déploiement Node (Docker, Railway, Render)
├── DEPLOIEMENT.md             Guide d'hébergement pas-à-pas
└── README.md                  Ce fichier
```

### Panier & commandes

Le panier est conservé dans le navigateur du visiteur (aucun compte à créer).
La commande se termine par un message WhatsApp pré-rempli envoyé au numéro
renseigné dans l'admin (*Identité & logo* → *Téléphone principal*).

---

## 10. Déploiement — hébergement

> 📘 **Guide pas-à-pas complet : [DEPLOIEMENT.md](DEPLOIEMENT.md)**
> Il couvre quatre scénarios (mutualisé cPanel, VPS, Render/Railway, site statique),
> les enregistrements DNS, HTTPS, la sauvegarde et les dépannages courants.

Les fichiers de déploiement sont déjà fournis dans le dépôt :

| Fichier | Pour quel hébergement |
| --- | --- |
| `render.yaml` | Render (déploiement en un clic, disque persistant et nom de domaine pré-remplis) |
| `Procfile` | Railway, Heroku et compatibles |
| `Dockerfile` | Docker, Fly.io, Koyeb, VPS, Kubernetes… |
| `deploy/linksmartec.service` | Service systemd (VPS Linux : démarrage automatique) |
| `deploy/nginx-linksmartec.conf` | Nginx + HTTPS Let's Encrypt (VPS) |
| `deploy/cpanel-passenger.txt` | Hébergement mutualisé cPanel avec Node.js |



**Hébergement Node.js (VPS, Render, Railway, cPanel Node…)**

```bash
git clone <votre-dépôt> && cd links/node
PORT=3000 node server.js
```

Pensez à définir `SESSION_SECRET` (chaîne aléatoire longue) et `ADMIN_PASSWORD`
pour un déploiement public, ainsi qu'un proxy HTTPS.

Le domaine **www.linksmartec.com** est déjà renseigné dans le site :
balise `canonical`, `og:url`, `robots.txt`, `sitemap.xml` et données structurées
`LocalBusiness` (nom, e-mail, téléphone, spécialités) pour les moteurs de recherche.

**Hébergement 100 % statique (sans Node)**
Le contenu de `public/` s'affiche seul, grâce à `public/data/site.json`
(régénérable avec `node tools/build-fallback.js`). Dans ce mode, le formulaire de
contact bascule automatiquement sur l'adresse e-mail de contact et l'admin n'est pas disponible.

---

## 11. Sécurité

- Mots de passe hachés en **scrypt** (jamais stockés en clair).
- Sessions signées HMAC, valables 12 h, cookie `HttpOnly` + `SameSite=Lax`.
- Limitation des tentatives de connexion (8 essais / 10 minutes).
- Échappement systématique des contenus affichés (protection XSS).
- L'espace admin est exclu de l'indexation (`noindex, nofollow`).

© 2026 LK-TECH — Goma, Nord-Kivu, RDC.
