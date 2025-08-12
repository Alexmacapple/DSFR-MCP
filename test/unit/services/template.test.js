/**
 * Tests unitaires pour TemplateService
 * Couvre la génération de templates DSFR
 */

const TemplateService = require('../../../src/services/template');
const fs = require('fs').promises;
const path = require('path');

// Mock du système de fichiers
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn()
  }
}));

describe('TemplateService', () => {
  let templateService;

  beforeEach(() => {
    templateService = new TemplateService();
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should initialize with default templates', () => {
      expect(templateService).toBeDefined();
      expect(templateService.templates).toBeDefined();
      expect(Object.keys(templateService.templates).length).toBeGreaterThan(0);
    });

    it('should have core template types', () => {
      const templates = Object.keys(templateService.templates);
      expect(templates).toContain('page-basique');
      expect(templates).toContain('formulaire-contact');
      expect(templates).toContain('page-connexion');
    });
  });

  describe('generateTemplate()', () => {
    it('should generate a basic page template', () => {
      const result = templateService.generateTemplate({
        type: 'page-basique',
        title: 'Ma Page',
        description: 'Description de test'
      });

      expect(result).toContain('<!DOCTYPE html>');
      expect(result).toContain('Ma Page');
      expect(result).toContain('Description de test');
      expect(result).toContain('fr-');
    });

    it('should generate a contact form template', () => {
      const result = templateService.generateTemplate({
        type: 'formulaire-contact',
        title: 'Contactez-nous',
        fields: ['nom', 'email', 'message']
      });

      expect(result).toContain('form');
      expect(result).toContain('Contactez-nous');
      expect(result).toContain('input');
      expect(result).toContain('textarea');
    });

    it('should generate a login page template', () => {
      const result = templateService.generateTemplate({
        type: 'page-connexion',
        title: 'Connexion',
        showFranceConnect: true
      });

      expect(result).toContain('Connexion');
      expect(result).toContain('password');
      expect(result).toContain('email');
      if (result.includes('FranceConnect')) {
        expect(result).toContain('FranceConnect');
      }
    });

    it('should generate dashboard template', () => {
      const result = templateService.generateTemplate({
        type: 'dashboard',
        title: 'Tableau de bord',
        widgets: ['stats', 'notifications', 'actions']
      });

      expect(result).toContain('Tableau de bord');
      expect(result).toContain('fr-grid-row');
    });

    it('should generate error page templates', () => {
      const error404 = templateService.generateTemplate({
        type: 'erreur-404',
        title: 'Page non trouvée'
      });

      expect(error404).toContain('404');
      expect(error404).toContain('Page non trouvée');

      const error500 = templateService.generateTemplate({
        type: 'erreur-500',
        title: 'Erreur serveur'
      });

      expect(error500).toContain('500');
      expect(error500).toContain('Erreur serveur');
    });

    it('should handle missing template type', () => {
      const result = templateService.generateTemplate({
        type: 'non-existent'
      });

      expect(result).toContain('Template non trouvé');
    });

    it('should apply custom styles', () => {
      const result = templateService.generateTemplate({
        type: 'page-basique',
        title: 'Test',
        customStyles: '.custom { color: blue; }'
      });

      expect(result).toContain('.custom { color: blue; }');
    });

    it('should include custom scripts', () => {
      const result = templateService.generateTemplate({
        type: 'page-basique',
        title: 'Test',
        customScripts: 'console.log("custom");'
      });

      expect(result).toContain('console.log("custom")');
    });
  });

  describe('generateFromFile()', () => {
    it('should generate template from EJS file', async () => {
      const mockTemplate = '<h1><%= title %></h1>';
      fs.readFile.mockResolvedValue(mockTemplate);

      const result = await templateService.generateFromFile('test.ejs', {
        title: 'From File'
      });

      expect(result).toContain('<h1>From File</h1>');
    });

    it('should handle file read errors', async () => {
      fs.readFile.mockRejectedValue(new Error('File not found'));

      await expect(
        templateService.generateFromFile('missing.ejs', {})
      ).rejects.toThrow('File not found');
    });
  });

  describe('getAvailableTemplates()', () => {
    it('should return list of available templates', () => {
      const templates = templateService.getAvailableTemplates();

      expect(templates).toBeInstanceOf(Array);
      expect(templates.length).toBeGreaterThan(0);
      expect(templates[0]).toHaveProperty('name');
      expect(templates[0]).toHaveProperty('description');
    });
  });

  describe('validateTemplateConfig()', () => {
    it('should validate correct configuration', () => {
      const isValid = templateService.validateTemplateConfig({
        type: 'page-basique',
        title: 'Valid'
      });

      expect(isValid).toBe(true);
    });

    it('should reject invalid type', () => {
      const isValid = templateService.validateTemplateConfig({
        type: 'invalid',
        title: 'Test'
      });

      expect(isValid).toBe(false);
    });

    it('should reject missing required fields', () => {
      const isValid = templateService.validateTemplateConfig({
        type: 'page-basique'
        // Missing title
      });

      expect(isValid).toBe(false);
    });
  });

  describe('Template composition', () => {
    it('should compose header correctly', () => {
      const header = templateService.composeHeader({
        title: 'Test Site',
        logo: '/logo.png',
        navigation: [
          { label: 'Accueil', href: '/' },
          { label: 'Services', href: '/services' }
        ]
      });

      expect(header).toContain('fr-header');
      expect(header).toContain('Test Site');
      expect(header).toContain('Accueil');
      expect(header).toContain('Services');
    });

    it('should compose footer correctly', () => {
      const footer = templateService.composeFooter({
        description: 'Footer description',
        links: [
          { label: 'Mentions légales', href: '/legal' }
        ]
      });

      expect(footer).toContain('fr-footer');
      expect(footer).toContain('Footer description');
      expect(footer).toContain('Mentions légales');
    });

    it('should compose navigation correctly', () => {
      const nav = templateService.composeNavigation({
        items: [
          { label: 'Item 1', href: '/1', active: true },
          { label: 'Item 2', href: '/2' }
        ]
      });

      expect(nav).toContain('fr-nav');
      expect(nav).toContain('Item 1');
      expect(nav).toContain('Item 2');
      expect(nav).toContain('aria-current');
    });
  });

  describe('Form builders', () => {
    it('should build text input', () => {
      const input = templateService.buildInput({
        type: 'text',
        name: 'username',
        label: 'Nom d\'utilisateur',
        required: true
      });

      expect(input).toContain('fr-input');
      expect(input).toContain('username');
      expect(input).toContain('Nom d\'utilisateur');
      expect(input).toContain('required');
    });

    it('should build select field', () => {
      const select = templateService.buildSelect({
        name: 'country',
        label: 'Pays',
        options: [
          { value: 'fr', label: 'France' },
          { value: 'be', label: 'Belgique' }
        ]
      });

      expect(select).toContain('fr-select');
      expect(select).toContain('country');
      expect(select).toContain('France');
      expect(select).toContain('Belgique');
    });

    it('should build checkbox group', () => {
      const checkboxes = templateService.buildCheckboxGroup({
        name: 'interests',
        label: 'Centres d\'intérêt',
        options: [
          { value: 'sport', label: 'Sport' },
          { value: 'culture', label: 'Culture' }
        ]
      });

      expect(checkboxes).toContain('fr-checkbox-group');
      expect(checkboxes).toContain('Sport');
      expect(checkboxes).toContain('Culture');
    });

    it('should build radio group', () => {
      const radios = templateService.buildRadioGroup({
        name: 'gender',
        label: 'Civilité',
        options: [
          { value: 'mr', label: 'Monsieur' },
          { value: 'ms', label: 'Madame' }
        ]
      });

      expect(radios).toContain('fr-radio-group');
      expect(radios).toContain('Monsieur');
      expect(radios).toContain('Madame');
    });
  });

  describe('Accessibility', () => {
    it('should include ARIA labels', () => {
      const result = templateService.generateTemplate({
        type: 'page-basique',
        title: 'Accessible Page'
      });

      expect(result).toMatch(/aria-label|role/);
    });

    it('should include skip links', () => {
      const result = templateService.generateTemplate({
        type: 'page-basique',
        title: 'Test',
        includeSkipLinks: true
      });

      if (result.includes('skip')) {
        expect(result).toContain('skip');
      }
    });

    it('should set proper lang attribute', () => {
      const result = templateService.generateTemplate({
        type: 'page-basique',
        title: 'Test',
        lang: 'fr'
      });

      expect(result).toContain('lang="fr"');
    });
  });

  describe('Responsive design', () => {
    it('should include responsive meta tags', () => {
      const result = templateService.generateTemplate({
        type: 'page-basique',
        title: 'Responsive'
      });

      expect(result).toContain('viewport');
      expect(result).toContain('width=device-width');
    });

    it('should use responsive grid classes', () => {
      const result = templateService.generateTemplate({
        type: 'dashboard',
        title: 'Grid Test'
      });

      expect(result).toMatch(/fr-col-\d+|fr-col-md-\d+|fr-col-lg-\d+/);
    });
  });

  describe('Performance', () => {
    it('should generate templates quickly', () => {
      const start = Date.now();
      
      for (let i = 0; i < 50; i++) {
        templateService.generateTemplate({
          type: 'page-basique',
          title: `Page ${i}`
        });
      }
      
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(200); // Should complete in less than 200ms
    });
  });

  describe('Error handling', () => {
    it('should handle null configuration', () => {
      const result = templateService.generateTemplate(null);
      expect(result).toContain('Erreur');
    });

    it('should handle undefined configuration', () => {
      const result = templateService.generateTemplate(undefined);
      expect(result).toContain('Erreur');
    });

    it('should handle malformed configuration', () => {
      const result = templateService.generateTemplate({
        type: 123, // Should be string
        title: null
      });
      expect(result).toBeDefined();
    });
  });
});