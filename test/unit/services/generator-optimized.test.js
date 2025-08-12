/**
 * Tests unitaires pour OptimizedGeneratorService
 * Couvre la génération de composants DSFR optimisée
 */

const OptimizedGeneratorService = require('../../../src/services/generator-optimized');

describe('OptimizedGeneratorService', () => {
  let generatorService;
  let mockLogger;

  beforeEach(() => {
    // Logger mock
    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn()
    };

    generatorService = new OptimizedGeneratorService(mockLogger);
  });

  describe('Constructor', () => {
    it('should initialize with correct default values', () => {
      expect(generatorService).toBeDefined();
      expect(generatorService.logger).toBe(mockLogger);
      expect(generatorService.cache).toBeDefined();
      expect(generatorService.templates).toBeDefined();
    });

    it('should initialize framework templates', () => {
      expect(generatorService.templates.vanilla).toBeDefined();
      expect(generatorService.templates.react).toBeDefined();
      expect(generatorService.templates.vue).toBeDefined();
      expect(generatorService.templates.angular).toBeDefined();
    });
  });

  describe('generateComponent()', () => {
    it('should generate a button component in vanilla JS', () => {
      const result = generatorService.generateComponent({
        type: 'button',
        framework: 'vanilla',
        props: {
          label: 'Click me',
          variant: 'primary',
          size: 'md'
        }
      });

      expect(result).toContain('btn');
      expect(result).toContain('Click me');
      expect(result).toContain('btn--primary');
    });

    it('should generate a button component in React', () => {
      const result = generatorService.generateComponent({
        type: 'button',
        framework: 'react',
        props: {
          label: 'Submit',
          variant: 'secondary',
          onClick: 'handleSubmit'
        }
      });

      expect(result).toContain('Button');
      expect(result).toContain('Submit');
      expect(result).toContain('onClick={handleSubmit}');
    });

    it('should generate a button component in Vue', () => {
      const result = generatorService.generateComponent({
        type: 'button',
        framework: 'vue',
        props: {
          label: 'Valider',
          variant: 'primary'
        }
      });

      expect(result).toContain('DsfrButton');
      expect(result).toContain('Valider');
      expect(result).toContain(':label=');
    });

    it('should generate a button component in Angular', () => {
      const result = generatorService.generateComponent({
        type: 'button',
        framework: 'angular',
        props: {
          label: 'Confirmer',
          variant: 'tertiary'
        }
      });

      expect(result).toContain('dsfr-button');
      expect(result).toContain('Confirmer');
      expect(result).toContain('[variant]=');
    });

    it('should handle form component generation', () => {
      const result = generatorService.generateComponent({
        type: 'form',
        framework: 'vanilla',
        props: {
          fields: [
            { name: 'email', type: 'email', label: 'Email', required: true },
            { name: 'password', type: 'password', label: 'Mot de passe', required: true }
          ]
        }
      });

      expect(result).toContain('<form');
      expect(result).toContain('input');
      expect(result).toContain('email');
      expect(result).toContain('password');
    });

    it('should handle card component generation', () => {
      const result = generatorService.generateComponent({
        type: 'card',
        framework: 'react',
        props: {
          title: 'Card Title',
          description: 'Card description',
          imageUrl: '/image.jpg',
          link: '/details'
        }
      });

      expect(result).toContain('Card');
      expect(result).toContain('Card Title');
      expect(result).toContain('Card description');
    });

    it('should handle alert component generation', () => {
      const result = generatorService.generateComponent({
        type: 'alert',
        framework: 'vanilla',
        props: {
          type: 'info',
          title: 'Information',
          message: 'This is an info message'
        }
      });

      expect(result).toContain('alert');
      expect(result).toContain('alert--info');
      expect(result).toContain('Information');
      expect(result).toContain('This is an info message');
    });

    it('should handle modal component generation', () => {
      const result = generatorService.generateComponent({
        type: 'modal',
        framework: 'vanilla',
        props: {
          id: 'my-modal',
          title: 'Modal Title',
          content: 'Modal content'
        }
      });

      expect(result).toContain('modal');
      expect(result).toContain('my-modal');
      expect(result).toContain('Modal Title');
      expect(result).toContain('Modal content');
    });

    it('should cache generated components', () => {
      const config = {
        type: 'button',
        framework: 'vanilla',
        props: { label: 'Test' }
      };

      const result1 = generatorService.generateComponent(config);
      const result2 = generatorService.generateComponent(config);

      expect(result1).toBe(result2);
      expect(generatorService.cache.has(expect.any(String))).toBe(true);
    });

    it('should throw error for unsupported component type', () => {
      expect(() => {
        generatorService.generateComponent({
          type: 'unsupported',
          framework: 'vanilla'
        });
      }).toThrow();
    });

    it('should throw error for unsupported framework', () => {
      expect(() => {
        generatorService.generateComponent({
          type: 'button',
          framework: 'unsupported'
        });
      }).toThrow();
    });
  });

  describe('generateBatch()', () => {
    it('should generate multiple components', () => {
      const components = [
        {
          type: 'button',
          framework: 'vanilla',
          props: { label: 'Button 1' }
        },
        {
          type: 'alert',
          framework: 'react',
          props: { message: 'Alert message' }
        }
      ];

      const results = generatorService.generateBatch(components);

      expect(results).toHaveLength(2);
      expect(results[0]).toContain('Button 1');
      expect(results[1]).toContain('Alert');
    });

    it('should handle errors in batch generation', () => {
      const components = [
        {
          type: 'button',
          framework: 'vanilla',
          props: { label: 'Valid' }
        },
        {
          type: 'invalid',
          framework: 'vanilla'
        }
      ];

      const results = generatorService.generateBatch(components);

      expect(results).toHaveLength(2);
      expect(results[0]).toContain('Valid');
      expect(results[1]).toContain('Error');
    });
  });

  describe('convertToFramework()', () => {
    it('should convert HTML to React', () => {
      const html = '<button class="fr-btn fr-btn--primary">Click</button>';
      const result = generatorService.convertToFramework(html, 'react');

      expect(result).toContain('Button');
      expect(result).toContain('variant="primary"');
      expect(result).toContain('Click');
    });

    it('should convert HTML to Vue', () => {
      const html = '<div class="fr-alert fr-alert--info"><p>Info message</p></div>';
      const result = generatorService.convertToFramework(html, 'vue');

      expect(result).toContain('DsfrAlert');
      expect(result).toContain('type="info"');
    });

    it('should convert HTML to Angular', () => {
      const html = '<a class="fr-link">Link text</a>';
      const result = generatorService.convertToFramework(html, 'angular');

      expect(result).toContain('dsfr-link');
      expect(result).toContain('Link text');
    });

    it('should handle complex HTML structures', () => {
      const html = `
        <div class="fr-card">
          <div class="fr-card__body">
            <h3 class="fr-card__title">Title</h3>
            <p class="fr-card__desc">Description</p>
          </div>
        </div>
      `;
      const result = generatorService.convertToFramework(html, 'react');

      expect(result).toContain('Card');
      expect(result).toContain('title=');
      expect(result).toContain('description=');
    });
  });

  describe('validateComponent()', () => {
    it('should validate correct component configuration', () => {
      const isValid = generatorService.validateComponent({
        type: 'button',
        framework: 'vanilla',
        props: { label: 'Test' }
      });

      expect(isValid).toBe(true);
    });

    it('should reject invalid component type', () => {
      const isValid = generatorService.validateComponent({
        type: 'invalid',
        framework: 'vanilla'
      });

      expect(isValid).toBe(false);
    });

    it('should reject invalid framework', () => {
      const isValid = generatorService.validateComponent({
        type: 'button',
        framework: 'invalid'
      });

      expect(isValid).toBe(false);
    });

    it('should reject missing required props', () => {
      const isValid = generatorService.validateComponent({
        type: 'button',
        framework: 'vanilla'
        // Missing props
      });

      expect(isValid).toBe(false);
    });
  });

  describe('getComponentSchema()', () => {
    it('should return schema for button component', () => {
      const schema = generatorService.getComponentSchema('button');

      expect(schema).toBeDefined();
      expect(schema.type).toBe('button');
      expect(schema.props).toBeDefined();
      expect(schema.props.label).toBeDefined();
    });

    it('should return schema for form component', () => {
      const schema = generatorService.getComponentSchema('form');

      expect(schema).toBeDefined();
      expect(schema.type).toBe('form');
      expect(schema.props.fields).toBeDefined();
    });

    it('should return null for unknown component', () => {
      const schema = generatorService.getComponentSchema('unknown');

      expect(schema).toBeNull();
    });
  });

  describe('getSupportedComponents()', () => {
    it('should return list of supported components', () => {
      const components = generatorService.getSupportedComponents();

      expect(components).toBeInstanceOf(Array);
      expect(components).toContain('button');
      expect(components).toContain('form');
      expect(components).toContain('card');
      expect(components).toContain('alert');
      expect(components).toContain('modal');
    });
  });

  describe('getSupportedFrameworks()', () => {
    it('should return list of supported frameworks', () => {
      const frameworks = generatorService.getSupportedFrameworks();

      expect(frameworks).toBeInstanceOf(Array);
      expect(frameworks).toContain('vanilla');
      expect(frameworks).toContain('react');
      expect(frameworks).toContain('vue');
      expect(frameworks).toContain('angular');
    });
  });

  describe('Performance', () => {
    it('should generate components quickly', () => {
      const start = Date.now();
      
      for (let i = 0; i < 100; i++) {
        generatorService.generateComponent({
          type: 'button',
          framework: 'vanilla',
          props: { label: `Button ${i}` }
        });
      }
      
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(100); // Should complete in less than 100ms
    });

    it('should benefit from caching', () => {
      const config = {
        type: 'button',
        framework: 'react',
        props: { label: 'Cached' }
      };

      // First generation
      const start1 = Date.now();
      generatorService.generateComponent(config);
      const time1 = Date.now() - start1;

      // Second generation (cached)
      const start2 = Date.now();
      generatorService.generateComponent(config);
      const time2 = Date.now() - start2;

      expect(time2).toBeLessThanOrEqual(time1);
    });
  });

  describe('clearCache()', () => {
    it('should clear the component cache', () => {
      generatorService.generateComponent({
        type: 'button',
        framework: 'vanilla',
        props: { label: 'Test' }
      });

      expect(generatorService.cache.size).toBeGreaterThan(0);

      generatorService.clearCache();

      expect(generatorService.cache.size).toBe(0);
    });
  });

  describe('Error handling', () => {
    it('should handle null configuration gracefully', () => {
      expect(() => {
        generatorService.generateComponent(null);
      }).toThrow();
    });

    it('should handle undefined props gracefully', () => {
      const result = generatorService.generateComponent({
        type: 'button',
        framework: 'vanilla',
        props: undefined
      });

      expect(result).toBeDefined();
      expect(result).toContain('button');
    });

    it('should log errors appropriately', () => {
      try {
        generatorService.generateComponent({
          type: 'invalid',
          framework: 'vanilla'
        });
      } catch (e) {
        // Expected error
      }

      expect(mockLogger.error).toHaveBeenCalled();
    });
  });
});