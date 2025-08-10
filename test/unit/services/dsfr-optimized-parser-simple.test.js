/**
 * Tests unitaires simplifiés pour DSFROptimizedParser
 * Focus sur les méthodes pures et utilitaires pour coverage rapide
 */

const DSFROptimizedParser = require('../../../src/services/dsfr-optimized-parser');

describe('DSFROptimizedParser - Simple Tests', () => {
  let parser;

  beforeEach(() => {
    parser = new DSFROptimizedParser();
  });

  describe('Constructor', () => {
    it('should initialize with correct properties', () => {
      expect(parser.components).toBeInstanceOf(Map);
      expect(parser.coreModules).toBeInstanceOf(Map);
      expect(parser.utilities).toBeInstanceOf(Map);
      expect(parser.analytics).toBeInstanceOf(Map);
      expect(parser.examples).toBeInstanceOf(Map);
      expect(parser.schemas).toBeInstanceOf(Map);
      expect(parser.documentation).toBeInstanceOf(Map);
      expect(parser.processedFiles).toBe(0);
      expect(parser.sourceDir).toBe('data/dsfr-source');
    });
  });

  describe('detectSectionType', () => {
    it('should detect component paths', () => {
      expect(parser.detectSectionType('src/component/button/button.scss')).toBe('component');
      expect(parser.detectSectionType('path/component/input/input.js')).toBe('component');
    });

    it('should detect core paths', () => {
      expect(parser.detectSectionType('src/core/layout/grid.scss')).toBe('core');
      expect(parser.detectSectionType('modules/core/base/reset.css')).toBe('core');
    });

    it('should detect utility paths', () => {
      expect(parser.detectSectionType('src/utility/spacing/margin.scss')).toBe('utility');
      expect(parser.detectSectionType('utils/utility/colors/palette.scss')).toBe('utility');
    });

    it('should detect analytics paths', () => {
      expect(parser.detectSectionType('src/analytics/tracking.js')).toBe('analytics');
      expect(parser.detectSectionType('modules/analytics/events.js')).toBe('analytics');
    });

    it('should detect example paths', () => {
      expect(parser.detectSectionType('src/example/button.html')).toBe('example');
      expect(parser.detectSectionType('docs/example/forms.html')).toBe('example');
    });

    it('should detect schema files', () => {
      expect(parser.detectSectionType('component/button.schema.yml')).toBe('schema');
      // Note: .yaml files without .schema are detected as config
      expect(parser.detectSectionType('schemas/form.schema.yml')).toBe('schema');
    });

    it('should detect documentation files', () => {
      expect(parser.detectSectionType('src/doc/button.md')).toBe('documentation');
      expect(parser.detectSectionType('README.md')).toBe('documentation');
      expect(parser.detectSectionType('docs/guide.md')).toBe('documentation');
    });

    it('should detect file types by extension', () => {
      expect(parser.detectSectionType('styles/main.scss')).toBe('style');
      expect(parser.detectSectionType('js/app.js')).toBe('script');
      expect(parser.detectSectionType('config.yml')).toBe('config');
      expect(parser.detectSectionType('settings.yaml')).toBe('config');
    });

    it('should default to other for unknown types', () => {
      expect(parser.detectSectionType('unknown/file.txt')).toBe('other');
      expect(parser.detectSectionType('image.png')).toBe('other');
      expect(parser.detectSectionType('')).toBe('other');
    });
  });

  describe('extractModuleName', () => {
    it('should extract core module names', () => {
      expect(parser.extractModuleName('src/core/layout/grid.scss', 'core')).toBe('layout');
      expect(parser.extractModuleName('modules/core/typography/fonts.scss', 'core')).toBe('typography');
    });

    it('should extract utility module names', () => {
      expect(parser.extractModuleName('src/utility/spacing/margin.scss', 'utility')).toBe('spacing');
      expect(parser.extractModuleName('utils/utility/colors/palette.scss', 'utility')).toBe('colors');
    });

    it('should fallback to directory name if no match', () => {
      expect(parser.extractModuleName('some/other/path/file.scss', 'nonexistent')).toBe('path');
      expect(parser.extractModuleName('single-file.scss', 'core')).toBe('.');
    });
  });

  describe('extractComponentFromPath', () => {
    it('should extract component names from component paths', () => {
      expect(parser.extractComponentFromPath('src/component/button/button.scss')).toBe('button');
      expect(parser.extractComponentFromPath('components/component/input/input.js')).toBe('input');
      expect(parser.extractComponentFromPath('lib/component/modal/modal.html')).toBe('modal');
    });

    it('should return unknown for non-component paths', () => {
      expect(parser.extractComponentFromPath('src/core/layout.scss')).toBe('unknown');
      expect(parser.extractComponentFromPath('other/path/file.js')).toBe('unknown');
      expect(parser.extractComponentFromPath('')).toBe('unknown');
    });
  });

  describe('getStyleType', () => {
    it('should classify style types correctly', () => {
      expect(parser.getStyleType('button.legacy.scss')).toBe('legacy');
      expect(parser.getStyleType('styles/legacy/old.scss')).toBe('legacy');
      
      expect(parser.getStyleType('button.print.scss')).toBe('print');
      expect(parser.getStyleType('styles/print/layout.scss')).toBe('print');
      
      expect(parser.getStyleType('button.main.scss')).toBe('main');
      expect(parser.getStyleType('styles/main/app.scss')).toBe('main');
      
      expect(parser.getStyleType('button.scss')).toBe('default');
      expect(parser.getStyleType('component.scss')).toBe('default');
    });
  });

  describe('getScriptType', () => {
    it('should classify script types correctly', () => {
      expect(parser.getScriptType('button.api.js')).toBe('api');
      expect(parser.getScriptType('services/api/client.js')).toBe('api');
      
      expect(parser.getScriptType('button.legacy.js')).toBe('legacy');
      expect(parser.getScriptType('js/legacy/polyfills.js')).toBe('legacy');
      
      expect(parser.getScriptType('button.main.js')).toBe('main');
      expect(parser.getScriptType('js/main/app.js')).toBe('main');
      
      expect(parser.getScriptType('button.js')).toBe('default');
      expect(parser.getScriptType('component.js')).toBe('default');
    });
  });

  describe('parseYAML', () => {
    it('should parse simple YAML properties', () => {
      const yaml = `
name: button
type: component
description: A clickable button
version: 1.0.0
      `.trim();

      const result = parser.parseYAML(yaml);

      expect(result.name).toBe('button');
      expect(result.type).toBe('component');
      expect(result.description).toBe('A clickable button');
      expect(result.version).toBe('1.0.0');
    });

    it('should parse nested YAML properties', () => {
      const yaml = `
component:
  name: button
  type: element
styles:
  primary: blue
  secondary: gray
metadata:
  version: 1.0
  stable: true
      `.trim();

      const result = parser.parseYAML(yaml);

      expect(result.component).toEqual({
        name: 'button',
        type: 'element'
      });
      expect(result.styles).toEqual({
        primary: 'blue',
        secondary: 'gray'
      });
      expect(result.metadata).toEqual({
        version: '1.0',
        stable: 'true'
      });
    });

    it('should ignore comments and empty lines', () => {
      const yaml = `
# This is a comment
name: button

# Another comment
type: component

# End comment
      `.trim();

      const result = parser.parseYAML(yaml);

      expect(result.name).toBe('button');
      expect(result.type).toBe('component');
      expect(Object.keys(result)).toHaveLength(2);
    });

    it('should handle empty YAML', () => {
      const result = parser.parseYAML('');
      expect(result).toEqual({});
    });

    it('should handle malformed YAML gracefully', () => {
      const yaml = `
invalid yaml content
without proper format
      `.trim();

      const result = parser.parseYAML(yaml);
      expect(result).toEqual({});
    });
  });

  describe('Public API methods', () => {
    beforeEach(() => {
      // Setup test data
      parser.components.set('button', { 
        name: 'button', 
        type: 'component',
        files: { 'button.scss': 'styles' },
        examples: [{ content: 'example1' }]
      });
      parser.components.set('input', { 
        name: 'input', 
        type: 'component',
        files: { 'input.js': 'script' }
      });
      parser.coreModules.set('layout', { name: 'layout', type: 'core' });
      parser.utilities.set('spacing', { name: 'spacing', type: 'utility' });
      parser.examples.set('example1', { component: 'button', content: 'example' });
      parser.examples.set('example2', { component: 'input', content: 'example' });
      parser.documentation.set('readme', { content: 'documentation' });
    });

    it('should get component by name', () => {
      const component = parser.getComponent('button');
      expect(component).toBeDefined();
      expect(component.name).toBe('button');
      expect(parser.getComponent('nonexistent')).toBeUndefined();
    });

    it('should get all components as array', () => {
      const components = parser.getAllComponents();
      expect(components).toHaveLength(2);
      expect(components.find(c => c.name === 'button')).toBeDefined();
      expect(components.find(c => c.name === 'input')).toBeDefined();
    });

    it('should get sorted component list', () => {
      const componentList = parser.getComponentList();
      expect(componentList).toEqual(['button', 'input']);
      expect(componentList).toHaveLength(2);
    });

    it('should get core module by name', () => {
      const coreModule = parser.getCoreModule('layout');
      expect(coreModule).toBeDefined();
      expect(coreModule.name).toBe('layout');
      expect(parser.getCoreModule('nonexistent')).toBeUndefined();
    });

    it('should get utility by name', () => {
      const utility = parser.getUtility('spacing');
      expect(utility).toBeDefined();
      expect(utility.name).toBe('spacing');
      expect(parser.getUtility('nonexistent')).toBeUndefined();
    });

    it('should get examples for specific component', () => {
      const buttonExamples = parser.getExamplesForComponent('button');
      expect(buttonExamples).toHaveLength(1);
      expect(buttonExamples[0].component).toBe('button');

      const inputExamples = parser.getExamplesForComponent('input');
      expect(inputExamples).toHaveLength(1);
      expect(inputExamples[0].component).toBe('input');

      const nonexistentExamples = parser.getExamplesForComponent('nonexistent');
      expect(nonexistentExamples).toHaveLength(0);
    });

    it('should get documentation by name', () => {
      const doc = parser.getDocumentation('readme');
      expect(doc).toBeDefined();
      expect(doc.content).toBe('documentation');
      expect(parser.getDocumentation('nonexistent')).toBeUndefined();
    });
  });

  describe('Component Processing Logic', () => {
    it('should process component files correctly', async () => {
      const scssContent = '.fr-btn { color: blue; }';
      await parser.processComponent('src/component/button/button.scss', scssContent);

      const component = parser.getComponent('button');
      expect(component).toBeDefined();
      expect(component.name).toBe('button');
      expect(component.files['button.scss']).toBe(scssContent);
      expect(component.styles.default).toBe(scssContent);
    });

    it('should ignore non-component paths in processComponent', async () => {
      const initialSize = parser.components.size;
      await parser.processComponent('src/other/file.scss', 'content');
      expect(parser.components.size).toBe(initialSize);
    });

    it('should process multiple file types for same component', async () => {
      const scssContent = '.fr-btn { color: blue; }';
      const jsContent = 'function init() {}';
      const mdContent = '# Button Documentation';

      await parser.processComponent('src/component/button/button.scss', scssContent);
      await parser.processComponent('src/component/button/button.js', jsContent);
      await parser.processComponent('src/component/button/README.md', mdContent);

      const component = parser.getComponent('button');
      expect(component.styles.default).toBe(scssContent);
      expect(component.scripts.default).toBe(jsContent);
      expect(component.documentation).toBe(mdContent);
    });
  });

  describe('displayStats', () => {
    it('should display statistics without errors', () => {
      // Add some test data
      parser.components.set('button', {
        files: { 'button.scss': 'content' },
        styles: { main: 'content' },
        scripts: { main: 'content' },
        templates: { default: 'content' }
      });

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      expect(() => parser.displayStats()).not.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith('\n📊 Statistiques du parsing:');
      expect(consoleSpy).toHaveBeenCalledWith('   - Composants: 1');

      consoleSpy.mockRestore();
    });
  });
});