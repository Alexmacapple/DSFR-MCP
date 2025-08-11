#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

console.log('🔨 Construction de l\'index DSFR...');

const dataDir = path.join(__dirname, '../data');
const fichesDir = path.join(__dirname, '../fiches-markdown-v2');
const outputFile = path.join(dataDir, 'dsfr-index.json');

// Créer le répertoire data s'il n'existe pas
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const index = {
  version: '1.4.1',
  timestamp: new Date().toISOString(),
  components: [],
  patterns: [],
  utilities: [],
  categories: {
    core: 'Fondamentaux',
    component: 'Composants',
    layout: 'Mise en page',
    utility: 'Utilitaires',
    pattern: 'Patterns'
  }
};

try {
  // Lire tous les fichiers markdown
  const files = fs.readdirSync(fichesDir);
  
  for (const file of files) {
    if (!file.endsWith('.md')) continue;
    
    const filePath = path.join(fichesDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Extraire le front matter YAML
    let frontMatter = {};
    const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (frontMatterMatch) {
      try {
        frontMatter = yaml.load(frontMatterMatch[1]);
      } catch (e) {
        console.warn(`⚠️ Erreur YAML dans ${file}:`, e.message);
      }
    }
    
    // Extraire le titre du contenu
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : path.basename(file, '.md');
    
    // Détecter le type de composant
    const fileName = file.toLowerCase();
    let category = 'component';
    let type = 'component';
    
    if (fileName.includes('couleur') || fileName.includes('typographie') || fileName.includes('grille')) {
      category = 'core';
      type = 'foundational';
    } else if (fileName.includes('pattern') || fileName.includes('template')) {
      category = 'pattern';
      type = 'pattern';
    } else if (fileName.includes('utilitaire') || fileName.includes('helper')) {
      category = 'utility';
      type = 'utility';
    } else if (fileName.includes('bouton') || fileName.includes('formulaire') || fileName.includes('carte')) {
      category = 'component';
      type = 'component';
    }
    
    const item = {
      id: path.basename(file, '.md'),
      name: title,
      category,
      type,
      file: file,
      description: frontMatter.description || `Documentation ${title}`,
      keywords: frontMatter.tags || [],
      accessibility: frontMatter.accessibility || 'AA',
      responsive: frontMatter.responsive !== false,
      frameworks: frontMatter.frameworks || ['vanilla', 'react', 'vue', 'angular']
    };
    
    // Ajouter à la catégorie appropriée
    if (type === 'component') {
      index.components.push(item);
    } else if (type === 'pattern') {
      index.patterns.push(item);
    } else {
      index.utilities.push(item);
    }
  }
  
  // Ajouter quelques composants essentiels s'ils sont manquants
  const essentials = [
    {
      id: 'bouton',
      name: 'Bouton',
      category: 'component',
      type: 'component',
      description: 'Composant bouton DSFR',
      keywords: ['button', 'cta', 'action'],
      accessibility: 'AA',
      responsive: true,
      frameworks: ['vanilla', 'react', 'vue', 'angular']
    },
    {
      id: 'carte',
      name: 'Carte',
      category: 'component',
      type: 'component',
      description: 'Composant carte DSFR',
      keywords: ['card', 'container', 'content'],
      accessibility: 'AA',
      responsive: true,
      frameworks: ['vanilla', 'react', 'vue', 'angular']
    },
    {
      id: 'formulaire',
      name: 'Formulaire',
      category: 'component',
      type: 'component',
      description: 'Éléments de formulaire DSFR',
      keywords: ['form', 'input', 'field'],
      accessibility: 'AA',
      responsive: true,
      frameworks: ['vanilla', 'react', 'vue', 'angular']
    }
  ];
  
  for (const essential of essentials) {
    if (!index.components.find(c => c.id === essential.id)) {
      index.components.push(essential);
    }
  }
  
  // Sauvegarder l'index
  fs.writeFileSync(outputFile, JSON.stringify(index, null, 2));
  
  console.log(`✅ Index DSFR créé avec succès !`);
  console.log(`📊 Statistiques :`);
  console.log(`   • ${index.components.length} composants`);
  console.log(`   • ${index.patterns.length} patterns`);
  console.log(`   • ${index.utilities.length} utilitaires`);
  console.log(`📍 Fichier : ${outputFile}`);
  
} catch (error) {
  console.error('❌ Erreur lors de la construction de l\'index :', error.message);
  process.exit(1);
}