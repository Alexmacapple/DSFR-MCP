# Changelog

Tous les changements notables de ce projet seront documentés dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.1] - 2025-08-11

### 🧹 Repository Cleanup & Documentation Modernization

> **🎯 Major cleanup** - Removal of obsolete files and modernization of documentation structure

#### ✨ Repository Cleanup
- **✅ Removed obsolete installation scripts** : `install.sh`, `install.ps1`, `restart-mcp.sh`
- **✅ Removed outdated guides** : `GUIDE_INSTALLATION_MCP_CLAUDE.md`, `GUIDE_PERFORMANCE.md`, `QUICKSTART.md`
- **✅ Removed obsolete roadmap** : `ROADMAP.md` (project reached maturity)
- **✅ Updated CLAUDE.md** : English format with current commands and architecture
- **✅ Consolidated documentation** : All essential info now in README.md

#### 🔧 Modern Architecture Focus
- **Docker-first approach** : Single installation method via `./docker/scripts/configure-claude.sh`
- **Simplified user experience** : No more confusing multiple installation methods
- **Clean repository structure** : Removed 6 obsolete files (1,400+ lines of outdated content)
- **MCP SDK compatibility** : Updated for latest MCP SDK standards

#### 📖 Documentation Strategy
- **Single source of truth** : README.md as primary documentation
- **Automated installation** : Docker scripts handle all complexity
- **Clear development workflow** : CLAUDE.md for developers, README.md for users

---

## [1.0.0] - 2025-08-09

### 🎯 Version Stable de Référence

> **Point de référence fixe** - Cette version marque la première version stable officielle du projet DSFR-MCP avec toutes ses fonctionnalités essentielles.

#### ✨ Fonctionnalités Principales
- **Serveur MCP production** complet avec 15+ outils fonctionnels
- **Support Docker** robuste avec conteneurs de développement et production
- **Architecture modulaire** optimisée avec injection de dépendances
- **Recherche avancée** avec indexation intelligente et cache persistant
- **Documentation exhaustive** avec guides d'installation et d'utilisation

#### 🔧 Outils MCP Disponibles
- `get_dsfr_component` : Récupération de composants DSFR avec exemples
- `search_dsfr_components` : Recherche avancée avec filtres
- `get_design_tokens` : Accès aux tokens de design système
- `validate_accessibility` : Validation de conformité d'accessibilité
- `generate_dsfr_component` : Génération assistée de composants
- Et 10+ autres outils spécialisés

#### 📦 Installation & Déploiement
- **Docker Compose** : Installation en une commande
- **Scripts automatiques** : Configuration Claude Desktop multi-OS
- **Volumes persistants** : Données conservées entre redémarrages
- **Health checks** : Monitoring automatique des services

#### 🎯 Jalon Stable
Cette version constitue un **point de référence immuable** pour :
- Retour à une version stable connue
- Base pour les développements futurs  
- Démonstration complète des capacités du projet
- Documentation de référence

---

## [1.4.1] - 2025-08-06

### 🚀 Docker MCP Production - Déploiement Robuste

> **🎯 Version production Docker avec 15+ outils MCP** - Stabilité et performance maximales !

#### ✨ Nouvelles fonctionnalités Docker Production
- **✅ Serveur MCP production robuste** : `index.js` unifié avec 15+ outils fonctionnels
- **✅ Mécanismes de fallback avancés** : Services de secours si dépendances indisponibles
- **✅ Keep-alive intelligent** : Monitoring toutes les 30 secondes avec status détaillé
- **✅ Gestion d'erreurs robuste** : Récupération automatique des services défaillants
- **✅ Container stable** : Statut UP et healthy confirmé avec health checks

#### 🔧 Améliorations techniques
- **Configuration Docker-Compose optimisée** : Health checks et commandes production
- **Index minimal renforcé** : Keep-alive pour compatibilité Docker
- **Documentation actualisée** : README.md et guides Docker mis à jour
- **Tests de stabilité** : Validation container et services MCP

## [1.4.0] - 2025-08-05

### 🐳 Révolution Docker - Installation Simplifiée

> **🎯 Migration Docker complète** - Fini les problèmes de configuration entre environnements !

#### 🚀 Nouvelle Installation Docker (Recommandée)
- **✅ Dockerfile multi-stage optimisé** : Image Node.js Alpine < 100MB avec sécurité renforcée
- **✅ Docker Compose complet** : Services principaux, développement et monitoring intégrés
- **✅ Configuration automatique** : Scripts `configure-claude.sh/.ps1` pour macOS/Linux/Windows
- **✅ Isolation totale** : Aucun conflit avec Node.js local, environnement reproductible
- **✅ Volumes persistants** : Données et logs conservés entre redémarrages

#### 🔧 Scripts d'Installation Automatique
- **Installation en une commande** : `./docker/scripts/configure-claude.sh`
- **Support multi-OS** : Scripts bash (macOS/Linux) et PowerShell (Windows)
- **Configuration Claude Desktop** : Génération automatique des fichiers JSON
- **Modes flexibles** : stdio (défaut), TCP, développement avec hot-reload

#### 📖 Documentation Docker Complète
- **Guide complet** : `GUIDE_INSTALLATION_DOCKER.md` avec exemples détaillés
- **Migration native→Docker** : Procédures de migration depuis installation Node.js
- **Dépannage avancé** : Solutions spécifiques aux containers et volumes
- **Monitoring intégré** : Prometheus, logs centralisés, healthchecks

#### 🎯 Avantages Environnementaux
- **🔄 Portabilité totale** : Configuration identique sur tous les Mac/PC
- **⚡ Installation ultra-rapide** : Build multi-stage avec cache intelligent  
- **🛡️ Sécurité renforcée** : Utilisateur non-root, isolation des processus
- **📊 Observabilité** : Logs structurés, métriques de performance, monitoring

---

## [1.3.1] - 2025-08-04

### 🛠️ Correctifs et Améliorations

#### 🔧 Configuration Claude Desktop
- **Correction critique** : Problème "Cannot find module '/src/index.js'"
- **Configuration recommandée** : Utilisation du chemin absolu complet
- **Documentation améliorée** : Guide d'installation avec deux approches
- **Section dépannage** : Solutions spécifiques aux erreurs courantes

#### 🔍 Script de Diagnostic Amélioré  
- **Détection automatique** : Identification du problème de chemin
- **Configuration générée** : Deux formats proposés automatiquement
- **Diagnostic intelligent** : Suggestions de solutions contextuelles
- **Prévention d'erreurs** : Validation des chemins avant configuration

#### 📖 Documentation Technique
- **Guide installation** : Instructions détaillées pour macOS et Windows
- **Troubleshooting** : Section dépannage complète
- **Exemples pratiques** : Configurations testées et validées

---

## [1.3.0] - 2025-08-03

### 🚀 Phase 2.2 Complète - Parser et Données Optimisés

#### 🎯 Performances exceptionnelles
- **Parser 4,2x plus rapide** : Proche de l'objectif 5x
- **Débit exceptionnel** : Jusqu'à 127,000 fichiers/sec
- **Taux de succès 100%** : Aucune perte de données
- **Recherche ultra-rapide** : < 0.1ms par requête

#### 🔧 Parser YAML Robuste
- **js-yaml intégré** : Remplacement complet du parser fait-maison
- **Validation automatique** : Schémas JSON Schema avec Ajv
- **Gestion d'erreurs avancée** : Snippets de code contextuels
- **Support complet YAML** : Listes, objets complexes, front-matter

#### ⚡ Parsing Parallèle Haute Performance
- **Concurrence configurable** : Jusqu'à 8 threads simultanés
- **Traitement par batch** : Contrôle intelligent de la mémoire
- **Gestion d'erreurs resiliente** : Continue malgré les échecs
- **Métriques détaillées** : Statistiques temps réel

#### 🔍 Index de Recherche Avancé
- **Recherche fuzzy** : Fuse.js avec scoring intelligent
- **Facettes automatiques** : Catégorie, type, tags, métadonnées
- **Filtres personnalisés** : Opérateurs $regex, $in, $gte, $lte
- **Pagination et tri** : Multi-critères avec performance

#### 📊 API de Recherche Complète
- **Tri multi-critères** : Relevance, titre, date, catégorie
- **Highlights résultats** : Mise en évidence des correspondances  
- **Statistiques usage** : Hits/misses, temps moyen, cache hit ratio
- **Format de réponse riche** : Métadonnées et contexte complets

#### 💾 Cache Persistant Intelligent
- **Sauvegarde automatique** : Index persisté sur disque
- **Rechargement rapide** : Démarrage instantané avec cache
- **Versioning données** : Suivi des modifications avec timestamps
- **Compression efficace** : Optimisation de l'espace disque

#### 🏗️ Services Nouveaux
- **YamlParserService** : Parser robuste avec validation schéma
- **SearchIndexService** : Index de recherche avec facettes
- **DSFRParserV2** : Parser complet avec parallélisation
- **Scripts benchmark** : Validation performance automatisée

#### ✅ Tests & Validation Complets
- **Tests d'intégration** : 18 tests couvrant tous les services
- **Benchmarks automatisés** : Scripts de mesure performance
- **Tests de charge** : Validation avec 1000+ documents
- **Tests d'erreur** : Résilience et récupération

#### 📁 Structure de Fichiers
```
src/services/
├── yaml-parser-service.js        # Parser YAML robuste
├── search-index-service.js       # Index recherche avec facettes
├── dsfr-parser-v2.js             # Parser complet optimisé
test/integration/
├── parser-v2.test.js             # Tests d'intégration complets
benchmark-parser-v2.js             # Benchmark performance détaillé
quick-benchmark.js                 # Benchmark rapide validation
```

#### 🔄 Compatibilité
- **Rétrocompatibilité** : Parsers V1 maintenus
- **Migration graduelle** : V2 utilisable indépendamment
- **Tests séparés** : Validation V1 et V2 distinctes

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
```

#### 🔄 Point d'entrée unifié
- **Consolidation** : Toute la logique de production dans index.js
- **Simplicité** : Un seul fichier de démarrage pour tous les environnements
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
