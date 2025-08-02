# Changelog

Tous les changements notables de ce projet seront documentés dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
