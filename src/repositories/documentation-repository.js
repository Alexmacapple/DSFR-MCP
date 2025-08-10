/**
 * Repository pour la gestion des données de documentation DSFR
 * Implémente le pattern Repository avec lazy loading et cache
 */

const fs = require('fs').promises;
const path = require('path');
const Fuse = require('fuse.js');
const { IDataRepository } = require('../core/interfaces');

class DocumentationRepository extends IDataRepository {
  constructor(config, cacheService, logger) {
    super();
    this.config = config;
    this.cache = cacheService;
    this.logger = logger;

    // État interne
    this.documents = new Map();
    this.categories = new Map();
    this.componentsMap = new Map();
    this.patternsMap = new Map();
    this.searchIndex = null;
    this.initialized = false;

    // Configuration du cache
    this.CACHE_PREFIX = 'doc:';
    this.CACHE_TTL = 30 * 60 * 1000; // 30 minutes
    this.INDEX_CACHE_KEY = 'search_index';
  }

  async initialize() {
    if (this.initialized) return;

    this.logger.info('Initialisation du DocumentationRepository');

    try {
      // Essayer de charger depuis le cache d'abord
      const cachedData = await this.loadFromCache();

      if (cachedData) {
        this.logger.info('Données chargées depuis le cache');
        this.restoreFromCache(cachedData);
      } else {
        this.logger.info('Cache vide, indexation des fichiers...');
        await this.indexDocumentation();
        await this.saveToCache();
      }

      this.initialized = true;
      this.logger.info(`DocumentationRepository initialisé avec ${this.documents.size} documents`);
    } catch (error) {
      this.logger.error("Erreur lors de l'initialisation du DocumentationRepository", error);
      throw error;
    }
  }

  isInitialized() {
    return this.initialized;
  }

  async findById(id) {
    await this.ensureInitialized();

    // Vérifier le cache d'abord
    const cacheKey = `${this.CACHE_PREFIX}${id}`;
    const cached = await this.cache.get(cacheKey);

    if (cached) {
      return cached;
    }

    const document = this.documents.get(id);

    if (document) {
      // Mettre en cache
      await this.cache.set(cacheKey, document, this.CACHE_TTL);
    }

    return document || null;
  }

  async findAll(criteria = {}, options = {}) {
    await this.ensureInitialized();

    const { limit = 10, offset = 0, sortBy = 'title', sortOrder = 'asc' } = options;
    let results = Array.from(this.documents.values());

    // Appliquer les filtres
    if (criteria.category) {
      results = results.filter((doc) => doc.category === criteria.category);
    }

    if (criteria.componentType) {
      results = results.filter((doc) => doc.componentType === criteria.componentType);
    }

    if (criteria.tags && criteria.tags.length > 0) {
      results = results.filter((doc) => criteria.tags.some((tag) => doc.tags.includes(tag)));
    }

    // Tri
    results.sort((a, b) => {
      const aVal = a[sortBy] || '';
      const bVal = b[sortBy] || '';
      const comparison = aVal.localeCompare(bVal);
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    // Pagination
    const total = results.length;
    results = results.slice(offset, offset + limit);

    return {
      data: results,
      total,
      offset,
      limit,
      hasMore: offset + limit < total,
    };
  }

  async search(query, options = {}) {
    await this.ensureInitialized();

    const { limit = 10, category = null, threshold = 0.3, includeScore = true } = options;

    // Créer l'index de recherche si nécessaire
    if (!this.searchIndex) {
      await this.createSearchIndex();
    }

    let documents = Array.from(this.documents.values());

    // Filtrer par catégorie si spécifiée
    if (category) {
      documents = documents.filter((doc) => doc.category === category);
    }

    // Recherche avec Fuse.js
    const fuse = new Fuse(documents, {
      keys: [
        { name: 'title', weight: 0.7 },
        { name: 'content', weight: 0.2 },
        { name: 'tags', weight: 0.1 },
      ],
      threshold,
      includeScore,
    });

    const searchResults = fuse.search(query, { limit });

    return {
      query,
      results: searchResults.map((result) => ({
        document: result.item,
        score: result.score,
        matches: result.matches,
      })),
      total: searchResults.length,
    };
  }

  async count(criteria = {}) {
    await this.ensureInitialized();

    let count = this.documents.size;

    if (criteria.category) {
      const categoryDocs = this.categories.get(criteria.category);
      count = categoryDocs ? categoryDocs.length : 0;
    }

    return count;
  }

  /**
   * Méthodes spécifiques à la documentation
   */

  async getCategories() {
    await this.ensureInitialized();

    const categories = {};
    for (const [key, docs] of this.categories) {
      categories[key] = {
        name: this.config.categories[key]?.name || key,
        description: this.config.categories[key]?.description || '',
        count: docs.length,
      };
    }

    return categories;
  }

  async getComponent(name) {
    await this.ensureInitialized();
    return this.componentsMap.get(name.toLowerCase()) || null;
  }

  async getPattern(name) {
    await this.ensureInitialized();
    return this.patternsMap.get(name.toLowerCase()) || null;
  }

  /**
   * Méthodes privées
   */

  async ensureInitialized() {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  async indexDocumentation() {
    const fichesPath = this.config.paths.fiches;

    try {
      const files = await fs.readdir(fichesPath);
      const mdFiles = files.filter((f) => f.endsWith('.md'));

      this.logger.info(`Indexation de ${mdFiles.length} fichiers markdown`);

      // Traitement par batch pour éviter la surcharge mémoire
      const batchSize = 10;
      for (let i = 0; i < mdFiles.length; i += batchSize) {
        const batch = mdFiles.slice(i, i + batchSize);
        await this.processBatch(batch, fichesPath);
      }

      // Créer l'index de recherche
      await this.createSearchIndex();
    } catch (error) {
      this.logger.error("Erreur lors de l'indexation", error);
      throw error;
    }
  }

  async processBatch(files, basePath) {
    const promises = files.map((file) => this.processFile(file, basePath));
    await Promise.all(promises);
  }

  async processFile(filename, basePath) {
    try {
      const filePath = path.join(basePath, filename);
      const content = await fs.readFile(filePath, 'utf-8');

      const doc = this.parseDocument(filename, content);
      this.documents.set(doc.id, doc);

      // Catégoriser
      this.categorizeDocument(doc);
    } catch (error) {
      this.logger.warn(`Erreur lors du traitement de ${filename}`, { error: error.message });
    }
  }

  parseDocument(filename, content) {
    // Même logique que dans le service original
    const lines = content.split('\n');
    let url = '';
    let title = '';
    let markdownContent = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.startsWith('URL:') && lines[i + 1]) {
        url = lines[i + 1].trim();
      } else if (line.startsWith('Title:') && lines[i + 1]) {
        title = lines[i + 1].trim();
      } else if (line.startsWith('Markdown:')) {
        markdownContent = lines.slice(i + 1).join('\n');
        break;
      }
    }

    const category = this.detectCategory(filename, title, markdownContent);
    const componentType = this.detectComponentType(filename, title, markdownContent);
    const codeExamples = this.extractCodeExamples(markdownContent);
    const tags = this.generateTags(title, markdownContent);

    return {
      id: filename.replace('.md', ''),
      filename,
      url,
      title,
      category,
      componentType,
      content: markdownContent,
      codeExamples,
      tags,
      metadata: {
        lastModified: new Date().toISOString(),
        wordCount: markdownContent.split(/\s+/).length,
        size: content.length,
      },
    };
  }

  detectCategory(filename, title, _content) {
    const lowerTitle = title.toLowerCase();

    if (filename.includes('fondamentaux') || lowerTitle.includes('fondamentaux')) return 'core';
    if (filename.includes('outils-d-analyse') || lowerTitle.includes('analyse')) return 'analytics';
    if (lowerTitle.includes('modèle') || lowerTitle.includes('page')) return 'layout';
    if (lowerTitle.includes('utilitaire')) return 'utility';
    if (lowerTitle.includes('couleur') && lowerTitle.includes('combinaison')) return 'scheme';

    return 'component';
  }

  detectComponentType(filename, title, _content) {
    const lowerTitle = title.toLowerCase();

    if (lowerTitle.includes('formulaire') || lowerTitle.includes('champ')) return 'form';
    if (lowerTitle.includes('navigation') || lowerTitle.includes('menu')) return 'navigation';
    if (lowerTitle.includes('alerte') || lowerTitle.includes('message')) return 'feedback';
    if (lowerTitle.includes('carte') || lowerTitle.includes('tuile')) return 'content';
    if (lowerTitle.includes('mise en page') || lowerTitle.includes('grille')) return 'layout';

    return 'utility';
  }

  extractCodeExamples(markdown) {
    const codeBlocks = [];
    const codeRegex = /```(?:html|css|javascript|jsx|vue)?\\n([\\s\\S]*?)```/g;
    let match;

    while ((match = codeRegex.exec(markdown)) !== null) {
      codeBlocks.push({
        code: match[1].trim(),
        language: match[0].split('\\n')[0].replace('```', '') || 'html',
      });
    }

    return codeBlocks;
  }

  generateTags(title, content) {
    const tags = new Set();
    const keywords = [
      'bouton',
      'formulaire',
      'navigation',
      'carte',
      'alerte',
      'modal',
      'accordéon',
      'tableau',
      'liste',
      'lien',
      'icône',
      'badge',
      'accessibilité',
      'responsive',
      'mobile',
      'desktop',
    ];

    const lowerTitle = title.toLowerCase();
    const lowerContent = content.toLowerCase();

    keywords.forEach((keyword) => {
      if (lowerTitle.includes(keyword) || lowerContent.includes(keyword)) {
        tags.add(keyword);
      }
    });

    return Array.from(tags);
  }

  categorizeDocument(doc) {
    // Ajouter à la catégorie
    if (!this.categories.has(doc.category)) {
      this.categories.set(doc.category, []);
    }
    this.categories.get(doc.category).push(doc);

    // Maps spécialisées
    if (doc.category === 'component') {
      const componentName = this.extractComponentName(doc.title);
      this.componentsMap.set(componentName, doc);
    }

    if (doc.category === 'layout') {
      const patternName = this.extractPatternName(doc.title);
      this.patternsMap.set(patternName, doc);
    }
  }

  extractComponentName(title) {
    return title
      .replace('- Système de design', '')
      .replace(/^\\d+-/, '')
      .trim()
      .toLowerCase()
      .replace(/\\s+/g, '-');
  }

  extractPatternName(title) {
    return this.extractComponentName(title);
  }

  async createSearchIndex() {
    this.searchIndex = new Fuse(Array.from(this.documents.values()), {
      keys: ['title', 'content', 'tags'],
      threshold: 0.3,
      includeScore: true,
    });
  }

  async loadFromCache() {
    try {
      const cacheData = await this.cache.get(this.INDEX_CACHE_KEY);
      return cacheData;
    } catch (error) {
      this.logger.warn('Erreur lors du chargement du cache', { error: error.message });
      return null;
    }
  }

  restoreFromCache(cachedData) {
    this.documents = new Map(cachedData.documents);
    this.categories = new Map(cachedData.categories);
    this.componentsMap = new Map(cachedData.componentsMap);
    this.patternsMap = new Map(cachedData.patternsMap);
  }

  async saveToCache() {
    try {
      const cacheData = {
        documents: Array.from(this.documents.entries()),
        categories: Array.from(this.categories.entries()),
        componentsMap: Array.from(this.componentsMap.entries()),
        patternsMap: Array.from(this.patternsMap.entries()),
        timestamp: Date.now(),
      };

      await this.cache.set(this.INDEX_CACHE_KEY, cacheData, this.CACHE_TTL);
      this.logger.info('Données sauvegardées en cache');
    } catch (error) {
      this.logger.warn('Erreur lors de la sauvegarde en cache', { error: error.message });
    }
  }

  async dispose() {
    this.documents.clear();
    this.categories.clear();
    this.componentsMap.clear();
    this.patternsMap.clear();
    this.searchIndex = null;
    this.initialized = false;
  }
}

module.exports = DocumentationRepository;
