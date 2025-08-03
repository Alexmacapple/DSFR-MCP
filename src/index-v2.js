#!/usr/bin/env node
/**
 * Serveur MCP DSFR - Version 2 avec architecture optimisée
 * Point d'entrée avec injection de dépendances et performances améliorées
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');

// Architecture Core
const Container = require('./core/container');

// Services
const LoggerService = require('./services/logger-service');
const ConfigService = require('./services/config-service');
const CacheService = require('./services/cache-service');
const DocumentationServiceV2 = require('./services/documentation-service-v2');

// Repositories
const DocumentationRepository = require('./repositories/documentation-repository');

// Services existants (pour compatibilité)
const ValidationService = require('./services/validation');
const GeneratorService = require('./services/generator');
const TemplateService = require('./services/template');
const AccessibilityService = require('./services/accessibility');

/**
 * Configuration du container DI
 */
function setupContainer() {
  const container = new Container();

  // Configuration et logging (pas de dépendances)
  container.registerSingleton('logger', (c) => {
    const config = c.resolve('config');
    return new LoggerService(config);
  });

  container.registerSingleton('config', () => {
    // Logger temporaire pour l'initialisation
    const tempLogger = { 
      info: () => {}, 
      error: () => {}, 
      warn: () => {}, 
      debug: () => {} 
    };
    return new ConfigService(tempLogger);
  });

  // Cache (dépend de config et logger)
  container.registerSingleton('cache', (c) => {
    const config = c.resolve('config');
    const logger = c.resolve('logger');
    return new CacheService(config, logger);
  });

  // Repository (dépend de config, cache, logger)
  container.registerSingleton('documentationRepository', (c) => {
    const config = c.resolve('config');
    const cache = c.resolve('cache');
    const logger = c.resolve('logger');
    return new DocumentationRepository(config, cache, logger);
  });

  // Services optimisés
  container.registerSingleton('documentationService', (c) => {
    const repository = c.resolve('documentationRepository');
    const cache = c.resolve('cache');
    const config = c.resolve('config');
    const logger = c.resolve('logger');
    return new DocumentationServiceV2(repository, cache, config, logger);
  });

  // Services existants (avec injection)
  container.registerSingleton('validationService', (c) => {
    const logger = c.resolve('logger');
    return new ValidationService();
  });

  container.registerSingleton('generatorService', (c) => {
    const logger = c.resolve('logger');
    return new GeneratorService();
  });

  container.registerSingleton('templateService', (c) => {
    const config = c.resolve('config');
    const logger = c.resolve('logger');
    return new TemplateService();
  });

  container.registerSingleton('accessibilityService', (c) => {
    const logger = c.resolve('logger');
    return new AccessibilityService();
  });

  return container;
}

/**
 * Définition des outils MCP
 */
function getToolDefinitions(config) {
  return [
    // 🔍 Outils de recherche et documentation
    {
      name: 'search_dsfr_components',
      description: 'Recherche des composants DSFR par nom, catégorie ou mot-clé',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Terme de recherche' },
          category: { 
            type: 'string', 
            enum: Object.keys(config.get('categories')),
            description: 'Catégorie à filtrer' 
          },
          limit: { type: 'integer', default: 10, minimum: 1, maximum: 50, description: 'Nombre de résultats' }
        },
        required: ['query']
      }
    },
    {
      name: 'get_component_details',
      description: 'Obtient les détails complets d\'un composant DSFR',
      inputSchema: {
        type: 'object',
        properties: {
          component_name: { type: 'string', description: 'Nom du composant' },
          include_examples: { type: 'boolean', default: true },
          include_accessibility: { type: 'boolean', default: true }
        },
        required: ['component_name']
      }
    },
    {
      name: 'list_dsfr_categories',
      description: 'Liste toutes les catégories DSFR disponibles',
      inputSchema: {
        type: 'object',
        properties: {}
      }
    },

    // 🛠️ Outils de génération
    {
      name: 'generate_dsfr_component',
      description: 'Génère le code HTML/CSS/JS pour un composant DSFR',
      inputSchema: {
        type: 'object',
        properties: {
          component_type: { type: 'string', description: 'Type de composant (button, form, card, etc.)' },
          framework: { 
            type: 'string', 
            enum: Object.keys(config.get('frameworks')),
            default: 'vanilla',
            description: 'Framework cible' 
          },
          options: { type: 'object', description: 'Options spécifiques au composant' }
        },
        required: ['component_type']
      }
    },
    {
      name: 'generate_dsfr_template',
      description: 'Génère un gabarit de page complet DSFR',
      inputSchema: {
        type: 'object',
        properties: {
          template_name: { 
            type: 'string',
            enum: Object.keys(config.get('templates')),
            description: 'Nom du template' 
          },
          framework: { 
            type: 'string', 
            enum: Object.keys(config.get('frameworks')), 
            default: 'vanilla' 
          },
          customizations: { type: 'object', description: 'Personnalisations du template' }
        },
        required: ['template_name']
      }
    },

    // ✅ Outils de validation
    {
      name: 'validate_dsfr_html',
      description: 'Valide la conformité HTML avec les standards DSFR',
      inputSchema: {
        type: 'object',
        properties: {
          html_code: { type: 'string', description: 'Code HTML à valider' },
          check_accessibility: { type: 'boolean', default: true },
          check_semantic: { type: 'boolean', default: true },
          strict_mode: { type: 'boolean', default: false }
        },
        required: ['html_code']
      }
    },
    {
      name: 'check_accessibility',
      description: 'Vérifie l\'accessibilité RGAA d\'un code HTML',
      inputSchema: {
        type: 'object',
        properties: {
          html_code: { type: 'string', description: 'Code HTML à vérifier' },
          rgaa_level: { type: 'string', enum: ['A', 'AA', 'AAA'], default: 'AA' },
          include_suggestions: { type: 'boolean', default: true }
        },
        required: ['html_code']
      }
    },

    // 🎨 Outils de personnalisation
    {
      name: 'create_dsfr_theme',
      description: 'Crée un thème DSFR personnalisé',
      inputSchema: {
        type: 'object',
        properties: {
          theme_name: { type: 'string', description: 'Nom du thème' },
          primary_color: { type: 'string', description: 'Couleur principale (hex)' },
          secondary_color: { type: 'string', description: 'Couleur secondaire (hex)' },
          custom_variables: { type: 'object', description: 'Variables CSS personnalisées' }
        },
        required: ['theme_name']
      }
    },

    // 📚 Outils de patterns
    {
      name: 'search_patterns',
      description: 'Recherche des patterns de mise en page DSFR',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Terme de recherche' },
          pattern_type: { 
            type: 'string',
            enum: ['page', 'form', 'navigation', 'content'],
            description: 'Type de pattern' 
          }
        },
        required: ['query']
      }
    },

    // 🔧 Outils utilitaires
    {
      name: 'convert_to_framework',
      description: 'Convertit du code DSFR vanilla vers un framework',
      inputSchema: {
        type: 'object',
        properties: {
          html_code: { type: 'string', description: 'Code HTML DSFR à convertir' },
          target_framework: { 
            type: 'string',
            enum: ['react', 'vue', 'angular'],
            description: 'Framework cible' 
          },
          component_name: { type: 'string', description: 'Nom du composant à créer' }
        },
        required: ['html_code', 'target_framework']
      }
    },
    {
      name: 'get_dsfr_icons',
      description: 'Liste et recherche les icônes DSFR disponibles',
      inputSchema: {
        type: 'object',
        properties: {
          category: { type: 'string', description: 'Catégorie d\'icônes' },
          search: { type: 'string', description: 'Recherche par nom' }
        }
      }
    },
    {
      name: 'get_dsfr_colors',
      description: 'Obtient la palette de couleurs DSFR',
      inputSchema: {
        type: 'object',
        properties: {
          include_utilities: { type: 'boolean', default: true },
          format: { type: 'string', enum: ['hex', 'rgb', 'hsl'], default: 'hex' }
        }
      }
    }
  ];
}

/**
 * Gestionnaire des outils MCP
 */
async function handleToolCall(toolName, args, container) {
  const logger = container.resolve('logger');
  
  try {
    switch (toolName) {
      // Outils de recherche (service optimisé)
      case 'search_dsfr_components':
        return await container.resolve('documentationService').searchComponents(args);
        
      case 'get_component_details':
        return await container.resolve('documentationService').getComponentDetails(args);
        
      case 'list_dsfr_categories':
        return await container.resolve('documentationService').listCategories();
        
      case 'search_patterns':
        return await container.resolve('documentationService').searchPatterns(args);
        
      case 'get_dsfr_icons':
        return await container.resolve('documentationService').getIcons(args);
        
      case 'get_dsfr_colors':
        return await container.resolve('documentationService').getColors(args);

      // Outils de génération (services existants)
      case 'generate_dsfr_component':
        return await container.resolve('generatorService').generateComponent(args);
        
      case 'generate_dsfr_template':
        return await container.resolve('templateService').generateTemplate(args);
        
      case 'create_dsfr_theme':
        return await container.resolve('generatorService').createTheme(args);
        
      case 'convert_to_framework':
        return await container.resolve('generatorService').convertToFramework(args);

      // Outils de validation (services existants)
      case 'validate_dsfr_html':
        return await container.resolve('validationService').validateHTML(args);
        
      case 'check_accessibility':
        return await container.resolve('accessibilityService').checkAccessibility(args);
        
      default:
        throw new Error(`Outil inconnu: ${toolName}`);
    }
  } catch (error) {
    logger.error(`Erreur lors de l'exécution de ${toolName}`, error);
    return {
      content: [{
        type: 'text',
        text: `Erreur lors de l'exécution de ${toolName}: ${error.message}`
      }]
    };
  }
}

/**
 * Initialisation du serveur
 */
async function initializeServer() {
  const startTime = Date.now();
  let container = null;
  
  try {
    // Configuration du container
    container = setupContainer();
    
    // Initialisation des services de base
    const config = container.resolve('config');
    const logger = container.resolve('logger');
    
    await config.initialize();
    await logger.initialize();
    
    const maxStartupTime = config.get('performance.maxStartupTime', 2000);
    
    logger.info('Initialisation du serveur DSFR-MCP v2', {
      version: config.get('server.version'),
      maxStartupTime
    });

    // Initialisation du cache
    const cache = container.resolve('cache');
    await cache.initialize();

    // Initialisation des services principaux (en parallèle)
    const services = [
      'documentationService',
      'validationService',
      'generatorService',
      'templateService',
      'accessibilityService'
    ];

    await Promise.all(
      services.map(async (serviceName) => {
        const service = container.resolve(serviceName);
        if (service && typeof service.initialize === 'function') {
          await service.initialize();
        }
      })
    );

    // Création du serveur MCP
    const server = new Server(
      {
        name: config.get('server.name'),
        version: config.get('server.version')
      },
      {
        capabilities: {
          tools: {}
        }
      }
    );

    // Configuration des gestionnaires
    server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: getToolDefinitions(config)
      };
    });

    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      return await handleToolCall(name, args, container);
    });

    const initTime = Date.now() - startTime;
    
    if (initTime > maxStartupTime) {
      logger.warn(`Temps d'initialisation dépassé: ${initTime}ms > ${maxStartupTime}ms`);
    } else {
      logger.info(`Serveur initialisé en ${initTime}ms`);
    }

    // Démarrage du transport
    const transport = new StdioServerTransport();
    await server.connect(transport);

    // Gestion de la fermeture propre
    const cleanup = async () => {
      logger.info('Arrêt du serveur...');
      if (container) {
        container.dispose();
      }
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);

  } catch (error) {
    if (container) {
      const logger = container.resolve('logger');
      logger.error('Erreur lors de l\'initialisation du serveur', error);
      container.dispose();
    }
    process.exit(1);
  }
}

/**
 * Gestion des erreurs non capturées
 */
process.on('uncaughtException', (error) => {
  // Ne pas écrire sur stderr/stdout pour éviter de corrompre le protocole JSON-RPC
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  // Ne pas écrire sur stderr/stdout pour éviter de corrompre le protocole JSON-RPC
  process.exit(1);
});

// Lancement
if (require.main === module) {
  initializeServer().catch(() => {
    process.exit(1);
  });
}

module.exports = { initializeServer, setupContainer };