/**
 * Parser DSFR V2 - Version optimisée avec parsing parallèle et validation
 * Utilise YamlParserService et SearchIndexService pour des performances maximales
 */

const fs = require('fs').promises;
const path = require('path');
const { IService } = require('../core/interfaces');
const { YamlParserService } = require('./yaml-parser-service');
const SearchIndexService = require('./search-index-service');

class DSFRParserV2 extends IService {
  constructor(config, cache, logger) {
    super();
    this.config = config;
    this.cache = cache;
    this.logger = logger;

    this.initialized = false;
    this.yamlParser = new YamlParserService(config, logger);
    this.searchIndex = new SearchIndexService(config, cache, logger);

    // Configuration de parsing
    this.sourceDir = config.get('paths.data', './data/dsfr-source');
    this.outputDir = config.get('paths.output', './data/processed');
    this.concurrency = config.get('parsing.concurrency', 8);
    this.enableValidation = config.get('parsing.enableValidation', true);

    // Statistiques et métriques
    this.parsingStats = {
      totalFiles: 0,
      processedFiles: 0,
      errors: 0,
      warnings: 0,
      startTime: null,
      endTime: null,
      categories: new Map(),
      fileTypes: new Map(),
    };

    // Index des données traitées
    this.processedData = {
      components: new Map(),
      templates: new Map(),
      utilities: new Map(),
      documentation: new Map(),
      schemas: new Map(),
    };
  }

  async initialize() {
    if (this.initialized) return;

    this.logger.info('Initialisation du DSFRParserV2');

    // Initialiser les services de dépendance
    await this.yamlParser.initialize();
    await this.searchIndex.initialize();

    // Créer les répertoires de sortie si nécessaire
    await this.ensureOutputDirectories();

    this.initialized = true;
    this.logger.info('DSFRParserV2 initialisé avec succès');
  }

  isInitialized() {
    return this.initialized;
  }

  /**
   * Parse tous les fichiers DSFR de manière optimisée
   */
  async parseAllSources() {
    const overallStartTime = Date.now();
    this.parsingStats.startTime = new Date().toISOString();

    this.logger.info('Démarrage du parsing DSFR V2', {
      sourceDir: this.sourceDir,
      concurrency: this.concurrency,
      validation: this.enableValidation,
    });

    try {
      // Découverte des fichiers à traiter
      const filesToProcess = await this.discoverFiles();
      this.parsingStats.totalFiles = filesToProcess.length;

      this.logger.info(`${filesToProcess.length} fichiers découverts pour traitement`);

      // Traitement par catégories en parallèle
      const results = await this.processFilesByCategory(filesToProcess);

      // Construction de l'index de recherche
      await this.buildSearchIndex();

      // Génération des fichiers de sortie
      await this.generateOutputFiles();

      // Finalisation des statistiques
      this.parsingStats.endTime = new Date().toISOString();
      const totalTime = Date.now() - overallStartTime;

      const finalStats = {
        ...this.parsingStats,
        totalTime: `${totalTime}ms`,
        performance: this.calculatePerformanceMetrics(totalTime),
      };

      this.logger.info('Parsing DSFR V2 terminé avec succès', finalStats);

      return {
        success: true,
        stats: finalStats,
        results: results,
        outputFiles: await this.getOutputFiles(),
      };
    } catch (error) {
      this.parsingStats.endTime = new Date().toISOString();
      this.parsingStats.errors++;

      this.logger.error('Erreur lors du parsing DSFR V2', {
        error: error.message,
        stack: error.stack,
      });

      throw new ParsingError('Échec du parsing DSFR V2', {
        originalError: error,
        stats: this.parsingStats,
      });
    }
  }

  /**
   * Découvre tous les fichiers à traiter
   */
  async discoverFiles() {
    const files = [];
    const categories = ['components', 'templates', 'utilities', 'documentation', 'schemas'];

    for (const category of categories) {
      const categoryPath = path.join(this.sourceDir, category);

      try {
        const categoryFiles = await this.discoverFilesInDirectory(categoryPath, category);
        files.push(...categoryFiles);

        this.parsingStats.categories.set(category, categoryFiles.length);
        this.logger.debug(`Catégorie ${category}: ${categoryFiles.length} fichiers`);
      } catch (error) {
        if (error.code !== 'ENOENT') {
          this.logger.warn(`Erreur lors de la découverte des fichiers dans ${category}`, {
            error: error.message,
          });
        }
      }
    }

    return files;
  }

  /**
   * Découvre les fichiers dans un répertoire récursivement
   */
  async discoverFilesInDirectory(dirPath, category) {
    const files = [];

    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          // Récursion dans les sous-dossiers
          const subFiles = await this.discoverFilesInDirectory(fullPath, category);
          files.push(...subFiles);
        } else if (entry.isFile() && this.shouldProcessFile(entry.name)) {
          const fileInfo = await this.analyzeFile(fullPath, category);
          if (fileInfo) {
            files.push(fileInfo);
          }
        }
      }
    } catch (error) {
      this.logger.warn(`Impossible de lire le répertoire ${dirPath}`, {
        error: error.message,
      });
    }

    return files;
  }

  /**
   * Analyse un fichier pour déterminer comment le traiter
   */
  async analyzeFile(filePath, category) {
    try {
      const stats = await fs.stat(filePath);
      const ext = path.extname(filePath).toLowerCase();
      const relativePath = path.relative(this.sourceDir, filePath);

      // Déterminer le type de fichier
      const fileType = this.determineFileType(ext, filePath);

      // Incrémenter les statistiques par type
      this.parsingStats.fileTypes.set(
        fileType,
        (this.parsingStats.fileTypes.get(fileType) || 0) + 1
      );

      return {
        path: filePath,
        relativePath,
        category,
        type: fileType,
        extension: ext,
        size: stats.size,
        modified: stats.mtime.toISOString(),
        priority: this.getProcessingPriority(fileType, category),
      };
    } catch (error) {
      this.logger.warn(`Erreur lors de l'analyse du fichier ${filePath}`, {
        error: error.message,
      });
      return null;
    }
  }

  /**
   * Traite les fichiers par catégories avec parallélisation
   */
  async processFilesByCategory(files) {
    const results = {
      components: [],
      templates: [],
      utilities: [],
      documentation: [],
      schemas: [],
    };

    // Grouper les fichiers par catégorie
    const filesByCategory = new Map();
    files.forEach((file) => {
      if (!filesByCategory.has(file.category)) {
        filesByCategory.set(file.category, []);
      }
      filesByCategory.get(file.category).push(file);
    });

    // Traiter chaque catégorie en parallèle
    const categoryPromises = Array.from(filesByCategory.entries()).map(
      async ([category, categoryFiles]) => {
        this.logger.info(`Traitement de la catégorie ${category}`, {
          files: categoryFiles.length,
        });

        const categoryResults = await this.processFilesInBatches(categoryFiles);
        results[category] = categoryResults;

        return { category, results: categoryResults };
      }
    );

    await Promise.all(categoryPromises);

    return results;
  }

  /**
   * Traite les fichiers par batch pour contrôler la concurrence
   */
  async processFilesInBatches(files) {
    const results = [];
    const batchSize = this.concurrency;

    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);

      const batchPromises = batch.map((file) => this.processFile(file));
      const batchResults = await Promise.allSettled(batchPromises);

      // Traiter les résultats du batch
      batchResults.forEach((result, index) => {
        const file = batch[index];

        if (result.status === 'fulfilled' && result.value) {
          results.push(result.value);
          this.parsingStats.processedFiles++;
        } else {
          this.parsingStats.errors++;
          this.logger.error(`Erreur lors du traitement de ${file.path}`, {
            error: result.reason?.message || 'Erreur inconnue',
          });
        }
      });

      // Log de progression
      this.logger.info(
        `Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(files.length / batchSize)} terminé`,
        {
          processed: Math.min(i + batchSize, files.length),
          total: files.length,
          errors: this.parsingStats.errors,
        }
      );
    }

    return results;
  }

  /**
   * Traite un fichier individuel
   */
  async processFile(fileInfo) {
    const startTime = Date.now();

    try {
      // Lire le contenu du fichier
      const content = await fs.readFile(fileInfo.path, 'utf-8');

      // Traiter selon le type de fichier
      let processedData;

      switch (fileInfo.type) {
        case 'yaml':
          processedData = await this.processYamlFile(fileInfo, content);
          break;
        case 'markdown':
          processedData = await this.processMarkdownFile(fileInfo, content);
          break;
        case 'json':
          processedData = await this.processJsonFile(fileInfo, content);
          break;
        case 'scss':
          processedData = await this.processScssFile(fileInfo, content);
          break;
        case 'javascript':
          processedData = await this.processJavaScriptFile(fileInfo, content);
          break;
        default:
          processedData = await this.processGenericFile(fileInfo, content);
      }

      // Enrichir avec les métadonnées de traitement
      if (processedData) {
        processedData.processing = {
          processingTime: Date.now() - startTime,
          processor: 'dsfr-parser-v2',
          version: '2.0.0',
          timestamp: new Date().toISOString(),
        };

        // Stocker dans l'index approprié
        this.storeProcessedData(processedData, fileInfo.category);
      }

      return processedData;
    } catch (error) {
      throw new FileProcessingError(`Erreur lors du traitement de ${fileInfo.path}`, {
        fileInfo,
        originalError: error,
      });
    }
  }

  /**
   * Traite un fichier YAML avec validation
   */
  async processYamlFile(fileInfo, content) {
    try {
      // Déterminer le schéma de validation basé sur le chemin/nom du fichier
      const schema = this.determineYamlSchema(fileInfo);

      // Parser avec validation
      const parseResult = await this.yamlParser.parseYaml(content, {
        filename: fileInfo.relativePath,
        schema,
        validateSchema: this.enableValidation && schema !== null,
      });

      return {
        id: this.generateId(fileInfo),
        type: 'yaml-config',
        source: fileInfo,
        data: parseResult.data,
        metadata: parseResult.metadata,
        validated: schema !== null,
      };
    } catch (error) {
      throw new YamlProcessingError(`Erreur YAML dans ${fileInfo.relativePath}`, {
        fileInfo,
        originalError: error,
      });
    }
  }

  /**
   * Traite un fichier Markdown
   */
  async processMarkdownFile(fileInfo, content) {
    // Extraire les métadonnées front-matter si présentes
    const frontMatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);

    let frontMatter = {};
    let markdownContent = content;

    if (frontMatterMatch) {
      try {
        const yamlResult = await this.yamlParser.parseYaml(frontMatterMatch[1], {
          filename: fileInfo.relativePath + ':frontmatter',
        });
        frontMatter = yamlResult.data;
        markdownContent = frontMatterMatch[2];
      } catch (error) {
        this.logger.warn(`Erreur dans le front-matter de ${fileInfo.relativePath}`, {
          error: error.message,
        });
      }
    }

    return {
      id: this.generateId(fileInfo),
      type: 'documentation',
      source: fileInfo,
      title: frontMatter.title || this.extractTitleFromMarkdown(markdownContent),
      description: frontMatter.description || this.extractDescriptionFromMarkdown(markdownContent),
      category: frontMatter.category || fileInfo.category,
      tags: frontMatter.tags || [],
      content: markdownContent,
      frontMatter,
      wordCount: markdownContent.split(/\s+/).length,
    };
  }

  /**
   * Traite un fichier JSON
   */
  async processJsonFile(fileInfo, content) {
    try {
      const data = JSON.parse(content);

      return {
        id: this.generateId(fileInfo),
        type: 'json-data',
        source: fileInfo,
        data,
        structure: this.analyzeJsonStructure(data),
      };
    } catch (error) {
      throw new JsonProcessingError(`JSON invalide dans ${fileInfo.relativePath}`, {
        fileInfo,
        originalError: error,
      });
    }
  }

  /**
   * Construit l'index de recherche à partir des données traitées
   */
  async buildSearchIndex() {
    this.logger.info("Construction de l'index de recherche");

    const documents = [];

    // Convertir toutes les données traitées en documents indexables
    for (const [category, items] of Object.entries(this.processedData)) {
      for (const [, item] of items) {
        const doc = this.convertToSearchDocument(item, category);
        if (doc) {
          documents.push(doc);
        }
      }
    }

    // Ajouter à l'index de recherche
    const indexResult = await this.searchIndex.addDocuments(documents, 'dsfr-main');

    this.logger.info('Index de recherche construit', {
      documents: indexResult.documentsAdded,
      indexTime: `${indexResult.indexTime}ms`,
    });

    return indexResult;
  }

  /**
   * Convertit un élément traité en document pour l'index de recherche
   */
  convertToSearchDocument(item, category) {
    const base = {
      id: item.id,
      title: item.title || item.name || path.basename(item.source?.path || ''),
      description: item.description || '',
      category,
      type: item.type,
      url: item.source?.relativePath,
      metadata: {
        ...item.metadata,
        processing: item.processing,
      },
    };

    // Contenu spécifique selon le type
    switch (item.type) {
      case 'documentation':
        return {
          ...base,
          content: item.content,
          tags: item.tags || [],
          wordCount: item.wordCount,
        };

      case 'yaml-config':
        return {
          ...base,
          content: JSON.stringify(item.data, null, 2),
          tags: Object.keys(item.data || {}),
          validated: item.validated,
        };

      case 'json-data':
        return {
          ...base,
          content: JSON.stringify(item.data, null, 2),
          tags: Object.keys(item.data || {}),
          structure: item.structure,
        };

      default:
        return base;
    }
  }

  /**
   * Utilitaires
   */
  shouldProcessFile(filename) {
    const validExtensions = ['.md', '.yml', '.yaml', '.json', '.scss', '.js', '.ts'];
    const ext = path.extname(filename).toLowerCase();
    return validExtensions.includes(ext) && !filename.startsWith('.');
  }

  determineFileType(extension) {
    const typeMap = {
      '.yml': 'yaml',
      '.yaml': 'yaml',
      '.md': 'markdown',
      '.json': 'json',
      '.scss': 'scss',
      '.js': 'javascript',
      '.ts': 'javascript',
    };

    return typeMap[extension] || 'unknown';
  }

  determineYamlSchema(fileInfo) {
    // Logique pour déterminer le schéma basé sur le chemin/nom
    if (fileInfo.path.includes('component')) {
      return 'dsfr-component';
    }
    if (fileInfo.path.includes('config')) {
      return 'dsfr-config';
    }
    return null; // Pas de validation
  }

  getProcessingPriority(fileType, category) {
    const priorities = {
      yaml: 3,
      json: 3,
      markdown: 2,
      scss: 1,
      javascript: 1,
    };

    const categoryBonus = {
      components: 2,
      templates: 1,
      documentation: 1,
      utilities: 0,
      schemas: 2,
    };

    return (priorities[fileType] || 0) + (categoryBonus[category] || 0);
  }

  generateId(fileInfo) {
    const basename = path.basename(fileInfo.path, path.extname(fileInfo.path));
    const category = fileInfo.category;
    return `${category}_${basename}`.toLowerCase().replace(/[^\w]/g, '_');
  }

  storeProcessedData(data, category) {
    if (!this.processedData[category]) {
      this.processedData[category] = new Map();
    }
    this.processedData[category].set(data.id, data);
  }

  extractTitleFromMarkdown(content) {
    const titleMatch = content.match(/^#\s+(.+)$/m);
    return titleMatch ? titleMatch[1].trim() : null;
  }

  extractDescriptionFromMarkdown(content) {
    // Prendre le premier paragraphe après le titre
    const lines = content.split('\n');
    let foundTitle = false;

    for (const line of lines) {
      if (line.startsWith('#')) {
        foundTitle = true;
        continue;
      }

      if (foundTitle && line.trim() && !line.startsWith('#')) {
        return line.trim().substring(0, 200);
      }
    }

    return null;
  }

  analyzeJsonStructure(data) {
    const analyze = (obj, depth = 0) => {
      if (depth > 3) return 'deep';

      if (Array.isArray(obj)) {
        return `array[${obj.length}]`;
      }

      if (typeof obj === 'object' && obj !== null) {
        const keys = Object.keys(obj);
        return `object{${keys.length}}`;
      }

      return typeof obj;
    };

    return analyze(data);
  }

  calculatePerformanceMetrics(totalTime) {
    const filesPerSecond = this.parsingStats.totalFiles / (totalTime / 1000);
    const bytesPerSecond = (this.parsingStats.totalFiles * 1000) / (totalTime / 1000); // Estimation

    return {
      filesPerSecond: Math.round(filesPerSecond * 100) / 100,
      averageFileTime: Math.round((totalTime / this.parsingStats.totalFiles) * 100) / 100,
      throughput: `${Math.round(bytesPerSecond)} bytes/s`,
      efficiency: this.parsingStats.processedFiles / this.parsingStats.totalFiles,
    };
  }

  async ensureOutputDirectories() {
    const dirs = ['components', 'templates', 'utilities', 'documentation', 'schemas'];

    for (const dir of dirs) {
      const fullPath = path.join(this.outputDir, dir);
      await fs.mkdir(fullPath, { recursive: true });
    }
  }

  async generateOutputFiles() {
    this.logger.info('Génération des fichiers de sortie');

    // Générer les fichiers par catégorie
    for (const [category, items] of Object.entries(this.processedData)) {
      if (items.size > 0) {
        const outputPath = path.join(this.outputDir, category, 'index.json');
        const data = Object.fromEntries(items);

        await fs.writeFile(outputPath, JSON.stringify(data, null, 2));
        this.logger.debug(`Fichier de sortie généré: ${outputPath}`, {
          items: items.size,
        });
      }
    }

    // Générer l'index global
    const globalIndex = {
      metadata: {
        version: '2.0.0',
        generated: new Date().toISOString(),
        stats: this.parsingStats,
      },
      categories: Object.fromEntries(
        Object.entries(this.processedData).map(([cat, items]) => [cat, items.size])
      ),
    };

    const globalIndexPath = path.join(this.outputDir, 'index.json');
    await fs.writeFile(globalIndexPath, JSON.stringify(globalIndex, null, 2));
  }

  async getOutputFiles() {
    const files = [];

    try {
      const entries = await fs.readdir(this.outputDir, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isFile() && entry.name.endsWith('.json')) {
          const filePath = path.join(this.outputDir, entry.name);
          const stats = await fs.stat(filePath);

          files.push({
            name: entry.name,
            path: filePath,
            size: stats.size,
            modified: stats.mtime.toISOString(),
          });
        }
      }
    } catch (error) {
      this.logger.warn('Erreur lors de la lecture des fichiers de sortie', {
        error: error.message,
      });
    }

    return files;
  }

  /**
   * API publique pour la recherche
   */
  async search(query, options = {}) {
    if (!this.initialized) {
      throw new Error('Parser non initialisé');
    }

    return await this.searchIndex.search(query, {
      index: 'dsfr-main',
      ...options,
    });
  }

  /**
   * Obtient les statistiques de parsing
   */
  getParsingStats() {
    return {
      ...this.parsingStats,
      yamlStats: this.yamlParser.getStats(),
      searchStats: this.searchIndex.getSearchStats(),
    };
  }

  async dispose() {
    await this.yamlParser.dispose();
    await this.searchIndex.dispose();
    this.processedData = {};
    this.initialized = false;
    this.logger.info('DSFRParserV2 disposed');
  }
}

/**
 * Classes d'erreur personnalisées
 */
class ParsingError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'ParsingError';
    this.details = details;
  }
}

class FileProcessingError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'FileProcessingError';
    this.details = details;
  }
}

class YamlProcessingError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'YamlProcessingError';
    this.details = details;
  }
}

class JsonProcessingError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'JsonProcessingError';
    this.details = details;
  }
}

module.exports = {
  DSFRParserV2,
  ParsingError,
  FileProcessingError,
  YamlProcessingError,
  JsonProcessingError,
};
