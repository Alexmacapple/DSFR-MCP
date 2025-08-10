/**
 * Test d'intégration pour les outils MCP avancés
 * Phase 1.3 - Validation des 3 outils améliorés
 */

const GeneratorService = require('../../src/services/generator');

describe('Advanced MCP Tools Integration', () => {
  let generatorService;

  beforeAll(async () => {
    generatorService = new GeneratorService();
  });

  describe('create_dsfr_theme (Enhanced)', () => {
    it('should create advanced theme with color palette and dark mode', async () => {
      // Arrange
      const themeParams = {
        theme_name: 'mon-theme-test',
        primary_color: '#3366CC',
        secondary_color: '#FF6B6B',
        custom_variables: {
          'custom-spacing': '2rem',
          'custom-radius': '8px'
        }
      };

      // Act
      const result = await generatorService.createTheme(themeParams);

      // Assert
      expect(result).toHaveProperty('content');
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      
      const content = result.content[0].text;
      
      // Vérifier les fonctionnalités avancées
      expect(content).toContain('Thème DSFR personnalisé : mon-theme-test');
      expect(content).toContain('Variables CSS principales');
      expect(content).toContain('--blue-france-main: #3366CC');
      expect(content).toContain('--red-marianne-main: #FF6B6B');
      expect(content).toContain('Mode sombre');
      expect(content).toContain('[data-theme="dark"]');
      expect(content).toContain('SCSS complet avec mixins');
      expect(content).toContain('@mixin button-variant');
      expect(content).toContain('Configuration JavaScript');
      expect(content).toContain('toggleDarkMode()');
      expect(content).toContain('Guide d\'installation');
      expect(content).toContain('Contraste et accessibilité');
      expect(content).toContain('--custom-spacing: 2rem');
      expect(content).toContain('--custom-radius: 8px');
    });

    it('should handle theme creation without secondary color', async () => {
      // Arrange
      const themeParams = {
        theme_name: 'theme-simple',
        primary_color: '#2E8B57'
      };

      // Act
      const result = await generatorService.createTheme(themeParams);

      // Assert
      const content = result.content[0].text;
      expect(content).toContain('#2E8B57');
      expect(content).toContain('theme-simple');
      expect(content).not.toContain('--red-marianne-main');
    });
  });

  describe('convert_to_framework (Enhanced)', () => {
    it('should provide advanced React conversion with analysis', async () => {
      // Arrange
      const conversionParams = {
        html_code: '<button class="fr-btn fr-icon-home-4-fill fr-btn--icon-left">Accueil</button>',
        target_framework: 'react',
        component_name: 'HomeButton'
      };

      // Act
      const result = await generatorService.convertToFramework(conversionParams);

      // Assert
      const content = result.content[0].text;
      
      // Vérifier l'analyse avancée
      expect(content).toContain('Conversion avancée vers react');
      expect(content).toContain('Analyse du code source');
      expect(content).toContain('**Boutons détectés**: Oui');
      expect(content).toContain('Recommandations');
      expect(content).toContain('hooks React');
      expect(content).toContain('PropTypes');
      
      // Vérifier le code généré
      expect(content).toContain('import React');
      expect(content).toContain('import PropTypes');
      expect(content).toContain('const HomeButton');
      expect(content).toContain('onClick={handleClick}');
      expect(content).toContain('PropTypes');
      expect(content).toContain('defaultProps');
      
      // Vérifier les guides
      expect(content).toContain('Guide de test');
      expect(content).toContain('@testing-library/react');
      expect(content).toContain('Bonnes pratiques');
      expect(content).toContain('Intégration dans un projet existant');
    });

    it('should provide advanced Vue conversion', async () => {
      // Arrange
      const conversionParams = {
        html_code: '<div class="fr-card"><h3 class="fr-card__title">Test</h3></div>',
        target_framework: 'vue',
        component_name: 'TestCard'
      };

      // Act
      const result = await generatorService.convertToFramework(conversionParams);

      // Assert
      const content = result.content[0].text;
      expect(content).toContain('Conversion avancée vers vue');
      expect(content).toContain('Composition API');
      expect(content).toContain('@vue/test-utils');
      expect(content).toContain('TestCard');
    });

    it('should provide advanced Angular conversion', async () => {
      // Arrange
      const conversionParams = {
        html_code: '<input class="fr-input" type="text">',
        target_framework: 'angular',
        component_name: 'TextInput'
      };

      // Act
      const result = await generatorService.convertToFramework(conversionParams);

      // Assert
      const content = result.content[0].text;
      expect(content).toContain('Conversion avancée vers angular');
      expect(content).toContain('@Component');
      expect(content).toContain('TestBed');
      expect(content).toContain('text-input.component');
    });

    it('should handle unsupported framework gracefully', async () => {
      // Arrange
      const conversionParams = {
        html_code: '<div>Test</div>',
        target_framework: 'svelte',
        component_name: 'Test'
      };

      // Act
      const result = await generatorService.convertToFramework(conversionParams);

      // Assert
      const content = result.content[0].text;
      expect(content).toContain('Framework cible "svelte" non supporté');
      expect(content).toContain('react, vue, angular');
    });
  });

  describe('generate_dsfr_component (Enhanced)', () => {
    it('should generate advanced component with comprehensive features', async () => {
      // Arrange
      const componentParams = {
        component_type: 'button',
        framework: 'react',
        options: {
          variant: 'primary',
          size: 'lg',
          icon: 'home-4-fill',
          label: 'Mon Bouton'
        }
      };

      // Act
      const result = await generatorService.generateComponent(componentParams);

      // Assert
      const content = result.content[0].text;
      
      // Vérifier les informations avancées
      expect(content).toContain('Composant DSFR avancé : button');
      expect(content).toContain('**Framework**: react');
      expect(content).toContain('**Version DSFR**: 1.14.0');
      expect(content).toContain('Variantes disponibles');
      
      // Vérifier le code React TypeScript
      expect(content).toContain('Composant React TypeScript');
      expect(content).toContain('interface ButtonProps');
      expect(content).toContain('useState');
      expect(content).toContain('useCallback');
      expect(content).toContain('useEffect');
      
      // Vérifier le guide d'accessibilité
      expect(content).toContain('Guide d\'accessibilité');
      expect(content).toContain('Utilisez des libellés explicites');
      expect(content).toContain('Tests recommandés');
      
      // Vérifier les exemples d'utilisation
      expect(content).toContain('Exemples d\'utilisation');
      expect(content).toContain('import Button from');
    });

    it('should generate Vue component with advanced features', async () => {
      // Arrange
      const componentParams = {
        component_type: 'card',
        framework: 'vue',
        options: {
          title: 'Ma Carte',
          description: 'Description test'
        }
      };

      // Act
      const result = await generatorService.generateComponent(componentParams);

      // Assert
      const content = result.content[0].text;
      expect(content).toContain('Composant Vue 3 avec Composition API');
      expect(content).toContain('defineProps');
      expect(content).toContain('defineEmits');
      expect(content).toContain('onMounted');
    });

    it('should generate Angular component with advanced features', async () => {
      // Arrange
      const componentParams = {
        component_type: 'alert',
        framework: 'angular',
        options: {
          variant: 'error',
          title: 'Erreur'
        }
      };

      // Act
      const result = await generatorService.generateComponent(componentParams);

      // Assert
      const content = result.content[0].text;
      expect(content).toContain('Composant Angular avec TypeScript');
      expect(content).toContain('@Input()');
      expect(content).toContain('@Output()');
      expect(content).toContain('OnInit');
      expect(content).toContain('OnDestroy');
    });

    it('should generate component even for unknown types', async () => {
      // Arrange
      const componentParams = {
        component_type: 'custom-widget',
        framework: 'vanilla',
        options: {
          content: 'Contenu personnalisé'
        }
      };

      // Act
      const result = await generatorService.generateComponent(componentParams);

      // Assert
      const content = result.content[0].text;
      expect(content).toContain('Composant DSFR avancé : custom-widget');
      expect(content).toContain('Statut**: Disponible');
      expect(content).toContain('HTML Structure');
    });

    it('should handle vanilla framework with JavaScript components', async () => {
      // Arrange
      const componentParams = {
        component_type: 'modal',
        framework: 'vanilla',
        options: {
          title: 'Ma Modale',
          content: 'Contenu de la modale'
        }
      };

      // Act
      const result = await generatorService.generateComponent(componentParams);

      // Assert
      const content = result.content[0].text;
      expect(content).toContain('JavaScript interactif');
      expect(content).toContain('handleOpen()');
      expect(content).toContain('handleClose()');
      expect(content).toContain('modal.showModal()');
    });
  });

  describe('Integration and Error Handling', () => {
    it('should handle all tools consistently', async () => {
      // Test que tous les outils retournent le bon format MCP
      const themeResult = await generatorService.createTheme({
        theme_name: 'test',
        primary_color: '#000000'
      });
      
      const conversionResult = await generatorService.convertToFramework({
        html_code: '<div>test</div>',
        target_framework: 'react',
        component_name: 'Test'
      });
      
      const componentResult = await generatorService.generateComponent({
        component_type: 'button',
        framework: 'vanilla'
      });

      // Tous doivent avoir le format MCP
      [themeResult, conversionResult, componentResult].forEach(result => {
        expect(result).toHaveProperty('content');
        expect(result.content).toHaveLength(1);
        expect(result.content[0]).toHaveProperty('type', 'text');
        expect(result.content[0]).toHaveProperty('text');
        expect(typeof result.content[0].text).toBe('string');
        expect(result.content[0].text.length).toBeGreaterThan(100);
      });
    });
  });
});