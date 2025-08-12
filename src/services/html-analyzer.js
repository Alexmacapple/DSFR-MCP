/**
 * Service d'analyse HTML réelle avec AST parsing
 * Implémente l'analyse DSFR précise pour l'Issue #35
 */

const { parse } = require('node-html-parser');

class HTMLAnalyzer {
  constructor() {
    // Base de données des classes DSFR officielles
    this.dsfrClasses = {
      // Layout
      'fr-container': {
        category: 'layout',
        importance: 'high',
        description: 'Conteneur principal',
      },
      'fr-grid-row': { category: 'layout', importance: 'high', description: 'Ligne de grille' },
      'fr-col-': {
        category: 'layout',
        importance: 'medium',
        description: 'Colonne responsive',
        prefix: true,
      },

      // Components
      'fr-btn': { category: 'component', importance: 'high', description: 'Bouton DSFR' },
      'fr-input': { category: 'component', importance: 'high', description: 'Champ de saisie' },
      'fr-card': { category: 'component', importance: 'medium', description: 'Carte de contenu' },
      'fr-nav': { category: 'component', importance: 'high', description: 'Navigation principale' },
      'fr-header': { category: 'component', importance: 'high', description: 'En-tête officiel' },
      'fr-footer': { category: 'component', importance: 'medium', description: 'Pied de page' },
      'fr-breadcrumb': { category: 'component', importance: 'medium', description: "Fil d'Ariane" },
      'fr-form': { category: 'component', importance: 'high', description: 'Formulaire DSFR' },
      'fr-fieldset': {
        category: 'component',
        importance: 'medium',
        description: 'Groupe de champs',
      },
      'fr-label': { category: 'component', importance: 'high', description: 'Label de champ' },
      'fr-table': { category: 'component', importance: 'medium', description: 'Tableau DSFR' },
      'fr-modal': { category: 'component', importance: 'medium', description: 'Modale' },
      'fr-accordion': { category: 'component', importance: 'medium', description: 'Accordéon' },

      // Utility
      'fr-hidden': { category: 'utility', importance: 'low', description: 'Masquer élément' },
      'fr-sr-only': {
        category: 'utility',
        importance: 'medium',
        description: "Lecteur d'écran uniquement",
      },
      'fr-text-': {
        category: 'utility',
        importance: 'low',
        description: 'Classes de texte',
        prefix: true,
      },
      'fr-background-': {
        category: 'utility',
        importance: 'low',
        description: 'Classes de fond',
        prefix: true,
      },
      'fr-m-': {
        category: 'utility',
        importance: 'low',
        description: 'Classes de margin',
        prefix: true,
      },
      'fr-p-': {
        category: 'utility',
        importance: 'low',
        description: 'Classes de padding',
        prefix: true,
      },
    };

    this.semanticElements = ['main', 'nav', 'header', 'footer', 'section', 'article', 'aside'];
    this.formElements = ['input', 'textarea', 'select', 'button'];
    this.headingElements = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  }

  /**
   * Analyse complète du code HTML fourni
   */
  analyzeHTML(htmlCode, options = {}) {
    if (!htmlCode || typeof htmlCode !== 'string') {
      return this.generateNoCodeResponse();
    }

    try {
      const root = parse(htmlCode, {
        lowerCaseAttributeNames: true,
        comment: false,
        voidTag: {
          tags: [
            'area',
            'base',
            'br',
            'col',
            'embed',
            'hr',
            'img',
            'input',
            'link',
            'meta',
            'param',
            'source',
            'track',
            'wbr',
          ],
          closingSlash: true,
        },
      });

      const analysis = {
        dsfrClasses: this.findDSFRClasses(root),
        semanticStructure: this.analyzeSemanticStructure(root),
        accessibility: this.analyzeAccessibility(root),
        formAnalysis: this.analyzeFormElements(root),
        headingStructure: this.analyzeHeadingStructure(root),
        performance: this.analyzePerformance(root),
        codeStats: this.getCodeStats(htmlCode, root),
      };

      return this.generateDetailedReport(analysis, htmlCode, options);
    } catch (error) {
      return this.generateErrorResponse(error, htmlCode);
    }
  }

  /**
   * Trouve et analyse toutes les classes DSFR dans le HTML
   */
  findDSFRClasses(root) {
    const foundClasses = new Set();
    const classUsage = {};
    const missingClasses = [];

    // Parcourir tous les éléments avec des classes
    const elementsWithClasses = root.querySelectorAll('[class]');

    elementsWithClasses.forEach((element) => {
      const classAttr = element.getAttribute('class');
      if (classAttr) {
        const classes = classAttr.split(/\s+/);

        classes.forEach((className) => {
          // Vérifier si c'est une classe DSFR
          if (this.isDSFRClass(className)) {
            foundClasses.add(className);

            if (!classUsage[className]) {
              classUsage[className] = {
                count: 0,
                elements: [],
                classInfo: this.getDSFRClassInfo(className),
              };
            }

            classUsage[className].count++;
            classUsage[className].elements.push({
              tagName: element.tagName.toLowerCase(),
              attributes: this.getElementAttributes(element),
            });
          }
        });
      }
    });

    // Détecter les classes DSFR manquantes importantes
    this.detectMissingImportantClasses(root, missingClasses);

    return {
      found: Array.from(foundClasses),
      usage: classUsage,
      missing: missingClasses,
      stats: {
        totalFound: foundClasses.size,
        byCategory: this.categorizeDSFRClasses(Array.from(foundClasses)),
      },
    };
  }

  /**
   * Analyse la structure sémantique HTML5
   */
  analyzeSemanticStructure(root) {
    const structure = {};
    const issues = [];

    this.semanticElements.forEach((tagName) => {
      const elements = root.querySelectorAll(tagName);
      structure[tagName] = {
        count: elements.length,
        present: elements.length > 0,
        elements: elements.map((el) => ({
          attributes: this.getElementAttributes(el),
          hasContent: el.innerHTML.trim().length > 0,
        })),
      };
    });

    // Vérifications sémantiques
    if (!structure.main.present) {
      issues.push({
        type: 'critical',
        message: "Élément <main> manquant - requis pour l'accessibilité",
        fix: '<main role="main" id="content"><!-- Contenu principal --></main>',
      });
    }

    if (!structure.nav.present) {
      issues.push({
        type: 'important',
        message: 'Navigation <nav> manquante',
        fix: '<nav class="fr-nav" role="navigation" aria-label="Menu principal"><!-- Navigation --></nav>',
      });
    }

    if (structure.main.count > 1) {
      issues.push({
        type: 'warning',
        message: `${structure.main.count} éléments <main> trouvés - un seul recommandé`,
        fix: 'Conserver un seul élément <main> par page',
      });
    }

    return { structure, issues };
  }

  /**
   * Analyse de l'accessibilité RGAA 4.1
   */
  analyzeAccessibility(root) {
    const issues = [];
    const scores = { total: 0, passed: 0 };

    // 1. Vérifier les labels des champs de formulaire
    const inputsWithoutLabels = this.findInputsWithoutLabels(root);
    scores.total++;
    if (inputsWithoutLabels.length === 0) {
      scores.passed++;
    } else {
      issues.push({
        type: 'critical',
        category: 'forms',
        message: `${inputsWithoutLabels.length} champ(s) sans label associé`,
        elements: inputsWithoutLabels,
        fix: 'Ajouter <label class="fr-label" for="field-id"> ou aria-label',
      });
    }

    // 2. Vérifier les images sans alt
    const imagesWithoutAlt = root.querySelectorAll('img:not([alt])');
    scores.total++;
    if (imagesWithoutAlt.length === 0) {
      scores.passed++;
    } else {
      issues.push({
        type: 'critical',
        category: 'images',
        message: `${imagesWithoutAlt.length} image(s) sans attribut alt`,
        fix: 'Ajouter alt="" pour images décoratives ou alt="description" pour images informatives',
      });
    }

    // 3. Vérifier la structure des titres
    const headingIssues = this.analyzeHeadingStructure(root);
    scores.total++;
    if (headingIssues.issues.length === 0) {
      scores.passed++;
    } else {
      issues.push(...headingIssues.issues);
    }

    // 4. Vérifier les attributs ARIA
    const ariaIssues = this.checkARIAAttributes(root);
    scores.total++;
    if (ariaIssues.length === 0) {
      scores.passed++;
    } else {
      issues.push(...ariaIssues);
    }

    // 5. Vérifier les contrastes (analyse statique basique)
    const contrastIssues = this.checkBasicContrastIssues(root);
    scores.total++;
    if (contrastIssues.length === 0) {
      scores.passed++;
    } else {
      issues.push(...contrastIssues);
    }

    const accessibilityScore = Math.round((scores.passed / scores.total) * 100);

    return {
      score: accessibilityScore,
      issues,
      categories: this.categorizeAccessibilityIssues(issues),
      recommendations: this.generateAccessibilityRecommendations(issues),
    };
  }

  /**
   * Analyse les éléments de formulaire
   */
  analyzeFormElements(root) {
    const forms = root.querySelectorAll('form');
    const inputs = root.querySelectorAll('input, textarea, select');
    const buttons = root.querySelectorAll('button, input[type="submit"], input[type="button"]');

    const analysis = {
      forms: {
        count: forms.length,
        withDSFRClasses: 0,
        issues: [],
      },
      fields: {
        total: inputs.length,
        withLabels: 0,
        withDSFRClasses: 0,
        byType: {},
      },
      buttons: {
        total: buttons.length,
        withDSFRClasses: 0,
      },
    };

    // Analyser les formulaires
    forms.forEach((form) => {
      const classes = form.getAttribute('class') || '';
      if (classes.includes('fr-form')) {
        analysis.forms.withDSFRClasses++;
      } else {
        analysis.forms.issues.push({
          type: 'warning',
          message: 'Formulaire sans classe fr-form',
          fix: '<form class="fr-form">',
        });
      }
    });

    // Analyser les champs
    inputs.forEach((input) => {
      const type = input.getAttribute('type') || 'text';
      analysis.fields.byType[type] = (analysis.fields.byType[type] || 0) + 1;

      const classes = input.getAttribute('class') || '';
      if (classes.includes('fr-input')) {
        analysis.fields.withDSFRClasses++;
      }

      // Vérifier les labels
      const id = input.getAttribute('id');
      const ariaLabel = input.getAttribute('aria-label');
      const ariaLabelledby = input.getAttribute('aria-labelledby');

      if ((id && root.querySelector(`label[for="${id}"]`)) || ariaLabel || ariaLabelledby) {
        analysis.fields.withLabels++;
      }
    });

    // Analyser les boutons
    buttons.forEach((button) => {
      const classes = button.getAttribute('class') || '';
      if (classes.includes('fr-btn')) {
        analysis.buttons.withDSFRClasses++;
      }
    });

    return analysis;
  }

  /**
   * Analyse la structure des titres (h1-h6)
   */
  analyzeHeadingStructure(root) {
    const headings = [];
    const issues = [];

    this.headingElements.forEach((tag) => {
      const elements = root.querySelectorAll(tag);
      elements.forEach((el) => {
        headings.push({
          level: parseInt(tag.charAt(1)),
          tag,
          text: el.text.trim(),
          hasContent: el.text.trim().length > 0,
        });
      });
    });

    // Trier par ordre d'apparition dans le DOM
    headings.sort((a, b) => a.level - b.level);

    // Vérifications
    if (headings.length === 0) {
      issues.push({
        type: 'warning',
        category: 'headings',
        message: 'Aucun titre (h1-h6) trouvé',
        fix: 'Ajouter une structure de titres hiérarchique',
      });
    } else {
      // Vérifier qu'il y a un h1
      const h1Count = headings.filter((h) => h.level === 1).length;
      if (h1Count === 0) {
        issues.push({
          type: 'important',
          category: 'headings',
          message: 'Aucun titre h1 trouvé',
          fix: 'Ajouter un titre <h1> principal pour la page',
        });
      } else if (h1Count > 1) {
        issues.push({
          type: 'warning',
          category: 'headings',
          message: `${h1Count} titres h1 trouvés - un seul recommandé`,
          fix: 'Utiliser un seul h1 par page',
        });
      }
    }

    return { headings, issues };
  }

  /**
   * Utilitaires de vérification
   */
  isDSFRClass(className) {
    if (!className) return false;

    // Vérification directe
    if (this.dsfrClasses[className]) return true;

    // Vérification des préfixes
    for (const [baseClass, info] of Object.entries(this.dsfrClasses)) {
      if (info.prefix && className.startsWith(baseClass)) {
        return true;
      }
    }

    return false;
  }

  getDSFRClassInfo(className) {
    if (this.dsfrClasses[className]) {
      return this.dsfrClasses[className];
    }

    // Vérifier les préfixes
    for (const [baseClass, info] of Object.entries(this.dsfrClasses)) {
      if (info.prefix && className.startsWith(baseClass)) {
        return { ...info, fullClass: className };
      }
    }

    return { category: 'unknown', importance: 'low', description: 'Classe DSFR non répertoriée' };
  }

  findInputsWithoutLabels(root) {
    const inputs = root.querySelectorAll('input:not([type="hidden"]), textarea, select');
    const inputsWithoutLabels = [];

    inputs.forEach((input) => {
      const id = input.getAttribute('id');
      const ariaLabel = input.getAttribute('aria-label');
      const ariaLabelledby = input.getAttribute('aria-labelledby');

      let hasLabel = false;

      if (id && root.querySelector(`label[for="${id}"]`)) {
        hasLabel = true;
      } else if (ariaLabel || ariaLabelledby) {
        hasLabel = true;
      }

      if (!hasLabel) {
        inputsWithoutLabels.push({
          tagName: input.tagName.toLowerCase(),
          type: input.getAttribute('type'),
          id: id,
          attributes: this.getElementAttributes(input),
        });
      }
    });

    return inputsWithoutLabels;
  }

  checkARIAAttributes(root) {
    const issues = [];

    // Vérifier les éléments interactifs sans rôle approprié
    const interactiveElements = root.querySelectorAll(
      'div[onclick], span[onclick], div[tabindex], span[tabindex]'
    );
    interactiveElements.forEach((el) => {
      const role = el.getAttribute('role');
      if (!role) {
        issues.push({
          type: 'warning',
          category: 'aria',
          message: 'Élément interactif sans rôle ARIA approprié',
          fix: 'Ajouter role="button" ou utiliser un élément sémantique approprié',
        });
      }
    });

    return issues;
  }

  checkBasicContrastIssues(root) {
    const issues = [];

    // Vérification basique - rechercher des styles inline avec des couleurs problématiques
    const elementsWithStyle = root.querySelectorAll('[style*="color"]');
    if (elementsWithStyle.length > 0) {
      issues.push({
        type: 'warning',
        category: 'contrast',
        message: 'Styles de couleur inline détectés - vérifier les contrastes',
        fix: 'Utiliser les classes de couleur DSFR pour garantir les contrastes RGAA',
      });
    }

    return issues;
  }

  getElementAttributes(element) {
    const attrs = {};
    if (element.attributes) {
      Object.keys(element.attributes).forEach((key) => {
        attrs[key] = element.attributes[key];
      });
    }
    return attrs;
  }

  categorizeAccessibilityIssues(issues) {
    const categories = {
      critical: issues.filter((i) => i.type === 'critical'),
      important: issues.filter((i) => i.type === 'important'),
      warning: issues.filter((i) => i.type === 'warning'),
    };

    return categories;
  }

  generateAccessibilityRecommendations(issues) {
    const recommendations = [];
    const criticalCount = issues.filter((i) => i.type === 'critical').length;
    const importantCount = issues.filter((i) => i.type === 'important').length;

    if (criticalCount > 0) {
      recommendations.push("🔴 Corriger les problèmes critiques d'accessibilité en priorité");
    }
    if (importantCount > 0) {
      recommendations.push('🟡 Planifier la correction des problèmes importants');
    }

    return recommendations;
  }

  analyzePerformance(root) {
    const stats = {
      totalElements: root.querySelectorAll('*').length,
      totalClasses: 0,
      duplicateIds: [],
      unusedClasses: [],
    };

    // Compter les classes
    const elementsWithClasses = root.querySelectorAll('[class]');
    elementsWithClasses.forEach((el) => {
      const classes = (el.getAttribute('class') || '').split(/\s+/).filter((c) => c.length > 0);
      stats.totalClasses += classes.length;
    });

    // Vérifier les IDs dupliqués
    const ids = new Map();
    const elementsWithIds = root.querySelectorAll('[id]');
    elementsWithIds.forEach((el) => {
      const id = el.getAttribute('id');
      if (ids.has(id)) {
        stats.duplicateIds.push(id);
      } else {
        ids.set(id, true);
      }
    });

    return stats;
  }

  getCodeStats(htmlCode, root) {
    return {
      characters: htmlCode.length,
      lines: htmlCode.split('\n').length,
      elements: root.querySelectorAll('*').length,
      textNodes: root.querySelectorAll('*').filter((el) => el.text && el.text.trim().length > 0)
        .length,
    };
  }

  detectMissingImportantClasses(root, missingClasses) {
    // Vérifier si on a des formulaires sans fr-form
    const forms = root.querySelectorAll('form');
    forms.forEach((form) => {
      const classes = form.getAttribute('class') || '';
      if (!classes.includes('fr-form')) {
        missingClasses.push({
          element: 'form',
          missing: 'fr-form',
          importance: 'high',
          reason: 'Standardisation DSFR des formulaires',
        });
      }
    });

    // Vérifier les boutons sans fr-btn
    const buttons = root.querySelectorAll('button, input[type="submit"], input[type="button"]');
    buttons.forEach((button) => {
      const classes = button.getAttribute('class') || '';
      if (!classes.includes('fr-btn')) {
        missingClasses.push({
          element: 'button',
          missing: 'fr-btn',
          importance: 'medium',
          reason: 'Cohérence visuelle des boutons DSFR',
        });
      }
    });
  }

  categorizeDSFRClasses(classes) {
    const categories = { layout: 0, component: 0, utility: 0, unknown: 0 };

    classes.forEach((className) => {
      const info = this.getDSFRClassInfo(className);
      categories[info.category] = (categories[info.category] || 0) + 1;
    });

    return categories;
  }

  generateDetailedReport(analysis, htmlCode, _options) {
    const {
      dsfrClasses,
      semanticStructure,
      accessibility,
      formAnalysis,
      performance: _performance,
    } = analysis;

    const report = `📊 **ANALYSE RÉELLE DU CODE HTML** - ${analysis.codeStats.characters} caractères analysés

## 🎯 **Code analysé** - ${analysis.codeStats.elements} éléments, ${analysis.codeStats.lines} lignes

### ✅ **CLASSES DSFR DÉTECTÉES (${dsfrClasses.found.length})**

#### 🟢 **Classes trouvées :**
${
  dsfrClasses.found.length > 0
    ? dsfrClasses.found
        .map((cls) => {
          const usage = dsfrClasses.usage[cls];
          const info = usage?.classInfo || this.getDSFRClassInfo(cls);
          return `- \`${cls}\` : ${info.description} (${usage?.count || 1}x)`;
        })
        .join('\n')
    : '❌ Aucune classe DSFR détectée'
}

#### 📊 **Répartition par catégorie :**
\`\`\`
Layout    : ${dsfrClasses.stats.byCategory.layout || 0} classes
Component : ${dsfrClasses.stats.byCategory.component || 0} classes  
Utility   : ${dsfrClasses.stats.byCategory.utility || 0} classes
Total     : ${dsfrClasses.found.length} classes DSFR
\`\`\`

### 🏗️ **STRUCTURE SÉMANTIQUE**

#### 📋 **Éléments HTML5 détectés :**
${Object.entries(semanticStructure.structure)
  .map(
    ([tag, info]) =>
      `- \`<${tag}>\` : ${info.present ? '✅' : '❌'} ${info.count > 0 ? `(${info.count})` : ''}`
  )
  .join('\n')}

${
  semanticStructure.issues.length > 0
    ? `
#### 🚨 **Problèmes structurels détectés :**
${semanticStructure.issues
  .map(
    (issue) =>
      `**${issue.type === 'critical' ? '🔴' : issue.type === 'important' ? '🟡' : '⚪'}** ${issue.message}
  \`\`\`html
  ${issue.fix}
  \`\`\``
  )
  .join('\n')}`
    : '✅ Structure sémantique correcte'
}

### ♿ **ACCESSIBILITÉ RGAA 4.1** - Score: ${accessibility.score}/100

${
  accessibility.issues.length > 0
    ? `
#### 🔍 **Problèmes d'accessibilité :**
${accessibility.issues
  .map(
    (issue) =>
      `**${issue.type === 'critical' ? '🔴 Critique' : issue.type === 'important' ? '🟡 Important' : '⚪ Avertissement'}** : ${issue.message}
  ${issue.fix ? `💡 **Solution** : ${issue.fix}` : ''}`
  )
  .join('\n\n')}`
    : "✅ Aucun problème d'accessibilité majeur détecté"
}

### 📝 **ANALYSE DES FORMULAIRES**
- **Formulaires** : ${formAnalysis.forms.count} (${formAnalysis.forms.withDSFRClasses}/${formAnalysis.forms.count} avec classes DSFR)
- **Champs** : ${formAnalysis.fields.total} (${formAnalysis.fields.withLabels}/${formAnalysis.fields.total} avec labels)
- **Boutons** : ${formAnalysis.buttons.total} (${formAnalysis.buttons.withDSFRClasses}/${formAnalysis.buttons.total} avec fr-btn)

${
  formAnalysis.forms.issues.length > 0
    ? `
**Améliorations suggérées :**
${formAnalysis.forms.issues.map((issue) => `- ${issue.message}: ${issue.fix}`).join('\n')}`
    : ''
}

### 🚀 **RECOMMANDATIONS PRIORITAIRES**

#### 🔴 **Critique (à corriger immédiatement)**
${this.generateCriticalRecommendations(analysis).join('\n')}

#### 🟡 **Important (à planifier)**  
${this.generateImportantRecommendations(analysis).join('\n')}

#### ⚪ **Amélioration (optionnel)**
${this.generateOptionalRecommendations(analysis).join('\n')}

### 🏆 **SCORES DÉTAILLÉS**

| Critère | Score | Détail |
|---------|--------|---------|
| **Classes DSFR** | ${Math.round((dsfrClasses.found.length / Math.max(analysis.codeStats.elements * 0.3, 10)) * 100)}% | ${dsfrClasses.found.length} classes sur ~${Math.round(analysis.codeStats.elements * 0.3)} attendues |
| **Sémantique HTML5** | ${Math.round((Object.values(semanticStructure.structure).filter((s) => s.present).length / this.semanticElements.length) * 100)}% | ${Object.values(semanticStructure.structure).filter((s) => s.present).length}/${this.semanticElements.length} éléments présents |
| **Accessibilité RGAA** | ${accessibility.score}% | ${accessibility.issues.filter((i) => i.type === 'critical').length} problèmes critiques |
| **Formulaires DSFR** | ${formAnalysis.forms.count > 0 ? Math.round((formAnalysis.forms.withDSFRClasses / formAnalysis.forms.count) * 100) : 100}% | ${formAnalysis.forms.withDSFRClasses}/${formAnalysis.forms.count} conformes |

**Score global : ${this.calculateOverallScore(analysis)}/100**

### 💻 **CODE CORRIGÉ SUGGÉRÉ**

\`\`\`html
${this.generateCorrectedCode(analysis, htmlCode)}
\`\`\`

🎯 **ANALYSE RÉELLE** basée sur le parsing AST de votre code HTML - Issue #35 résolue !`;

    return report;
  }

  generateCriticalRecommendations(analysis) {
    const recommendations = [];

    const criticalAccessibility = analysis.accessibility.issues.filter(
      (i) => i.type === 'critical'
    );
    if (criticalAccessibility.length > 0) {
      recommendations.push(
        `1. **Corriger ${criticalAccessibility.length} problème(s) d'accessibilité critique**`
      );
    }

    const criticalSemantic = analysis.semanticStructure.issues.filter((i) => i.type === 'critical');
    if (criticalSemantic.length > 0) {
      recommendations.push(`2. **Ajouter les éléments sémantiques manquants** (main, nav, etc.)`);
    }

    if (analysis.dsfrClasses.found.length === 0) {
      recommendations.push(
        `3. **Intégrer les classes DSFR de base** (fr-container, fr-btn, fr-input)`
      );
    }

    return recommendations.length > 0 ? recommendations : ['✅ Aucune action critique requise'];
  }

  generateImportantRecommendations(analysis) {
    const recommendations = [];

    const importantIssues = [
      ...analysis.accessibility.issues.filter((i) => i.type === 'important'),
      ...analysis.semanticStructure.issues.filter((i) => i.type === 'important'),
    ];

    if (importantIssues.length > 0) {
      recommendations.push(`1. **Résoudre ${importantIssues.length} problème(s) important(s)**`);
    }

    if (
      analysis.formAnalysis.forms.count > 0 &&
      analysis.formAnalysis.forms.withDSFRClasses === 0
    ) {
      recommendations.push(`2. **Migrer les formulaires vers les classes DSFR**`);
    }

    return recommendations.length > 0 ? recommendations : ['✅ Aucune action importante requise'];
  }

  generateOptionalRecommendations(analysis) {
    const recommendations = [];

    if (analysis.dsfrClasses.stats.byCategory.utility === 0) {
      recommendations.push(`1. **Exploiter les classes utilitaires DSFR** (fr-m-*, fr-p-*, etc.)`);
    }

    if (analysis.performance.duplicateIds.length > 0) {
      recommendations.push(
        `2. **Corriger les IDs dupliqués** (${analysis.performance.duplicateIds.length} détectés)`
      );
    }

    return recommendations.length > 0 ? recommendations : ['✅ Code déjà bien optimisé'];
  }

  generateCorrectedCode(analysis, originalCode) {
    // Génération simplifiée du code corrigé - version de base
    let correctedCode = originalCode;

    // Si pas de classes DSFR sur les formulaires, en ajouter
    if (
      analysis.formAnalysis.forms.count > 0 &&
      analysis.formAnalysis.forms.withDSFRClasses === 0
    ) {
      correctedCode = correctedCode.replace(/<form([^>]*)>/g, '<form$1 class="fr-form">');
    }

    // Si pas de classes DSFR sur les boutons, en ajouter
    if (
      analysis.formAnalysis.buttons.total > 0 &&
      analysis.formAnalysis.buttons.withDSFRClasses === 0
    ) {
      correctedCode = correctedCode.replace(/<button([^>]*)>/g, '<button$1 class="fr-btn">');
    }

    return correctedCode.length > 500
      ? correctedCode.substring(0, 500) + '\n<!-- ... code tronqué ... -->'
      : correctedCode;
  }

  calculateOverallScore(analysis) {
    const weights = {
      dsfr: 0.3,
      semantic: 0.2,
      accessibility: 0.4,
      forms: 0.1,
    };

    const dsfrScore = Math.min(
      Math.round(
        (analysis.dsfrClasses.found.length / Math.max(analysis.codeStats.elements * 0.3, 10)) * 100
      ),
      100
    );
    const semanticScore = Math.round(
      (Object.values(analysis.semanticStructure.structure).filter((s) => s.present).length /
        this.semanticElements.length) *
        100
    );
    const accessibilityScore = analysis.accessibility.score;
    const formsScore =
      analysis.formAnalysis.forms.count > 0
        ? Math.round(
            (analysis.formAnalysis.forms.withDSFRClasses / analysis.formAnalysis.forms.count) * 100
          )
        : 100;

    const overallScore = Math.round(
      dsfrScore * weights.dsfr +
        semanticScore * weights.semantic +
        accessibilityScore * weights.accessibility +
        formsScore * weights.forms
    );

    return Math.min(overallScore, 100);
  }

  generateNoCodeResponse() {
    return `📊 **ANALYSE HTML DSFR** - Aucun code fourni

## ⚠️ **Aucun code à analyser**

Pour utiliser cet outil d'analyse, veuillez fournir du code HTML dans le paramètre \`source_code\`.

### 📋 **Exemple d'utilisation :**
\`\`\`
Analyser ce code DSFR : 
<div class="fr-container">
  <button class="fr-btn fr-btn--primary">Test</button>
</div>
\`\`\`

### 🎯 **Ce que l'analyseur détecte :**
- ✅ Classes DSFR utilisées et manquantes
- ✅ Structure sémantique HTML5  
- ✅ Problèmes d'accessibilité RGAA 4.1
- ✅ Analyse des formulaires
- ✅ Recommandations de correction

🔧 **Outil basé sur un parsing AST réel** - Issue #35 implémentée !`;
  }

  generateErrorResponse(error, htmlCode) {
    return `📊 **ERREUR D'ANALYSE HTML** - ${htmlCode?.length || 0} caractères

## ⚠️ **Erreur lors du parsing**

**Erreur** : ${error.message}

### 🔧 **Causes possibles :**
- Code HTML malformé ou incomplet
- Balises non fermées
- Caractères spéciaux non échappés

### 💡 **Suggestions :**
1. Vérifier la validité du HTML avec un validateur
2. S'assurer que toutes les balises sont fermées
3. Échapper les caractères spéciaux (&lt;, &gt;, &amp;)

### 📋 **Format attendu :**
\`\`\`html
<div class="fr-container">
  <h1>Titre</h1>
  <p>Contenu...</p>
</div>
\`\`\`

🔧 **Parser AST activé** - Issue #35 - Veuillez corriger le HTML et réessayer.`;
  }
}

module.exports = HTMLAnalyzer;
