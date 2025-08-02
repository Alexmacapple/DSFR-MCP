# 📖 Documentation API - DSFR MCP

Cette documentation détaille l'API du serveur MCP DSFR et comment utiliser chaque outil disponible.

## 🔍 Outils de recherche et documentation

### search_dsfr_components

Recherche des composants DSFR par nom, catégorie ou mot-clé.

**Paramètres :**
- `query` (string, requis) : Terme de recherche
- `category` (string, optionnel) : Catégorie à filtrer (`core`, `component`, `layout`, `utility`, `analytics`, `scheme`)
- `limit` (integer, optionnel, défaut: 10) : Nombre de résultats à retourner

**Exemple :**
```json
{
  "query": "bouton",
  "category": "component",
  "limit": 5
}
```

### get_component_details

Obtient les détails complets d'un composant DSFR.

**Paramètres :**
- `component_name` (string, requis) : Nom du composant
- `include_examples` (boolean, optionnel, défaut: true) : Inclure les exemples de code
- `include_accessibility` (boolean, optionnel, défaut: true) : Inclure les informations d'accessibilité

**Exemple :**
```json
{
  "component_name": "button",
  "include_examples": true,
  "include_accessibility": true
}
```

### list_dsfr_categories

Liste toutes les catégories DSFR disponibles.

**Paramètres :** Aucun

## 🛠️ Outils de génération

### generate_dsfr_component

Génère le code HTML/CSS/JS pour un composant DSFR.

**Paramètres :**
- `component_type` (string, requis) : Type de composant (button, form, card, etc.)
- `framework` (string, optionnel, défaut: "vanilla") : Framework cible (`vanilla`, `react`, `vue`, `angular`)
- `options` (object, optionnel) : Options spécifiques au composant

**Exemple :**
```json
{
  "component_type": "button",
  "framework": "react",
  "options": {
    "variant": "primary",
    "size": "md",
    "icon": "arrow-right"
  }
}
```

### generate_dsfr_template

Génère un gabarit de page complet DSFR.

**Paramètres :**
- `template_name` (string, requis) : Nom du template
  - Options : `page-connexion`, `page-inscription`, `page-erreur-404`, `page-erreur-500`, `formulaire-contact`, `tableau-donnees`, `page-recherche`, `dashboard`
- `framework` (string, optionnel, défaut: "vanilla") : Framework cible
- `customizations` (object, optionnel) : Personnalisations du template

**Exemple :**
```json
{
  "template_name": "page-connexion",
  "framework": "vue",
  "customizations": {
    "title": "Connexion à mon service",
    "logo": true
  }
}
```

## ✅ Outils de validation

### validate_dsfr_html

Valide la conformité HTML avec les standards DSFR.

**Paramètres :**
- `html_code` (string, requis) : Code HTML à valider
- `check_accessibility` (boolean, optionnel, défaut: true) : Vérifier l'accessibilité
- `check_semantic` (boolean, optionnel, défaut: true) : Vérifier la sémantique HTML
- `strict_mode` (boolean, optionnel, défaut: false) : Mode strict

**Exemple :**
```json
{
  "html_code": "<button class=\"fr-btn\">Valider</button>",
  "check_accessibility": true,
  "strict_mode": false
}
```

### check_accessibility

Vérifie l'accessibilité RGAA d'un code HTML.

**Paramètres :**
- `html_code` (string, requis) : Code HTML à vérifier
- `rgaa_level` (string, optionnel, défaut: "AA") : Niveau RGAA (`A`, `AA`, `AAA`)
- `include_suggestions` (boolean, optionnel, défaut: true) : Inclure des suggestions d'amélioration

## 🎨 Outils de personnalisation

### create_dsfr_theme

Crée un thème DSFR personnalisé.

**Paramètres :**
- `theme_name` (string, requis) : Nom du thème
- `primary_color` (string, optionnel) : Couleur principale (hex)
- `secondary_color` (string, optionnel) : Couleur secondaire (hex)
- `custom_variables` (object, optionnel) : Variables CSS personnalisées

**Exemple :**
```json
{
  "theme_name": "mon-ministere",
  "primary_color": "#000091",
  "secondary_color": "#E1000F",
  "custom_variables": {
    "--fr-spacing": "1.5rem"
  }
}
```

## 📚 Outils de patterns

### search_patterns

Recherche des patterns de mise en page DSFR.

**Paramètres :**
- `query` (string, requis) : Terme de recherche
- `pattern_type` (string, optionnel) : Type de pattern (`page`, `form`, `navigation`, `content`)

## 🔧 Outils utilitaires

### convert_to_framework

Convertit du code DSFR vanilla vers un framework.

**Paramètres :**
- `html_code` (string, requis) : Code HTML DSFR à convertir
- `target_framework` (string, requis) : Framework cible (`react`, `vue`, `angular`)
- `component_name` (string, optionnel) : Nom du composant à créer

### get_dsfr_icons

Liste et recherche les icônes DSFR disponibles.

**Paramètres :**
- `category` (string, optionnel) : Catégorie d'icônes
- `search` (string, optionnel) : Recherche par nom

### get_dsfr_colors

Obtient la palette de couleurs DSFR.

**Paramètres :**
- `include_utilities` (boolean, optionnel, défaut: true) : Inclure les classes utilitaires
- `format` (string, optionnel, défaut: "hex") : Format de couleur (`hex`, `rgb`, `hsl`)

## 🔗 Réponses types

Toutes les réponses suivent le format MCP standard :

```json
{
  "content": [
    {
      "type": "text",
      "text": "Contenu de la réponse en Markdown"
    }
  ]
}
```

Les erreurs sont retournées dans le même format avec un message d'erreur descriptif.
