# Responsive et confidentialité de l’accès admin

## Affichage

La feuille `assets/css/responsive.css` est commune aux pages PHP et au layout Next.js. Elle est chargée après les styles existants :

- grilles et formulaires sur une colonne aux petits écrans ;
- en-têtes et boutons pouvant revenir à la ligne ;
- menus mobiles avec une hauteur limitée et défilement interne ;
- tableaux d’administration dans des régions défilantes accessibles au clavier ;
- champs et cibles tactiles adaptés au mobile, prise en compte de la barre d’action et de la zone de sécurité basse ;
- pas de masquage global des débordements pour cacher un problème de mise en page.

Les mises en page sont contrôlées à 320, 375, 768, 1024 et 1440 pixels sur les huit pages publiques PHP, la connexion PHP, les principales rubriques admin et les équivalents Next.js. Les API admin sont simulées **uniquement par les tests navigateur**.

## Accès administrateur

- Les champs de mot de passe/code restent de type `password` et ne sont pas préremplis.
- Le rappel public des identifiants de première connexion a été retiré de l’écran PHP.
- `reset-admin.php` renvoie une réponse vide HTTP 404 avant tout accès au stockage. Son usage est réservé à la ligne de commande ; il exige `ADMIN_PASSWORD` dans l’environnement (12 caractères minimum) et n’affiche jamais sa valeur. Il ne supprime plus le fichier des comptes après la réinitialisation.
- Aucun mot de passe existant n’est changé automatiquement par cette mise à jour. Puisque l’ancien mot de passe initial était affiché publiquement, le propriétaire doit le changer depuis **Sécurité** (PHP) ou **Réglages → Sécurité** (Next.js). Masquer un mot de passe n’annule pas une exposition passée.

## Vérifications

Avec Node.js 22 et les dépendances de développement :

```bash
npm install
npm run test:php
npm run test:logiciels
npm run build
npx playwright install --with-deps chromium
npm run test:responsive
```

Pour inclure les pages Next.js, démarrer le site (`npm run start:direct -- --hostname 0.0.0.0`) et lancer :

```bash
NEXT_TEST_URL=http://127.0.0.1:3000 npm run test:responsive
```

`CHROMIUM_PATH` permet d’utiliser un navigateur Chromium déjà installé. `RESPONSIVE_SCREENSHOTS` peut pointer vers un dossier local ignoré (par exemple `.tmp/captures`) pour conserver une capture mobile PHP. Les tests PHP exécutent le code dans un système de fichiers en mémoire, sans modifier les comptes, fichiers ou bases de production.

## Mise en ligne

Déployer les fichiers PHP modifiés avec `assets/css/responsive.css` et `reset-admin.php`, sans remplacer les données du site. Pour Next.js, reconstruire et redémarrer l’application. La mise en ligne n’est pas réalisée par ces modifications du dépôt.
