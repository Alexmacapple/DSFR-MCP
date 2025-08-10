const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');

// Import des services
const DocumentationService = require('../../src/services/documentation');
const ValidationService = require('../../src/services/validation');
const AccessibilityService = require('../../src/services/accessibility');
const GeneratorService = require('../../src/services/generator');

describe.skip('MCP Server Integration', () => {
  let server;
  let documentationService;
  let validationService;
  let accessibilityService;
  let generatorService;
  
  beforeAll(async () => {
    // Initialize services
    documentationService = new DocumentationService();
    validationService = new ValidationService();
    accessibilityService = new AccessibilityService();
    generatorService = new GeneratorService();
    
    // Create MCP server
    server = new Server(
      {
        name: 'dsfr-documentation-test',
        version: '1.0.0'
      },
      {
        capabilities: {
          tools: {}
        }
      }
    );
    
    // Register MCP tools
    await registerMCPTools();
  }, 30000); // Increased timeout for initialization
  
  async function registerMCPTools() {
    // search_dsfr_components
    server.setRequestHandler('tools/call', async (request) => {
      const { name, arguments: args } = request.params;
      
      try {
        switch (name) {
          case 'search_dsfr_components':
            return await documentationService.searchComponents(args);
            
          case 'get_component_details':
            return await documentationService.getComponentDetails(args);
            
          case 'list_dsfr_categories':
            return await documentationService.listCategories();
            
          case 'validate_dsfr_html':
            return await validationService.validateHTML(args);
            
          case 'check_accessibility':
            return await accessibilityService.checkAccessibility(args);
            
          case 'generate_dsfr_component':
            return await generatorService.generateComponent(args);
            
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `Erreur: ${error.message}`
          }],
          isError: true
        };
      }
    });
    
    // Register tool schemas
    server.setRequestHandler('tools/list', async () => {
      return {
        tools: [
          {
            name: 'search_dsfr_components',
            description: 'Recherche des composants DSFR',
            inputSchema: {
              type: 'object',
              properties: {
                query: { type: 'string', description: 'Terme de recherche' },
                category: { type: 'string', description: 'Catégorie à filtrer' },
                limit: { type: 'number', description: 'Nombre de résultats' }
              },
              required: ['query']
            }
          },
          {
            name: 'get_component_details',
            description: 'Obtient les détails d\'un composant DSFR',
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
            description: 'Liste toutes les catégories DSFR',
            inputSchema: { type: 'object', properties: {} }
          },
          {
            name: 'validate_dsfr_html',
            description: 'Valide du code HTML DSFR',
            inputSchema: {
              type: 'object',
              properties: {
                html_code: { type: 'string', description: 'Code HTML à valider' },
                check_accessibility: { type: 'boolean', description: 'Vérifier l\'accessibilité' },
                strict_mode: { type: 'boolean', description: 'Mode strict' }
              },
              required: ['html_code']
            }
          },
          {
            name: 'check_accessibility',
            description: 'Vérifie l\'accessibilité RGAA',
            inputSchema: {
              type: 'object',
              properties: {
                html_code: { type: 'string', description: 'Code HTML à vérifier' },
                rgaa_level: { type: 'string', description: 'Niveau RGAA' }
              },
              required: ['html_code']
            }
          },
          {
            name: 'generate_dsfr_component',
            description: 'Génère un composant DSFR',
            inputSchema: {
              type: 'object',
              properties: {
                component_type: { type: 'string', description: 'Type de composant' },
                framework: { type: 'string', description: 'Framework cible' },
                options: { type: 'object', description: 'Options du composant' }
              },
              required: ['component_type']
            }
          }
        ]
      };
    });
  }
  
  describe('MCP Protocol Compliance', () => {
    it('should list all available tools', async () => {
      // Act
      const result = await server.request({
        method: 'tools/list',
        params: {}
      });
      
      // Assert
      expect(result.tools).toBeDefined();
      expect(result.tools).toHaveLength(6);
      expect(result.tools.map(t => t.name)).toContain('search_dsfr_components');
      expect(result.tools.map(t => t.name)).toContain('validate_dsfr_html');
    });
    
    it('should have valid input schemas for all tools', async () => {
      // Act
      const result = await server.request({
        method: 'tools/list',
        params: {}
      });
      
      // Assert
      result.tools.forEach(tool => {
        expect(tool.inputSchema).toBeDefined();
        expect(tool.inputSchema.type).toBe('object');
        expect(tool.inputSchema.properties).toBeDefined();
      });
    });
  });
  
  describe('Tool Integration Tests', () => {
    it('should search DSFR components successfully', async () => {
      // Act
      const result = await server.request({
        method: 'tools/call',
        params: {
          name: 'search_dsfr_components',
          arguments: { query: 'button', limit: 5 }
        }
      });
      
      // Assert
      expect(result.content).toBeDefined();
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('button');
    });
    
    it('should get component details', async () => {
      // Act
      const result = await server.request({
        method: 'tools/call',
        params: {
          name: 'get_component_details',
          arguments: { component_name: 'button' }
        }
      });
      
      // Assert
      expect(result.content).toBeDefined();
      expect(result.content[0].type).toBe('text');
    });
    
    it('should list categories', async () => {
      // Act
      const result = await server.request({
        method: 'tools/call',
        params: {
          name: 'list_dsfr_categories',
          arguments: {}
        }
      });
      
      // Assert
      expect(result.content).toBeDefined();
      expect(result.content[0].text).toContain('Catégories DSFR');
    });
    
    it('should validate HTML', async () => {
      // Arrange
      const htmlCode = '<button class="fr-btn">Test</button>';
      
      // Act
      const result = await server.request({
        method: 'tools/call',
        params: {
          name: 'validate_dsfr_html',
          arguments: { html_code: htmlCode }
        }
      });
      
      // Assert
      expect(result.content).toBeDefined();
      expect(result.content[0].text).toContain('Validation');
    });
    
    it('should check accessibility', async () => {
      // Arrange
      const htmlCode = '<img src="test.jpg" alt="Test image" />';
      
      // Act
      const result = await server.request({
        method: 'tools/call',
        params: {
          name: 'check_accessibility',
          arguments: { html_code: htmlCode, rgaa_level: 'AA' }
        }
      });
      
      // Assert
      expect(result.content).toBeDefined();
      expect(result.content[0].text).toContain('Accessibilité');
    });
    
    it('should generate components', async () => {
      // Act
      const result = await server.request({
        method: 'tools/call',
        params: {
          name: 'generate_dsfr_component',
          arguments: { 
            component_type: 'button',
            framework: 'vanilla'
          }
        }
      });
      
      // Assert
      expect(result.content).toBeDefined();
      expect(result.content[0].text).toContain('Composant');
    });
  });
  
  describe('Error Handling', () => {
    it('should handle unknown tool gracefully', async () => {
      // Act & Assert
      await expect(server.request({
        method: 'tools/call',
        params: {
          name: 'unknown_tool',
          arguments: {}
        }
      })).rejects.toThrow();
    });
    
    it('should handle invalid parameters', async () => {
      // Act
      const result = await server.request({
        method: 'tools/call',
        params: {
          name: 'search_dsfr_components',
          arguments: {} // Missing required 'query' parameter
        }
      });
      
      // Assert
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Erreur');
    });
    
    it('should handle service errors gracefully', async () => {
      // Act
      const result = await server.request({
        method: 'tools/call',
        params: {
          name: 'validate_dsfr_html',
          arguments: { html_code: null } // Invalid HTML
        }
      });
      
      // Assert
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Erreur');
    });
  });
  
  describe('Response Format Compliance', () => {
    it('should return proper MCP response format for search', async () => {
      // Act
      const result = await server.request({
        method: 'tools/call',
        params: {
          name: 'search_dsfr_components',
          arguments: { query: 'button' }
        }
      });
      
      // Assert
      expect(result).toHaveProperty('content');
      expect(Array.isArray(result.content)).toBe(true);
      expect(result.content[0]).toHaveProperty('type');
      expect(result.content[0]).toHaveProperty('text');
      expect(result.content[0].type).toBe('text');
      expect(typeof result.content[0].text).toBe('string');
    });
    
    it('should return consistent response format across all tools', async () => {
      const tools = [
        { name: 'search_dsfr_components', args: { query: 'button' } },
        { name: 'get_component_details', args: { component_name: 'button' } },
        { name: 'list_dsfr_categories', args: {} },
        { name: 'validate_dsfr_html', args: { html_code: '<div></div>' } },
        { name: 'check_accessibility', args: { html_code: '<div></div>' } },
        { name: 'generate_dsfr_component', args: { component_type: 'button' } }
      ];
      
      for (const tool of tools) {
        // Act
        const result = await server.request({
          method: 'tools/call',
          params: {
            name: tool.name,
            arguments: tool.args
          }
        });
        
        // Assert
        expect(result).toHaveProperty('content');
        expect(Array.isArray(result.content)).toBe(true);
        expect(result.content[0]).toHaveProperty('type');
        expect(result.content[0]).toHaveProperty('text');
        expect(result.content[0].type).toBe('text');
      }
    });
  });
  
  describe('Performance Tests', () => {
    it('should respond to search requests within reasonable time', async () => {
      const startTime = Date.now();
      
      // Act
      await server.request({
        method: 'tools/call',
        params: {
          name: 'search_dsfr_components',
          arguments: { query: 'button', limit: 10 }
        }
      });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Assert
      expect(duration).toBeLessThan(5000); // Should respond within 5 seconds
    });
    
    it('should handle multiple concurrent requests', async () => {
      // Arrange
      const requests = Array(5).fill().map((_, index) => 
        server.request({
          method: 'tools/call',
          params: {
            name: 'search_dsfr_components',
            arguments: { query: `test${index}` }
          }
        })
      );
      
      // Act
      const results = await Promise.all(requests);
      
      // Assert
      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result.content).toBeDefined();
      });
    });
  });
});