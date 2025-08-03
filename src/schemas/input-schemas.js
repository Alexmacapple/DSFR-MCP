// Schémas de validation JSON pour les entrées MCP
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

class InputSchemas {
  constructor() {
    this.ajv = new Ajv({ allErrors: true });
    addFormats(this.ajv);
    this.initializeSchemas();
  }

  initializeSchemas() {
    // Schéma pour search_dsfr_components
    this.schemas = {
      search_dsfr_components: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            minLength: 1,
            maxLength: 100,
            description: 'Terme de recherche'
          },
          category: {
            type: 'string',
            enum: ['core', 'component', 'layout', 'utility', 'analytics', 'scheme'],
            description: 'Catégorie à filtrer'
          },
          limit: {
            type: 'integer',
            minimum: 1,
            maximum: 50,
            default: 10,
            description: 'Nombre maximum de résultats'
          }
        },
        required: ['query'],
        additionalProperties: false
      },

      get_component_details: {
        type: 'object',
        properties: {
          component_name: {
            type: 'string',
            minLength: 1,
            maxLength: 50,
            pattern: '^[a-zA-Z0-9_-]+$',
            description: 'Nom du composant (lettres, chiffres, tirets et underscores uniquement)'
          },
          include_examples: {
            type: 'boolean',
            default: true,
            description: 'Inclure les exemples de code'
          },
          include_accessibility: {
            type: 'boolean',
            default: true,
            description: 'Inclure les informations d\'accessibilité'
          }
        },
        required: ['component_name'],
        additionalProperties: false
      },

      list_dsfr_categories: {
        type: 'object',
        properties: {},
        additionalProperties: false
      },

      validate_dsfr_html: {
        type: 'object',
        properties: {
          html_code: {
            type: 'string',
            minLength: 1,
            maxLength: 50000,
            description: 'Code HTML à valider'
          },
          check_accessibility: {
            type: 'boolean',
            default: true,
            description: 'Effectuer les vérifications d\'accessibilité'
          },
          check_semantic: {
            type: 'boolean',
            default: true,
            description: 'Effectuer les vérifications sémantiques'
          },
          strict_mode: {
            type: 'boolean',
            default: false,
            description: 'Mode strict (erreurs pour classes non-DSFR)'
          }
        },
        required: ['html_code'],
        additionalProperties: false
      },

      check_accessibility: {
        type: 'object',
        properties: {
          html_code: {
            type: 'string',
            minLength: 1,
            maxLength: 50000,
            description: 'Code HTML à vérifier'
          },
          rgaa_level: {
            type: 'string',
            enum: ['A', 'AA', 'AAA'],
            default: 'AA',
            description: 'Niveau de conformité RGAA'
          },
          include_suggestions: {
            type: 'boolean',
            default: true,
            description: 'Inclure des suggestions d\'amélioration'
          }
        },
        required: ['html_code'],
        additionalProperties: false
      },

      generate_dsfr_component: {
        type: 'object',
        properties: {
          component_type: {
            type: 'string',
            minLength: 1,
            maxLength: 50,
            pattern: '^[a-zA-Z0-9_-]+$',
            description: 'Type de composant à générer'
          },
          framework: {
            type: 'string',
            enum: ['vanilla', 'react', 'vue', 'angular'],
            default: 'vanilla',
            description: 'Framework cible pour la génération'
          },
          options: {
            type: 'object',
            properties: {
              variant: {
                type: 'string',
                description: 'Variante du composant'
              },
              size: {
                type: 'string',
                enum: ['sm', 'md', 'lg'],
                description: 'Taille du composant'
              },
              icon: {
                type: 'string',
                description: 'Icône à inclure'
              },
              disabled: {
                type: 'boolean',
                description: 'Composant désactivé'
              }
            },
            additionalProperties: true,
            description: 'Options spécifiques au composant'
          }
        },
        required: ['component_type'],
        additionalProperties: false
      },

      generate_dsfr_template: {
        type: 'object',
        properties: {
          template_name: {
            type: 'string',
            enum: [
              'page-connexion',
              'page-inscription', 
              'page-erreur-404',
              'page-erreur-500',
              'formulaire-contact',
              'tableau-donnees',
              'page-recherche',
              'dashboard'
            ],
            description: 'Nom du template à générer'
          },
          framework: {
            type: 'string',
            enum: ['vanilla', 'react', 'vue', 'angular'],
            default: 'vanilla',
            description: 'Framework cible'
          },
          customizations: {
            type: 'object',
            properties: {
              title: {
                type: 'string',
                maxLength: 100,
                description: 'Titre de la page'
              },
              logo: {
                type: 'boolean',
                description: 'Inclure le logo'
              },
              breadcrumb: {
                type: 'boolean',
                description: 'Inclure le fil d\'ariane'
              }
            },
            additionalProperties: true,
            description: 'Personnalisations du template'
          }
        },
        required: ['template_name'],
        additionalProperties: false
      },

      create_dsfr_theme: {
        type: 'object',
        properties: {
          theme_name: {
            type: 'string',
            minLength: 1,
            maxLength: 50,
            pattern: '^[a-zA-Z0-9_-]+$',
            description: 'Nom du thème'
          },
          primary_color: {
            type: 'string',
            pattern: '^#[0-9A-Fa-f]{6}$',
            description: 'Couleur principale (format hexadécimal)'
          },
          secondary_color: {
            type: 'string',
            pattern: '^#[0-9A-Fa-f]{6}$',
            description: 'Couleur secondaire (format hexadécimal)'
          },
          custom_variables: {
            type: 'object',
            patternProperties: {
              '^--[a-zA-Z0-9-]+$': {
                type: 'string',
                description: 'Variable CSS personnalisée'
              }
            },
            additionalProperties: false,
            description: 'Variables CSS personnalisées'
          }
        },
        required: ['theme_name'],
        additionalProperties: false
      },

      search_patterns: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            minLength: 1,
            maxLength: 100,
            description: 'Terme de recherche'
          },
          pattern_type: {
            type: 'string',
            enum: ['page', 'form', 'navigation', 'content'],
            description: 'Type de pattern'
          }
        },
        required: ['query'],
        additionalProperties: false
      },

      convert_to_framework: {
        type: 'object',
        properties: {
          html_code: {
            type: 'string',
            minLength: 1,
            maxLength: 50000,
            description: 'Code HTML DSFR à convertir'
          },
          target_framework: {
            type: 'string',
            enum: ['react', 'vue', 'angular'],
            description: 'Framework cible'
          },
          component_name: {
            type: 'string',
            minLength: 1,
            maxLength: 50,
            pattern: '^[A-Z][a-zA-Z0-9]*$',
            description: 'Nom du composant à créer (PascalCase)'
          }
        },
        required: ['html_code', 'target_framework'],
        additionalProperties: false
      },

      get_dsfr_icons: {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            enum: [
              'business', 'buildings', 'communication', 'design', 
              'device', 'document', 'editor', 'finance', 'health',
              'logo', 'map', 'media', 'system', 'user', 'weather'
            ],
            description: 'Catégorie d\'icônes'
          },
          search: {
            type: 'string',
            minLength: 1,
            maxLength: 50,
            description: 'Recherche par nom d\'icône'
          }
        },
        additionalProperties: false
      },

      get_dsfr_colors: {
        type: 'object',
        properties: {
          include_utilities: {
            type: 'boolean',
            default: true,
            description: 'Inclure les classes utilitaires'
          },
          format: {
            type: 'string',
            enum: ['hex', 'rgb', 'hsl'],
            default: 'hex',
            description: 'Format de couleur'
          }
        },
        additionalProperties: false
      }
    };

    // Compiler tous les schémas
    Object.keys(this.schemas).forEach(key => {
      this.ajv.addSchema(this.schemas[key], key);
    });
  }

  /**
   * Valide les paramètres d'entrée pour un outil donné
   * @param {string} toolName - Nom de l'outil
   * @param {Object} params - Paramètres à valider
   * @returns {Object} Résultat de validation { valid: boolean, errors: array, sanitized: object }
   */
  validate(toolName, params) {
    const schema = this.schemas[toolName];
    
    if (!schema) {
      return {
        valid: false,
        errors: [`Schéma non trouvé pour l'outil: ${toolName}`],
        sanitized: null
      };
    }

    // Validation avec AJV
    const validate = this.ajv.getSchema(toolName);
    const valid = validate(params);

    if (valid) {
      return {
        valid: true,
        errors: [],
        sanitized: this.sanitizeParams(params, schema)
      };
    } else {
      return {
        valid: false,
        errors: validate.errors.map(error => 
          `${error.instancePath || 'root'}${error.instancePath ? '.' : ''}${error.keyword}: ${error.message}`
        ),
        sanitized: null
      };
    }
  }

  /**
   * Sanitise les paramètres en appliquant les valeurs par défaut
   * @param {Object} params - Paramètres originaux
   * @param {Object} schema - Schéma de validation
   * @returns {Object} Paramètres sanitisés
   */
  sanitizeParams(params, schema) {
    const sanitized = { ...params };

    // Appliquer les valeurs par défaut
    if (schema.properties) {
      Object.keys(schema.properties).forEach(key => {
        if (sanitized[key] === undefined && schema.properties[key].default !== undefined) {
          sanitized[key] = schema.properties[key].default;
        }
      });
    }

    // Nettoyer les chaînes de caractères
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'string') {
        sanitized[key] = sanitized[key].trim();
      }
    });

    return sanitized;
  }

  /**
   * Retourne le schéma d'un outil pour documentation
   * @param {string} toolName - Nom de l'outil
   * @returns {Object|null} Schéma ou null si non trouvé
   */
  getSchema(toolName) {
    return this.schemas[toolName] || null;
  }

  /**
   * Retourne la liste de tous les outils disponibles
   * @returns {Array} Liste des noms d'outils
   */
  getAvailableTools() {
    return Object.keys(this.schemas);
  }
}

module.exports = InputSchemas;