#!/usr/bin/env node
// Serveur MCP DSFR - Point d'entrée principal

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');

const config = require('./config');
const DocumentationService = require('./services/documentation');
const ValidationService = require('./services/validation');
const GeneratorService = require('./services/generator');
const TemplateService = require('./services/template');
const AccessibilityService = require('./services/accessibility');

// Initialisation des services
const docService = new DocumentationService();
const validationService = new ValidationService();
const generatorService = new GeneratorService();
const templateService = new TemplateService();
const accessibilityService = new AccessibilityService();

// Création du serveur MCP
const server = new Server(
  {
    name: config.server.name,
    version: config.server.version,
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Gestionnaire pour lister les outils disponibles
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
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
              enum: Object.keys(config.categories),
              description: 'Catégorie à filtrer' 
            },
            limit: { type: 'integer', default: 10, description: 'Nombre de résultats' }
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
              enum: Object.keys(config.frameworks),
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
              enum: Object.keys(config.templates),
              description: 'Nom du template' 
            },
            framework: { type: 'string', enum: Object.keys(config.frameworks), default: 'vanilla' },
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
      },

      // 🆕 NOUVEAUX OUTILS AVANCÉS - Phase 3.1
      {
        name: 'analyze_dsfr_usage',
        description: 'Analyse l\'utilisation du DSFR dans un code source et fournit des recommandations détaillées',
        inputSchema: {
          type: 'object',
          properties: {
            source_code: { 
              type: 'string', 
              minLength: 1,
              maxLength: 100000,
              description: 'Code source à analyser (HTML, CSS, JS)' 
            },
            project_type: { 
              type: 'string', 
              enum: ['vanilla', 'react', 'vue', 'angular', 'auto-detect'],
              default: 'auto-detect',
              description: 'Type de projet à analyser'
            },
            analysis_depth: {
              type: 'string',
              enum: ['basic', 'detailed', 'comprehensive'],
              default: 'detailed',
              description: 'Niveau de profondeur de l\'analyse'
            },
            include_recommendations: {
              type: 'boolean',
              default: true,
              description: 'Inclure des recommandations d\'amélioration'
            }
          },
          required: ['source_code']
        }
      },
      {
        name: 'suggest_improvements',
        description: 'Suggère des améliorations automatiques pour un code HTML selon les critères DSFR',
        inputSchema: {
          type: 'object',
          properties: {
            html_code: {
              type: 'string',
              minLength: 1,
              maxLength: 50000,
              description: 'Code HTML à améliorer'
            },
            improvement_categories: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['accessibility', 'performance', 'seo', 'dsfr-compliance', 'semantics', 'best-practices']
              },
              default: ['accessibility', 'dsfr-compliance', 'best-practices'],
              description: 'Catégories d\'améliorations à analyser'
            },
            priority_level: {
              type: 'string',
              enum: ['critical', 'high', 'medium', 'low', 'all'],
              default: 'high',
              description: 'Niveau de priorité minimum des suggestions'
            },
            include_code_examples: {
              type: 'boolean',
              default: true,
              description: 'Inclure des exemples de code corrigé'
            }
          },
          required: ['html_code']
        }
      },
      {
        name: 'compare_versions',
        description: 'Compare deux versions du DSFR et guide la migration entre versions',
        inputSchema: {
          type: 'object',
          properties: {
            version_from: {
              type: 'string',
              pattern: '^\\d+\\.\\d+\\.\\d+$',
              description: 'Version source du DSFR (ex: 1.13.0)'
            },
            version_to: {
              type: 'string',
              pattern: '^\\d+\\.\\d+\\.\\d+$',
              description: 'Version cible du DSFR (ex: 1.14.0)'
            },
            comparison_scope: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['components', 'styles', 'breaking-changes', 'new-features', 'deprecated', 'accessibility']
              },
              default: ['components', 'breaking-changes', 'new-features'],
              description: 'Aspects à comparer entre les versions'
            },
            include_migration_guide: {
              type: 'boolean',
              default: true,
              description: 'Inclure un guide de migration'
            }
          },
          required: ['version_from', 'version_to']
        }
      },
      {
        name: 'export_documentation',
        description: 'Exporte de la documentation DSFR personnalisée dans différents formats',
        inputSchema: {
          type: 'object',
          properties: {
            export_format: {
              type: 'string',
              enum: ['markdown', 'html', 'json', 'pdf-ready'],
              default: 'markdown',
              description: 'Format d\'export de la documentation'
            },
            components: {
              type: 'array',
              items: {
                type: 'string',
                pattern: '^[a-zA-Z0-9_-]+$'
              },
              description: 'Liste des composants à exporter (vide = tous)'
            },
            include_examples: {
              type: 'boolean',
              default: true,
              description: 'Inclure les exemples de code'
            },
            template_style: {
              type: 'string',
              enum: ['standard', 'compact', 'detailed', 'minimal'],
              default: 'standard',
              description: 'Style de template pour la documentation'
            }
          }
        }
      }
    ],
  };
});

// Gestionnaire pour l'exécution des outils
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      // Outils de recherche
      case 'search_dsfr_components':
        return await docService.searchComponents(args);
        
      case 'get_component_details':
        return await docService.getComponentDetails(args);
        
      case 'list_dsfr_categories':
        return await docService.listCategories();
        
      // Outils de génération
      case 'generate_dsfr_component':
        return await generatorService.generateComponent(args);
        
      case 'generate_dsfr_template':
        return await templateService.generateTemplate(args);
        
      // Outils de validation
      case 'validate_dsfr_html':
        return await validationService.validateHTML(args);
        
      case 'check_accessibility':
        return await accessibilityService.checkAccessibility(args);
        
      // Outils de personnalisation
      case 'create_dsfr_theme':
        return await generatorService.createTheme(args);
        
      // Outils de patterns
      case 'search_patterns':
        return await docService.searchPatterns(args);
        
      // Outils utilitaires
      case 'convert_to_framework':
        return await generatorService.convertToFramework(args);
        
      case 'get_dsfr_icons':
        return await docService.getIcons(args);
        
      case 'get_dsfr_colors':
        return await docService.getColors(args);

      // 🆕 NOUVEAUX OUTILS AVANCÉS - Phase 3.1
      case 'analyze_dsfr_usage':
        return await docService.analyzeUsage(args);
        
      case 'suggest_improvements':
        return await validationService.suggestImprovements(args);
        
      case 'compare_versions':
        return await docService.compareVersions(args);
        
      case 'export_documentation':
        return await generatorService.exportDocumentation(args);
        
      default:
        throw new Error(`Outil inconnu: ${name}`);
    }
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Erreur lors de l'exécution de ${name}: ${error.message}`
      }]
    };
  }
});

// Initialisation du serveur
async function main() {
  // Pas de console.log ici - MCP nécessite du JSON pur sur stdout
  
  // Indexation initiale de la documentation
  await docService.initialize();
  
  // Démarrage du transport stdio
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

// Gestion des erreurs
process.on('uncaughtException', (error) => {
  // Ne pas écrire sur stderr/stdout pour éviter de corrompre le protocole JSON-RPC
  process.exit(1);
});

// Lancement
main().catch((error) => {
  // Ne pas écrire sur stderr/stdout pour éviter de corrompre le protocole JSON-RPC
  process.exit(1);
});

