'use strict';

/**
 * Contenu par défaut du site Linkstech.
 *
 * Trois spécialités structurent tout le site :
 *   1. Informatique & digital
 *   2. Construction & BTP
 *   3. Énergie renouvelable
 *
 * Ces valeurs sont copiées dans le stockage (JSON local ou MySQL détecté)
 * au premier démarrage, puis c'est l'admin qui fait foi.
 */

const CONTENU_DEFAUT = {
  "identite": {
    "nom": "Linkstech",
    "nomComplet": "Linkstech",
    "nomLong": "Linkstech",
    "slogan": "Construire. Digitaliser. Impacter.",
    "rccm": "CD-GOM-01-2024-A-002698",
    "ville": "RDC · Kenya · Canada",
    "telephone": "+243 976 459 970",
    "telephoneSecondaire": "",
    "email": "contact@linksmartec.com",
    "siteWeb": "www.linksmartec.com",
    "logo": "/assets/img/logo.svg",
    "logoClair": "/assets/img/logo-clair.svg",
    "favicon": "/assets/img/favicon.svg",
    "couleurPrimaire": "#16233F",
    "couleurAccent": "#2E9E5B",
    "reseaux": [
      {
        "nom": "Facebook",
        "url": "https://facebook.com"
      },
      {
        "nom": "LinkedIn",
        "url": "https://linkedin.com"
      },
      {
        "nom": "WhatsApp",
        "url": "https://wa.me/243976459970"
      }
    ]
  },
  "hero": {
    "actif": "connexions",
    "onglets": [
      {
        "id": "connexions",
        "libelle": "Connexions & marchés",
        "badge": "Notre promesse",
        "titre": "Nous connectons",
        "titreAccent": "services et marchés",
        "description": "Basée en RDC, au Kenya et au Canada, Linkstech développe des solutions de construction et de technologie et facilite les connexions commerciales à l'échelle internationale.",
        "boutonTexte": "Être mis en relation",
        "boutonLien": "#contact"
      },
      {
        "id": "construction",
        "libelle": "Construction",
        "badge": "01 · Construction",
        "titre": "Nous construisons des",
        "titreAccent": "ouvrages durables",
        "description": "Étude, conception, planification et réalisation de projets de construction en RDC et à l'international : qualité, normes et durabilité au cœur de chaque chantier.",
        "boutonTexte": "Voir nos réalisations",
        "boutonLien": "#realisations"
      },
      {
        "id": "informatique",
        "libelle": "Technologie",
        "badge": "02 · Technologie",
        "titre": "Nous développons des",
        "titreAccent": "solutions sur mesure",
        "description": "Applications web, plateformes métiers, systèmes de gestion et outils digitaux pour simplifier les opérations et accélérer la croissance.",
        "boutonTexte": "Discuter de votre projet",
        "boutonLien": "#contact"
      },
      {
        "id": "energie",
        "libelle": "Énergie",
        "badge": "Énergies renouvelables",
        "titre": "Une énergie propre",
        "titreAccent": "au service de vos projets",
        "description": "Énergie solaire, stockage, éclairage intelligent et optimisation de la consommation pour les entreprises, les institutions et les communautés.",
        "boutonTexte": "Parler de votre projet énergétique",
        "boutonLien": "#contact"
      }
    ]
  },
  "specialites": [
    {
      "id": "construction",
      "icone": "btp",
      "titre": "Construction & Génie civil",
      "texte": "Étude, conception et réalisation de projets de construction, avec une attention constante à la qualité, aux normes et à la durabilité."
    },
    {
      "id": "informatique",
      "icone": "code",
      "titre": "Solutions informatiques",
      "texte": "Applications web, plateformes métiers et outils digitaux sur mesure pour simplifier les opérations et accélérer la croissance."
    },
    {
      "id": "energie",
      "icone": "solaire",
      "titre": "Énergies renouvelables",
      "texte": "Solaire, stockage et efficacité énergétique : des solutions durables pour les entreprises, les institutions et les communautés."
    },
    {
      "id": "connexions",
      "icone": "reseau",
      "titre": "Connexions & marchés",
      "texte": "Passerelle entre services, clients, partenaires, bailleurs et marchés : nous créons les connexions qui font avancer les projets."
    }
  ],
  "services": [
    {
      "titre": "Construction & Génie civil",
      "icone": "btp",
      "image": "",
      "description": "Étude, conception, planification et réalisation de projets de construction en RDC et à l'international, avec une attention constante à la qualité, aux normes et à la durabilité."
    },
    {
      "titre": "Solutions informatiques",
      "icone": "code",
      "image": "",
      "description": "Applications web, plateformes métiers, systèmes de gestion et outils digitaux sur mesure pour simplifier les opérations et accélérer la croissance."
    },
    {
      "titre": "Études & accompagnement",
      "icone": "qualite",
      "image": "",
      "description": "Analyse des besoins, études techniques, plans, estimation et suivi de projet : nous sécurisons chaque décision avant et pendant l'exécution."
    },
    {
      "titre": "Digitalisation d'entreprise",
      "icone": "cloud",
      "image": "",
      "description": "Conseil, automatisation et déploiement de solutions adaptées pour rendre les organisations plus efficaces, connectées et performantes."
    },
    {
      "titre": "Connexion aux marchés & services",
      "icone": "reseau",
      "image": "",
      "description": "Passerelle commerciale : nous aidons les clients à trouver les services adaptés et rapprochons les entreprises des marchés, partenaires et opportunités dont elles ont besoin."
    },
    {
      "titre": "ONG, associations & bailleurs de fonds",
      "icone": "integrite",
      "image": "",
      "description": "Nous rapprochons les ONG et associations des bailleurs de fonds, partenaires techniques et opportunités de financement, en structurant les besoins et en valorisant les projets."
    },
    {
      "titre": "Outils de suivi & réalisation",
      "icone": "defaut",
      "image": "",
      "description": "Des outils numériques utiles pour planifier les activités, suivre les indicateurs, documenter les résultats et améliorer la réalisation des projets sur le terrain."
    },
    {
      "titre": "Encadrement & formation",
      "icone": "proximite",
      "image": "",
      "description": "Nous encadrons et formons les équipes à l'utilisation des outils, à la gestion opérationnelle et aux bonnes pratiques pour des projets performants et durables."
    },
    {
      "titre": "Création d'entreprises & startups",
      "icone": "innovation",
      "image": "",
      "description": "De l'idée au lancement : structuration du projet, modèle d'affaires, identité, outils technologiques et connexion aux partenaires capables d'accélérer la réussite."
    }
  ],
  "approche": {
    "titre": "Notre Approche",
    "sousTitre": "Une méthode éprouvée, du diagnostic à la pérennisation",
    "etapes": [
      {
        "numero": "01",
        "titre": "Diagnostic",
        "description": "Audit du besoin, visite du site et analyse technique."
      },
      {
        "numero": "02",
        "titre": "Conception",
        "description": "Devis détaillé, plans et choix du matériel adapté."
      },
      {
        "numero": "03",
        "titre": "Réalisation",
        "description": "Mise en œuvre par nos équipes, dans le respect des délais."
      },
      {
        "numero": "04",
        "titre": "Accompagnement",
        "description": "Formation, maintenance et suivi après livraison."
      }
    ]
  },
  "produits": [
    {
      "id": "p-ordinateur-pro",
      "nom": "Ordinateur portable professionnel",
      "description": "Core i5 / 16 Go / SSD 512 Go — configuré et garanti 1 an.",
      "descriptionLongue": "Un portable pensé pour durer dans les conditions réelles des bureaux et des chantiers congolais : châssis renforcé, clavier résistant aux poussières et batterie longue autonomie pour travailler même lors des coupures de courant.\nChaque machine est configurée, testée et mise à jour par nos techniciens avant la livraison : suite bureautique, outils de sécurité et sauvegarde prêts à l'emploi.\nVous bénéficiez d'un an de garantie assurée localement par Linkstech, avec prêt de matériel possible pendant la réparation.",
      "specifications": [
        {
          "label": "Processeur",
          "valeur": "Intel Core i5 — 12e génération"
        },
        {
          "label": "Mémoire vive",
          "valeur": "16 Go DDR4"
        },
        {
          "label": "Stockage",
          "valeur": "SSD NVMe 512 Go"
        },
        {
          "label": "Écran",
          "valeur": "15,6\" Full HD antireflet"
        },
        {
          "label": "Système",
          "valeur": "Windows 11 Pro + suite bureautique"
        },
        {
          "label": "Garantie",
          "valeur": "12 mois pièces et main-d'œuvre"
        }
      ],
      "images": [],
      "prix": 780,
      "devise": "USD",
      "filtre": "informatique",
      "categorie": "intl",
      "badge": "Best-seller",
      "image": "/assets/img/produits/ordinateur.jpg",
      "stock": 12,
      "actif": true
    },
    {
      "id": "p-serveur-rack",
      "nom": "Serveur Rack Edge Pro",
      "description": "Haute performance pour déploiement réseau et virtualisation.",
      "descriptionLongue": "Un serveur rack 1U conçu pour la virtualisation, les bases de données et les services réseau exigeants. Idéal pour les entreprises, ONG et institutions qui hébergent leurs propres outils.\nNos ingénieurs assurent l'installation en rack, la configuration RAID, la mise en réseau et la supervision. Une offre de maintenance mensuelle est disponible pour garantir la disponibilité de vos services.",
      "specifications": [
        {
          "label": "Processeur",
          "valeur": "Intel Xeon E-2300 (6 cœurs)"
        },
        {
          "label": "Mémoire vive",
          "valeur": "32 Go ECC"
        },
        {
          "label": "Stockage",
          "valeur": "2 × 2 To en RAID 1"
        },
        {
          "label": "Alimentation",
          "valeur": "Redondante 500 W"
        },
        {
          "label": "Format",
          "valeur": "Rack 1U"
        },
        {
          "label": "Installation",
          "valeur": "Configuration et mise en service comprises"
        }
      ],
      "images": [],
      "prix": 1450,
      "devise": "USD",
      "filtre": "informatique",
      "categorie": "intl",
      "badge": "Sur commande",
      "image": "/assets/img/produits/serveur.jpg",
      "stock": 5,
      "actif": true
    },
    {
      "id": "p-kit-solaire",
      "nom": "Kit solaire hybride 5 kVA",
      "description": "Onduleur hybride, panneaux et batteries lithium pour un foyer ou un petit commerce.",
      "descriptionLongue": "Un kit complet pour produire et stocker votre propre électricité : onduleur hybride 5 kVA, huit panneaux monocristallins de 450 W et batterie lithium LiFePO4 de 5 kWh.\nLe dimensionnement est adapté à un foyer ou un petit commerce : éclairage, télévision, réfrigérateur, informatique et pompage ponctuel. Nos équipes réalisent l'étude de votre consommation, l'installation et la formation à l'usage.\nSuivi et maintenance préventive assurés partout dans le Nord-Kivu.",
      "specifications": [
        {
          "label": "Onduleur",
          "valeur": "Hybride 5 kVA avec régulateur MPPT"
        },
        {
          "label": "Panneaux",
          "valeur": "8 × 450 Wc monocristallins"
        },
        {
          "label": "Batteries",
          "valeur": "Lithium LiFePO4 — 5 kWh"
        },
        {
          "label": "Autonomie",
          "valeur": "8 à 12 h selon la consommation"
        },
        {
          "label": "Garantie",
          "valeur": "5 ans (onduleur) · 10 ans (batteries)"
        },
        {
          "label": "Installation",
          "valeur": "Posée par nos équipes, formation incluse"
        }
      ],
      "images": [
        "/assets/img/produits/panneau-solaire.jpg"
      ],
      "prix": 3200,
      "devise": "USD",
      "filtre": "energie",
      "categorie": "intl",
      "badge": "Populaire",
      "image": "/assets/img/produits/kit-solaire.jpg",
      "stock": 8,
      "actif": true
    },
    {
      "id": "p-panneau-solaire",
      "nom": "Panneau solaire 450 W",
      "description": "Monocristallin haute rendement, garantie 12 ans, pose comprise.",
      "descriptionLongue": "Un panneau monocristallin haute performance, idéal pour compléter une installation existante ou démarrer un petit système solaire.\nVendu avec sa structure de montage et ses câbles ; la pose est réalisée par nos techniciens à Goma et dans tout le Nord-Kivu.",
      "specifications": [
        {
          "label": "Technologie",
          "valeur": "Monocristallin PERC"
        },
        {
          "label": "Puissance",
          "valeur": "450 Wc"
        },
        {
          "label": "Rendement",
          "valeur": "21,3 %"
        },
        {
          "label": "Garantie",
          "valeur": "12 ans produit · 25 ans performance"
        },
        {
          "label": "Pose",
          "valeur": "Comprise (Goma et Nord-Kivu)"
        }
      ],
      "images": [
        "/assets/img/produits/kit-solaire.jpg"
      ],
      "prix": 185,
      "devise": "USD",
      "filtre": "energie",
      "categorie": "intl",
      "badge": "",
      "image": "/assets/img/produits/panneau-solaire.jpg",
      "stock": 60,
      "actif": true
    },
    {
      "id": "p-vsat",
      "nom": "Terminal satellite VSAT",
      "description": "Connectivité haut débit pour les sites isolés et les chantiers.",
      "descriptionLongue": "Une liaison satellite haute performance pour les sites non desservis par la fibre ou les réseaux mobiles : chantiers, mines, missions, ONG et établissements isolés.\nLe terminal comprend l'antenne, le modem et l'installation complète. Bande passante garantie, adresse IP fixe et accompagnement technique par nos ingénieurs réseau.",
      "specifications": [
        {
          "label": "Débit",
          "valeur": "Jusqu'à 50 Mb/s en réception"
        },
        {
          "label": "Antenne",
          "valeur": "Parabole 1,2 m stabilisée"
        },
        {
          "label": "Modem",
          "valeur": "Bi-bande Ka/Ku"
        },
        {
          "label": "Adresse IP",
          "valeur": "Fixe, option réseau privé virtuel"
        },
        {
          "label": "Installation",
          "valeur": "Comprise, avec formation des équipes"
        }
      ],
      "images": [],
      "prix": 890,
      "devise": "USD",
      "filtre": "informatique",
      "categorie": "intl",
      "badge": "Nouveau",
      "image": "/assets/img/produits/satellite.jpg",
      "stock": 6,
      "actif": true
    },
    {
      "id": "p-miel-turunga",
      "nom": "Miel pur de Turunga",
      "description": "Récolté artisanalement dans le Nord-Kivu, non pasteurisé.",
      "descriptionLongue": "Un miel brut récolté par les apiculteurs du groupement de Turunga, au pied des collines du Nord-Kivu. Non chauffé et non filtré, il conserve tous ses arômes et ses propriétés.\nConditionné en pot d'un kilogramme. Chaque achat soutient directement les coopératives locales.",
      "specifications": [
        {
          "label": "Origine",
          "valeur": "Turunga, Nord-Kivu, RDC"
        },
        {
          "label": "Conditionnement",
          "valeur": "Pot d'1 kg"
        },
        {
          "label": "Traitement",
          "valeur": "Brut — non pasteurisé"
        },
        {
          "label": "Producteurs",
          "valeur": "Coopérative apicole locale"
        }
      ],
      "images": [],
      "prix": 15,
      "devise": "USD",
      "filtre": "terroir",
      "categorie": "local",
      "badge": "",
      "image": "/assets/img/produits/miel.jpg",
      "stock": 42,
      "actif": true
    },
    {
      "id": "p-cafe-kivu",
      "nom": "Café arabica du Kivu",
      "description": "Grains torréfiés, 1 kg, traçabilité complète.",
      "descriptionLongue": "Un arabica de haute altitude cultivé sur les sols volcaniques du Kivu, torréfié artisanalement à Goma. Notes de fruits rouges et de cacao, acidité vive et équilibrée.\nLes grains sont issus de coopératives partenaires avec une traçabilité complète, de la parcelle au sachet d'un kilogramme.",
      "specifications": [
        {
          "label": "Variété",
          "valeur": "Arabica — Bourbon & Katimor"
        },
        {
          "label": "Altitude",
          "valeur": "1 500 – 1 900 m"
        },
        {
          "label": "Torréfaction",
          "valeur": "Artisanale, moyenne"
        },
        {
          "label": "Conditionnement",
          "valeur": "Sachet 1 kg, grains entiers"
        },
        {
          "label": "Traçabilité",
          "valeur": "Coopérative identifiée"
        }
      ],
      "images": [],
      "prix": 22,
      "devise": "USD",
      "filtre": "terroir",
      "categorie": "local",
      "badge": "",
      "image": "/assets/img/produits/cafe.jpg",
      "stock": 30,
      "actif": true
    },
    {
      "id": "p-the-bukavu",
      "nom": "Thé vert de Bukavu",
      "description": "Feuilles sélectionnées, séchage lent, sachet de 500 g.",
      "descriptionLongue": "Un thé vert cueilli à la main sur les hauteurs de Bukavu, au sud du Kivu. Séchage lent à faible température pour préserver les notes végétales et la fraîcheur en tasse.\nSachet de 500 g, récolte de la saison.",
      "specifications": [
        {
          "label": "Type",
          "valeur": "Thé vert, feuilles entières"
        },
        {
          "label": "Origine",
          "valeur": "Bukavu, Sud-Kivu, RDC"
        },
        {
          "label": "Séchage",
          "valeur": "Lent, basse température"
        },
        {
          "label": "Conditionnement",
          "valeur": "Sachet de 500 g"
        }
      ],
      "images": [],
      "prix": 12,
      "devise": "USD",
      "filtre": "terroir",
      "categorie": "local",
      "badge": "",
      "image": "/assets/img/produits/the.jpg",
      "stock": 25,
      "actif": true
    }
  ],
  "apropos": {
    "sur": "Notre entreprise",
    "titre": "À propos de Linkstech",
    "sousTitre": "Un seul partenaire. Quatre expertises fortes.",
    "intro": [
      "Linkstech est une entreprise basée en RDC, au Kenya et au Canada. Elle réunit construction, technologie, mise en relation et accompagnement des organisations pour servir les entreprises, ONG, associations, institutions et communautés à l'international.",
      "Notre différence : comprendre chaque terrain, concevoir avec précision et livrer des solutions adaptées au contexte de chaque client, où qu'il se trouve.",
      "Notre nom résume notre promesse : LINKS, le lien vers la réussite · SMART, l'intelligence vers l'excellence · TECH, technologie et ingénierie."
    ],
    "image": "/assets/img/vedette-construction.jpg",
    "chiffres": [
      {
        "valeur": "04",
        "libelle": "Pôles d'expertise"
      },
      {
        "valeur": "06+",
        "libelle": "Solutions réalisées"
      },
      {
        "valeur": "3",
        "libelle": "Implantations"
      },
      {
        "valeur": "Global",
        "libelle": "Notre ambition"
      }
    ],
    "mission": "Créer les bonnes connexions et mobiliser la technologie et l'ingénierie au service de chaque ambition, en RDC comme à l'international.",
    "vision": "Construire utile, innover avec sens et créer des solutions capables d'améliorer durablement notre environnement.",
    "piliers": [
      {
        "id": "construction",
        "icone": "btp",
        "titre": "Construction & Génie civil",
        "texte": "Étude, conception, gros œuvre, second œuvre et réhabilitation : nous livrons des ouvrages conformes aux normes, adaptés au terrain et au climat."
      },
      {
        "id": "informatique",
        "icone": "code",
        "titre": "Solutions informatiques",
        "texte": "Applications web, plateformes métiers, cybersécurité et infogérance : nous équipons, sécurisons et connectons vos activités."
      },
      {
        "id": "energie",
        "icone": "solaire",
        "titre": "Énergies renouvelables",
        "texte": "Études solaires, dimensionnement, installation et maintenance : des solutions énergétiques durables pour vos projets."
      },
      {
        "id": "connexions",
        "icone": "reseau",
        "titre": "Connexions & marchés",
        "texte": "Services, clients, partenaires, bailleurs et marchés : nous créons les connexions qui font avancer vos projets."
      }
    ],
    "valeurs": [
      {
        "icone": "qualite",
        "titre": "Exécution rigoureuse",
        "texte": "Des engagements tenus, des chantiers et des livraisons maîtrisés, contrôlés à chaque étape."
      },
      {
        "icone": "innovation",
        "titre": "Innovation utile",
        "texte": "Nous suivons les technologies qui apportent une valeur réelle et formons vos équipes à leur usage."
      },
      {
        "icone": "proximite",
        "titre": "Expertise locale",
        "texte": "Une expertise née en RDC, qui comprend les réalités du terrain et le contexte de chaque projet."
      },
      {
        "icone": "integrite",
        "titre": "Accompagnement durable",
        "texte": "Nous restons aux côtés de nos clients après la livraison : maintenance, formation et suivi."
      }
    ],
    "histoire": [
      {
        "annee": "2016",
        "titre": "Premiers pas",
        "texte": "Création de l'activité informatique : dépannage, réseaux et fourniture de matériel à Goma."
      },
      {
        "annee": "2019",
        "titre": "Pôle construction",
        "texte": "Ouverture du pôle construction : études, gros œuvre et réhabilitation de bâtiments."
      },
      {
        "annee": "2022",
        "titre": "Pôle énergie",
        "texte": "Lancement du pôle énergie renouvelable : kits solaires et systèmes hybrides."
      },
      {
        "annee": "2024",
        "titre": "Ingénierie intégrée",
        "texte": "Linkstech réunit les quatre pôles et conduit des projets de bout en bout."
      }
    ],
    "raisons": [
      {
        "titre": "Un interlocuteur unique",
        "texte": "Un seul partenaire pour vos besoins informatiques, de construction et d'énergie : moins de coordination, plus de cohérence."
      },
      {
        "titre": "Un devis détaillé",
        "texte": "Chaque prestation est chiffrée ligne par ligne, avec le matériel et les délais annoncés."
      },
      {
        "titre": "Une équipe technique",
        "texte": "Ingénieurs, développeurs, techniciens solaires et chefs de chantier travaillent ensemble."
      },
      {
        "titre": "Un suivi durable",
        "texte": "Maintenance, formation et assistance après la mise en service."
      }
    ],
    "cta": {
      "titre": "Un projet en tête ?",
      "texte": "Décrivez-nous votre besoin : nous revenons vers vous avec une proposition claire et un délai d'intervention.",
      "boutonTexte": "Demander un devis",
      "boutonLien": "#contact"
    }
  },
  "vedetteDevis": {
    "icone": "btp",
    "image": "/assets/img/vedette-construction.jpg",
    "badge": "Connexions & devis",
    "titre": "Un projet, un besoin ?",
    "texte": "Présentez-nous votre besoin : nous vous connectons à l'expertise, au partenaire, au financement ou au marché qu'il vous faut.",
    "boutonTexte": "Être mis en relation",
    "boutonLien": "#contact"
  },
  "boutique": {
    "titre": "Boutique",
    "sousTitre": "Matériel informatique, solaire et produits du terroir",
    "filtres": [
      {
        "id": "tout",
        "libelle": "Tout"
      },
      {
        "id": "informatique",
        "libelle": "Informatique"
      },
      {
        "id": "energie",
        "libelle": "Énergie renouvelable"
      },
      {
        "id": "terroir",
        "libelle": "Produits du terroir"
      }
    ],
    "texteAjouter": "Ajouter au panier"
  },
  "contact": {
    "titre": "Contact",
    "sousTitre": "Trouvez le bon service, le bon client ou le bon marché.",
    "adresse": "Avenue du Lac, Goma, Nord-Kivu, RDC",
    "horaires": "Lundi – Samedi : 08h00 – 18h00",
    "messageSucces": "Merci ! Votre message a bien été envoyé."
  },
  "pied": {
    "description": "Linkstech développe des solutions de construction et de technologie et facilite les connexions commerciales à l'échelle internationale. Nous accompagnons entreprises, ONG, institutions et porteurs de startups, de l'étude à la réalisation.",
    "mentions": "Tous droits réservés."
  },
  "realisations": [
    {
      "id": "r-lito-finance",
      "titre": "LITO Finance",
      "etiquette": "Fintech",
      "categorie": "digital",
      "description": "Conception d'une solution numérique orientée finance et gestion.",
      "image": "/assets/img/realisations/lito-finance.png",
      "lien": ""
    },
    {
      "id": "r-imoselect",
      "titre": "Youpend ImmoSelect",
      "etiquette": "Immobilier",
      "categorie": "digital",
      "description": "Une expérience digitale dédiée à la recherche et la valorisation immobilière.",
      "image": "/assets/img/realisations/immobilier.png",
      "lien": ""
    },
    {
      "id": "r-urbanova",
      "titre": "Urbanova",
      "etiquette": "Proptech",
      "categorie": "digital",
      "description": "Une solution moderne au service de la ville et de ses acteurs.",
      "image": "/assets/img/realisations/urbanova.png",
      "lien": ""
    },
    {
      "id": "r-smart-event",
      "titre": "Smart Event Kivu",
      "etiquette": "Événementiel",
      "categorie": "digital",
      "description": "Plateforme intelligente pour simplifier l'organisation événementielle.",
      "image": "/assets/img/realisations/smart-event.png",
      "lien": ""
    },
    {
      "id": "r-fieldlink",
      "titre": "FieldLink",
      "etiquette": "Field Tech",
      "categorie": "digital",
      "description": "Des outils numériques qui connectent les équipes et les réalités du terrain.",
      "image": "/assets/img/realisations/fieldlink.png",
      "lien": ""
    },
    {
      "id": "r-chantier-rdc",
      "titre": "Construction & suivi de chantier en RDC",
      "etiquette": "Chantier · Goma",
      "categorie": "construction",
      "description": "Étude, coordination et accompagnement de projets de construction adaptés aux matériaux, au terrain et aux réalités locales.",
      "image": "/assets/img/vedette-construction.jpg",
      "lien": ""
    },
    {
      "id": "r-maisons-goma",
      "titre": "Projets résidentiels à Goma",
      "etiquette": "Habitat · RDC",
      "categorie": "construction",
      "description": "Conception de maisons modernes, fonctionnelles et durables, intégrant les matériaux et le paysage du Nord-Kivu.",
      "image": "/assets/img/realisations/maison-goma.jpg",
      "lien": ""
    }
  ]
};

const REGLAGES_DEFAUT = {
  devise: 'USD',
  portailClientActif: true,
  maintenance: false
};

module.exports = { CONTENU_DEFAUT, REGLAGES_DEFAUT };
