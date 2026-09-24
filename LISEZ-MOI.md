# LK-TECH — version PHP

Site complet (vitrine + boutique + administration) écrit en **PHP 8**, conçu pour
fonctionner sur **n'importe quel hébergement classique** : cPanel, Hostinger, OVH,
Namecheap, un serveur Apache ou Nginx… **Aucune base de données à configurer.**

Le site PHP **est à la racine du dépôt** : `index.php`, `a-propos.php`, `admin/`,
`api/`, `app/`, `assets/`. Le dossier `node/` contient une seconde version
équivalente (Node.js, pour un VPS) : il est inutile ici et **peut être supprimé**
de votre téléversement sans rien casser.

---

## Installation en 3 étapes

1. **Téléversez tout le contenu de ce dossier** dans votre espace web
   (souvent `public_html/`, `www/` ou `htdocs/`), via le gestionnaire de fichiers,
   FTP, ou l'outil *Git Version Control* de cPanel.
2. **Vérifiez que le dossier `data/` est accessible en écriture**
   (gestionnaire de fichiers → clic droit sur `data` → *Change Permissions* → `0755`).
3. Ouvrez votre domaine : le site s'affiche. L'administration est sur **`/admin`**
   (identifiants : `admin` / `linksmartech`, à changer immédiatement).

> **Recommandation** : définissez un mot de passe fort dès la première connexion,
> et évitez d'installer le site dans un sous-dossier avec des images déjà
> enregistrées (l'idéal est la racine du domaine, `public_html`).

---

## Contenu du dossier

| Élément | Rôle |
| --- | --- |
| `index.php` | Page d'accueil (bannière, spécialités, boutique, services, contact) |
| `a-propos.php` | Page « À propos » |
| `produit.php` | Fiches produit détaillées (`/produit/kit-solaire-hybride-5-kva`) |
| `admin/index.php` | Espace d'administration (interface complète) |
| `api/index.php` | API JSON (contenu, messages, produits, téléversements) |
| `app/` | Code de l'application (protégé, non accessible depuis le web) |
| `app/defaults.json` | Contenu par défaut du site (textes, produits, page À propos) |
| `assets/` | Design, JavaScript, logo et images |
| `uploads/` | Images téléversées depuis l'administration |
| `data/` | **Vos données** : contenu, messages, comptes (protégé) |
| `config/` | Configuration MySQL facultative |
| `.htaccess` | Adresses propres, sécurité, compression, mise en cache |
| `node/` | Version Node.js équivalente (facultative — supprimable en ligne) |

---

## Points clés

- **Aucune base de données obligatoire** : tout est enregistré dans `data/`
  (fichiers JSON). Si votre hébergeur fournit déjà MySQL, le site le détecte
  automatiquement via des variables d'environnement ou `config/database.php`.
- **Fiches produit** : chaque produit a sa page détaillée (`/produit/…`),
  avec galerie, description longue, caractéristiques techniques, produits
  similaires et commande WhatsApp directe. L'adresse est déduite du nom du
  produit ; le contenu se gère dans l'admin → *Produits*.
- **PHP 8.0 ou supérieur** requis (PHP 7.4 fonctionne également).
  Aucune extension particulière : les fonctions `json` et `hash` de base suffisent
  (`mbstring` est utilisé s'il est présent, sinon une solution de repli prend le relais).
- **Connexion à l'administration** : aucun `session_start()` n'est utilisé (cela
  provoque des erreurs sur certains hébergeurs). La session est un **cookie signé**
  (`lm_session`), valable 12 h, protégé par une clé secrète créée automatiquement
  dans `data/secret.key`. Pour imposer votre propre clé, ajoutez dans `.htaccess` :
  `SetEnv SESSION_SECRET "une-longue-chaine-aleatoire"`.
  Supprimer `data/secret.key` déconnecte simplement tout le monde.
- **Sauvegarde** : copiez le dossier `data/` (il contient tout), ou utilisez
  le bouton *Exporter mes données* dans l'administration.
- **Mot de passe oublié** : supprimez `data/security.json`, rechargez la page :
  le compte `admin` / `linksmartech` est recréé.

---

## Réglages utiles

**Changer le mot de passe initial** — dans `.htaccess` de la racine, ou via
l'interface d'administration (*Sécurité*). Pour le définir avant la première
connexion, ajoutez dans `.htaccess` :

```apache
SetEnv ADMIN_PASSWORD "votre-mot-de-passe-solide"
```

**Installer dans un sous-dossier** (ex. `www.linksmartec.com/boutique`) : le site
fonctionne tel quel, tous les liens s'adaptent. Pensez seulement à décommenter
`RewriteBase /boutique/` dans `.htaccess` et à adapter la ligne
`ErrorDocument 404 /index.php` en `ErrorDocument 404 /boutique/index.php`.

**Autoriser les images plus lourdes** — limite par défaut : 4 Mo.
Modifiez `upload_max_filesize` et `post_max_size` dans `php.ini` ou `.htaccess` :

```apache
php_value upload_max_filesize 8M
php_value post_max_size 10M
```

---

## Serveur Nginx *(si votre hébergeur n'utilise pas Apache)*

Les fichiers `.htaccess` sont alors ignorés : reprenez ces quelques lignes dans la
configuration du site (adaptez `php-fpm` et le chemin `root`).

```nginx
root /var/www/linksmartec;
index index.php;

# Adresses propres
location = /a-propos { rewrite ^ /a-propos.php last; }
location = /admin    { rewrite ^ /admin/index.php last; }
location ~ ^/produit/(?<slug>[\w.-]+)/?$ { rewrite ^ /produit.php?slug=$slug last; }
location /api/       { rewrite ^/api/(.*)$ /api/index.php last; }

# Données, code et configuration : jamais accessibles
location ~ ^/(app|data|config)/ { deny all; }
location ~ ^/uploads/.*\.(php|phtml|phar|cgi|pl|py|sh)$ { deny all; }

location / { try_files $uri $uri/ =404; }
location ~ \.php$ {
    include fastcgi_params;
    fastcgi_pass unix:/run/php/php8.3-fpm.sock;
}
```

---

## Passage à une base MySQL (facultatif)

1. Renommez `config/database.example.php` en `config/database.php`.
2. Renseignez l'hôte, l'utilisateur, le mot de passe et le nom de la base.
3. Rechargez : les tables `lm_documents`, `lm_messages` et `lm_journal` sont créées
   et remplies avec le contenu par défaut ; l'administration reste identique.

Si la base devient indisponible, le site continue de fonctionner sur le stockage
local, sans message d'erreur.

---

## Passer de la version Node.js à la version PHP

Vous pouvez réutiliser vos données : copiez le dossier `data/` de l'ancienne
version dans celui-ci, **puis supprimez `data/security.json`** (les mots de passe
sont hachés différemment) et reconnectez-vous avec `admin` / `linksmartech`.
Le contenu, les produits et les messages sont conservés.

---

© 2026 LK-TECH — www.linksmartec.com
