#!/usr/bin/env node

/**
 * Script d'uniformisation des noms de fichiers
 * Standardise les noms selon les conventions DSFR
 */

const fs = require('fs').promises;
const path = require('path');

class FilenameStandardizer {
  constructor() {
    this.renames = [];
    this.errors = [];
    this.stats = {
      totalFiles: 0,
      renamedFiles: 0,
      skippedFiles: 0,
      errorFiles: 0
    };
  }

  async standardizeDirectory(dirPath) {
    console.log('\u{1F4DD} Début de la standardisation des noms de fichiers...\n');

    try {
      const files = await fs.readdir(dirPath);
      const markdownFiles = files.filter(file => file.endsWith('.md'));
      
      this.stats.totalFiles = markdownFiles.length;
      console.log(`\u{1F4C1} ${this.stats.totalFiles} fichiers markdown trouvés\n`);

      // Analyser les fichiers pour déterminer les renommages nécessaires
      for (const file of markdownFiles) {
        const filePath = path.join(dirPath, file);
        await this.analyzeFile(filePath, file);
      }

      // Afficher le plan de renommage
      this.displayRenamePlan();

      // Confirmer avant d'exécuter
      if (this.renames.length > 0) {
        console.log('\n\u{2753} Voulez-vous procéder au renommage? (Cette opération sera simulée)');
        await this.executeRenames(dirPath);
      }

      this.generateReport();
    } catch (error) {
      console.error('\u{274C} Erreur lors de la standardisation:', error.message);
      process.exit(1);
    }
  }

  async analyzeFile(filePath, fileName) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n');
      
      // Extraire les métadonnées pour déterminer le nom standardisé
      const metadata = this.extractMetadata(lines);
      const standardizedName = this.generateStandardizedName(metadata, fileName);
      
      if (standardizedName !== fileName) {
        this.renames.push({
          current: fileName,
          standardized: standardizedName,
          metadata: metadata,
          reason: this.getReasonForRename(fileName, standardizedName)
        });
      } else {
        this.stats.skippedFiles++;
      }
    } catch (error) {
      this.addError(fileName, `Erreur d'analyse: ${error.message}`);
      this.stats.errorFiles++;
    }
  }

  extractMetadata(lines) {
    const metadata = {
      url: '',
      title: '',
      category: '',
      component: '',
      type: ''
    };

    for (let i = 0; i < Math.min(20, lines.length); i++) {
      const line = lines[i];
      
      if (line.trim().startsWith('URL:')) {
        let url = line.substring(4).trim();
        if (!url && i + 1 < lines.length) {
          url = lines[i + 1].trim();
        }
        metadata.url = url;
      }
      
      if (line.trim().startsWith('Title:')) {
        let title = line.substring(6).trim();
        if (!title && i + 1 < lines.length) {
          title = lines[i + 1].trim();
        }
        metadata.title = title;
      }

      // Analyser l'URL pour extraire la catégorie et le composant
      if (metadata.url) {
        this.parseUrlMetadata(metadata);
      }
    }

    return metadata;
  }

  parseUrlMetadata(metadata) {
    const url = metadata.url;
    
    // Identifier le type selon l'URL
    if (url.includes('/example/component/')) {
      metadata.type = 'component';
      const match = url.match(/\/component\/([^/?]+)/);
      if (match) {
        metadata.component = match[1];
      }
    } else if (url.includes('/example/core/')) {
      metadata.type = 'core';
      const match = url.match(/\/core\/([^/?]+)/);
      if (match) {
        metadata.component = match[1];
      }
    } else if (url.includes('/example/analytics/')) {
      metadata.type = 'analytics';
      const match = url.match(/\/analytics\/component\/([^/?]+)/);
      if (match) {
        metadata.component = match[1];
      }
    } else if (url.includes('/example/utility/')) {
      metadata.type = 'utility';
      const match = url.match(/\/utility\/([^/?]+)/);
      if (match) {
        metadata.component = match[1];
      }
    } else if (url.includes('/example/pattern/')) {
      metadata.type = 'pattern';
      const match = url.match(/\/pattern\/([^/?]+)/);
      if (match) {
        metadata.component = match[1];
      }
    } else if (url.includes('/example/template/')) {
      metadata.type = 'template';
      const match = url.match(/\/template\/([^/?]+)/);
      if (match) {
        metadata.component = match[1];
      }
    } else if (url === 'https://main--ds-gouv.netlify.app/example') {
      metadata.type = 'overview';
      metadata.component = 'dsfr';
    }

    // Nettoyer le nom du composant
    if (metadata.component) {
      metadata.component = this.normalizeComponentName(metadata.component);
    }
  }

  normalizeComponentName(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  generateStandardizedName(metadata, currentName) {
    const { type, component, title } = metadata;
    
    // Extraire le numéro de la fiche du nom actuel
    const numberMatch = currentName.match(/^fiche-(\d+)-/);
    const ficheNumber = numberMatch ? numberMatch[1] : '001';

    let baseName = '';
    
    if (type === 'overview') {
      baseName = 'systeme-de-design-de-l-etat';
    } else if (type === 'core') {
      baseName = 'fondamentaux';
      if (component && component !== 'collapse') {
        baseName = component;
      }
    } else if (type === 'component') {
      baseName = component || this.extractComponentFromTitle(title);
    } else if (type === 'analytics') {
      baseName = 'outils-d-analyse';
      if (component) {
        baseName = `outils-d-analyse-${component}`;
      }
    } else if (type === 'utility') {
      baseName = `utilitaire-${component}`;
    } else if (type === 'pattern') {
      baseName = `modele-${component}`;
    } else if (type === 'template') {
      baseName = `template-${component}`;
    } else {
      // Fallback: essayer d'extraire depuis le titre
      baseName = this.extractComponentFromTitle(title);
    }

    // Nettoyer et normaliser le nom de base
    baseName = this.normalizeComponentName(baseName);
    
    // Limiter la longueur
    if (baseName.length > 50) {
      baseName = baseName.substring(0, 50).replace(/-[^-]*$/, '');
    }

    return `fiche-${ficheNumber}-${baseName}-systeme-de-design.md`;
  }

  extractComponentFromTitle(title) {
    if (!title) return 'composant';
    
    // Extraire le nom principal du composant depuis le titre
    const titleLower = title.toLowerCase();
    
    // Mapping des titres connus
    const componentMap = {
      'accordéon': 'accordeon',
      'alerte': 'alerte',
      'badge': 'badge',
      'bandeau': 'bandeau-information',
      'bouton': 'bouton',
      'carte': 'carte',
      'citation': 'citation',
      'en-tête': 'en-tete',
      'footer': 'pied-de-page',
      'pied de page': 'pied-de-page',
      'modale': 'modale',
      'navigation': 'navigation',
      'onglets': 'onglets',
      'tableau': 'tableau',
      'tag': 'tag',
      'tuile': 'tuile'
    };

    for (const [french, normalized] of Object.entries(componentMap)) {
      if (titleLower.includes(french)) {
        return normalized;
      }
    }

    // Extraire le premier mot significatif
    const words = title.split(/[\s-]+/);
    for (const word of words) {
      if (word.length > 3 && !['système', 'design', 'état'].includes(word.toLowerCase())) {
        return this.normalizeComponentName(word);
      }
    }

    return 'composant';
  }

  getReasonForRename(current, standardized) {
    const reasons = [];
    
    if (!current.includes('systeme-de-design.md')) {
      reasons.push('Ajout du suffixe standard');
    }
    
    if (current.includes('_')) {
      reasons.push('Remplacement des underscores par des tirets');
    }
    
    if (current !== current.toLowerCase()) {
      reasons.push('Conversion en minuscules');
    }
    
    if (current.includes('--') || current.includes('---')) {
      reasons.push('Normalisation des tirets multiples');
    }

    return reasons.join(', ') || 'Standardisation du format';
  }

  displayRenamePlan() {
    if (this.renames.length === 0) {
      console.log('\u{2705} Tous les fichiers respectent déjà les conventions de nommage.\n');
      return;
    }

    console.log(`\u{1F4CB} Plan de renommage (${this.renames.length} fichiers):\n`);
    
    for (const rename of this.renames.slice(0, 10)) {
      console.log(`  \u{1F504} ${rename.current}`);
      console.log(`     \u{2192} ${rename.standardized}`);
      console.log(`     \u{1F4DD} ${rename.reason}\n`);
    }

    if (this.renames.length > 10) {
      console.log(`  ... et ${this.renames.length - 10} autres fichiers\n`);
    }
  }

  async executeRenames(dirPath) {
    console.log('\u{1F6A7} SIMULATION du renommage (aucun fichier ne sera réellement renommé):\n');
    
    for (const rename of this.renames) {
      const currentPath = path.join(dirPath, rename.current);
      const newPath = path.join(dirPath, rename.standardized);
      
      try {
        // Simulation - ne pas faire le vrai renommage
        console.log(`  \u{2705} ${rename.current} \u{2192} ${rename.standardized}`);
        this.stats.renamedFiles++;
        
        // Dans un vrai renommage, nous ferions:
        // await fs.rename(currentPath, newPath);
      } catch (error) {
        console.log(`  \u{274C} Erreur: ${rename.current} - ${error.message}`);
        this.addError(rename.current, `Erreur de renommage: ${error.message}`);
      }
    }
  }

  addError(fileName, message) {
    this.errors.push({ file: fileName, message });
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('\u{1F4CA} RAPPORT DE STANDARDISATION DES NOMS');
    console.log('='.repeat(60));

    // Statistiques
    console.log('\n\u{1F4C8} Statistiques:');
    console.log(`  Fichiers analysés: ${this.stats.totalFiles}`);
    console.log(`  Fichiers à renommer: ${this.renames.length}`);
    console.log(`  Fichiers déjà conformes: ${this.stats.skippedFiles}`);
    console.log(`  Fichiers avec erreurs: ${this.stats.errorFiles}`);

    // Taux de conformité
    const conformityRate = ((this.stats.skippedFiles / this.stats.totalFiles) * 100).toFixed(1);
    console.log(`  Taux de conformité: ${conformityRate}%`);

    // Types de renommages
    if (this.renames.length > 0) {
      console.log('\n\u{1F4DD} Types de standardisation nécessaires:');
      const reasonCounts = {};
      this.renames.forEach(rename => {
        const reason = rename.reason;
        reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
      });
      
      for (const [reason, count] of Object.entries(reasonCounts)) {
        console.log(`  ${reason}: ${count} fichiers`);
      }
    }

    // Erreurs
    if (this.errors.length > 0) {
      console.log(`\n\u{274C} Erreurs (${this.errors.length}):`);
      this.errors.forEach(error => {
        console.log(`  ${error.file}: ${error.message}`);
      });
    }

    // Conclusion
    console.log('\n' + '='.repeat(60));
    if (this.renames.length === 0) {
      console.log('\u{2705} NOMS DE FICHIERS DÉJÀ STANDARDISÉS');
    } else {
      console.log('\u{1F4CB} PLAN DE STANDARDISATION PRÉPARÉ');
      console.log('Pour appliquer ces changements, modifiez le script pour activer le renommage réel.');
    }
    console.log('='.repeat(60));
  }
}

// Exécution du script
async function main() {
  const standardizer = new FilenameStandardizer();
  const dataDir = path.join(__dirname, '..', 'fiches-markdown-v2');
  
  await standardizer.standardizeDirectory(dataDir);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = FilenameStandardizer;