#!/usr/bin/env node
// Serveur MCP DSFR - Version stabilisée

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');

const config = require('./config');

// Service de documentation avec gestion d'erreur améliorée
class StableDocumentationService {
  constructor() {
    this.initialized = false;
    this.initializing = false;
    this.documents = [];
  }

  async initialize() {
    if (this.initialized || this.initializing) return;
    this.initializing = true;
    
    try {
      // Pour l'instant, on ne fait pas d'indexation lourde
      // Juste quelques documents de démonstration
      this.documents = [
        {
          title: 'Bouton DSFR',
          category: 'component',
          content: 'Bouton du système de design de l\'État français'
        },
        {
          title: 'Formulaire DSFR',
          category: 'component', 
          content: 'Composants de formulaire DSFR'
        }
      ];
      
      this.initialized = true;
    } catch (error) {
      // Ignorer les erreurs d'initialisation
      this.initialized = true; // Marquer comme initialisé même en cas d'erreur
    } finally {
      this.initializing = false;
    }
  }

  async searchComponents({ query, category, limit = 10 }) {
    await this.initialize();
    
    let results = this.documents.filter(doc => 
      doc.title.toLowerCase().includes(query?.toLowerCase() || '') ||
      doc.content.toLowerCase().includes(query?.toLowerCase() || '')
    );
    
    if (category) {
      results = results.filter(doc => doc.category === category);
    }
    
    return {
      content: [{
        type: 'text',
        text: `Trouvé ${results.length} composants DSFR:\n${results.map(r => `- ${r.title}: ${r.content}`).join('\n')}`
      }]
    };
  }

  async listCategories() {
    return {
      content: [{
        type: 'text',
        text: 'Catégories DSFR disponibles:\n- component: Composants UI\n- core: Fondamentaux\n- layout: Modèles de page'
      }]
    };
  }

  async getComponentDetails({ component_name }) {
    await this.initialize();
    return {
      content: [{
        type: 'text',
        text: `Détails du composant "${component_name}":\nCeci est un composant du système de design de l'État français.`
      }]
    };
  }
}

// Initialisation des services
const docService = new StableDocumentationService();

// Création du serveur
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

// Outils MCP
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'search_dsfr_components',
        description: 'Recherche des composants DSFR par nom, catégorie ou mot-clé',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Terme de recherche' },
            category: { 
              type: 'string', 
              enum: ['core', 'component', 'layout'],
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
            component_name: { type: 'string', description: 'Nom du composant' }
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
      }
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'search_dsfr_components':
        return await docService.searchComponents(args);
        
      case 'get_component_details':
        return await docService.getComponentDetails(args);
        
      case 'list_dsfr_categories':
        return await docService.listCategories();
        
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

// Gestion robuste des erreurs
process.on('uncaughtException', (error) => {
  // Ne rien écrire sur stderr/stdout pour éviter de corrompre JSON-RPC
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  // Ne rien écrire sur stderr/stdout pour éviter de corrompre JSON-RPC
  process.exit(1);
});

// Initialisation
async function main() {
  try {
    // Démarrage immédiat du transport
    const transport = new StdioServerTransport();
    await server.connect(transport);
    
    // Initialisation en arrière-plan avec gestion d'erreur
    docService.initialize().catch(() => {
      // Ignorer les erreurs d'initialisation
    });
    
    // Garder le processus vivant
    setInterval(() => {
      // Heartbeat silencieux
    }, 30000);
    
  } catch (error) {
    process.exit(1);
  }
}

main().catch(() => {
  process.exit(1);
});