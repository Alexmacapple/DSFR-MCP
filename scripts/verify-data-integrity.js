#!/usr/bin/env node

/**
 * Script de vérification de l'intégrité des données après nettoyage
 * Valide la structure, l'accessibilité et la cohérence des fiches markdown
 */

const fs = require('fs').promises;
const path = require('path');

class DataIntegrityVerifier {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.stats = {
      totalFiles: 0,
      validFiles: 0,
      invalidFiles: 0,
      missingMetadata: 0,
      accessibilityIssues: 0
    };
  }

  async verifyDirectory(dirPath) {
    console.log('\u{1F50D} Début de la vérification de l\'intégrité des données...\n');

    try {
      const files = await fs.readdir(dirPath);
      const markdownFiles = files.filter(file => file.endsWith('.md'));
      
      this.stats.totalFiles = markdownFiles.length;
      console.log(`\u{1F4C1} ${this.stats.totalFiles} fichiers markdown trouvés\n`);

      for (const file of markdownFiles) {
        const filePath = path.join(dirPath, file);
        await this.verifyFile(filePath, file);
      }

      this.generateReport();
    } catch (error) {
      console.error('\u{274C} Erreur lors de la vérification:', error.message);
      process.exit(1);
    }
  }

  async verifyFile(filePath, fileName) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n');

      // Vérifications de base
      this.verifyFileStructure(fileName, lines);
      this.verifyMetadata(fileName, lines);
      this.verifyAccessibility(fileName, content);
      this.verifyHtmlSyntax(fileName, content);
      this.verifyLinks(fileName, content);

      this.stats.validFiles++;
    } catch (error) {
      this.addError(fileName, `Erreur de lecture: ${error.message}`);
      this.stats.invalidFiles++;
    }
  }

  verifyFileStructure(fileName, lines) {
    // Vérifier la présence des sections obligatoires
    const requiredSections = ['URL:', 'Title:', 'Markdown:'];
    const foundSections = [];

    for (const line of lines) {
      for (const section of requiredSections) {
        if (line.startsWith(section)) {
          foundSections.push(section);
        }
      }
    }

    const missingSections = requiredSections.filter(section => 
      !foundSections.includes(section)
    );

    if (missingSections.length > 0) {
      this.addError(fileName, `Sections manquantes: ${missingSections.join(', ')}`);
    }

    // Vérifier la structure des titres
    const titleLines = lines.filter(line => line.startsWith('#'));
    if (titleLines.length === 0) {
      this.addWarning(fileName, 'Aucun titre (h1-h6) trouvé');
    }

    // Vérifier l'ordre hiérarchique des titres (plus permissif)
    let previousLevel = 0;
    for (const titleLine of titleLines) {
      const match = titleLine.match(/^#+/);
      if (match) {
        const level = match[0].length;
        // Permettre les sauts normaux dans la hiérarchie (h1 vers h3 est acceptable)
        if (level > previousLevel + 2) {
          this.addWarning(fileName, `Saut de niveau de titre important détecté: h${previousLevel} vers h${level}`);
        }
        previousLevel = Math.max(previousLevel, level);
      }
    }
  }

  verifyMetadata(fileName, lines) {
    let hasUrl = false;
    let hasTitle = false;
    let urlValid = false;
    let titleValid = false;

    for (let i = 0; i < Math.min(10, lines.length); i++) {
      const line = lines[i];
      
      if (line.trim().startsWith('URL:')) {
        hasUrl = true;
        // Vérifier la ligne suivante pour l'URL si elle est sur la ligne suivante
        let url = line.substring(4).trim();
        if (!url && i + 1 < lines.length) {
          url = lines[i + 1].trim();
        }
        if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
          urlValid = true;
        }
      }
      
      if (line.trim().startsWith('Title:')) {
        hasTitle = true;
        // Vérifier la ligne suivante pour le titre si il est sur la ligne suivante
        let title = line.substring(6).trim();
        if (!title && i + 1 < lines.length) {
          title = lines[i + 1].trim();
        }
        if (title && title.length > 0) {
          titleValid = true;
        }
      }
    }

    if (!hasUrl || !urlValid) {
      this.addError(fileName, 'URL manquante ou invalide');
      this.stats.missingMetadata++;
    }

    if (!hasTitle || !titleValid) {
      this.addError(fileName, 'Titre manquant ou invalide');
      this.stats.missingMetadata++;
    }
  }

  verifyAccessibility(fileName, content) {
    const accessibilityIssues = [];

    // Vérifier les images sans alt
    const imgRegex = /<img[^>]*>/gi;
    const images = content.match(imgRegex) || [];
    
    for (const img of images) {
      if (!img.includes('alt=')) {
        accessibilityIssues.push('Image sans attribut alt');
      } else {
        const altMatch = img.match(/alt=["']([^"']*)["']/);
        if (!altMatch || !altMatch[1].trim()) {
          accessibilityIssues.push('Image avec alt vide');
        }
      }
    }

    // Vérifier les boutons sans titre ou label
    const buttonRegex = /<button[^>]*>/gi;
    const buttons = content.match(buttonRegex) || [];
    
    for (const button of buttons) {
      if (button.includes('fr-icon-') && !button.includes('title=')) {
        accessibilityIssues.push('Bouton icône sans title');
      }
    }

    // Vérifier les liens sans texte descriptif
    const linkRegex = /\[([^\]]*)\]\([^)]*\)/g;
    const links = content.match(linkRegex) || [];
    
    for (const link of links) {
      const textMatch = link.match(/\[([^\]]*)\]/);
      if (textMatch && (!textMatch[1] || textMatch[1].trim().length < 2)) {
        accessibilityIssues.push('Lien sans texte descriptif');
      }
    }

    if (accessibilityIssues.length > 0) {
      this.stats.accessibilityIssues += accessibilityIssues.length;
      for (const issue of accessibilityIssues) {
        this.addWarning(fileName, `Accessibilité: ${issue}`);
      }
    }
  }

  verifyHtmlSyntax(fileName, content) {
    // Vérifier la fermeture des balises
    const openTags = content.match(/<[^\/][^>]*>/g) || [];
    const closeTags = content.match(/<\/[^>]*>/g) || [];
    
    const openTagNames = openTags
      .filter(tag => !tag.endsWith('/>') && !tag.match(/<(br|hr|img|input|meta|link)/))
      .map(tag => {
        const match = tag.match(/<(\w+)/);
        return match ? match[1].toLowerCase() : null;
      })
      .filter(name => name !== null);
      
    const closeTagNames = closeTags
      .map(tag => {
        const match = tag.match(/<\/(\w+)/);
        return match ? match[1].toLowerCase() : null;
      })
      .filter(name => name !== null);

    // Compter les occurrences
    const openCounts = {};
    const closeCounts = {};

    openTagNames.forEach(tag => {
      openCounts[tag] = (openCounts[tag] || 0) + 1;
    });

    closeTagNames.forEach(tag => {
      closeCounts[tag] = (closeCounts[tag] || 0) + 1;
    });

    // Vérifier l'équilibre
    for (const tag in openCounts) {
      if (openCounts[tag] !== (closeCounts[tag] || 0)) {
        this.addWarning(fileName, `Balises non équilibrées: <${tag}> (${openCounts[tag]} ouvertures, ${closeCounts[tag] || 0} fermetures)`);
      }
    }

    // Vérifier les attributs class DSFR
    const classRegex = /class=["']([^"']*)["']/g;
    const classes = content.match(classRegex) || [];
    
    for (const classAttr of classes) {
      const classMatch = classAttr.match(/class=["']([^"']*)["']/);
      if (classMatch && classMatch[1]) {
        const classList = classMatch[1].split(' ');
        for (const cls of classList) {
          if (cls.startsWith('fr-') && cls.includes('--')) {
            // Vérifier la syntaxe des modificateurs DSFR (plus permissif)
            if (!cls.match(/^fr-[\w-@]+--[\w-@]+$/)) {
              this.addWarning(fileName, `Classe DSFR suspecte: ${cls}`);
            }
          }
        }
      }
    }
  }

  verifyLinks(fileName, content) {
    // Vérifier les liens markdown
    const markdownLinkRegex = /\[([^\]]*)\]\(([^)]*)\)/g;
    let match;
    
    while ((match = markdownLinkRegex.exec(content)) !== null) {
      const linkText = match[1];
      const linkUrl = match[2];
      
      if (linkUrl.includes('[') || linkUrl.includes(']')) {
        this.addWarning(fileName, `Lien avec URL suspecte: ${linkUrl}`);
      }
      
      if (linkText.includes('[') || linkText.includes(']')) {
        this.addWarning(fileName, `Lien avec texte suspect: ${linkText}`);
      }
    }

    // Vérifier les liens HTML
    const htmlLinkRegex = /<a[^>]*href=["']([^"']*)["'][^>]*>/g;
    
    while ((match = htmlLinkRegex.exec(content)) !== null) {
      const href = match[1];
      
      if (href.includes('[') || href.includes(']')) {
        this.addWarning(fileName, `Lien HTML avec href suspect: ${href}`);
      }
    }
  }

  addError(fileName, message) {
    this.errors.push({ file: fileName, message });
  }

  addWarning(fileName, message) {
    this.warnings.push({ file: fileName, message });
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('\u{1F4CA} RAPPORT DE VÉRIFICATION D\'INTÉGRITÉ');
    console.log('='.repeat(60));

    // Statistiques globales
    console.log('\n\u{1F4C8} Statistiques globales:');
    console.log(`  Fichiers analysés: ${this.stats.totalFiles}`);
    console.log(`  Fichiers valides: ${this.stats.validFiles}`);
    console.log(`  Fichiers avec erreurs: ${this.stats.invalidFiles}`);
    console.log(`  Problèmes de métadonnées: ${this.stats.missingMetadata}`);
    console.log(`  Problèmes d'accessibilité: ${this.stats.accessibilityIssues}`);

    // Calcul du taux de réussite
    const successRate = ((this.stats.validFiles / this.stats.totalFiles) * 100).toFixed(1);
    console.log(`  Taux de réussite: ${successRate}%`);

    // Erreurs critiques
    if (this.errors.length > 0) {
      console.log(`\n\u{274C} Erreurs critiques (${this.errors.length}):`);
      const errorsByFile = this.groupByFile(this.errors);
      for (const [file, errors] of Object.entries(errorsByFile)) {
        console.log(`  ${file}:`);
        errors.forEach(error => console.log(`    - ${error.message}`));
      }
    }

    // Avertissements
    if (this.warnings.length > 0) {
      console.log(`\n\u{26A0}\u{FE0F} Avertissements (${this.warnings.length}):`);
      const warningsByFile = this.groupByFile(this.warnings);
      for (const [file, warnings] of Object.entries(warningsByFile)) {
        console.log(`  ${file}:`);
        warnings.slice(0, 5).forEach(warning => console.log(`    - ${warning.message}`));
        if (warnings.length > 5) {
          console.log(`    ... et ${warnings.length - 5} autres`);
        }
      }
    }

    // Recommandations
    console.log('\n\u{1F4A1} Recommandations:');
    if (this.errors.length === 0) {
      console.log('  \u{2705} Aucune erreur critique détectée');
    } else {
      console.log('  \u{1F6A8} Corriger les erreurs critiques avant de continuer');
    }

    if (this.stats.accessibilityIssues > 0) {
      console.log('  \u{267F} Améliorer l\'accessibilité des composants');
    }

    if (this.warnings.length > 0) {
      console.log('  \u{1F527} Examiner et corriger les avertissements si nécessaire');
    }

    // Conclusion
    console.log('\n' + '='.repeat(60));
    if (this.errors.length === 0 && this.warnings.length < 10) {
      console.log('\u{2705} INTÉGRITÉ DES DONNÉES VALIDÉE');
      console.log('Les données sont prêtes pour la phase suivante.');
    } else if (this.errors.length === 0) {
      console.log('\u{26A0}\u{FE0F} INTÉGRITÉ ACCEPTABLE AVEC AVERTISSEMENTS');
      console.log('Les données peuvent être utilisées mais des améliorations sont recommandées.');
    } else {
      console.log('\u{274C} PROBLÈMES D\'INTÉGRITÉ DÉTECTÉS');
      console.log('Correction requise avant de continuer.');
      process.exit(1);
    }
    console.log('='.repeat(60));
  }

  groupByFile(items) {
    return items.reduce((acc, item) => {
      if (!acc[item.file]) {
        acc[item.file] = [];
      }
      acc[item.file].push(item);
      return acc;
    }, {});
  }
}

// Exécution du script
async function main() {
  const verifier = new DataIntegrityVerifier();
  const dataDir = path.join(__dirname, '..', 'fiches-markdown-v2');
  
  await verifier.verifyDirectory(dataDir);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = DataIntegrityVerifier;