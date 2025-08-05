const GeneratorService = require('../../../src/services/generator');

// Mock du parser DSFR
jest.mock('../../../src/services/dsfr-source-parser-silent', () => {
  return jest.fn().mockImplementation(() => ({
    parseSourceFile: jest.fn(),
    getComponent: jest.fn()
  }));
});

describe('GeneratorService', () => {
  let service;
  let mockParser;
  
  beforeEach(() => {
    service = new GeneratorService();
    mockParser = service.sourceParser;
    jest.clearAllMocks();
  });
  
  describe('constructor', () => {
    it('should initialize with source parser', () => {
      expect(service.sourceParser).toBeDefined();
      expect(service.initialized).toBe(false);
    });
  });
  
  describe('initialize', () => {
    it('should initialize the source parser', async () => {
      // Arrange
      mockParser.parseSourceFile.mockResolvedValue();
      
      // Act
      await service.initialize();
      
      // Assert
      expect(mockParser.parseSourceFile).toHaveBeenCalledTimes(1);
      expect(service.initialized).toBe(true);
    });
    
    it('should not re-initialize if already initialized', async () => {
      // Arrange
      service.initialized = true;
      
      // Act
      await service.initialize();
      
      // Assert
      expect(mockParser.parseSourceFile).not.toHaveBeenCalled();
    });
  });
  
  describe('generateComponent', () => {
    const mockComponent = {
      name: 'button',
      examples: [{
        content: '<button class="fr-btn">Test</button>'
      }],
      scripts: { main: 'button.js' },
      schema: {
        properties: {
          variant: { enum: ['primary', 'secondary'] }
        }
      }
    };
    
    beforeEach(() => {
      mockParser.parseSourceFile.mockResolvedValue();
    });
    
    it('should generate vanilla component successfully', async () => {
      // Arrange
      mockParser.getComponent.mockReturnValue(mockComponent);
      
      // Act
      const result = await service.generateComponent({
        component_type: 'button',
        framework: 'vanilla'
      });
      
      // Assert
      expect(result.content[0].text).toContain('Composant DSFR : button');
      expect(result.content[0].text).toContain('## HTML');
      expect(result.content[0].text).toContain('fr-btn');
      expect(result.content[0].text).toContain('## CSS requis');
      expect(result.content[0].text).toContain('## JavaScript');
    });
    
    it('should generate React component', async () => {
      // Arrange
      mockParser.getComponent.mockReturnValue(mockComponent);
      
      // Act
      const result = await service.generateComponent({
        component_type: 'button',
        framework: 'react',
        options: { variant: 'primary' }
      });
      
      // Assert
      expect(result.content[0].text).toContain('React');
      expect(result.content[0].text).toContain('import React');
    });
    
    it('should generate Vue component', async () => {
      // Arrange
      mockParser.getComponent.mockReturnValue(mockComponent);
      
      // Act
      const result = await service.generateComponent({
        component_type: 'button',
        framework: 'vue'
      });
      
      // Assert
      expect(result.content[0].text).toContain('Vue');
      expect(result.content[0].text).toContain('<template>');
    });
    
    it('should generate Angular component', async () => {
      // Arrange
      mockParser.getComponent.mockReturnValue(mockComponent);
      
      // Act
      const result = await service.generateComponent({
        component_type: 'button',
        framework: 'angular'
      });
      
      // Assert
      expect(result.content[0].text).toContain('Angular');
      expect(result.content[0].text).toContain('@Component');
    });
    
    it('should handle non-existent component', async () => {
      // Arrange
      mockParser.getComponent.mockReturnValue(null);
      
      // Act
      const result = await service.generateComponent({
        component_type: 'non-existent'
      });
      
      // Assert
      expect(result.content[0].text).toContain('Composant "non-existent" non trouvé');
    });
    
    it('should handle unsupported framework', async () => {
      // Arrange
      mockParser.getComponent.mockReturnValue(mockComponent);
      
      // Act
      const result = await service.generateComponent({
        component_type: 'button',
        framework: 'unsupported'
      });
      
      // Assert
      expect(result.content[0].text).toContain('Framework "unsupported" non supporté');
    });
    
    it('should use default framework when not specified', async () => {
      // Arrange
      mockParser.getComponent.mockReturnValue(mockComponent);
      
      // Act
      const result = await service.generateComponent({
        component_type: 'button'
      });
      
      // Assert
      expect(result.content[0].text).toContain('## HTML');
      expect(result.content[0].text).not.toContain('React');
    });
  });
  
  describe('generateVanillaComponent', () => {
    it('should generate HTML section', () => {
      // Arrange
      const component = {
        name: 'button',
        examples: [{ content: '<button class="fr-btn">Click me</button>' }],
        scripts: {},
        schema: null
      };
      
      // Act
      const result = service.generateVanillaComponent(component, {});
      
      // Assert
      expect(result).toContain('# Composant DSFR : button');
      expect(result).toContain('## HTML');
      expect(result).toContain('```html');
      expect(result).toContain('fr-btn');
    });
    
    it('should generate CSS import section', () => {
      // Arrange
      const component = { name: 'button', examples: [], scripts: {} };
      
      // Act
      const result = service.generateVanillaComponent(component, {});
      
      // Assert
      expect(result).toContain('## CSS requis');
      expect(result).toContain('@import "@gouvfr/dsfr/dist/component/button/button.css"');
    });
    
    it('should include JavaScript section for interactive components', () => {
      // Arrange
      const component = {
        name: 'accordion',
        examples: [],
        scripts: { main: 'accordion.js' }
      };
      
      // Act
      const result = service.generateVanillaComponent(component, {});
      
      // Assert
      expect(result).toContain('## JavaScript');
      expect(result).toContain("import '@gouvfr/dsfr/dist/component/accordion/accordion.js'");
    });
    
    it('should handle components without examples', () => {
      // Arrange
      const component = { name: 'custom', examples: [], scripts: {} };
      
      // Act
      const result = service.generateVanillaComponent(component, {});
      
      // Assert
      expect(result).toContain('## HTML');
      expect(result).toContain('```html');
    });
  });
  
  describe('generateReactComponent', () => {
    it('should generate React component structure', () => {
      // Arrange
      const component = {
        name: 'button',
        examples: [{ content: '<button class="fr-btn">Click</button>' }]
      };
      
      // Act
      const result = service.generateReactComponent(component, {});
      
      // Assert
      expect(result).toContain('# Composant React DSFR : button');
      expect(result).toContain('import React');
      expect(result).toContain('export default');
      expect(result).toContain('className="fr-btn"');
    });
    
    it('should handle component options', () => {
      // Arrange
      const component = { name: 'button', examples: [] };
      const options = { variant: 'secondary', size: 'large' };
      
      // Act
      const result = service.generateReactComponent(component, options);
      
      // Assert
      expect(result).toContain('variant');
      expect(result).toContain('size');
    });
  });
  
  describe('generateVueComponent', () => {
    it('should generate Vue component structure', () => {
      // Arrange
      const component = {
        name: 'button',
        examples: [{ content: '<button class="fr-btn">Click</button>' }]
      };
      
      // Act
      const result = service.generateVueComponent(component, {});
      
      // Assert
      expect(result).toContain('# Composant Vue.js DSFR : button');
      expect(result).toContain('<template>');
      expect(result).toContain('<script>');
      expect(result).toContain('export default');
    });
  });
  
  describe('generateAngularComponent', () => {
    it('should generate Angular component structure', () => {
      // Arrange
      const component = {
        name: 'button',
        examples: [{ content: '<button class="fr-btn">Click</button>' }]
      };
      
      // Act
      const result = service.generateAngularComponent(component, {});
      
      // Assert
      expect(result).toContain('# Composant Angular DSFR : button');
      expect(result).toContain('@Component');
      expect(result).toContain('selector:');
      expect(result).toContain('template:');
    });
  });
  
  describe('cleanHTMLExample', () => {
    it('should clean HTML example code', () => {
      // Arrange
      const dirtyHTML = '  <button class="fr-btn">  Test  </button>  ';
      
      // Act
      const result = service.cleanHTMLExample(dirtyHTML);
      
      // Assert
      expect(result).toBe('<button class="fr-btn">Test</button>');
    });
    
    it('should handle multiline HTML', () => {
      // Arrange
      const multilineHTML = `
        <div class="fr-card">
          <div class="fr-card__body">
            <h3>Title</h3>
          </div>
        </div>
      `;
      
      // Act
      const result = service.cleanHTMLExample(multilineHTML);
      
      // Assert
      expect(result).toContain('<div class="fr-card">');
      expect(result).toContain('<h3>Title</h3>');
    });
  });
  
  describe('generateDefaultHTML', () => {
    it('should generate default HTML for known components', () => {
      // Act
      const buttonHTML = service.generateDefaultHTML('button', {});
      const cardHTML = service.generateDefaultHTML('card', {});
      
      // Assert
      expect(buttonHTML).toContain('fr-btn');
      expect(cardHTML).toContain('fr-card');
    });
    
    it('should handle unknown components', () => {
      // Act
      const result = service.generateDefaultHTML('unknown', {});
      
      // Assert
      expect(result).toContain('unknown');
    });
  });
  
  describe('convertClassesToFramework', () => {
    it('should convert CSS classes for React', () => {
      // Arrange
      const html = '<div class="fr-container fr-grid-row"></div>';
      
      // Act
      const result = service.convertClassesToFramework(html, 'react');
      
      // Assert
      expect(result).toContain('className="fr-container fr-grid-row"');
    });
    
    it('should handle Vue.js class binding', () => {
      // Arrange
      const html = '<div class="fr-btn fr-btn--secondary"></div>';
      
      // Act
      const result = service.convertClassesToFramework(html, 'vue');
      
      // Assert
      expect(result).toContain('class="fr-btn fr-btn--secondary"');
    });
  });
});