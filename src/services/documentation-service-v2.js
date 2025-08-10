/**
 * Service de documentation DSFR - Version 2 avec architecture optimisée
 * Utilise le DocumentationRepository et le cache intelligent
 */

const { IService } = require('../core/interfaces');

class DocumentationServiceV2 extends IService {
  constructor(repository, cache, config, logger) {
    super();
    this.repository = repository;
    this.cache = cache;
    this.config = config;
    this.logger = logger;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    this.logger.info('Initialisation du DocumentationServiceV2');

    try {
      // Le repository se charge de l'initialisation des données
      await this.repository.initialize();

      this.initialized = true;
      this.logger.info('DocumentationServiceV2 initialisé');
    } catch (error) {
      this.logger.error("Erreur lors de l'initialisation du DocumentationServiceV2", error);
      throw error;
    }
  }

  isInitialized() {
    return this.initialized;
  }

  /**
   * Outils MCP - Implémentations optimisées
   */

  async searchComponents({ query, category, limit = 10 }) {
    await this.ensureInitialized();

    const cacheKey = `search:${query}:${category || 'all'}:${limit}`;
    const cached = await this.cache.get(cacheKey);

    if (cached) {
      return {
        content: [
          {
            type: 'text',
            text: cached,
          },
        ],
      };
    }

    try {
      const searchResult = await this.repository.search(query, {
        category,
        limit,
        threshold: 0.3,
      });

      const formattedText = this.formatSearchResults(searchResult.results, query);

      // Cache le résultat
      await this.cache.set(cacheKey, formattedText, 10 * 60 * 1000); // 10 minutes

      return {
        content: [
          {
            type: 'text',
            text: formattedText,
          },
        ],
      };
    } catch (error) {
      this.logger.error('Erreur lors de la recherche de composants', error);
      return {
        content: [
          {
            type: 'text',
            text: `Erreur lors de la recherche: ${error.message}`,
          },
        ],
      };
    }
  }

  async getComponentDetails({
    component_name,
    include_examples = true,
    include_accessibility = true,
  }) {
    await this.ensureInitialized();

    const cacheKey = `component:${component_name}:${include_examples}:${include_accessibility}`;
    const cached = await this.cache.get(cacheKey);

    if (cached) {
      return {
        content: [
          {
            type: 'text',
            text: cached,
          },
        ],
      };
    }

    try {
      // Essayer d'abord par la map des composants
      let component = await this.repository.getComponent(component_name);

      // Sinon rechercher dans tous les documents
      if (!component) {
        const searchResult = await this.repository.search(component_name, { limit: 1 });
        component = searchResult.results[0]?.document;
      }

      if (!component) {
        return {
          content: [
            {
              type: 'text',
              text: `Composant "${component_name}" non trouvé.`,
            },
          ],
        };
      }

      const formattedText = this.formatComponentDetails(
        component,
        include_examples,
        include_accessibility
      );

      // Cache le résultat
      await this.cache.set(cacheKey, formattedText, 30 * 60 * 1000); // 30 minutes

      return {
        content: [
          {
            type: 'text',
            text: formattedText,
          },
        ],
      };
    } catch (error) {
      this.logger.error('Erreur lors de la récupération des détails du composant', error);
      return {
        content: [
          {
            type: 'text',
            text: `Erreur: ${error.message}`,
          },
        ],
      };
    }
  }

  async listCategories() {
    await this.ensureInitialized();

    const cacheKey = 'categories:list';
    const cached = await this.cache.get(cacheKey);

    if (cached) {
      return {
        content: [
          {
            type: 'text',
            text: cached,
          },
        ],
      };
    }

    try {
      const categories = await this.repository.getCategories();
      const formattedText = this.formatCategoriesList(categories);

      // Cache longtemps car les catégories changent rarement
      await this.cache.set(cacheKey, formattedText, 60 * 60 * 1000); // 1 heure

      return {
        content: [
          {
            type: 'text',
            text: formattedText,
          },
        ],
      };
    } catch (error) {
      this.logger.error('Erreur lors de la récupération des catégories', error);
      return {
        content: [
          {
            type: 'text',
            text: `Erreur: ${error.message}`,
          },
        ],
      };
    }
  }

  async searchPatterns({ query, pattern_type }) {
    await this.ensureInitialized();

    const cacheKey = `patterns:${query}:${pattern_type || 'all'}`;
    const cached = await this.cache.get(cacheKey);

    if (cached) {
      return {
        content: [
          {
            type: 'text',
            text: cached,
          },
        ],
      };
    }

    try {
      // Rechercher dans la catégorie layout principalement
      const searchResult = await this.repository.search(query, {
        category: 'layout',
        limit: 10,
      });

      // Filtrer par type de pattern si spécifié
      let results = searchResult.results;
      if (pattern_type) {
        results = results.filter((result) =>
          result.document.title.toLowerCase().includes(pattern_type.toLowerCase())
        );
      }

      const formattedText = this.formatPatternResults(results, query);

      // Cache le résultat
      await this.cache.set(cacheKey, formattedText, 15 * 60 * 1000); // 15 minutes

      return {
        content: [
          {
            type: 'text',
            text: formattedText,
          },
        ],
      };
    } catch (error) {
      this.logger.error('Erreur lors de la recherche de patterns', error);
      return {
        content: [
          {
            type: 'text',
            text: `Erreur: ${error.message}`,
          },
        ],
      };
    }
  }

  async getIcons({ category, search }) {
    await this.ensureInitialized();

    const cacheKey = `icons:${category || 'all'}:${search || ''}`;
    const cached = await this.cache.get(cacheKey);

    if (cached) {
      return {
        content: [
          {
            type: 'text',
            text: cached,
          },
        ],
      };
    }

    try {
      // Rechercher les documents d'icônes
      const searchQuery = search || 'icône';
      const searchResult = await this.repository.search(searchQuery, { limit: 20 });

      // Filtrer les résultats d'icônes
      const iconResults = searchResult.results.filter(
        (result) =>
          result.document.title.toLowerCase().includes('icône') ||
          result.document.title.toLowerCase().includes('icon')
      );

      const formattedText = this.formatIconResults(iconResults, category);

      // Cache longtemps car les icônes changent rarement
      await this.cache.set(cacheKey, formattedText, 60 * 60 * 1000); // 1 heure

      return {
        content: [
          {
            type: 'text',
            text: formattedText,
          },
        ],
      };
    } catch (error) {
      this.logger.error('Erreur lors de la récupération des icônes', error);
      return {
        content: [
          {
            type: 'text',
            text: `Erreur: ${error.message}`,
          },
        ],
      };
    }
  }

  async getColors({ include_utilities = true, format = 'hex' }) {
    await this.ensureInitialized();

    const cacheKey = `colors:${include_utilities}:${format}`;
    const cached = await this.cache.get(cacheKey);

    if (cached) {
      return {
        content: [
          {
            type: 'text',
            text: cached,
          },
        ],
      };
    }

    try {
      // Rechercher les documents de couleurs
      const searchResult = await this.repository.search('couleur', { limit: 10 });

      const formattedText = this.formatColorResults(
        searchResult.results,
        include_utilities,
        format
      );

      // Cache longtemps car les couleurs DSFR changent rarement
      await this.cache.set(cacheKey, formattedText, 2 * 60 * 60 * 1000); // 2 heures

      return {
        content: [
          {
            type: 'text',
            text: formattedText,
          },
        ],
      };
    } catch (error) {
      this.logger.error('Erreur lors de la récupération des couleurs', error);
      return {
        content: [
          {
            type: 'text',
            text: `Erreur: ${error.message}`,
          },
        ],
      };
    }
  }

  /**
   * Méthodes de formatage
   */

  formatSearchResults(results, query) {
    if (results.length === 0) {
      return `Aucun résultat trouvé pour "${query}".`;
    }

    let output = `# Résultats de recherche pour "${query}"\\n\\n`;
    output += `Trouvé ${results.length} résultat(s) :\\n\\n`;

    results.forEach((result, index) => {
      const doc = result.document;
      output += `## ${index + 1}. ${doc.title}\\n`;
      output += `- **Catégorie** : ${this.getCategoryName(doc.category)}\\n`;
      output += `- **Type** : ${doc.componentType}\\n`;
      output += `- **Tags** : ${doc.tags.join(', ') || 'Aucun'}\\n`;
      output += `- **URL** : ${doc.url}\\n`;

      if (result.score !== undefined) {
        output += `- **Pertinence** : ${Math.round((1 - result.score) * 100)}%\\n`;
      }

      // Extrait du contenu
      const excerpt = doc.content.substring(0, 200).replace(/\\n/g, ' ') + '...';
      output += `- **Aperçu** : ${excerpt}\\n\\n`;
    });

    return output;
  }

  formatComponentDetails(component, includeExamples, includeAccessibility) {
    let output = `# ${component.title}\\n\\n`;
    output += `**URL source** : ${component.url}\\n\\n`;

    // Contenu principal
    output += `## Description\\n\\n${component.content}\\n\\n`;

    // Exemples de code
    if (includeExamples && component.codeExamples.length > 0) {
      output += `## Exemples de code\\n\\n`;
      component.codeExamples.forEach((example, index) => {
        output += `### Exemple ${index + 1} (${example.language})\\n\\n`;
        output += '```' + example.language + '\\n';
        output += example.code + '\\n';
        output += '```\\n\\n';
      });
    }

    // Informations d'accessibilité
    if (includeAccessibility) {
      output += `## Accessibilité\\n\\n`;
      output += this.extractAccessibilityInfo(component.content);
    }

    // Métadonnées
    output += `## Métadonnées\\n\\n`;
    output += `- **Catégorie** : ${this.getCategoryName(component.category)}\\n`;
    output += `- **Type** : ${component.componentType}\\n`;
    output += `- **Tags** : ${component.tags.join(', ') || 'Aucun'}\\n`;
    output += `- **Mots** : ${component.metadata.wordCount}\\n`;

    return output;
  }

  formatCategoriesList(categories) {
    let output = '# Catégories DSFR disponibles\\n\\n';

    for (const [key, details] of Object.entries(categories)) {
      output += `## ${details.name} (${key})\\n`;
      output += `${details.description}\\n`;
      output += `**${details.count} document(s)**\\n\\n`;
    }

    return output;
  }

  formatPatternResults(results, query) {
    if (results.length === 0) {
      return `Aucun pattern trouvé pour "${query}".`;
    }

    let output = `# Patterns trouvés pour "${query}"\\n\\n`;

    results.forEach((result, index) => {
      const doc = result.document;
      output += `## ${index + 1}. ${doc.title}\\n`;
      output += `- **URL** : ${doc.url}\\n`;

      if (result.score !== undefined) {
        output += `- **Pertinence** : ${Math.round((1 - result.score) * 100)}%\\n`;
      }

      output += '\\n';
    });

    return output;
  }

  formatIconResults(results, category) {
    let output = '# Icônes DSFR\\n\\n';

    if (category) {
      output += `## Catégorie : ${category}\\n\\n`;
    }

    results.forEach((result) => {
      const doc = result.document;
      if (!category || doc.title.toLowerCase().includes(category.toLowerCase())) {
        output += `### ${doc.title}\\n`;
        output += `URL : ${doc.url}\\n\\n`;
      }
    });

    return output;
  }

  formatColorResults(results, includeUtilities) {
    let output = '# Palette de couleurs DSFR\\n\\n';

    // Couleurs principales DSFR
    output += '## Couleurs principales\\n\\n';
    output += '- **Bleu France** : #000091\\n';
    output += '- **Blanc** : #FFFFFF\\n';
    output += '- **Rouge Marianne** : #E1000F\\n';
    output += '- **Gris** : #666666\\n\\n';

    if (includeUtilities) {
      output += '## Classes utilitaires de couleur\\n\\n';
      output += '- `.fr-background--blue-france` : Fond bleu France\\n';
      output += '- `.fr-text--blue-france` : Texte bleu France\\n';
      output += '- `.fr-background--alt` : Fond alternatif\\n';
      output += '- `.fr-text--alt` : Texte alternatif\\n\\n';
    }

    // Ajouter les références aux documents
    if (results.length > 0) {
      output += '## Documentation détaillée\\n\\n';
      results.forEach((result) => {
        const doc = result.document;
        output += `- [${doc.title}](${doc.url})\\n`;
      });
    }

    return output;
  }

  /**
   * Méthodes utilitaires
   */

  getCategoryName(categoryKey) {
    const categories = this.config.get('categories');
    return categories[categoryKey]?.name || categoryKey;
  }

  extractAccessibilityInfo(content) {
    const accessibilityKeywords = [
      'aria',
      'role',
      'accessibilité',
      'rgaa',
      'wcag',
      'contraste',
      'navigation clavier',
      'lecteur d\u2019écran',
    ];

    const lines = content.split('\\n');
    const relevantLines = [];

    lines.forEach((line) => {
      const lowerLine = line.toLowerCase();
      if (accessibilityKeywords.some((keyword) => lowerLine.includes(keyword))) {
        relevantLines.push(line);
      }
    });

    if (relevantLines.length === 0) {
      return "Aucune information spécifique d'accessibilité trouvée dans la documentation.";
    }

    return relevantLines.join('\n');
  }

  async ensureInitialized() {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  async dispose() {
    this.initialized = false;
    this.logger.info('DocumentationServiceV2 fermé');
  }
}

module.exports = DocumentationServiceV2;
