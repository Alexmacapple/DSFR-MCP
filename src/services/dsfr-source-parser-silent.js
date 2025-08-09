// Service de parsing du code source DSFR - Version silencieuse pour MCP
const fs = require('fs').promises;
const path = require('path');

class DSFRSourceParser {
  constructor() {
    // Utilisation de la nouvelle structure de fichiers découpés
    this.sourceDir = path.join('data', 'dsfr-source');
    this.indexFile = path.join(this.sourceDir, 'index.json');
    this.components = new Map();
    this.coreModules = new Map();
    this.utilities = new Map();
    this.analytics = new Map();
    this.examples = new Map();
    this.schemas = new Map();
    this.documentation = new Map();
    this.fileIndex = null;
  }

  async parseSourceFiles() {
    // Pas de console.log - MCP nécessite du JSON pur sur stdout

    // Charger l'index des fichiers
    this.fileIndex = JSON.parse(await fs.readFile(this.indexFile, 'utf-8'));

    // Traiter les fichiers par catégorie
    const categories = [
      'components',
      'core',
      'utilities',
      'analytics',
      'examples',
      'documentation',
      'other',
    ];

    for (const category of categories) {
      const categoryPath = path.join(this.sourceDir, category);

      try {
        const files = await fs.readdir(categoryPath);

        let processedCount = 0;
        for (const file of files) {
          if (file === '.DS_Store' || file.startsWith('.')) continue;

          // Skip le fichier index s'il existe
          if (file === 'index.json') continue;

          const filePath = path.join(categoryPath, file);
          const stats = await fs.stat(filePath);

          if (stats.isFile()) {
            // Si c'est un fichier .meta.json, récupérer les métadonnées
            if (file.endsWith('.meta.json')) {
              const metadata = JSON.parse(await fs.readFile(filePath, 'utf-8'));
              const contentFileName = file.replace('.meta.json', '');
              const contentFilePath = path.join(categoryPath, contentFileName);

              // Vérifier si le fichier de contenu existe
              try {
                const fileContent = await fs.readFile(contentFilePath, 'utf-8');
                const originalPath = metadata.originalPath;
                const sectionType = this.detectSectionType(originalPath);

                await this.processSection(sectionType, originalPath, fileContent);
                processedCount++;
              } catch (err) {
                // Ignorer silencieusement les fichiers manquants
              }
            }
          }
        }
      } catch (error) {
        // Ignorer silencieusement les catégories manquantes
      }
    }
  }

  // Méthode de compatibilité
  async parseSourceFile() {
    return this.parseSourceFiles();
  }

  detectSectionType(filePath) {
    // Analyser le chemin pour déterminer le type
    if (filePath.includes('/component/')) return 'component';
    if (filePath.includes('/core/')) return 'core';
    if (filePath.includes('/utility/')) return 'utility';
    if (filePath.includes('/analytics/')) return 'analytics';
    if (filePath.includes('/example/')) return 'example';
    if (filePath.includes('/scheme/')) return 'scheme';
    if (filePath.includes('.schema.yml')) return 'schema';
    if (filePath.includes('/doc/') || filePath.endsWith('.md')) return 'documentation';
    if (filePath.includes('.scss')) return 'style';
    if (filePath.includes('.js')) return 'script';
    if (filePath.includes('.yml') || filePath.includes('.yaml')) return 'config';

    return 'other';
  }

  async processSection(type, filePath, content) {
    const fileName = path.basename(filePath);
    const dirName = path.dirname(filePath);

    switch (type) {
      case 'component':
        await this.processComponent(filePath, content);
        break;

      case 'core':
        await this.processCore(filePath, content);
        break;

      case 'utility':
        await this.processUtility(filePath, content);
        break;

      case 'analytics':
        await this.processAnalytics(filePath, content);
        break;

      case 'example':
        await this.processExample(filePath, content);
        break;

      case 'schema':
        await this.processSchema(filePath, content);
        break;

      case 'documentation':
        await this.processDocumentation(filePath, content);
        break;

      case 'style':
      case 'script':
      case 'config':
        // Ces types sont traités dans leurs sections respectives
        break;
    }
  }

  async processComponent(filePath, content) {
    // Extraire le nom du composant
    const match = filePath.match(/component\/([^/]+)\//);
    if (!match) return;

    const componentName = match[1];

    if (!this.components.has(componentName)) {
      this.components.set(componentName, {
        name: componentName,
        files: {},
        examples: [],
        documentation: '',
        schema: null,
        styles: {},
        scripts: {},
      });
    }

    const component = this.components.get(componentName);

    // Classifier le fichier
    if (filePath.endsWith('.scss')) {
      const styleType = this.getStyleType(filePath);
      component.styles[styleType] = content;
    } else if (filePath.endsWith('.js')) {
      const scriptType = this.getScriptType(filePath);
      component.scripts[scriptType] = content;
    } else if (filePath.endsWith('.yml') || filePath.endsWith('.yaml')) {
      component.schema = this.parseYAML(content);
    } else if (filePath.endsWith('.md')) {
      component.documentation = content;
    } else if (filePath.includes('/example/')) {
      component.examples.push({
        path: filePath,
        content: content,
      });
    }

    component.files[path.basename(filePath)] = content;
  }

  async processCore(filePath, content) {
    const moduleName = this.extractModuleName(filePath, 'core');

    if (!this.coreModules.has(moduleName)) {
      this.coreModules.set(moduleName, {
        name: moduleName,
        files: {},
        documentation: '',
      });
    }

    const module = this.coreModules.get(moduleName);
    module.files[path.basename(filePath)] = content;

    if (filePath.endsWith('.md')) {
      module.documentation = content;
    }
  }

  async processUtility(filePath, content) {
    const utilityName = this.extractModuleName(filePath, 'utility');

    if (!this.utilities.has(utilityName)) {
      this.utilities.set(utilityName, {
        name: utilityName,
        files: {},
        documentation: '',
      });
    }

    const utility = this.utilities.get(utilityName);
    utility.files[path.basename(filePath)] = content;

    if (filePath.endsWith('.md')) {
      utility.documentation = content;
    }
  }

  async processAnalytics(filePath, content) {
    const analyticsName = this.extractModuleName(filePath, 'analytics');

    if (!this.analytics.has(analyticsName)) {
      this.analytics.set(analyticsName, {
        name: analyticsName,
        files: {},
        documentation: '',
      });
    }

    const analytics = this.analytics.get(analyticsName);
    analytics.files[path.basename(filePath)] = content;
  }

  async processExample(filePath, content) {
    const componentMatch = filePath.match(/component\/([^/]+)\//);
    if (componentMatch) {
      const componentName = componentMatch[1];
      if (!this.examples.has(componentName)) {
        this.examples.set(componentName, []);
      }
      this.examples.get(componentName).push({
        path: filePath,
        content: content,
      });
    }
  }

  async processSchema(filePath, content) {
    const componentMatch = filePath.match(/component\/([^/]+)\//);
    if (componentMatch) {
      const componentName = componentMatch[1];
      this.schemas.set(componentName, this.parseYAML(content));
    }
  }

  async processDocumentation(filePath, content) {
    const fileName = path.basename(filePath, '.md');
    this.documentation.set(fileName, {
      path: filePath,
      content: content,
    });
  }

  extractModuleName(filePath, type) {
    const regex = new RegExp(`${type}/([^/]+)/`);
    const match = filePath.match(regex);
    return match ? match[1] : path.basename(filePath, path.extname(filePath));
  }

  getStyleType(filePath) {
    if (filePath.includes('.print.')) return 'print';
    if (filePath.includes('.legacy.')) return 'legacy';
    if (filePath.includes('.main.')) return 'main';
    return 'default';
  }

  getScriptType(filePath) {
    if (filePath.includes('.module.')) return 'module';
    if (filePath.includes('.nomodule.')) return 'nomodule';
    return 'default';
  }

  parseYAML(content) {
    // Simple YAML parsing - dans un vrai cas, utiliser un parser YAML
    try {
      // Pour l'instant, retourner le contenu brut
      return content;
    } catch (error) {
      return null;
    }
  }

  displayStats() {
    // Ne pas afficher de statistiques pour éviter de corrompre stdout
  }

  // Méthodes d'accès
  getComponent(name) {
    return this.components.get(name);
  }

  getCore(name) {
    return this.coreModules.get(name);
  }

  getUtility(name) {
    return this.utilities.get(name);
  }

  getAnalytics(name) {
    return this.analytics.get(name);
  }

  getAllComponents() {
    return Array.from(this.components.values());
  }

  getAllUtilities() {
    return Array.from(this.utilities.values());
  }

  getAllCoreModules() {
    return Array.from(this.coreModules.values());
  }

  searchComponents(query) {
    const results = [];
    const lowerQuery = query.toLowerCase();

    for (const [name, component] of this.components) {
      if (
        name.toLowerCase().includes(lowerQuery) ||
        (component.documentation && component.documentation.toLowerCase().includes(lowerQuery))
      ) {
        results.push(component);
      }
    }

    return results;
  }

  getComponentExample(componentName, index = 0) {
    const component = this.components.get(componentName);
    if (component && component.examples.length > index) {
      return component.examples[index];
    }
    return null;
  }

  getComponentSchema(componentName) {
    return this.schemas.get(componentName);
  }

  hasComponent(name) {
    return this.components.has(name);
  }

  getFileStats() {
    return {
      components: this.components.size,
      coreModules: this.coreModules.size,
      utilities: this.utilities.size,
      analytics: this.analytics.size,
      totalFiles: this.fileIndex ? this.fileIndex.totalFiles : 0,
    };
  }
}

module.exports = DSFRSourceParser;
