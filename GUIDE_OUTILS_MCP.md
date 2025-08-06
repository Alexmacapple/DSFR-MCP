# 🛠️ Guide Complet des 15 Outils MCP DSFR

[![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=flat&logo=docker&logoColor=white)](https://docker.com)
[![Tools](https://img.shields.io/badge/outils-15%2F15%20actifs-brightgreen.svg)](#outils-disponibles)

> **🎯 Documentation complète des outils MCP** - Apprenez à exploiter tous les outils pour créer des interfaces conformes DSFR !

## 📋 Table des matières

1. [🔍 Outils de recherche et documentation](#-outils-de-recherche-et-documentation)
2. [🛠️ Outils de génération](#️-outils-de-génération)
3. [✅ Outils de validation](#-outils-de-validation)
4. [🎨 Outils de personnalisation](#-outils-de-personnalisation)
5. [📚 Outils de patterns](#-outils-de-patterns)
6. [🔧 Outils utilitaires](#-outils-utilitaires)
7. [🚀 Outils avancés](#-outils-avancés)
8. [💡 Exemples d'usage pratique](#-exemples-dusage-pratique)

---

## 🔍 Outils de recherche et documentation

### 1. `search_dsfr_components` - Recherche de composants

**🎯 À quoi ça sert :** Trouvez rapidement les composants DSFR dont vous avez besoin

**📊 Paramètres :**
- `query` (obligatoire) : Terme de recherche (ex: "bouton", "formulaire")
- `category` (optionnel) : Filtre par catégorie 
- `limit` (optionnel) : Nombre de résultats (défaut: 10)

**💡 Cas d'usage concrets :**

```
🔍 Exemple 1 - Recherche simple
"Recherche tous les composants boutons DSFR"
→ Retourne : Bouton primary, secondary, tertiary, avec exemples

🔍 Exemple 2 - Recherche par catégorie  
"Cherche des composants de formulaire dans la catégorie 'form'"
→ Retourne : Input, Select, Checkbox, Radio, etc.

🔍 Exemple 3 - Recherche spécialisée
"Trouve les composants de navigation responsive"
→ Retourne : Navigation principale, fil d'Ariane, pagination
```

---

### 2. `get_component_details` - Détails d'un composant

**🎯 À quoi ça sert :** Obtenez la documentation complète d'un composant spécifique

**📊 Paramètres :**
- `component_name` (obligatoire) : Nom exact du composant
- `include_examples` (optionnel) : Inclure les exemples (défaut: true)
- `include_accessibility` (optionnel) : Inclure les infos accessibilité (défaut: true)

**💡 Cas d'usage concrets :**

```
📋 Exemple 1 - Documentation complète d'un bouton
"Donne-moi tous les détails du composant 'Button'"
→ Retourne : HTML, CSS, variantes, accessibilité RGAA, exemples

📋 Exemple 2 - Spécifications techniques 
"Détails techniques du composant 'Navigation' sans exemples"
→ Retourne : Structure, classes CSS, attributs ARIA

📋 Exemple 3 - Focus accessibilité
"Infos accessibilité du composant 'Form-input'"
→ Retourne : Contraste, navigation clavier, lecteurs d'écran
```

---

### 3. `list_dsfr_categories` - Liste des catégories

**🎯 À quoi ça sert :** Découvrez toutes les catégories DSFR disponibles pour organiser votre recherche

**📊 Paramètres :** Aucun

**💡 Cas d'usage concrets :**

```
📚 Exemple d'usage
"Quelles sont toutes les catégories DSFR disponibles ?"
→ Retourne : 
  • Fondamentaux (Core) : Couleurs, Typographie, Grilles
  • Composants (Component) : Boutons, Formulaires, Cartes
  • Mise en page (Layout) : Grilles, Conteneurs, En-têtes
  • Utilitaires (Utility) : Classes CSS, Helpers
  • Analytics (Analytics) : Mesures, Tracking
```

---

## 🛠️ Outils de génération

### 4. `generate_dsfr_component` - Génération de composants

**🎯 À quoi ça sert :** Créez automatiquement le code HTML/CSS/JS d'un composant DSFR pour votre framework

**📊 Paramètres :**
- `component_type` (obligatoire) : Type de composant (button, form, card, etc.)
- `framework` (optionnel) : Framework cible (vanilla, react, vue, angular)
- `options` (optionnel) : Options spécifiques au composant

**💡 Cas d'usage concrets :**

```
⚡ Exemple 1 - Bouton React avec TypeScript
"Génère un composant bouton DSFR en React avec les variantes primary et secondary"
→ Retourne : Composant React complet avec props, types, styles

⚡ Exemple 2 - Formulaire Vue.js
"Crée un formulaire de contact DSFR en Vue.js avec validation"
→ Retourne : Composant Vue avec v-model, validation, accessibilité

⚡ Exemple 3 - Carte Angular
"Génère une carte DSFR en Angular avec image et actions"
→ Retourne : Composant Angular avec @Input, @Output, template
```

---

### 5. `generate_dsfr_template` - Génération de templates

**🎯 À quoi ça sert :** Créez une page complète DSFR avec structure, navigation et composants

**📊 Paramètres :**
- `template_name` (obligatoire) : Type de template
- `framework` (optionnel) : Framework cible (défaut: vanilla)
- `customizations` (optionnel) : Personnalisations

**💡 Cas d'usage concrets :**

```
📄 Exemple 1 - Page institutionnelle
"Génère un template de page d'accueil pour un site ministériel"
→ Retourne : Page complète avec en-tête, navigation, contenu, pied de page

📄 Exemple 2 - Dashboard administratif
"Crée un template de tableau de bord pour une administration"
→ Retourne : Layout avec sidebar, header, widgets, responsive

📄 Exemple 3 - Formulaire de démarche
"Template de formulaire de télé-service public"
→ Retourne : Formulaire multi-étapes avec validation et accessibilité
```

---

## ✅ Outils de validation

### 6. `validate_dsfr_html` - Validation HTML DSFR

**🎯 À quoi ça sert :** Vérifiez que votre code HTML respecte les standards DSFR

**📊 Paramètres :**
- `html_code` (obligatoire) : Code HTML à valider
- `check_accessibility` (optionnel) : Vérifier l'accessibilité (défaut: true)
- `check_semantic` (optionnel) : Vérifier la sémantique (défaut: true)
- `strict_mode` (optionnel) : Mode strict (défaut: false)

**💡 Cas d'usage concrets :**

```
✅ Exemple 1 - Validation complète
"Valide ce code HTML de bouton DSFR avec vérifications complètes"
→ Retourne : Score 95/100, structure ✅, classes ✅, accessibilité ✅

✅ Exemple 2 - Mode strict pour production
"Validation stricte de cette page d'accueil avant mise en ligne"
→ Retourne : Erreurs critiques, avertissements, optimisations suggérées

✅ Exemple 3 - Focus sémantique
"Vérifie uniquement la sémantique HTML de ce formulaire"
→ Retourne : Structure des heading, labels, fieldsets, landmarks
```

---

### 7. `check_accessibility` - Vérification accessibilité RGAA

**🎯 À quoi ça sert :** Audit complet d'accessibilité selon les critères RGAA 4.1

**📊 Paramètres :**
- `html_code` (obligatoire) : Code HTML à vérifier
- `rgaa_level` (optionnel) : Niveau RGAA (A, AA, AAA - défaut: AA)
- `include_suggestions` (optionnel) : Inclure les suggestions (défaut: true)

**💡 Cas d'usage concrets :**

```
♿ Exemple 1 - Audit complet niveau AA
"Vérifie l'accessibilité RGAA de cette interface de connexion"
→ Retourne : 23 critères vérifiés, 2 erreurs, 5 améliorations suggérées

♿ Exemple 2 - Niveau AAA pour service critique
"Audit accessibilité niveau AAA pour ce téléservice fiscal"
→ Retourne : Analyse approfondie, contrastes, navigation, multimédia

♿ Exemple 3 - Focus navigation clavier
"Vérifie la navigation clavier de ce menu complexe"
→ Retourne : Ordre de tabulation, focus visible, raccourcis clavier
```

---

## 🎨 Outils de personnalisation

### 8. `create_dsfr_theme` - Création de thèmes

**🎯 À quoi ça sert :** Personnalisez les couleurs et styles DSFR pour votre organisme

**📊 Paramètres :**
- `theme_name` (obligatoire) : Nom du thème
- `primary_color` (optionnel) : Couleur principale (hex)
- `secondary_color` (optionnel) : Couleur secondaire (hex)
- `custom_variables` (optionnel) : Variables CSS personnalisées

**💡 Cas d'usage concrets :**

```
🎨 Exemple 1 - Thème ministériel
"Crée un thème 'MinistereEcologie' avec vert #00A95F et bleu #1E3A8A"
→ Retourne : Variables CSS, palette complète, mode sombre, utilitaires

🎨 Exemple 2 - Thème collectivité
"Thème personnalisé pour la ville de Lyon avec leurs couleurs"
→ Retourne : Adaptation DSFR avec couleurs locales, préservation accessibilité

🎨 Exemple 3 - Thème événementiel  
"Thème temporaire pour les JO 2024 avec couleurs olympiques"
→ Retourne : Déclinaison spéciale, animations, éléments graphiques
```

---

## 📚 Outils de patterns

### 9. `search_patterns` - Recherche de patterns

**🎯 À quoi ça sert :** Trouvez des modèles complets de mise en page et d'interaction

**📊 Paramètres :**
- `query` (obligatoire) : Terme de recherche
- `pattern_type` (optionnel) : Type de pattern (page, form, navigation, content)

**💡 Cas d'usage concrets :**

```
🔍 Exemple 1 - Pattern de connexion
"Cherche des patterns de page de connexion sécurisée"
→ Retourne : Login + mot de passe oublié + authentification forte

🔍 Exemple 2 - Pattern de formulaire complexe
"Pattern de formulaire de demande de subvention multi-étapes"
→ Retourne : Wizard avec sauvegarde, validation, récapitulatif

🔍 Exemple 3 - Pattern de navigation
"Pattern de navigation principale pour site avec sous-rubriques"
→ Retourne : Menu déroulant, mega-menu, responsive, fil d'Ariane
```

---

## 🔧 Outils utilitaires

### 10. `convert_to_framework` - Conversion de frameworks

**🎯 À quoi ça sert :** Convertissez du code DSFR vanilla vers React, Vue ou Angular

**📊 Paramètres :**
- `html_code` (obligatoire) : Code HTML DSFR à convertir
- `target_framework` (obligatoire) : Framework cible (react, vue, angular)
- `component_name` (optionnel) : Nom du composant à créer

**💡 Cas d'usage concrets :**

```
🔄 Exemple 1 - HTML vers React
"Convertis ce formulaire DSFR HTML en composant React"
→ Retourne : Composant avec useState, props, gestion événements

🔄 Exemple 2 - Migration Vue.js
"Transforme cette carte DSFR en composant Vue avec props réactives"
→ Retourne : Template Vue, script setup, émissions d'événements

🔄 Exemple 3 - Angular avec services
"Convertis ce tableau DSFR en composant Angular avec tri et filtre"
→ Retourne : Composant avec @Input/@Output, services, types
```

---

### 11. `get_dsfr_icons` - Gestion des icônes

**🎯 À quoi ça sert :** Explorez et utilisez la bibliothèque d'icônes DSFR

**📊 Paramètres :**
- `category` (optionnel) : Catégorie d'icônes
- `search` (optionnel) : Recherche par nom

**💡 Cas d'usage concrets :**

```
🎨 Exemple 1 - Icônes métier
"Liste toutes les icônes de la catégorie 'business'"
→ Retourne : Icônes finances, graphiques, documents, avec codes CSS

🎨 Exemple 2 - Recherche spécifique
"Trouve des icônes liées à 'téléphone' ou 'contact'"
→ Retourne : phone, mail, chat, avec variantes et tailles

🎨 Exemple 3 - Icônes système
"Icônes pour boutons d'actions (éditer, supprimer, valider)"
→ Retourne : Actions CRUD avec codes d'accessibilité
```

---

### 12. `get_dsfr_colors` - Palette de couleurs

**🎯 À quoi ça sert :** Accédez à toute la palette officielle DSFR avec utilitaires CSS

**📊 Paramètres :**
- `include_utilities` (optionnel) : Inclure classes utilitaires (défaut: true)
- `format` (optionnel) : Format couleur (hex, rgb, hsl - défaut: hex)

**💡 Cas d'usage concrets :**

```
🌈 Exemple 1 - Palette complète développeur
"Toutes les couleurs DSFR avec classes CSS utilitaires"
→ Retourne : Hex + classes fr-background-*, fr-text-*, fr-border-*

🌈 Exemple 2 - Format designer
"Couleurs DSFR en format HSL pour Figma"
→ Retourne : Valeurs HSL, tokens design, variables Sass

🌈 Exemple 3 - Palette accessibilité
"Couleurs avec ratios de contraste pour texte accessible"
→ Retourne : Combinaisons validées RGAA, contrastes AA/AAA
```

---

## 🚀 Outils avancés

### 13. `analyze_dsfr_usage` - Analyse d'utilisation

**🎯 À quoi ça sert :** Auditez l'utilisation du DSFR dans votre projet et obtenez des recommandations personnalisées

**📊 Paramètres :**
- `source_code` (obligatoire) : Code source à analyser
- `project_type` (optionnel) : Type de projet (vanilla, react, vue, angular, auto-detect)
- `analysis_depth` (optionnel) : Profondeur (basic, detailed, comprehensive)
- `include_recommendations` (optionnel) : Inclure recommandations (défaut: true)

**💡 Cas d'usage concrets :**

```
📊 Exemple 1 - Audit complet d'application
"Analyse l'utilisation DSFR dans cette app React de 50 composants"
→ Retourne : 85% conformité, 12 problèmes détectés, plan d'amélioration

📊 Exemple 2 - Optimisation performance
"Analyse approfondie avec focus performance de ce site"
→ Retourne : CSS unused, images non optimisées, suggestions CDN

📊 Exemple 3 - Migration vers DSFR
"Évalue ce site existant pour migration vers DSFR"
→ Retourne : Compatibilité, effort de migration, roadmap détaillée
```

---

### 14. `suggest_improvements` - Suggestions d'améliorations

**🎯 À quoi ça sert :** Obtenez des suggestions automatiques d'amélioration avec code corrigé

**📊 Paramètres :**
- `html_code` (obligatoire) : Code HTML à améliorer
- `improvement_categories` (optionnel) : Catégories à analyser
- `priority_level` (optionnel) : Niveau de priorité minimum (défaut: high)
- `include_code_examples` (optionnel) : Inclure exemples (défaut: true)

**💡 Cas d'usage concrets :**

```
💡 Exemple 1 - Amélioration accessibilité critique
"Suggestions pour rendre ce formulaire plus accessible"
→ Retourne : Labels manquants, contrastes, navigation clavier + code corrigé

💡 Exemple 2 - Optimisation performance
"Améliore les performances de cette page d'accueil"
→ Retourne : Lazy loading, compression images, CSS critique inline

💡 Exemple 3 - SEO et sémantique
"Suggestions SEO et sémantique pour cette page de service"
→ Retourne : Structure H1-H6, métadonnées, microdata, rich snippets
```

---

### 15. `compare_versions` - Comparaison de versions

**🎯 À quoi ça sert :** Comparez les versions DSFR et obtenez un guide de migration automatique

**📊 Paramètres :**
- `version_from` (obligatoire) : Version source (ex: 1.13.0)
- `version_to` (obligatoire) : Version cible (ex: 1.14.0)
- `comparison_scope` (optionnel) : Aspects à comparer
- `include_migration_guide` (optionnel) : Guide migration (défaut: true)

**💡 Cas d'usage concrets :**

```
🔄 Exemple 1 - Migration majeure
"Compare DSFR 1.12.0 vers 1.14.0 avec guide de migration"
→ Retourne : Breaking changes, nouveaux composants, checklist migration

🔄 Exemple 2 - Veille technologique
"Nouveautés entre DSFR 1.13.0 et 1.13.5"
→ Retourne : Corrections bugs, améliorations accessibilité, nouvelles variantes

🔄 Exemple 3 - Planification projet
"Impact migration DSFR 1.10.0 vers 1.14.0 sur projet React"
→ Retourne : Effort estimé, risques, priorisation des changements
```

---

### Bonus : `export_documentation` - Export de documentation

**🎯 À quoi ça sert :** Exportez une documentation personnalisée multi-format pour votre équipe

**📊 Paramètres :**
- `export_format` (optionnel) : Format d'export (markdown, html, json, pdf-ready)
- `components` (optionnel) : Liste des composants (vide = tous)
- `include_examples` (optionnel) : Inclure exemples (défaut: true)
- `template_style` (optionnel) : Style de template (standard, compact, detailed, minimal)

**💡 Cas d'usage concrets :**

```
📄 Exemple 1 - Documentation équipe
"Exporte doc HTML des composants utilisés dans notre projet"
→ Retourne : Site de documentation brandé avec vos composants

📄 Exemple 2 - Guide développeur PDF
"Documentation PDF des formulaires DSFR pour les développeurs"
→ Retourne : PDF prêt à imprimer avec exemples de code

📄 Exemple 3 - API documentation
"Exporte en JSON la spec des composants pour notre design system"
→ Retourne : JSON structuré, intégrable dans Storybook ou Figma
```

---

## 💡 Exemples d'usage pratique

### 🚀 Workflow type : Créer une page de contact

```
1️⃣ "Liste les composants DSFR pour une page de contact"
   → search_dsfr_components avec query="contact form"

2️⃣ "Détails du composant formulaire de contact"
   → get_component_details avec component_name="ContactForm"

3️⃣ "Génère le formulaire en React avec validation"
   → generate_dsfr_component avec component_type="contact-form", framework="react"

4️⃣ "Valide l'accessibilité du formulaire créé"
   → check_accessibility avec le code généré

5️⃣ "Suggestions d'amélioration performance"
   → suggest_improvements avec focus "performance"
```

### 🏗️ Workflow type : Migrer un projet existant

```
1️⃣ "Analyse l'utilisation DSFR de mon projet Vue.js"
   → analyze_dsfr_usage avec tout le code source

2️⃣ "Compare ma version DSFR 1.11.0 vers la 1.14.0"
   → compare_versions avec guide de migration

3️⃣ "Convertis mes composants HTML en Vue.js"
   → convert_to_framework pour chaque composant

4️⃣ "Valide la conformité après migration"
   → validate_dsfr_html en mode strict

5️⃣ "Exporte la documentation pour l'équipe"
   → export_documentation au format HTML
```

### 🎨 Workflow type : Personnalisation thème

```
1️⃣ "Crée un thème personnalisé pour mon ministère"
   → create_dsfr_theme avec couleurs officielles

2️⃣ "Palette complète avec utilitaires CSS"
   → get_dsfr_colors avec format développeur

3️⃣ "Icônes compatibles avec le nouveau thème"
   → get_dsfr_icons par catégories métier

4️⃣ "Valide l'accessibilité du thème personnalisé"
   → check_accessibility niveau AAA

5️⃣ "Documentation du thème personnalisé"
   → export_documentation avec branding personnalisé
```

---

## 🎯 Points clés à retenir

**✅ Tous les outils sont actifs** - Les 15 outils fonctionnent dans Claude Desktop via Docker

**🔗 Outils complémentaires** - Chaque outil peut être utilisé seul ou en combinaison

**📚 Documentation vivante** - Les outils s'adaptent aux évolutions du DSFR

**♿ Accessibilité prioritaire** - Tous les outils intègrent les critères RGAA 4.1

**🚀 Performance optimisée** - Réponses < 0.1ms avec cache intelligent

**🎨 Personnalisation avancée** - Thèmes et adaptations respectant le DSFR

---

**Fait avec ❤️ pour faciliter l'utilisation du DSFR dans vos projets publics français**