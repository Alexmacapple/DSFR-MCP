#!/usr/bin/env node

// ==============================================
// DSFR-MCP Server - Version Docker
// Mode: Stdio + Keep-Alive pour container
// ==============================================

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');

// Import des services (identique à index.js)
const DocumentationService = require('./services/documentation.js');

// Initialisation du serveur MCP
const server = new Server(
  {
    name: 'dsfr-mcp',
    version: '1.3.1',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Initialisation du service de documentation
const docService = new DocumentationService();

// Configuration des outils MCP (identique à index.js)
server.setRequestHandler('tools/list', async () => {
  return {
    tools: [
      {
        name: 'search_dsfr_components',
        description: 'Recherche des composants DSFR par nom, catégorie ou mot-clé',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Terme de recherche',
            },
            category: {
              type: 'string',
              enum: ['core', 'component', 'layout', 'utility', 'analytics', 'scheme'],
              description: 'Catégorie à filtrer',
            },
            limit: {
              type: 'integer',
              default: 10,
              description: 'Nombre de résultats',
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'get_component_details',
        description: 'Obtient les détails complets d\'un composant DSFR',
        inputSchema: {
          type: 'object',
          properties: {
            component_name: {
              type: 'string',
              description: 'Nom du composant',
            },
            include_examples: {
              type: 'boolean',
              default: true,
            },
            include_accessibility: {
              type: 'boolean',
              default: true,
            },
          },
          required: ['component_name'],
        },
      },
      {
        name: 'list_dsfr_categories',
        description: 'Liste toutes les catégories DSFR disponibles',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      }
    ]
  };
});

// Gestionnaire pour search_dsfr_components
server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'search_dsfr_components':
      try {
        const results = await docService.searchComponents(args.query, {
          category: args.category,
          limit: args.limit || 10,
        });

        if (results.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: `Aucun résultat trouvé pour "${args.query}".`,
              },
            ],
          };
        }

        const response = results.map(result => 
          `**${result.title}** (${result.category})\n${result.description || 'Pas de description disponible'}\n`
        ).join('\n');

        return {
          content: [
            {
              type: 'text',
              text: response,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Erreur lors de la recherche: ${error.message}`,
            },
          ],
        };
      }

    case 'get_component_details':
      return {
        content: [
          {
            type: 'text',
            text: `Détails du composant "${args.component_name}" en cours de développement.`,
          },
        ],
      };

    case 'list_dsfr_categories':
      return {
        content: [
          {
            type: 'text',
            text: 'Catégories DSFR: core, component, layout, utility, analytics, scheme',
          },
        ],
      };

    default:
      throw new Error(`Outil inconnu: ${name}`);
  }
});

// Initialisation du serveur (version Docker)
async function main() {
  console.error('[DOCKER] Initialisation du serveur MCP DSFR...');
  
  try {
    // Indexation initiale de la documentation
    await docService.initialize();
    console.error('[DOCKER] Documentation indexée avec succès');
    
    // Démarrage du transport stdio
    const transport = new StdioServerTransport();
    await server.connect(transport);
    
    console.error('[DOCKER] Serveur MCP DSFR démarré et prêt');
    
    // Keep-alive pour Docker: empêcher la fermeture du processus
    setInterval(() => {
      console.error('[DOCKER] Keep-alive signal');
    }, 30000); // Toutes les 30 secondes
    
  } catch (error) {
    console.error(`[DOCKER] Erreur lors de l'initialisation: ${error.message}`);
    process.exit(1);
  }
}

// Gestion des erreurs
process.on('uncaughtException', (error) => {
  console.error(`[DOCKER] Erreur non gérée: ${error.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(`[DOCKER] Promise rejetée: ${reason}`);
  process.exit(1);
});

// Gestion des signaux pour un arrêt propre
process.on('SIGTERM', () => {
  console.error('[DOCKER] Signal SIGTERM reçu, arrêt du serveur...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.error('[DOCKER] Signal SIGINT reçu, arrêt du serveur...');
  process.exit(0);
});

// Démarrage
main().catch(error => {
  console.error(`[DOCKER] Erreur fatale: ${error.message}`);
  process.exit(1);
});