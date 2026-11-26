# Vitrine des logiciels de l’accueil

## Modifier la sélection

- **Version Next.js** : ouvrir `/admin`, puis l’onglet **Logiciels**.
- **Version PHP / cPanel** : ouvrir `/admin/`, puis **Nos logiciels**.

Les noms, accroches, descriptions, fonctionnalités, badges, tarifs et états de publication sont modifiables. Une fiche peut donc être remplacée par un autre logiciel sans toucher au code. Les boutons de la vitrine dirigent les visiteurs vers le formulaire de contact.

Dans Next.js, utiliser **Modifier**, **Dépublier / Publier** ou **Supprimer**, puis enregistrer le formulaire lorsque nécessaire. Dans PHP, modifier les fiches, cocher ou décocher **Visible sur l’accueil**, ajouter ou retirer des logiciels, puis cliquer sur **Enregistrer la vitrine**. Actualiser ensuite l’accueil.

## SAFISAHA, LITO FINANCE et Youpendimmoselect

Ces trois fiches constituent le catalogue par défaut des nouvelles installations. Les fonctionnalités et tarifs n’ayant pas été fournis, leur présentation reste générale et le prix est affiché **Sur devis**. Compléter les fiches avec les informations validées avant de détailler les offres.

Sur une installation disposant déjà d’un catalogue enregistré, celui-ci est conservé. Pour utiliser cette sélection, cliquer sur **Charger les 3 logiciels LK-TECH** et confirmer le remplacement. Dans PHP, cliquer ensuite sur **Enregistrer la vitrine**. Cette opération remplace les fiches existantes : exporter le contenu au préalable si nécessaire.

- Un prix vide signifie **Sur devis** ; un prix de `0` reste un prix explicite.
- Les fiches masquées ne figurent pas dans la vitrine.
- Supprimer toutes les fiches affiche un message de contact ; les exemples ne réapparaissent pas automatiquement.
- Les modèles de départ sont dans `lib/logiciels-exemples.json` et doivent rester synchronisés avec `contenu.logiciels.items` dans `app/defaults.json` et `lib/defaults-fallback.json`.

## Compatibilité PHP

La vitrine utilise le format partagé `logiciels.items`. L’ancien format `logiciels.liste` reste lisible ; l’éditeur PHP le convertit en `items` à l’enregistrement, en conservant notamment les anciennes accroches `resume` comme `pitch`.

## Pied de page

L’accueil conserve un seul pied de page, complété par une invitation à contacter LK-TECH et un lien vers les collaborations. La description provient de `contenu.pied.description`, et les coordonnées de `contenu.identite`.

## Vérifications de cette modification

- Build de production : `npm run build`.
- Syntaxe JavaScript PHP-admin : `node --check assets/js/admin.js`.
- Tests DOM de l’admin PHP : ajout, retrait, remplacement, masquage, prix vide et confirmation du chargement des modèles.
- Test du formulaire React : sérialisation des champs, conservation d’un prix vide et dépublication.
- Tests HTTP Next.js : authentification requise, enregistrement et remplacement des fiches, masquage, catalogue vide, prix zéro / sur devis, validation des prix négatifs et noms vides, présence du pied de page et préservation des autres contenus.

L’interpréteur PHP n’étant pas disponible dans l’environnement de développement, l’exécution serveur PHP doit encore être vérifiée sur l’hébergement cible, notamment l’enregistrement puis le rechargement d’un ancien catalogue au format `liste`.
