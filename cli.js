#!/usr/bin/env node

/**
 * 🛠️ CLI Standalone DSFR-MCP
 * Utilisation des outils DSFR sans Claude Desktop
 */

const { program } = require('commander');
const chalk = require('chalk');
const inquirer = require('inquirer');
const fs = require('fs').promises;
const path = require('path');

// Import des services
const { MetricsService } = require('./src/services/metrics-service');
const DocumentationService = require('./src/services/documentation-v2-standalone');
const ValidationService = require('./src/services/validation');
const OptimizedGeneratorService = require('./src/services/generator-optimized');
const AccessibilityService = require('./src/services/accessibility');

// Version du CLI
const packageJson = require('./package.json');

// Services globaux
let docService, validationService, generatorService, accessibilityService, metricsService;

// Configuration du programme principal
program
  .name('dsfr-mcp')
  .description('🇫🇷 CLI pour les outils DSFR-MCP - Génération, validation et personnalisation')
  .version(packageJson.version)
  .option('-v, --verbose', 'mode verbeux')
  .option('--json', 'sortie au format JSON')
  .hook('preAction', async () => {
    await initializeServices();
  });

/**
 * Initialisation des services
 */
async function initializeServices() {
  try {
    const logger = {
      info: (msg) => console.log(chalk.blue('ℹ'), msg),
      error: (msg) => console.error(chalk.red('✗'), msg),
      warn: (msg) => console.warn(chalk.yellow('⚠'), msg)
    };

    metricsService = new MetricsService(logger);
    docService = new DocumentationService();
    validationService = new ValidationService();
    generatorService = new OptimizedGeneratorService();
    accessibilityService = new AccessibilityService();

    await docService.initialize();
    
    if (program.opts().verbose) {
      console.log(chalk.green('✓'), 'Services DSFR-MCP initialisés');
    }
  } catch (error) {
    console.error(chalk.red('✗'), 'Erreur initialisation:', error.message);
    process.exit(1);
  }
}

/**
 * Commande: Recherche de composants
 */
program
  .command('search')
  .alias('s')
  .description('🔍 Recherche des composants DSFR')
  .argument('<query>', 'terme de recherche')
  .option('-c, --category <category>', 'filtrer par catégorie')
  .option('-l, --limit <number>', 'nombre de résultats', '10')
  .action(async (query, options) => {
    const startTime = Date.now();
    
    try {
      const params = {
        query,
        category: options.category,
        limit: parseInt(options.limit)
      };

      const result = await docService.searchComponents(params);
      const responseTime = Date.now() - startTime;

      if (program.opts().json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(chalk.cyan('🔍 Recherche DSFR:'), query);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        if (result.content && result.content[0]) {
          const lines = result.content[0].text.split('\\n');
          lines.forEach(line => {
            if (line.includes('##')) {
              console.log(chalk.green(line));
            } else if (line.includes('Classes :')) {
              console.log(chalk.blue(line));
            } else if (line.trim()) {
              console.log(line);
            }
          });
        }
        
        console.log(chalk.gray(`\\n⚡ Temps: ${responseTime}ms`));
      }

      metricsService?.recordRequest('search_dsfr_components', responseTime, true);
    } catch (error) {
      console.error(chalk.red('✗'), 'Erreur de recherche:', error.message);
      metricsService?.recordRequest('search_dsfr_components', Date.now() - startTime, false);
    }
  });

/**
 * Commande: Génération de composants
 */
program
  .command('generate')
  .alias('g')
  .description('🛠️ Génère un composant DSFR')
  .argument('<component>', 'type de composant (button, card, form, etc.)')
  .option('-f, --framework <framework>', 'framework cible', 'vanilla')
  .option('--typescript', 'utiliser TypeScript')
  .option('--accessibility', 'inclure les features d\\'accessibilité')
  .option('-o, --output <file>', 'fichier de sortie')
  .action(async (component, options) => {
    const startTime = Date.now();
    
    try {
      const params = {
        component_type: component,
        framework: options.framework,
        options: {
          typescript: options.typescript || false,
          accessibility: options.accessibility || false
        }
      };

      const result = await generatorService.generateComponent(params);
      const responseTime = Date.now() - startTime;

      if (options.output) {
        await fs.writeFile(options.output, result.code || result.content);
        console.log(chalk.green('✓'), `Composant généré: ${options.output}`);
      } else if (program.opts().json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(chalk.cyan('🛠️ Composant généré:'), component);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        if (result.content && result.content[0]) {
          console.log(result.content[0].text);
        } else if (result.code) {
          console.log(result.code);
        }
        
        console.log(chalk.gray(`\\n⚡ Temps: ${responseTime}ms`));
      }

      metricsService?.recordRequest('generate_dsfr_component', responseTime, true);
    } catch (error) {
      console.error(chalk.red('✗'), 'Erreur de génération:', error.message);
      metricsService?.recordRequest('generate_dsfr_component', Date.now() - startTime, false);
    }
  });

/**
 * Commande: Validation HTML
 */
program
  .command('validate')
  .alias('v')
  .description('✅ Valide un fichier HTML DSFR')
  .argument('<file>', 'fichier HTML à valider')
  .option('--strict', 'mode strict')
  .action(async (file, options) => {
    const startTime = Date.now();
    
    try {
      const htmlContent = await fs.readFile(file, 'utf8');
      const params = {
        html_code: htmlContent,
        strict_mode: options.strict || false
      };

      const result = await validationService.validateHTML(params);
      const responseTime = Date.now() - startTime;

      if (program.opts().json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(chalk.cyan('✅ Validation DSFR:'), file);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        if (result.content && result.content[0]) {
          const lines = result.content[0].text.split('\\n');
          lines.forEach(line => {
            if (line.includes('✅')) {
              console.log(chalk.green(line));
            } else if (line.includes('❌')) {
              console.log(chalk.red(line));
            } else if (line.includes('⚠️')) {
              console.log(chalk.yellow(line));
            } else if (line.trim()) {
              console.log(line);
            }
          });
        }
        
        console.log(chalk.gray(`\\n⚡ Temps: ${responseTime}ms`));
      }

      metricsService?.recordRequest('validate_dsfr_html', responseTime, true);
    } catch (error) {
      console.error(chalk.red('✗'), 'Erreur de validation:', error.message);
      metricsService?.recordRequest('validate_dsfr_html', Date.now() - startTime, false);
    }
  });

/**
 * Commande: Vérification accessibilité
 */
program
  .command('accessibility')
  .alias('a11y')
  .description('♿ Vérifie l\\'accessibilité RGAA')
  .argument('<file>', 'fichier HTML à analyser')
  .option('--level <level>', 'niveau RGAA (A, AA, AAA)', 'AA')
  .action(async (file, options) => {
    const startTime = Date.now();
    
    try {
      const htmlContent = await fs.readFile(file, 'utf8');
      const params = {
        html_code: htmlContent,
        rgaa_level: options.level
      };

      const result = await accessibilityService.checkAccessibility(params);
      const responseTime = Date.now() - startTime;

      if (program.opts().json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(chalk.cyan('♿ Accessibilité RGAA:'), file);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        if (result.content && result.content[0]) {
          console.log(result.content[0].text);
        }
        
        console.log(chalk.gray(`\\n⚡ Temps: ${responseTime}ms`));
      }

      metricsService?.recordRequest('check_accessibility', responseTime, true);
    } catch (error) {
      console.error(chalk.red('✗'), 'Erreur d\\'analyse accessibilité:', error.message);
      metricsService?.recordRequest('check_accessibility', Date.now() - startTime, false);
    }
  });

/**
 * Commande: Mode interactif
 */
program
  .command('interactive')
  .alias('i')
  .description('🎮 Mode interactif pour explorer les outils')
  .action(async () => {
    console.log(chalk.cyan('🎮 Mode Interactif DSFR-MCP'));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const choices = [
      { name: '🔍 Rechercher des composants', value: 'search' },
      { name: '🛠️ Générer un composant', value: 'generate' },
      { name: '✅ Valider du HTML', value: 'validate' },
      { name: '♿ Vérifier l\\'accessibilité', value: 'accessibility' },
      { name: '📊 Afficher les statistiques', value: 'stats' },
      { name: '🚪 Quitter', value: 'exit' }
    ];

    while (true) {
      const { action } = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: 'Que voulez-vous faire ?',
          choices
        }
      ]);

      if (action === 'exit') break;

      switch (action) {
        case 'search':
          await interactiveSearch();
          break;
        case 'generate':
          await interactiveGenerate();
          break;
        case 'validate':
          await interactiveValidate();
          break;
        case 'accessibility':
          await interactiveAccessibility();
          break;
        case 'stats':
          await showStats();
          break;
      }
    }
    
    console.log(chalk.green('👋 À bientôt !'));
  });

/**
 * Mode interactif: Recherche
 */
async function interactiveSearch() {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'query',
      message: '🔍 Rechercher:',
      validate: input => input.length > 0 || 'Veuillez saisir un terme de recherche'
    },
    {
      type: 'list',
      name: 'category',
      message: 'Catégorie (optionnel):',
      choices: ['Toutes', 'forms', 'navigation', 'layout', 'actions', 'feedback']
    },
    {
      type: 'number',
      name: 'limit',
      message: 'Nombre de résultats:',
      default: 5
    }
  ]);

  const params = {
    query: answers.query,
    limit: answers.limit
  };

  if (answers.category !== 'Toutes') {
    params.category = answers.category;
  }

  try {
    const result = await docService.searchComponents(params);
    
    console.log(chalk.green('\\n📋 Résultats:'));
    if (result.content && result.content[0]) {
      console.log(result.content[0].text);
    }
  } catch (error) {
    console.error(chalk.red('✗'), 'Erreur:', error.message);
  }
}

/**
 * Mode interactif: Génération
 */
async function interactiveGenerate() {
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'component',
      message: '🛠️ Type de composant:',
      choices: ['button', 'card', 'form', 'table', 'modal', 'nav', 'header', 'footer']
    },
    {
      type: 'list',
      name: 'framework',
      message: 'Framework:',
      choices: ['vanilla', 'react', 'vue', 'angular'],
      default: 'vanilla'
    },
    {
      type: 'confirm',
      name: 'typescript',
      message: 'Utiliser TypeScript?',
      default: false
    },
    {
      type: 'confirm',
      name: 'accessibility',
      message: 'Inclure les features d\\'accessibilité?',
      default: true
    }
  ]);

  const params = {
    component_type: answers.component,
    framework: answers.framework,
    options: {
      typescript: answers.typescript,
      accessibility: answers.accessibility
    }
  };

  try {
    const result = await generatorService.generateComponent(params);
    
    console.log(chalk.green('\\n📄 Composant généré:'));
    if (result.content && result.content[0]) {
      console.log(result.content[0].text);
    }
  } catch (error) {
    console.error(chalk.red('✗'), 'Erreur:', error.message);
  }
}

/**
 * Mode interactif: Validation
 */
async function interactiveValidate() {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'file',
      message: '📄 Chemin du fichier HTML:',
      validate: async input => {
        try {
          await fs.access(input);
          return true;
        } catch {
          return 'Fichier non trouvé';
        }
      }
    },
    {
      type: 'confirm',
      name: 'strict',
      message: 'Mode strict?',
      default: true
    }
  ]);

  try {
    const htmlContent = await fs.readFile(answers.file, 'utf8');
    const params = {
      html_code: htmlContent,
      strict_mode: answers.strict
    };

    const result = await validationService.validateHTML(params);
    
    console.log(chalk.green('\\n📋 Validation:'));
    if (result.content && result.content[0]) {
      console.log(result.content[0].text);
    }
  } catch (error) {
    console.error(chalk.red('✗'), 'Erreur:', error.message);
  }
}

/**
 * Mode interactif: Accessibilité
 */
async function interactiveAccessibility() {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'file',
      message: '📄 Chemin du fichier HTML:',
      validate: async input => {
        try {
          await fs.access(input);
          return true;
        } catch {
          return 'Fichier non trouvé';
        }
      }
    },
    {
      type: 'list',
      name: 'level',
      message: 'Niveau RGAA:',
      choices: ['A', 'AA', 'AAA'],
      default: 'AA'
    }
  ]);

  try {
    const htmlContent = await fs.readFile(answers.file, 'utf8');
    const params = {
      html_code: htmlContent,
      rgaa_level: answers.level
    };

    const result = await accessibilityService.checkAccessibility(params);
    
    console.log(chalk.green('\\n♿ Accessibilité:'));
    if (result.content && result.content[0]) {
      console.log(result.content[0].text);
    }
  } catch (error) {
    console.error(chalk.red('✗'), 'Erreur:', error.message);
  }
}

/**
 * Affichage des statistiques
 */
async function showStats() {
  if (!metricsService) {
    console.log(chalk.yellow('⚠'), 'Statistiques non disponibles');
    return;
  }

  try {
    const metrics = metricsService.getDashboardMetrics();
    
    console.log(chalk.cyan('\\n📊 Statistiques DSFR-MCP:'));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(chalk.green('⏱️  Temps de fonctionnement:'), metrics.overview.uptime);
    console.log(chalk.green('📈 Requêtes totales:'), metrics.overview.requestsTotal);
    console.log(chalk.green('⚡ Temps de réponse moyen:'), `${metrics.overview.avgResponseTime}ms`);
    console.log(chalk.green('✅ Taux de succès:'), `${metrics.overview.successRate}%`);
    
    if (Object.keys(metrics.tools).length > 0) {
      console.log(chalk.cyan('\\n🛠️ Outils utilisés:'));
      Object.entries(metrics.tools).forEach(([tool, stats]) => {
        console.log(`  ${tool}: ${stats.usage} utilisations (${stats.avgResponseTime}ms avg)`);
      });
    }
  } catch (error) {
    console.error(chalk.red('✗'), 'Erreur statistiques:', error.message);
  }
}

/**
 * Commande: Informations système
 */
program
  .command('info')
  .description('ℹ️ Informations sur le système DSFR-MCP')
  .action(async () => {
    console.log(chalk.cyan('ℹ️ DSFR-MCP System Info'));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Version:', packageJson.version);
    console.log('Node.js:', process.version);
    console.log('Platform:', process.platform);
    console.log('Architecture:', process.arch);
    console.log('Working Directory:', process.cwd());
    
    try {
      const stats = await fs.stat('./data');
      console.log('Data Directory:', stats.isDirectory() ? '✅' : '❌');
    } catch {
      console.log('Data Directory:', '❌ Non trouvé');
    }
    
    console.log('\\n🎯 Fonctionnalités disponibles:');
    console.log('  🔍 Recherche de composants DSFR');
    console.log('  🛠️ Génération de code (React, Vue, Angular)');
    console.log('  ✅ Validation HTML DSFR');
    console.log('  ♿ Vérification accessibilité RGAA');
    console.log('  🎨 Création de thèmes personnalisés');
    console.log('  📊 Statistiques d\\'usage temps réel');
  });

/**
 * Gestion des erreurs non capturées
 */
process.on('uncaughtException', (error) => {
  console.error(chalk.red('💥 Erreur critique:'), error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error(chalk.red('💥 Promise rejetée:'), reason);
  process.exit(1);
});

/**
 * Message d'aide personnalisé
 */
program.on('--help', () => {
  console.log('');
  console.log(chalk.cyan('🎯 Exemples d\\'usage:'));
  console.log('  dsfr-mcp search bouton                    # Recherche des boutons');
  console.log('  dsfr-mcp generate button -f react --ts   # Génère un bouton React TypeScript');
  console.log('  dsfr-mcp validate ./page.html --strict   # Valide un fichier HTML');
  console.log('  dsfr-mcp a11y ./form.html --level AA     # Vérifie l\\'accessibilité');
  console.log('  dsfr-mcp interactive                     # Mode interactif');
  console.log('');
  console.log(chalk.yellow('💡 Conseil: Utilisez --json pour une sortie programmable'));
  console.log(chalk.yellow('🎮 Playground web: http://localhost:3001/playground'));
});

// Lancement du programme
program.parse();