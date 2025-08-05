#!/usr/bin/env node

/**
 * Script pour découper le fichier source DSFR monolithique en fichiers individuels
 * Cela permet un parsing plus rapide et une meilleure organisation
 */

const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');

class DSFRSourceSplitter {
  constructor() {
    this.sourceFile = path.join(__dirname, '..', 'gouvernementfr-dsfr-8a5edab282632443.txt');
    this.outputDir = path.join(__dirname, '..', 'data', 'dsfr-source');
    this.fileCount = 0;
    this.stats = {
      components: 0,
      core: 0,
      utilities: 0,
      analytics: 0,
      examples: 0,
      documentation: 0,
      other: 0
    };
  }

  async run() {
    console.log(chalk.blue('🔧 Découpage du fichier source DSFR...'));
    
    const spinner = ora('Lecture du fichier source...').start();
    
    try {
      // Créer le répertoire de sortie
      await this.ensureOutputDirectory();
      
      // Lire et traiter le fichier
      const content = await fs.readFile(this.sourceFile, 'utf-8');
      spinner.text = 'Analyse du contenu...';
      
      await this.processContent(content);
      
      spinner.succeed('Découpage terminé !');
      this.displayStats();
      
      // Créer un fichier index
      await this.createIndex();
      
    } catch (error) {
      spinner.fail('Erreur lors du découpage');
      console.error(chalk.red('Erreur:'), error.message);
      process.exit(1);
    }
  }

  async ensureOutputDirectory() {
    await fs.mkdir(this.outputDir, { recursive: true });
    
    // Créer les sous-dossiers par type
    const subdirs = [
      'components',
      'core',
      'utility',
      'analytics',
      'examples',
      'documentation',
      'schemes',
      'other'
    ];
    
    for (const dir of subdirs) {
      await fs.mkdir(path.join(this.outputDir, dir), { recursive: true });
    }
  }

  async processContent(content) {
    const lines = content.split('\n');
    let currentFile = null;
    let currentContent = [];
    let currentPath = '';
    let isInDirectoryStructure = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Détecter la structure de répertoire
      if (line.startsWith('Directory structure:')) {
        isInDirectoryStructure = true;
        continue;
      }
      
      // Détecter le début d'un fichier
      if (line.startsWith('FILE: ')) {
        // Sauvegarder le fichier précédent
        if (currentFile && currentContent.length > 0) {
          await this.saveFile(currentPath, currentContent.join('\n'));
        }
        
        // Nouveau fichier
        currentPath = line.replace('FILE: ', '').trim();
        currentContent = [];
        currentFile = true;
        isInDirectoryStructure = false;
        
      } else if (line.startsWith('==================================')) {
        // Ignorer les séparateurs
        continue;
        
      } else if (currentFile) {
        // Retirer les numéros de ligne si présents
        const cleanLine = line.replace(/^\d+\|/, '');
        currentContent.push(cleanLine);
      }
      
      // Afficher la progression
      if (i % 1000 === 0) {
        process.stdout.write(`\rTraitement: ${Math.round((i / lines.length) * 100)}%`);
      }
    }
    
    // Sauvegarder le dernier fichier
    if (currentFile && currentContent.length > 0) {
      await this.saveFile(currentPath, currentContent.join('\n'));
    }
    
    console.log('\r'); // Nouvelle ligne après la progression
  }

  async saveFile(filePath, content) {
    // Déterminer le type et le dossier de destination
    const type = this.detectFileType(filePath);
    const fileName = this.sanitizeFileName(filePath);
    const outputPath = path.join(this.outputDir, type, fileName);
    
    // Créer les sous-dossiers si nécessaire
    const dir = path.dirname(outputPath);
    await fs.mkdir(dir, { recursive: true });
    
    // Sauvegarder le fichier
    await fs.writeFile(outputPath, content, 'utf-8');
    
    // Mettre à jour les statistiques
    this.fileCount++;
    this.stats[type]++;
    
    // Créer aussi un fichier de métadonnées
    const metadataPath = outputPath.replace(/\.[^.]+$/, '.meta.json');
    const metadata = {
      originalPath: filePath,
      type: type,
      size: content.length,
      lineCount: content.split('\n').length,
      createdAt: new Date().toISOString()
    };
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
  }

  detectFileType(filePath) {
    if (filePath.includes('/component/') || filePath.includes('src/component/')) return 'components';
    if (filePath.includes('/core/') || filePath.includes('src/core/')) return 'core';
    if (filePath.includes('/utility/') || filePath.includes('src/utility/')) return 'utilities';
    if (filePath.includes('/analytics/') || filePath.includes('src/analytics/')) return 'analytics';
    if (filePath.includes('/example/') || filePath.includes('dsfr-sb/')) return 'examples';
    if (filePath.includes('/doc/') || filePath.endsWith('.md') || filePath.includes('README')) return 'documentation';
    if (filePath.includes('/scheme/')) return 'schemes';
    return 'other';
  }

  sanitizeFileName(filePath) {
    // Remplacer les caractères problématiques
    let sanitized = filePath
      .replace(/\//g, '__')  // Remplacer / par __
      .replace(/\\/g, '__')  // Remplacer \ par __
      .replace(/:/g, '_')    // Remplacer : par _
      .replace(/\*/g, '_')   // Remplacer * par _
      .replace(/\?/g, '_')   // Remplacer ? par _
      .replace(/"/g, '_')    // Remplacer " par _
      .replace(/</g, '_')    // Remplacer < par _
      .replace(/>/g, '_')    // Remplacer > par _
      .replace(/\|/g, '_');  // Remplacer | par _
    
    // S'assurer que le fichier a une extension
    if (!path.extname(sanitized)) {
      sanitized += '.txt';
    }
    
    return sanitized;
  }

  async createIndex() {
    console.log(chalk.blue('📑 Création de l\'index...'));
    
    const index = {
      totalFiles: this.fileCount,
      createdAt: new Date().toISOString(),
      stats: this.stats,
      structure: {}
    };
    
    // Parcourir chaque type de fichier
    for (const type of Object.keys(this.stats)) {
      if (this.stats[type] === 0) continue;
      
      const typeDir = path.join(this.outputDir, type);
      const files = await fs.readdir(typeDir);
      
      index.structure[type] = await Promise.all(
        files
          .filter(f => !f.endsWith('.meta.json'))
          .map(async (file) => {
            const metaPath = path.join(typeDir, file.replace(/\.[^.]+$/, '.meta.json'));
            try {
              const meta = JSON.parse(await fs.readFile(metaPath, 'utf-8'));
              return {
                file: file,
                originalPath: meta.originalPath,
                size: meta.size,
                lineCount: meta.lineCount
              };
            } catch (error) {
              return { file: file, error: 'No metadata' };
            }
          })
      );
    }
    
    // Sauvegarder l'index
    await fs.writeFile(
      path.join(this.outputDir, 'index.json'),
      JSON.stringify(index, null, 2)
    );
    
    console.log(chalk.green('✅ Index créé'));
  }

  displayStats() {
    console.log(chalk.green('\n📊 Statistiques du découpage:'));
    console.log(chalk.cyan(`   Total de fichiers: ${this.fileCount}`));
    console.log(chalk.cyan('   Par type:'));
    
    for (const [type, count] of Object.entries(this.stats)) {
      if (count > 0) {
        console.log(chalk.yellow(`     - ${type}: ${count}`));
      }
    }
    
    console.log(chalk.blue(`\n📁 Fichiers sauvegardés dans: ${this.outputDir}`));
  }
}

// Exécution
if (require.main === module) {
  const splitter = new DSFRSourceSplitter();
  splitter.run().catch(console.error);
}

module.exports = DSFRSourceSplitter;
