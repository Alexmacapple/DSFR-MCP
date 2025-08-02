# 🇫🇷 DSFR-MCP - Model Context Protocol pour le Système de Design de l'État Français

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/DSFR-MCP)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

Serveur MCP (Model Context Protocol) complet pour le Système de Design de l'État Français (DSFR). Ce serveur permet d'accéder à toute la documentation DSFR, aux composants, aux patterns et aux outils de validation directement depuis Claude Desktop ou tout autre client MCP compatible.

## 🚀 Fonctionnalités principales

- **📚 Documentation complète** : Accès aux 213 fiches de documentation DSFR
- **🔍 Recherche intelligente** : Recherche fuzzy dans tous les composants et patterns
- **🛠️ Génération de code** : Création automatique de composants pour différents frameworks
- **✅ Validation** : Vérification de la conformité DSFR et de l'accessibilité RGAA
- **🎨 Personnalisation** : Création de thèmes et adaptation des composants
- **📦 Code source analysé** : Parsing complet du code source DSFR officiel

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

### Pré-requis

- **Node.js** version 18.0.0 ou supérieure
- **npm** version 9.0.0 ou supérieure
- **Claude Desktop** (ou un autre client MCP)

### Installation rapide

```bash
# Cloner le projet
git clone https://github.com/votre-repo/DSFR-MCP.git
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
| `generate_dsfr_component` | Génère un composant | `component_type`, `framework`, `options` |
| `generate_dsfr_template` | Génère un template | `template_name`, `framework` |
| `create_dsfr_theme` | Crée un thème personnalisé | `theme_name`, `colors` |

### Outils de validation

| Outil | Description | Paramètres |
|-------|-------------|------------|
| `validate_dsfr_html` | Valide le HTML DSFR | `html_code`, `strict_mode` |
| `check_accessibility` | Vérifie l'accessibilité | `html_code`, `rgaa_level` |

### Outils utilitaires

| Outil | Description | Paramètres |
|-------|-------------|------------|
| `convert_to_framework` | Convertit vers framework | `html_code`, `target_framework` |
| `get_dsfr_icons` | Liste les icônes | `category`, `search` |
| `get_dsfr_colors` | Palette de couleurs | `format` |

## 🏗️ Architecture

```
DSFR-MCP/
├── src/
│   ├── index.js              # Point d'entrée principal
│   ├── config.js             # Configuration centralisée
│   ├── services/
│   │   ├── documentation.js  # Gestion de la documentation
│   │   ├── validation.js     # Service de validation
│   │   ├── generator.js      # Génération de code
│   │   ├── template.js       # Gestion des templates
│   │   ├── accessibility.js  # Vérification RGAA
│   │   └── dsfr-source-parser.js # Parser du code source
│   └── templates/            # Templates prédéfinis
├── fiches-markdown-v2/       # 213 fiches de documentation
├── data/                     # Données extraites et index
├── test/                     # Tests unitaires et intégration
├── scripts/                  # Scripts utilitaires
└── docs/                     # Documentation additionnelle
```

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
npm start          # Démarre le serveur
npm run dev        # Mode développement avec watch
npm test           # Lance tous les tests
npm run test:unit  # Tests unitaires uniquement
npm run test:e2e   # Tests end-to-end
npm run lint       # Vérifie le code
npm run lint:fix   # Corrige automatiquement
npm run build      # Build de production
npm run docs       # Génère la documentation
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
