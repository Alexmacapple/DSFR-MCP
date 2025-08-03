const InputValidatorService = require('../../../src/services/input-validator');

describe('InputValidatorService', () => {
  let validator;
  
  beforeEach(() => {
    validator = new InputValidatorService();
  });
  
  describe('constructor', () => {
    it('should initialize with input schemas', () => {
      expect(validator.schemas).toBeDefined();
    });
  });
  
  describe('validateAndSanitize', () => {
    it('should validate and sanitize valid search parameters', () => {
      // Arrange
      const params = {
        query: '  Button  ',
        category: 'component',
        limit: 5
      };
      
      // Act
      const result = validator.validateAndSanitize('search_dsfr_components', params);
      
      // Assert
      expect(result.valid).toBe(true);
      expect(result.sanitized.query).toBe('button'); // Lowercase and trimmed
      expect(result.sanitized.category).toBe('component');
      expect(result.sanitized.limit).toBe(5);
    });
    
    it('should throw error for invalid parameters', () => {
      // Arrange
      const params = {
        query: '', // Empty query
        limit: 100 // Exceeds maximum
      };
      
      // Act & Assert
      expect(() => {
        validator.validateAndSanitize('search_dsfr_components', params);
      }).toThrow('Paramètres invalides');
    });
    
    it('should apply default values', () => {
      // Arrange
      const params = { query: 'button' };
      
      // Act
      const result = validator.validateAndSanitize('search_dsfr_components', params);
      
      // Assert
      expect(result.sanitized.limit).toBe(10); // Default value
    });
  });
  
  describe('sanitizeSearchQuery', () => {
    it('should sanitize search query properly', () => {
      // Test cases for various inputs
      const testCases = [
        { input: '  Button  ', expected: 'button' },
        { input: 'ACCORDION', expected: 'accordion' },
        { input: 'form<script>', expected: 'formscript' },
        { input: 'nav & menu', expected: 'nav menu' },
        { input: 'button"alert', expected: 'buttonalert' },
        { input: 'multi   spaces', expected: 'multi spaces' }
      ];
      
      testCases.forEach(({ input, expected }) => {
        const result = validator.sanitizeSearchQuery(input);
        expect(result).toBe(expected);
      });
    });
  });
  
  describe('sanitizeHtmlCode', () => {
    it('should remove script tags', () => {
      // Arrange
      const maliciousHtml = '<div><script>alert("xss")</script><p>Safe content</p></div>';
      
      // Act
      const result = validator.sanitizeHtmlCode(maliciousHtml);
      
      // Assert
      expect(result).not.toContain('<script>');
      expect(result).toContain('Safe content');
    });
    
    it('should remove javascript: protocols', () => {
      // Arrange
      const maliciousHtml = '<a href="javascript:alert()">Link</a>';
      
      // Act
      const result = validator.sanitizeHtmlCode(maliciousHtml);
      
      // Assert
      expect(result).not.toContain('javascript:');
    });
    
    it('should remove event handlers', () => {
      // Arrange
      const maliciousHtml = '<div onclick="alert()">Content</div>';
      
      // Act
      const result = validator.sanitizeHtmlCode(maliciousHtml);
      
      // Assert
      expect(result).not.toContain('onclick=');
    });
    
    it('should normalize whitespace', () => {
      // Arrange
      const htmlWithSpaces = '<div>   Multiple   spaces   </div>';
      
      // Act
      const result = validator.sanitizeHtmlCode(htmlWithSpaces);
      
      // Assert
      expect(result).toBe('<div> Multiple spaces </div>');
    });
  });
  
  describe('normalizeColor', () => {
    it('should add # prefix if missing', () => {
      // Act
      const result = validator.normalizeColor('000091');
      
      // Assert
      expect(result).toBe('#000091');
    });
    
    it('should convert to uppercase', () => {
      // Act
      const result = validator.normalizeColor('#abcdef');
      
      // Assert
      expect(result).toBe('#ABCDEF');
    });
    
    it('should handle colors that already have # prefix', () => {
      // Act
      const result = validator.normalizeColor('#123ABC');
      
      // Assert
      expect(result).toBe('#123ABC');
    });
  });
  
  describe('normalizePascalCase', () => {
    it('should convert kebab-case to PascalCase', () => {
      // Act
      const result = validator.normalizePascalCase('my-component-name');
      
      // Assert
      expect(result).toBe('MyComponentName');
    });
    
    it('should convert snake_case to PascalCase', () => {
      // Act
      const result = validator.normalizePascalCase('my_component_name');
      
      // Assert
      expect(result).toBe('MyComponentName');
    });
    
    it('should handle spaces', () => {
      // Act
      const result = validator.normalizePascalCase('my component name');
      
      // Assert
      expect(result).toBe('MyComponentName');
    });
    
    it('should handle mixed separators', () => {
      // Act
      const result = validator.normalizePascalCase('my-component_name test');
      
      // Assert
      expect(result).toBe('MyComponentNameTest');
    });
  });
  
  describe('additionalSanitization', () => {
    it('should sanitize search_dsfr_components parameters', () => {
      // Arrange
      const params = { query: '  BUTTON<script>  ' };
      
      // Act
      const result = validator.additionalSanitization(params, 'search_dsfr_components');
      
      // Assert
      expect(result.query).toBe('buttonscript');
    });
    
    it('should sanitize validate_dsfr_html parameters', () => {
      // Arrange
      const params = { html_code: '<div onclick="alert()">Test</div>' };
      
      // Act
      const result = validator.additionalSanitization(params, 'validate_dsfr_html');
      
      // Assert
      expect(result.html_code).not.toContain('onclick=');
    });
    
    it('should sanitize generate_dsfr_component parameters', () => {
      // Arrange
      const params = { component_type: 'Button@#$Component' };
      
      // Act
      const result = validator.additionalSanitization(params, 'generate_dsfr_component');
      
      // Assert
      expect(result.component_type).toBe('buttoncomponent');
    });
    
    it('should sanitize create_dsfr_theme parameters', () => {
      // Arrange
      const params = {
        theme_name: 'My@Theme!',
        primary_color: 'abcdef',
        secondary_color: '#123abc'
      };
      
      // Act
      const result = validator.additionalSanitization(params, 'create_dsfr_theme');
      
      // Assert
      expect(result.theme_name).toBe('mytheme');
      expect(result.primary_color).toBe('#ABCDEF');
      expect(result.secondary_color).toBe('#123ABC');
    });
    
    it('should sanitize convert_to_framework parameters', () => {
      // Arrange
      const params = {
        html_code: '<div onclick="alert()">Test</div>',
        component_name: 'my-component'
      };
      
      // Act
      const result = validator.additionalSanitization(params, 'convert_to_framework');
      
      // Assert
      expect(result.html_code).not.toContain('onclick=');
      expect(result.component_name).toBe('MyComponent');
    });
  });
  
  describe('validateCommonParams', () => {
    it('should validate normal parameters', () => {
      // Arrange
      const params = { query: 'button', limit: 10 };
      
      // Act
      const result = validator.validateCommonParams(params);
      
      // Assert
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    
    it('should reject non-object parameters', () => {
      // Arrange
      const params = 'not an object';
      
      // Act
      const result = validator.validateCommonParams(params);
      
      // Assert
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Les paramètres doivent être un objet');
    });
    
    it('should reject oversized parameters', () => {
      // Arrange
      const largeString = 'a'.repeat(100001);
      const params = { large_field: largeString };
      
      // Act
      const result = validator.validateCommonParams(params);
      
      // Assert
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Les paramètres sont trop volumineux (max 100KB)');
    });
  });
  
  describe('createErrorResponse', () => {
    it('should create properly formatted error response', () => {
      // Arrange
      const message = 'Validation failed';
      const errors = ['Field is required', 'Invalid format'];
      
      // Act
      const result = validator.createErrorResponse(message, errors);
      
      // Assert
      expect(result.isError).toBe(true);
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('❌ **Erreur de validation**');
      expect(result.content[0].text).toContain(message);
      expect(result.content[0].text).toContain('Field is required');
      expect(result.content[0].text).toContain('Invalid format');
    });
  });
  
  describe('validateRequiredParams', () => {
    it('should validate required parameters', () => {
      // Arrange
      const params = { query: 'button', category: 'component' };
      const required = ['query'];
      
      // Act
      const errors = validator.validateRequiredParams(params, required);
      
      // Assert
      expect(errors).toHaveLength(0);
    });
    
    it('should detect missing required parameters', () => {
      // Arrange
      const params = { category: 'component' };
      const required = ['query', 'limit'];
      
      // Act
      const errors = validator.validateRequiredParams(params, required);
      
      // Assert
      expect(errors).toHaveLength(2);
      expect(errors).toContain("Le paramètre 'query' est requis");
      expect(errors).toContain("Le paramètre 'limit' est requis");
    });
    
    it('should detect empty string as missing', () => {
      // Arrange
      const params = { query: '', category: null };
      const required = ['query', 'category'];
      
      // Act
      const errors = validator.validateRequiredParams(params, required);
      
      // Assert
      expect(errors).toHaveLength(2);
    });
  });
  
  describe('validateStringLimits', () => {
    it('should validate string length limits', () => {
      // Arrange
      const params = { query: 'button', description: 'Valid description' };
      const limits = {
        query: { min: 1, max: 100 },
        description: { min: 5, max: 200 }
      };
      
      // Act
      const errors = validator.validateStringLimits(params, limits);
      
      // Assert
      expect(errors).toHaveLength(0);
    });
    
    it('should detect strings that are too short', () => {
      // Arrange
      const params = { query: 'a' };
      const limits = { query: { min: 3 } };
      
      // Act
      const errors = validator.validateStringLimits(params, limits);
      
      // Assert
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('au moins 3 caractères');
    });
    
    it('should detect strings that are too long', () => {
      // Arrange
      const params = { query: 'a'.repeat(101) };
      const limits = { query: { max: 100 } };
      
      // Act
      const errors = validator.validateStringLimits(params, limits);
      
      // Assert
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('ne peut pas dépasser 100 caractères');
    });
  });
  
  describe('getAvailableTools', () => {
    it('should return list of available tools with schemas', () => {
      // Act
      const tools = validator.getAvailableTools();
      
      // Assert
      expect(Array.isArray(tools)).toBe(true);
      expect(tools.length).toBeGreaterThan(0);
      
      const searchTool = tools.find(t => t.name === 'search_dsfr_components');
      expect(searchTool).toBeDefined();
      expect(searchTool.schema).toBeDefined();
      expect(searchTool.schema.type).toBe('object');
    });
  });
});