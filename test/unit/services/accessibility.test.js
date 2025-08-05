const AccessibilityService = require('../../../src/services/accessibility');

describe('AccessibilityService', () => {
  let service;
  
  beforeEach(() => {
    service = new AccessibilityService();
  });
  
  describe('constructor', () => {
    it('should initialize RGAA rules', () => {
      expect(service.rgaaRules).toBeDefined();
      expect(service.rgaaRules.images).toBeDefined();
      expect(service.rgaaRules.forms).toBeDefined();
      expect(service.rgaaRules.navigation).toBeDefined();
    });
  });
  
  describe('checkAccessibility', () => {
    it('should validate accessible HTML successfully', async () => {
      // Arrange
      const accessibleHTML = `
        <main>
          <h1>Titre principal</h1>
          <form>
            <div class="fr-form-group">
              <label for="name">Nom</label>
              <input type="text" id="name" name="name" />
            </div>
            <button type="submit">Envoyer</button>
          </form>
          <img src="test.jpg" alt="Description de l'image" />
        </main>
      `;
      
      // Act
      const result = await service.checkAccessibility({ html_code: accessibleHTML });
      
      // Assert
      expect(result.level).toBe('AA');
      expect(result.passed.length).toBeGreaterThan(0);
      expect(result.failed).toHaveLength(0);
      expect(result.score).toBeGreaterThan(80);
    });
    
    it('should detect missing alt attributes on images', async () => {
      // Arrange
      const htmlWithoutAlt = `
        <div>
          <img src="test.jpg" />
          <p>Texte</p>
        </div>
      `;
      
      // Act
      const result = await service.checkAccessibility({ html_code: htmlWithoutAlt });
      
      // Assert
      expect(result.failed.length).toBeGreaterThan(0);
      expect(result.failed.some(fail => fail.rule.includes('alt'))).toBe(true);
      expect(result.score).toBeLessThan(100);
    });
    
    it('should validate decorative images with empty alt', async () => {
      // Arrange
      const decorativeImageHTML = `
        <div>
          <img src="decoration.jpg" alt="" role="presentation" />
          <p>Contenu principal</p>
        </div>
      `;
      
      // Act
      const result = await service.checkAccessibility({ html_code: decorativeImageHTML });
      
      // Assert
      expect(result.failed).toHaveLength(0);
      expect(result.passed.some(pass => pass.rule.includes('decorative'))).toBe(true);
    });
    
    it('should detect missing form labels', async () => {
      // Arrange
      const formWithoutLabels = `
        <form>
          <input type="text" name="email" />
          <button type="submit">Envoyer</button>
        </form>
      `;
      
      // Act
      const result = await service.checkAccessibility({ html_code: formWithoutLabels });
      
      // Assert
      expect(result.failed.length).toBeGreaterThan(0);
      expect(result.failed.some(fail => fail.rule.includes('label'))).toBe(true);
    });
    
    it('should validate proper form label association', async () => {
      // Arrange
      const properFormHTML = `
        <form>
          <label for="email">Email</label>
          <input type="email" id="email" name="email" />
          <button type="submit">Envoyer</button>
        </form>
      `;
      
      // Act
      const result = await service.checkAccessibility({ html_code: properFormHTML });
      
      // Assert
      expect(result.passed.some(pass => pass.rule.includes('label'))).toBe(true);
    });
    
    it('should check for required field indicators', async () => {
      // Arrange
      const requiredFieldHTML = `
        <form>
          <label for="name">Nom (obligatoire)</label>
          <input type="text" id="name" name="name" required aria-required="true" />
        </form>
      `;
      
      // Act
      const result = await service.checkAccessibility({ html_code: requiredFieldHTML });
      
      // Assert
      expect(result.passed.some(pass => pass.rule.includes('required'))).toBe(true);
    });
    
    it('should detect missing required field indicators', async () => {
      // Arrange
      const badRequiredFieldHTML = `
        <form>
          <label for="name">Nom</label>
          <input type="text" id="name" name="name" required />
        </form>
      `;
      
      // Act
      const result = await service.checkAccessibility({ html_code: badRequiredFieldHTML });
      
      // Assert
      expect(result.failed.some(fail => fail.rule.includes('required'))).toBe(true);
    });
    
    it('should validate skip links presence', async () => {
      // Arrange
      const htmlWithSkipLinks = `
        <a href="#main">Aller au contenu principal</a>
        <nav>Navigation</nav>
        <main id="main">
          <h1>Contenu principal</h1>
        </main>
      `;
      
      // Act
      const result = await service.checkAccessibility({ html_code: htmlWithSkipLinks });
      
      // Assert
      expect(result.passed.some(pass => pass.rule.includes('skip'))).toBe(true);
    });
    
    it('should detect missing skip links', async () => {
      // Arrange
      const htmlWithoutSkipLinks = `
        <nav>Navigation</nav>
        <div>
          <h1>Contenu principal</h1>
        </div>
      `;
      
      // Act
      const result = await service.checkAccessibility({ html_code: htmlWithoutSkipLinks });
      
      // Assert
      expect(result.failed.some(fail => fail.rule.includes('skip'))).toBe(true);
    });
    
    it('should validate ARIA landmarks', async () => {
      // Arrange
      const landmarksHTML = `
        <header role="banner">En-tête</header>
        <nav role="navigation">Navigation</nav>
        <main role="main">Contenu principal</main>
        <footer role="contentinfo">Pied de page</footer>
      `;
      
      // Act
      const result = await service.checkAccessibility({ html_code: landmarksHTML });
      
      // Assert
      expect(result.passed.some(pass => pass.rule.includes('landmarks'))).toBe(true);
    });
    
    it('should work with different RGAA levels', async () => {
      // Arrange
      const basicHTML = '<div><p>Contenu simple</p></div>';
      
      // Act
      const resultA = await service.checkAccessibility({ 
        html_code: basicHTML, 
        rgaa_level: 'A' 
      });
      const resultAAA = await service.checkAccessibility({ 
        html_code: basicHTML, 
        rgaa_level: 'AAA' 
      });
      
      // Assert
      expect(resultA.level).toBe('A');
      expect(resultAAA.level).toBe('AAA');
    });
    
    it('should include suggestions when enabled', async () => {
      // Arrange
      const htmlNeedingImprovement = `
        <div>
          <img src="test.jpg" alt="Image" />
          <p style="color: #999; background: #ccc;">Texte peu contrasté</p>
        </div>
      `;
      
      // Act
      const result = await service.checkAccessibility({ 
        html_code: htmlNeedingImprovement,
        include_suggestions: true 
      });
      
      // Assert
      expect(result.suggestions).toBeDefined();
    });
    
    it('should handle malformed HTML gracefully', async () => {
      // Arrange
      const malformedHTML = '<div><p>Unclosed tags';
      
      // Act
      const result = await service.checkAccessibility({ html_code: malformedHTML });
      
      // Assert
      expect(result).toBeDefined();
      expect(result.level).toBeDefined();
      expect(result.score).toBeDefined();
    });
  });
  
  describe('initializeRGAARules', () => {
    it('should initialize image accessibility rules', () => {
      const rules = service.initializeRGAARules();
      
      expect(rules.images['alt-required']).toBeDefined();
      expect(rules.images['alt-required'].level).toBe('A');
      expect(rules.images['decorative-alt']).toBeDefined();
    });
    
    it('should initialize form accessibility rules', () => {
      const rules = service.initializeRGAARules();
      
      expect(rules.forms['label-association']).toBeDefined();
      expect(rules.forms['label-association'].level).toBe('A');
      expect(rules.forms['required-indication']).toBeDefined();
      expect(rules.forms['required-indication'].level).toBe('AA');
    });
    
    it('should initialize navigation accessibility rules', () => {
      const rules = service.initializeRGAARules();
      
      expect(rules.navigation['skip-links']).toBeDefined();
      expect(rules.navigation['skip-links'].level).toBe('A');
      expect(rules.navigation['landmarks']).toBeDefined();
      expect(rules.navigation['landmarks'].level).toBe('AA');
    });
  });
  
  describe('RGAA rule validation functions', () => {
    it('should validate alt-required rule correctly', () => {
      const rule = service.rgaaRules.images['alt-required'];
      
      // Mock elements
      const elementWithAlt = { hasAttribute: jest.fn(() => true) };
      const elementWithoutAlt = { hasAttribute: jest.fn(() => false) };
      
      expect(rule.check(elementWithAlt)).toBe(true);
      expect(rule.check(elementWithoutAlt)).toBe(false);
    });
    
    it('should validate decorative alt rule correctly', () => {
      const rule = service.rgaaRules.images['decorative-alt'];
      
      // Mock decorative element
      const decorativeElement = { 
        hasAttribute: jest.fn((attr) => attr === 'role'),
        getAttribute: jest.fn((attr) => {
          if (attr === 'role') return 'presentation';
          if (attr === 'alt') return '';
        })
      };
      
      expect(rule.check(decorativeElement)).toBe(true);
    });
  });
});