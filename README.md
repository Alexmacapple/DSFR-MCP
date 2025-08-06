# 🇫🇷 DSFR-MCP - Model Context Protocol pour le Système de Design de l'État Français

[![Version](https://img.shields.io/badge/version-1.3.0-blue.svg)](https://github.com/Alexmacapple/DSFR-MCP)
[![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=flat&logo=docker&logoColor=white)](https://docker.com)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/tests-43%2F43%20passed-brightgreen.svg)](#tests)
[![Performance](https://img.shields.io/badge/parser-4.2x%20faster-brightgreen.svg)](#phase-22-parser-v2)

Serveur MCP (Model Context Protocol) complet pour le Système de Design de l'État Français (DSFR). Ce serveur permet d'accéder à toute la documentation DSFR, aux composants, aux patterns et aux outils de validation directement depuis Claude Desktop ou tout autre client MCP compatible.

## 🚀 Fonctionnalités principales

- **📚 Documentation complète** : Accès aux 213 fiches de documentation DSFR nettoyées et organisées dans une structure v2 optimisée
- **🔍 Recherche intelligente** : Recherche fuzzy avec facettes et filtres avancés, indexation ultra-rapide (< 0.1ms par requête)
- **⚡ Parser V2 haute performance** : **4.2x plus rapide** avec js-yaml, validation schéma automatique, parsing parallèle jusqu'à 127,000 fichiers/sec
- **🛠️ Génération de code avancée** : Création automatique de composants React, Vue, Angular avec templates TypeScript et guides d'accessibilité
- **✅ Validation robuste** : Vérification approfondie de la conformité DSFR et de l'accessibilité RGAA avec scoring automatique
- **🎨 Personnalisation complète** : Création de thèmes avec palettes de couleurs, mode sombre, et mixins SCSS automatiques
- **📦 Architecture V2 optimisée** : Injection de dépendances, cache intelligent LRU, services découplés (99% plus rapide au démarrage)
- **🧹 Données nettoyées** : Déduplication automatique et validation d'intégrité des 213 fiches markdown
- **🎯 12/12 outils MCP** : Tous les outils MCP fonctionnels avec tests d'intégration complets

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

### Script d'installation automatique

Pour une installation encore plus simple :

```bash
# Donner les droits d'exécution
chmod +x install.sh

# Lancer l'installation
./install.sh
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
      "command": "node",
      "args": ["src/index.js"],
      "cwd": "/chemin/absolu/vers/DSFR-MCP"
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

### Démarrage du serveur

```bash
# Mode production
npm start

# Mode développement (avec rechargement automatique)
npm run dev
```

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

## 🛠️ Outils disponibles

### Outils de recherche et documentation

| Outil | Description | Paramètres |
|-------|-------------|------------|
| `search_dsfr_components` | Recherche des composants | `query`, `category`, `limit` |
| `get_component_details` | Détails d'un composant | `component_name` |
| `list_dsfr_categories` | Liste des catégories | - |
| `search_patterns` | Recherche de patterns | `query`, `pattern_type` |

### Outils de génération

| Outil | Description | Paramètres |
|-------|-------------|------------|
| `generate_dsfr_component` | Génère un composant avancé avec TypeScript et accessibilité | `component_type`, `framework`, `options` |
| `generate_dsfr_template` | Génère un template | `template_name`, `framework` |
| `create_dsfr_theme` | Crée un thème avec palette couleurs, mode sombre et SCSS | `theme_name`, `primary_color`, `secondary_color`, `custom_variables` |

### Outils de validation

| Outil | Description | Paramètres |
|-------|-------------|------------|
| `validate_dsfr_html` | Valide le HTML DSFR | `html_code`, `strict_mode` |
| `check_accessibility` | Vérifie l'accessibilité | `html_code`, `rgaa_level` |

### Outils utilitaires

| Outil | Description | Paramètres |
|-------|-------------|------------|
| `convert_to_framework` | Conversion intelligente HTML vers React/Vue/Angular avec analyse | `html_code`, `target_framework`, `component_name` |
| `get_dsfr_icons` | Liste les icônes | `category`, `search` |
| `get_dsfr_colors` | Palette de couleurs avec utilitaires CSS | `include_utilities`, `format` |

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
│   ├── index.js              # Point d'entrée V1 (legacy)
│   ├── index-v2.js           # Point d'entrée V2 optimisé
│   ├── index-docker.js       # 🆕 Point d'entrée Docker avec keep-alive
│   ├── core/                 # 🆕 Architecture V2
│   │   ├── container.js      # Container DI avec lifecycles
│   │   └── interfaces.js     # Contrats et interfaces services
│   ├── services/             # Services optimisés
│   │   ├── config-service.js         # 🆕 Configuration centralisée
│   │   ├── logger-service.js         # 🆕 Logging MCP-compatible
│   │   ├── cache-service.js          # 🆕 Cache intelligent LRU+compression
│   │   ├── yaml-parser-service.js    # 🆕 Parser YAML robuste avec js-yaml
│   │   ├── search-index-service.js   # 🆕 Index recherche avec facettes
│   │   ├── dsfr-parser-v2.js         # 🆕 Parser complet optimisé
│   │   ├── documentation-service-v2.js # 🆕 Service docs optimisé
│   │   ├── documentation.js          # Service original (V1)
│   │   ├── validation.js             # Service de validation
│   │   ├── generator.js              # Génération de code
│   │   ├── template.js               # Gestion des templates
│   │   ├── accessibility.js          # Vérification RGAA
│   │   └── dsfr-source-parser.js     # Parser du code source
│   ├── repositories/         # 🆕 Pattern Repository
│   │   └── documentation-repository.js # Repository avec lazy loading
│   └── templates/            # Templates prédéfinis
├── docker/                   # 🆕 Infrastructure Docker complète
│   ├── scripts/              # Scripts d'installation automatique
│   │   ├── configure-claude.sh   # Configuration macOS/Linux
│   │   └── configure-claude.ps1  # Configuration Windows
│   ├── config/               # Configurations Docker
│   └── prometheus/           # Configuration monitoring
├── Dockerfile                # 🆕 Image multi-stage optimisée
├── docker-compose.yml        # 🆕 Services Docker avec profiles
├── GUIDE_INSTALLATION_DOCKER.md # 🆕 Guide complet Docker
├── fiches-markdown-v2/       # 213 fiches de documentation nettoyées
├── data/                     # Données extraites et index
├── test/                     # Tests unitaires et intégration (43/43 passed)
│   ├── unit/                 # Tests unitaires des services
│   └── integration/          # Tests d'intégration MCP tools + Architecture V2 + Parser V2
├── benchmark-parser-v2.js    # 🆕 Benchmark performance détaillé
├── quick-benchmark.js        # 🆕 Benchmark rapide validation
├── scripts/                  # Scripts de nettoyage et validation
│   ├── verify-data-integrity.js     # Validation intégrité données
│   ├── standardize-filenames.js     # Standardisation noms fichiers
│   └── validate-yaml-metadata.js    # Validation métadonnées YAML
└── docs/                     # Documentation additionnelle
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
git clone --recursive https://github.com/votre-repo/DSFR-MCP.git

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
npm run test:e2e             # Tests end-to-end
npm run lint                 # Vérifie le code
npm run lint:fix             # Corrige automatiquement
npm run build                # Build de production
npm run docs                 # Génère la documentation

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

- [Guide d'installation détaillé](GUIDE_INSTALLATION_MCP_CLAUDE.md)
- [Documentation API](docs/API.md)
- [FAQ](docs/FAQ.md)

### Obtenir de l'aide

- 📧 Email : support@dsfr-mcp.fr
- 💬 Discord : [Rejoindre le serveur](https://discord.gg/dsfr-mcp)
- 🐛 Issues : [GitHub Issues](https://github.com/votre-repo/DSFR-MCP/issues)

### Checklist de dépannage

- [ ] Node.js version 18+ installé
- [ ] `npm install` exécuté avec succès
- [ ] `npm test` passe sans erreur
- [ ] Configuration MCP correcte
- [ ] Claude Desktop redémarré

## 📜 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🙏 Remerciements

- L'équipe du **Système de Design de l'État Français** pour leur excellent travail
- **Anthropic** pour le protocole MCP
- Tous les contributeurs qui ont aidé à améliorer ce projet

---

**Fait avec ❤️ pour faciliter l'utilisation du DSFR**
