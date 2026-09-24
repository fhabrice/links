'use strict';

/**
 * Contenu par défaut du site Linksmartech.
 *
 * Ces valeurs servent de "seed" : elles sont copiées dans le stockage (JSON ou MySQL)
 * au premier démarrage, puis c'est l'admin qui fait foi. Aucune donnée n'est demandée
 * à l'utilisateur à l'installation.
 */

const CONTENU_DEFAUT = {
  identite: {
    nom: 'LINKS MARTECH',
    nomComplet: 'Linksmartech',
    slogan: 'Portail Institutionnel & E-Commerce',
    rccm: 'CD-GOM-01-2024-A-002698',
    ville: 'Goma, Nord-Kivu, RDC',
    telephone: '+243 976 459 970',
    telephoneSecondaire: '',
    email: 'contact@linksmartech.com',
    logo: '/assets/img/logo.svg',
    favicon: '/assets/img/favicon.svg',
    couleurPrimaire: '#1e3a8a',
    couleurAccent: '#eab308',
    reseaux: [
      { nom: 'Facebook', url: 'https://facebook.com' },
      { nom: 'LinkedIn', url: 'https://linkedin.com' },
      { nom: 'WhatsApp', url: 'https://wa.me/243976459970' }
    ]
  },

  hero: {
    actif: 'local',
    onglets: [
      {
        id: 'local',
        libelle: 'Produits Nationaux',
        badge: 'Nouveauté Nationale',
        titre: 'Valorisons le savoir-faire',
        titreAccent: 'du Kivu',
        description:
          "Découvrez notre sélection de produits locaux premium, certifiés et distribués par Linksmartech.",
        boutonTexte: 'Découvrir la gamme',
        boutonLien: '#boutique'
      },
      {
        id: 'intl',
        libelle: 'Solutions Internationales',
        badge: 'Innovation Globale',
        titre: 'Technologie de pointe',
        titreAccent: 'mondiale',
        description:
          "Accédez à nos équipements technologiques de précision et solutions importées pour vos projets.",
        boutonTexte: 'Voir les solutions',
        boutonLien: '#boutique'
      }
    ]
  },

  services: [
    {
      titre: 'Construction & BTP',
      description: 'Infrastructures durables et réhabilitation.',
      image:
        'https://images.unsplash.com/photo-1541888946425-d81bb19240b5?auto=format&fit=crop&q=80&w=800'
    },
    {
      titre: 'Solutions Numériques',
      description: 'Transformation digitale et Cloud.',
      image:
        'https://images.unsplash.com/photo-1518432031352-d6fc5c10da6a?auto=format&fit=crop&q=80&w=800'
    },
    {
      titre: 'Environnement & WASH',
      description: 'Eau, assainissement et hygiène.',
      image:
        'https://images.unsplash.com/photo-1549421263-504527786435?auto=format&fit=crop&q=80&w=800'
    },
    {
      titre: 'Électricité',
      description: 'Réseaux énergétiques et déploiement.',
      image:
        'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=800'
    },
    {
      titre: 'Consultance Technique',
      description: 'Accompagnement et études stratégiques.',
      image:
        'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800'
    }
  ],

  approche: {
    titre: 'Notre Approche',
    sousTitre: 'Une méthode éprouvée, du diagnostic à la pérennisation',
    etapes: [
      { numero: '01', titre: 'Diagnostic', description: 'Analyse approfondie.' },
      { numero: '02', titre: 'Conception', description: 'Élaboration sur mesure.' },
      { numero: '03', titre: 'Réalisation', description: 'Standards de qualité.' },
      { numero: '04', titre: 'Accompagnement', description: 'Pérennité des projets.' }
    ]
  },

  produits: [
    {
      id: 'p-miel-turunga',
      nom: 'Miel pur de Turunga',
      description: 'Récolté artisanalement dans le Nord-Kivu.',
      prix: 15,
      devise: 'USD',
      categorie: 'local',
      badge: 'Best-seller',
      image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=800',
      stock: 42,
      actif: true
    },
    {
      id: 'p-cafe-kivu',
      nom: 'Café arabica du Kivu',
      description: 'Grains torréfiés, 1 kg, traçabilité complète.',
      prix: 22,
      devise: 'USD',
      categorie: 'local',
      badge: '',
      image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&q=80&w=800',
      stock: 30,
      actif: true
    },
    {
      id: 'p-the-bukavu',
      nom: 'Thé vert de Bukavu',
      description: 'Feuilles sélectionnées, séchage lent, 500 g.',
      prix: 12,
      devise: 'USD',
      categorie: 'local',
      badge: '',
      image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&q=80&w=800',
      stock: 25,
      actif: true
    },
    {
      id: 'p-serveur-rack',
      nom: 'Serveur Rack Edge Pro',
      description: 'Haute performance pour déploiement réseau.',
      prix: 1450,
      devise: 'USD',
      categorie: 'intl',
      badge: 'Sur commande',
      image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=800',
      stock: 5,
      actif: true
    },
    {
      id: 'p-station-solaire',
      nom: 'Kit solaire hybride 5 kVA',
      description: 'Onduleur, panneaux et batteries lithium.',
      prix: 3200,
      devise: 'USD',
      categorie: 'intl',
      badge: '',
      image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&q=80&w=800',
      stock: 8,
      actif: true
    },
    {
      id: 'p-starlink',
      nom: 'Terminal satellite VSAT',
      description: 'Connectivité haut débit pour sites isolés.',
      prix: 890,
      devise: 'USD',
      categorie: 'intl',
      badge: 'Nouveau',
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
      stock: 6,
      actif: true
    }
  ],

  boutique: {
    titre: 'Boutique',
    sousTitre: 'Produits nationaux et solutions internationales',
    tout: 'Tout',
    texteAjouter: 'Ajouter au panier'
  },

  contact: {
    titre: 'Contact',
    sousTitre: 'Parlons de votre projet',
    adresse: 'Avenue du Lac, Goma, Nord-Kivu, RDC',
    horaires: 'Lundi – Samedi : 08h00 – 18h00',
    messageSucces: 'Merci ! Votre message a bien été envoyé.',
  },

  pied: {
    description:
      "Linksmartech accompagne les institutions, les entreprises et les particuliers dans la construction, le numérique et l'énergie en République Démocratique du Congo.",
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
