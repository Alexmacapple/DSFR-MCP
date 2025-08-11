# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

DSFR-MCP is a Model Context Protocol (MCP) server providing comprehensive access to the French Government Design System (Système de Design de l'État Français - DSFR) documentation, components, patterns, and validation tools. It enables Claude Desktop and other MCP-compatible clients to help developers build compliant websites and applications for French public administration.

**Important usage note:** The DSFR is exclusively reserved for French public institutions (administrations, prefectures, ministries, local authorities, embassies, etc.) in accordance with current regulations.

## Build and Development Commands

### Main Development
```bash
# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Install dependencies
npm install --include=dev
```

### Testing
```bash
npm test                    # Run all tests (43/43 passing)
npm run test:unit           # Unit tests only
npm run test:integration    # MCP tools integration tests
npm run test:performance    # Performance benchmarks
npm run test:coverage       # Generate coverage report
npm run test:watch          # Watch mode
npm run test:mcp            # Test MCP server directly
npm run test:data           # Run data quality checks
npm run test:all            # Run unit, integration, and performance tests
```

### Data Quality and Validation
```bash
npm run verify-data         # Verify integrity of 213 DSFR documentation files
npm run standardize-files   # Standardize file names
npm run validate-metadata   # Validate YAML metadata
npm run validate            # Validate HTML
```

### Performance and Benchmarking
```bash
npm run benchmark          # Complete performance benchmark (Parser V2)
npm run quick-benchmark    # Quick validation benchmark
```

### Docker Operations
```bash
# Production Docker configuration (recommended)
docker-compose up -d
./docker/scripts/configure-claude.sh  # Auto-configure Claude Desktop

# Development mode with auto-reload
docker-compose --profile dev up -d

# Monitoring (optional)
docker-compose --profile monitoring up -d
```

### Code Quality
```bash
npm run lint               # Check code style
npm run lint:fix           # Fix linting issues automatically
npm run lint:check         # Lint with max warnings (85)
npm run lint:ci            # CI linting with max warnings (85)
npm run lint:dev           # Development linting (0 warnings)
npm run security:audit     # Security audit
npm run quality:check      # Combined lint + coverage check
```

## Architecture

### Architecture de Haut Niveau
Le projet implémente un serveur MCP moderne avec une architecture V2 optimisée comprenant :

- **Cœur Serveur MCP** (`src/index.js`) : Serveur MCP prêt pour la production avec 16 outils
- **Couche Service** (`src/services/`) : Services modulaires avec injection de dépendances
- **Parser V2** (`dsfr-parser-v2.js`) : Parsing 4.2x plus rapide avec js-yaml et traitement parallèle
- **Moteur Documentation** (`documentation-service-v2.js`) : Traitement de documentation optimisé
- **Couche Données** (`data/`) : 213 fichiers de documentation DSFR nettoyés et données traitées

### Architecture des Services Clés

#### Services Principaux (Architecture V2)
- **Service Config** : Gestion centralisée de la configuration
- **Service Logger** : Système de logging compatible MCP  
- **Service Cache** : Cache LRU intelligent avec compression
- **Service Parser YAML** : Parsing YAML robuste avec js-yaml
- **Service Index de Recherche** : Recherche avancée avec facettes et filtres

#### Services de Documentation
- **Service Documentation V2** : Traitement de documentation optimisé (démarrage 99% plus rapide)
- **Service Documentation V1** : Service hérité (maintenu pour compatibilité)
- **Parser DSFR V2** : Parser haute performance (débit de 127 000 fichiers/sec)

#### Services de Génération et Validation  
- **Service Générateur** : Génération de code de composants et templates
- **Service Validation** : Validation de conformité HTML/DSFR
- **Service Accessibilité** : Vérification d'accessibilité RGAA 4.1
- **Service Template** : Génération de templates de pages

### Outils MCP Disponibles (16/16 Actifs)

#### Recherche et Documentation (4 outils)
- `search_dsfr_components` : Rechercher les composants DSFR par nom/catégorie
- `get_component_details` : Obtenir la documentation complète d'un composant
- `list_dsfr_categories` : Lister toutes les catégories DSFR disponibles
- `search_patterns` : Rechercher les patterns de mise en page et UI

#### Génération (3 outils)
- `generate_dsfr_component` : Générer des composants (HTML/React/Vue/Angular)
- `generate_dsfr_template` : Générer des templates de pages complètes
- `create_dsfr_theme` : Créer des thèmes DSFR personnalisés avec palettes de couleurs

#### Validation (2 outils)
- `validate_dsfr_html` : Valider la conformité DSFR
- `check_accessibility` : Vérification d'accessibilité RGAA 4.1

#### Utilitaires (3 outils)
- `convert_to_framework` : Convertir HTML vers du code spécifique à un framework
- `get_dsfr_icons` : Accès à plus de 200 icônes DSFR
- `get_dsfr_colors` : Palette de couleurs DSFR complète

#### Outils Avancés (4 outils)
- `analyze_dsfr_usage` : Analyse complète d'utilisation DSFR
- `suggest_improvements` : Suggestions d'amélioration alimentées par IA
- `compare_versions` : Comparaison de versions DSFR et guide de migration
- `export_documentation` : Export de documentation personnalisée

### Structure des Données

#### Sources de Données Principales
- **`fiches-markdown-v2/`** : 213 fichiers de documentation DSFR nettoyés et traités
- **`data/`** : Données traitées, index et métadonnées
- **`data/backup-before-cleaning/`** : Documentation originale avant traitement

#### Fichiers de Données Clés
- **`data/dsfr-index.json`** : Index principal des composants avec métadonnées
- **Rapports qualité** : `data-quality-report.json`, `duplicate-analysis-report.json`

### Caractéristiques de Performance

#### Performance Architecture V2
- **Temps de Démarrage** : 99% plus rapide (149ms → 1.6ms)
- **Vitesse Parser** : 4.2x plus rapide avec js-yaml
- **Performance Recherche** : < 0.1ms par requête
- **Traitement Fichiers** : Jusqu'à 127 000 fichiers/sec
- **Usage Mémoire** : Optimisé avec cache LRU (limite 50MB)

#### Couverture Tests
- **Tests** : 43/43 réussis
- **Couverture** : 80%+ sur branches, fonctions, lignes, instructions
- **Intégration** : Tests d'intégration complets des outils MCP
- **Performance** : Suite de benchmarking dédiée

## Patterns de Développement

### Implémentation des Services
Les services suivent le pattern d'injection de dépendances avec interfaces claires :

```javascript
// Les services sont initialisés via container.js avec gestion du cycle de vie
const service = new DocumentationServiceV2();
await service.initialize();
```

### Stratégie de Test
- **Tests unitaires** : `test/unit/services/` - Test des services individuels  
- **Tests intégration** : `test/integration/` - Tests des outils MCP et de l'architecture
- **Tests performance** : `test/performance/` - Benchmarking et tests de charge

### Pipeline de Traitement des Données
1. **Fichiers Source** : Documentation DSFR française au format markdown
2. **Scripts de Nettoyage** : Suppression des doublons, standardisation des formats
3. **Parser V2** : Traitement avec parsing YAML optimisé
4. **Génération Index** : Construction d'index recherchables avec facettes
5. **Couche Cache** : Cache LRU avec compression pour accès rapide

### Architecture Docker
- **Dockerfile multi-étapes** : Build optimisé avec image runtime
- **Profil production** : Mode stdio pour intégration Claude Desktop
- **Profil développement** : Mode TCP avec rechargement automatique
- **Profil monitoring** : Intégration Prometheus optionnelle

## Configuration

### Variables d'Environnement
```bash
NODE_ENV=production          # Mode environnement
LOG_LEVEL=info              # Niveau de logging
MCP_MODE=stdio              # Mode de communication MCP
PORT=3000                   # Port TCP (développement uniquement)
```

### Configuration Client MCP
Pour l'intégration Claude Desktop :
```json
{
  "mcpServers": {
    "dsfr-documentation": {
      "command": "docker",
      "args": ["exec", "-i", "dsfr-mcp-server", "node", "src/index.js"],
      "env": {}
    }
  }
}
```

## Notes Importantes

### Exigences de Conformité DSFR
- Tout code généré doit maintenir la conformité au système de design DSFR
- Les standards d'accessibilité (RGAA 4.1) doivent être préservés
- Les contrastes de couleurs et structure HTML sémantique sont appliqués
- Les directives de marque du gouvernement français doivent être respectées

### Considérations de Performance
- L'architecture V2 fournit des améliorations significatives de performance
- Le service de cache gère l'usage mémoire avec éviction LRU
- Le Parser V2 permet le traitement parallèle pour de gros jeux de données
- L'indexation de recherche fournit des réponses de requête en sous-millisecondes

### Intégrité des Données
- 213 fichiers de documentation DSFR sont sous contrôle de version
- Les vérifications de qualité des données assurent la cohérence lors des mises à jour
- La détection de doublons prévient la redondance de contenu
- La validation YAML assure l'intégrité des métadonnées