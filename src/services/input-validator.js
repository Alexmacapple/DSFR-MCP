// Service de validation et sanitisation des entrées MCP
const InputSchemas = require('../schemas/input-schemas');

class InputValidatorService {
  constructor() {
    this.schemas = new InputSchemas();
  }

  /**
   * Valide et sanitise les paramètres d'entrée pour un outil MCP
   * @param {string} toolName - Nom de l'outil
   * @param {Object} params - Paramètres à valider
   * @returns {Object} Résultat de validation avec paramètres sanitisés
   */
  validateAndSanitize(toolName, params) {
    // Validation avec le schéma
    const validation = this.schemas.validate(toolName, params);

    if (!validation.valid) {
      throw new Error(`Paramètres invalides pour ${toolName}: ${validation.errors.join(', ')}`);
    }

    // Sanitisation supplémentaire
    const sanitized = this.additionalSanitization(validation.sanitized, toolName);

    return {
      valid: true,
      sanitized,
      errors: [],
    };
  }

  /**
   * Sanitisation supplémentaire spécifique par outil
   * @param {Object} params - Paramètres déjà validés
   * @param {string} toolName - Nom de l'outil
   * @returns {Object} Paramètres sanitisés
   */
  additionalSanitization(params, toolName) {
    const sanitized = { ...params };

    switch (toolName) {
      case 'search_dsfr_components':
        // Nettoyer la requête de recherche
        if (sanitized.query) {
          sanitized.query = this.sanitizeSearchQuery(sanitized.query);
        }
        break;

      case 'validate_dsfr_html':
      case 'check_accessibility':
        // Nettoyer le code HTML
        if (sanitized.html_code) {
          sanitized.html_code = this.sanitizeHtmlCode(sanitized.html_code);
        }
        break;

      case 'generate_dsfr_component':
        // Normaliser le nom du composant
        if (sanitized.component_type) {
          sanitized.component_type = sanitized.component_type
            .toLowerCase()
            .replace(/[^a-z0-9_-]/g, '');
        }
        break;

      case 'create_dsfr_theme':
        // Normaliser le nom du thème
        if (sanitized.theme_name) {
          sanitized.theme_name = sanitized.theme_name.toLowerCase().replace(/[^a-z0-9_-]/g, '');
        }
        // Valider et normaliser les couleurs
        if (sanitized.primary_color) {
          sanitized.primary_color = this.normalizeColor(sanitized.primary_color);
        }
        if (sanitized.secondary_color) {
          sanitized.secondary_color = this.normalizeColor(sanitized.secondary_color);
        }
        break;

      case 'convert_to_framework':
        // Nettoyer le code HTML
        if (sanitized.html_code) {
          sanitized.html_code = this.sanitizeHtmlCode(sanitized.html_code);
        }
        // Normaliser le nom du composant
        if (sanitized.component_name) {
          sanitized.component_name = this.normalizePascalCase(sanitized.component_name);
        }
        break;
    }

    return sanitized;
  }

  /**
   * Sanitise une requête de recherche
   * @param {string} query - Requête à sanitiser
   * @returns {string} Requête sanitisée
   */
  sanitizeSearchQuery(query) {
    return (
      query
        .trim()
        .toLowerCase()
        // Supprimer les caractères spéciaux dangereux
        .replace(/[<>&"']/g, '')
        // Normaliser les espaces
        .replace(/\s+/g, ' ')
        // Limiter à des caractères alphanumériques et quelques caractères sûrs
        .replace(/[^a-zA-Z0-9\s\-_]/g, '')
    );
  }

  /**
   * Sanitise du code HTML
   * @param {string} htmlCode - Code HTML à sanitiser
   * @returns {string} Code HTML sanitisé
   */
  sanitizeHtmlCode(htmlCode) {
    return (
      htmlCode
        .trim()
        // Supprimer les scripts malveillants basiques
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        // Normaliser les espaces
        .replace(/\s+/g, ' ')
    );
  }

  /**
   * Normalise une couleur hexadécimale
   * @param {string} color - Couleur à normaliser
   * @returns {string} Couleur normalisée
   */
  normalizeColor(color) {
    // S'assurer que la couleur commence par #
    if (!color.startsWith('#')) {
      color = '#' + color;
    }
    // Convertir en majuscules
    return color.toUpperCase();
  }

  /**
   * Normalise un nom en PascalCase
   * @param {string} name - Nom à normaliser
   * @returns {string} Nom en PascalCase
   */
  normalizePascalCase(name) {
    return name
      .split(/[-_\s]+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }

  /**
   * Valide les paramètres communs à tous les outils
   * @param {Object} params - Paramètres à valider
   * @returns {Object} Résultat de validation
   */
  validateCommonParams(params) {
    const errors = [];

    // Vérifier la taille globale des paramètres
    const paramsString = JSON.stringify(params);
    if (paramsString.length > 100000) {
      // 100KB max
      errors.push('Les paramètres sont trop volumineux (max 100KB)');
    }

    // Vérifier les types de base
    if (params !== null && typeof params !== 'object') {
      errors.push('Les paramètres doivent être un objet');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Crée une réponse d'erreur standardisée
   * @param {string} message - Message d'erreur
   * @param {Array} errors - Liste des erreurs
   * @returns {Object} Réponse d'erreur MCP
   */
  createErrorResponse(message, errors = []) {
    return {
      content: [
        {
          type: 'text',
          text: `❌ **Erreur de validation**\n\n${message}\n\n**Détails :**\n${errors.map((e) => `- ${e}`).join('\n')}`,
        },
      ],
      isError: true,
    };
  }

  /**
   * Valide que les paramètres requis sont présents
   * @param {Object} params - Paramètres à vérifier
   * @param {Array} required - Liste des paramètres requis
   * @returns {Array} Liste des erreurs
   */
  validateRequiredParams(params, required) {
    const errors = [];

    required.forEach((param) => {
      if (params[param] === undefined || params[param] === null || params[param] === '') {
        errors.push(`Le paramètre '${param}' est requis`);
      }
    });

    return errors;
  }

  /**
   * Valide les limites de longueur des chaînes
   * @param {Object} params - Paramètres à vérifier
   * @param {Object} limits - Limites par paramètre { param: { min: 1, max: 100 } }
   * @returns {Array} Liste des erreurs
   */
  validateStringLimits(params, limits) {
    const errors = [];

    Object.keys(limits).forEach((param) => {
      if (params[param] && typeof params[param] === 'string') {
        const value = params[param];
        const limit = limits[param];

        if (limit.min && value.length < limit.min) {
          errors.push(`Le paramètre '${param}' doit contenir au moins ${limit.min} caractères`);
        }

        if (limit.max && value.length > limit.max) {
          errors.push(`Le paramètre '${param}' ne peut pas dépasser ${limit.max} caractères`);
        }
      }
    });

    return errors;
  }

  /**
   * Obtient la liste des outils disponibles avec leurs schémas
   * @returns {Array} Liste des outils
   */
  getAvailableTools() {
    return this.schemas.getAvailableTools().map((toolName) => ({
      name: toolName,
      schema: this.schemas.getSchema(toolName),
    }));
  }
}

module.exports = InputValidatorService;
