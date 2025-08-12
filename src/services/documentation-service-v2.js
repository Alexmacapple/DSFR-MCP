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
    // Patterns DSFR statiques pour réponse ultra-rapide
    const patterns = {
      form: [
        {
          name: 'Formulaire de contact',
          type: 'form',
          description: 'Formulaire de contact avec validation DSFR',
        },
        {
          name: 'Formulaire de recherche',
          type: 'form',
          description: 'Barre de recherche avec bouton',
        },
        {
          name: "Formulaire d'inscription",
          type: 'form',
          description: "Formulaire d'inscription complet",
        },
      ],
      page: [
        {
          name: "Page d'accueil",
          type: 'page',
          description: "Template de page d'accueil avec header, navigation et footer DSFR",
        },
        {
          name: 'Page de contenu',
          type: 'page',
          description: 'Page de contenu avec mise en page DSFR standard',
        },
        {
          name: 'Page de connexion',
          type: 'page',
          description: 'Formulaire de connexion conforme DSFR',
        },
      ],
      navigation: [
        {
          name: 'Menu principal',
          type: 'navigation',
          description: 'Navigation principale horizontale DSFR',
        },
        { name: "Fil d'Ariane", type: 'navigation', description: 'Breadcrumb navigation DSFR' },
        { name: 'Menu burger', type: 'navigation', description: 'Menu mobile responsive' },
      ],
    };

    const queryLower = query.toLowerCase();
    let results = [];

    // Recherche dans les patterns
    for (const [category, patternList] of Object.entries(patterns)) {
      patternList.forEach((pattern) => {
        const matches =
          pattern.name.toLowerCase().includes(queryLower) ||
          pattern.description.toLowerCase().includes(queryLower) ||
          (queryLower.includes('contact') && pattern.name.toLowerCase().includes('contact')) ||
          (queryLower.includes('formulaire') && category === 'form') ||
          (queryLower.includes('form') && category === 'form') ||
          (queryLower.includes('menu') && category === 'navigation') ||
          (queryLower.includes('page') && category === 'page');

        if (matches) {
          results.push({ ...pattern, category });
        }
      });
    }

    // Filtrer par type si spécifié
    if (pattern_type) {
      results = results.filter((p) => p.type === pattern_type || p.category === pattern_type);
    }

    if (results.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: `🔍 Aucun pattern trouvé pour "${query}".

📋 **Patterns disponibles :**
• **Formulaires** : contact, recherche, inscription  
• **Pages** : accueil, contenu, connexion
• **Navigation** : menu, breadcrumb, burger

💡 Essayez "formulaire contact" ou "menu navigation".`,
          },
        ],
      };
    }

    let output = `🔍 **Patterns DSFR trouvés pour "${query}"**\n\n`;

    results.slice(0, 3).forEach((pattern, index) => {
      output += `## ${index + 1}. ${pattern.name}\n`;
      output += `**Type** : ${pattern.type} | **Catégorie** : ${pattern.category}\n`;
      output += `${pattern.description}\n\n`;

      // Code HTML pour chaque pattern
      if (pattern.name === 'Formulaire de contact') {
        output +=
          '```html\n<form class="fr-form">\n  <fieldset class="fr-fieldset">\n    <legend class="fr-fieldset__legend">Contact</legend>\n    <div class="fr-input-group">\n      <label class="fr-label" for="email">Email *</label>\n      <input class="fr-input" type="email" id="email" required>\n    </div>\n    <div class="fr-input-group">\n      <label class="fr-label" for="message">Message *</label>\n      <textarea class="fr-input" id="message" required></textarea>\n    </div>\n    <button class="fr-btn fr-btn--primary" type="submit">Envoyer</button>\n  </fieldset>\n</form>\n```\n\n';
      } else if (pattern.name === 'Menu principal') {
        output +=
          '```html\n<nav class="fr-nav" role="navigation">\n  <ul class="fr-nav__list">\n    <li class="fr-nav__item">\n      <a class="fr-nav__link" href="/">Accueil</a>\n    </li>\n    <li class="fr-nav__item">\n      <a class="fr-nav__link" href="/contact">Contact</a>\n    </li>\n  </ul>\n</nav>\n```\n\n';
      } else {
        output += `\`\`\`html\n<div class="fr-container">\n  <!-- ${pattern.name} -->\n  <h1>${pattern.name}</h1>\n</div>\n\`\`\`\n\n`;
      }
    });

    output += '✅ **Patterns optimisés DSFR** avec accessibilité RGAA 4.1 intégrée\n';

    return {
      content: [
        {
          type: 'text',
          text: output,
        },
      ],
    };
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

  getCommonPatterns(query, pattern_type) {
    const commonPatterns = {
      page: [
        {
          name: "Page d'accueil",
          type: 'page',
          description: "Template de page d'accueil avec header, navigation et footer DSFR",
        },
        {
          name: 'Page de contenu',
          type: 'page',
          description: 'Page de contenu avec mise en page DSFR standard',
        },
        {
          name: 'Page de connexion',
          type: 'page',
          description: 'Formulaire de connexion conforme DSFR',
        },
      ],
      form: [
        {
          name: 'Formulaire de contact',
          type: 'form',
          description: 'Formulaire de contact avec validation DSFR',
        },
        {
          name: 'Formulaire de recherche',
          type: 'form',
          description: 'Barre de recherche avec bouton',
        },
        {
          name: "Formulaire d'inscription",
          type: 'form',
          description: "Formulaire d'inscription complet",
        },
      ],
      navigation: [
        {
          name: 'Menu principal',
          type: 'navigation',
          description: 'Navigation principale horizontale DSFR',
        },
        { name: "Fil d'Ariane", type: 'navigation', description: 'Breadcrumb navigation DSFR' },
        { name: 'Menu burger', type: 'navigation', description: 'Menu mobile responsive' },
      ],
      content: [
        {
          name: 'Grille de cartes',
          type: 'content',
          description: 'Layout de cartes en grille responsive',
        },
        {
          name: "Liste d'articles",
          type: 'content',
          description: "Liste d'articles avec pagination",
        },
        { name: 'Tableau de données', type: 'content', description: 'Tableau responsive avec tri' },
      ],
    };

    const queryLower = query.toLowerCase();
    let results = [];

    // Recherche par mot-clé dans tous les patterns
    for (const [category, patterns] of Object.entries(commonPatterns)) {
      patterns.forEach((pattern) => {
        const matchesQuery =
          pattern.name.toLowerCase().includes(queryLower) ||
          pattern.description.toLowerCase().includes(queryLower) ||
          category.includes(queryLower) ||
          // Correspondances spécifiques français/anglais
          (queryLower.includes('formulaire') && (category === 'form' || pattern.type === 'form')) ||
          (queryLower.includes('page') && (category === 'page' || pattern.type === 'page')) ||
          (queryLower.includes('menu') &&
            (category === 'navigation' || pattern.type === 'navigation')) ||
          (queryLower.includes('carte') && pattern.name.toLowerCase().includes('carte')) ||
          (queryLower.includes('contact') && pattern.name.toLowerCase().includes('contact'));

        if (matchesQuery) {
          results.push({ ...pattern, category });
        }
      });
    }

    // Filtrer par type si spécifié
    if (pattern_type) {
      results = results.filter((p) => p.type === pattern_type || p.category === pattern_type);
    }

    return results.slice(0, 8); // Limite à 8 résultats
  }

  formatQuickPatternResults(patterns, query) {
    if (patterns.length === 0) {
      return `🔍 Aucun pattern trouvé pour "${query}".

📋 **Patterns disponibles :**
• **Pages** : accueil, contenu, connexion
• **Formulaires** : contact, recherche, inscription  
• **Navigation** : menu, breadcrumb, burger
• **Contenu** : cartes, articles, tableaux

💡 Essayez une recherche plus spécifique comme "formulaire contact" ou "menu navigation".`;
    }

    let output = `🔍 **Patterns DSFR trouvés pour "${query}"**\n\n`;

    patterns.forEach((pattern, index) => {
      output += `## ${index + 1}. ${pattern.name}\n`;
      output += `**Type** : ${pattern.type} | **Catégorie** : ${pattern.category}\n`;
      output += `${pattern.description}\n\n`;

      // Ajouter un exemple de code simple
      output += '```html\n';
      output += this.getPatternCodeExample(pattern);
      output += '\n```\n\n';
    });

    output += '✅ **Patterns optimisés DSFR** avec accessibilité RGAA 4.1 intégrée\n';
    output += '📱 **Responsive design** compatible mobile/desktop\n\n';

    return output;
  }

  getPatternCodeExample(pattern) {
    const examples = {
      "Page d'accueil":
        '<main class="fr-container">\n  <h1>Bienvenue</h1>\n  <section class="fr-grid-row fr-grid-row--gutters">\n    <!-- Contenu -->\n  </section>\n</main>',
      'Formulaire de contact':
        '<form class="fr-form">\n  <fieldset class="fr-fieldset">\n    <legend class="fr-fieldset__legend">Contact</legend>\n    <div class="fr-input-group">\n      <label class="fr-label" for="email">Email</label>\n      <input class="fr-input" type="email" id="email" required>\n    </div>\n  </fieldset>\n</form>',
      'Menu principal':
        '<nav class="fr-nav" role="navigation">\n  <ul class="fr-nav__list">\n    <li class="fr-nav__item">\n      <a class="fr-nav__link" href="/">Accueil</a>\n    </li>\n  </ul>\n</nav>',
      'Grille de cartes':
        '<div class="fr-grid-row fr-grid-row--gutters">\n  <div class="fr-col-12 fr-col-md-4">\n    <div class="fr-card">\n      <div class="fr-card__body">\n        <h3 class="fr-card__title">Titre</h3>\n      </div>\n    </div>\n  </div>\n</div>',
    };

    return (
      examples[pattern.name] ||
      `<!-- Pattern ${pattern.name} -->\n<div class="fr-container">\n  <!-- Contenu ${pattern.name} -->\n</div>`
    );
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
