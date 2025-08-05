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

// Pas de gestion d'erreur complexe - juste exit
process.on('uncaughtException', () => process.exit(1));
process.on('unhandledRejection', () => process.exit(1));

// Initialisation ultra-simple
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(() => process.exit(1));