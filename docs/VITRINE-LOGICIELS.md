# Vitrine des logiciels de l’accueil

## Modifier la sélection

- **Version Next.js** : ouvrir `/admin`, puis l’onglet **Logiciels**.
- **Version PHP / cPanel** : ouvrir `/admin/`, puis **Nos logiciels**.

Les noms, accroches, descriptions, fonctionnalités, badges, tarifs et états de publication sont modifiables. Une fiche peut donc être remplacée par un autre logiciel sans toucher au code. Les boutons de la vitrine dirigent les visiteurs vers le formulaire de contact.

Dans Next.js, utiliser **Modifier**, **Dépublier / Publier** ou **Supprimer**, puis enregistrer le formulaire lorsque nécessaire. Dans PHP, modifier les fiches, cocher ou décocher **Visible sur l’accueil**, ajouter ou retirer des logiciels, puis cliquer sur **Enregistrer la vitrine**. Actualiser ensuite l’accueil.

## SAFISAHA, LITO FINANCE et Youpendimmoselect

Ces trois fiches constituent le catalogue par défaut des nouvelles installations. Les fonctionnalités et tarifs n’ayant pas été fournis, leur présentation reste générale et le prix est affiché **Sur devis**. Compléter les fiches avec les informations validées avant de détailler les offres.

Sur une installation existante, l’ancien catalogue d’exemples (GomaGest, BatiSuivi, SolarWatch, EcoleSuivi) est actualisé automatiquement uniquement si toute la section est restée identique au modèle d’origine. Un catalogue personnalisé, vidé ou masqué est conservé. Pour utiliser cette sélection, cliquer sur **Charger les 3 logiciels LK-TECH** et confirmer le remplacement. Dans PHP, cliquer ensuite sur **Enregistrer la vitrine**. Cette opération remplace les fiches existantes : exporter le contenu au préalable si nécessaire.

- Un prix vide signifie **Sur devis** ; un prix de `0` reste un prix explicite.
- Les fiches masquées ne figurent pas dans la vitrine.
- Supprimer toutes les fiches affiche un message de contact ; les exemples ne réapparaissent pas automatiquement.
- Les modèles de départ sont dans `lib/logiciels-exemples.json` et doivent rester synchronisés avec `contenu.logiciels.items` dans `app/defaults.json`, `lib/defaults-fallback.json` et `assets/data/site.json`.

## Compatibilité PHP

La vitrine utilise le format partagé `logiciels.items`. L’ancien format `logiciels.liste` reste lisible ; l’éditeur PHP le convertit en `items` à l’enregistrement, en conservant notamment les anciennes accroches `resume` comme `pitch`.

## Pied de page

Les huit pages publiques PHP (accueil, à propos, recrutement, opportunités, connexion, inscription, vérification d’email et espace membre connecté) utilisent `app/partials/footer.php`. Les deux pages publiques Next.js utilisent `app/components/PiedDePage.js`. Chaque page conserve un seul pied de page, avec une invitation à contacter LK-TECH et un lien vers les collaborations, rendu sans dépendre de JavaScript. La description provient de `contenu.pied.description`, et les coordonnées de `contenu.identite`.

## Vérifications de cette modification

- Build de production : `npm run build`.
- Syntaxe JavaScript PHP-admin : `node --check assets/js/admin.js`.
- Tests DOM de l’admin PHP : ajout, retrait, remplacement, masquage, prix vide et confirmation du chargement des modèles.
- Test du formulaire React : sérialisation des champs, conservation d’un prix vide et dépublication.
- Tests HTTP Next.js : authentification requise, enregistrement et remplacement des fiches, masquage, catalogue vide, prix zéro / sur devis, validation des prix négatifs et noms vides, présence du pied de page et préservation des autres contenus.

### Tests de non-régression reproductibles

Avec Node.js 22 et les dépendances de développement installées (`npm install`) :

```bash
npm run test:php
npm run test:logiciels
npm run build
```

`test:php` exécute un vrai moteur PHP 8.3 via WebAssembly. Les fichiers du site sont copiés dans un système de fichiers en mémoire : les données locales, la base MySQL et les clés cloud ne sont pas utilisées. Le test vérifie les huit pages, l’authentification simulée de l’espace membre, les liens en sous-dossier, la présence des trois cartes de logiciels sans JavaScript, la mise à jour des anciens exemples et la préservation des personnalisations. Il échoue en cas d’erreur PHP ou de document tronqué avant le footer (notamment la régression de la fonction `e()` absente).

`test:logiciels` vérifie également les règles d’actualisation côté Node.js, sur un stockage temporaire isolé. Les tests ne remplacent pas une vérification de l’intégration MySQL/Apache sur l’hébergement cible.

### Mise en ligne du correctif PHP

Déployer les **sources actuelles** : les pages PHP, `app/helpers.php`, `app/Store.php`, le nouveau dossier `app/partials/`, les fichiers de catalogue dans `lib/` et `assets/data/site.json`. Ne pas réutiliser l’ancienne archive `linksmartec-cpanel.zip` sans la reconstruire : elle ne reflète pas automatiquement les changements du dépôt. Conserver le dossier `data/` et les réglages/identifiants existants sur l’hébergement.
