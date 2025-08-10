/**
 * Service d'index de recherche optimisé pour DSFR-MCP
 * Fournit une recherche avancée avec facettes, filtres et cache persistant
 */

const Fuse = require('fuse.js');
const { IService } = require('../core/interfaces');

class SearchIndexService extends IService {
  constructor(config, cache, logger) {
    super();
    this.config = config;
    this.cache = cache;
    this.logger = logger;

    this.initialized = false;
    this.indexes = new Map();
    this.facets = new Map();
    this.documents = new Map();

    // Configuration de Fuse.js pour recherche fuzzy
    this.fuseConfig = {
      includeScore: true,
      includeMatches: true,
      threshold: 0.3, // Seuil de similitude
      minMatchCharLength: 2,
      findAllMatches: true,
      ignoreLocation: true,
    };

    // Statistiques
    this.stats = {
      totalDocuments: 0,
      indexSize: 0,
      lastIndexUpdate: null,
      searchCount: 0,
      averageSearchTime: 0,
    };
  }

  async initialize() {
    if (this.initialized) return;

    this.logger.info('Initialisation du SearchIndexService');

    // Charger l'index depuis le cache persistant si disponible
    await this.loadPersistedIndex();

    this.initialized = true;
    this.logger.info('SearchIndexService initialisé', {
      documents: this.stats.totalDocuments,
      indexes: this.indexes.size,
    });
  }

  isInitialized() {
    return this.initialized;
  }

  /**
   * Ajoute des documents à l'index
   */
  async addDocuments(documents, indexName = 'default') {
    const startTime = Date.now();

    if (!Array.isArray(documents)) {
      documents = [documents];
    }

    // Préparer les documents pour l'indexation
    const processedDocs = documents.map((doc) => this.preprocessDocument(doc));

    // Construire les facettes
    this.buildFacets(processedDocs, indexName);

    // Créer l'index Fuse
    const searchKeys = await this.generateSearchKeys(processedDocs);
    const fuseIndex = new Fuse(processedDocs, {
      ...this.fuseConfig,
      keys: searchKeys,
    });

    this.indexes.set(indexName, fuseIndex);

    // Stocker les documents pour les récupérer facilement
    processedDocs.forEach((doc) => {
      this.documents.set(doc.id, doc);
    });

    // Mettre à jour les statistiques
    this.stats.totalDocuments += processedDocs.length;
    this.stats.indexSize = this.calculateIndexSize();
    this.stats.lastIndexUpdate = new Date().toISOString();

    // Persister l'index
    await this.persistIndex();

    const indexTime = Date.now() - startTime;
    this.logger.info(`Index '${indexName}' mis à jour`, {
      documents: processedDocs.length,
      totalDocuments: this.stats.totalDocuments,
      indexTime: `${indexTime}ms`,
    });

    return {
      indexName,
      documentsAdded: processedDocs.length,
      totalDocuments: this.stats.totalDocuments,
      indexTime,
    };
  }

  /**
   * Recherche dans l'index avec facettes et filtres
   */
  async search(query, options = {}) {
    const startTime = Date.now();

    const {
      index = 'default',
      facets = {},
      filters = {},
      limit = 10,
      offset = 0,
      sortBy = 'relevance',
      sortOrder = 'desc',
      includeHighlights = true,
      includeStats = false,
    } = options;

    const fuseIndex = this.indexes.get(index);
    if (!fuseIndex) {
      throw new Error(`Index '${index}' non trouvé`);
    }

    // Effectuer la recherche fuzzy
    let results = query ? fuseIndex.search(query) : this.getAllDocuments(index);

    // Appliquer les filtres de facettes
    if (Object.keys(facets).length > 0) {
      results = this.applyFacetFilters(results, facets);
    }

    // Appliquer les filtres personnalisés
    if (Object.keys(filters).length > 0) {
      results = this.applyCustomFilters(results, filters);
    }

    // Trier les résultats
    results = this.sortResults(results, sortBy, sortOrder);

    // Pagination
    const total = results.length;
    const paginatedResults = results.slice(offset, offset + limit);

    // Formater les résultats
    const formattedResults = paginatedResults.map((result) => {
      const doc = result.item || result;
      const formatted = {
        id: doc.id,
        title: doc.title,
        description: doc.description,
        category: doc.category,
        url: doc.url,
        score: result.score || 1,
      };

      // Ajouter les highlights si demandé
      if (includeHighlights && result.matches) {
        formatted.highlights = this.formatHighlights(result.matches);
      }

      return formatted;
    });

    // Calculer les facettes disponibles
    const availableFacets = this.calculateAvailableFacets(results, index);

    const searchTime = Date.now() - startTime;
    this.updateSearchStats(searchTime);

    const response = {
      query,
      results: formattedResults,
      facets: availableFacets,
      pagination: {
        total,
        limit,
        offset,
        pages: Math.ceil(total / limit),
        currentPage: Math.floor(offset / limit) + 1,
      },
      searchTime,
    };

    if (includeStats) {
      response.stats = this.getSearchStats();
    }

    return response;
  }

  /**
   * Préprocesse un document pour l'indexation
   */
  preprocessDocument(doc) {
    return {
      id: doc.id || this.generateId(doc),
      title: doc.title || doc.name || '',
      description: doc.description || doc.summary || '',
      content: doc.content || '',
      category: doc.category || 'uncategorized',
      subcategory: doc.subcategory || null,
      tags: Array.isArray(doc.tags) ? doc.tags : [],
      type: doc.type || 'document',
      url: doc.url || null,
      metadata: doc.metadata || {},
      searchableText: this.buildSearchableText(doc),
      // Ajout de métadonnées d'indexation
      indexed: new Date().toISOString(),
      version: doc.version || '1.0.0',
    };
  }

  /**
   * Construit le texte recherchable à partir d'un document
   */
  buildSearchableText(doc) {
    const fields = [
      doc.title,
      doc.name,
      doc.description,
      doc.summary,
      doc.content,
      ...(Array.isArray(doc.tags) ? doc.tags : []),
      doc.category,
      doc.subcategory,
    ].filter(Boolean);

    return fields.join(' ').toLowerCase();
  }

  /**
   * Génère les clés de recherche basées sur les documents
   */
  async generateSearchKeys(documents) {
    const baseKeys = [
      { name: 'title', weight: 0.8 },
      { name: 'description', weight: 0.6 },
      { name: 'searchableText', weight: 0.4 },
      { name: 'tags', weight: 0.3 },
      { name: 'category', weight: 0.2 },
    ];

    // Analyser les documents pour détecter des clés supplémentaires
    const additionalKeys = new Set();

    documents.forEach((doc) => {
      if (doc.metadata) {
        Object.keys(doc.metadata).forEach((key) => {
          if (typeof doc.metadata[key] === 'string') {
            additionalKeys.add(`metadata.${key}`);
          }
        });
      }
    });

    // Ajouter les clés supplémentaires avec un poids faible
    const extraKeys = Array.from(additionalKeys).map((key) => ({
      name: key,
      weight: 0.1,
    }));

    return [...baseKeys, ...extraKeys];
  }

  /**
   * Construit les facettes à partir des documents
   */
  buildFacets(documents, indexName) {
    const facets = {
      category: new Map(),
      subcategory: new Map(),
      type: new Map(),
      tags: new Map(),
    };

    documents.forEach((doc) => {
      // Compter les catégories
      if (doc.category) {
        facets.category.set(doc.category, (facets.category.get(doc.category) || 0) + 1);
      }

      // Compter les sous-catégories
      if (doc.subcategory) {
        facets.subcategory.set(doc.subcategory, (facets.subcategory.get(doc.subcategory) || 0) + 1);
      }

      // Compter les types
      if (doc.type) {
        facets.type.set(doc.type, (facets.type.get(doc.type) || 0) + 1);
      }

      // Compter les tags
      if (Array.isArray(doc.tags)) {
        doc.tags.forEach((tag) => {
          facets.tags.set(tag, (facets.tags.get(tag) || 0) + 1);
        });
      }
    });

    // Convertir les Maps en objets et trier par count
    const processedFacets = {};
    Object.keys(facets).forEach((facetName) => {
      processedFacets[facetName] = Array.from(facets[facetName].entries())
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count);
    });

    this.facets.set(indexName, processedFacets);
  }

  /**
   * Applique les filtres de facettes
   */
  applyFacetFilters(results, facets) {
    return results.filter((result) => {
      const doc = result.item || result;

      return Object.entries(facets).every(([facetName, facetValues]) => {
        if (!Array.isArray(facetValues)) {
          facetValues = [facetValues];
        }

        switch (facetName) {
          case 'category':
            return facetValues.includes(doc.category);
          case 'subcategory':
            return facetValues.includes(doc.subcategory);
          case 'type':
            return facetValues.includes(doc.type);
          case 'tags':
            return facetValues.some((tag) => doc.tags.includes(tag));
          default:
            return true;
        }
      });
    });
  }

  /**
   * Applique les filtres personnalisés
   */
  applyCustomFilters(results, filters) {
    return results.filter((result) => {
      const doc = result.item || result;

      return Object.entries(filters).every(([field, condition]) => {
        const value = this.getNestedValue(doc, field);

        if (typeof condition === 'string' || typeof condition === 'number') {
          return value === condition;
        }

        if (typeof condition === 'object') {
          if (condition.$regex) {
            return new RegExp(condition.$regex, condition.$options || 'i').test(value);
          }
          if (condition.$in) {
            return condition.$in.includes(value);
          }
          if (condition.$gte !== undefined) {
            return value >= condition.$gte;
          }
          if (condition.$lte !== undefined) {
            return value <= condition.$lte;
          }
        }

        return true;
      });
    });
  }

  /**
   * Trie les résultats
   */
  sortResults(results, sortBy, sortOrder) {
    const multiplier = sortOrder === 'desc' ? -1 : 1;

    return results.sort((a, b) => {
      const docA = a.item || a;
      const docB = b.item || b;

      switch (sortBy) {
        case 'relevance':
          return multiplier * ((a.score || 0) - (b.score || 0));
        case 'title':
          return multiplier * docA.title.localeCompare(docB.title);
        case 'category':
          return multiplier * docA.category.localeCompare(docB.category);
        case 'date': {
          const dateA = new Date(docA.indexed);
          const dateB = new Date(docB.indexed);
          return multiplier * (dateB - dateA);
        }
        default:
          return 0;
      }
    });
  }

  /**
   * Calcule les facettes disponibles pour un ensemble de résultats
   */
  calculateAvailableFacets(results, indexName) {
    const indexFacets = this.facets.get(indexName) || {};

    // Si pas de résultats, renvoyer les facettes complètes
    if (results.length === 0) {
      return indexFacets;
    }

    // Calculer les facettes basées sur les résultats actuels
    const resultFacets = {
      category: new Map(),
      subcategory: new Map(),
      type: new Map(),
      tags: new Map(),
    };

    results.forEach((result) => {
      const doc = result.item || result;

      if (doc.category) {
        resultFacets.category.set(doc.category, (resultFacets.category.get(doc.category) || 0) + 1);
      }
      if (doc.subcategory) {
        resultFacets.subcategory.set(
          doc.subcategory,
          (resultFacets.subcategory.get(doc.subcategory) || 0) + 1
        );
      }
      if (doc.type) {
        resultFacets.type.set(doc.type, (resultFacets.type.get(doc.type) || 0) + 1);
      }
      if (Array.isArray(doc.tags)) {
        doc.tags.forEach((tag) => {
          resultFacets.tags.set(tag, (resultFacets.tags.get(tag) || 0) + 1);
        });
      }
    });

    // Convertir en format final
    const processedFacets = {};
    Object.keys(resultFacets).forEach((facetName) => {
      processedFacets[facetName] = Array.from(resultFacets[facetName].entries())
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count);
    });

    return processedFacets;
  }

  /**
   * Formate les highlights de recherche
   */
  formatHighlights(matches) {
    return matches.map((match) => ({
      field: match.key,
      highlights: match.indices.map(([start, end]) => ({
        start,
        end,
        text: match.value.substring(start, end + 1),
      })),
    }));
  }

  /**
   * Obtient tous les documents d'un index
   */
  getAllDocuments(indexName) {
    const fuseIndex = this.indexes.get(indexName);
    if (!fuseIndex) return [];

    // Fuse.js ne permet pas d'obtenir tous les documents directement
    // On fait une recherche vide pour récupérer tout
    return fuseIndex.getIndex().docs.map((doc) => ({ item: doc, score: 1 }));
  }

  /**
   * Charge l'index persisté depuis le cache
   */
  async loadPersistedIndex() {
    try {
      const cacheKey = 'search-index';
      const persistedData = await this.cache.get(cacheKey);

      if (persistedData) {
        // Reconstruire les indexes Fuse à partir des données persistées
        for (const [indexName, data] of Object.entries(persistedData.indexes)) {
          const fuseIndex = new Fuse(data.documents, {
            ...this.fuseConfig,
            keys: data.keys,
          });
          this.indexes.set(indexName, fuseIndex);
        }

        // Restaurer les autres données
        this.facets = new Map(Object.entries(persistedData.facets || {}));
        this.documents = new Map(Object.entries(persistedData.documents || {}));
        this.stats = { ...this.stats, ...persistedData.stats };

        this.logger.info('Index persisté chargé depuis le cache', {
          indexes: this.indexes.size,
          documents: this.stats.totalDocuments,
        });
      }
    } catch (error) {
      this.logger.warn("Erreur lors du chargement de l'index persisté", { error: error.message });
    }
  }

  /**
   * Persiste l'index dans le cache
   */
  async persistIndex() {
    try {
      const cacheKey = 'search-index';

      // Préparer les données à persister
      const persistData = {
        indexes: {},
        facets: Object.fromEntries(this.facets),
        documents: Object.fromEntries(this.documents),
        stats: this.stats,
        version: '1.0.0',
        timestamp: new Date().toISOString(),
      };

      // Extraire les données des indexes Fuse
      for (const [indexName, fuseIndex] of this.indexes) {
        persistData.indexes[indexName] = {
          documents: fuseIndex.getIndex().docs,
          keys: fuseIndex.options.keys,
        };
      }

      // Sauvegarder dans le cache avec TTL long (24h)
      await this.cache.set(cacheKey, persistData, 24 * 60 * 60 * 1000);

      this.logger.debug('Index persisté dans le cache');
    } catch (error) {
      this.logger.error("Erreur lors de la persistance de l'index", { error: error.message });
    }
  }

  /**
   * Utilitaires
   */
  generateId(doc) {
    return doc.title ? doc.title.toLowerCase().replace(/[^\w]/g, '_') : `doc_${Date.now()}`;
  }

  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  calculateIndexSize() {
    let size = 0;
    for (const [, index] of this.indexes) {
      size += JSON.stringify(index.getIndex().docs).length;
    }
    return size;
  }

  updateSearchStats(searchTime) {
    this.stats.searchCount++;
    const alpha = 0.1;
    this.stats.averageSearchTime =
      this.stats.averageSearchTime === 0
        ? searchTime
        : alpha * searchTime + (1 - alpha) * this.stats.averageSearchTime;
  }

  getSearchStats() {
    return {
      ...this.stats,
      averageSearchTime: Math.round(this.stats.averageSearchTime) + 'ms',
      indexSizeFormatted: this.formatBytes(this.stats.indexSize),
    };
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Nettoie les ressources
   */
  async dispose() {
    await this.persistIndex();
    this.indexes.clear();
    this.facets.clear();
    this.documents.clear();
    this.initialized = false;
    this.logger.info('SearchIndexService disposed');
  }
}

module.exports = SearchIndexService;
