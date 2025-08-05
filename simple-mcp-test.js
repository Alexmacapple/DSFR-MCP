#!/usr/bin/env node
// Serveur MCP minimal pour test

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');

// Serveur MCP minimal
const server = new Server(
  {
    name: 'test-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Outil de test simple
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [{
      name: 'hello_world',
      description: 'Simple test tool that says hello',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Your name' }
        }
      }
    }],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  if (name === 'hello_world') {
    return {
      content: [{
        type: 'text',
        text: `Hello ${args.name || 'World'}! MCP test server is working! 🎉`
      }]
    };
  }
  
  throw new Error(`Unknown tool: ${name}`);
});

// Démarrage immédiat
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(() => process.exit(1));