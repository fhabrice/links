# Connecter « Travailler avec nous » à votre Google Form et Gmail

Ce guide explique comment faire en sorte que chaque candidature envoyée depuis le site :

1. **S'enregistre** sur le site (visible dans l'admin)
2. **Alimente automatiquement** votre Google Form → Google Sheets
3. **Vous notifie par e-mail** sur Gmail

---

## 1. Créer le Google Form

1. Allez sur https://forms.google.com → **Formulaire vierge**
2. Créez les questions suivantes (dans cet ordre recommandé) :

| Question Form | Type | Exemple |
|---|---|---|
| Civilité | Choix multiple | M. / Mme / Autre |
| Nom | Réponse courte (obligatoire) |  |
| Prénom | Réponse courte (obligatoire) |  |
| E-mail | Réponse courte (obligatoire) |  |
| Téléphone | Réponse courte |  |
| Ville / Pays | Réponse courte |  |
| Date de naissance | Date |  |
| Domaine / Pôle | Choix multiple | Génie Civil, Architecture & Design, Informatique, Énergie |
| Type de collaboration | Choix multiple | Emploi, Stage, Freelance, Partenariat |
| Expérience | Choix multiple | 0-1 an, 1-3 ans, etc. |
| Disponibilité | Choix multiple | Immédiate, 1 mois, etc. |
| Motivation / Message | Paragraphe (obligatoire) |  |
| Lien CV / Portfolio | Réponse courte |  |

3. Dans **Réponses** → cliquez sur l'icône Sheets → **Créer une feuille de calcul** (vous aurez ainsi toutes les candidatures dans un Google Sheets).

## 2. Récupérer l'URL de soumission (actionUrl)

Le formulaire doit être soumis en arrière-plan par le site. Vous avez besoin de l'URL spéciale `formResponse` :

1. Dans le Form, cliquez sur **Aperçu** (œil)
2. Faites clic droit → **Afficher la source** ou ouvrez les outils développeur (F12)
3. Cherchez `action="https://docs.google.com/forms/d/e/.../formResponse"`
   - Astuce simple : remplacez `/viewform` par `/formResponse` dans l'URL du formulaire.
   - Exemple :  
     - View : `https://docs.google.com/forms/d/e/1FAIpQLSdx.../viewform`  
     - Action : `https://docs.google.com/forms/d/e/1FAIpQLSdx.../formResponse`

Copiez cette URL : c'est votre **actionUrl**.

## 3. Récupérer les IDs `entry.XXXXXXX` (fieldMap)

Chaque question du Form possède un identifiant `entry.1234567890`. Le site doit les connaître pour envoyer chaque champ au bon endroit.

**Méthode la plus simple :**

1. Ouvrez l'aperçu du Form → F12 → onglet **Network**
2. Remplissez le formulaire une fois manuellement et envoyez
3. Dans Network, cherchez la requête `formResponse` → onglet **Payload** → vous verrez `entry.123456=valeur`
4. Notez chaque `entry.XXXX` ↔ question.

**Alternative (source HTML) :**

1. F12 → **Elements** → cherchez `name="entry.`
2. Chaque `<input name="entry.123456789">` correspond à une question (dans l'ordre du Form).

Créez le mapping, exemple :

```
nom              → entry.1111111111
prenom           → entry.2222222222
email            → entry.3333333333
telephone        → entry.4444444444
ville            → entry.5555555555
dateNaissance    → entry.6666666666
domaine          → entry.7777777777
typeCollaboration→ entry.8888888888
experience       → entry.9999999999
disponibilite    → entry.1010101010
message          → entry.1212121212
lienCv           → entry.1313131313
civilite         → entry.1414141414
```

## 4. Configurer le site

Deux façons :

### A. Via les fichiers (recommandé pour la première fois)

Éditez `app/defaults.json` → `contenu.travaillerAvecNous.googleForm` :

```json
"googleForm": {
  "actionUrl": "https://docs.google.com/forms/d/e/1FAIpQLS.../formResponse",
  "gmailDestination": "votre.email@gmail.com",
  "fieldMap": {
    "nom": "entry.1111111111",
    "prenom": "entry.2222222222",
    "email": "entry.3333333333",
    "telephone": "entry.4444444444",
    "ville": "entry.5555555555",
    "dateNaissance": "entry.6666666666",
    "domaine": "entry.7777777777",
    "typeCollaboration": "entry.8888888888",
    "experience": "entry.9999999999",
    "disponibilite": "entry.1010101010",
    "message": "entry.1212121212",
    "lienCv": "entry.1313131313",
    "civilite": "entry.1414141414"
  }
}
```

Puis copiez vers `lib/defaults-fallback.json` et `assets/data/site.json` (ou laissez l'admin synchroniser au prochain enregistrement).

### B. Via l'admin (à venir)

Dans `/admin` → **Candidatures** → **Configurer Google Form** (interface à compléter) : collez l'actionUrl et chaque entry ID.

## 5. Activer les notifications Gmail

C'est la partie qui fait arriver les données dans votre Gmail :

1. Dans Google Forms → **Réponses** → ⋮ → **Recevoir des notifications par e-mail pour les nouvelles réponses** → activez.
2. Ou, dans le Google Sheets lié → **Outils** → **Règles de notification** → **Ajouter une règle** : *À chaque fois qu'un utilisateur envoie un formulaire* → notifier `votre.email@gmail.com` immédiatement.

Vous recevrez désormais un e-mail à chaque candidature, avec toutes les données + lien vers la feuille.

**Astuce pro :** créez un filtre Gmail `from:(forms-receipts-noreply@google.com)` → label `LK-TECH / Candidatures` → jamais en spam.

## 6. Tester

1. Allez sur `https://votre-site.com/#travailler-avec-nous` ou `/travailler-avec-nous`
2. Remplissez le formulaire complet et envoyez
3. Vérifiez :
   - Admin du site → **Candidatures** → votre envoi apparaît
   - Google Sheets → nouvelle ligne
   - Gmail → notification reçue

Si le Google Form n'est pas encore configuré, le site conserve quand même la candidature localement et l'affiche dans l'admin — vous ne perdez rien.

## 7. Sécurité & RGPD

- Le formulaire affiche une case consentement obligatoire.
- Les données sont stockées sans limite de durée côté site (max 1000) et dans votre Google Sheets (votre propriété).
- Ne partagez pas l'actionUrl publiquement si vous craignez le spam : le site possède déjà une validation et un journal.

---

Besoin d'aide ? Ouvrez le fichier `app/defaults.json` et remplacez les `entry.` vides par vos vrais IDs : le transfert s'activera automatiquement au prochain déploiement (Vercel redéploie dès que vous poussez sur `main`).

