/**
 * @fileoverview Service de gestion de la documentation DSFR
 * @module services/documentation
 * @requires fs/promises
 * @requires path
 * @requires gray-matter
 * @requires fuse.js
 * @requires marked
 */

// Service de gestion de la documentation DSFR
const fs = require('fs').promises;
const path = require('path');
const matter = require('gray-matter');
const Fuse = require('fuse.js');
const marked = require('marked');
const config = require('../config');

/**
 * Service de gestion de la documentation DSFR
 * @class DocumentationService
 * @description Gère l'indexation, la recherche et la récupération de la documentation DSFR
 */
class DocumentationService {
  constructor() {
    this.documents = [];
    this.searchIndex = null;
    this.categories = new Map();
    this.componentsMap = new Map();
    this.patternsMap = new Map();
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    
    // Pas de console.log - MCP nécessite du JSON pur sur stdout
    await this.indexDocumentation();
    this.initialized = true;
  }

  async indexDocumentation() {
    const fichesPath = path.resolve(config.paths.fiches);
    
    try {
      const files = await fs.readdir(fichesPath);
      const mdFiles = files.filter(f => f.endsWith('.md'));
      
      for (const file of mdFiles) {
        const filePath = path.join(fichesPath, file);
        const content = await fs.readFile(filePath, 'utf-8');
        
        // Extraire les métadonnées du fichier
        const doc = this.parseDocument(file, content);
        this.documents.push(doc);
        
        // Catégoriser le document
        this.categorizeDocument(doc);
      }
      
      // Créer l'index de recherche
      this.createSearchIndex();
      
      // Pas de console.log - MCP nécessite du JSON pur sur stdout
    } catch (error) {
      // Ne pas écrire sur stderr/stdout pour éviter de corrompre le protocole JSON-RPC
      throw error;
    }
  }

  parseDocument(filename, content) {
    // Extraire l'URL et le titre depuis le contenu
    const lines = content.split('\n');
    let url = '';
    let title = '';
    let markdownContent = '';
    let inMarkdown = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.startsWith('URL:') && lines[i + 1]) {
        url = lines[i + 1].trim();
      } else if (line.startsWith('Title:') && lines[i + 1]) {
        title = lines[i + 1].trim();
      } else if (line.startsWith('Markdown:')) {
        inMarkdown = true;
        markdownContent = lines.slice(i + 1).join('\n');
        break;
      }
    }
    
    // Déterminer la catégorie et le type
    const category = this.detectCategory(filename, title, markdownContent);
    const componentType = this.detectComponentType(filename, title, markdownContent);
    
    // Extraire les exemples de code
    const codeExamples = this.extractCodeExamples(markdownContent);
    
    // Générer des tags
    const tags = this.generateTags(title, markdownContent);
    
    return {
      id: filename.replace('.md', ''),
      filename,
      url,
      title,
      category,
      componentType,
      content: markdownContent,
      htmlContent: marked.parse(markdownContent),
      codeExamples,
      tags,
      metadata: {
        lastModified: new Date().toISOString(),
        wordCount: markdownContent.split(/\s+/).length
      }
    };
  }

  detectCategory(filename, title, content) {
    const lowerTitle = title.toLowerCase();
    const lowerContent = content.toLowerCase();
    
    if (filename.includes('fondamentaux') || lowerTitle.includes('fondamentaux')) return 'core';
    if (filename.includes('outils-d-analyse') || lowerTitle.includes('analyse')) return 'analytics';
    if (lowerTitle.includes('modèle') || lowerTitle.includes('page')) return 'layout';
    if (lowerTitle.includes('utilitaire')) return 'utility';
    if (lowerTitle.includes('couleur') && lowerTitle.includes('combinaison')) return 'scheme';
    
    // Par défaut, considérer comme composant
    return 'component';
  }

  detectComponentType(filename, title, content) {
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
    const codeRegex = /```(?:html|css|javascript|jsx|vue)?\n([\s\S]*?)```/g;
    let match;
    
    while ((match = codeRegex.exec(markdown)) !== null) {
      codeBlocks.push({
        code: match[1].trim(),
        language: match[0].split('\n')[0].replace('```', '') || 'html'
      });
    }
    
    return codeBlocks;
  }

  generateTags(title, content) {
    const tags = new Set();
    const keywords = [
      'bouton', 'formulaire', 'navigation', 'carte', 'alerte', 'modal',
      'accordéon', 'tableau', 'liste', 'lien', 'icône', 'badge',
      'accessibilité', 'responsive', 'mobile', 'desktop'
    ];
    
    const lowerTitle = title.toLowerCase();
    const lowerContent = content.toLowerCase();
    
    keywords.forEach(keyword => {
      if (lowerTitle.includes(keyword) || lowerContent.includes(keyword)) {
        tags.add(keyword);
      }
    });
    
    return Array.from(tags);
  }

  categorizeDocument(doc) {
    // Ajouter à la catégorie appropriée
    if (!this.categories.has(doc.category)) {
      this.categories.set(doc.category, []);
    }
    this.categories.get(doc.category).push(doc);
    
    // Si c'est un composant, l'ajouter à la map des composants
    if (doc.category === 'component') {
      const componentName = this.extractComponentName(doc.title);
      this.componentsMap.set(componentName, doc);
    }
    
    // Si c'est un pattern, l'ajouter à la map des patterns
    if (doc.category === 'layout') {
      const patternName = this.extractPatternName(doc.title);
      this.patternsMap.set(patternName, doc);
    }
  }

  extractComponentName(title) {
    // Nettoyer le titre pour extraire le nom du composant
    return title
      .replace('- Système de design', '')
      .replace(/^\d+-/, '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-');
  }

  extractPatternName(title) {
    return this.extractComponentName(title);
  }

  createSearchIndex() {
    const options = {
      keys: ['title', 'content', 'tags'],
      threshold: 0.3,
      includeScore: true
    };
    
    this.searchIndex = new Fuse(this.documents, options);
  }

  // Méthodes publiques pour les outils MCP

  async searchComponents({ query, category, limit = 10 }) {
    await this.initialize();
    
    let results = this.documents;
    
    // Filtrer par catégorie si spécifiée
    if (category) {
      results = results.filter(doc => doc.category === category);
    }
    
    // Recherche avec Fuse.js
    if (query) {
      const searchResults = this.searchIndex.search(query);
      results = searchResults
        .map(result => result.item)
        .filter(item => !category || item.category === category);
    }
    
    // Limiter les résultats
    results = results.slice(0, limit);
    
    return {
      content: [{
        type: 'text',
        text: this.formatSearchResults(results, query)
      }]
    };
  }

  formatSearchResults(results, query) {
    if (results.length === 0) {
      return `Aucun résultat trouvé pour "${query}".`;
    }
    
    let output = `# Résultats de recherche pour "${query}"\n\n`;
    output += `Trouvé ${results.length} résultat(s) :\n\n`;
    
    results.forEach((doc, index) => {
      output += `## ${index + 1}. ${doc.title}\n`;
      output += `- **Catégorie** : ${config.categories[doc.category]?.name || doc.category}\n`;
      output += `- **Type** : ${doc.componentType}\n`;
      output += `- **Tags** : ${doc.tags.join(', ') || 'Aucun'}\n`;
      output += `- **URL** : ${doc.url}\n`;
      
      // Extrait du contenu
      const excerpt = doc.content.substring(0, 200).replace(/\n/g, ' ') + '...';
      output += `- **Aperçu** : ${excerpt}\n\n`;
    });
    
    return output;
  }

  async getComponentDetails({ component_name, include_examples = true, include_accessibility = true }) {
    await this.initialize();
    
    // Rechercher le composant
    const component = this.componentsMap.get(component_name.toLowerCase()) ||
                     this.documents.find(doc => 
                       doc.title.toLowerCase().includes(component_name.toLowerCase()) ||
                       doc.filename.toLowerCase().includes(component_name.toLowerCase())
                     );
    
    if (!component) {
      return {
        content: [{
          type: 'text',
          text: `Composant "${component_name}" non trouvé.`
        }]
      };
    }
    
    let output = `# ${component.title}\n\n`;
    output += `**URL source** : ${component.url}\n\n`;
    
    // Contenu principal
    output += `## Description\n\n${component.content}\n\n`;
    
    // Exemples de code
    if (include_examples && component.codeExamples.length > 0) {
      output += `## Exemples de code\n\n`;
      component.codeExamples.forEach((example, index) => {
        output += `### Exemple ${index + 1} (${example.language})\n\n`;
        output += '```' + example.language + '\n';
        output += example.code + '\n';
        output += '```\n\n';
      });
    }
    
    // Informations d'accessibilité
    if (include_accessibility) {
      output += `## Accessibilité\n\n`;
      output += this.extractAccessibilityInfo(component.content);
    }
    
    return {
      content: [{
        type: 'text',
        text: output
      }]
    };
  }

  extractAccessibilityInfo(content) {
    const accessibilityKeywords = [
      'aria', 'role', 'accessibilité', 'rgaa', 'wcag',
      'contraste', 'navigation clavier', 'lecteur d\'écran'
    ];
    
    const lines = content.split('\n');
    const relevantLines = [];
    
    lines.forEach(line => {
      const lowerLine = line.toLowerCase();
      if (accessibilityKeywords.some(keyword => lowerLine.includes(keyword))) {
        relevantLines.push(line);
      }
    });
    
    if (relevantLines.length === 0) {
      return 'Aucune information spécifique d\'accessibilité trouvée dans la documentation.';
    }
    
    return relevantLines.join('\n');
  }

  async listCategories() {
    await this.initialize();
    
    let output = '# Catégories DSFR disponibles\n\n';
    
    for (const [key, details] of Object.entries(config.categories)) {
      const docs = this.categories.get(key) || [];
      output += `## ${details.name} (${key})\n`;
      output += `${details.description}\n`;
      output += `**${docs.length} document(s)**\n\n`;
    }
    
    return {
      content: [{
        type: 'text',
        text: output
      }]
    };
  }

  async searchPatterns({ query, pattern_type }) {
    await this.initialize();
    
    let patterns = Array.from(this.patternsMap.values());
    
    // Filtrer par type si spécifié
    if (pattern_type) {
      patterns = patterns.filter(p => 
        p.title.toLowerCase().includes(pattern_type.toLowerCase())
      );
    }
    
    // Rechercher
    if (query) {
      const fuse = new Fuse(patterns, {
        keys: ['title', 'content'],
        threshold: 0.3
      });
      patterns = fuse.search(query).map(r => r.item);
    }
    
    return {
      content: [{
        type: 'text',
        text: this.formatPatternResults(patterns, query)
      }]
    };
  }

  formatPatternResults(patterns, query) {
    if (patterns.length === 0) {
      return `Aucun pattern trouvé pour "${query}".`;
    }
    
    let output = `# Patterns trouvés pour "${query}"\n\n`;
    
    patterns.forEach((pattern, index) => {
      output += `## ${index + 1}. ${pattern.title}\n`;
      output += `- **URL** : ${pattern.url}\n\n`;
    });
    
    return output;
  }

  async getIcons({ category, search }) {
    await this.initialize();
    
    // Rechercher les documents d'icônes
    const iconDocs = this.documents.filter(doc => 
      doc.title.toLowerCase().includes('icône') || 
      doc.title.toLowerCase().includes('icon')
    );
    
    let output = '# Icônes DSFR\n\n';
    
    if (category) {
      output += `## Catégorie : ${category}\n\n`;
    }
    
    iconDocs.forEach(doc => {
      if (!category || doc.title.toLowerCase().includes(category.toLowerCase())) {
        output += `### ${doc.title}\n`;
        output += `URL : ${doc.url}\n\n`;
      }
    });
    
    return {
      content: [{
        type: 'text',
        text: output
      }]
    };
  }

  async getColors({ include_utilities = true, format = 'hex' }) {
    await this.initialize();
    
    // Rechercher les documents de couleurs
    const colorDocs = this.documents.filter(doc => 
      doc.title.toLowerCase().includes('couleur') ||
      doc.title.toLowerCase().includes('color')
    );
    
    let output = '# Palette de couleurs DSFR\n\n';
    
    // Couleurs principales DSFR
    output += '## Couleurs principales\n\n';
    output += '- **Bleu France** : #000091\n';
    output += '- **Blanc** : #FFFFFF\n';
    output += '- **Rouge Marianne** : #E1000F\n';
    output += '- **Gris** : #666666\n\n';
    
    if (include_utilities) {
      output += '## Classes utilitaires de couleur\n\n';
      output += '- `.fr-background--blue-france` : Fond bleu France\n';
      output += '- `.fr-text--blue-france` : Texte bleu France\n';
      output += '- `.fr-background--alt` : Fond alternatif\n';
      output += '- `.fr-text--alt` : Texte alternatif\n\n';
    }
    
    // Ajouter les références aux documents
    output += '## Documentation détaillée\n\n';
    colorDocs.forEach(doc => {
      output += `- [${doc.title}](${doc.url})\n`;
    });
    
    return {
      content: [{
        type: 'text',
        text: output
      }]
    };
  }

  // 🆕 NOUVEAUX OUTILS AVANCÉS - Phase 3.1

  /**
   * Analyse l'utilisation du DSFR dans un code source
   * @param {Object} params - Paramètres d'analyse
   * @param {string} params.source_code - Code source à analyser
   * @param {string} params.project_type - Type de projet
   * @param {string} params.analysis_depth - Profondeur d'analyse
   * @param {boolean} params.include_recommendations - Inclure les recommandations
   * @param {boolean} params.include_usage_stats - Inclure les statistiques
   * @param {boolean} params.check_best_practices - Vérifier les bonnes pratiques
   * @returns {Object} Analyse détaillée de l'utilisation DSFR
   */
  async analyzeUsage({ 
    source_code, 
    project_type = 'auto-detect', 
    analysis_depth = 'detailed',
    include_recommendations = true,
    include_usage_stats = true,
    check_best_practices = true
  }) {
    await this.initialize();

    // Auto-détection du type de projet si nécessaire
    if (project_type === 'auto-detect') {
      project_type = this.detectProjectType(source_code);
    }

    const analysis = {
      project_info: {
        detected_type: project_type,
        code_length: source_code.length,
        analysis_timestamp: new Date().toISOString()
      },
      dsfr_usage: this.analyzeDsfrUsage(source_code),
      components_analysis: this.analyzeComponents(source_code),
      accessibility_analysis: this.analyzeAccessibility(source_code),
      best_practices: check_best_practices ? this.analyzeBestPractices(source_code, project_type) : null,
      usage_statistics: include_usage_stats ? this.calculateUsageStats(source_code) : null,
      recommendations: include_recommendations ? this.generateUsageRecommendations(source_code, project_type) : []
    };

    return {
      content: [{
        type: 'text',
        text: this.formatAnalysisResults(analysis, analysis_depth)
      }]
    };
  }

  /**
   * Détecte automatiquement le type de projet
   * @param {string} code - Code source à analyser
   * @returns {string} Type de projet détecté
   */
  detectProjectType(code) {
    const indicators = {
      react: [/import\s+React/, /from\s+['"]react['"]/, /jsx/, /\.jsx/, /useState/, /useEffect/],
      vue: [/<template>/, /<script>/, /\.vue/, /import\s+.*from\s+['"]vue['"]/, /v-if/, /v-for/],
      angular: [/@Component/, /@Injectable/, /import.*@angular/, /ngOnInit/, /\.component\.ts/],
      vanilla: [/document\./, /getElementById/, /querySelector/, /addEventListener/]
    };

    const scores = {};
    
    for (const [type, patterns] of Object.entries(indicators)) {
      scores[type] = patterns.reduce((score, pattern) => 
        score + (pattern.test(code) ? 1 : 0), 0
      );
    }

    return Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
  }

  /**
   * Analyse l'utilisation générale du DSFR
   * @param {string} code - Code source
   * @returns {Object} Analyse d'utilisation DSFR
   */
  analyzeDsfrUsage(code) {
    const dsfrClasses = this.extractDsfrClasses(code);
    const dsfrComponents = this.extractDsfrComponents(code);
    
    return {
      classes_found: dsfrClasses,
      classes_count: dsfrClasses.length,
      components_identified: dsfrComponents,
      components_count: dsfrComponents.length,
      dsfr_coverage: this.calculateDsfrCoverage(dsfrClasses, dsfrComponents),
      potential_issues: this.identifyPotentialIssues(code, dsfrClasses)
    };
  }

  /**
   * Extrait les classes DSFR du code
   * @param {string} code - Code source
   * @returns {Array} Liste des classes DSFR trouvées
   */
  extractDsfrClasses(code) {
    const dsfrClassPattern = /\b(fr-[a-zA-Z0-9_-]+)\b/g;
    const matches = [...code.matchAll(dsfrClassPattern)];
    
    // Déduplication et tri
    const uniqueClasses = [...new Set(matches.map(match => match[1]))];
    return uniqueClasses.sort();
  }

  /**
   * Extrait les composants DSFR identifiés
   * @param {string} code - Code source
   * @returns {Array} Liste des composants DSFR identifiés
   */
  extractDsfrComponents(code) {
    const componentPatterns = {
      button: /fr-btn/,
      input: /fr-input/,
      select: /fr-select/,
      accordion: /fr-accordion/,
      alert: /fr-alert/,
      badge: /fr-badge/,
      breadcrumb: /fr-breadcrumb/,
      card: /fr-card/,
      checkbox: /fr-checkbox/,
      footer: /fr-footer/,
      header: /fr-header/,
      modal: /fr-modal/,
      navigation: /fr-nav/,
      pagination: /fr-pagination/,
      radio: /fr-radio/,
      sidemenu: /fr-sidemenu/,
      stepper: /fr-stepper/,
      summary: /fr-summary/,
      table: /fr-table/,
      tabs: /fr-tabs/,
      tag: /fr-tag/,
      tile: /fr-tile/,
      tooltip: /fr-tooltip/
    };

    const foundComponents = [];
    
    for (const [component, pattern] of Object.entries(componentPatterns)) {
      if (pattern.test(code)) {
        foundComponents.push({
          name: component,
          pattern: pattern.source,
          occurrences: (code.match(pattern) || []).length
        });
      }
    }

    return foundComponents;
  }

  /**
   * Calcule la couverture DSFR
   * @param {Array} classes - Classes trouvées
   * @param {Array} components - Composants trouvés
   * @returns {Object} Métrics de couverture
   */
  calculateDsfrCoverage(classes, components) {
    const totalDsfrClasses = 300; // Estimation du nombre total de classes DSFR
    const totalDsfrComponents = 25; // Nombre de composants principaux
    
    return {
      class_coverage_percent: Math.min(100, Math.round((classes.length / totalDsfrClasses) * 100)),
      component_coverage_percent: Math.min(100, Math.round((components.length / totalDsfrComponents) * 100)),
      overall_adoption_level: this.calculateAdoptionLevel(classes.length, components.length)
    };
  }

  /**
   * Calcule le niveau d'adoption global
   * @param {number} classCount - Nombre de classes
   * @param {number} componentCount - Nombre de composants
   * @returns {string} Niveau d'adoption
   */
  calculateAdoptionLevel(classCount, componentCount) {
    const score = classCount + (componentCount * 3); // Les composants comptent plus
    
    if (score >= 50) return 'Expert';
    if (score >= 25) return 'Avancé';
    if (score >= 10) return 'Intermédiaire';
    if (score >= 3) return 'Débutant';
    return 'Minimal';
  }

  /**
   * Identifie les problèmes potentiels
   * @param {string} code - Code source
   * @param {Array} dsfrClasses - Classes DSFR trouvées
   * @returns {Array} Liste des problèmes identifiés
   */
  identifyPotentialIssues(code, dsfrClasses) {
    const issues = [];

    // Vérifier les classes obsolètes ou mal écrites
    const potentialTypos = dsfrClasses.filter(cls => 
      cls.includes('--') && !cls.match(/^fr-[a-z]+--[a-z0-9-]+$/)
    );
    
    if (potentialTypos.length > 0) {
      issues.push({
        type: 'typos',
        severity: 'medium',
        description: 'Classes DSFR potentiellement mal écrites détectées',
        details: potentialTypos
      });
    }

    // Vérifier l'utilisation de CSS custom
    if (code.includes('!important')) {
      issues.push({
        type: 'css-override',
        severity: 'high',
        description: 'Utilisation de !important détectée - peut interférer avec DSFR',
        count: (code.match(/!important/g) || []).length
      });
    }

    // Vérifier les classes Bootstrap ou autres frameworks
    const competitorFrameworks = ['bootstrap', 'bs-', 'material', 'mui-', 'ant-'];
    const foundCompetitors = competitorFrameworks.filter(fw => 
      code.toLowerCase().includes(fw)
    );
    
    if (foundCompetitors.length > 0) {
      issues.push({
        type: 'framework-conflict',
        severity: 'high',
        description: 'Frameworks CSS concurrents détectés',
        frameworks: foundCompetitors
      });
    }

    return issues;
  }

  /**
   * Analyse l'accessibilité du code
   * @param {string} code - Code source
   * @returns {Object} Analyse d'accessibilité
   */
  analyzeAccessibility(code) {
    const accessibilityFeatures = {
      aria_labels: (code.match(/aria-label/g) || []).length,
      aria_describedby: (code.match(/aria-describedby/g) || []).length,
      alt_attributes: (code.match(/alt=/g) || []).length,
      role_attributes: (code.match(/role=/g) || []).length,
      tabindex_usage: (code.match(/tabindex/g) || []).length,
      semantic_elements: this.countSemanticElements(code)
    };

    const accessibilityScore = this.calculateAccessibilityScore(accessibilityFeatures);

    return {
      features: accessibilityFeatures,
      score: accessibilityScore,
      level: this.getAccessibilityLevel(accessibilityScore),
      suggestions: this.getAccessibilitySuggestions(accessibilityFeatures, code)
    };
  }

  /**
   * Compte les éléments sémantiques HTML5
   * @param {string} code - Code source
   * @returns {number} Nombre d'éléments sémantiques
   */
  countSemanticElements(code) {
    const semanticTags = ['header', 'nav', 'main', 'section', 'article', 'aside', 'footer'];
    return semanticTags.reduce((count, tag) => 
      count + (code.match(new RegExp(`<${tag}`, 'g')) || []).length, 0
    );
  }

  /**
   * Calcule un score d'accessibilité
   * @param {Object} features - Fonctionnalités d'accessibilité
   * @returns {number} Score sur 100
   */
  calculateAccessibilityScore(features) {
    const weights = {
      aria_labels: 20,
      aria_describedby: 15,
      alt_attributes: 25,
      role_attributes: 10,
      semantic_elements: 30
    };

    let score = 0;
    Object.entries(features).forEach(([key, value]) => {
      if (weights[key] && value > 0) {
        score += weights[key];
      }
    });

    return Math.min(100, score);
  }

  /**
   * Détermine le niveau d'accessibilité
   * @param {number} score - Score d'accessibilité
   * @returns {string} Niveau d'accessibilité
   */
  getAccessibilityLevel(score) {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Bon';
    if (score >= 40) return 'Correct';
    if (score >= 20) return 'Insuffisant';
    return 'Critique';
  }

  /**
   * Génère des suggestions d'accessibilité
   * @param {Object} features - Fonctionnalités détectées
   * @param {string} code - Code source
   * @returns {Array} Liste de suggestions
   */
  getAccessibilitySuggestions(features, code) {
    const suggestions = [];

    if (features.alt_attributes === 0 && code.includes('<img')) {
      suggestions.push('Ajouter des attributs alt aux images');
    }

    if (features.aria_labels < 2) {
      suggestions.push('Utiliser plus d\'aria-label pour les éléments interactifs');
    }

    if (features.semantic_elements < 3) {
      suggestions.push('Utiliser plus d\'éléments HTML5 sémantiques (header, nav, main, etc.)');
    }

    return suggestions;
  }

  /**
   * Analyse les bonnes pratiques
   * @param {string} code - Code source
   * @param {string} projectType - Type de projet
   * @returns {Object} Analyse des bonnes pratiques
   */
  analyzeBestPractices(code, projectType) {
    const practices = {
      css_organization: this.checkCssOrganization(code),
      component_structure: this.checkComponentStructure(code, projectType),
      performance: this.checkPerformance(code),
      maintainability: this.checkMaintainability(code)
    };

    return {
      practices,
      overall_score: this.calculateBestPracticesScore(practices),
      recommendations: this.getBestPracticesRecommendations(practices)
    };
  }

  /**
   * Calcule les statistiques d'usage
   * @param {string} code - Code source
   * @returns {Object} Statistiques d'usage
   */
  calculateUsageStats(code) {
    const stats = {
      total_lines: code.split('\n').length,
      total_characters: code.length,
      css_classes_total: (code.match(/class=/g) || []).length,
      dsfr_vs_custom_ratio: this.calculateDsfrRatio(code),
      complexity_score: this.calculateComplexityScore(code)
    };

    return stats;
  }

  /**
   * Génère des recommandations d'usage
   * @param {string} code - Code source
   * @param {string} projectType - Type de projet
   * @returns {Array} Liste de recommandations
   */
  generateUsageRecommendations(code, projectType) {
    const recommendations = [];

    // Recommandations basées sur l'analyse
    const dsfrClasses = this.extractDsfrClasses(code);
    
    if (dsfrClasses.length < 5) {
      recommendations.push({
        priority: 'high',
        category: 'adoption',
        title: 'Augmenter l\'utilisation du DSFR',
        description: 'Votre projet utilise peu de classes DSFR. Considérez migrer plus d\'éléments.',
        action: 'Remplacer les styles CSS custom par les classes utilitaires DSFR'
      });
    }

    if (!code.includes('fr-container')) {
      recommendations.push({
        priority: 'medium',
        category: 'layout',
        title: 'Utiliser le système de grille DSFR',
        description: 'Le conteneur DSFR (.fr-container) n\'est pas utilisé.',
        action: 'Ajouter .fr-container pour structurer vos pages'
      });
    }

    if (projectType === 'react' && !code.includes('@gouvfr/dsfr')) {
      recommendations.push({
        priority: 'high',
        category: 'integration',
        title: 'Utiliser le package DSFR React officiel',
        description: 'Pour React, il existe un package officiel avec des composants prêts.',
        action: 'npm install @gouvfr/dsfr-react'
      });
    }

    return recommendations;
  }

  /**
   * Formate les résultats d'analyse
   * @param {Object} analysis - Analyse complète
   * @param {string} depth - Profondeur d'affichage
   * @returns {string} Rapport formaté
   */
  formatAnalysisResults(analysis, depth) {
    let output = '# 📊 Analyse d\'utilisation DSFR\n\n';

    // Informations du projet
    output += `## 🔍 Informations du projet\n\n`;
    output += `- **Type détecté** : ${analysis.project_info.detected_type}\n`;
    output += `- **Taille du code** : ${analysis.project_info.code_length} caractères\n`;
    output += `- **Analysé le** : ${new Date(analysis.project_info.analysis_timestamp).toLocaleString('fr-FR')}\n\n`;

    // Utilisation DSFR
    output += `## 🎨 Utilisation DSFR\n\n`;
    output += `- **Classes DSFR trouvées** : ${analysis.dsfr_usage.classes_count}\n`;
    output += `- **Composants identifiés** : ${analysis.dsfr_usage.components_count}\n`;
    output += `- **Niveau d'adoption** : ${analysis.dsfr_usage.dsfr_coverage.overall_adoption_level}\n`;
    output += `- **Couverture des classes** : ${analysis.dsfr_usage.dsfr_coverage.class_coverage_percent}%\n\n`;

    if (depth === 'detailed' || depth === 'comprehensive') {
      // Classes trouvées
      if (analysis.dsfr_usage.classes_found.length > 0) {
        output += `### Classes DSFR utilisées\n\n`;
        output += '```\n';
        output += analysis.dsfr_usage.classes_found.slice(0, 20).join('\n');
        if (analysis.dsfr_usage.classes_found.length > 20) {
          output += `\n... et ${analysis.dsfr_usage.classes_found.length - 20} autres\n`;
        }
        output += '```\n\n';
      }

      // Composants identifiés
      if (analysis.dsfr_usage.components_identified.length > 0) {
        output += `### Composants DSFR identifiés\n\n`;
        analysis.dsfr_usage.components_identified.forEach(comp => {
          output += `- **${comp.name}** : ${comp.occurrences} occurrence(s)\n`;
        });
        output += '\n';
      }
    }

    // Accessibilité
    output += `## ♿ Accessibilité\n\n`;
    output += `- **Score d'accessibilité** : ${analysis.accessibility_analysis.score}/100 (${analysis.accessibility_analysis.level})\n`;
    
    if (analysis.accessibility_analysis.suggestions.length > 0) {
      output += `- **Suggestions** :\n`;
      analysis.accessibility_analysis.suggestions.forEach(suggestion => {
        output += `  - ${suggestion}\n`;
      });
    }
    output += '\n';

    // Problèmes potentiels
    if (analysis.dsfr_usage.potential_issues.length > 0) {
      output += `## ⚠️ Problèmes potentiels\n\n`;
      analysis.dsfr_usage.potential_issues.forEach(issue => {
        output += `- **${issue.type}** (${issue.severity}) : ${issue.description}\n`;
      });
      output += '\n';
    }

    // Recommandations
    if (analysis.recommendations && analysis.recommendations.length > 0) {
      output += `## 💡 Recommandations\n\n`;
      analysis.recommendations.forEach((rec, index) => {
        output += `### ${index + 1}. ${rec.title} (${rec.priority})\n`;
        output += `**Catégorie** : ${rec.category}\n\n`;
        output += `${rec.description}\n\n`;
        output += `**Action recommandée** : ${rec.action}\n\n`;
      });
    }

    // Statistiques détaillées (mode comprehensive)
    if (depth === 'comprehensive' && analysis.usage_statistics) {
      output += `## 📈 Statistiques détaillées\n\n`;
      output += `- **Lignes de code** : ${analysis.usage_statistics.total_lines}\n`;
      output += `- **Classes CSS totales** : ${analysis.usage_statistics.css_classes_total}\n`;
      output += `- **Score de complexité** : ${analysis.usage_statistics.complexity_score || 'N/A'}\n\n`;
    }

    output += `---\n\n`;
    output += `*Analyse générée par DSFR-MCP v1.4.0*`;

    return output;
  }

  // Méthodes utilitaires pour les analyses (implémentation simplifiée)
  checkCssOrganization(code) { return { score: 75, issues: [] }; }
  checkComponentStructure(code, type) { return { score: 80, suggestions: [] }; }
  checkPerformance(code) { return { score: 70, optimizations: [] }; }
  checkMaintainability(code) { return { score: 85, improvements: [] }; }
  calculateBestPracticesScore(practices) { return 78; }
  getBestPracticesRecommendations(practices) { return []; }
  calculateDsfrRatio(code) { return 0.6; }
  calculateComplexityScore(code) { return Math.min(100, Math.floor(code.length / 100)); }
}

module.exports = DocumentationService;
