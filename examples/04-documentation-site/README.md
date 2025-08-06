# 📚 Exemple : Site de documentation technique institutionnelle

> **Cas d'usage :** Portail de documentation pour API publique française, guide développeur des services de l'État ou centre d'aide institutionnel utilisant DSFR.

## ✅ Usage institutionnel conforme

**Cet exemple respecte l'usage exclusif du DSFR** pour les institutions publiques françaises : documentation d'API gouvernementales (data.gouv.fr, API Particulier), guides techniques de services publics numériques, ou centres d'aide des administrations.

## 🎯 Objectif

Démontrer l'utilisation de DSFR pour créer un site de documentation professionnel avec :
- Navigation structurée et recherche avancée
- Contenu technique formaté et accessible
- Exemples de code interactifs
- Système de contributions communautaires

## 📋 Structure du projet

```
04-documentation-site/
├── README.md
├── package.json
├── content/
│   ├── guides/
│   │   ├── getting-started.md
│   │   ├── installation.md
│   │   └── configuration.md
│   ├── api/
│   │   ├── endpoints.md
│   │   ├── authentication.md
│   │   └── examples.md
│   └── tutorials/
│       ├── basic-usage.md
│       ├── advanced-features.md
│       └── troubleshooting.md
├── src/
│   ├── components/
│   │   ├── Navigation/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Breadcrumbs.jsx
│   │   │   └── TableOfContents.jsx
│   │   ├── Content/
│   │   │   ├── MarkdownRenderer.jsx
│   │   │   ├── CodeBlock.jsx
│   │   │   └── ApiReference.jsx
│   │   ├── Search/
│   │   │   ├── SearchBar.jsx
│   │   │   ├── SearchResults.jsx
│   │   │   └── FilterPanel.jsx
│   │   └── Interactive/
│   │       ├── CodePlayground.jsx
│   │       ├── APITester.jsx
│   │       └── FeedbackWidget.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Guide.jsx
│   │   ├── API.jsx
│   │   └── Search.jsx
│   └── utils/
│       ├── markdown.js
│       ├── search.js
│       └── analytics.js
└── static/
    ├── images/
    ├── downloads/
    └── examples/
```

## 🚀 Commandes Claude Desktop utilisées

### Génération de la navigation
```
Crée une navigation de documentation DSFR avec :
- Menu latéral hiérarchique collapsible
- Fil d'Ariane automatique
- Table des matières flottante
- Système de tags et catégories
```

### Rendu du contenu technique
```
Génère les composants de contenu avec :
- Rendu Markdown avec syntax highlighting
- Blocs de code copiables avec preview
- Références API avec exemples
- Alertes et callouts formatés DSFR
```

### Système de recherche
```
Implémente une recherche documentaire avec :
- Barre de recherche full-text
- Filtres par type de contenu
- Suggestions et auto-complétion
- Résultats avec extraits et highlights
```

## 🛠️ Outils DSFR-MCP utilisés

- ✅ `search_dsfr_components` - Composants de navigation
- ✅ `generate_dsfr_component` - Layout et contenu
- ✅ `validate_dsfr_html` - Validation accessibilité
- ✅ `check_accessibility` - Conformité RGAA documentation
- ✅ `create_dsfr_theme` - Thème documentation
- ✅ `export_documentation` - Génération guides
- ✅ `analyze_dsfr_usage` - Optimisation structure

## 🎨 Composants DSFR documentaire

### Navigation Components
- `<Sidebar />` - Navigation hiérarchique avec état
- `<Breadcrumbs />` - Fil d'Ariane automatique
- `<TableOfContents />` - TOC flottante avec ancres
- `<CategoryFilter />` - Filtres de contenu
- `<SearchBar />` - Recherche avec suggestions

### Content Components
- `<MarkdownRenderer />` - Rendu MD avec plugins
- `<CodeBlock />` - Blocs code avec copy/paste
- `<ApiEndpoint />` - Documentation endpoint
- `<Alert />` - Messages info/warning/error
- `<Callout />` - Encadrés d'information

### Interactive Components
- `<CodePlayground />` - Éditeur en ligne
- `<APITester />` - Test endpoints en direct
- `<VersionSelector />` - Sélecteur de version
- `<FeedbackWidget />` - Widget de feedback
- `<ContributionForm />` - Formulaire contribution

## 📖 Fonctionnalités documentation

### Navigation et structure
- ✅ Arborescence multi-niveaux
- ✅ Navigation clavier complète
- ✅ Liens permanents (permalinks)
- ✅ Pagination précédent/suivant
- ✅ Breadcrumbs contextuels

### Contenu et formatage
- ✅ Markdown étendu (GFM + extensions)
- ✅ Syntax highlighting 20+ langages
- ✅ Diagrammes Mermaid intégrés
- ✅ Gestion des médias et assets
- ✅ Métadonnées et SEO

### Recherche et découverte
- ✅ Recherche full-text instantanée
- ✅ Indexation automatique du contenu
- ✅ Filtres par type/catégorie/tag
- ✅ Suggestions de contenu similaire
- ✅ Analytics de recherche

## 🔧 Installation et développement

### 1. Prérequis
```bash
# DSFR-MCP configuré (voir Quickstart)
# Node.js 18+
# Git pour le contenu
```

### 2. Installation
```bash
cd examples/04-documentation-site
npm install

# Indexation initiale du contenu
npm run index:content

# Génération assets statiques
npm run build:assets
```

### 3. Développement
```bash
# Serveur de développement avec hot reload
npm run dev

# Watch contenu Markdown
npm run watch:content

# Tests accessibilité
npm run test:a11y

# Build production
npm run build
```

### 4. Génération de contenu avec Claude
```
Génère la documentation complète pour :
- Guide d'installation pas-à-pas
- Référence API avec exemples curl/SDK
- Tutoriels par cas d'usage
- FAQ et troubleshooting
```

## 📝 Prompts Claude recommandés

### Amélioration du contenu
```
Enrichis cette documentation avec :
- Diagrammes d'architecture système
- Exemples de code pour 5 langages populaires  
- Guides de migration entre versions
- Glossaire technique illustré
```

### Fonctionnalités avancées
```
Ajoute à ce site de documentation :
- Système de commentaires sur les articles
- Édition collaborative avec suggestions
- Export PDF/ePub des guides
- Playground interactif pour tester l'API
```

### Optimisation UX
```
Optimise l'expérience utilisateur avec :
- Navigation intelligente basée sur l'historique
- Mode sombre/clair avec préférence
- Raccourcis clavier pour navigation rapide
- Progressive Web App avec cache offline
```

## 🎯 Points d'apprentissage

1. **Structure informationnelle** : Organisation logique du contenu
2. **Accessibilité documentaire** : Navigation claire et alternative
3. **Recherche performante** : Index et algorithmes adaptés
4. **Contenu technique** : Formatage code et exemples
5. **Contribution collaborative** : Workflows de mise à jour
6. **Analytics contenu** : Métriques d'usage et amélioration

## 📊 Types de documentation supportés

### Documentation API
- ✅ **Référence endpoints** : GET/POST/PUT/DELETE
- ✅ **Exemples requête/réponse** : JSON formaté
- ✅ **Codes d'erreur** : Documentation complète
- ✅ **SDK et wrappers** : Exemples multi-langages
- ✅ **Authentification** : OAuth, API keys, JWT

### Guides utilisateur
- ✅ **Getting started** : Parcours guidé
- ✅ **Tutoriels pas-à-pas** : Avec captures d'écran
- ✅ **Best practices** : Recommandations d'usage
- ✅ **FAQ** : Questions fréquentes organisées
- ✅ **Troubleshooting** : Diagnostic et solutions

### Documentation technique
- ✅ **Architecture** : Diagrammes et concepts
- ✅ **Configuration** : Variables et paramètres
- ✅ **Déploiement** : Guides d'installation
- ✅ **Maintenance** : Procédures et monitoring
- ✅ **Sécurité** : Bonnes pratiques et audit

## 📈 Métriques de qualité

- **Accessibilité** : AA RGAA 4.1 (navigation complexe)
- **Performance** : 95+ Lighthouse (contenu statique)
- **SEO** : Structure sémantique optimale
- **Mobile** : Navigation adaptative complète  
- **Recherche** : < 100ms temps de réponse
- **Contribution** : Workflow Git intégré

## 🚀 Déploiement et distribution

### Build statique
```bash
# Génération site statique
npm run build

# Optimisation assets
npm run optimize

# Génération sitemap
npm run generate:sitemap

# Deploy vers CDN/static hosting
npm run deploy
```

### Déploiement continu
```yaml
# GitHub Actions exemple
name: Documentation
on:
  push:
    paths: ['content/**', 'src/**']
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci && npm run build
      - run: npm run deploy:production
```

## 💡 Cas d'usage institutionnels

### Exemples d'implémentation
- **API gouvernementales** - data.gouv.fr, API Particulier
- **Services numériques** - France Connect, Démarches Simplifiées
- **Outils développeurs** - DSFR, Système de Design État
- **Documentation réglementaire** - Guides techniques ministériels

### Avantages secteur public
- **Transparence** : Accès libre à l'information technique
- **Standardisation** : Cohérence entre services publics
- **Collaboration** : Contribution communauté développeurs
- **Accessibilité** : Conforme aux obligations légales

## 🔗 Intégrations possibles

### Outils de documentation
- **GitBook** - Import/export contenu
- **Swagger/OpenAPI** - Génération doc API
- **Notion** - Synchronisation contenu
- **Confluence** - Migration vers DSFR

### Services externes  
- **Algolia** - Recherche avancée externe
- **Hotjar** - Analytics comportementales  
- **Intercom** - Chat support intégré
- **GitHub** - Gestion issues et contributions

## 🎉 Résultat attendu

Un site de documentation professionnel, accessible et performant, utilisant les standards DSFR pour créer une expérience utilisateur cohérente avec l'écosystème numérique public français, facilitant l'adoption et l'usage des services documentés.