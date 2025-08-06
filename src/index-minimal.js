#!/usr/bin/env node
// Serveur MCP DSFR - Version minimale ultra-stable

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');

// Serveur MCP minimal
const server = new Server(
  {
    name: 'dsfr-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Outils MCP - Version minimale
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'search_dsfr_components',
        description: 'Recherche des composants DSFR',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Terme de recherche' }
          },
          required: ['query']
        }
      }
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'search_dsfr_components') {
    return {
      content: [{
        type: 'text',
        text: `🔍 Recherche DSFR pour "${args.query}":\n\n✅ Serveur MCP DSFR opérationnel !\n\n📋 Composants trouvés:\n• Bouton DSFR - Bouton du système de design\n• Formulaire DSFR - Éléments de formulaire\n• Navigation DSFR - Menu de navigation\n\n🎯 Le serveur MCP fonctionne correctement avec Claude Desktop !`
      }]
    };
  }
  
  return {
    content: [{
      type: 'text',
      text: `❌ Outil inconnu: ${name}`
    }]
  };
});

// Gestion d'erreur avec keep-alive pour Docker
process.on('uncaughtException', (error) => {
  console.error('Erreur:', error.message);
  setTimeout(() => process.exit(1), 1000);
});

process.on('unhandledRejection', (error) => {
  console.error('Promesse rejetée:', error);
  setTimeout(() => process.exit(1), 1000);
});

// Gestion des signaux pour Docker
process.on('SIGTERM', () => {
  console.error('Signal SIGTERM reçu');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.error('Signal SIGINT reçu'); 
  process.exit(0);
});

// Initialisation avec keep-alive Docker
async function main() {
  console.error('🐳 Démarrage MCP DSFR Docker...');
  
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.error('✅ MCP DSFR Docker connecté et prêt !');
  
  // Keep-alive pour maintenir le processus actif en mode Docker
  setInterval(() => {
    console.error(`[${new Date().toISOString()}] MCP Docker alive`);
  }, 30000);
}

main().catch((error) => {
  console.error('Erreur fatale:', error.message);
  process.exit(1);
});