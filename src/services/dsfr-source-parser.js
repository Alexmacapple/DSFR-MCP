// Service de parsing du code source DSFR
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
    console.log('📦 Parsing du code source DSFR (structure optimisée)...');

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
        const categoryPath = path.join(this.sourceDir, category);

        try {
          const files = await fs.readdir(categoryPath);
          console.log(`\n⚙️  Traitement de ${category}: ${files.length} fichiers`);

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
                  console.warn(`⚠️  Fichier de contenu non trouvé: ${contentFileName}`);
                }
              }
            }
          }

          console.log(`   ✓ ${processedCount} fichiers traités`);
        } catch (error) {
          console.warn(`⚠️  Catégorie ${category} non trouvée ou vide: ${error.message}`);
        }
      }

      console.log('\n✅ Parsing terminé');
      this.displayStats();
    } catch (error) {
      console.error('❌ Erreur lors du parsing:', error);
      throw error;
    }
  }

  // Méthode de compatibilité
  async parseSourceFile() {
    console.warn('⚠️  parseSourceFile() est déprécié, utilisation de parseSourceFiles()');
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
    const match = filePath.match(/component\/([^\/]+)\//);
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
    const fileName = path.basename(filePath);
    this.analytics.set(fileName, {
      path: filePath,
      content: content,
    });
  }

  async processExample(filePath, content) {
    // Extraire le nom du composant depuis le chemin d'exemple
    const match = filePath.match(/example\/component\/([^\/]+)\//);
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
    const match = filePath.match(/component\/([^\/]+)\//);
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

  async exportToDataFolder() {
    console.log('📁 Export des données parsées...');

    const dataPath = path.join('data', 'dsfr-source');

    // Créer la structure de dossiers
    await fs.mkdir(dataPath, { recursive: true });
    await fs.mkdir(path.join(dataPath, 'components'), { recursive: true });
    await fs.mkdir(path.join(dataPath, 'core'), { recursive: true });
    await fs.mkdir(path.join(dataPath, 'utilities'), { recursive: true });

    // Exporter les composants
    for (const [name, component] of this.components) {
      const componentPath = path.join(dataPath, 'components', name);
      await fs.mkdir(componentPath, { recursive: true });

      // Sauvegarder les métadonnées
      await fs.writeFile(
        path.join(componentPath, 'metadata.json'),
        JSON.stringify(
          {
            name: component.name,
            files: Object.keys(component.files),
            hasExamples: component.examples.length > 0,
            hasDocumentation: !!component.documentation,
            hasSchema: !!component.schema,
          },
          null,
          2
        )
      );

      // Sauvegarder les fichiers
      for (const [fileName, content] of Object.entries(component.files)) {
        await fs.writeFile(path.join(componentPath, fileName), content);
      }
    }

    // Créer un index global
    const index = {
      components: this.getComponentList(),
      coreModules: Array.from(this.coreModules.keys()),
      utilities: Array.from(this.utilities.keys()),
      totalFiles: this.getTotalFileCount(),
      generatedAt: new Date().toISOString(),
    };

    await fs.writeFile(path.join(dataPath, 'index.json'), JSON.stringify(index, null, 2));

    console.log('✅ Export terminé');
  }

  getTotalFileCount() {
    let count = 0;

    for (const component of this.components.values()) {
      count += Object.keys(component.files).length;
    }

    for (const module of this.coreModules.values()) {
      count += Object.keys(module.files).length;
    }

    for (const utility of this.utilities.values()) {
      count += Object.keys(utility.files).length;
    }

    count += this.analytics.size;
    count += this.examples.size;
    count += this.schemas.size;
    count += this.documentation.size;

    return count;
  }
}

module.exports = DSFRSourceParser;
