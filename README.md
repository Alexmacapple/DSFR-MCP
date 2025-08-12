# 🇫🇷 DSFR-MCP - Model Context Protocol pour le Système de Design de l'État Français

![Version](https://img.shields.io/github/v/release/Alexmacapple/DSFR-MCP?label=version)
![Build Status](https://github.com/Alexmacapple/DSFR-MCP/actions/workflows/ci.yml/badge.svg)
[![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=flat&logo=docker&logoColor=white)](https://docker.com)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/tests-running-yellow.svg)](#tests)
[![Performance](https://img.shields.io/badge/parser-4.2x%20faster-brightgreen.svg)](#phase-22-parser-v2)

Serveur MCP (Model Context Protocol) complet pour le Système de Design de l'État Français (DSFR). Ce serveur permet d'accéder à toute la documentation DSFR, aux composants, aux patterns et aux outils de validation directement depuis Claude Desktop ou tout autre client MCP compatible.

⚠️ **Usage exclusif** : Le DSFR est réservé aux institutions publiques françaises (administrations, préfectures, ministères, collectivités territoriales, ambassades, etc.) conformément à la réglementation en vigueur.

## 🚀 Fonctionnalités principales

- **📚 Documentation complète** : Accès aux 213 fiches de documentation DSFR nettoyées et organisées dans une structure v2 optimisée
- **🔍 Recherche intelligente** : Recherche fuzzy avec facettes et filtres avancés, indexation ultra-rapide (< 0.1ms par requête)
- **⚡ Parser V2 haute performance** : **4.2x plus rapide** avec js-yaml, validation schéma automatique, parsing parallèle jusqu'à 127,000 fichiers/sec
- **🛠️ Génération de code avancée** : Création automatique de composants React, Vue, Angular avec templates TypeScript et guides d'accessibilité
- **✅ Validation robuste** : Vérification approfondie de la conformité DSFR et de l'accessibilité RGAA avec scoring automatique
- **🎨 Personnalisation complète** : Création de thèmes avec palettes de couleurs, mode sombre, et mixins SCSS automatiques
- **📦 Architecture V2 optimisée** : Injection de dépendances, cache intelligent LRU, services découplés (99% plus rapide au démarrage)
- **🧹 Données nettoyées** : Déduplication automatique et validation d'intégrité des 213 fiches markdown
- **🎯 16/16 outils MCP** : Tous les outils MCP fonctionnels avec tests d'intégration complets
- **📊 Dashboard temps réel** : Monitoring complet avec métriques, health checks et observabilité

## 📋 Table des matières

- [Installation](#-installation)
- [Configuration](#-configuration)
- [Utilisation](#-utilisation)
- [Outils disponibles](#-outils-disponibles)
- [Architecture](#-architecture)
- [Développement](#-développement)
- [Tests](#-tests)
- [Contribution](#-contribution)
- [Support](#-support)
- [Changelog](#changelog)
- [Licence](#-licence)

## 🔧 Installation

> **🎯 Nouveau : Installation Docker recommandée !** Fini les problèmes de configuration entre environnements.

### 🐳 Option 1: Installation Docker (Recommandée)

**Avantages :** Identique sur tous les Mac/PC, aucun conflit, configuration automatique.

```bash
# Cloner le projet
git clone https://github.com/Alexmacapple/DSFR-MCP.git
cd DSFR-MCP

# Installation automatique avec Docker
./docker/scripts/configure-claude.sh
```

**➡️ [Guide complet Docker](GUIDE_INSTALLATION_DOCKER.md)**

### 📦 Option 2: Installation Native

**Pré-requis :**
- **Node.js** version 18.0.0 ou supérieure
- **npm** version 9.0.0 ou supérieure
- **Claude Desktop** (ou un autre client MCP)

```bash
# Cloner le projet
git clone https://github.com/Alexmacapple/DSFR-MCP.git
cd DSFR-MCP

# Installer les dépendances
npm install

# Tester l'installation
npm test
```

### Installation automatique Docker

Pour une installation encore plus simple avec Docker :

```bash
# Installation automatique complète
./docker/scripts/configure-claude.sh
```

## ⚙️ Configuration

### Configuration Claude Desktop

1. Ouvrez le fichier de configuration Claude Desktop :
   - **macOS** : `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows** : `%APPDATA%\Claude\claude_desktop_config.json`

2. Ajoutez la configuration suivante :

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

3. Redémarrez Claude Desktop

### Variables d'environnement (optionnel)

Créez un fichier `.env` à la racine du projet :

```env
# Port du serveur (optionnel)
MCP_SERVER_PORT=3001

# Niveau de log
LOG_LEVEL=info

# Mise à jour automatique de l'index
AUTO_INDEX_UPDATE=true
INDEX_UPDATE_INTERVAL=3600000
```

## 📚 Utilisation

### 🚀 Démarrage rapide

**Installation Docker recommandée** - Configuration automatique en moins de 5 minutes !

### Démarrage du serveur

```bash
# Mode production
npm start

# Mode développement (avec rechargement automatique)
npm run dev
```

### ⚡ Cas d'usage express (30 secondes)

**Formulaire contact rapide** :
```
Dans Claude Desktop : "Génère un formulaire de contact DSFR complet avec validation"
```

**Page institutionnelle** :
```
Dans Claude Desktop : "Crée une page d'accueil DSFR pour la mairie de [ville]"
```

**Dashboard admin** :
```
Dans Claude Desktop : "Génère un dashboard DSFR avec statistiques et tableaux de données"
```

### 📊 Dashboard de monitoring

**Accès direct au dashboard** :
```
http://localhost:3001/dashboard
```

**Fonctionnalités** :
- 📈 **Métriques temps réel** : Requêtes/min, temps de réponse, taux de succès
- 🛠️ **Status des 16 outils MCP** : Santé individuelle et performances
- 💾 **Métriques cache** : Hit rate, usage mémoire, compression
- ⚙️ **Monitoring système** : CPU, RAM, uptime
- 📋 **Logs d'activité** : Dernières requêtes et erreurs
- 🔄 **Mise à jour automatique** toutes les 10 secondes

Le dashboard est automatiquement démarré avec le serveur MCP et accessible via le port 3001.

### 📖 Guides et ressources d'apprentissage

#### 🎯 Tutoriels et guides
- **[Guide Docker](GUIDE_INSTALLATION_DOCKER.md)** - Installation Docker pas-à-pas
- **[Guide des 16 Outils MCP](GUIDE_OUTILS_MCP.md)** - Documentation complète de tous les outils avec exemples pratiques
- **[Exemples Avancés](EXEMPLES_AVANCES.md)** - 45+ cas concrets, workflows optimisés, intégrations

#### 📁 Exemples de projets institutionnels

⚠️ **Usage exclusif DSFR** : Ces exemples respectent la réglementation - le DSFR est réservé aux institutions publiques françaises uniquement.

- **[Service public numérique](examples/01-service-public-numerique/)** - Site institutionnel de l'État
- **[Dashboard administratif public](examples/02-app-react-dashboard/)** - Back-office React pour administrations
- **[Portail citoyen et téléservices](examples/03-portail-citoyen/)** - Démarches en ligne et guichet numérique  
- **[Documentation technique publique](examples/04-documentation-site/)** - Portail API gouvernementales

## 📋 Exemples pratiques DSFR

### 🚀 Cas d'usage concrets avec MCP

#### 1. 📝 Formulaire de contact complet
```
Génère un formulaire de contact DSFR avec validation, accessibilité RGAA et gestion d'erreurs
```

**Composants générés** :
- Champs texte avec validation
- Zone de message 
- Boutons d'action
- Messages d'erreur accessibles
- Labels obligatoires

#### 2. 🏠 Page d'accueil institutionnelle
```
Crée une page d'accueil DSFR avec header, navigation, hero section et footer pour une mairie
```

**Éléments inclus** :
- Header avec logo République Française
- Navigation principale accessible
- Section hero avec boutons d'action
- Grille de services
- Footer institutionnel complet

#### 3. 📊 Dashboard administratif
```
Génère un dashboard DSFR pour back-office administratif avec tableaux et graphiques
```

**Fonctionnalités** :
- Navigation latérale
- Cartes de statistiques
- Tableaux de données
- Graphiques intégrés
- Notifications système

#### 4. 🔍 Interface de recherche avancée
```
Crée une interface de recherche DSFR avec filtres, facettes et résultats paginés
```

**Composants** :
- Barre de recherche intelligente
- Filtres par catégories
- Affichage des résultats
- Pagination accessible
- Options de tri

#### 5. 🖼️ Galerie d'images accessible
```
Génère une galerie d'images DSFR conforme RGAA avec lightbox et navigation clavier
```

**Caractéristiques** :
- Grille responsive
- Textes alternatifs
- Navigation clavier
- Lightbox accessible
- Chargement progressif

#### 6. 📱 Page de connexion sécurisée
```
Crée une page de connexion DSFR avec double authentification et récupération mot de passe
```

**Sécurité incluse** :
- Champs sécurisés
- Validation côté client
- Messages d'erreur clairs
- Liens de récupération
- Design responsive

### Exemples de requêtes dans Claude

#### Recherche de composants
```
Recherche tous les composants DSFR liés aux formulaires
```

#### Génération de code
```
Génère un composant bouton DSFR en React avec les variantes primary et secondary
```

#### Validation
```
Vérifie l'accessibilité RGAA de ce code HTML : [votre code]
```

### 🎯 Démonstrations interactives

#### Workflow complet : Création d'un service public numérique

**Étape 1** - Analyse des besoins :
```
Analyse les besoins DSFR pour un site de demande de carte d'identité en ligne
```

**Étape 2** - Génération de la structure :
```
Génère la page principale avec formulaire multi-étapes DSFR pour demande de carte d'identité
```

**Étape 3** - Validation et optimisation :
```
Valide l'accessibilité RGAA 4.1 de cette page et suggère des améliorations
```

**Étape 4** - Export multi-framework :
```
Convertis ce formulaire DSFR en React avec TypeScript pour intégration dans une SPA
```

#### Workflow d'amélioration continue

**Audit existant** :
```
Analyse ce site web institutionnel et identifie les non-conformités DSFR
```

**Migration progressive** :
```
Propose un plan de migration de ce site vers DSFR avec priorisation des composants
```

**Validation continue** :
```
Compare cette implémentation DSFR avec la version officielle et suggère les mises à jour
```

## 🛠️ Outils disponibles (16/16)

### Outils de recherche et documentation (4)

| Outil | Description | Paramètres |
|-------|-------------|------------|
| `search_dsfr_components` | Recherche des composants | `query`, `category`, `limit` |
| `get_component_details` | Détails d'un composant | `component_name` |
| `list_dsfr_categories` | Liste des catégories | - |
| `search_patterns` | Recherche de patterns | `query`, `pattern_type` |

### Outils de génération (3)

| Outil | Description | Paramètres |
|-------|-------------|------------|
| `generate_dsfr_component` | Génère un composant avancé avec TypeScript et accessibilité | `component_type`, `framework`, `options` |
| `generate_dsfr_template` | Génère un template | `template_name`, `framework` |
| `create_dsfr_theme` | Crée un thème avec palette couleurs, mode sombre et SCSS | `theme_name`, `primary_color`, `secondary_color`, `custom_variables` |

### Outils de validation (2)

| Outil | Description | Paramètres |
|-------|-------------|------------|
| `validate_dsfr_html` | Valide le HTML DSFR | `html_code`, `strict_mode` |
| `check_accessibility` | Vérifie l'accessibilité | `html_code`, `rgaa_level` |

### Outils utilitaires (3)

| Outil | Description | Paramètres |
|-------|-------------|------------|
| `convert_to_framework` | Conversion intelligente HTML vers React/Vue/Angular avec analyse | `html_code`, `target_framework`, `component_name` |
| `get_dsfr_icons` | Liste les icônes | `category`, `search` |
| `get_dsfr_colors` | Palette de couleurs avec utilitaires CSS | `include_utilities`, `format` |

### Outils avancés (4) - Nouveaux en v1.4.1

| Outil | Description | Paramètres |
|-------|-------------|------------|
| `analyze_dsfr_usage` | Analyse complète d'utilisation DSFR avec détection automatique | `html_code`, `framework_detection` |
| `suggest_improvements` | Suggestions d'améliorations par catégories (accessibilité, conformité, performance) | `html_code`, `categories`, `priority` |
| `compare_versions` | Comparaison versions DSFR avec guide de migration | `current_version`, `target_version` |
| `export_documentation` | Export documentation personnalisée multi-format | `format`, `content_filter`, `branding` |

## 🏗️ Architecture

### Architecture V2 + Parser V2 - Performance maximale 🚀

**Performances exceptionnelles** :
- **Démarrage 99% plus rapide** (149ms → 1.6ms)
- **Parser 4.2x plus rapide** avec js-yaml et traitement parallèle
- **Débit exceptionnel** : Jusqu'à 127,000 fichiers/sec
- **Recherche ultra-rapide** : < 0.1ms par requête

```
DSFR-MCP/
├── src/
│   ├── index.js              # Point d'entrée unique avec logique production
│   ├── core/                 # Architecture V2
│   │   ├── container.js      # Container DI avec lifecycles
│   │   ├── disposable.js     # Gestion mémoire et ressources
│   │   ├── interfaces.js     # Contrats et interfaces services
│   │   └── lru-cache.js      # Cache LRU intelligent avec compression
│   ├── services/             # Services optimisés
│   │   ├── config-service.js         # Configuration centralisée
│   │   ├── logger-service.js         # Logging MCP-compatible
│   │   ├── cache-service.js          # Cache intelligent LRU+compression
│   │   ├── yaml-parser-service.js    # Parser YAML robuste avec js-yaml
│   │   ├── search-index-service.js   # Index recherche avec facettes
│   │   ├── dsfr-parser-v2.js         # Parser complet optimisé
│   │   ├── documentation-service-v2.js # Service docs optimisé
│   │   ├── html-analyzer.js          # Analyseur HTML avancé
│   │   ├── icon-database.js          # Base d'icônes DSFR avec prévisualisation
│   │   ├── generator-optimized.js    # Générateur optimisé
│   │   └── [autres services...]      # Services V1 et utilitaires
│   ├── repositories/         # Pattern Repository
│   │   └── documentation-repository.js # Repository avec lazy loading
│   └── templates/            # Templates EJS prédéfinis
├── docker/                   # Infrastructure Docker complète
│   ├── scripts/              # Scripts d'installation automatique
│   │   ├── configure-claude.sh   # Configuration macOS/Linux
│   │   └── configure-claude.ps1  # Configuration Windows
│   └── [configs...]          # Configurations Docker et monitoring
├── fiches-markdown-v2/       # 213 fiches de documentation nettoyées
├── data/                     # Données extraites et index
├── examples/                 # 4 projets institutionnels complets
├── test/                     # Tests unitaires et intégration
│   ├── unit/                 # Tests unitaires des services
│   ├── integration/          # Tests d'intégration MCP tools
│   └── performance/          # Tests de charge et benchmarks
├── scripts/                  # Scripts de nettoyage et validation
└── docs/                     # Documentation technique
```

### 🎯 Fonctionnalités V2

#### 🏗️ Architecture V2
- **Container DI** : Injection de dépendances avec résolution automatique
- **Cache intelligent** : LRU, compression gzip, gestion mémoire (50MB)
- **Services découplés** : Interfaces claires, initialization parallèle  
- **Repository pattern** : Lazy loading et optimisation des accès données
- **Métriques** : Monitoring performance et utilisation mémoire

#### ⚡ Phase 2.2 Parser V2
- **Parser YAML robuste** : js-yaml avec validation JSON Schema automatique
- **Parsing parallèle** : Concurrence configurable jusqu'à 8 threads
- **Index de recherche avancé** : Fuse.js avec facettes et filtres personnalisés
- **Cache persistant** : Index sauvegardé sur disque avec compression
- **API de recherche complète** : Tri multi-critères, pagination, highlights
- **Performances exceptionnelles** : 4.2x plus rapide, 127k fichiers/sec

#### 🔄 Compatibilité
- **Rétrocompatibilité** : V1 maintenue pour transition graduelle
- **Migration graduelle** : V2 utilisable indépendamment

## 💻 Développement

### Installation pour le développement

```bash
# Cloner avec les sous-modules
git clone --recursive https://github.com/Alexmacapple/DSFR-MCP.git

# Installer les dépendances de développement
npm install --include=dev

# Lancer les tests en mode watch
npm run test:watch
```

### Scripts disponibles

```bash
npm start                    # Démarre le serveur
npm run dev                  # Mode développement avec watch
npm test                     # Lance tous les tests (43/43 passed)
npm run test:unit            # Tests unitaires uniquement
npm run test:integration     # Tests d'intégration MCP tools + Parser V2
npm run benchmark             # 🆕 Benchmark complet des performances
npm run quick-benchmark       # 🆕 Benchmark rapide de validation
npm run test:performance     # Tests de performance
npm run lint                 # Vérifie le code
npm run lint:fix             # Corrige automatiquement
npm run build:index         # Build de l'index de recherche

# Scripts de nettoyage des données
npm run verify-data          # Vérifie l'intégrité des 213 fiches
npm run standardize-files    # Standardise les noms de fichiers
npm run validate-metadata    # Valide les métadonnées YAML
```

### Structure du code

Le projet suit une architecture modulaire avec séparation des responsabilités :

- **Services** : Logique métier isolée et testable
- **Config** : Configuration centralisée
- **Templates** : Modèles réutilisables
- **Tests** : Couverture complète avec Jest

## 🧪 Tests

### Lancer les tests

```bash
# Tous les tests
npm test

# Tests unitaires
npm run test:unit

# Tests d'intégration
npm run test:integration

# Couverture de code
npm run test:coverage
```

### Écrire des tests

Les tests sont écrits avec Jest et suivent la convention :

```javascript
describe('ServiceName', () => {
  it('should perform expected action', async () => {
    // Arrange
    const service = new ServiceName();
    
    // Act
    const result = await service.method();
    
    // Assert
    expect(result).toBeDefined();
  });
});
```

## 🤝 Contribution

Les contributions sont les bienvenues ! Veuillez suivre ces étapes :

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

### Guidelines

- Suivre les conventions de code ESLint
- Ajouter des tests pour toute nouvelle fonctionnalité
- Mettre à jour la documentation
- Utiliser des commits conventionnels

## 📞 Support

### Documentation

- **[Guide d'installation Docker](GUIDE_INSTALLATION_DOCKER.md)** - Installation complète Docker
- **[Guide des 16 Outils MCP](GUIDE_OUTILS_MCP.md)** - Documentation complète de tous les outils avec exemples pratiques
- **[Exemples Avancés](EXEMPLES_AVANCES.md)** - 45+ cas concrets, workflows optimisés, intégrations
- **[Roadmap et évolutions](ROADMAP.md)** - Feuille de route du projet
- **[Exemples de projets institutionnels](examples/)** - 4 projets conformes à l'usage exclusif DSFR

### Obtenir de l'aide

- 🐛 Issues : [GitHub Issues](https://github.com/Alexmacapple/DSFR-MCP/issues) - Signaler un problème ou faire une suggestion
- 📖 Documentation : Guides intégrés dans le repository

### Checklist de dépannage

- [ ] Node.js version 18+ installé
- [ ] `npm install` exécuté avec succès
- [ ] `npm test` passe sans erreur
- [ ] Configuration MCP correcte
- [ ] Claude Desktop redémarré

## 📝 Changelog

Consultez le [CHANGELOG.md](CHANGELOG.md) pour voir toutes les modifications, améliorations et corrections de ce projet.

### Versions importantes
- **[v1.0.0](https://github.com/Alexmacapple/DSFR-MCP/releases/tag/v1.0.0)** - Version stable de référence
- **v1.5.0** - Version courante avec optimisations ESLint et exemples pratiques

## 📜 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🙏 Remerciements

- L'équipe du **Système de Design de l'État Français** pour leur excellent travail
- **Anthropic** pour le protocole MCP
- Tous les contributeurs qui ont aidé à améliorer ce projet

---

**Fait avec ❤️ pour faciliter l'utilisation du DSFR**
