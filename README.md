# Linksmartech — site institutionnel &amp; e-commerce

Site web de **Linksmartech** (Goma, Nord-Kivu, RDC) : vitrine institutionnelle,
boutique en ligne, services, formulaire de contact et **espace d'administration complet**.

> ### 🔑 L'essentiel
> **Aucune base de données à configurer.** Le site et l'administration démarrent
> immédiatement, sans écran d'installation et **sans jamais demander de coordonnées MySQL**.
> Le contenu est enregistré automatiquement dans un stockage local (`data/`).

---

## 1. Démarrage

```bash
node server.js
```

| Adresse | Description |
| --- | --- |
| http://localhost:3000 | Site public |
| http://localhost:3000/admin | Espace d'administration |

**Identifiants par défaut :** `admin` / `linksmartech`
(à changer dès la première connexion, onglet **Sécurité**).

Node.js 18 ou supérieur est requis. Aucune commande `npm install` n'est nécessaire :
le projet ne dépend d'aucun paquet externe.

Pour changer le port : `PORT=8080 node server.js`.

---

## 2. Ce que l'on peut gérer depuis l'admin

| Onglet | Contenu modifiable |
| --- | --- |
| **Tableau de bord** | Statistiques, derniers messages reçus |
| **Identité & logo** | Nom, slogan, RCCM, ville, téléphones, e-mail, horaires, **logo**, couleurs de la marque, texte du pied de page |
| **Bannière d'accueil** | Les deux onglets du hero (produits nationaux / solutions internationales) et le produit mis en avant |
| **Produits** | Ajout, modification, masquage, suppression, **téléversement d'image**, prix, stock, badge, catégorie |
| **Services** | Les piliers d'expertise (titre, image, description), ajout et retrait |
| **Approche** | Les étapes de la méthode de travail |
| **Messages** | Boîte de réception du formulaire de contact (lu / non lu, réponse par e-mail, suppression) |
| **Réglages** | Devise, bouton « Portail Client », bandeau de maintenance |
| **Sécurité** | Changement du mot de passe d'administration |
| **Stockage & sauvegarde** | Mode de stockage actif, export JSON complet, réinitialisation du contenu |

Chaque enregistrement est immédiatement visible sur le site public.

---

## 3. Adapter le logo et l'identité visuelle

Deux méthodes, au choix :

1. **Depuis l'admin** (recommandé) — *Identité & logo* → téléversez votre logo
   (PNG, JPG, WEBP ou SVG, 4 Mo max). Il s'applique à l'en-tête, au pied de page et à l'admin.
2. **Par fichier** — remplacez `public/assets/img/logo.svg`
   (ainsi que `favicon.svg` pour l'onglet du navigateur).

Les couleurs principales se règlent aussi dans l'admin (sélecteurs de couleur) :
elles sont appliquées à tout le site via les variables CSS `--primaire` et `--accent`.

---

## 4. Où sont stockées les données ?

Le site choisit **tout seul**, dans cet ordre :

1. **Stockage local (par défaut, zéro configuration)** — dossier `data/` :
   - `content.json` — textes, produits, services
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

## 5. Sauvegarde

- **Export complet** : onglet *Stockage & sauvegarde* → *Exporter mes données (JSON)*.
- **Sauvegarde manuelle** : copiez le dossier `data/` (il contient tout).
- **Réinitialisation** : bouton *Réinitialiser le contenu* (les messages sont conservés).

---

## 6. Structure du projet

```
links/
├── server.js                  Serveur HTTP + routage (sans dépendance)
├── src/
│   ├── api.js                 API JSON (site public + administration)
│   ├── defaults.js            Contenu par défaut du site
│   ├── security.js            Hachage scrypt + sessions signées
│   └── store.js               Stockage auto-configuré (local / MySQL détecté)
├── public/
│   ├── index.html             Site public
│   ├── admin/                 Espace d'administration
│   ├── assets/css/styles.css  Design complet (aucun CDN)
│   ├── assets/js/site.js      Comportements du site (panier, contact…)
│   ├── assets/img/            Logos et visuels
│   └── data/site.json         Contenu statique de secours
├── config/                    Configuration MySQL optionnelle (exemple fourni)
├── tools/build-fallback.js    Regénère le contenu statique de secours
└── data/                      Données enregistrées automatiquement (non versionnées)
```

### Panier & commandes

Le panier est conservé dans le navigateur du visiteur (aucun compte à créer).
La commande se termine par un message WhatsApp pré-rempli envoyé au numéro
renseigné dans l'admin (*Identité & logo* → *Téléphone principal*).

---

## 7. Déploiement

**Hébergement Node.js (VPS, Render, Railway, cPanel Node…)**

```bash
git clone <votre-dépôt> && cd links
PORT=3000 node server.js
```

Pensez à définir `SESSION_SECRET` (chaîne aléatoire longue) et `ADMIN_PASSWORD`
pour un déploiement public, ainsi qu'un proxy HTTPS.

**Hébergement 100 % statique (sans Node)**
Le contenu de `public/` s'affiche seul, grâce à `public/data/site.json`
(régénérable avec `node tools/build-fallback.js`). Dans ce mode, le formulaire de
contact bascule automatiquement sur l'adresse e-mail de contact et l'admin n'est pas disponible.

---

## 8. Sécurité

- Mots de passe hachés en **scrypt** (jamais stockés en clair).
- Sessions signées HMAC, valables 12 h, cookie `HttpOnly` + `SameSite=Lax`.
- Limitation des tentatives de connexion (8 essais / 10 minutes).
- Échappement systématique des contenus affichés (protection XSS).
- L'espace admin est exclu de l'indexation (`noindex, nofollow`).

© 2026 Linksmartech — Goma, Nord-Kivu, RDC.
