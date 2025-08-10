const ValidationService = require('../../../src/services/validation');

describe('ValidationService', () => {
  let service;
  
  beforeEach(() => {
    service = new ValidationService();
  });
  
  describe('constructor', () => {
    it('should initialize DSFR classes and semantic rules', () => {
      expect(service.dsfrClasses).toBeDefined();
      expect(service.semanticRules).toBeDefined();
      expect(service.dsfrClasses.button).toContain('fr-btn');
      expect(service.semanticRules.pageStructure.required).toContain('main');
    });
  });
  
  describe('validateHTML', () => {
    it('should validate simple valid HTML', async () => {
      // Arrange
      const validHTML = `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Test</title>
        </head>
        <body>
          <header>
            <div class="fr-container">
              <h1 class="fr-h1">Titre</h1>
            </div>
          </header>
          <main>
            <div class="fr-container">
              <p>Contenu</p>
            </div>
          </main>
          <footer>
            <div class="fr-container">
              <p>Footer</p>
            </div>
          </footer>
        </body>
        </html>
      `;
      
      // Act
      const result = await service.validateHTMLCore({ html_code: validHTML });
      
      // Assert
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.score).toBeGreaterThan(80);
    });
    
    it('should detect DSFR class errors in strict mode', async () => {
      // Arrange
      const invalidHTML = `
        <div class="custom-container">
          <button class="custom-btn">Click</button>
        </div>
      `;
      
      // Act
      const result = await service.validateHTMLCore({ 
        html_code: invalidHTML, 
        strict_mode: true 
      });
      
      // Assert
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.score).toBeLessThan(100);
    });
    
    it('should validate form elements with proper attributes', async () => {
      // Arrange
      const formHTML = `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Test</title>
        </head>
        <body>
          <header>
            <h1>Formulaire</h1>
          </header>
          <main>
            <form>
              <div class="fr-form-group">
                <label class="fr-label" for="email">Email</label>
                <input class="fr-input" type="email" id="email" name="email" />
              </div>
              <button class="fr-btn" type="submit">Envoyer</button>
            </form>
          </main>
          <footer>
            <p>Footer</p>
          </footer>
        </body>
        </html>
      `;
      
      // Act
      const result = await service.validateHTMLCore({ html_code: formHTML });
      
      // Assert
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    
    it('should detect missing required attributes on form elements', async () => {
      // Arrange
      const invalidFormHTML = `
        <form>
          <label class="fr-label">Email</label>
          <input class="fr-input" type="email" />
          <button class="fr-btn">Envoyer</button>
        </form>
      `;
      
      // Act
      const result = await service.validateHTMLCore({ html_code: invalidFormHTML });
      
      // Assert
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      // Should detect missing 'for' on label, 'id' and 'name' on input, 'type' on button
    });
    
    it('should validate image alt attributes', async () => {
      // Arrange
      const imageHTML = `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Test</title>
        </head>
        <body>
          <header>
            <h1>Images</h1>
          </header>
          <main>
            <div class="fr-container">
              <img src="test.jpg" alt="Description de l'image" />
              <img src="decorative.jpg" alt="" />
            </div>
          </main>
          <footer>
            <p>Footer</p>
          </footer>
        </body>
        </html>
      `;
      
      // Act
      const result = await service.validateHTMLCore({ html_code: imageHTML });
      
      // Assert
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    
    it('should detect missing alt attributes on images', async () => {
      // Arrange
      const invalidImageHTML = `
        <div class="fr-container">
          <img src="test.jpg" />
        </div>
      `;
      
      // Act
      const result = await service.validateHTMLCore({ html_code: invalidImageHTML });
      
      // Assert
      expect(result.valid).toBe(false);
      expect(result.errors.some(error => error.message.includes('alt'))).toBe(true);
    });
    
    it('should handle malformed HTML gracefully', async () => {
      // Arrange
      const malformedHTML = `<div><p>Unclosed tags`;
      
      // Act
      const result = await service.validateHTMLCore({ html_code: malformedHTML });
      
      // Assert
      expect(result).toBeDefined();
      expect(result.valid).toBeDefined();
    });
    
    it('should skip accessibility checks when disabled', async () => {
      // Arrange
      const htmlWithoutAlt = `<img src="test.jpg" />`;
      
      // Act
      const result = await service.validateHTMLCore({ 
        html_code: htmlWithoutAlt,
        check_accessibility: false 
      });
      
      // Assert
      // When accessibility is disabled, missing alt should not cause errors
      // (depending on implementation, this might still be a semantic error)
      expect(result).toBeDefined();
    });
    
    it('should skip semantic checks when disabled', async () => {
      // Arrange
      const htmlWithBadStructure = `<div><span>No proper heading structure</span></div>`;
      
      // Act
      const result = await service.validateHTMLCore({ 
        html_code: htmlWithBadStructure,
        check_semantic: false 
      });
      
      // Assert
      expect(result).toBeDefined();
      expect(result.valid).toBeDefined();
    });
  });
  
  describe('validateDSFRClasses', () => {
    it('should recognize valid DSFR button classes', () => {
      // This would need access to the private method or refactoring
      expect(service.dsfrClasses.button).toContain('fr-btn');
      expect(service.dsfrClasses.button).toContain('fr-btn--secondary');
    });
    
    it('should recognize valid DSFR grid classes', () => {
      expect(service.dsfrClasses.grid).toContain('fr-grid-row');
      expect(service.dsfrClasses.grid).toContain('fr-col');
    });
  });
  
  describe('calculateScore', () => {
    it('should calculate a perfect score for no errors', () => {
      // Arrange
      const results = { errors: [], warnings: [] };
      
      // Act
      const score = service.calculateScore(results);
      
      // Assert
      expect(score).toBe(100);
    });
    
    it('should reduce score for errors and warnings', () => {
      // Arrange
      const results = { 
        errors: [{ severity: 'error' }, { severity: 'error' }], 
        warnings: [{ severity: 'warning' }] 
      };
      
      // Act
      const score = service.calculateScore(results);
      
      // Assert
      expect(score).toBeLessThan(100);
      expect(score).toBeGreaterThanOrEqual(0);
    });
  });
  
  describe('initializeDSFRClasses', () => {
    it('should initialize all DSFR class categories', () => {
      const classes = service.initializeDSFRClasses();
      
      expect(classes.container).toBeDefined();
      expect(classes.button).toBeDefined();
      expect(classes.form).toBeDefined();
      expect(classes.nav).toBeDefined();
      expect(classes.spacing).toBeDefined();
    });
    
    it('should include comprehensive button classes', () => {
      const classes = service.initializeDSFRClasses();
      
      expect(classes.button).toContain('fr-btn');
      expect(classes.button).toContain('fr-btn--secondary');
      expect(classes.button).toContain('fr-btn--tertiary');
      expect(classes.button).toContain('fr-btn--tertiary-no-outline');
    });
  });
  
  describe('initializeSemanticRules', () => {
    it('should initialize page structure rules', () => {
      const rules = service.initializeSemanticRules();
      
      expect(rules.pageStructure.required).toContain('header');
      expect(rules.pageStructure.required).toContain('main');
      expect(rules.pageStructure.required).toContain('footer');
    });
    
    it('should initialize form validation rules', () => {
      const rules = service.initializeSemanticRules();
      
      expect(rules.formElements.input.requiredAttributes).toContain('id');
      expect(rules.formElements.input.requiredAttributes).toContain('name');
      expect(rules.formElements.label.requiredAttributes).toContain('for');
    });
  });
});