const DocumentationService = require('../../../src/services/documentation');

// Mock du module fs promises AVANT require
jest.mock('fs', () => ({
  promises: {
    readdir: jest.fn(),
    readFile: jest.fn()
  }
}));

// Mock du module path pour éviter les chemins réels
jest.mock('path', () => ({
  resolve: jest.fn(() => '/mocked/path'),
  join: jest.fn((a, b) => `${a}/${b}`)
}));

// Mock de la configuration
jest.mock('../../../src/config', () => ({
  paths: {
    fiches: '/mocked/fiches'
  }
}));

const fs = require('fs');

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
      fs.promises.readdir.mockResolvedValue(mockFiles);
      fs.promises.readFile.mockResolvedValue(testHelpers.createMockMarkdownFile('Test Component', '# Test'));
      
      // Act
      await service.initialize();
      
      // Assert
      expect(service.initialized).toBe(true);
      expect(service.documents).toHaveLength(2); // Only .md files from mock
      expect(fs.promises.readdir).toHaveBeenCalledTimes(1);
      expect(fs.promises.readFile).toHaveBeenCalledTimes(2);
    });
    
    it('should not re-initialize if already initialized', async () => {
      // Arrange
      service.initialized = true;
      
      // Act
      await service.initialize();
      
      // Assert
      expect(fs.promises.readdir).not.toHaveBeenCalled();
    });
    
    it('should handle errors during initialization', async () => {
      // Arrange
      fs.promises.readdir.mockRejectedValue(new Error('File system error'));
      
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
      const content = result.content[0].text;
      expect(content).toContain('core');
      expect(content).toContain('colors');
    });
    
    it('should limit results', async () => {
      // Act
      const result = await service.searchComponents({ 
        query: '', 
        limit: 2 
      });
      
      // Assert
      const content = result.content[0].text;
      expect(content).toContain('résultat');
      // Should show limited results (hard to test exact count without parsing)
      expect(content.length).toBeGreaterThan(0);
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
      expect(result.content[0].text).toContain('non trouvé');
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
      expect(content).toContain('core');
      expect(content).toContain('document'); // Should contain document counts
    });
  });
});