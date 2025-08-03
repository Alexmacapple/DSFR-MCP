# Changelog

Tous les changements notables de ce projet seront documentés dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2025-08-03

### 🏗️ Phase 2.1 Complète - Architecture et Performance

#### 🎯 Performances exceptionnelles
- **Démarrage 99% plus rapide** : 149ms → 1.6ms
- **Objectif dépassé** : < 2s (largement sous la barre)
- **Architecture modulaire** : Injection de dépendances complète
- **Optimisation mémoire** : Cache intelligent avec compression LRU

#### 🏗️ Architecture V2 - Refonte complète
- **Container DI** : Système d'injection de dépendances avec lifecycles singleton/transient
- **Interfaces & Contrats** : Hiérarchie claire avec IService, IDataRepository, ICacheService
- **Pattern Repository** : Accès aux données avec lazy loading et cache intelligent  
- **Services découplés** : ConfigService, LoggerService, CacheService, DocumentationService
- **Initialisation parallèle** : Services initialisés en parallèle pour optimiser le démarrage

#### 🧠 Cache intelligent avancé
- **LRU Eviction** : Éviction automatique par ordre d'utilisation
- **Compression dynamique** : Compression gzip pour données > 1KB
- **Gestion mémoire** : Limite configurable (50MB par défaut)
- **Métriques** : Statistiques hits/misses, utilisation mémoire
- **Cache persistant** : Sauvegarde sur disque pour données importantes

#### 🔧 Services core optimisés
- **ConfigService** : Configuration centralisée avec support nested keys
- **LoggerService** : Logging MCP-compatible avec niveaux et formatage JSON
- **CacheService** : Cache haute performance avec TTL et compression
- **DocumentationRepository** : Chargement lazy avec traitement par batch

#### ✅ Tests & Validation
- **25/25 tests passent** : Couverture complète des composants core
- **Tests d'intégration** : Container DI, Config, Logger, Cache, Performance
- **Benchmarks** : Scripts de performance automatisés
- **Qualité** : Tests TTL, compression, concurrence, éviction mémoire

#### 📁 Structure modulaire
```
src/
├── core/
│   ├── container.js         # Container DI avec résolution dépendances
│   └── interfaces.js        # Contrats et interfaces services
├── services/
│   ├── config-service.js    # Configuration centralisée
│   ├── logger-service.js    # Logging MCP-compatible  
│   ├── cache-service.js     # Cache intelligent LRU+compression
│   └── documentation-service-v2.js # Service docs optimisé
├── repositories/
│   └── documentation-repository.js # Repository pattern avec lazy loading
└── index-v2.js             # Point d'entrée architecture V2
```

#### 🔄 Compatibilité
- **Rétrocompatibilité** : V1 maintenue pour transition graduelle
- **Migration simple** : V2 utilisable via index-v2.js
- **Tests séparés** : Validation indépendante des deux architectures

## [1.1.0] - 2025-08-03

### 🚀 Phase 1 Complète - Toutes les fonctionnalités MCP implémentées

#### Ajouté
- **Nettoyage complet des données** : Scripts automatiques de validation et nettoyage des 213 fiches markdown
  - `verify-data-integrity.js` : Validation complète avec score 100% sur 213 fichiers
  - `standardize-filenames.js` : Standardisation de 196 noms de fichiers  
  - `validate-yaml-metadata.js` : Validation et amélioration des métadonnées YAML
- **Outils MCP avancés (12/12 fonctionnels)** :
  - `create_dsfr_theme` : Génération de thèmes avec palettes couleurs, mode sombre, mixins SCSS et configuration JavaScript
  - `convert_to_framework` : Conversion intelligente HTML vers React/Vue/Angular avec analyse détaillée et guides de test
  - `generate_dsfr_component` : Génération avancée avec templates TypeScript, hooks React, Composition API Vue, guides d'accessibilité
- **Tests d'intégration complets** : 12/12 tests passent pour tous les outils MCP avancés
- **Compatibilité rétrograde** : Méthode `validateHTMLCore` pour maintenir les tests existants

#### Amélioré
- **GeneratorService** : 15+ nouvelles méthodes pour manipulation couleurs, génération templates, conversion frameworks
- **ValidationService** : Support du format MCP tout en conservant la compatibilité des tests
- **Gestion des couleurs** : Algorithmes de génération de palettes, calcul contraste, conversion HSL/RGB
- **Templates avancés** : Support complet React hooks, Vue Composition API, Angular modernes avec TypeScript
- **Documentation inline** : Guides d'installation, bonnes pratiques, exemples d'utilisation dans chaque outil

#### Technique
- Architecture modulaire maintenue avec séparation des responsabilités
- Tous les outils retournent le format MCP standard `{content: [{type: 'text', text: '...'}]}`
- Tests unitaires et d'intégration pour validation complète
- Scripts de nettoyage des données pour maintenir la qualité

## [1.0.2] - 2025-08-03

### ✨ Améliorations

#### Ajouté
- **Versioning complet** : Ajout de métadonnées de version à tous les fichiers dsfr-source pour une meilleure traçabilité
- **Structure fiches v2** : Nouvelle organisation des fiches markdown dans le dossier `fiches-markdown-v2/`
- **Expérience développeur** : Amélioration de l'organisation des données pour une utilisation plus fluide

#### Modifié
- Réorganisation des fiches markdown avec une nouvelle structure plus cohérente
- Mise à jour de la documentation pour refléter les changements structurels

## [1.0.1] - 2024-08-03

### 🐛 Corrections

#### Corrigé
- **Compatibilité MCP** : Suppression de tous les console.log/error qui corrompaient le protocole JSON-RPC
- **Caractères spéciaux** : Nettoyage des caractères problématiques (®, ™, ©) dans 37 fichiers markdown
- **Emojis** : Remplacement de tous les emojis par du texte simple dans les services
- **Parser silencieux** : Création d'une version silencieuse du parser sans logs
- **Tests** : Installation de jest-junit manquante pour les tests

#### Ajouté
- Script `clean-special-chars.js` pour nettoyer automatiquement les caractères spéciaux
- Version silencieuse du parser DSFR (`dsfr-source-parser-silent.js`)

#### Technique
- Le serveur renvoie maintenant uniquement du JSON valide sans pollution stdout/stderr
- Compatibilité totale avec le protocole MCP de Claude Desktop

## [1.0.0] - 2024-08-02

### 🎉 Version initiale

#### Ajouté
- Serveur MCP complet pour le Système de Design de l'État Français (DSFR)
- 213 fiches de documentation indexées et consultables
- 12 outils MCP pour interagir avec le DSFR :
  - `search_dsfr_components` : Recherche de composants
  - `get_component_details` : Détails des composants
  - `list_dsfr_categories` : Liste des catégories
  - `generate_dsfr_component` : Génération de composants
  - `generate_dsfr_template` : Génération de templates
  - `validate_dsfr_html` : Validation HTML
  - `check_accessibility` : Vérification RGAA
  - `create_dsfr_theme` : Création de thèmes
  - `search_patterns` : Recherche de patterns
  - `convert_to_framework` : Conversion vers frameworks
  - `get_dsfr_icons` : Liste des icônes
  - `get_dsfr_colors` : Palette de couleurs
- Support des frameworks : Vanilla, React, Vue.js, Angular
- Validation de l'accessibilité RGAA
- Tests unitaires et d'intégration
- Documentation complète
- Scripts d'installation automatisés

#### Configuration
- Compatible avec Claude Desktop
- Support macOS, Windows et Linux
- Node.js 18+ requis

#### Documentation
- README complet avec guide d'installation
- Guide de contribution
- Documentation des APIs
- Exemples d'utilisation
