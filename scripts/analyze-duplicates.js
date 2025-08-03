// Script d'analyse des fiches dupliquées
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class DuplicateAnalyzer {
  constructor() {
    this.fichesPath = path.join(__dirname, '../fiches-markdown-v2');
    this.results = {
      totalFiles: 0,
      analyticsFiles: 0,
      duplicateGroups: [],
      uniqueContents: new Map(),
      recommendations: []
    };
  }

  async analyze() {
    console.log('🔍 Analyse des fiches dupliquées...\n');
    
    try {
      const files = await fs.readdir(this.fichesPath);
      this.results.totalFiles = files.length;
      
      // Analyser toutes les fiches
      for (const file of files) {
        if (file.endsWith('.md')) {
          await this.analyzeFile(file);
        }
      }
      
      // Identifier les duplicatas
      this.identifyDuplicates();
      
      // Générer des recommandations
      this.generateRecommendations();
      
      // Afficher le rapport
      this.displayReport();
      
      // Sauvegarder le rapport
      await this.saveReport();
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'analyse:', error.message);
    }
  }
  
  async analyzeFile(filename) {
    const filePath = path.join(this.fichesPath, filename);
    const content = await fs.readFile(filePath, 'utf-8');
    
    // Extraire les métadonnées
    const metadata = this.extractMetadata(content, filename);
    
    // Compter les fiches analytics
    if (filename.includes('outils-d-analyse')) {
      this.results.analyticsFiles++;
    }
    
    // Créer un hash du contenu principal (sans URL/titre)
    const contentHash = this.hashContent(content);
    
    if (!this.results.uniqueContents.has(contentHash)) {
      this.results.uniqueContents.set(contentHash, []);
    }
    
    this.results.uniqueContents.get(contentHash).push({
      filename,
      metadata,
      size: content.length,
      isAnalytics: filename.includes('outils-d-analyse')
    });
  }
  
  extractMetadata(content, filename) {
    const lines = content.split('\n');
    const metadata = {
      url: '',
      title: '',
      component: '',
      category: ''
    };
    
    // Extraire URL
    const urlMatch = content.match(/URL:\s*\n(.*)/);
    if (urlMatch) {
      metadata.url = urlMatch[1].trim();
      
      // Extraire le composant de l'URL
      const componentMatch = metadata.url.match(/\/component\/([^/?]+)/);
      if (componentMatch) {
        metadata.component = componentMatch[1];
      }
    }
    
    // Extraire titre
    const titleMatch = content.match(/Title:\s*\n(.*)/);
    if (titleMatch) {
      metadata.title = titleMatch[1].trim();
    }
    
    // Déterminer la catégorie du fichier
    if (filename.includes('outils-d-analyse')) {
      metadata.category = 'analytics';
    } else if (filename.includes('fondamentaux')) {
      metadata.category = 'core';
    } else if (filename.includes('pictogrammes')) {
      metadata.category = 'pictograms';
    } else if (filename.includes('icones')) {
      metadata.category = 'icons';
    } else if (filename.includes('utilitaires')) {
      metadata.category = 'utilities';
    } else if (filename.includes('modele')) {
      metadata.category = 'templates';
    } else {
      metadata.category = 'components';
    }
    
    return metadata;
  }
  
  hashContent(content) {
    // Normaliser le contenu pour la comparaison
    const normalizedContent = content
      .replace(/URL:\s*\n.*\n/g, '') // Supprimer URL
      .replace(/Title:\s*\n.*\n/g, '') // Supprimer titre
      .replace(/fiche-\d+-/g, 'fiche-XXX-') // Normaliser numéros de fiche
      .replace(/\s+/g, ' ') // Normaliser espaces
      .trim();
      
    return crypto.createHash('md5').update(normalizedContent).digest('hex');
  }
  
  identifyDuplicates() {
    this.results.uniqueContents.forEach((files, hash) => {
      if (files.length > 1) {
        // Vérifier si c'est un vrai duplicata ou des variations légitimes
        const components = new Set(files.map(f => f.metadata.component).filter(c => c));
        const categories = new Set(files.map(f => f.metadata.category));
        
        this.results.duplicateGroups.push({
          hash,
          count: files.length,
          files,
          components: Array.from(components),
          categories: Array.from(categories),
          isDuplicateContent: components.size <= 1, // Vraiment dupliqué si même composant
          avgSize: Math.round(files.reduce((sum, f) => sum + f.size, 0) / files.length)
        });
      }
    });
    
    // Trier par nombre de duplicatas
    this.results.duplicateGroups.sort((a, b) => b.count - a.count);
  }
  
  generateRecommendations() {
    const analytics = this.results.duplicateGroups.filter(g => 
      g.files.every(f => f.isAnalytics)
    );
    
    const realDuplicates = this.results.duplicateGroups.filter(g => 
      g.isDuplicateContent && !g.files.every(f => f.isAnalytics)
    );
    
    this.results.recommendations = [
      {
        type: 'analytics_consolidation',
        title: 'Consolider les fiches analytics',
        description: `${analytics.length} groupes de fiches analytics peuvent être restructurées`,
        action: 'Créer une structure hiérarchique pour les analytics par composant',
        impact: 'high',
        savings: analytics.reduce((sum, g) => sum + (g.count - 1), 0) + ' fichiers'
      },
      {
        type: 'true_duplicates',
        title: 'Supprimer les vrais duplicatas',
        description: `${realDuplicates.length} groupes de vrais duplicatas identifiés`,
        action: 'Supprimer les fichiers dupliqués en gardant la version la plus récente',
        impact: 'medium',
        savings: realDuplicates.reduce((sum, g) => sum + (g.count - 1), 0) + ' fichiers'
      },
      {
        type: 'file_naming',
        title: 'Standardiser la nomenclature',
        description: 'Améliorer la cohérence des noms de fichiers',
        action: 'Appliquer une convention de nommage uniforme',
        impact: 'low',
        savings: 'Meilleure organisation'
      }
    ];
  }
  
  displayReport() {
    console.log('📊 RAPPORT D\'ANALYSE DES DUPLICATAS\n');
    console.log('=' .repeat(50));
    
    console.log(`📁 Total de fiches: ${this.results.totalFiles}`);
    console.log(`📈 Fiches analytics: ${this.results.analyticsFiles}`);
    console.log(`🔄 Groupes de contenus uniques: ${this.results.uniqueContents.size}`);
    console.log(`⚠️  Groupes avec duplicatas: ${this.results.duplicateGroups.length}\n`);
    
    // Top 5 des groupes les plus dupliqués
    console.log('🏆 TOP 5 DES GROUPES LES PLUS DUPLIQUÉS:\n');
    this.results.duplicateGroups.slice(0, 5).forEach((group, index) => {
      console.log(`${index + 1}. ${group.count} fichiers (${group.avgSize} bytes en moyenne)`);
      console.log(`   Catégories: ${group.categories.join(', ')}`);
      console.log(`   Composants: ${group.components.length ? group.components.join(', ') : 'N/A'}`);
      console.log(`   Exemples: ${group.files.slice(0, 3).map(f => f.filename).join(', ')}`);
      console.log('');
    });
    
    // Recommandations
    console.log('💡 RECOMMANDATIONS:\n');
    this.results.recommendations.forEach((rec, index) => {
      const impactIcon = rec.impact === 'high' ? '🔥' : rec.impact === 'medium' ? '⚡' : '💡';
      console.log(`${index + 1}. ${impactIcon} ${rec.title}`);
      console.log(`   ${rec.description}`);
      console.log(`   Action: ${rec.action}`);
      console.log(`   Économies: ${rec.savings}\n`);
    });
  }
  
  async saveReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalFiles: this.results.totalFiles,
        analyticsFiles: this.results.analyticsFiles,
        uniqueContents: this.results.uniqueContents.size,
        duplicateGroups: this.results.duplicateGroups.length
      },
      duplicateGroups: this.results.duplicateGroups,
      recommendations: this.results.recommendations
    };
    
    const reportPath = path.join(__dirname, '../data/duplicate-analysis-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(`💾 Rapport sauvegardé: ${reportPath}\n`);
  }
}

// Exécution
if (require.main === module) {
  const analyzer = new DuplicateAnalyzer();
  analyzer.analyze().catch(console.error);
}

module.exports = DuplicateAnalyzer;