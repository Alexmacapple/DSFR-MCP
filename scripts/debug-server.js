#!/usr/bin/env node
// Debug version du serveur DSFR MCP

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');

// Log vers stderr pour debug (ne corrompt pas JSON-RPC sur stdout)
function debugLog(message) {
  console.error(`[DEBUG ${new Date().toISOString()}] ${message}`);
}

debugLog('Starting debug server...');

// Serveur MCP minimal pour debug
const server = new Server(
  {
    name: 'dsfr-debug',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

debugLog('Server created');

// Outils simples
server.setRequestHandler(ListToolsRequestSchema, async () => {
  debugLog('ListTools called');
  return {
    tools: [{
      name: 'test_tool',
      description: 'Simple test tool',
      inputSchema: {
        type: 'object',
        properties: {
          message: { type: 'string', description: 'Test message' }
        }
      }
    }],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  debugLog(`CallTool called: ${request.params.name}`);
  const { name, arguments: args } = request.params;
  
  if (name === 'test_tool') {
    return {
      content: [{
        type: 'text',
        text: `Debug server working! Message: ${args.message || 'none'}`
      }]
    };
  }
  
  throw new Error(`Unknown tool: ${name}`);
});

debugLog('Handlers registered');

// Gestion des erreurs
process.on('uncaughtException', (error) => {
  debugLog(`Uncaught exception: ${error.message}`);
  debugLog(`Stack: ${error.stack}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  debugLog(`Unhandled rejection at: ${promise}, reason: ${reason}`);
  process.exit(1);
});

// Démarrage
async function main() {
  try {
    debugLog('Connecting transport...');
    const transport = new StdioServerTransport();
    await server.connect(transport);
    debugLog('Server connected successfully and ready!');
    
    // Garder le processus vivant
    setInterval(() => {
      debugLog('Server still alive...');
    }, 30000);
    
  } catch (error) {
    debugLog(`Error in main: ${error.message}`);
    debugLog(`Stack: ${error.stack}`);
    process.exit(1);
  }
}

debugLog('Starting main...');
main();