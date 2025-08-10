// Service de validation DSFR
const { JSDOM } = require('jsdom');

class ValidationService {
  constructor() {
    this.dsfrClasses = this.initializeDSFRClasses();
    this.semanticRules = this.initializeSemanticRules();
  }

  initializeDSFRClasses() {
    return {
      // Classes de base
      container: ['fr-container', 'fr-container--fluid'],
      grid: ['fr-grid-row', 'fr-col', 'fr-col-12', 'fr-col-md-6', 'fr-col-lg-4'],

      // Composants
      button: ['fr-btn', 'fr-btn--secondary', 'fr-btn--tertiary', 'fr-btn--tertiary-no-outline'],
      alert: [
        'fr-alert',
        'fr-alert--info',
        'fr-alert--success',
        'fr-alert--error',
        'fr-alert--warning',
      ],
      badge: [
        'fr-badge',
        'fr-badge--info',
        'fr-badge--success',
        'fr-badge--error',
        'fr-badge--warning',
      ],
      card: ['fr-card', 'fr-card__body', 'fr-card__content', 'fr-card__title', 'fr-card__desc'],

      // Navigation
      nav: ['fr-nav', 'fr-nav__list', 'fr-nav__item', 'fr-nav__link'],
      breadcrumb: ['fr-breadcrumb', 'fr-breadcrumb__list', 'fr-breadcrumb__item'],

      // Formulaires
      form: [
        'fr-form-group',
        'fr-label',
        'fr-input',
        'fr-input-group',
        'fr-error-text',
        'fr-valid-text',
      ],

      // Typographie
      text: ['fr-text--sm', 'fr-text--regular', 'fr-text--lg', 'fr-text--xl'],
      heading: ['fr-h1', 'fr-h2', 'fr-h3', 'fr-h4', 'fr-h5', 'fr-h6'],

      // Utilitaires
      spacing: ['fr-mt-1w', 'fr-mb-2w', 'fr-pt-3w', 'fr-pb-4w', 'fr-px-1w', 'fr-py-2w'],
      display: ['fr-hidden', 'fr-unhidden', 'fr-displayed-lg', 'fr-hidden-sm'],
    };
  }

  initializeSemanticRules() {
    return {
      // Structure de page
      pageStructure: {
        required: ['header', 'main', 'footer'],
        optional: ['nav', 'aside'],
      },

      // Éléments de formulaire
      formElements: {
        input: {
          requiredAttributes: ['id', 'name'],
          accessibilityAttributes: ['aria-describedby'],
        },
        label: { requiredAttributes: ['for'] },
        button: { requiredAttributes: ['type'] },
        select: { requiredAttributes: ['id', 'name'] },
        textarea: { requiredAttributes: ['id', 'name'] },
      },

      // Images
      images: {
        required: ['alt'],
        decorative: { alt: '' },
      },
    };
  }

  async validateHTML({
    html_code,
    check_accessibility = true,
    check_semantic = true,
    strict_mode = false,
  }) {
    const results = await this.validateHTMLCore({
      html_code,
      check_accessibility,
      check_semantic,
      strict_mode,
    });

    return {
      content: [
        {
          type: 'text',
          text: this.formatValidationResults(results),
        },
      ],
    };
  }

  async validateHTMLCore({
    html_code,
    check_accessibility = true,
    check_semantic = true,
    strict_mode = false,
  }) {
    const results = {
      valid: true,
      errors: [],
      warnings: [],
      suggestions: [],
      score: 100,
    };

    try {
      const dom = new JSDOM(html_code);
      const document = dom.window.document;

      // Validation de base HTML
      this.validateHTMLStructure(document, results);

      // Validation des classes DSFR
      this.validateDSFRClasses(document, results, strict_mode);

      // Validation sémantique
      if (check_semantic) {
        this.validateSemanticHTML(document, results);
      }

      // Validation d'accessibilité
      if (check_accessibility) {
        this.validateAccessibility(document, results);
      }

      // Calcul du score
      results.score = this.calculateScore(results);
      results.valid = results.errors.length === 0;
    } catch (error) {
      results.valid = false;
      results.errors.push({
        type: 'parse_error',
        message: `Erreur lors de l'analyse HTML : ${error.message}`,
      });
    }

    return results;
  }

  validateHTMLStructure(document, results) {
    // Vérifier la présence du DOCTYPE
    if (!document.doctype) {
      results.warnings.push({
        type: 'structure',
        message: 'DOCTYPE HTML5 manquant',
      });
    }

    // Vérifier la langue
    const html = document.querySelector('html');
    if (!html || !html.getAttribute('lang')) {
      results.errors.push({
        type: 'accessibility',
        message: "L'attribut lang est manquant sur la balise <html>",
      });
    }

    // Vérifier les métadonnées essentielles
    const charset = document.querySelector('meta[charset]');
    if (!charset) {
      results.errors.push({
        type: 'structure',
        message: 'La déclaration charset est manquante',
      });
    }

    const viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      results.warnings.push({
        type: 'responsive',
        message: 'La balise meta viewport est manquante pour le responsive',
      });
    }

    // Vérifier le titre
    const title = document.querySelector('title');
    if (!title || !title.textContent.trim()) {
      results.errors.push({
        type: 'seo',
        message: 'La balise <title> est manquante ou vide',
      });
    }
  }

  validateDSFRClasses(document, results, strictMode) {
    const allElements = document.querySelectorAll('*');
    const usedClasses = new Set();
    const unknownClasses = new Set();

    // Collecter toutes les classes utilisées
    allElements.forEach((element) => {
      const classes = element.className.split(' ').filter((c) => c);
      classes.forEach((className) => {
        usedClasses.add(className);

        // Vérifier si c'est une classe DSFR
        if (className.startsWith('fr-')) {
          const isKnownClass = Object.values(this.dsfrClasses).flat().includes(className);

          if (!isKnownClass && strictMode) {
            unknownClasses.add(className);
          }
        }
      });
    });

    // Vérifications spécifiques aux composants
    this.validateButtons(document, results);
    this.validateForms(document, results);
    this.validateCards(document, results);
    this.validateAlerts(document, results);

    // Rapporter les classes inconnues
    if (unknownClasses.size > 0) {
      results.warnings.push({
        type: 'dsfr_classes',
        message: `Classes DSFR non reconnues : ${Array.from(unknownClasses).join(', ')}`,
      });
    }
  }

  validateButtons(document, results) {
    const buttons = document.querySelectorAll('.fr-btn');

    buttons.forEach((button) => {
      // Vérifier que c'est bien un button ou un a
      const tagName = button.tagName.toLowerCase();
      if (tagName !== 'button' && tagName !== 'a') {
        results.errors.push({
          type: 'dsfr_component',
          message: `La classe fr-btn doit être utilisée sur un élément <button> ou <a>, pas sur <${tagName}>`,
        });
      }

      // Pour les liens boutons, vérifier href
      if (tagName === 'a' && !button.getAttribute('href')) {
        results.warnings.push({
          type: 'dsfr_component',
          message: 'Un lien avec la classe fr-btn devrait avoir un attribut href',
        });
      }
    });
  }

  validateForms(document, results) {
    const formGroups = document.querySelectorAll('.fr-form-group');

    formGroups.forEach((group) => {
      const input = group.querySelector('input, select, textarea');
      const label = group.querySelector('label');

      if (input && !label) {
        results.errors.push({
          type: 'dsfr_form',
          message: 'Un fr-form-group avec un champ de saisie doit contenir un label',
        });
      }

      if (input && label) {
        const inputId = input.getAttribute('id');
        const labelFor = label.getAttribute('for');

        if (!inputId || inputId !== labelFor) {
          results.errors.push({
            type: 'dsfr_form',
            message: "Le label doit être correctement associé au champ avec l'attribut for",
          });
        }
      }
    });
  }

  validateCards(document, results) {
    const cards = document.querySelectorAll('.fr-card');

    cards.forEach((card) => {
      const hasBody = card.querySelector('.fr-card__body');
      const hasContent = card.querySelector('.fr-card__content');

      if (!hasBody || !hasContent) {
        results.warnings.push({
          type: 'dsfr_component',
          message: 'Une fr-card devrait contenir fr-card__body et fr-card__content',
        });
      }
    });
  }

  validateAlerts(document, results) {
    const alerts = document.querySelectorAll('.fr-alert');

    alerts.forEach((alert) => {
      const hasTitle = alert.querySelector('.fr-alert__title');
      const hasRole = alert.getAttribute('role') === 'alert';

      if (!hasTitle) {
        results.suggestions.push({
          type: 'dsfr_component',
          message: 'Une fr-alert devrait contenir un fr-alert__title',
        });
      }

      if (!hasRole) {
        results.warnings.push({
          type: 'accessibility',
          message: 'Une fr-alert devrait avoir role="alert" pour l\'accessibilité',
        });
      }
    });
  }

  validateSemanticHTML(document, results) {
    // Structure de page
    const header = document.querySelector('header');
    const main = document.querySelector('main');
    const footer = document.querySelector('footer');

    if (!header) {
      results.warnings.push({
        type: 'semantic',
        message: 'La balise <header> est manquante',
      });
    }

    if (!main) {
      results.errors.push({
        type: 'semantic',
        message: 'La balise <main> est manquante',
      });
    }

    if (!footer) {
      results.warnings.push({
        type: 'semantic',
        message: 'La balise <footer> est manquante',
      });
    }

    // Hiérarchie des titres
    this.validateHeadingHierarchy(document, results);
  }

  validateHeadingHierarchy(document, results) {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let previousLevel = 0;
    let h1Count = 0;

    headings.forEach((heading) => {
      const level = parseInt(heading.tagName.charAt(1));

      if (level === 1) {
        h1Count++;
      }

      if (previousLevel > 0 && level > previousLevel + 1) {
        results.warnings.push({
          type: 'semantic',
          message: `Saut dans la hiérarchie des titres : de H${previousLevel} à H${level}`,
        });
      }

      previousLevel = level;
    });

    if (h1Count === 0) {
      results.errors.push({
        type: 'semantic',
        message: 'La page doit contenir au moins un titre H1',
      });
    } else if (h1Count > 1) {
      results.warnings.push({
        type: 'semantic',
        message: 'La page contient plusieurs H1, ce qui peut nuire au SEO',
      });
    }
  }

  validateAccessibility(document, results) {
    // Images
    const images = document.querySelectorAll('img');
    images.forEach((img) => {
      if (!img.hasAttribute('alt')) {
        results.errors.push({
          type: 'accessibility',
          message: `Image sans attribut alt : ${img.src || 'source inconnue'}`,
        });
      }
    });

    // Liens
    const links = document.querySelectorAll('a');
    links.forEach((link) => {
      const text = link.textContent.trim();
      const ariaLabel = link.getAttribute('aria-label');

      if (!text && !ariaLabel) {
        results.errors.push({
          type: 'accessibility',
          message: 'Lien sans texte ni aria-label',
        });
      }

      if (text.toLowerCase() === 'cliquez ici' || text.toLowerCase() === 'en savoir plus') {
        results.warnings.push({
          type: 'accessibility',
          message: `Texte de lien non descriptif : "${text}"`,
        });
      }
    });

    // Formulaires
    const inputs = document.querySelectorAll('input:not([type="hidden"]), select, textarea');
    inputs.forEach((input) => {
      const id = input.getAttribute('id');
      const label = document.querySelector(`label[for="${id}"]`);
      const ariaLabel = input.getAttribute('aria-label');
      const ariaLabelledby = input.getAttribute('aria-labelledby');

      if (!label && !ariaLabel && !ariaLabelledby) {
        results.errors.push({
          type: 'accessibility',
          message: `Champ de formulaire sans label : ${input.name || input.id || 'sans identifiant'}`,
        });
      }
    });

    // Contraste (suggestion basique)
    results.suggestions.push({
      type: 'accessibility',
      message:
        'Vérifiez manuellement les contrastes de couleur (ratio minimum 4.5:1 pour le texte normal)',
    });
  }

  calculateScore(results) {
    let score = 100;

    // Déduire des points selon la gravité
    score -= results.errors.length * 10;
    score -= results.warnings.length * 5;

    return Math.max(0, score);
  }

  formatValidationResults(results) {
    let output = `# Résultats de validation DSFR\n\n`;
    output += `**Score global : ${results.score}/100**\n`;
    output += `**Statut : ${results.valid ? 'Valide' : 'Non valide'}**\n\n`;

    if (results.errors.length > 0) {
      output += `## Erreurs (${results.errors.length})\n\n`;
      results.errors.forEach((error, index) => {
        output += `${index + 1}. **[${error.type}]** ${error.message}\n`;
      });
      output += '\n';
    }

    if (results.warnings.length > 0) {
      output += `## Avertissements (${results.warnings.length})\n\n`;
      results.warnings.forEach((warning, index) => {
        output += `${index + 1}. **[${warning.type}]** ${warning.message}\n`;
      });
      output += '\n';
    }

    if (results.suggestions.length > 0) {
      output += `## Suggestions (${results.suggestions.length})\n\n`;
      results.suggestions.forEach((suggestion, index) => {
        output += `${index + 1}. **[${suggestion.type}]** ${suggestion.message}\n`;
      });
      output += '\n';
    }

    // Recommandations
    output += `## Recommandations\n\n`;
    if (!results.valid) {
      output += `1. Corrigez d'abord toutes les erreurs critiques\n`;
      output += `2. Traitez ensuite les avertissements\n`;
      output += `3. Appliquez les suggestions pour améliorer la qualité\n`;
    } else {
      output += `Votre code respecte les standards DSFR de base.\n`;
      output += `Continuez à suivre les bonnes pratiques d'accessibilité et de sémantique HTML.\n`;
    }

    return output;
  }

  // 🆕 Phase 3.1 - Suggestion d'améliorations
  async suggestImprovements({
    html_code,
    improvement_categories = ['accessibility', 'dsfr-compliance', 'best-practices'],
    priority_level = 'high',
    include_code_examples = true,
    include_explanations = true,
    max_suggestions = 20,
  }) {
    const dom = new JSDOM(html_code);
    const document = dom.window.document;

    const improvements = {
      suggestions: [],
      stats: {
        analyzed_elements: document.querySelectorAll('*').length,
        total_issues_found: 0,
        categories_analyzed: improvement_categories,
      },
      priority_distribution: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
      },
    };

    // Analyser chaque catégorie demandée
    for (const category of improvement_categories) {
      switch (category) {
        case 'accessibility':
          this.suggestAccessibilityImprovements(document, improvements, include_code_examples);
          break;
        case 'dsfr-compliance':
          this.suggestDsfrComplianceImprovements(document, improvements, include_code_examples);
          break;
        case 'performance':
          this.suggestPerformanceImprovements(document, improvements, include_code_examples);
          break;
        case 'seo':
          this.suggestSeoImprovements(document, improvements, include_code_examples);
          break;
        case 'semantics':
          this.suggestSemanticImprovements(document, improvements, include_code_examples);
          break;
        case 'best-practices':
          this.suggestBestPracticesImprovements(document, improvements, include_code_examples);
          break;
      }
    }

    // Filtrer par niveau de priorité
    const priorityOrder = ['critical', 'high', 'medium', 'low'];
    const minPriorityIndex = priorityOrder.indexOf(priority_level);

    if (priority_level !== 'all') {
      improvements.suggestions = improvements.suggestions.filter(
        (suggestion) => priorityOrder.indexOf(suggestion.priority) <= minPriorityIndex
      );
    }

    // Limiter le nombre de suggestions
    improvements.suggestions = improvements.suggestions.slice(0, max_suggestions);

    // Mettre à jour les statistiques
    improvements.stats.total_issues_found = improvements.suggestions.length;
    improvements.suggestions.forEach((suggestion) => {
      improvements.priority_distribution[suggestion.priority]++;
    });

    return {
      content: [
        {
          type: 'text',
          text: this.formatImprovementSuggestions(improvements, include_explanations),
        },
      ],
    };
  }

  suggestAccessibilityImprovements(document, improvements, includeExamples) {
    // Images sans alt
    const imagesWithoutAlt = document.querySelectorAll('img:not([alt])');
    imagesWithoutAlt.forEach((img, index) => {
      improvements.suggestions.push({
        id: `acc_img_alt_${index}`,
        category: 'accessibility',
        priority: 'critical',
        title: 'Image sans attribut alt',
        description: "Les images doivent avoir un attribut alt pour l'accessibilité",
        element: `<img src="${img.src || 'unknown'}">`,
        issue: 'Attribut alt manquant',
        solution: 'Ajouter un attribut alt descriptif',
        code_before: includeExamples ? img.outerHTML : null,
        code_after: includeExamples
          ? img.outerHTML.replace('>', ' alt="Description de l\'image">')
          : null,
        impact: "Les lecteurs d'écran ne peuvent pas décrire l'image aux utilisateurs malvoyants",
      });
    });

    // Liens sans texte descriptif
    const linksWithoutText = document.querySelectorAll('a');
    linksWithoutText.forEach((link, index) => {
      const text = link.textContent.trim();
      if (!text && !link.getAttribute('aria-label')) {
        improvements.suggestions.push({
          id: `acc_link_text_${index}`,
          category: 'accessibility',
          priority: 'high',
          title: 'Lien sans texte accessible',
          description: 'Tous les liens doivent avoir un texte ou un aria-label',
          element: link.outerHTML,
          issue: 'Lien sans texte ni aria-label',
          solution: 'Ajouter du texte ou un aria-label',
          code_after: includeExamples
            ? `<a href="${link.href}" aria-label="Description du lien">${link.innerHTML}</a>`
            : null,
        });
      }
    });

    // Champs de formulaire sans label
    const inputsWithoutLabel = document.querySelectorAll(
      'input:not([type="hidden"]), select, textarea'
    );
    inputsWithoutLabel.forEach((input, index) => {
      const id = input.id;
      const hasLabel = id && document.querySelector(`label[for="${id}"]`);
      const hasAriaLabel = input.getAttribute('aria-label');

      if (!hasLabel && !hasAriaLabel) {
        improvements.suggestions.push({
          id: `acc_form_label_${index}`,
          category: 'accessibility',
          priority: 'critical',
          title: 'Champ de formulaire sans label',
          description: 'Tous les champs doivent être associés à un label',
          element: input.outerHTML,
          solution: "Ajouter un label avec l'attribut for correspondant à l'id du champ",
          code_after: includeExamples
            ? `<label for="${input.id || 'field-id'}">Libellé du champ</label>\n${input.outerHTML}`
            : null,
        });
      }
    });
  }

  suggestDsfrComplianceImprovements(document, improvements, includeExamples) {
    // Boutons sans classes DSFR
    const buttons = document.querySelectorAll(
      'button:not(.fr-btn), input[type="submit"]:not(.fr-btn)'
    );
    buttons.forEach((button, index) => {
      improvements.suggestions.push({
        id: `dsfr_btn_${index}`,
        category: 'dsfr-compliance',
        priority: 'medium',
        title: 'Bouton sans style DSFR',
        description: 'Utiliser les classes fr-btn pour la cohérence visuelle',
        element: button.outerHTML,
        solution: 'Ajouter la classe fr-btn',
        code_after: includeExamples
          ? button.outerHTML
              .replace('class="', 'class="fr-btn ')
              .replace('<button', '<button class="fr-btn"')
              .replace('<input', '<input class="fr-btn"')
          : null,
      });
    });

    // Conteneurs sans classes DSFR
    const hasContainer = document.querySelector('.fr-container');
    if (!hasContainer) {
      improvements.suggestions.push({
        id: 'dsfr_container',
        category: 'dsfr-compliance',
        priority: 'high',
        title: 'Pas de conteneur DSFR',
        description: 'Utiliser fr-container pour structurer la mise en page',
        solution: 'Envelopper le contenu principal dans un div.fr-container',
        code_after: includeExamples
          ? '<div class="fr-container">\n  <!-- Votre contenu ici -->\n</div>'
          : null,
      });
    }

    // Grille DSFR
    const hasGrid = document.querySelector('.fr-grid-row');
    const hasFlexOrGrid = document.querySelector(
      '[style*="display: flex"], [style*="display: grid"]'
    );
    if (hasFlexOrGrid && !hasGrid) {
      improvements.suggestions.push({
        id: 'dsfr_grid',
        category: 'dsfr-compliance',
        priority: 'medium',
        title: 'Système de grille custom détecté',
        description: "Considérer l'utilisation du système de grille DSFR",
        solution: 'Remplacer par fr-grid-row et fr-col',
        code_after: includeExamples
          ? '<div class="fr-grid-row">\n  <div class="fr-col-12 fr-col-md-6">Colonne 1</div>\n  <div class="fr-col-12 fr-col-md-6">Colonne 2</div>\n</div>'
          : null,
      });
    }
  }

  suggestPerformanceImprovements(document, improvements, includeExamples) {
    // Images sans attributs de performance
    const images = document.querySelectorAll('img');
    images.forEach((img, index) => {
      if (!img.getAttribute('loading') && !img.getAttribute('decoding')) {
        improvements.suggestions.push({
          id: `perf_img_${index}`,
          category: 'performance',
          priority: 'low',
          title: 'Image sans optimisations de performance',
          description: 'Ajouter loading="lazy" pour le lazy loading',
          element: img.outerHTML,
          solution: 'Ajouter les attributs loading et decoding',
          code_after: includeExamples
            ? img.outerHTML.replace('>', ' loading="lazy" decoding="async">')
            : null,
        });
      }
    });

    // Scripts sans defer/async
    const scripts = document.querySelectorAll('script[src]:not([async]):not([defer])');
    if (scripts.length > 0) {
      improvements.suggestions.push({
        id: 'perf_scripts',
        category: 'performance',
        priority: 'medium',
        title: 'Scripts bloquants détectés',
        description: 'Les scripts externes peuvent bloquer le rendu de la page',
        solution: 'Ajouter defer ou async selon le besoin',
        code_after: includeExamples ? '<script src="script.js" defer></script>' : null,
      });
    }
  }

  suggestSeoImprovements(document, improvements, includeExamples) {
    // Balises meta manquantes
    const hasDescription = document.querySelector('meta[name="description"]');
    if (!hasDescription) {
      improvements.suggestions.push({
        id: 'seo_description',
        category: 'seo',
        priority: 'high',
        title: 'Meta description manquante',
        description: 'La meta description améliore le référencement',
        solution: 'Ajouter une meta description',
        code_after: includeExamples
          ? '<meta name="description" content="Description de votre page">'
          : null,
      });
    }

    // Titres H1 multiples
    const h1s = document.querySelectorAll('h1');
    if (h1s.length > 1) {
      improvements.suggestions.push({
        id: 'seo_h1_multiple',
        category: 'seo',
        priority: 'medium',
        title: 'Plusieurs H1 détectés',
        description: 'Une seule balise H1 par page est recommandée pour le SEO',
        solution: 'Utiliser H2, H3, etc. pour les sous-titres',
      });
    }
  }

  suggestSemanticImprovements(document, improvements, includeExamples) {
    // Structure sémantique manquante
    const hasMain = document.querySelector('main');
    if (!hasMain) {
      improvements.suggestions.push({
        id: 'sem_main',
        category: 'semantics',
        priority: 'high',
        title: 'Balise main manquante',
        description: 'La balise main identifie le contenu principal',
        solution: 'Envelopper le contenu principal dans une balise main',
        code_after: includeExamples ? '<main>\n  <!-- Contenu principal -->\n</main>' : null,
      });
    }

    // Divs qui pourraient être des éléments sémantiques
    const suspiciousDivs = document.querySelectorAll(
      'div[class*="header"], div[class*="footer"], div[class*="nav"], div[class*="article"]'
    );
    suspiciousDivs.forEach((div, index) => {
      const className = div.className;
      let suggestedTag = 'div';

      if (className.includes('header')) suggestedTag = 'header';
      else if (className.includes('footer')) suggestedTag = 'footer';
      else if (className.includes('nav')) suggestedTag = 'nav';
      else if (className.includes('article')) suggestedTag = 'article';

      if (suggestedTag !== 'div') {
        improvements.suggestions.push({
          id: `sem_div_${index}`,
          category: 'semantics',
          priority: 'low',
          title: `Div sémantique détectée`,
          description: `Cette div pourrait être remplacée par une balise ${suggestedTag}`,
          element: div.outerHTML.substring(0, 100) + '...',
          solution: `Remplacer la div par <${suggestedTag}>`,
          code_after: includeExamples
            ? div.outerHTML
                .replace('<div', `<${suggestedTag}`)
                .replace('</div>', `</${suggestedTag}>`)
            : null,
        });
      }
    });
  }

  suggestBestPracticesImprovements(document, improvements) {
    // Classes CSS avec !important dans style inline
    const elementsWithImportant = document.querySelectorAll('*[style*="!important"]');
    elementsWithImportant.forEach((element, index) => {
      improvements.suggestions.push({
        id: `bp_important_${index}`,
        category: 'best-practices',
        priority: 'medium',
        title: 'Usage de !important détecté',
        description: 'Éviter !important, préférer la spécificité CSS',
        element: element.outerHTML.substring(0, 100),
        solution: 'Refactoriser le CSS sans !important',
      });
    });

    // IDs dupliqués
    const allIds = [];
    const duplicateIds = [];
    document.querySelectorAll('[id]').forEach((element) => {
      const id = element.getAttribute('id');
      if (allIds.includes(id) && !duplicateIds.includes(id)) {
        duplicateIds.push(id);
      }
      allIds.push(id);
    });

    duplicateIds.forEach((id) => {
      improvements.suggestions.push({
        id: `bp_duplicate_id_${id}`,
        category: 'best-practices',
        priority: 'high',
        title: `ID dupliqué: ${id}`,
        description: 'Les IDs doivent être uniques dans le document',
        solution: 'Utiliser des classes ou rendre les IDs uniques',
      });
    });
  }

  formatImprovementSuggestions(improvements, includeExplanations) {
    let output = "# 🚀 Suggestions d'améliorations DSFR\n\n";

    // Statistiques
    output += "## 📊 Résumé de l'analyse\n\n";
    output += `- **Éléments analysés** : ${improvements.stats.analyzed_elements}\n`;
    output += `- **Suggestions trouvées** : ${improvements.stats.total_issues_found}\n`;
    output += `- **Catégories analysées** : ${improvements.stats.categories_analyzed.join(', ')}\n\n`;

    // Distribution par priorité
    output += '### Répartition par priorité\n\n';
    Object.entries(improvements.priority_distribution).forEach(([priority, count]) => {
      if (count > 0) {
        const emoji = { critical: '🔴', high: '🟠', medium: '🟡', low: '🟢' };
        output += `- ${emoji[priority]} **${priority}** : ${count} suggestion${count > 1 ? 's' : ''}\n`;
      }
    });
    output += '\n';

    // Suggestions groupées par catégorie
    const groupedSuggestions = improvements.suggestions.reduce((acc, suggestion) => {
      if (!acc[suggestion.category]) acc[suggestion.category] = [];
      acc[suggestion.category].push(suggestion);
      return acc;
    }, {});

    Object.entries(groupedSuggestions).forEach(([category, suggestions]) => {
      const categoryEmojis = {
        accessibility: '♿',
        'dsfr-compliance': '🎨',
        performance: '⚡',
        seo: '🔍',
        semantics: '📝',
        'best-practices': '✨',
      };

      output += `## ${categoryEmojis[category] || '📋'} ${category.charAt(0).toUpperCase() + category.slice(1)}\n\n`;

      suggestions.forEach((suggestion, index) => {
        const priorityEmoji = { critical: '🔴', high: '🟠', medium: '🟡', low: '🟢' };

        output += `### ${index + 1}. ${suggestion.title} ${priorityEmoji[suggestion.priority]}\n\n`;

        if (includeExplanations && suggestion.description) {
          output += `**Description** : ${suggestion.description}\n\n`;
        }

        if (suggestion.issue) {
          output += `**Problème** : ${suggestion.issue}\n\n`;
        }

        output += `**Solution** : ${suggestion.solution}\n\n`;

        if (suggestion.impact) {
          output += `**Impact** : ${suggestion.impact}\n\n`;
        }

        // Exemples de code
        if (suggestion.code_before) {
          output += '**Avant** :\n```html\n' + suggestion.code_before + '\n```\n\n';
        }

        if (suggestion.code_after) {
          output += '**Après** :\n```html\n' + suggestion.code_after + '\n```\n\n';
        }

        output += '---\n\n';
      });
    });

    if (improvements.suggestions.length === 0) {
      output += '## 🎉 Félicitations !\n\n';
      output +=
        'Aucune amélioration majeure détectée. Votre code respecte déjà les bonnes pratiques !\n\n';
    }

    output += '*Analyse générée par DSFR-MCP v1.4.0*';

    return output;
  }
}

module.exports = ValidationService;
