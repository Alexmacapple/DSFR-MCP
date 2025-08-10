/**
 * Service de parsing YAML robuste pour DSFR-MCP
 * Remplacement du parser fait-maison par js-yaml avec validation de schéma
 */

const yaml = require('js-yaml');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const { IService } = require('../core/interfaces');

class YamlParserService extends IService {
  constructor(config, logger) {
    super();
    this.config = config;
    this.logger = logger;
    this.ajv = new Ajv({
      allErrors: true,
      verbose: true,
      strict: false, // Pour supporter les schémas DSFR flexibles
    });
    addFormats(this.ajv);

    this.initialized = false;
    this.schemas = new Map();
    this.parseStats = {
      totalFiles: 0,
      successfulParses: 0,
      errors: 0,
      warnings: 0,
      averageParseTime: 0,
    };
  }

  async initialize() {
    if (this.initialized) return;

    this.logger.info('Initialisation du YamlParserService');

    // Charger les schémas de validation prédéfinis
    await this.loadDefaultSchemas();

    this.initialized = true;
    this.logger.info('YamlParserService initialisé avec succès');
  }

  isInitialized() {
    return this.initialized;
  }

  /**
   * Parse un contenu YAML avec gestion d'erreurs avancée
   */
  async parseYaml(content, options = {}) {
    const startTime = Date.now();

    try {
      const { schema = null, validateSchema = true, filename = 'unknown' } = options;

      // Configuration du parser YAML
      const yamlOptions = {
        filename,
        onWarning: (warning) => {
          this.parseStats.warnings++;
          this.logger.warn(`YAML warning in ${filename}`, { warning: warning.message });
        },
      };

      // Parser le YAML
      let parsed;
      try {
        parsed = yaml.load(content, yamlOptions);
      } catch (error) {
        this.parseStats.errors++;
        throw new YamlParseError(`Erreur de parsing YAML dans ${filename}`, {
          original: error,
          line: error.mark?.line,
          column: error.mark?.column,
          snippet: this.extractErrorSnippet(content, error.mark),
        });
      }

      // Validation de schéma si demandée
      if (validateSchema && schema) {
        const validationResult = await this.validateAgainstSchema(parsed, schema, filename);
        if (!validationResult.valid) {
          throw new YamlValidationError(
            `Validation failed for ${filename}`,
            validationResult.errors
          );
        }
      }

      // Mise à jour des statistiques
      const parseTime = Date.now() - startTime;
      this.updateStats(parseTime, true);

      return {
        data: parsed,
        metadata: {
          filename,
          parseTime,
          size: content.length,
          valid: true,
        },
      };
    } catch (error) {
      this.updateStats(Date.now() - startTime, false);
      throw error;
    }
  }

  /**
   * Parse multiple fichiers YAML en parallèle
   */
  async parseYamlFiles(files, options = {}) {
    const {
      concurrency = this.config.get('parsing.concurrency', 10),
      schema = null,
      validateSchema = true,
      failFast = false,
    } = options;

    this.logger.info(`Parsing de ${files.length} fichiers YAML avec concurrence ${concurrency}`);

    const results = [];
    const errors = [];

    // Traitement par batch pour contrôler la concurrence
    for (let i = 0; i < files.length; i += concurrency) {
      const batch = files.slice(i, i + concurrency);

      const batchPromises = batch.map(async (file) => {
        try {
          const result = await this.parseYaml(file.content, {
            ...options,
            filename: file.path,
            schema,
            validateSchema,
          });

          return {
            file: file.path,
            success: true,
            result,
          };
        } catch (error) {
          const errorResult = {
            file: file.path,
            success: false,
            error: {
              message: error.message,
              type: error.constructor.name,
              details: error.details || {},
            },
          };

          if (failFast) {
            throw error;
          }

          errors.push(errorResult);
          return errorResult;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Log de progression
      this.logger.info(
        `Batch ${Math.floor(i / concurrency) + 1}/${Math.ceil(files.length / concurrency)} terminé`,
        {
          processed: Math.min(i + concurrency, files.length),
          total: files.length,
          errors: errors.length,
        }
      );
    }

    return {
      results,
      stats: {
        total: files.length,
        successful: results.filter((r) => r.success).length,
        failed: errors.length,
        errors,
      },
    };
  }

  /**
   * Valide des données contre un schéma JSON Schema
   */
  async validateAgainstSchema(data, schemaName) {
    const schema = this.schemas.get(schemaName);

    if (!schema) {
      throw new Error(`Schéma '${schemaName}' non trouvé`);
    }

    const validate = this.ajv.compile(schema);
    const valid = validate(data);

    if (!valid) {
      const errors = validate.errors.map((error) => ({
        path: error.instancePath,
        message: error.message,
        value: error.data,
        schema: error.schemaPath,
      }));

      return { valid: false, errors };
    }

    return { valid: true, errors: [] };
  }

  /**
   * Enregistre un schéma de validation
   */
  registerSchema(name, schema) {
    try {
      // Valider le schéma lui-même
      this.ajv.compile(schema);
      this.schemas.set(name, schema);
      this.logger.debug(`Schéma '${name}' enregistré avec succès`);
    } catch (error) {
      throw new Error(`Erreur lors de l'enregistrement du schéma '${name}': ${error.message}`);
    }
  }

  /**
   * Charge les schémas de validation par défaut pour DSFR
   */
  async loadDefaultSchemas() {
    // Schéma pour les métadonnées de composant DSFR
    const componentSchema = {
      type: 'object',
      properties: {
        name: { type: 'string', minLength: 1 },
        category: { type: 'string', enum: ['layout', 'navigation', 'form', 'content', 'feedback'] },
        description: { type: 'string' },
        version: { type: 'string', pattern: '^\\d+\\.\\d+\\.\\d+$' },
        accessibility: {
          type: 'object',
          properties: {
            level: { type: 'string', enum: ['A', 'AA', 'AAA'] },
            guidelines: { type: 'array', items: { type: 'string' } },
          },
        },
        variants: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              description: { type: 'string' },
            },
            required: ['name'],
          },
        },
        dependencies: {
          type: 'array',
          items: { type: 'string' },
        },
      },
      required: ['name', 'category'],
      additionalProperties: true,
    };

    // Schéma pour la configuration DSFR
    const configSchema = {
      type: 'object',
      properties: {
        theme: {
          type: 'object',
          properties: {
            primary: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' },
            secondary: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' },
          },
        },
        breakpoints: {
          type: 'object',
          patternProperties: {
            '^(xs|sm|md|lg|xl)$': { type: 'string' },
          },
        },
      },
    };

    // Enregistrer les schémas
    this.registerSchema('dsfr-component', componentSchema);
    this.registerSchema('dsfr-config', configSchema);

    this.logger.info('Schémas par défaut chargés', {
      schemas: Array.from(this.schemas.keys()),
    });
  }

  /**
   * Extrait un snippet de code autour d'une erreur
   */
  extractErrorSnippet(content, mark) {
    if (!mark) return null;

    const lines = content.split('\n');
    const errorLine = mark.line;
    const start = Math.max(0, errorLine - 2);
    const end = Math.min(lines.length, errorLine + 3);

    return {
      start: start + 1,
      end: end + 1,
      lines: lines.slice(start, end).map((line, i) => ({
        number: start + i + 1,
        content: line,
        error: start + i === errorLine,
      })),
    };
  }

  /**
   * Met à jour les statistiques de parsing
   */
  updateStats(parseTime, success) {
    this.parseStats.totalFiles++;

    if (success) {
      this.parseStats.successfulParses++;
    } else {
      this.parseStats.errors++;
    }

    // Calcul de la moyenne mobile pour le temps de parsing
    const alpha = 0.1; // Facteur de lissage
    this.parseStats.averageParseTime =
      this.parseStats.averageParseTime === 0
        ? parseTime
        : alpha * parseTime + (1 - alpha) * this.parseStats.averageParseTime;
  }

  /**
   * Obtient les statistiques de parsing
   */
  getStats() {
    return {
      ...this.parseStats,
      successRate:
        this.parseStats.totalFiles > 0
          ? ((this.parseStats.successfulParses / this.parseStats.totalFiles) * 100).toFixed(2) + '%'
          : '0%',
      averageParseTime: Math.round(this.parseStats.averageParseTime) + 'ms',
    };
  }

  /**
   * Réinitialise les statistiques
   */
  resetStats() {
    this.parseStats = {
      totalFiles: 0,
      successfulParses: 0,
      errors: 0,
      warnings: 0,
      averageParseTime: 0,
    };
  }

  async dispose() {
    this.schemas.clear();
    this.initialized = false;
    this.logger.info('YamlParserService disposed');
  }
}

/**
 * Erreur de parsing YAML
 */
class YamlParseError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'YamlParseError';
    this.details = details;
  }
}

/**
 * Erreur de validation YAML
 */
class YamlValidationError extends Error {
  constructor(message, validationErrors = []) {
    super(message);
    this.name = 'YamlValidationError';
    this.validationErrors = validationErrors;
  }
}

module.exports = {
  YamlParserService,
  YamlParseError,
  YamlValidationError,
};
