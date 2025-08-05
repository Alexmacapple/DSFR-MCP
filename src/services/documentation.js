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
}

module.exports = DocumentationService;
