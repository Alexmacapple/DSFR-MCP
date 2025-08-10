// Service de vérification d'accessibilité RGAA
const { JSDOM } = require('jsdom');

class AccessibilityService {
  constructor() {
    this.rgaaRules = this.initializeRGAARules();
  }

  initializeRGAARules() {
    return {
      // Critères RGAA principaux
      images: {
        'alt-required': {
          level: 'A',
          description: 'Toute image doit avoir un attribut alt',
          check: (element) => element.hasAttribute('alt'),
        },
        'decorative-alt': {
          level: 'A',
          description: 'Les images décoratives doivent avoir un alt vide',
          check: (element) => {
            if (element.hasAttribute('role') && element.getAttribute('role') === 'presentation') {
              return element.getAttribute('alt') === '';
            }
            return true;
          },
        },
      },

      forms: {
        'label-association': {
          level: 'A',
          description: 'Chaque champ de formulaire doit avoir un label associé',
          check: (element, document) => {
            const id = element.getAttribute('id');
            if (!id) return false;
            return !!document.querySelector(`label[for="${id}"]`);
          },
        },
        'required-indication': {
          level: 'AA',
          description: 'Les champs obligatoires doivent être clairement indiqués',
          check: (element) => {
            if (element.hasAttribute('required')) {
              return (
                element.hasAttribute('aria-required') ||
                element.getAttribute('aria-label')?.includes('obligatoire')
              );
            }
            return true;
          },
        },
      },

      navigation: {
        'skip-links': {
          level: 'A',
          description: "Présence de liens d'évitement",
          check: (document) => {
            return !!document.querySelector('a[href="#main"], a[href="#content"]');
          },
        },
        landmarks: {
          level: 'AA',
          description: 'Utilisation correcte des landmarks ARIA',
          check: (document) => {
            const main = document.querySelector('main, [role="main"]');
            const nav = document.querySelector('nav, [role="navigation"]');
            const header = document.querySelector('header, [role="banner"]');
            const footer = document.querySelector('footer, [role="contentinfo"]');
            return !!(main || nav || header || footer);
          },
        },
      },

      contrast: {
        'color-contrast': {
          level: 'AA',
          description: 'Contraste suffisant entre texte et fond',
          check: () => {
            // Note: vérification complexe, retourne une suggestion
            return null;
          },
        },
      },
    };
  }

  async checkAccessibility({ html_code, rgaa_level = 'AA', include_suggestions = true }) {
    const results = {
      level: rgaa_level,
      passed: [],
      failed: [],
      warnings: [],
      suggestions: [],
      score: 100,
    };

    try {
      const dom = new JSDOM(html_code);
      const document = dom.window.document;

      // Vérifier les images
      this.checkImages(document, results);

      // Vérifier les formulaires
      this.checkForms(document, results);

      // Vérifier la navigation
      this.checkNavigation(document, results);

      // Vérifier la structure
      this.checkStructure(document, results);

      // Vérifier les tableaux
      this.checkTables(document, results);

      // Ajouter des suggestions si demandé
      if (include_suggestions) {
        this.addSuggestions(document, results);
      }

      // Calculer le score
      results.score = this.calculateScore(results);
    } catch (error) {
      results.failed.push({
        rule: 'parse-error',
        message: `Erreur lors de l'analyse : ${error.message}`,
      });
    }

    return results;
  }

  checkImages(document, results) {
    const images = document.querySelectorAll('img');

    images.forEach((img) => {
      // Vérifier l'attribut alt
      if (!img.hasAttribute('alt')) {
        results.failed.push({
          rule: 'img-alt',
          element: `<img src="${img.src || 'unknown'}">`,
          message: 'Image sans attribut alt',
          level: 'A',
        });
      } else {
        // L'image a un attribut alt
        results.passed.push({
          rule: 'img-alt',
          element: `<img src="${img.src || 'unknown'}">`,
          message: 'Image avec attribut alt valide',
          level: 'A',
        });
      }

      // Vérifier les images décoratives
      if (img.getAttribute('role') === 'presentation') {
        if (img.getAttribute('alt') !== '') {
          results.warnings.push({
            rule: 'img-decorative',
            element: `<img src="${img.src || 'unknown'}">`,
            message: 'Image décorative avec un alt non vide',
            level: 'A',
          });
        } else {
          results.passed.push({
            rule: 'img-decorative',
            element: `<img src="${img.src || 'unknown'}">`,
            message: 'Image décorative avec alt vide correct',
            level: 'A',
          });
        }
      }
    });

    if (images.length === 0) {
      results.passed.push({
        rule: 'img-presence',
        message: 'Aucune image à vérifier',
      });
    }
  }

  checkForms(document, results) {
    const formInputs = document.querySelectorAll('input:not([type="hidden"]), select, textarea');

    if (formInputs.length === 0) {
      results.passed.push({
        rule: 'form-presence',
        message: 'Aucun champ de formulaire à vérifier',
      });
      return;
    }

    formInputs.forEach((input) => {
      const id = input.getAttribute('id');
      const type = input.getAttribute('type') || 'text';

      // Vérifier l'association avec un label
      if (id) {
        const label = document.querySelector(`label[for="${id}"]`);
        if (label) {
          results.passed.push({
            rule: 'form-label',
            element: `<${input.tagName.toLowerCase()} id="${id}" type="${type}">`,
            message: 'Champ de formulaire avec label associé',
            level: 'A',
          });
        } else {
          const ariaLabel = input.getAttribute('aria-label');
          const ariaLabelledby = input.getAttribute('aria-labelledby');

          if (ariaLabel || ariaLabelledby) {
            results.passed.push({
              rule: 'form-label',
              element: `<${input.tagName.toLowerCase()} id="${id}" type="${type}">`,
              message: 'Champ de formulaire avec aria-label ou aria-labelledby',
              level: 'A',
            });
          } else {
            results.failed.push({
              rule: 'form-label',
              element: `<${input.tagName.toLowerCase()} id="${id}" type="${type}">`,
              message: 'Champ de formulaire sans label associé',
              level: 'A',
            });
          }
        }
      } else {
        results.failed.push({
          rule: 'form-id',
          element: `<${input.tagName.toLowerCase()} type="${type}">`,
          message: 'Champ de formulaire sans attribut id',
          level: 'A',
        });
      }

      // Vérifier l'indication des champs obligatoires
      if (input.hasAttribute('required')) {
        if (input.hasAttribute('aria-required') && input.getAttribute('aria-required') === 'true') {
          results.passed.push({
            rule: 'form-required',
            element: `<${input.tagName.toLowerCase()} id="${id || 'unknown'}">`,
            message: 'Champ obligatoire avec aria-required correct',
            level: 'AA',
          });
        } else {
          results.warnings.push({
            rule: 'form-required',
            element: `<${input.tagName.toLowerCase()} id="${id || 'unknown'}">`,
            message: 'Champ obligatoire sans aria-required="true"',
            level: 'AA',
          });
        }
      }
    });
  }

  checkNavigation(document, results) {
    // Vérifier les liens d'évitement
    const skipLinks = document.querySelectorAll('a[href^="#"]');
    const hasSkipToMain = Array.from(skipLinks).some(
      (link) => link.getAttribute('href') === '#main' || link.getAttribute('href') === '#content'
    );

    if (hasSkipToMain) {
      results.passed.push({
        rule: 'nav-skip-links',
        message: "Lien d'évitement vers le contenu principal trouvé",
        level: 'A',
      });
    } else {
      results.warnings.push({
        rule: 'nav-skip-links',
        message: "Aucun lien d'évitement vers le contenu principal trouvé",
        level: 'A',
      });
    }

    // Vérifier les landmarks
    const landmarks = {
      main: document.querySelector('main, [role="main"]'),
      nav: document.querySelector('nav, [role="navigation"]'),
      header: document.querySelector('header, [role="banner"]'),
      footer: document.querySelector('footer, [role="contentinfo"]'),
    };

    if (landmarks.main) {
      results.passed.push({
        rule: 'landmark-main',
        message: 'Balise <main> ou role="main" trouvée',
        level: 'A',
      });
    } else {
      results.failed.push({
        rule: 'landmark-main',
        message: 'Aucune balise <main> ou role="main" trouvée',
        level: 'A',
      });
    }

    // Vérifier les autres landmarks
    Object.keys(landmarks).forEach((landmarkType) => {
      if (landmarks[landmarkType] && landmarkType !== 'main') {
        results.passed.push({
          rule: `landmark-${landmarkType}`,
          message: `Landmark ${landmarkType} trouvé`,
          level: 'AA',
        });
      }
    });

    // Vérifier l'ordre de tabulation
    const tabbableElements = document.querySelectorAll('[tabindex]');
    tabbableElements.forEach((el) => {
      const tabindex = parseInt(el.getAttribute('tabindex'));
      if (tabindex > 0) {
        results.warnings.push({
          rule: 'nav-tabindex',
          element: el.tagName.toLowerCase(),
          message: `Éviter tabindex="${tabindex}" positif, utiliser l'ordre naturel du DOM`,
          level: 'AA',
        });
      }
    });
  }

  checkStructure(document, results) {
    // Vérifier la hiérarchie des titres
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let previousLevel = 0;
    let h1Count = 0;

    headings.forEach((heading) => {
      const level = parseInt(heading.tagName.charAt(1));

      if (level === 1) {
        h1Count++;
        if (h1Count > 1) {
          results.warnings.push({
            rule: 'heading-h1-unique',
            message: 'Plusieurs balises H1 trouvées',
            level: 'AA',
          });
        }
      }

      if (previousLevel > 0 && level > previousLevel + 1) {
        results.failed.push({
          rule: 'heading-hierarchy',
          message: `Saut dans la hiérarchie : H${previousLevel} vers H${level}`,
          level: 'A',
        });
      }

      previousLevel = level;
    });

    if (h1Count === 0) {
      results.failed.push({
        rule: 'heading-h1-missing',
        message: 'Aucune balise H1 trouvée',
        level: 'A',
      });
    }
  }

  checkTables(document, results) {
    const tables = document.querySelectorAll('table');

    tables.forEach((table) => {
      // Vérifier la présence d'un caption ou aria-label
      const caption = table.querySelector('caption');
      const ariaLabel = table.getAttribute('aria-label');
      const ariaLabelledby = table.getAttribute('aria-labelledby');

      if (!caption && !ariaLabel && !ariaLabelledby) {
        results.warnings.push({
          rule: 'table-caption',
          message: 'Tableau sans caption ni aria-label',
          level: 'A',
        });
      }

      // Vérifier les en-têtes de tableau
      const ths = table.querySelectorAll('th');
      if (ths.length === 0) {
        results.failed.push({
          rule: 'table-headers',
          message: "Tableau sans cellules d'en-tête <th>",
          level: 'A',
        });
      }

      // Vérifier l'attribut scope sur les th
      ths.forEach((th) => {
        if (!th.hasAttribute('scope')) {
          results.warnings.push({
            rule: 'table-scope',
            message: "Cellule d'en-tête <th> sans attribut scope",
            level: 'A',
          });
        }
      });
    });
  }

  addSuggestions(document, results) {
    // Suggestions générales DSFR
    results.suggestions.push({
      category: 'DSFR',
      message: 'Utiliser les composants DSFR garantit une meilleure accessibilité de base',
    });

    // Vérifier l'utilisation des classes DSFR
    const buttons = document.querySelectorAll('button:not(.fr-btn)');
    if (buttons.length > 0) {
      results.suggestions.push({
        category: 'DSFR',
        message: `${buttons.length} bouton(s) sans classe DSFR .fr-btn`,
      });
    }

    // Contraste
    results.suggestions.push({
      category: 'Contraste',
      message:
        'Vérifier manuellement les ratios de contraste (4.5:1 minimum pour le texte normal, 3:1 pour le texte large)',
    });

    // Tests avec lecteur d'écran
    results.suggestions.push({
      category: 'Tests',
      message: "Tester avec un lecteur d'écran (NVDA, JAWS, VoiceOver)",
    });

    // Navigation clavier
    results.suggestions.push({
      category: 'Navigation',
      message: 'Vérifier que tous les éléments interactifs sont accessibles au clavier',
    });
  }

  calculateScore(results) {
    const totalChecks = results.passed.length + results.failed.length + results.warnings.length;
    if (totalChecks === 0) return 100;

    const failedWeight = results.failed.length * 10;
    const warningWeight = results.warnings.length * 3;

    const score = Math.max(0, 100 - failedWeight - warningWeight);
    return Math.round(score);
  }

  formatResults(results) {
    let output = `# Rapport d'accessibilité RGAA\n\n`;
    output += `**Niveau vérifié** : ${results.level}\n`;
    output += `**Score global** : ${results.score}/100\n\n`;

    if (results.failed.length > 0) {
      output += `## Erreurs critiques (${results.failed.length})\n\n`;
      results.failed.forEach((item) => {
        output += `### ${item.rule}\n`;
        output += `- **Niveau RGAA** : ${item.level}\n`;
        output += `- **Message** : ${item.message}\n`;
        if (item.element) {
          output += `- **Élément** : \`${item.element}\`\n`;
        }
        output += '\n';
      });
    }

    if (results.warnings.length > 0) {
      output += `## Avertissements (${results.warnings.length})\n\n`;
      results.warnings.forEach((item) => {
        output += `- **${item.rule}** : ${item.message}`;
        if (item.level) output += ` (Niveau ${item.level})`;
        output += '\n';
      });
      output += '\n';
    }

    if (results.passed.length > 0) {
      output += `## Tests réussis (${results.passed.length})\n\n`;
      results.passed.forEach((item) => {
        output += `- ${item.message}\n`;
      });
      output += '\n';
    }

    if (results.suggestions.length > 0) {
      output += `## Suggestions d'amélioration\n\n`;
      results.suggestions.forEach((suggestion) => {
        output += `- **${suggestion.category}** : ${suggestion.message}\n`;
      });
      output += '\n';
    }

    // Recommandations finales
    output += `## Recommandations\n\n`;
    if (results.score < 50) {
      output += `**Attention** : Le score d'accessibilité est faible. Des améliorations importantes sont nécessaires.\n\n`;
    }

    output += `1. Corriger toutes les erreurs critiques (niveau A)\n`;
    output += `2. Traiter les avertissements pour atteindre le niveau AA\n`;
    output += `3. Tester avec de vrais utilisateurs et assistances techniques\n`;
    output += `4. Utiliser les composants DSFR qui intègrent l'accessibilité\n`;

    return output;
  }
}

module.exports = AccessibilityService;
