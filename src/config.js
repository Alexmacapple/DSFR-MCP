// Configuration centrale du MCP DSFR
require('dotenv').config();
const path = require('path');

// Obtenir le répertoire racine du projet
const rootDir = path.resolve(__dirname, '..');

module.exports = {
  // Configuration du serveur
  server: {
    name: 'dsfr-mcp',
    version: '1.0.0',
    description: 'MCP Server complet pour le Système de Design de l\'État Français'
  },

  // Chemins
  paths: {
    fiches: path.join(rootDir, 'fiches-markdown-v2'),
    data: path.join(rootDir, 'data'),
    templates: path.join(rootDir, 'src', 'templates'),
    output: path.join(rootDir, 'output')
  },

  // Catégories DSFR
  categories: {
    core: {
      name: 'Fondamentaux',
      description: 'Éléments de base du DSFR : couleurs, typographie, grilles, espacement'
    },
    component: {
      name: 'Composants',
      description: 'Composants UI réutilisables : boutons, formulaires, navigation'
    },
    layout: {
      name: 'Modèles et exemples',
      description: 'Patterns de pages et layouts complets'
    },
    utility: {
      name: 'Utilitaires',
      description: 'Classes utilitaires CSS pour un développement rapide'
    },
    analytics: {
      name: 'Outils d\'analyse',
      description: 'Intégration d\'outils d\'analyse et de mesure'
    },
    scheme: {
      name: 'Combinaisons de couleur',
      description: 'Schémas de couleurs et thèmes'
    }
  },

  // Types de composants
  componentTypes: {
    form: 'Formulaire',
    navigation: 'Navigation',
    content: 'Contenu',
    feedback: 'Feedback',
    layout: 'Mise en page',
    utility: 'Utilitaire'
  },

  // Framework supportés
  frameworks: {
    vanilla: {
      name: 'HTML/CSS/JS Vanilla',
      fileExtensions: ['.html', '.css', '.js']
    },
    react: {
      name: 'React',
      fileExtensions: ['.jsx', '.tsx']
    },
    vue: {
      name: 'Vue.js',
      fileExtensions: ['.vue']
    },
    angular: {
      name: 'Angular',
      fileExtensions: ['.component.ts', '.component.html']
    }
  },

  // Configuration de l'indexation
  indexing: {
    updateInterval: 3600000, // 1 heure en ms
    maxFileSize: 5 * 1024 * 1024, // 5MB
    supportedFormats: ['.md', '.html', '.json']
  },

  // Configuration de la validation
  validation: {
    rgaaLevel: 'AA',
    checkAccessibility: true,
    checkSemanticHTML: true,
    checkDSFRCompliance: true
  },

  // Templates prédéfinis
  templates: {
    'page-connexion': 'Page de connexion',
    'page-inscription': 'Page d\'inscription',
    'page-erreur-404': 'Page d\'erreur 404',
    'page-erreur-500': 'Page d\'erreur 500',
    'formulaire-contact': 'Formulaire de contact',
    'tableau-donnees': 'Tableau de données',
    'page-recherche': 'Page de recherche',
    'dashboard': 'Tableau de bord'
  },

  // Configuration des exports
  export: {
    formats: ['html', 'react', 'vue', 'angular'],
    includeAssets: true,
    minify: false,
    prettify: true
  },

  // Messages et textes
  messages: {
    serverReady: '🚀 Serveur MCP DSFR prêt',
    indexingStart: '📚 Indexation de la documentation...',
    indexingComplete: '✅ Indexation terminée',
    validationSuccess: '✅ Validation réussie',
    validationError: '❌ Erreur de validation'
  }
};
