#!/usr/bin/env node
// Script pour nettoyer les caractères spéciaux problématiques dans les fichiers markdown

const fs = require('fs').promises;
const path = require('path');

async function cleanSpecialChars() {
  const fichesDir = path.join(__dirname, '..', 'fiches-markdown-v2');
  
  try {
    const files = await fs.readdir(fichesDir);
    const mdFiles = files.filter(f => f.endsWith('.md'));
    
    let modifiedCount = 0;
    
    for (const file of mdFiles) {
      const filePath = path.join(fichesDir, file);
      let content = await fs.readFile(filePath, 'utf-8');
      let originalContent = content;
      
      // Remplacer les caractères spéciaux problématiques
      content = content
        .replace(/®/g, '(R)')      // Registered trademark
        .replace(/™/g, '(TM)')     // Trademark
        .replace(/©/g, '(C)')      // Copyright
        .replace(/—/g, '-')        // Em dash
        .replace(/–/g, '-')        // En dash
        .replace(/…/g, '...')      // Ellipsis
        .replace(/'/g, "'")        // Smart quotes
        .replace(/'/g, "'")
        .replace(/"/g, '"')
        .replace(/"/g, '"')
        .replace(/«/g, '"')
        .replace(/»/g, '"')
        .replace(/•/g, '-')        // Bullet point
        .replace(/°/g, 'deg')      // Degree symbol
        .replace(/€/g, 'EUR')      // Euro
        .replace(/£/g, 'GBP')      // Pound
        .replace(/½/g, '1/2')      // Half
        .replace(/¼/g, '1/4')      // Quarter
        .replace(/¾/g, '3/4')      // Three quarters
        .replace(/×/g, 'x')        // Multiplication sign
        .replace(/÷/g, '/')        // Division sign
        .replace(/≤/g, '<=')       // Less than or equal
        .replace(/≥/g, '>=')       // Greater than or equal
        .replace(/≠/g, '!=')       // Not equal
        .replace(/±/g, '+/-')      // Plus minus
        .replace(/√/g, 'sqrt')     // Square root
        .replace(/∞/g, 'infinity') // Infinity
        .replace(/µ/g, 'u')        // Micro
        .replace(/α/g, 'alpha')    // Greek alpha
        .replace(/β/g, 'beta')     // Greek beta
        .replace(/π/g, 'pi')       // Greek pi
        .replace(/Ω/g, 'Omega')    // Greek omega
        .replace(/∆/g, 'Delta')    // Greek delta
        .replace(/∑/g, 'Sum')      // Sum symbol
        .replace(/∂/g, 'd')        // Partial derivative
        .replace(/∫/g, 'integral') // Integral
        .replace(/≈/g, '~=')       // Approximately equal
        .replace(/↑/g, '^')        // Up arrow
        .replace(/↓/g, 'v')        // Down arrow
        .replace(/←/g, '<-')       // Left arrow
        .replace(/→/g, '->')       // Right arrow
        .replace(/⇒/g, '=>')       // Double right arrow
        .replace(/⇐/g, '<=')       // Double left arrow
        .replace(/⇔/g, '<=>');     // Double arrow
      
      // Si le contenu a changé, écrire le fichier
      if (content !== originalContent) {
        await fs.writeFile(filePath, content, 'utf-8');
        modifiedCount++;
        console.log(`Nettoyé: ${file}`);
      }
    }
    
    console.log(`\nTerminé! ${modifiedCount} fichier(s) modifié(s).`);
    
  } catch (error) {
    console.error('Erreur lors du nettoyage:', error);
    process.exit(1);
  }
}

// Exécuter le script
cleanSpecialChars();
