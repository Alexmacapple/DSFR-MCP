const DocumentationService = require('../../src/services/documentation');
const ValidationService = require('../../src/services/validation');
const AccessibilityService = require('../../src/services/accessibility');
const GeneratorService = require('../../src/services/generator');
const InputValidatorService = require('../../src/services/input-validator');

describe('Performance Tests', () => {
  let documentationService;
  let validationService;
  let accessibilityService;
  let generatorService;
  let inputValidator;
  
  beforeAll(async () => {
    documentationService = new DocumentationService();
    validationService = new ValidationService();
    accessibilityService = new AccessibilityService();
    generatorService = new GeneratorService();
    inputValidator = new InputValidatorService();
    
    // Initialize services
    await documentationService.initialize();
    await generatorService.initialize();
  }, 30000);
  
  describe('Memory Usage Tests', () => {
    it('should not exceed memory limits during initialization', async () => {
      const initialMemory = process.memoryUsage();
      
      // Act - Initialize a new service
      const newDocService = new DocumentationService();
      await newDocService.initialize();
      
      const finalMemory = process.memoryUsage();
      const memoryIncrease = (finalMemory.heapUsed - initialMemory.heapUsed) / 1024 / 1024; // MB
      
      // Assert - Should not use more than 50MB additional memory
      expect(memoryIncrease).toBeLessThan(50);
    }, 30000);
    
    it('should properly cleanup after operations', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Perform multiple operations
      for (let i = 0; i < 10; i++) {
        await documentationService.searchComponents({ query: `test${i}`, limit: 5 });
        await validationService.validateHTML({ 
          html_code: `<div class="fr-container">Test ${i}</div>` 
        });
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = (finalMemory - initialMemory) / 1024 / 1024; // MB
      
      // Should not leak significant memory
      expect(memoryIncrease).toBeLessThan(10);
    });
  });
  
  describe('Response Time Tests', () => {
    it('should respond to search queries within acceptable time', async () => {
      const iterations = 10;
      const times = [];
      
      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();
        
        await documentationService.searchComponents({
          query: 'button',
          limit: 10
        });
        
        const endTime = Date.now();
        times.push(endTime - startTime);
      }
      
      const averageTime = times.reduce((a, b) => a + b) / times.length;
      const maxTime = Math.max(...times);
      
      // Average should be under 500ms, max under 2000ms
      expect(averageTime).toBeLessThan(500);
      expect(maxTime).toBeLessThan(2000);
    });
    
    it('should validate HTML quickly', async () => {
      const htmlCode = `
        <div class="fr-container">
          <header class="fr-header">
            <nav class="fr-nav">
              <ul class="fr-nav__list">
                <li class="fr-nav__item">
                  <a class="fr-nav__link" href="#">Accueil</a>
                </li>
              </ul>
            </nav>
          </header>
          <main>
            <h1 class="fr-h1">Titre principal</h1>
            <p>Contenu de la page</p>
            <form class="fr-form">
              <div class="fr-form-group">
                <label class="fr-label" for="email">Email</label>
                <input class="fr-input" type="email" id="email" name="email">
              </div>
              <button class="fr-btn" type="submit">Envoyer</button>
            </form>
          </main>
        </div>
      `;
      
      const startTime = Date.now();
      
      await validationService.validateHTML({
        html_code: htmlCode,
        check_accessibility: true,
        check_semantic: true
      });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should validate complex HTML in under 1 second
      expect(duration).toBeLessThan(1000);
    });
    
    it('should handle accessibility checks efficiently', async () => {
      const htmlCode = `
        <main>
          <h1>Page Title</h1>
          <img src="image.jpg" alt="Description" />
          <form>
            <label for="name">Name</label>
            <input type="text" id="name" name="name" required aria-required="true" />
            <button type="submit">Submit</button>
          </form>
        </main>
      `;
      
      const startTime = Date.now();
      
      await accessibilityService.checkAccessibility({
        html_code: htmlCode,
        rgaa_level: 'AA'
      });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should check accessibility in under 500ms
      expect(duration).toBeLessThan(500);
    });
  });
  
  describe('Concurrent Operations Tests', () => {
    it('should handle multiple concurrent search requests', async () => {
      const concurrentRequests = 5;
      const startTime = Date.now();
      
      const promises = Array(concurrentRequests).fill().map((_, index) =>
        documentationService.searchComponents({
          query: `test${index}`,
          limit: 5
        })
      );
      
      const results = await Promise.all(promises);
      const endTime = Date.now();
      const totalDuration = endTime - startTime;
      
      // All requests should complete
      expect(results).toHaveLength(concurrentRequests);
      results.forEach(result => {
        expect(result.content).toBeDefined();
      });
      
      // Should handle concurrent requests efficiently (not much slower than single request)
      expect(totalDuration).toBeLessThan(3000);
    });
    
    it('should handle mixed operation types concurrently', async () => {
      const startTime = Date.now();
      
      const promises = [
        documentationService.searchComponents({ query: 'button', limit: 5 }),
        validationService.validateHTML({ html_code: '<div class="fr-btn">Test</div>' }),
        accessibilityService.checkAccessibility({ html_code: '<img src="test.jpg" alt="Test" />' }),
        documentationService.getComponentDetails({ component_name: 'button' }),
        documentationService.listCategories()
      ];
      
      const results = await Promise.all(promises);
      const endTime = Date.now();
      const totalDuration = endTime - startTime;
      
      // All operations should complete successfully
      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result.content).toBeDefined();
      });
      
      // Should complete all operations in reasonable time
      expect(totalDuration).toBeLessThan(5000);
    });
  });
  
  describe('Large Data Handling Tests', () => {
    it('should handle large HTML validation efficiently', async () => {
      // Create a large HTML document
      const largeHtml = `
        <div class="fr-container">
          ${Array(100).fill().map((_, i) => `
            <div class="fr-card" data-index="${i}">
              <div class="fr-card__body">
                <h3 class="fr-card__title">Card ${i}</h3>
                <p class="fr-card__desc">Description for card number ${i}</p>
                <a class="fr-btn" href="#card-${i}">Voir plus</a>
              </div>
            </div>
          `).join('')}
        </div>
      `;
      
      const startTime = Date.now();
      
      const result = await validationService.validateHTML({
        html_code: largeHtml,
        check_accessibility: true
      });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should handle large HTML in reasonable time
      expect(duration).toBeLessThan(3000);
      expect(result.content).toBeDefined();
    });
    
    it('should handle many search results efficiently', async () => {
      const startTime = Date.now();
      
      // Search with no filters to get many results
      const result = await documentationService.searchComponents({
        query: '',
        limit: 50
      });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should return many results quickly
      expect(duration).toBeLessThan(1000);
      expect(result.content).toBeDefined();
    });
  });
  
  describe('Input Validation Performance', () => {
    it('should validate inputs quickly', () => {
      const iterations = 1000;
      const startTime = Date.now();
      
      for (let i = 0; i < iterations; i++) {
        inputValidator.validateAndSanitize('search_dsfr_components', {
          query: `test${i}`,
          category: 'component',
          limit: 10
        });
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      const avgTimePerValidation = duration / iterations;
      
      // Should validate very quickly (under 1ms per validation on average)
      expect(avgTimePerValidation).toBeLessThan(1);
    });
    
    it('should sanitize large inputs efficiently', () => {
      const largeHtml = '<div>' + 'a'.repeat(10000) + '</div>';
      
      const startTime = Date.now();
      
      const result = inputValidator.sanitizeHtmlCode(largeHtml);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should sanitize large inputs quickly
      expect(duration).toBeLessThan(100);
      expect(result).toBeDefined();
    });
  });
  
  describe('Resource Cleanup Tests', () => {
    it('should not create memory leaks with repeated operations', async () => {
      const measurements = [];
      
      // Take baseline measurement
      if (global.gc) global.gc();
      measurements.push(process.memoryUsage().heapUsed);
      
      // Perform operations in batches
      for (let batch = 0; batch < 5; batch++) {
        for (let i = 0; i < 20; i++) {
          await documentationService.searchComponents({ 
            query: `batch${batch}test${i}`, 
            limit: 5 
          });
        }
        
        // Force garbage collection and measure
        if (global.gc) global.gc();
        measurements.push(process.memoryUsage().heapUsed);
      }
      
      // Check that memory doesn't continuously grow
      const initialMemory = measurements[0];
      const finalMemory = measurements[measurements.length - 1];
      const memoryGrowth = (finalMemory - initialMemory) / 1024 / 1024; // MB
      
      // Should not grow by more than 5MB
      expect(memoryGrowth).toBeLessThan(5);
    }, 30000);
  });
  
  describe('Stress Tests', () => {
    it('should handle rapid consecutive requests', async () => {
      const rapidRequests = 50;
      const results = [];
      
      const startTime = Date.now();
      
      // Fire rapid consecutive requests
      for (let i = 0; i < rapidRequests; i++) {
        const promise = documentationService.searchComponents({
          query: 'button',
          limit: 1
        });
        results.push(promise);
      }
      
      const completedResults = await Promise.all(results);
      const endTime = Date.now();
      const totalDuration = endTime - startTime;
      
      // All requests should complete
      expect(completedResults).toHaveLength(rapidRequests);
      
      // Should handle rapid requests reasonably well
      expect(totalDuration).toBeLessThan(10000); // 10 seconds max
    }, 15000);
  });
});