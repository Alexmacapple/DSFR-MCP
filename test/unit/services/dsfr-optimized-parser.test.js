/**
 * Tests unitaires pour DSFROptimizedParser
 * Service de parsing optimisé du code source DSFR avec traitement par lots
 */

const DSFROptimizedParser = require('../../../src/services/dsfr-optimized-parser');
const path = require('path');

// Mock du système de fichiers
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    readdir: jest.fn(),
    writeFile: jest.fn()
  }
}));

const fs = require('fs').promises;

describe('DSFROptimizedParser', () => {
  let parser;

  beforeEach(() => {
    parser = new DSFROptimizedParser();
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should initialize with empty collections', () => {
      expect(parser.components).toBeInstanceOf(Map);
      expect(parser.coreModules).toBeInstanceOf(Map);
      expect(parser.utilities).toBeInstanceOf(Map);
      expect(parser.analytics).toBeInstanceOf(Map);
      expect(parser.examples).toBeInstanceOf(Map);
      expect(parser.schemas).toBeInstanceOf(Map);
      expect(parser.documentation).toBeInstanceOf(Map);
      expect(parser.processedFiles).toBe(0);
    });

    it('should set correct source directory path', () => {
      expect(parser.sourceDir).toBe(path.join('data', 'dsfr-source'));
      expect(parser.indexFile).toBe(path.join('data', 'dsfr-source', 'index.json'));
    });
  });

  describe('parseSourceFiles', () => {
    it('should parse source files successfully', async () => {
      // Mock file index
      const mockIndex = {
        totalFiles: 150,
        categories: ['components', 'core', 'utilities']
      };
      fs.readFile.mockResolvedValue(JSON.stringify(mockIndex));
      
      // Mock console.log to avoid test output
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const displayStatsSpy = jest.spyOn(parser, 'displayStats').mockImplementation();
      const processCategorySpy = jest.spyOn(parser, 'processCategory').mockResolvedValue();

      await parser.parseSourceFiles();

      expect(fs.readFile).toHaveBeenCalledWith(parser.indexFile, 'utf-8');
      expect(parser.fileIndex).toEqual(mockIndex);
      expect(processCategorySpy).toHaveBeenCalledTimes(7); // All categories
      expect(displayStatsSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should handle parsing errors gracefully', async () => {
      const mockError = new Error('File read error');
      fs.readFile.mockRejectedValue(mockError);
      
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(parser.parseSourceFiles()).rejects.toThrow(mockError);
      expect(consoleErrorSpy).toHaveBeenCalledWith('❌ Erreur lors du parsing:', mockError);

      consoleErrorSpy.mockRestore();
    });
  });

  describe('processCategory', () => {
    it('should process category files in batches', async () => {
      const mockFiles = ['file1.js', 'file2.scss', 'file3.md', '.hidden', 'file4.meta.json'];
      fs.readdir.mockResolvedValue(mockFiles);
      
      const processFileSpy = jest.spyOn(parser, 'processFile').mockResolvedValue();
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await parser.processCategory('components');

      expect(fs.readdir).toHaveBeenCalledWith(path.join(parser.sourceDir, 'components'));
      // Should filter out hidden files and meta files
      expect(processFileSpy).toHaveBeenCalledTimes(3);
      expect(parser.processedFiles).toBe(3);

      consoleSpy.mockRestore();
    });

    it('should handle empty categories', async () => {
      fs.readdir.mockResolvedValue([]);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await parser.processCategory('empty-category');

      expect(consoleSpy).toHaveBeenCalledWith('⚠️  Catégorie empty-category vide');

      consoleSpy.mockRestore();
    });

    it('should handle category errors gracefully', async () => {
      fs.readdir.mockRejectedValue(new Error('Directory not found'));
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      await parser.processCategory('invalid-category');

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '⚠️  Erreur avec la catégorie invalid-category: Directory not found'
      );

      consoleWarnSpy.mockRestore();
    });
  });

  describe('processFile', () => {
    it('should process file with metadata', async () => {
      const mockContent = 'file content';
      const mockMetadata = { originalPath: 'src/component/button/button.scss' };
      
      fs.readFile
        .mockResolvedValueOnce(mockContent)
        .mockResolvedValueOnce(JSON.stringify(mockMetadata));

      const processSectionSpy = jest.spyOn(parser, 'processSection').mockResolvedValue();
      const detectSectionTypeSpy = jest.spyOn(parser, 'detectSectionType').mockReturnValue('component');

      await parser.processFile('/test/path', 'test-file.scss');

      expect(fs.readFile).toHaveBeenCalledWith('/test/path/test-file.scss', 'utf-8');
      expect(fs.readFile).toHaveBeenCalledWith('/test/path/test-file.scss.meta.json', 'utf-8');
      expect(detectSectionTypeSpy).toHaveBeenCalledWith('src/component/button/button.scss');
      expect(processSectionSpy).toHaveBeenCalledWith(
        'component',
        'src/component/button/button.scss',
        mockContent
      );
    });

    it('should process file without metadata', async () => {
      const mockContent = 'file content';
      
      fs.readFile
        .mockResolvedValueOnce(mockContent)
        .mockRejectedValueOnce(new Error('No metadata file'));

      const processSectionSpy = jest.spyOn(parser, 'processSection').mockResolvedValue();
      const detectSectionTypeSpy = jest.spyOn(parser, 'detectSectionType').mockReturnValue('component');

      await parser.processFile('/test/path', 'component__button__button.scss');

      expect(detectSectionTypeSpy).toHaveBeenCalledWith('component/button/button.scss');
      expect(processSectionSpy).toHaveBeenCalled();
    });

    it('should handle file read errors', async () => {
      fs.readFile.mockRejectedValue(new Error('File not found'));

      await expect(parser.processFile('/test/path', 'invalid-file.scss')).rejects.toThrow(
        'Impossible de lire invalid-file.scss: File not found'
      );
    });
  });

  describe('detectSectionType', () => {
    it('should detect component files', () => {
      expect(parser.detectSectionType('src/component/button/button.scss')).toBe('component');
    });

    it('should detect core files', () => {
      expect(parser.detectSectionType('src/core/layout/grid.scss')).toBe('core');
    });

    it('should detect utility files', () => {
      expect(parser.detectSectionType('src/utility/spacing/margin.scss')).toBe('utility');
    });

    it('should detect analytics files', () => {
      expect(parser.detectSectionType('src/analytics/tracking.js')).toBe('analytics');
    });

    it('should detect example files', () => {
      expect(parser.detectSectionType('src/example/button.html')).toBe('example');
    });

    it('should detect schema files', () => {
      expect(parser.detectSectionType('component/button.schema.yml')).toBe('schema');
    });

    it('should detect documentation files', () => {
      expect(parser.detectSectionType('src/doc/button.md')).toBe('documentation');
      expect(parser.detectSectionType('readme.md')).toBe('documentation');
    });

    it('should detect file types by extension', () => {
      expect(parser.detectSectionType('styles.scss')).toBe('style');
      expect(parser.detectSectionType('script.js')).toBe('script');
      expect(parser.detectSectionType('config.yml')).toBe('config');
    });

    it('should default to other for unknown types', () => {
      expect(parser.detectSectionType('unknown/file.txt')).toBe('other');
    });
  });

  describe('processComponent', () => {
    it('should process component files correctly', async () => {
      const scssContent = '.fr-btn { color: blue; }';
      const jsContent = 'function init() {}';
      const mdContent = '# Button Documentation';
      const yamlContent = 'name: button\ntype: component';

      await parser.processComponent('src/component/button/button.scss', scssContent);
      await parser.processComponent('src/component/button/button.js', jsContent);
      await parser.processComponent('src/component/button/README.md', mdContent);
      await parser.processComponent('src/component/button/button.yml', yamlContent);

      const component = parser.getComponent('button');
      expect(component).toBeDefined();
      expect(component.name).toBe('button');
      expect(component.styles).toHaveProperty('default');
      expect(component.scripts).toHaveProperty('default');
      expect(component.documentation).toBe(mdContent);
      expect(component.schema).toBeDefined();
    });

    it('should handle component examples', async () => {
      const exampleContent = '<button class="fr-btn">Click me</button>';
      
      await parser.processComponent('src/component/button/example/basic.html', exampleContent);

      const component = parser.getComponent('button');
      expect(component.examples).toHaveLength(1);
      expect(component.examples[0].content).toBe(exampleContent);
    });

    it('should ignore non-component paths', async () => {
      await parser.processComponent('src/other/file.scss', 'content');
      
      expect(parser.components.size).toBe(0);
    });
  });

  describe('processCore', () => {
    it('should process core module files', async () => {
      const content = '@mixin grid() { display: grid; }';
      
      await parser.processCore('src/core/layout/grid.scss', content);

      const coreModule = parser.getCoreModule('layout');
      expect(coreModule).toBeDefined();
      expect(coreModule.name).toBe('layout');
      expect(coreModule.files['grid.scss']).toBe(content);
    });

    it('should process core documentation', async () => {
      const docContent = '# Layout Documentation';
      
      await parser.processCore('src/core/layout/README.md', docContent);

      const coreModule = parser.getCoreModule('layout');
      expect(coreModule.documentation).toBe(docContent);
    });
  });

  describe('processUtility', () => {
    it('should process utility files', async () => {
      const content = '.fr-m-1 { margin: 0.25rem; }';
      
      await parser.processUtility('src/utility/spacing/margin.scss', content);

      const utility = parser.getUtility('spacing');
      expect(utility).toBeDefined();
      expect(utility.name).toBe('spacing');
      expect(utility.files['margin.scss']).toBe(content);
    });
  });

  describe('processAnalytics', () => {
    it('should process analytics files', async () => {
      const content = 'analytics.track("event");';
      
      await parser.processAnalytics('src/analytics/tracker.js', content);

      expect(parser.analytics.has('tracker.js')).toBe(true);
      expect(parser.analytics.get('tracker.js').content).toBe(content);
    });
  });

  describe('processExample', () => {
    it('should process component examples', async () => {
      const content = '<button>Example</button>';
      
      await parser.processExample('src/example/component/button/basic.html', content);

      const exampleKey = 'src/example/component/button/basic.html';
      expect(parser.examples.has(exampleKey)).toBe(true);
      expect(parser.examples.get(exampleKey).component).toBe('button');
    });

    it('should ignore non-component examples', async () => {
      await parser.processExample('src/example/other/file.html', 'content');
      
      expect(parser.examples.size).toBe(0);
    });
  });

  describe('processSchema', () => {
    it('should process schema files', async () => {
      const yamlContent = 'name: button\ntype: component';
      const parseYAMLSpy = jest.spyOn(parser, 'parseYAML').mockReturnValue({ name: 'button' });
      
      await parser.processSchema('src/component/button/button.schema.yml', yamlContent);

      expect(parseYAMLSpy).toHaveBeenCalledWith(yamlContent);
      expect(parser.schemas.has('button')).toBe(true);
    });
  });

  describe('processDocumentation', () => {
    it('should process documentation files', async () => {
      const content = '# Documentation';
      
      await parser.processDocumentation('docs/getting-started.md', content);

      expect(parser.documentation.has('getting-started')).toBe(true);
      expect(parser.documentation.get('getting-started').content).toBe(content);
    });
  });

  describe('Utility methods', () => {
    it('should extract module names correctly', () => {
      expect(parser.extractModuleName('src/core/layout/grid.scss', 'core')).toBe('layout');
      expect(parser.extractModuleName('src/utility/spacing/margin.scss', 'utility')).toBe('spacing');
    });

    it('should extract component names from paths', () => {
      expect(parser.extractComponentFromPath('src/component/button/button.scss')).toBe('button');
      expect(parser.extractComponentFromPath('other/path.scss')).toBe('unknown');
    });

    it('should classify style types', () => {
      expect(parser.getStyleType('button.legacy.scss')).toBe('legacy');
      expect(parser.getStyleType('button.print.scss')).toBe('print');
      expect(parser.getStyleType('button.main.scss')).toBe('main');
      expect(parser.getStyleType('button.scss')).toBe('default');
    });

    it('should classify script types', () => {
      expect(parser.getScriptType('button.api.js')).toBe('api');
      expect(parser.getScriptType('button.legacy.js')).toBe('legacy');
      expect(parser.getScriptType('button.main.js')).toBe('main');
      expect(parser.getScriptType('button.js')).toBe('default');
    });
  });

  describe('parseYAML', () => {
    it('should parse simple YAML correctly', () => {
      const yamlContent = `
name: button
type: component
description: A clickable button
version: 1.0.0
      `.trim();

      const result = parser.parseYAML(yamlContent);

      expect(result).toEqual({
        name: 'button',
        type: 'component',
        description: 'A clickable button',
        version: '1.0.0'
      });
    });

    it('should handle YAML with nested properties', () => {
      const yamlContent = `
component:
  name: button
  type: element
styles:
  primary: blue
  secondary: gray
      `.trim();

      const result = parser.parseYAML(yamlContent);

      expect(result.component).toEqual({
        name: 'button',
        type: 'element'
      });
      expect(result.styles).toEqual({
        primary: 'blue',
        secondary: 'gray'
      });
    });

    it('should ignore comments and empty lines', () => {
      const yamlContent = `
# This is a comment
name: button

# Another comment
type: component
      `.trim();

      const result = parser.parseYAML(yamlContent);

      expect(result).toEqual({
        name: 'button',
        type: 'component'
      });
    });
  });

  describe('Public API methods', () => {
    beforeEach(() => {
      // Setup some test data
      parser.components.set('button', { name: 'button', type: 'component' });
      parser.components.set('input', { name: 'input', type: 'component' });
      parser.coreModules.set('layout', { name: 'layout', type: 'core' });
      parser.utilities.set('spacing', { name: 'spacing', type: 'utility' });
      parser.examples.set('example1', { component: 'button', content: 'example' });
      parser.documentation.set('readme', { content: 'documentation' });
    });

    it('should get component by name', () => {
      const component = parser.getComponent('button');
      expect(component).toEqual({ name: 'button', type: 'component' });
      expect(parser.getComponent('nonexistent')).toBeUndefined();
    });

    it('should get all components', () => {
      const components = parser.getAllComponents();
      expect(components).toHaveLength(2);
      expect(components.map(c => c.name)).toContain('button');
      expect(components.map(c => c.name)).toContain('input');
    });

    it('should get sorted component list', () => {
      const componentList = parser.getComponentList();
      expect(componentList).toEqual(['button', 'input']);
    });

    it('should get core module by name', () => {
      const coreModule = parser.getCoreModule('layout');
      expect(coreModule).toEqual({ name: 'layout', type: 'core' });
    });

    it('should get utility by name', () => {
      const utility = parser.getUtility('spacing');
      expect(utility).toEqual({ name: 'spacing', type: 'utility' });
    });

    it('should get examples for component', () => {
      const examples = parser.getExamplesForComponent('button');
      expect(examples).toHaveLength(1);
      expect(examples[0].component).toBe('button');
    });

    it('should get documentation by name', () => {
      const doc = parser.getDocumentation('readme');
      expect(doc).toEqual({ content: 'documentation' });
    });
  });

  describe('exportSummary', () => {
    it('should export parsing summary', async () => {
      // Setup test data
      parser.processedFiles = 100;
      parser.components.set('button', {
        files: { 'button.scss': 'content' },
        styles: { main: 'content' },
        scripts: { main: 'content' },
        templates: { default: 'content' },
        documentation: 'docs',
        schema: { name: 'button' },
        examples: [{ content: 'example' }]
      });

      const mockWriteFile = jest.spyOn(fs, 'writeFile').mockResolvedValue();
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const summary = await parser.exportSummary();

      expect(summary).toMatchObject({
        totalFiles: 100,
        components: {
          count: 1,
          list: ['button'],
          details: {
            button: {
              files: 1,
              styles: 1,
              scripts: 1,
              templates: 1,
              hasDocumentation: true,
              hasSchema: true,
              examplesCount: 1
            }
          }
        }
      });

      expect(mockWriteFile).toHaveBeenCalledWith(
        expect.stringContaining('parsing-summary.json'),
        expect.stringContaining('"totalFiles": 100'),
      );

      consoleSpy.mockRestore();
    });
  });

  describe('displayStats', () => {
    it('should display statistics correctly', () => {
      // Setup test data
      parser.components.set('button', {
        files: { 'button.scss': 'content' },
        styles: { main: 'content' },
        scripts: { main: 'content' },
        templates: { default: 'content' }
      });
      parser.coreModules.set('layout', { name: 'layout' });

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      parser.displayStats();

      expect(consoleSpy).toHaveBeenCalledWith('\n📊 Statistiques du parsing:');
      expect(consoleSpy).toHaveBeenCalledWith('   - Composants: 1');
      expect(consoleSpy).toHaveBeenCalledWith('   - Modules Core: 1');

      consoleSpy.mockRestore();
    });
  });
});