const InputSchemas = require('../../../src/schemas/input-schemas');

describe('InputSchemas', () => {
  let schemas;
  
  beforeEach(() => {
    schemas = new InputSchemas();
  });
  
  describe('constructor', () => {
    it('should initialize with all schemas', () => {
      expect(schemas.schemas).toBeDefined();
      expect(schemas.ajv).toBeDefined();
      expect(Object.keys(schemas.schemas)).toContain('search_dsfr_components');
      expect(Object.keys(schemas.schemas)).toContain('validate_dsfr_html');
    });
  });
  
  describe('validate', () => {
    describe('search_dsfr_components', () => {
      it('should validate valid search parameters', () => {
        // Arrange
        const params = {
          query: 'button',
          category: 'component',
          limit: 10
        };
        
        // Act
        const result = schemas.validate('search_dsfr_components', params);
        
        // Assert
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.sanitized).toEqual(params);
      });
      
      it('should require query parameter', () => {
        // Arrange
        const params = { category: 'component' };
        
        // Act
        const result = schemas.validate('search_dsfr_components', params);
        
        // Assert
        expect(result.valid).toBe(false);
        expect(result.errors.some(error => error.includes('required'))).toBe(true);
      });
      
      it('should validate category enum', () => {
        // Arrange
        const params = {
          query: 'button',
          category: 'invalid_category'
        };
        
        // Act
        const result = schemas.validate('search_dsfr_components', params);
        
        // Assert
        expect(result.valid).toBe(false);
        expect(result.errors.some(error => error.includes('enum'))).toBe(true);
      });
      
      it('should validate limit bounds', () => {
        // Arrange
        const params = {
          query: 'button',
          limit: 100 // Exceeds maximum of 50
        };
        
        // Act
        const result = schemas.validate('search_dsfr_components', params);
        
        // Assert
        expect(result.valid).toBe(false);
        expect(result.errors.some(error => error.includes('maximum'))).toBe(true);
      });
      
      it('should apply default limit', () => {
        // Arrange
        const params = { query: 'button' };
        
        // Act
        const result = schemas.validate('search_dsfr_components', params);
        
        // Assert
        expect(result.valid).toBe(true);
        expect(result.sanitized.limit).toBe(10);
      });
    });
    
    describe('validate_dsfr_html', () => {
      it('should validate valid HTML validation parameters', () => {
        // Arrange
        const params = {
          html_code: '<div class="fr-container"></div>',
          check_accessibility: true,
          strict_mode: false
        };
        
        // Act
        const result = schemas.validate('validate_dsfr_html', params);
        
        // Assert
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
      
      it('should require html_code parameter', () => {
        // Arrange
        const params = { check_accessibility: true };
        
        // Act
        const result = schemas.validate('validate_dsfr_html', params);
        
        // Assert
        expect(result.valid).toBe(false);
        expect(result.errors.some(error => error.includes('required'))).toBe(true);
      });
      
      it('should validate HTML code length', () => {
        // Arrange
        const params = {
          html_code: 'a'.repeat(60000) // Exceeds maximum length
        };
        
        // Act
        const result = schemas.validate('validate_dsfr_html', params);
        
        // Assert
        expect(result.valid).toBe(false);
        expect(result.errors.some(error => error.includes('maxLength'))).toBe(true);
      });
      
      it('should apply default boolean values', () => {
        // Arrange
        const params = { html_code: '<div></div>' };
        
        // Act
        const result = schemas.validate('validate_dsfr_html', params);
        
        // Assert
        expect(result.valid).toBe(true);
        expect(result.sanitized.check_accessibility).toBe(true);
        expect(result.sanitized.check_semantic).toBe(true);
        expect(result.sanitized.strict_mode).toBe(false);
      });
    });
    
    describe('check_accessibility', () => {
      it('should validate accessibility check parameters', () => {
        // Arrange
        const params = {
          html_code: '<img src="test.jpg" alt="Test" />',
          rgaa_level: 'AA',
          include_suggestions: true
        };
        
        // Act
        const result = schemas.validate('check_accessibility', params);
        
        // Assert
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
      
      it('should validate RGAA level enum', () => {
        // Arrange
        const params = {
          html_code: '<div></div>',
          rgaa_level: 'B' // Invalid level
        };
        
        // Act
        const result = schemas.validate('check_accessibility', params);
        
        // Assert
        expect(result.valid).toBe(false);
        expect(result.errors.some(error => error.includes('enum'))).toBe(true);
      });
    });
    
    describe('generate_dsfr_component', () => {
      it('should validate component generation parameters', () => {
        // Arrange
        const params = {
          component_type: 'button',
          framework: 'react',
          options: {
            variant: 'primary',
            size: 'md',
            disabled: false
          }
        };
        
        // Act
        const result = schemas.validate('generate_dsfr_component', params);
        
        // Assert
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
      
      it('should validate component type pattern', () => {
        // Arrange
        const params = {
          component_type: 'invalid type!' // Contains invalid characters
        };
        
        // Act
        const result = schemas.validate('generate_dsfr_component', params);
        
        // Assert
        expect(result.valid).toBe(false);
        expect(result.errors.some(error => error.includes('pattern'))).toBe(true);
      });
      
      it('should validate framework enum', () => {
        // Arrange
        const params = {
          component_type: 'button',
          framework: 'svelte' // Not supported
        };
        
        // Act
        const result = schemas.validate('generate_dsfr_component', params);
        
        // Assert
        expect(result.valid).toBe(false);
        expect(result.errors.some(error => error.includes('enum'))).toBe(true);
      });
    });
    
    describe('create_dsfr_theme', () => {
      it('should validate theme creation parameters', () => {
        // Arrange
        const params = {
          theme_name: 'my-theme',
          primary_color: '#000091',
          secondary_color: '#E1000F',
          custom_variables: {
            '--fr-spacing': '1.5rem',
            '--fr-border-radius': '4px'
          }
        };
        
        // Act
        const result = schemas.validate('create_dsfr_theme', params);
        
        // Assert
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
      
      it('should validate color format', () => {
        // Arrange
        const params = {
          theme_name: 'test',
          primary_color: 'blue' // Invalid hex format
        };
        
        // Act
        const result = schemas.validate('create_dsfr_theme', params);
        
        // Assert
        expect(result.valid).toBe(false);
        expect(result.errors.some(error => error.includes('pattern'))).toBe(true);
      });
      
      it('should validate CSS variable names', () => {
        // Arrange
        const params = {
          theme_name: 'test',
          custom_variables: {
            'invalid-var': 'value' // Should start with --
          }
        };
        
        // Act
        const result = schemas.validate('create_dsfr_theme', params);
        
        // Assert
        expect(result.valid).toBe(false);
      });
    });
    
    describe('convert_to_framework', () => {
      it('should validate framework conversion parameters', () => {
        // Arrange
        const params = {
          html_code: '<button class="fr-btn">Click</button>',
          target_framework: 'react',
          component_name: 'MyButton'
        };
        
        // Act
        const result = schemas.validate('convert_to_framework', params);
        
        // Assert
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
      
      it('should validate PascalCase component name', () => {
        // Arrange
        const params = {
          html_code: '<div></div>',
          target_framework: 'react',
          component_name: 'camelCase' // Should be PascalCase
        };
        
        // Act
        const result = schemas.validate('convert_to_framework', params);
        
        // Assert
        expect(result.valid).toBe(false);
        expect(result.errors.some(error => error.includes('pattern'))).toBe(true);
      });
    });
  });
  
  describe('sanitizeParams', () => {
    it('should trim string parameters', () => {
      // Arrange
      const params = {
        query: '  button  ',
        category: '  component  '
      };
      const schema = schemas.schemas.search_dsfr_components;
      
      // Act
      const result = schemas.sanitizeParams(params, schema);
      
      // Assert
      expect(result.query).toBe('button');
      expect(result.category).toBe('component');
    });
    
    it('should apply default values', () => {
      // Arrange
      const params = { query: 'button' };
      const schema = schemas.schemas.search_dsfr_components;
      
      // Act
      const result = schemas.sanitizeParams(params, schema);
      
      // Assert
      expect(result.limit).toBe(10);
    });
    
    it('should not override provided values', () => {
      // Arrange
      const params = { query: 'button', limit: 5 };
      const schema = schemas.schemas.search_dsfr_components;
      
      // Act
      const result = schemas.sanitizeParams(params, schema);
      
      // Assert
      expect(result.limit).toBe(5); // Should keep provided value
    });
  });
  
  describe('getSchema', () => {
    it('should return schema for valid tool', () => {
      // Act
      const schema = schemas.getSchema('search_dsfr_components');
      
      // Assert
      expect(schema).toBeDefined();
      expect(schema.type).toBe('object');
      expect(schema.properties.query).toBeDefined();
    });
    
    it('should return null for invalid tool', () => {
      // Act
      const schema = schemas.getSchema('non_existent_tool');
      
      // Assert
      expect(schema).toBeNull();
    });
  });
  
  describe('getAvailableTools', () => {
    it('should return list of all available tools', () => {
      // Act
      const tools = schemas.getAvailableTools();
      
      // Assert
      expect(Array.isArray(tools)).toBe(true);
      expect(tools).toContain('search_dsfr_components');
      expect(tools).toContain('validate_dsfr_html');
      expect(tools).toContain('check_accessibility');
      expect(tools).toContain('generate_dsfr_component');
      expect(tools.length).toBeGreaterThan(10);
    });
  });
  
  describe('unknown tool validation', () => {
    it('should handle validation for unknown tool', () => {
      // Act
      const result = schemas.validate('unknown_tool', {});
      
      // Assert
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Schéma non trouvé');
      expect(result.sanitized).toBeNull();
    });
  });
});