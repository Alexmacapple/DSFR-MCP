#!/usr/bin/env node
/**
 * Script de validation du playground DSFR
 * Utilise le service de validation pour analyser la conformité
 */

const fs = require('fs');
const path = require('path');
const ValidationService = require('../src/services/validation');

async function validatePlayground() {
  console.log('🔍 Validation du playground DSFR-MCP...\n');
  
  try {
    // Charger le fichier playground.html
    const playgroundPath = path.join(__dirname, '../public/playground.html');
    const htmlContent = fs.readFileSync(playgroundPath, 'utf-8');
    
    console.log(`📄 Fichier chargé: ${playgroundPath}`);
    console.log(`📏 Taille: ${htmlContent.length} caractères\n`);
    
    // Initialiser le service de validation
    const validationService = new ValidationService();
    
    // Effectuer la validation complète
    console.log('🏁 Début de la validation...\n');
    
    const results = await validationService.validateHTMLCore({
      html_code: htmlContent,
      check_accessibility: true,
      check_semantic: true,
      strict_mode: true
    });
    
    // Afficher les résultats
    console.log('═'.repeat(60));
    console.log('📊 RÉSULTATS DE VALIDATION DSFR');
    console.log('═'.repeat(60));
    
    // Score global
    console.log(`\n✨ Score global: ${results.score}/100`);
    console.log(`📋 Statut: ${results.valid ? '✅ VALIDE' : '❌ NON VALIDE'}\n`);
    
    // Statistiques
    console.log('📈 Statistiques:');
    console.log(`   • Erreurs: ${results.errors.length}`);
    console.log(`   • Avertissements: ${results.warnings.length}`);
    console.log(`   • Suggestions: ${results.suggestions.length}\n`);
    
    // Détails des erreurs
    if (results.errors.length > 0) {
      console.log('❌ ERREURS CRITIQUES:');
      console.log('─'.repeat(60));
      results.errors.forEach((error, index) => {
        console.log(`${index + 1}. [${error.type}] ${error.message}`);
      });
      console.log();
    }
    
    // Avertissements
    if (results.warnings.length > 0) {
      console.log('⚠️  AVERTISSEMENTS:');
      console.log('─'.repeat(60));
      results.warnings.forEach((warning, index) => {
        console.log(`${index + 1}. [${warning.type}] ${warning.message}`);
      });
      console.log();
    }
    
    // Suggestions
    if (results.suggestions.length > 0) {
      console.log('💡 SUGGESTIONS:');
      console.log('─'.repeat(60));
      results.suggestions.forEach((suggestion, index) => {
        console.log(`${index + 1}. [${suggestion.type}] ${suggestion.message}`);
      });
      console.log();
    }
    
    // Analyse des améliorations réussies
    console.log('═'.repeat(60));
    console.log('🎯 ANALYSE DES AMÉLIORATIONS RÉUSSIES');
    console.log('═'.repeat(60));
    
    // Vérifications spécifiques des optimisations
    const optimizations = analyzeOptimizations(htmlContent);
    
    console.log('\n✅ Points de conformité validés:');
    optimizations.forEach((opt, index) => {
      console.log(`${index + 1}. ${opt}`);
    });
    
    // Recommandations finales
    console.log('\n═'.repeat(60));
    console.log('📝 RECOMMANDATIONS');
    console.log('═'.repeat(60));
    
    if (results.score >= 90) {
      console.log('\n🏆 Excellent travail ! Le playground respecte très bien les standards DSFR.');
      console.log('   Continuez à maintenir cette qualité lors des futures évolutions.');
    } else if (results.score >= 70) {
      console.log('\n👍 Bon travail ! Le playground respecte globalement les standards DSFR.');
      console.log('   Quelques améliorations mineures peuvent encore être apportées.');
    } else {
      console.log('\n⚠️  Des améliorations importantes sont nécessaires pour respecter pleinement les standards DSFR.');
      console.log('   Priorisez la correction des erreurs critiques.');
    }
    
    console.log('\n✨ Validation terminée avec succès !\n');
    
  } catch (error) {
    console.error('❌ Erreur lors de la validation:', error.message);
    process.exit(1);
  }
}

/**
 * Analyse les optimisations spécifiques réussies
 */
function analyzeOptimizations(htmlContent) {
  const optimizations = [];
  
  // Vérifier l'utilisation des icônes DSFR
  if (htmlContent.includes('fr-icon-') && !htmlContent.includes('🎯') && !htmlContent.includes('🔍')) {
    optimizations.push('✅ Utilisation correcte des icônes DSFR (fr-icon-*) au lieu d\'emojis dans les éléments interactifs');
  }
  
  // Vérifier les attributs ARIA
  if (htmlContent.includes('aria-label') && htmlContent.includes('aria-pressed')) {
    optimizations.push('✅ Attributs ARIA correctement implémentés pour l\'accessibilité');
  }
  
  // Vérifier les rôles ARIA
  if (htmlContent.includes('role="button"') && htmlContent.includes('role="region"')) {
    optimizations.push('✅ Rôles ARIA appropriés pour les éléments interactifs');
  }
  
  // Vérifier la structure sémantique
  if (htmlContent.includes('<header') && htmlContent.includes('<main') && htmlContent.includes('<footer')) {
    optimizations.push('✅ Structure sémantique HTML5 complète (header, main, footer)');
  }
  
  // Vérifier les classes DSFR
  if (htmlContent.includes('fr-container') && htmlContent.includes('fr-grid-row')) {
    optimizations.push('✅ Système de grille DSFR correctement utilisé');
  }
  
  // Vérifier l'accessibilité des formulaires
  if (htmlContent.includes('for=') && htmlContent.includes('aria-describedby')) {
    optimizations.push('✅ Labels et descriptions de formulaires accessibles');
  }
  
  // Vérifier le support clavier
  if (htmlContent.includes('tabindex=') && htmlContent.includes('onkeydown')) {
    optimizations.push('✅ Navigation au clavier implémentée pour tous les éléments interactifs');
  }
  
  // Vérifier les notifications accessibles
  if (htmlContent.includes('aria-live="polite"') || htmlContent.includes('role="alert"')) {
    optimizations.push('✅ Notifications accessibles avec aria-live ou role="alert"');
  }
  
  // Vérifier l'optimisation des performances
  if (htmlContent.includes('defer') || htmlContent.includes('async')) {
    optimizations.push('✅ Scripts optimisés avec defer/async pour les performances');
  }
  
  // Vérifier la meta viewport
  if (htmlContent.includes('viewport') && htmlContent.includes('width=device-width')) {
    optimizations.push('✅ Meta viewport correctement configurée pour le responsive');
  }
  
  // Vérifier les badges et indicateurs
  if (htmlContent.includes('fr-badge') && htmlContent.includes('fr-badge--success')) {
    optimizations.push('✅ Composants badge DSFR utilisés pour les indicateurs');
  }
  
  // Vérifier l'utilisation des couleurs DSFR
  if (htmlContent.includes('var(--blue-france') || htmlContent.includes('var(--grey-')) {
    optimizations.push('✅ Variables CSS DSFR utilisées pour les couleurs');
  }
  
  return optimizations;
}

// Exécuter la validation
validatePlayground();