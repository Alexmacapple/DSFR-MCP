const DocumentationService = require('../../../src/services/documentation');
const fs = require('fs').promises;
const path = require('path');

// Mock du module fs
jest.mock('fs', () => ({
  promises: {
    readdir: jest.fn(),
    readFile: jest.fn()
  }
}));

describe('DocumentationService', () => {
  let service;
  
  beforeEach(() => {
    service = new DocumentationService();
    jest.clearAllMocks();
  });
  
  describe('initialize', () => {
    it('should initialize the service successfully', async () => {
      // Arrange
      const mockFiles = ['component1.md', 'component2.md', 'not-md.txt'];
      fs.readdir.mockResolvedValue(mockFiles);
      fs.readFile.mockResolvedValue(testHelpers.createMockMarkdownFile('Test Component', '# Test'));
      
      // Act
      await service.initialize();
      
      // Assert
      expect(service.initialized).toBe(true);
      expect(service.documents).toHaveLength(2); // Only .md files
      expect(fs.readdir).toHaveBeenCalledTimes(1);
      expect(fs.readFile).toHaveBeenCalledTimes(2);
    });
    
    it('should not re-initialize if already initialized', async () => {
      // Arrange
      service.initialized = true;
      
      // Act
      await service.initialize();
      
      // Assert
      expect(fs.readdir).not.toHaveBeenCalled();
    });
    
    it('should handle errors during initialization', async () => {
      // Arrange
      fs.readdir.mockRejectedValue(new Error('File system error'));
      
      // Act & Assert
      await expect(service.initialize()).rejects.toThrow('File system error');
    });
  });
  
  describe('parseDocument', () => {
    it('should parse a markdown document correctly', () => {
      // Arrange
      const filename = 'button.md';
      const content = `URL:
https://example.com/button
Title:
Bouton - Système de design
Markdown:
# Bouton
Le composant bouton permet...`;
      
      // Act
      const result = service.parseDocument(filename, content);
      
      // Assert
      expect(result).toMatchObject({
        id: 'button',
        filename: 'button.md',
        url: 'https://example.com/button',
        title: 'Bouton - Système de design',
        category: 'component',
        tags: expect.arrayContaining(['bouton'])
      });
      expect(result.content).toContain('# Bouton');
    });
    
    it('should extract code examples from markdown', () => {
      // Arrange
      const content = `URL:
https://example.com
Title:
Test
Markdown:
\`\`\`html
<button class="fr-btn">Click me</button>
\`\`\``;
      
      // Act
      const result = service.parseDocument('test.md', content);
      
      // Assert
      expect(result.codeExamples).toHaveLength(1);
      expect(result.codeExamples[0]).toMatchObject({
        code: '<button class="fr-btn">Click me</button>',
        language: 'html'
      });
    });
  });
  
  describe('searchComponents', () => {
    beforeEach(async () => {
      // Préparer des documents de test
      service.documents = [
        testHelpers.createMockComponent('button', 'component'),
        testHelpers.createMockComponent('accordion', 'component'),
        testHelpers.createMockComponent('form', 'component'),
        testHelpers.createMockComponent('colors', 'core')
      ];
      service.createSearchIndex();
    });
    
    it('should search components by query', async () => {
      // Act
      const result = await service.searchComponents({ query: 'button' });
      
      // Assert
      expect(result.content[0].text).toContain('button');
      expect(result.content[0].text).toContain('1 résultat');
    });
    
    it('should filter by category', async () => {
      // Act
      const result = await service.searchComponents({ 
        query: '', 
        category: 'core' 
      });
      
      // Assert
      const results = JSON.parse(result.content[0].text.match(/```json\n(.*?)\n```/s)[1]);
      expect(results.total).toBe(1);
      expect(results.results[0].category).toBe('core');
    });
    
    it('should limit results', async () => {
      // Act
      const result = await service.searchComponents({ 
        query: '', 
        limit: 2 
      });
      
      // Assert
      const results = JSON.parse(result.content[0].text.match(/```json\n(.*?)\n```/s)[1]);
      expect(results.results.length).toBeLessThanOrEqual(2);
    });
  });
  
  describe('getComponentDetails', () => {
    beforeEach(() => {
      const buttonComponent = testHelpers.createMockComponent('button');
      buttonComponent.codeExamples = [{
        code: '<button class="fr-btn">Test</button>',
        language: 'html'
      }];
      service.componentsMap.set('button', buttonComponent);
    });
    
    it('should get component details', async () => {
      // Act
      const result = await service.getComponentDetails({ 
        component_name: 'button' 
      });
      
      // Assert
      expect(result.content[0].text).toContain('button');
      expect(result.content[0].text).toContain('Système de design');
      expect(result.content[0].text).toContain('fr-btn');
    });
    
    it('should handle non-existent component', async () => {
      // Act
      const result = await service.getComponentDetails({ 
        component_name: 'non-existent' 
      });
      
      // Assert
      expect(result.content[0].text).toContain('Composant non trouvé');
    });
  });
  
  describe('listCategories', () => {
    beforeEach(() => {
      service.categories.set('component', [
        testHelpers.createMockComponent('button'),
        testHelpers.createMockComponent('form')
      ]);
      service.categories.set('core', [
        testHelpers.createMockComponent('colors', 'core')
      ]);
    });
    
    it('should list all categories with counts', async () => {
      // Act
      const result = await service.listCategories();
      
      // Assert
      const content = result.content[0].text;
      expect(content).toContain('component');
      expect(content).toContain('2 éléments');
      expect(content).toContain('core');
      expect(content).toContain('1 élément');
    });
  });
});
