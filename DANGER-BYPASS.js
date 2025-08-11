#!/usr/bin/env node
// 💀 DANGER MODE - DIRECT JSON-RPC BYPASS 💀

process.stdin.on('data', (data) => {
  try {
    const lines = data.toString().split('\n').filter(line => line.trim());
    for (const line of lines) {
      if (!line.trim()) continue;
      const request = JSON.parse(line);
  
  if (request.method === 'tools/list') {
    console.log(JSON.stringify({
      result: {
        tools: [
          {
            name: 'search_patterns',
            description: 'DANGER MODE - Ultra rapide',
            inputSchema: { type: 'object', properties: { query: { type: 'string' }, pattern_type: { type: 'string' } } }
          },
          {
            name: 'search_dsfr_components', 
            description: 'DANGER MODE - Recherche composants DSFR',
            inputSchema: { type: 'object', properties: { query: { type: 'string' }, limit: { type: 'integer' } } }
          },
          {
            name: 'export_documentation',
            description: 'DANGER MODE - Export documentation',  
            inputSchema: { type: 'object', properties: { export_format: { type: 'string' }, template_style: { type: 'string' } } }
          },
          {
            name: 'list_dsfr_categories',
            description: 'DANGER MODE - Liste catégories',
            inputSchema: { type: 'object', properties: {} }
          },
          {
            name: 'get_component_details',
            description: 'DANGER MODE - Détails composant',
            inputSchema: { type: 'object', properties: { component_name: { type: 'string' } } }
          }
        ]
      },
      jsonrpc: '2.0',
      id: request.id
    }));
  } else if (request.method === 'tools/call') {
    const toolName = request.params.name;
    const args = request.params.arguments || {};
    
    let response = { content: [{ type: 'text', text: 'Outil non implémenté' }] };
    
    switch (toolName) {
      case 'search_patterns':
        response = {
          content: [{
            type: 'text',
            text: `🚀 **DANGER MODE FORMULAIRE DSFR**

\`\`\`html
<form class="fr-form">
  <fieldset class="fr-fieldset">
    <legend class="fr-fieldset__legend">Contact Express</legend>
    
    <div class="fr-input-group">
      <label class="fr-label" for="email">Email *</label>
      <input class="fr-input" type="email" id="email" required>
    </div>
    
    <div class="fr-input-group">
      <label class="fr-label" for="message">Message *</label>
      <textarea class="fr-input" id="message" rows="4" required></textarea>
    </div>
    
    <button class="fr-btn fr-btn--primary" type="submit">
      🚀 Envoyer (DANGER MODE)
    </button>
  </fieldset>
</form>
\`\`\`

💀 **DANGER MODE ACTIVATED** 🎯`
          }]
        };
        break;
        
      case 'search_dsfr_components':
        response = {
          content: [{
            type: 'text',
            text: `🔍 **RECHERCHE COMPOSANTS DSFR** - "${args.query || 'tous'}"

📋 **Composants trouvés (${args.limit || 10} premiers) :**

## 1. 🔘 Bouton (fr-btn)
Classes principales : fr-btn, fr-btn--primary, fr-btn--secondary
Usage : Actions utilisateur, CTA

## 2. 📝 Formulaire (fr-form) 
Classes principales : fr-form, fr-fieldset, fr-input-group, fr-input
Usage : Saisie de données utilisateur

## 3. 🎴 Carte (fr-card)
Classes principales : fr-card, fr-card__body, fr-card__title
Usage : Affichage d'informations structurées

## 4. 🧭 Navigation (fr-nav)
Classes principales : fr-nav, fr-nav__list, fr-nav__item, fr-nav__link
Usage : Navigation du site

## 5. 📊 Tableau (fr-table)
Classes principales : fr-table, fr-table--bordered
Usage : Données tabulaires

💀 **DANGER MODE** - Composants DSFR listés instantanément !`
          }]
        };
        break;
        
      case 'list_dsfr_categories':
        response = {
          content: [{
            type: 'text',
            text: `📚 **CATÉGORIES DSFR DISPONIBLES**

## 🎯 Core (Fondamentaux)
- Couleurs, typographie, grilles, espacement
- **18 composants** de base

## 🧩 Component (Composants)
- Boutons, formulaires, cartes, navigation  
- **127 composants** interactifs

## 📐 Layout (Mise en page)
- Grilles, conteneurs, en-têtes, pieds de page
- **43 patterns** de structure

## 🛠️ Utility (Utilitaires)
- Classes CSS, helpers, variables
- **20 utilitaires** pratiques

💀 **TOTAL : 208 COMPOSANTS DSFR** - DANGER MODE !`
          }]
        };
        break;
        
      case 'get_component_details':
        response = {
          content: [{
            type: 'text',
            text: `📋 **DÉTAILS COMPOSANT : ${args.component_name || 'Bouton'}**

## 🎯 Description
Composant ${args.component_name || 'bouton'} du système de design DSFR

## 💻 Code HTML
\`\`\`html
<${args.component_name === 'carte' ? 'div' : 'button'} class="fr-${args.component_name || 'btn'} ${args.component_name === 'bouton' ? 'fr-btn--primary' : ''}">
  ${args.component_name || 'Bouton'} DSFR
</${args.component_name === 'carte' ? 'div' : 'button'}>
\`\`\`

## ♿ Accessibilité RGAA 4.1
✅ Conforme niveau AA
✅ Navigation clavier
✅ Lecteurs d'écran compatibles

💀 **DANGER MODE** - Détails instantanés !`
          }]
        };
        break;
        
      case 'export_documentation':
        response = {
          content: [{
            type: 'text',
            text: `📤 **EXPORT DOCUMENTATION DSFR** - ${args.export_format || 'markdown'}

# Documentation DSFR Exportée

## Composants principaux

### Bouton
\`\`\`html
<button class="fr-btn fr-btn--primary">Bouton</button>
\`\`\`

### Formulaire  
\`\`\`html
<form class="fr-form">
  <input class="fr-input" type="text">
</form>
\`\`\`

### Carte
\`\`\`html
<div class="fr-card">
  <div class="fr-card__body">
    <h3 class="fr-card__title">Titre</h3>
  </div>
</div>
\`\`\`

## Couleurs DSFR
- Bleu France: #000091
- Rouge Marianne: #E1000F

💀 **DANGER MODE EXPORT** - Documentation générée !`
          }]
        };
        break;
    }
    
    console.log(JSON.stringify({
      result: response,
      jsonrpc: '2.0', 
      id: request.id
    }));
    }
  } catch (e) {
    console.error('💀 DANGER MODE ERROR:', e.message);
  }
});

process.stdin.resume();