// Service de parsing optimisé du code source DSFR
const fs = require('fs').promises;
const path = require('path');

class DSFROptimizedParser {
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
    this.processedFiles = 0;
  }

  async parseSourceFiles() {
    console.log('📦 Parsing du code source DSFR (version optimisée)...');

    try {
      // Charger l'index des fichiers
      this.fileIndex = JSON.parse(await fs.readFile(this.indexFile, 'utf-8'));
      console.log(`📂 ${this.fileIndex.totalFiles} fichiers à traiter`);

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
        await this.processCategory(category);
      }

      console.log(`\n✅ Parsing terminé - ${this.processedFiles} fichiers traités`);
      this.displayStats();
    } catch (error) {
      console.error('❌ Erreur lors du parsing:', error);
      throw error;
    }
  }

  async processCategory(category) {
    const categoryPath = path.join(this.sourceDir, category);

    try {
      const files = await fs.readdir(categoryPath);
      const actualFiles = files.filter(
        (f) => !f.endsWith('.meta.json') && f !== 'index.json' && !f.startsWith('.')
      );

      if (actualFiles.length === 0) {
        console.log(`⚠️  Catégorie ${category} vide`);
        return;
      }

      console.log(`\n⚙️  Traitement de ${category}: ${actualFiles.length} fichiers`);

      let processedCount = 0;
      const batchSize = 50; // Traiter par lots pour optimiser la performance

      for (let i = 0; i < actualFiles.length; i += batchSize) {
        const batch = actualFiles.slice(i, i + batchSize);

        await Promise.all(
          batch.map(async (file) => {
            try {
              await this.processFile(categoryPath, file);
              processedCount++;
            } catch (error) {
              console.error(`❌ Erreur avec ${file}: ${error.message}`);
            }
          })
        );

        // Afficher la progression
        if (processedCount % 100 === 0) {
          process.stdout.write(`\r   ✓ ${processedCount} fichiers traités...`);
        }
      }

      console.log(`\r   ✓ ${processedCount} fichiers traités dans ${category}`);
      this.processedFiles += processedCount;
    } catch (error) {
      console.warn(`⚠️  Erreur avec la catégorie ${category}: ${error.message}`);
    }
  }

  async processFile(categoryPath, fileName) {
    const filePath = path.join(categoryPath, fileName);
    const metaPath = filePath + '.meta.json';

    try {
      // Lire le contenu du fichier
      const content = await fs.readFile(filePath, 'utf-8');

      // Lire les métadonnées si elles existent
      let originalPath;
      try {
        const metadata = JSON.parse(await fs.readFile(metaPath, 'utf-8'));
        originalPath = metadata.originalPath;
      } catch {
        // Si pas de métadonnées, reconstruire le chemin depuis le nom
        originalPath = fileName.replace(/__/g, '/');
      }

      // Déterminer le type de section et traiter
      const sectionType = this.detectSectionType(originalPath);
      await this.processSection(sectionType, originalPath, content);
    } catch (error) {
      throw new Error(`Impossible de lire ${fileName}: ${error.message}`);
    }
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
        templates: {},
      });
    }

    const component = this.components.get(componentName);
    const fileName = path.basename(filePath);

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
    } else if (filePath.endsWith('.ejs')) {
      const templateName = fileName.replace('.ejs', '');
      component.templates[templateName] = content;
    } else if (filePath.includes('/example/')) {
      component.examples.push({
        path: filePath,
        content: content,
      });
    }

    component.files[fileName] = content;
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
    const fileName = path.basename(filePath);
    this.analytics.set(fileName, {
      path: filePath,
      content: content,
    });
  }

  async processExample(filePath, content) {
    // Extraire le nom du composant depuis le chemin d'exemple
    const match = filePath.match(/example\/component\/([^/]+)\//);
    if (match) {
      const componentName = match[1];
      this.examples.set(filePath, {
        component: componentName,
        path: filePath,
        content: content,
      });
    }
  }

  async processSchema(filePath, content) {
    const componentName = this.extractComponentFromPath(filePath);
    this.schemas.set(componentName, {
      path: filePath,
      content: this.parseYAML(content),
    });
  }

  async processDocumentation(filePath, content) {
    const docName = path.basename(filePath, '.md');
    this.documentation.set(docName, {
      path: filePath,
      content: content,
    });
  }

  extractModuleName(filePath, moduleType) {
    const regex = new RegExp(`${moduleType}/([^/]+)/`);
    const match = filePath.match(regex);
    return match ? match[1] : path.basename(path.dirname(filePath));
  }

  extractComponentFromPath(filePath) {
    const match = filePath.match(/component\/([^/]+)\//);
    return match ? match[1] : 'unknown';
  }

  getStyleType(filePath) {
    if (filePath.includes('legacy')) return 'legacy';
    if (filePath.includes('print')) return 'print';
    if (filePath.includes('main')) return 'main';
    return 'default';
  }

  getScriptType(filePath) {
    if (filePath.includes('api')) return 'api';
    if (filePath.includes('legacy')) return 'legacy';
    if (filePath.includes('main')) return 'main';
    return 'default';
  }

  parseYAML(content) {
    // Parser basique YAML (pour une vraie implémentation, utiliser un parser YAML)
    const result = {};
    const lines = content.split('\n');
    let currentKey = null;
    const currentIndent = 0;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const indent = line.search(/\S/);
      const match = trimmed.match(/^([^:]+):\s*(.*)$/);

      if (match) {
        const [, key, value] = match;
        if (indent === 0) {
          currentKey = key;
          result[key] = value || {};
        } else if (currentKey && indent > currentIndent) {
          if (typeof result[currentKey] !== 'object') {
            result[currentKey] = {};
          }
          result[currentKey][key] = value;
        }
      }
    }

    return result;
  }

  displayStats() {
    console.log('\n📊 Statistiques du parsing:');
    console.log(`   - Composants: ${this.components.size}`);
    console.log(`   - Modules Core: ${this.coreModules.size}`);
    console.log(`   - Utilitaires: ${this.utilities.size}`);
    console.log(`   - Fichiers Analytics: ${this.analytics.size}`);
    console.log(`   - Exemples: ${this.examples.size}`);
    console.log(`   - Schémas: ${this.schemas.size}`);
    console.log(`   - Documentation: ${this.documentation.size}`);

    // Afficher quelques composants avec détails
    if (this.components.size > 0) {
      console.log('\n📋 Détails de quelques composants:');
      const componentList = Array.from(this.components.entries()).slice(0, 3);
      for (const [name, comp] of componentList) {
        console.log(`   ${name}:`);
        console.log(`     - Fichiers: ${Object.keys(comp.files).length}`);
        console.log(`     - Styles: ${Object.keys(comp.styles).length}`);
        console.log(`     - Scripts: ${Object.keys(comp.scripts).length}`);
        console.log(`     - Templates: ${Object.keys(comp.templates).length}`);
      }
    }
  }

  // Méthodes publiques pour accéder aux données parsées

  getComponent(name) {
    return this.components.get(name);
  }

  getAllComponents() {
    return Array.from(this.components.values());
  }

  getComponentList() {
    return Array.from(this.components.keys()).sort();
  }

  getCoreModule(name) {
    return this.coreModules.get(name);
  }

  getUtility(name) {
    return this.utilities.get(name);
  }

  getExamplesForComponent(componentName) {
    return Array.from(this.examples.values()).filter((ex) => ex.component === componentName);
  }

  getDocumentation(name) {
    return this.documentation.get(name);
  }

  async exportSummary() {
    const summary = {
      totalFiles: this.processedFiles,
      components: {
        count: this.components.size,
        list: this.getComponentList(),
        details: {},
      },
      coreModules: {
        count: this.coreModules.size,
        list: Array.from(this.coreModules.keys()),
      },
      utilities: {
        count: this.utilities.size,
        list: Array.from(this.utilities.keys()),
      },
      analytics: this.analytics.size,
      examples: this.examples.size,
      documentation: this.documentation.size,
      generatedAt: new Date().toISOString(),
    };

    // Ajouter les détails des composants
    for (const [name, comp] of this.components) {
      summary.components.details[name] = {
        files: Object.keys(comp.files).length,
        styles: Object.keys(comp.styles).length,
        scripts: Object.keys(comp.scripts).length,
        templates: Object.keys(comp.templates).length,
        hasDocumentation: !!comp.documentation,
        hasSchema: !!comp.schema,
        examplesCount: comp.examples.length,
      };
    }

    const summaryPath = path.join(this.sourceDir, 'parsing-summary.json');
    await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2));

    console.log(`\n📄 Résumé exporté dans: ${summaryPath}`);
    return summary;
  }
}

module.exports = DSFROptimizedParser;
