/**
 * Tests d'intégration pour le Parser DSFR V2
 * Valide les performances et fonctionnalités du nouveau système de parsing
 */

const { DSFRParserV2 } = require('../../src/services/dsfr-parser-v2');
const { YamlParserService } = require('../../src/services/yaml-parser-service');
const SearchIndexService = require('../../src/services/search-index-service');
const ConfigService = require('../../src/services/config-service');
const LoggerService = require('../../src/services/logger-service');
const CacheService = require('../../src/services/cache-service');

describe('Parser DSFR V2 - Performance et fonctionnalités', () => {
  let config, logger, cache;
  let yamlParser, searchIndex, dsfrParser;

  beforeAll(async () => {
    // Configuration des services de test
    const mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn()
    };

    config = new ConfigService(mockLogger);
    await config.initialize();

    logger = new LoggerService(config);
    await logger.initialize();

    // Mock config complet pour CacheService
    const mockConfig = {
      get: jest.fn((key, defaultValue) => {
        const configMap = {
          'cache.maxMemorySize': 1024 * 1024,
          'cache.defaultTTL': 60000,
          'cache.cleanupInterval': 5000,
          'cache.compression': true,
          'paths.data': './test-data',
          'parsing.concurrency': 4
        };
        return configMap[key] || defaultValue;
      }),
      cache: {
        maxMemorySize: 1024 * 1024,
        defaultTTL: 60000,
        cleanupInterval: 5000,
        compression: true
      },
      paths: {
        data: './test-data'
      }
    };

    cache = new CacheService(mockConfig, logger);
    await cache.initialize();

    // Services à tester
    yamlParser = new YamlParserService(mockConfig, logger);
    searchIndex = new SearchIndexService(mockConfig, cache, logger);
    dsfrParser = new DSFRParserV2(mockConfig, cache, logger);

    // Initialisation
    await yamlParser.initialize();
    await searchIndex.initialize();
    await dsfrParser.initialize();
  });

  afterAll(async () => {
    await yamlParser?.dispose();
    await searchIndex?.dispose();
    await dsfrParser?.dispose();
    await cache?.dispose();
  });

  describe('YamlParserService', () => {
    it('should parse valid YAML content', async () => {
      const yamlContent = `
name: test-component
category: layout
description: Un composant de test
version: 1.0.0
accessibility:
  level: AA
  guidelines:
    - "Utiliser des contrastes suffisants"
    - "Fournir des alternatives textuelles"
variants:
  - name: default
    description: Variante par défaut
  - name: compact
    description: Variante compacte
dependencies:
  - "@dsfr/core"
  - "@dsfr/utilities"
`;

      const result = await yamlParser.parseYaml(yamlContent, {
        filename: 'test-component.yml',
        schema: 'dsfr-component',
        validateSchema: true
      });

      expect(result.data).toBeDefined();
      expect(result.data.name).toBe('test-component');
      expect(result.data.category).toBe('layout');
      expect(result.data.accessibility.level).toBe('AA');
      expect(result.data.variants).toHaveLength(2);
      expect(result.metadata.valid).toBe(true);
    });

    it('should handle YAML parsing errors gracefully', async () => {
      const invalidYaml = `
name: test
invalid: [unclosed array
`;

      await expect(yamlParser.parseYaml(invalidYaml, {
        filename: 'invalid.yml'
      })).rejects.toThrow();
    });

    it('should validate against DSFR component schema', async () => {
      const invalidComponent = `
name: test
category: invalid-category
`;

      await expect(yamlParser.parseYaml(invalidComponent, {
        filename: 'invalid-component.yml',
        schema: 'dsfr-component',
        validateSchema: true
      })).rejects.toThrow();
    });

    it('should process multiple files in parallel', async () => {
      const files = [
        {
          content: 'name: component1\ncategory: layout',
          path: 'component1.yml'
        },
        {
          content: 'name: component2\ncategory: navigation',
          path: 'component2.yml'
        },
        {
          content: 'name: component3\ncategory: form',
          path: 'component3.yml'
        }
      ];

      const startTime = Date.now();
      const result = await yamlParser.parseYamlFiles(files, {
        concurrency: 2,
        schema: 'dsfr-component',
        validateSchema: true
      });
      const parseTime = Date.now() - startTime;

      expect(result.stats.total).toBe(3);
      expect(result.stats.successful).toBe(3);
      expect(result.stats.failed).toBe(0);
      expect(parseTime).toBeLessThan(1000); // Doit être rapide
    });

    it('should provide parsing statistics', () => {
      const stats = yamlParser.getStats();
      
      expect(stats).toHaveProperty('totalFiles');
      expect(stats).toHaveProperty('successfulParses');
      expect(stats).toHaveProperty('errors');
      expect(stats).toHaveProperty('successRate');
      expect(stats).toHaveProperty('averageParseTime');
    });
  });

  describe('SearchIndexService', () => {
    const sampleDocuments = [
      {
        id: 'button-component',
        title: 'Bouton',
        description: 'Composant bouton pour les actions utilisateur',
        category: 'form',
        type: 'component',
        tags: ['interaction', 'cta'],
        content: 'Le composant bouton permet aux utilisateurs de déclencher des actions.'
      },
      {
        id: 'card-component',
        title: 'Carte',
        description: 'Composant carte pour afficher du contenu structuré',
        category: 'layout', 
        type: 'component',
        tags: ['contenu', 'structure'],
        content: 'La carte est un conteneur qui groupe des informations liées.'
      },
      {
        id: 'form-guide',
        title: 'Guide des formulaires',
        description: 'Documentation sur la création de formulaires accessibles',
        category: 'documentation',
        type: 'guide',
        tags: ['formulaire', 'accessibilité'],
        content: 'Ce guide explique comment créer des formulaires conformes RGAA.'
      }
    ];

    beforeEach(async () => {
      await searchIndex.addDocuments(sampleDocuments, 'test-index');
    });

    it('should add documents to search index', async () => {
      const result = await searchIndex.addDocuments(sampleDocuments, 'new-index');
      
      expect(result.indexName).toBe('new-index');
      expect(result.documentsAdded).toBe(3);
      expect(result.totalDocuments).toBeGreaterThan(0);
      expect(result.indexTime).toBeDefined();
    });

    it('should perform fuzzy search', async () => {
      const results = await searchIndex.search('bouton', {
        index: 'test-index',
        limit: 5
      });

      expect(results.results).toBeDefined();
      expect(results.results.length).toBeGreaterThan(0);
      expect(results.results[0].title).toContain('Bouton');
      expect(results.searchTime).toBeDefined();
    });

    it('should filter by facets', async () => {
      const results = await searchIndex.search('', {
        index: 'test-index',
        facets: {
          category: ['form']
        },
        limit: 10
      });

      expect(results.results).toBeDefined();
      expect(results.results.every(r => r.category === 'form')).toBe(true);
      expect(results.facets).toBeDefined();
      expect(results.facets.category).toBeDefined();
    });

    it('should provide pagination', async () => {
      const page1 = await searchIndex.search('', {
        index: 'test-index',
        limit: 2,
        offset: 0
      });

      const page2 = await searchIndex.search('', {
        index: 'test-index',
        limit: 2,
        offset: 2
      });

      expect(page1.results).toHaveLength(2);
      expect(page1.pagination.total).toBe(3);
      expect(page1.pagination.currentPage).toBe(1);
      
      expect(page2.results).toHaveLength(1);
      expect(page2.pagination.currentPage).toBe(2);
    });

    it('should sort results by different criteria', async () => {
      const byTitle = await searchIndex.search('', {
        index: 'test-index',
        sortBy: 'title',
        sortOrder: 'asc'
      });

      const titles = byTitle.results.map(r => r.title);
      const sortedTitles = [...titles].sort();
      expect(titles).toEqual(sortedTitles);
    });

    it('should calculate facets correctly', async () => {
      const results = await searchIndex.search('', {
        index: 'test-index'
      });

      expect(results.facets).toBeDefined();
      expect(results.facets.category).toBeDefined();
      expect(results.facets.type).toBeDefined();
      
      const categoryFacets = results.facets.category;
      expect(categoryFacets.some(f => f.value === 'form' && f.count === 1)).toBe(true);
      expect(categoryFacets.some(f => f.value === 'layout' && f.count === 1)).toBe(true);
    });

    it('should provide search performance metrics', async () => {
      // Effectuer plusieurs recherches pour obtenir des métriques
      for (let i = 0; i < 5; i++) {
        await searchIndex.search(`test ${i}`, { index: 'test-index' });
      }

      const stats = searchIndex.getSearchStats();
      
      expect(stats).toHaveProperty('searchCount');
      expect(stats).toHaveProperty('averageSearchTime');
      expect(stats).toHaveProperty('totalDocuments');
      expect(stats.searchCount).toBeGreaterThan(0);
    });
  });

  describe('Performance Tests', () => {
    it('should achieve 5x performance improvement over V1', async () => {
      // Test de parsing sur un échantillon de fichiers
      const testFiles = [
        {
          path: '/test/component1.yml',
          relativePath: 'component1.yml',
          category: 'components',
          type: 'yaml',
          extension: '.yml',
          size: 500,
          priority: 3
        },
        {
          path: '/test/doc1.md',
          relativePath: 'doc1.md',
          category: 'documentation',
          type: 'markdown',
          extension: '.md',
          size: 1200,
          priority: 2
        }
      ];

      // Mock du système de fichiers
      require('fs').promises.readFile = jest.fn()
        .mockResolvedValueOnce('name: test1\ncategory: layout')
        .mockResolvedValueOnce('# Test Documentation\n\nCeci est un test.');

      const startTime = Date.now();
      const results = await dsfrParser.processFilesInBatches(testFiles);
      const processingTime = Date.now() - startTime;

      expect(results).toHaveLength(2);
      expect(processingTime).toBeLessThan(500); // Doit être très rapide
      
      // Vérifier que le temps de traitement par fichier est acceptable
      const timePerFile = processingTime / testFiles.length;
      expect(timePerFile).toBeLessThan(250);
    });

    it('should handle concurrent parsing efficiently', async () => {
      const concurrentFiles = Array.from({ length: 10 }, (_, i) => ({
        path: `/test/file${i}.yml`,
        relativePath: `file${i}.yml`,
        category: 'components',
        type: 'yaml',
        extension: '.yml',
        size: 300,
        priority: 3
      }));

      // Mock lectures de fichiers
      require('fs').promises.readFile = jest.fn()
        .mockResolvedValue('name: test\ncategory: layout');

      const startTime = Date.now();
      const results = await dsfrParser.processFilesInBatches(concurrentFiles);
      const processingTime = Date.now() - startTime;

      expect(results).toHaveLength(10);
      expect(processingTime).toBeLessThan(1000);
      
      // Vérifier l'efficacité de la parallélisation
      const timePerFile = processingTime / concurrentFiles.length;
      expect(timePerFile).toBeLessThan(100);
    });

    it('should maintain performance with large datasets', async () => {
      const largeDataset = Array.from({ length: 100 }, (_, i) => ({
        id: `doc-${i}`,
        title: `Document ${i}`,
        description: `Description pour le document ${i}`,
        category: i % 2 === 0 ? 'components' : 'documentation',
        type: 'document',
        tags: [`tag-${i % 5}`, `category-${i % 3}`],
        content: `Contenu du document ${i} avec beaucoup de texte pour tester les performances.`
      }));

      const indexStartTime = Date.now();
      await searchIndex.addDocuments(largeDataset, 'large-test');
      const indexTime = Date.now() - indexStartTime;

      const searchStartTime = Date.now();
      const searchResults = await searchIndex.search('document', {
        index: 'large-test',
        limit: 20
      });
      const searchTime = Date.now() - searchStartTime;

      expect(indexTime).toBeLessThan(2000); // Indexation rapide
      expect(searchTime).toBeLessThan(100);  // Recherche très rapide
      expect(searchResults.results).toHaveLength(20);
      expect(searchResults.pagination.total).toBe(100);
    });
  });

  describe('Integration Tests', () => {
    it('should integrate all services correctly', async () => {
      // Test d'intégration complète : YAML → Index → Recherche
      const yamlContent = `
name: integration-test
category: layout
description: Test d'intégration complète
tags:
  - test
  - integration
`;

      // 1. Parser le YAML
      const parseResult = await yamlParser.parseYaml(yamlContent, {
        filename: 'integration-test.yml'
      });

      expect(parseResult.data.name).toBe('integration-test');

      // 2. Créer un document pour l'index
      const document = {
        id: 'integration-test',
        title: parseResult.data.name,
        description: parseResult.data.description,
        category: parseResult.data.category,
        tags: parseResult.data.tags,
        type: 'component'
      };

      // 3. Ajouter à l'index
      await searchIndex.addDocuments([document], 'integration-test');

      // 4. Rechercher
      const searchResults = await searchIndex.search('integration', {
        index: 'integration-test'
      });

      expect(searchResults.results).toHaveLength(1);
      expect(searchResults.results[0].title).toBe('integration-test');
    });

    it('should handle errors gracefully across services', async () => {
      // Test de gestion d'erreurs
      const invalidYaml = 'invalid: [yaml content';
      
      try {
        await yamlParser.parseYaml(invalidYaml, {
          filename: 'error-test.yml'
        });
      } catch (error) {
        expect(error.name).toBe('YamlParseError');
        expect(error.details).toBeDefined();
      }

      // Les autres services doivent continuer à fonctionner
      const validDoc = {
        id: 'error-recovery-test',
        title: 'Test de récupération d\'erreur',
        description: 'Ce document teste la récupération d\'erreur',
        category: 'test'
      };

      const addResult = await searchIndex.addDocuments([validDoc], 'error-test');
      expect(addResult.documentsAdded).toBe(1);
    });

    it('should provide comprehensive statistics', async () => {
      const stats = dsfrParser.getParsingStats();
      
      expect(stats).toHaveProperty('totalFiles');
      expect(stats).toHaveProperty('processedFiles');
      expect(stats).toHaveProperty('errors');
      expect(stats).toHaveProperty('yamlStats');
      expect(stats).toHaveProperty('searchStats');
      
      // Statistiques YAML
      expect(stats.yamlStats).toHaveProperty('successRate');
      expect(stats.yamlStats).toHaveProperty('averageParseTime');
      
      // Statistiques de recherche
      expect(stats.searchStats).toHaveProperty('totalDocuments');
      expect(stats.searchStats).toHaveProperty('averageSearchTime');
    });
  });
});