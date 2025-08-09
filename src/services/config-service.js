/**
 * Service de configuration centralisé
 * Gère toute la configuration de l'application avec hot-reload
 */

const fs = require('fs').promises;
const path = require('path');
const { IConfigService } = require('../core/interfaces');

class ConfigService extends IConfigService {
  constructor(logger) {
    super();
    this.logger = logger;
    this.config = new Map();
    this.watchers = new Map();
    this.initialized = false;

    // Configuration par défaut
    this.loadDefaultConfig();
  }

  async initialize() {
    if (this.initialized) return;

    this.logger.info('Initialisation du ConfigService');

    try {
      // Charger la configuration depuis les variables d'environnement
      this.loadEnvironmentConfig();

      // Charger les fichiers de configuration
      await this.loadConfigFiles();

      this.initialized = true;
      this.logger.info('ConfigService initialisé');
    } catch (error) {
      this.logger.error("Erreur lors de l'initialisation du ConfigService", error);
      throw error;
    }
  }

  isInitialized() {
    return this.initialized;
  }

  get(key, defaultValue = null) {
    // Support des clés avec notation pointée (ex: "server.port")
    const keys = key.split('.');
    let value = this.config;

    for (const k of keys) {
      if (value instanceof Map) {
        value = value.get(k);
      } else if (typeof value === 'object' && value !== null) {
        value = value[k];
      } else {
        return defaultValue;
      }

      if (value === undefined) {
        return defaultValue;
      }
    }

    return value;
  }

  set(key, value) {
    const keys = key.split('.');
    let current = this.config;

    // Naviguer jusqu'à l'avant-dernière clé
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];

      if (!current.has(k)) {
        current.set(k, new Map());
      }

      current = current.get(k);
    }

    // Définir la valeur finale
    current.set(keys[keys.length - 1], value);
  }

  has(key) {
    try {
      const notFoundSymbol = Symbol('not-found');
      const value = this.get(key, notFoundSymbol);
      return value !== notFoundSymbol;
    } catch {
      return false;
    }
  }

  /**
   * Obtient toute la configuration comme objet plain
   */
  getAll() {
    return this.mapToObject(this.config);
  }

  /**
   * Fusionne une configuration partielle
   */
  merge(partialConfig) {
    this.deepMerge(this.config, this.objectToMap(partialConfig));
  }

  /**
   * Méthodes privées
   */

  loadDefaultConfig() {
    const rootDir = path.resolve(__dirname, '../..');

    const defaultConfig = {
      server: {
        name: 'dsfr-mcp',
        version: '1.1.0',
        description: "MCP Server complet pour le Système de Design de l'État Français",
      },

      paths: {
        fiches: path.join(rootDir, 'fiches-markdown-v2'),
        data: path.join(rootDir, 'data'),
        templates: path.join(rootDir, 'src', 'templates'),
        output: path.join(rootDir, 'output'),
        cache: path.join(rootDir, 'data', 'cache'),
      },

      cache: {
        maxMemorySize: 50 * 1024 * 1024, // 50MB
        defaultTTL: 30 * 60 * 1000, // 30 minutes
        cleanupInterval: 5 * 60 * 1000, // 5 minutes
        compression: true,
        persistentPath: path.join(rootDir, 'data', 'cache'),
      },

      performance: {
        maxStartupTime: 2000, // 2 secondes
        batchSize: 10,
        maxConcurrency: 5,
        lazyLoading: true,
      },

      categories: {
        core: {
          name: 'Fondamentaux',
          description: 'Éléments de base du DSFR : couleurs, typographie, grilles, espacement',
        },
        component: {
          name: 'Composants',
          description: 'Composants UI réutilisables : boutons, formulaires, navigation',
        },
        layout: {
          name: 'Modèles et exemples',
          description: 'Patterns de pages et layouts complets',
        },
        utility: {
          name: 'Utilitaires',
          description: 'Classes utilitaires CSS pour un développement rapide',
        },
        analytics: {
          name: "Outils d'analyse",
          description: "Intégration d'outils d'analyse et de mesure",
        },
        scheme: {
          name: 'Combinaisons de couleur',
          description: 'Schémas de couleurs et thèmes',
        },
      },

      frameworks: {
        vanilla: {
          name: 'HTML/CSS/JS Vanilla',
          fileExtensions: ['.html', '.css', '.js'],
        },
        react: {
          name: 'React',
          fileExtensions: ['.jsx', '.tsx'],
        },
        vue: {
          name: 'Vue.js',
          fileExtensions: ['.vue'],
        },
        angular: {
          name: 'Angular',
          fileExtensions: ['.component.ts', '.component.html'],
        },
      },

      validation: {
        rgaaLevel: 'AA',
        checkAccessibility: true,
        checkSemanticHTML: true,
        checkDSFRCompliance: true,
      },

      indexing: {
        updateInterval: 3600000, // 1 heure
        maxFileSize: 5 * 1024 * 1024, // 5MB
        supportedFormats: ['.md', '.html', '.json'],
      },

      templates: {
        'page-connexion': 'Page de connexion',
        'page-inscription': "Page d'inscription",
        'page-erreur-404': "Page d'erreur 404",
        'page-erreur-500': "Page d'erreur 500",
        'formulaire-contact': 'Formulaire de contact',
        'tableau-donnees': 'Tableau de données',
        'page-recherche': 'Page de recherche',
        dashboard: 'Tableau de bord',
      },

      logging: {
        level: 'info',
        format: 'json',
        file: false,
        console: true,
      },
    };

    this.config = this.objectToMap(defaultConfig);
  }

  loadEnvironmentConfig() {
    // Charger les variables d'environnement avec préfixe DSFR_
    for (const [key, value] of Object.entries(process.env)) {
      if (key.startsWith('DSFR_')) {
        const configKey = key.replace('DSFR_', '').toLowerCase().replace(/_/g, '.');

        // Convertir les valeurs selon leur type
        let parsedValue = value;

        // Essayer de parser comme JSON pour les objets/arrays
        if (value.startsWith('{') || value.startsWith('[')) {
          try {
            parsedValue = JSON.parse(value);
          } catch {
            // Garder la valeur string si le JSON est invalide
          }
        }
        // Convertir les booléens
        else if (value === 'true') parsedValue = true;
        else if (value === 'false') parsedValue = false;
        // Convertir les nombres
        else if (!isNaN(value) && !isNaN(parseFloat(value))) {
          parsedValue = parseFloat(value);
        }

        this.set(configKey, parsedValue);
        this.logger.debug(`Configuration depuis env: ${configKey} = ${parsedValue}`);
      }
    }
  }

  async loadConfigFiles() {
    const configDir = path.join(this.get('paths.data'), 'config');

    try {
      await fs.access(configDir);
      const files = await fs.readdir(configDir);

      for (const file of files) {
        if (file.endsWith('.json')) {
          await this.loadConfigFile(path.join(configDir, file));
        }
      }
    } catch (error) {
      // Pas de fichiers de config, c'est OK
      this.logger.info(
        'Aucun fichier de configuration trouvé, utilisation de la config par défaut'
      );
    }
  }

  async loadConfigFile(filepath) {
    try {
      const content = await fs.readFile(filepath, 'utf8');
      const config = JSON.parse(content);

      this.merge(config);
      this.logger.info(`Configuration chargée depuis ${filepath}`);
    } catch (error) {
      this.logger.warn(`Erreur lors du chargement de ${filepath}`, { error: error.message });
    }
  }

  objectToMap(obj) {
    if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
      return obj;
    }

    const map = new Map();
    for (const [key, value] of Object.entries(obj)) {
      map.set(key, this.objectToMap(value));
    }
    return map;
  }

  mapToObject(map) {
    if (!(map instanceof Map)) {
      return map;
    }

    const obj = {};
    for (const [key, value] of map) {
      obj[key] = this.mapToObject(value);
    }
    return obj;
  }

  deepMerge(target, source) {
    for (const [key, value] of source) {
      if (target.has(key)) {
        const targetValue = target.get(key);
        if (targetValue instanceof Map && value instanceof Map) {
          this.deepMerge(targetValue, value);
        } else {
          target.set(key, value);
        }
      } else {
        target.set(key, value);
      }
    }
  }

  async dispose() {
    // Arrêter tous les watchers de fichiers
    for (const watcher of this.watchers.values()) {
      if (watcher && typeof watcher.close === 'function') {
        watcher.close();
      }
    }

    this.watchers.clear();
    this.config.clear();
    this.initialized = false;

    this.logger.info('ConfigService fermé');
  }
}

module.exports = ConfigService;
