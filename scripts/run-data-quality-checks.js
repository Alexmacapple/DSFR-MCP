#!/usr/bin/env node

/**
 * Script d'orchestration pour la validation continue de la qualité des données
 * Exécute tous les contrôles de qualité et génère un rapport consolidé
 * 
 * @author DSFR-MCP Team
 * @version 1.0.0
 */

const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');

class DataQualityOrchestrator {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      overall: { passed: true, errors: 0, warnings: 0 },
      checks: []
    };
    this.scriptsPath = path.join(__dirname);
    this.dataPath = path.join(__dirname, '../fiches-markdown-v2');
  }

  /**
   * Point d'entrée principal - exécute tous les contrôles
   */
  async run() {
    console.log(chalk.blue.bold('\n🔍 VALIDATION CONTINUE DE LA QUALITÉ DES DONNÉES'));
    console.log(chalk.blue('='.repeat(60)));
    console.log(chalk.gray(`Démarrage à ${new Date().toLocaleString()}`));
    console.log();

    try {
      // Vérifier que les données existent
      await this.checkDataDirectory();

      // Exécuter les contrôles séquentiellement
      await this.runIntegrityCheck();
      await this.runMetadataValidation();
      await this.runDuplicateAnalysis();

      // Générer le rapport final
      this.generateFinalReport();

      // Déterminer le code de sortie
      if (this.results.overall.passed) {
        console.log(chalk.green.bold('\n✅ TOUS LES CONTRÔLES ONT RÉUSSI!'));
        process.exit(0);
      } else {
        console.log(chalk.red.bold('\n❌ ÉCHEC DES CONTRÔLES DE QUALITÉ'));
        process.exit(1);
      }

    } catch (error) {
      console.error(chalk.red.bold('\n💥 ERREUR CRITIQUE:'), error.message);
      process.exit(1);
    }
  }

  /**
   * Vérifier que le répertoire de données existe
   */
  async checkDataDirectory() {
    try {
      const stats = await fs.stat(this.dataPath);
      if (!stats.isDirectory()) {
        throw new Error(`Le chemin ${this.dataPath} n'est pas un répertoire`);
      }
      
      const files = await fs.readdir(this.dataPath);
      const markdownFiles = files.filter(f => f.endsWith('.md'));
      
      if (markdownFiles.length === 0) {
        throw new Error('Aucun fichier markdown trouvé dans le répertoire de données');
      }
      
      console.log(chalk.green(`📁 Répertoire de données valide: ${markdownFiles.length} fiches trouvées`));
    } catch (error) {
      throw new Error(`Erreur d'accès aux données: ${error.message}`);
    }
  }

  /**
   * Exécute le contrôle d'intégrité des données
   */
  async runIntegrityCheck() {
    console.log(chalk.yellow('\n🔍 Contrôle d\'intégrité des données...'));
    
    const checkResult = {
      name: 'Intégrité des données',
      script: 'verify-data-integrity.js',
      passed: false,
      errors: [],
      warnings: [],
      stats: {}
    };

    try {
      // Import et exécution du script d'intégrité
      const IntegrityVerifier = this.loadScript('./verify-data-integrity.js');
      const verifier = new IntegrityVerifier();
      
      // Capture des logs pour analyse
      const originalConsoleLog = console.log;
      const originalConsoleError = console.error;
      let output = '';
      
      console.log = (...args) => { output += args.join(' ') + '\n'; };
      console.error = (...args) => { output += args.join(' ') + '\n'; };
      
      try {
        await verifier.verifyDirectory(this.dataPath);
        
        // Analyse des résultats
        if (verifier.errors && verifier.errors.length > 0) {
          checkResult.errors = verifier.errors;
          this.results.overall.errors += verifier.errors.length;
        }
        
        if (verifier.warnings && verifier.warnings.length > 0) {
          checkResult.warnings = verifier.warnings;
          this.results.overall.warnings += verifier.warnings.length;
        }
        
        checkResult.stats = verifier.stats || {};
        checkResult.passed = (!verifier.errors || verifier.errors.length === 0);
        
      } finally {
        console.log = originalConsoleLog;
        console.error = originalConsoleError;
      }

      if (checkResult.passed) {
        console.log(chalk.green('  ✅ Intégrité des données validée'));
      } else {
        console.log(chalk.red(`  ❌ ${checkResult.errors.length} erreurs d'intégrité détectées`));
        this.results.overall.passed = false;
      }

    } catch (error) {
      checkResult.errors = [`Erreur d'exécution: ${error.message}`];
      this.results.overall.errors++;
      this.results.overall.passed = false;
      console.log(chalk.red(`  ❌ Erreur lors du contrôle d'intégrité: ${error.message}`));
    }

    this.results.checks.push(checkResult);
  }

  /**
   * Exécute la validation des métadonnées YAML
   */
  async runMetadataValidation() {
    console.log(chalk.yellow('\n📋 Validation des métadonnées YAML...'));
    
    const checkResult = {
      name: 'Métadonnées YAML',
      script: 'validate-yaml-metadata.js',
      passed: false,
      errors: [],
      warnings: [],
      stats: {}
    };

    try {
      const MetadataValidator = this.loadScript('./validate-yaml-metadata.js');
      const validator = new MetadataValidator();
      
      // Capture des logs
      const originalConsoleLog = console.log;
      const originalConsoleError = console.error;
      let output = '';
      
      console.log = (...args) => { output += args.join(' ') + '\n'; };
      console.error = (...args) => { output += args.join(' ') + '\n'; };
      
      try {
        await validator.validateDirectory(this.dataPath);
        
        if (validator.errors && validator.errors.length > 0) {
          checkResult.errors = validator.errors;
          this.results.overall.errors += validator.errors.length;
        }
        
        checkResult.stats = validator.stats || {};
        checkResult.passed = (!validator.errors || validator.errors.length === 0);
        
      } finally {
        console.log = originalConsoleLog;
        console.error = originalConsoleError;
      }

      if (checkResult.passed) {
        console.log(chalk.green('  ✅ Métadonnées YAML validées'));
      } else {
        console.log(chalk.red(`  ❌ ${checkResult.errors.length} erreurs de métadonnées détectées`));
        this.results.overall.passed = false;
      }

    } catch (error) {
      checkResult.errors = [`Erreur d'exécution: ${error.message}`];
      this.results.overall.errors++;
      this.results.overall.passed = false;
      console.log(chalk.red(`  ❌ Erreur lors de la validation des métadonnées: ${error.message}`));
    }

    this.results.checks.push(checkResult);
  }

  /**
   * Exécute l'analyse des doublons
   */
  async runDuplicateAnalysis() {
    console.log(chalk.yellow('\n🔄 Analyse des doublons...'));
    
    const checkResult = {
      name: 'Analyse des doublons',
      script: 'analyze-duplicates.js',
      passed: false,
      errors: [],
      warnings: [],
      stats: {}
    };

    try {
      const DuplicateAnalyzer = this.loadScript('./analyze-duplicates.js');
      const analyzer = new DuplicateAnalyzer();
      
      await analyzer.analyze();
      
      // Vérifier s'il y a des doublons
      if (analyzer.results && analyzer.results.duplicateGroups) {
        const duplicateCount = analyzer.results.duplicateGroups.length;
        
        if (duplicateCount > 0) {
          checkResult.errors = [`${duplicateCount} groupes de doublons détectés`];
          checkResult.warnings = analyzer.results.duplicateGroups.map(group => 
            `Doublon: ${group.files.join(', ')}`
          );
          this.results.overall.errors += duplicateCount;
          this.results.overall.warnings += checkResult.warnings.length;
        }
        
        checkResult.stats = {
          totalFiles: analyzer.results.totalFiles,
          duplicateGroups: duplicateCount,
          uniqueContents: analyzer.results.uniqueContents ? analyzer.results.uniqueContents.size : 0
        };
        
        checkResult.passed = (duplicateCount === 0);
      }

      if (checkResult.passed) {
        console.log(chalk.green('  ✅ Aucun doublon détecté'));
      } else {
        console.log(chalk.red(`  ❌ ${checkResult.errors.length} groupes de doublons détectés`));
        this.results.overall.passed = false;
      }

    } catch (error) {
      checkResult.errors = [`Erreur d'exécution: ${error.message}`];
      this.results.overall.errors++;
      this.results.overall.passed = false;
      console.log(chalk.red(`  ❌ Erreur lors de l'analyse des doublons: ${error.message}`));
    }

    this.results.checks.push(checkResult);
  }

  /**
   * Charge un script de manière sécurisée
   */
  loadScript(scriptPath) {
    try {
      const fullPath = path.resolve(this.scriptsPath, scriptPath);
      delete require.cache[fullPath]; // Éviter le cache de require
      return require(fullPath);
    } catch (error) {
      throw new Error(`Impossible de charger le script ${scriptPath}: ${error.message}`);
    }
  }

  /**
   * Génère le rapport final consolidé
   */
  generateFinalReport() {
    console.log(chalk.blue.bold('\n📊 RAPPORT DE QUALITÉ DES DONNÉES'));
    console.log(chalk.blue('-'.repeat(40)));
    
    // Statistiques globales
    console.log(chalk.white(`Timestamp: ${this.results.timestamp}`));
    console.log(chalk.white(`Erreurs totales: ${this.results.overall.errors}`));
    console.log(chalk.white(`Avertissements: ${this.results.overall.warnings}`));
    console.log(chalk.white(`Statut global: ${this.results.overall.passed ? chalk.green('RÉUSSI') : chalk.red('ÉCHEC')}`));
    
    // Détails par contrôle
    console.log(chalk.blue('\nDétail des contrôles:'));
    this.results.checks.forEach(check => {
      const status = check.passed ? chalk.green('✅') : chalk.red('❌');
      console.log(`  ${status} ${check.name}`);
      
      if (check.errors.length > 0) {
        check.errors.slice(0, 5).forEach(error => {
          const errorMsg = typeof error === 'object' ? JSON.stringify(error) : String(error);
          console.log(chalk.red(`    ❗ ${errorMsg}`));
        });
        if (check.errors.length > 5) {
          console.log(chalk.red(`    ❗ ... et ${check.errors.length - 5} autres erreurs`));
        }
      }
      
      if (check.warnings.length > 0 && check.warnings.length <= 5) {
        check.warnings.forEach(warning => {
          console.log(chalk.yellow(`    ⚠️  ${warning}`));
        });
      }
      
      // Afficher quelques statistiques clés
      if (check.stats && Object.keys(check.stats).length > 0) {
        const statsStr = Object.entries(check.stats)
          .slice(0, 3) // Limiter à 3 stats principales
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ');
        console.log(chalk.gray(`    📈 ${statsStr}`));
      }
    });

    // Sauvegarder le rapport dans un fichier JSON
    this.saveReportToFile();
  }

  /**
   * Sauvegarde le rapport dans un fichier JSON
   */
  async saveReportToFile() {
    try {
      const reportPath = path.join(__dirname, '../data/data-quality-report.json');
      await fs.writeFile(reportPath, JSON.stringify(this.results, null, 2));
      console.log(chalk.gray(`\n📁 Rapport sauvegardé: ${reportPath}`));
    } catch (error) {
      console.warn(chalk.yellow(`⚠️  Impossible de sauvegarder le rapport: ${error.message}`));
    }
  }
}

// Exécution directe du script
if (require.main === module) {
  const orchestrator = new DataQualityOrchestrator();
  orchestrator.run().catch(error => {
    console.error(chalk.red.bold('💥 ERREUR FATALE:'), error);
    process.exit(1);
  });
}

module.exports = DataQualityOrchestrator;