// Script de nettoyage et normalisation des données
const fs = require('fs').promises;
const path = require('path');

class DataCleaner {
  constructor() {
    this.fichesPath = path.join(__dirname, '../fiches-markdown-v2');
    this.backupPath = path.join(__dirname, '../data/backup-before-cleaning');
    this.results = {
      processed: 0,
      normalized: 0,
      errors: [],
      warnings: [],
      improvements: []
    };
  }

  async clean() {
    console.log('🧹 Nettoyage et normalisation des données...\n');
    
    try {
      // Créer un backup avant nettoyage
      await this.createBackup();
      
      // Lister tous les fichiers
      const files = await fs.readdir(this.fichesPath);
      const mdFiles = files.filter(f => f.endsWith('.md'));
      
      console.log(`📁 ${mdFiles.length} fichiers markdown trouvés\n`);
      
      // Traiter chaque fichier
      for (const file of mdFiles) {
        await this.processFile(file);
      }
      
      // Générer un rapport consolidé
      await this.generateReport();
      
      console.log('\n✅ Nettoyage terminé !');
      
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage:', error.message);
    }
  }
  
  async createBackup() {
    console.log('💾 Création d\'un backup...');
    
    try {
      await fs.mkdir(this.backupPath, { recursive: true });
      
      const files = await fs.readdir(this.fichesPath);
      let backupCount = 0;
      
      for (const file of files) {
        if (file.endsWith('.md')) {
          const sourcePath = path.join(this.fichesPath, file);
          const backupFilePath = path.join(this.backupPath, file);
          
          const content = await fs.readFile(sourcePath, 'utf-8');
          await fs.writeFile(backupFilePath, content, 'utf-8');
          backupCount++;
        }
      }
      
      console.log(`✅ ${backupCount} fichiers sauvegardés dans: ${this.backupPath}\n`);
      
    } catch (error) {
      throw new Error(`Impossible de créer le backup: ${error.message}`);
    }
  }
  
  async processFile(filename) {
    try {
      const filePath = path.join(this.fichesPath, filename);
      const originalContent = await fs.readFile(filePath, 'utf-8');
      let cleanedContent = originalContent;
      let hasChanges = false;
      
      // 1. Normaliser les sauts de ligne
      if (cleanedContent.includes('\r\n')) {
        cleanedContent = cleanedContent.replace(/\r\n/g, '\n');
        hasChanges = true;
        this.results.improvements.push(`${filename}: Normalisé les sauts de ligne`);
      }
      
      // 2. Supprimer les espaces en fin de ligne
      const linesTrimmed = cleanedContent.split('\n').map(line => line.trimEnd());
      const trimmedContent = linesTrimmed.join('\n');
      if (trimmedContent !== cleanedContent) {
        cleanedContent = trimmedContent;
        hasChanges = true;
        this.results.improvements.push(`${filename}: Supprimé les espaces en fin de ligne`);
      }
      
      // 3. Normaliser les espaces multiples (sauf dans les blocs de code)
      const normalizedSpaces = this.normalizeSpaces(cleanedContent);
      if (normalizedSpaces !== cleanedContent) {
        cleanedContent = normalizedSpaces;
        hasChanges = true;
        this.results.improvements.push(`${filename}: Normalisé les espaces multiples`);
      }
      
      // 4. Valider la structure du fichier
      const validation = this.validateFileStructure(cleanedContent, filename);
      if (validation.errors.length > 0) {
        this.results.errors.push(...validation.errors.map(e => `${filename}: ${e}`));
      }
      if (validation.warnings.length > 0) {
        this.results.warnings.push(...validation.warnings.map(w => `${filename}: ${w}`));
      }
      
      // 5. Normaliser les métadonnées
      const normalizedMeta = this.normalizeMetadata(cleanedContent);
      if (normalizedMeta !== cleanedContent) {
        cleanedContent = normalizedMeta;
        hasChanges = true;
        this.results.improvements.push(`${filename}: Normalisé les métadonnées`);
      }
      
      // 6. Corriger les caractères spéciaux problématiques
      const fixedChars = this.fixSpecialCharacters(cleanedContent);
      if (fixedChars !== cleanedContent) {
        cleanedContent = fixedChars;
        hasChanges = true;
        this.results.improvements.push(`${filename}: Corrigé les caractères spéciaux`);
      }
      
      // 7. S'assurer qu'il y a un saut de ligne final
      if (!cleanedContent.endsWith('\n')) {
        cleanedContent += '\n';
        hasChanges = true;
        this.results.improvements.push(`${filename}: Ajouté saut de ligne final`);
      }
      
      // Sauvegarder si des changements ont été apportés
      if (hasChanges) {
        await fs.writeFile(filePath, cleanedContent, 'utf-8');
        this.results.normalized++;
        console.log(`✨ ${filename} - Nettoyé`);
      } else {
        console.log(`✅ ${filename} - Déjà propre`);
      }
      
      this.results.processed++;
      
    } catch (error) {
      this.results.errors.push(`${filename}: Erreur de traitement - ${error.message}`);
      console.error(`❌ ${filename} - Erreur:`, error.message);
    }
  }
  
  normalizeSpaces(content) {
    const lines = content.split('\n');
    let inCodeBlock = false;
    
    return lines.map(line => {
      // Détecter les blocs de code
      if (line.startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        return line;
      }
      
      // Ne pas modifier les espaces dans les blocs de code
      if (inCodeBlock) {
        return line;
      }
      
      // Normaliser les espaces multiples (sauf indentation)
      const leadingSpaces = line.match(/^(\s*)/)[1];
      const content = line.substring(leadingSpaces.length);
      const normalizedContent = content.replace(/\s+/g, ' ');
      
      return leadingSpaces + normalizedContent;
    }).join('\n');
  }
  
  validateFileStructure(content, filename) {
    const errors = [];
    const warnings = [];
    
    // Vérifier la présence de l'URL
    if (!content.includes('URL:')) {
      errors.push('Métadonnée URL manquante');
    }
    
    // Vérifier la présence du titre
    if (!content.includes('Title:')) {
      errors.push('Métadonnée Title manquante');
    }
    
    // Vérifier la section Markdown
    if (!content.includes('Markdown:')) {
      errors.push('Section Markdown manquante');
    }
    
    // Vérifier les URLs malformées
    const urlMatch = content.match(/URL:\s*\n(.*)/);
    if (urlMatch && urlMatch[1]) {
      const url = urlMatch[1].trim();
      if (!url.startsWith('http')) {
        warnings.push('URL ne commence pas par http');
      }
    }
    
    // Vérifier les titres vides
    const titleMatch = content.match(/Title:\s*\n(.*)/);
    if (titleMatch && !titleMatch[1].trim()) {
      warnings.push('Titre vide');
    }
    
    // Vérifier la cohérence des noms de fichiers avec le contenu
    if (filename.includes('outils-d-analyse')) {
      if (!content.toLowerCase().includes('analytics') && !content.toLowerCase().includes('analyse')) {
        warnings.push('Fichier analytics sans contenu analytics');
      }
    }
    
    return { errors, warnings };
  }
  
  normalizeMetadata(content) {
    let normalized = content;
    
    // Normaliser le format URL
    normalized = normalized.replace(/URL:\s*\n\s*(.*)/g, 'URL:\n$1');
    
    // Normaliser le format Title
    normalized = normalized.replace(/Title:\s*\n\s*(.*)/g, 'Title:\n$1');
    
    // Normaliser le format Markdown
    normalized = normalized.replace(/Markdown:\s*\n/g, 'Markdown:\n\n');
    
    return normalized;
  }
  
  fixSpecialCharacters(content) {
    let fixed = content;
    
    // Remplacer les caractères problématiques communs
    const replacements = {
      '\u2019': "'", // Apostrophe courbe
      '\u2018': "'", // Apostrophe courbe inverse
      '\u201C': '"', // Guillemet courbe gauche
      '\u201D': '"', // Guillemet courbe droit
      '\u2026': '...', // Points de suspension
      '\u2013': '-', // Tiret en
      '\u2014': '--', // Tiret em
      '\u00A9': '(c)', // Copyright
      '\u00AE': '(r)', // Registered
      '\u2122': '(tm)', // Trademark
      '\u00A0': ' ', // Espace insécable
    };
    
    Object.entries(replacements).forEach(([char, replacement]) => {
      if (fixed.includes(char)) {
        fixed = fixed.replace(new RegExp(char, 'g'), replacement);
      }
    });
    
    return fixed;
  }
  
  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        processed: this.results.processed,
        normalized: this.results.normalized,
        errorCount: this.results.errors.length,
        warningCount: this.results.warnings.length,
        improvementCount: this.results.improvements.length
      },
      details: {
        errors: this.results.errors,
        warnings: this.results.warnings,
        improvements: this.results.improvements
      }
    };
    
    // Sauvegarder le rapport
    const reportPath = path.join(__dirname, '../data/data-cleaning-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    // Afficher le résumé
    console.log('\n📊 RAPPORT DE NETTOYAGE');
    console.log('=' .repeat(40));
    console.log(`📁 Fichiers traités: ${report.summary.processed}`);
    console.log(`✨ Fichiers normalisés: ${report.summary.normalized}`);
    console.log(`❌ Erreurs: ${report.summary.errorCount}`);
    console.log(`⚠️  Avertissements: ${report.summary.warningCount}`);
    console.log(`💡 Améliorations: ${report.summary.improvementCount}`);
    
    if (report.summary.errorCount > 0) {
      console.log('\n❌ ERREURS DÉTECTÉES:');
      report.details.errors.slice(0, 10).forEach(error => {
        console.log(`   • ${error}`);
      });
      if (report.details.errors.length > 10) {
        console.log(`   ... et ${report.details.errors.length - 10} autres`);
      }
    }
    
    if (report.summary.warningCount > 0) {
      console.log('\n⚠️  AVERTISSEMENTS:');
      report.details.warnings.slice(0, 5).forEach(warning => {
        console.log(`   • ${warning}`);
      });
      if (report.details.warnings.length > 5) {
        console.log(`   ... et ${report.details.warnings.length - 5} autres`);
      }
    }
    
    console.log(`\n💾 Rapport détaillé: ${reportPath}`);
  }
}

// Ajouter une fonction de restauration de backup
class BackupRestorer {
  constructor() {
    this.backupPath = path.join(__dirname, '../data/backup-before-cleaning');
    this.fichesPath = path.join(__dirname, '../fiches-markdown-v2');
  }
  
  async restore() {
    console.log('🔄 Restauration depuis le backup...\n');
    
    try {
      const backupFiles = await fs.readdir(this.backupPath);
      let restored = 0;
      
      for (const file of backupFiles) {
        if (file.endsWith('.md')) {
          const backupFilePath = path.join(this.backupPath, file);
          const targetPath = path.join(this.fichesPath, file);
          
          const content = await fs.readFile(backupFilePath, 'utf-8');
          await fs.writeFile(targetPath, content, 'utf-8');
          restored++;
        }
      }
      
      console.log(`✅ ${restored} fichiers restaurés depuis le backup`);
      
    } catch (error) {
      console.error('❌ Erreur lors de la restauration:', error.message);
    }
  }
}

// Exécution
if (require.main === module) {
  const action = process.argv[2];
  
  if (action === 'restore') {
    const restorer = new BackupRestorer();
    restorer.restore().catch(console.error);
  } else {
    const cleaner = new DataCleaner();
    cleaner.clean().catch(console.error);
  }
}

module.exports = { DataCleaner, BackupRestorer };