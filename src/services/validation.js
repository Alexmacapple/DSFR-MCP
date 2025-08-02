// Service de validation DSFR
const { JSDOM } = require('jsdom');
const config = require('../config');

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
      alert: ['fr-alert', 'fr-alert--info', 'fr-alert--success', 'fr-alert--error', 'fr-alert--warning'],
      badge: ['fr-badge', 'fr-badge--info', 'fr-badge--success', 'fr-badge--error', 'fr-badge--warning'],
      card: ['fr-card', 'fr-card__body', 'fr-card__content', 'fr-card__title', 'fr-card__desc'],
      
      // Navigation
      nav: ['fr-nav', 'fr-nav__list', 'fr-nav__item', 'fr-nav__link'],
      breadcrumb: ['fr-breadcrumb', 'fr-breadcrumb__list', 'fr-breadcrumb__item'],
      
      // Formulaires
      form: ['fr-form-group', 'fr-label', 'fr-input', 'fr-input-group', 'fr-error-text', 'fr-valid-text'],
      
      // Typographie
      text: ['fr-text--sm', 'fr-text--regular', 'fr-text--lg', 'fr-text--xl'],
      heading: ['fr-h1', 'fr-h2', 'fr-h3', 'fr-h4', 'fr-h5', 'fr-h6'],
      
      // Utilitaires
      spacing: ['fr-mt-1w', 'fr-mb-2w', 'fr-pt-3w', 'fr-pb-4w', 'fr-px-1w', 'fr-py-2w'],
      display: ['fr-hidden', 'fr-unhidden', 'fr-displayed-lg', 'fr-hidden-sm']
    };
  }

  initializeSemanticRules() {
    return {
      // Structure de page
      pageStructure: {
        required: ['header', 'main', 'footer'],
        optional: ['nav', 'aside']
      },
      
      // Éléments de formulaire
      formElements: {
        'input': { requiredAttributes: ['id', 'name'], accessibilityAttributes: ['aria-describedby'] },
        'label': { requiredAttributes: ['for'] },
        'button': { requiredAttributes: ['type'] },
        'select': { requiredAttributes: ['id', 'name'] },
        'textarea': { requiredAttributes: ['id', 'name'] }
      },
      
      // Images
      images: {
        required: ['alt'],
        decorative: { alt: '' }
      }
    };
  }

  async validateHTML({ html_code, check_accessibility = true, check_semantic = true, strict_mode = false }) {
    const results = {
      valid: true,
      errors: [],
      warnings: [],
      suggestions: [],
      score: 100
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
        message: `Erreur lors de l'analyse HTML : ${error.message}`
      });
    }

    return {
      content: [{
        type: 'text',
        text: this.formatValidationResults(results)
      }]
    };
  }

  validateHTMLStructure(document, results) {
    // Vérifier la présence du DOCTYPE
    if (!document.doctype) {
      results.warnings.push({
        type: 'structure',
        message: 'DOCTYPE HTML5 manquant'
      });
    }

    // Vérifier la langue
    const html = document.querySelector('html');
    if (!html || !html.getAttribute('lang')) {
      results.errors.push({
        type: 'accessibility',
        message: 'L\'attribut lang est manquant sur la balise <html>'
      });
    }

    // Vérifier les métadonnées essentielles
    const charset = document.querySelector('meta[charset]');
    if (!charset) {
      results.errors.push({
        type: 'structure',
        message: 'La déclaration charset est manquante'
      });
    }

    const viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      results.warnings.push({
        type: 'responsive',
        message: 'La balise meta viewport est manquante pour le responsive'
      });
    }

    // Vérifier le titre
    const title = document.querySelector('title');
    if (!title || !title.textContent.trim()) {
      results.errors.push({
        type: 'seo',
        message: 'La balise <title> est manquante ou vide'
      });
    }
  }

  validateDSFRClasses(document, results, strictMode) {
    const allElements = document.querySelectorAll('*');
    const usedClasses = new Set();
    const unknownClasses = new Set();

    // Collecter toutes les classes utilisées
    allElements.forEach(element => {
      const classes = element.className.split(' ').filter(c => c);
      classes.forEach(className => {
        usedClasses.add(className);
        
        // Vérifier si c'est une classe DSFR
        if (className.startsWith('fr-')) {
          const isKnownClass = Object.values(this.dsfrClasses)
            .flat()
            .includes(className);
          
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
        message: `Classes DSFR non reconnues : ${Array.from(unknownClasses).join(', ')}`
      });
    }
  }

  validateButtons(document, results) {
    const buttons = document.querySelectorAll('.fr-btn');
    
    buttons.forEach(button => {
      // Vérifier que c'est bien un button ou un a
      const tagName = button.tagName.toLowerCase();
      if (tagName !== 'button' && tagName !== 'a') {
        results.errors.push({
          type: 'dsfr_component',
          message: `La classe fr-btn doit être utilisée sur un élément <button> ou <a>, pas sur <${tagName}>`
        });
      }

      // Pour les liens boutons, vérifier href
      if (tagName === 'a' && !button.getAttribute('href')) {
        results.warnings.push({
          type: 'dsfr_component',
          message: 'Un lien avec la classe fr-btn devrait avoir un attribut href'
        });
      }
    });
  }

  validateForms(document, results) {
    const formGroups = document.querySelectorAll('.fr-form-group');
    
    formGroups.forEach(group => {
      const input = group.querySelector('input, select, textarea');
      const label = group.querySelector('label');

      if (input && !label) {
        results.errors.push({
          type: 'dsfr_form',
          message: 'Un fr-form-group avec un champ de saisie doit contenir un label'
        });
      }

      if (input && label) {
        const inputId = input.getAttribute('id');
        const labelFor = label.getAttribute('for');
        
        if (!inputId || inputId !== labelFor) {
          results.errors.push({
            type: 'dsfr_form',
            message: 'Le label doit être correctement associé au champ avec l\'attribut for'
          });
        }
      }
    });
  }

  validateCards(document, results) {
    const cards = document.querySelectorAll('.fr-card');
    
    cards.forEach(card => {
      const hasBody = card.querySelector('.fr-card__body');
      const hasContent = card.querySelector('.fr-card__content');
      
      if (!hasBody || !hasContent) {
        results.warnings.push({
          type: 'dsfr_component',
          message: 'Une fr-card devrait contenir fr-card__body et fr-card__content'
        });
      }
    });
  }

  validateAlerts(document, results) {
    const alerts = document.querySelectorAll('.fr-alert');
    
    alerts.forEach(alert => {
      const hasTitle = alert.querySelector('.fr-alert__title');
      const hasRole = alert.getAttribute('role') === 'alert';
      
      if (!hasTitle) {
        results.suggestions.push({
          type: 'dsfr_component',
          message: 'Une fr-alert devrait contenir un fr-alert__title'
        });
      }
      
      if (!hasRole) {
        results.warnings.push({
          type: 'accessibility',
          message: 'Une fr-alert devrait avoir role="alert" pour l\'accessibilité'
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
        message: 'La balise <header> est manquante'
      });
    }

    if (!main) {
      results.errors.push({
        type: 'semantic',
        message: 'La balise <main> est manquante'
      });
    }

    if (!footer) {
      results.warnings.push({
        type: 'semantic',
        message: 'La balise <footer> est manquante'
      });
    }

    // Hiérarchie des titres
    this.validateHeadingHierarchy(document, results);
  }

  validateHeadingHierarchy(document, results) {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let previousLevel = 0;
    let h1Count = 0;

    headings.forEach(heading => {
      const level = parseInt(heading.tagName.charAt(1));
      
      if (level === 1) {
        h1Count++;
      }

      if (previousLevel > 0 && level > previousLevel + 1) {
        results.warnings.push({
          type: 'semantic',
          message: `Saut dans la hiérarchie des titres : de H${previousLevel} à H${level}`
        });
      }

      previousLevel = level;
    });

    if (h1Count === 0) {
      results.errors.push({
        type: 'semantic',
        message: 'La page doit contenir au moins un titre H1'
      });
    } else if (h1Count > 1) {
      results.warnings.push({
        type: 'semantic',
        message: 'La page contient plusieurs H1, ce qui peut nuire au SEO'
      });
    }
  }

  validateAccessibility(document, results) {
    // Images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (!img.hasAttribute('alt')) {
        results.errors.push({
          type: 'accessibility',
          message: `Image sans attribut alt : ${img.src || 'source inconnue'}`
        });
      }
    });

    // Liens
    const links = document.querySelectorAll('a');
    links.forEach(link => {
      const text = link.textContent.trim();
      const ariaLabel = link.getAttribute('aria-label');
      
      if (!text && !ariaLabel) {
        results.errors.push({
          type: 'accessibility',
          message: 'Lien sans texte ni aria-label'
        });
      }
      
      if (text.toLowerCase() === 'cliquez ici' || text.toLowerCase() === 'en savoir plus') {
        results.warnings.push({
          type: 'accessibility',
          message: `Texte de lien non descriptif : "${text}"`
        });
      }
    });

    // Formulaires
    const inputs = document.querySelectorAll('input:not([type="hidden"]), select, textarea');
    inputs.forEach(input => {
      const id = input.getAttribute('id');
      const label = document.querySelector(`label[for="${id}"]`);
      const ariaLabel = input.getAttribute('aria-label');
      const ariaLabelledby = input.getAttribute('aria-labelledby');
      
      if (!label && !ariaLabel && !ariaLabelledby) {
        results.errors.push({
          type: 'accessibility',
          message: `Champ de formulaire sans label : ${input.name || input.id || 'sans identifiant'}`
        });
      }
    });

    // Contraste (suggestion basique)
    results.suggestions.push({
      type: 'accessibility',
      message: 'Vérifiez manuellement les contrastes de couleur (ratio minimum 4.5:1 pour le texte normal)'
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
    output += `**Statut : ${results.valid ? '✅ Valide' : '❌ Non valide'}**\n\n`;

    if (results.errors.length > 0) {
      output += `## ❌ Erreurs (${results.errors.length})\n\n`;
      results.errors.forEach((error, index) => {
        output += `${index + 1}. **[${error.type}]** ${error.message}\n`;
      });
      output += '\n';
    }

    if (results.warnings.length > 0) {
      output += `## ⚠️ Avertissements (${results.warnings.length})\n\n`;
      results.warnings.forEach((warning, index) => {
        output += `${index + 1}. **[${warning.type}]** ${warning.message}\n`;
      });
      output += '\n';
    }

    if (results.suggestions.length > 0) {
      output += `## 💡 Suggestions (${results.suggestions.length})\n\n`;
      results.suggestions.forEach((suggestion, index) => {
        output += `${index + 1}. **[${suggestion.type}]** ${suggestion.message}\n`;
      });
      output += '\n';
    }

    // Recommandations
    output += `## 📋 Recommandations\n\n`;
    if (!results.valid) {
      output += `1. Corrigez d'abord toutes les erreurs critiques\n`;
      output += `2. Traitez ensuite les avertissements\n`;
      output += `3. Appliquez les suggestions pour améliorer la qualité\n`;
    } else {
      output += `✅ Votre code respecte les standards DSFR de base.\n`;
      output += `Continuez à suivre les bonnes pratiques d'accessibilité et de sémantique HTML.\n`;
    }

    return output;
  }
}

module.exports = ValidationService;
