'use strict';

/**
 * Contenu par défaut du site LK-TECH (Linksmartech).
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
  identite: {
    nom: 'LK-TECH',
    nomComplet: 'LK-TECH',
    nomLong: 'Linksmartech',
    slogan: 'Informatique · Construction · Énergie renouvelable',
    rccm: 'CD-GOM-01-2024-A-002698',
    ville: 'Goma, Nord-Kivu, RDC',
    telephone: '+243 976 459 970',
    telephoneSecondaire: '',
    email: 'contact@linksmartec.com',
    siteWeb: 'www.linksmartec.com',
    logo: '/assets/img/logo.svg',
    logoClair: '/assets/img/logo-clair.svg',
    favicon: '/assets/img/favicon.svg',
    couleurPrimaire: '#16233F',
    couleurAccent: '#2E9E5B',
    reseaux: [
      { nom: 'Facebook', url: 'https://facebook.com' },
      { nom: 'LinkedIn', url: 'https://linkedin.com' },
      { nom: 'WhatsApp', url: 'https://wa.me/243976459970' }
    ]
  },

  hero: {
    actif: 'informatique',
    onglets: [
      {
        id: 'informatique',
        libelle: 'Informatique',
        badge: 'Spécialité Informatique',
        titre: 'Nous concevons vos',
        titreAccent: "systèmes d'information",
        description:
          "Développement logiciel, réseaux, cloud et maintenance : des solutions numériques fiables, pensées pour les entreprises et institutions congolaises.",
        boutonTexte: 'Découvrir nos solutions',
        boutonLien: '#services'
      },
      {
        id: 'construction',
        libelle: 'Construction',
        badge: 'Spécialité Construction',
        titre: 'Nous bâtissons des',
        titreAccent: 'infrastructures durables',
        description:
          "Études, gros œuvre, second œuvre et réhabilitation : nous réalisons vos bâtiments et ouvrages dans le respect des normes et des délais.",
        boutonTexte: 'Voir nos réalisations',
        boutonLien: '#services'
      },
      {
        id: 'energie',
        libelle: 'Énergie renouvelable',
        badge: 'Spécialité Énergie',
        titre: "L'énergie solaire",
        titreAccent: 'pour tous',
        description:
          "Dimensionnement, installation et maintenance de kits solaires et systèmes hybrides : produisez votre propre électricité, sans coupure.",
        boutonTexte: 'Demander une étude',
        boutonLien: '#contact'
      }
    ]
  },

  specialites: [
    {
      id: 'informatique',
      icone: 'code',
      titre: 'Informatique',
      texte:
        "Développement, réseaux, cloud et cybersécurité : nous digitalisons vos activités et protégeons vos données."
    },
    {
      id: 'construction',
      icone: 'btp',
      titre: 'Construction',
      texte:
        "Constructeur : études techniques, gros œuvre, second œuvre et réhabilitation de bâtiments solides, livrés dans les délais et aux normes."
    },
    {
      id: 'energie',
      icone: 'solaire',
      titre: 'Énergie renouvelable',
      texte:
        "Solaire, hybridation et pompage : produisez une énergie propre, fiable et rentable, même hors réseau."
    }
  ],

  services: [
    {
      titre: 'Développement logiciel & Web',
      description:
        "Applications de gestion, sites web, plateformes métier : des outils sur mesure qui simplifient votre quotidien.",
      icone: 'code',
      image: ''
    },
    {
      titre: 'Réseaux & Systèmes',
      description:
        "Câblage structuré, Wi-Fi professionnel, serveurs, sauvegardes et supervision de vos infrastructures.",
      icone: 'reseau',
      image: ''
    },
    {
      titre: 'Construction & BTP',
      description:
        "Constructeur général : études techniques, gros œuvre, second œuvre et réhabilitation de bâtiments résidentiels et institutionnels.",
      icone: 'btp',
      image: ''
    },
    {
      titre: 'Énergie solaire & renouvelable',
      description:
        "Kits solaires, systèmes hybrides et pompage solaire : dimensionnés pour votre consommation réelle.",
      icone: 'solaire',
      image: ''
    },
    {
      titre: 'Électricité & Réseaux',
      description:
        "Installations basse tension, tableaux, groupes de secours et mise aux normes de vos sites.",
      icone: 'electricite',
      image: ''
    },
    {
      titre: 'Cybersécurité & Cloud',
      description:
        "Audits, protection des données, hébergement et infogérance : votre patrimoine numérique en sécurité.",
      icone: 'cloud',
      image: ''
    }
  ],

  approche: {
    titre: 'Notre Approche',
    sousTitre: 'Une méthode éprouvée, du diagnostic à la pérennisation',
    etapes: [
      { numero: '01', titre: 'Diagnostic', description: "Audit du besoin, visite du site et analyse technique." },
      { numero: '02', titre: 'Conception', description: "Devis détaillé, plans et choix du matériel adapté." },
      { numero: '03', titre: 'Réalisation', description: "Mise en œuvre par nos équipes, dans le respect des délais." },
      { numero: '04', titre: 'Accompagnement', description: "Formation, maintenance et suivi après livraison." }
    ]
  },

  produits: [
    {
      id: 'p-ordinateur-pro',
      nom: 'Ordinateur portable professionnel',
      description: 'Core i5 / 16 Go / SSD 512 Go — configuré et garanti 1 an.',
      descriptionLongue: 'Un portable pensé pour durer dans les conditions réelles des bureaux et des chantiers congolais : châssis renforcé, clavier résistant aux poussières et batterie longue autonomie pour travailler même lors des coupures de courant.\nChaque machine est configurée, testée et mise à jour par nos techniciens avant la livraison : suite bureautique, outils de sécurité et sauvegarde prêts à l\'emploi.\nVous bénéficiez d\'un an de garantie assurée localement par LK-TECH, avec prêt de matériel possible pendant la réparation.',
      specifications: [
        { label: 'Processeur', valeur: 'Intel Core i5 — 12e génération' },
        { label: 'Mémoire vive', valeur: '16 Go DDR4' },
        { label: 'Stockage', valeur: 'SSD NVMe 512 Go' },
        { label: 'Écran', valeur: '15,6" Full HD antireflet' },
        { label: 'Système', valeur: 'Windows 11 Pro + suite bureautique' },
        { label: 'Garantie', valeur: '12 mois pièces et main-d\'œuvre' }
      ],
      images: [],
      prix: 780,
      devise: 'USD',
      filtre: 'informatique',
      categorie: 'intl',
      badge: 'Best-seller',
      image: '/assets/img/produits/ordinateur.jpg',
      stock: 12,
      actif: true
    },
    {
      id: 'p-serveur-rack',
      nom: 'Serveur Rack Edge Pro',
      description: 'Haute performance pour déploiement réseau et virtualisation.',
      descriptionLongue: 'Un serveur rack 1U conçu pour la virtualisation, les bases de données et les services réseau exigeants. Idéal pour les entreprises, ONG et institutions qui hébergent leurs propres outils.\nNos ingénieurs assurent l\'installation en rack, la configuration RAID, la mise en réseau et la supervision. Une offre de maintenance mensuelle est disponible pour garantir la disponibilité de vos services.',
      specifications: [
        { label: 'Processeur', valeur: 'Intel Xeon E-2300 (6 cœurs)' },
        { label: 'Mémoire vive', valeur: '32 Go ECC' },
        { label: 'Stockage', valeur: '2 × 2 To en RAID 1' },
        { label: 'Alimentation', valeur: 'Redondante 500 W' },
        { label: 'Format', valeur: 'Rack 1U' },
        { label: 'Installation', valeur: 'Configuration et mise en service comprises' }
      ],
      images: [],
      prix: 1450,
      devise: 'USD',
      filtre: 'informatique',
      categorie: 'intl',
      badge: 'Sur commande',
      image: '/assets/img/produits/serveur.jpg',
      stock: 5,
      actif: true
    },
    {
      id: 'p-kit-solaire',
      nom: 'Kit solaire hybride 5 kVA',
      description: 'Onduleur hybride, panneaux et batteries lithium pour un foyer ou un petit commerce.',
      descriptionLongue: 'Un kit complet pour produire et stocker votre propre électricité : onduleur hybride 5 kVA, huit panneaux monocristallins de 450 W et batterie lithium LiFePO4 de 5 kWh.\nLe dimensionnement est adapté à un foyer ou un petit commerce : éclairage, télévision, réfrigérateur, informatique et pompage ponctuel. Nos équipes réalisent l\'étude de votre consommation, l\'installation et la formation à l\'usage.\nSuivi et maintenance préventive assurés partout dans le Nord-Kivu.',
      specifications: [
        { label: 'Onduleur', valeur: 'Hybride 5 kVA avec régulateur MPPT' },
        { label: 'Panneaux', valeur: '8 × 450 Wc monocristallins' },
        { label: 'Batteries', valeur: 'Lithium LiFePO4 — 5 kWh' },
        { label: 'Autonomie', valeur: '8 à 12 h selon la consommation' },
        { label: 'Garantie', valeur: '5 ans (onduleur) · 10 ans (batteries)' },
        { label: 'Installation', valeur: 'Posée par nos équipes, formation incluse' }
      ],
      images: ['/assets/img/produits/panneau-solaire.jpg'],
      prix: 3200,
      devise: 'USD',
      filtre: 'energie',
      categorie: 'intl',
      badge: 'Populaire',
      image: '/assets/img/produits/kit-solaire.jpg',
      stock: 8,
      actif: true
    },
    {
      id: 'p-panneau-solaire',
      nom: 'Panneau solaire 450 W',
      description: 'Monocristallin haute rendement, garantie 12 ans, pose comprise.',
      descriptionLongue: 'Un panneau monocristallin haute performance, idéal pour compléter une installation existante ou démarrer un petit système solaire.\nVendu avec sa structure de montage et ses câbles ; la pose est réalisée par nos techniciens à Goma et dans tout le Nord-Kivu.',
      specifications: [
        { label: 'Technologie', valeur: 'Monocristallin PERC' },
        { label: 'Puissance', valeur: '450 Wc' },
        { label: 'Rendement', valeur: '21,3 %' },
        { label: 'Garantie', valeur: '12 ans produit · 25 ans performance' },
        { label: 'Pose', valeur: 'Comprise (Goma et Nord-Kivu)' }
      ],
      images: ['/assets/img/produits/kit-solaire.jpg'],
      prix: 185,
      devise: 'USD',
      filtre: 'energie',
      categorie: 'intl',
      badge: '',
      image: '/assets/img/produits/panneau-solaire.jpg',
      stock: 60,
      actif: true
    },
    {
      id: 'p-vsat',
      nom: 'Terminal satellite VSAT',
      description: 'Connectivité haut débit pour les sites isolés et les chantiers.',
      descriptionLongue: 'Une liaison satellite haute performance pour les sites non desservis par la fibre ou les réseaux mobiles : chantiers, mines, missions, ONG et établissements isolés.\nLe terminal comprend l\'antenne, le modem et l\'installation complète. Bande passante garantie, adresse IP fixe et accompagnement technique par nos ingénieurs réseau.',
      specifications: [
        { label: 'Débit', valeur: 'Jusqu\'à 50 Mb/s en réception' },
        { label: 'Antenne', valeur: 'Parabole 1,2 m stabilisée' },
        { label: 'Modem', valeur: 'Bi-bande Ka/Ku' },
        { label: 'Adresse IP', valeur: 'Fixe, option réseau privé virtuel' },
        { label: 'Installation', valeur: 'Comprise, avec formation des équipes' }
      ],
      images: [],
      prix: 890,
      devise: 'USD',
      filtre: 'informatique',
      categorie: 'intl',
      badge: 'Nouveau',
      image: '/assets/img/produits/satellite.jpg',
      stock: 6,
      actif: true
    },
    {
      id: 'p-miel-turunga',
      nom: 'Miel pur de Turunga',
      description: 'Récolté artisanalement dans le Nord-Kivu, non pasteurisé.',
      descriptionLongue: 'Un miel brut récolté par les apiculteurs du groupement de Turunga, au pied des collines du Nord-Kivu. Non chauffé et non filtré, il conserve tous ses arômes et ses propriétés.\nConditionné en pot d\'un kilogramme. Chaque achat soutient directement les coopératives locales.',
      specifications: [
        { label: 'Origine', valeur: 'Turunga, Nord-Kivu, RDC' },
        { label: 'Conditionnement', valeur: 'Pot d\'1 kg' },
        { label: 'Traitement', valeur: 'Brut — non pasteurisé' },
        { label: 'Producteurs', valeur: 'Coopérative apicole locale' }
      ],
      images: [],
      prix: 15,
      devise: 'USD',
      filtre: 'terroir',
      categorie: 'local',
      badge: '',
      image: '/assets/img/produits/miel.jpg',
      stock: 42,
      actif: true
    },
    {
      id: 'p-cafe-kivu',
      nom: 'Café arabica du Kivu',
      description: 'Grains torréfiés, 1 kg, traçabilité complète.',
      descriptionLongue: 'Un arabica de haute altitude cultivé sur les sols volcaniques du Kivu, torréfié artisanalement à Goma. Notes de fruits rouges et de cacao, acidité vive et équilibrée.\nLes grains sont issus de coopératives partenaires avec une traçabilité complète, de la parcelle au sachet d\'un kilogramme.',
      specifications: [
        { label: 'Variété', valeur: 'Arabica — Bourbon & Katimor' },
        { label: 'Altitude', valeur: '1 500 – 1 900 m' },
        { label: 'Torréfaction', valeur: 'Artisanale, moyenne' },
        { label: 'Conditionnement', valeur: 'Sachet 1 kg, grains entiers' },
        { label: 'Traçabilité', valeur: 'Coopérative identifiée' }
      ],
      images: [],
      prix: 22,
      devise: 'USD',
      filtre: 'terroir',
      categorie: 'local',
      badge: '',
      image: '/assets/img/produits/cafe.jpg',
      stock: 30,
      actif: true
    },
    {
      id: 'p-the-bukavu',
      nom: 'Thé vert de Bukavu',
      description: 'Feuilles sélectionnées, séchage lent, sachet de 500 g.',
      descriptionLongue: 'Un thé vert cueilli à la main sur les hauteurs de Bukavu, au sud du Kivu. Séchage lent à faible température pour préserver les notes végétales et la fraîcheur en tasse.\nSachet de 500 g, récolte de la saison.',
      specifications: [
        { label: 'Type', valeur: 'Thé vert, feuilles entières' },
        { label: 'Origine', valeur: 'Bukavu, Sud-Kivu, RDC' },
        { label: 'Séchage', valeur: 'Lent, basse température' },
        { label: 'Conditionnement', valeur: 'Sachet de 500 g' }
      ],
      images: [],
      prix: 12,
      devise: 'USD',
      filtre: 'terroir',
      categorie: 'local',
      badge: '',
      image: '/assets/img/produits/the.jpg',
      stock: 25,
      actif: true
    }
  ],

  apropos: {
    sur: 'Notre entreprise',
    titre: 'À propos de LK-TECH',
    sousTitre: 'Trois spécialités, une même exigence de qualité',
    intro: [
      "LK-TECH (Linksmartech) est une entreprise congolaise basée à Goma, au Nord-Kivu. Née de la rencontre entre des ingénieurs informaticiens, des professionnels du bâtiment et des techniciens en énergie, elle réunit sous un même toit trois compétences complémentaires : l'informatique, la construction et l'énergie renouvelable.",
      "Nous accompagnons les institutions publiques, les organisations humanitaires, les entreprises et les particuliers, de l'étude technique jusqu'à la maintenance. Chaque projet est traité comme une responsabilité : comprendre le besoin réel, proposer la solution la plus juste, la réaliser dans les délais et rester disponibles après la livraison.",
      "Notre ancrage local est une force : nous connaissons les contraintes du terrain — accès, climat, disponibilité de l'énergie — et nous concevons des solutions qui y répondent réellement."
    ],
    image: '/assets/img/vedette-construction.jpg',
    chiffres: [
      { valeur: '10+', libelle: "Années d'expérience" },
      { valeur: '150+', libelle: 'Projets livrés' },
      { valeur: '3', libelle: "Pôles d'expertise" },
      { valeur: '98%', libelle: 'Clients satisfaits' }
    ],
    mission:
      "Rendre accessibles, au Nord-Kivu et partout en RDC, des solutions numériques, des bâtiments et des installations énergétiques de qualité professionnelle, adaptées aux réalités locales.",
    vision:
      "Devenir la référence congolaise de l'ingénierie intégrée : une entreprise capable de concevoir, construire et équiper un site de bout en bout.",
    piliers: [
      {
        id: 'informatique',
        icone: 'code',
        titre: 'Informatique',
        texte:
          "Développement d'applications et de sites web, câblage réseau, serveurs, cybersécurité, cloud et infogérance : nous équipons, sécurisons et connectons vos activités."
      },
      {
        id: 'construction',
        icone: 'btp',
        titre: 'Construction',
        texte:
          "Constructeur général : études techniques, plans, gros œuvre, second œuvre, électricité du bâtiment et réhabilitation. Nous livrons des ouvrages conformes aux normes."
      },
      {
        id: 'energie',
        icone: 'solaire',
        titre: 'Énergie renouvelable',
        texte:
          "Étude de consommation, dimensionnement, installation et maintenance de kits solaires, de systèmes hybrides et de pompage solaire pour votre autonomie énergétique."
      }
    ],
    valeurs: [
      { icone: 'integrite', titre: 'Intégrité', texte: 'Des devis clairs, sans coûts cachés, et des engagements tenus.' },
      { icone: 'qualite', titre: 'Qualité', texte: 'Du matériel éprouvé et une mise en œuvre soignée, contrôlée à chaque étape.' },
      { icone: 'proximite', titre: 'Proximité', texte: 'Des équipes basées à Goma, disponibles et réactives après la livraison.' },
      { icone: 'innovation', titre: 'Innovation', texte: 'Nous suivons les technologies utiles et formons vos équipes à leur usage.' }
    ],
    histoire: [
      {
        annee: '2016',
        titre: 'Premiers pas',
        texte: "Création de l'activité informatique : dépannage, réseaux et fourniture de matériel à Goma."
      },
      {
        annee: '2019',
        titre: 'Pôle construction',
        texte: 'Ouverture du pôle construction : études, gros œuvre et réhabilitation de bâtiments.'
      },
      {
        annee: '2022',
        titre: 'Pôle énergie',
        texte: 'Lancement du pôle énergie renouvelable : kits solaires et systèmes hybrides.'
      },
      {
        annee: '2024',
        titre: 'Ingénierie intégrée',
        texte: 'LK-TECH réunit les trois pôles et conduit des projets de bout en bout.'
      }
    ],
    raisons: [
      {
        titre: 'Un interlocuteur unique',
        texte:
          "Un seul partenaire pour vos besoins informatiques, de construction et d'énergie : moins de coordination, plus de cohérence."
      },
      {
        titre: 'Un devis détaillé',
        texte: 'Chaque prestation est chiffrée ligne par ligne, avec le matériel et les délais annoncés.'
      },
      {
        titre: 'Une équipe technique',
        texte: 'Ingénieurs, développeurs, techniciens solaires et chefs de chantier travaillent ensemble.'
      },
      {
        titre: 'Un suivi durable',
        texte: 'Maintenance, formation et assistance après la mise en service.'
      }
    ],
    cta: {
      titre: 'Un projet en tête ?',
      texte:
        "Décrivez-nous votre besoin : nous revenons vers vous avec une proposition claire et un délai d'intervention.",
      boutonTexte: 'Demander un devis',
      boutonLien: '#contact'
    }
  },

  vedetteDevis: {
    icone: 'btp',
    image: '/assets/img/vedette-construction.jpg',
    badge: 'Étude & devis',
    titre: 'Un projet de construction ?',
    texte: "Études techniques, plans et devis détaillé remis sous 48 h pour vos bâtiments résidentiels, commerciaux et institutionnels.",
    boutonTexte: 'Demander une étude',
    boutonLien: '#contact'
  },

  boutique: {
    titre: 'Boutique',
    sousTitre: 'Matériel informatique, solaire et produits du terroir',
    filtres: [
      { id: 'tout', libelle: 'Tout' },
      { id: 'informatique', libelle: 'Informatique' },
      { id: 'energie', libelle: 'Énergie renouvelable' },
      { id: 'terroir', libelle: 'Produits du terroir' }
    ],
    texteAjouter: 'Ajouter au panier'
  },

  contact: {
    titre: 'Contact',
    sousTitre: 'Parlons de votre projet',
    adresse: 'Avenue du Lac, Goma, Nord-Kivu, RDC',
    horaires: 'Lundi – Samedi : 08h00 – 18h00',
    messageSucces: 'Merci ! Votre message a bien été envoyé.'
  },

  pied: {
    description:
      "LK-TECH (Linksmartech) est une entreprise congolaise spécialisée en informatique, construction et énergie renouvelable. Nous accompagnons institutions, entreprises et particuliers de l'étude à la maintenance.",
    mentions: 'Tous droits réservés.'
  }
};

/** Réglages d'application (non édités par le client dans l'admin). */
const REGLAGES_DEFAUT = {
  devise: 'USD',
  portailClientActif: true,
  maintenance: false
};

module.exports = { CONTENU_DEFAUT, REGLAGES_DEFAUT };
