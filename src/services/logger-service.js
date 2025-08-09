/**
 * Service de logging centralisé
 * Compatible avec le protocole MCP (pas de pollution stdout/stderr)
 */

const fs = require('fs').promises;
const path = require('path');
const { ILoggerService } = require('../core/interfaces');

class LoggerService extends ILoggerService {
  constructor(config) {
    super();
    this.config = config;
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3,
    };

    this.currentLevel = this.levels[config?.get('logging.level') || 'info'];
    this.format = config?.get('logging.format') || 'json';
    this.logToFile = config?.get('logging.file') || false;
    this.logToConsole = config?.get('logging.console') || false; // Désactivé par défaut pour MCP

    this.initialized = false;
    this.logBuffer = [];
    this.logFile = null;

    if (this.logToFile) {
      this.logFile = path.join(config?.get('paths.data') || './data', 'logs', 'dsfr-mcp.log');
    }
  }

  async initialize() {
    if (this.initialized) return;

    if (this.logToFile && this.logFile) {
      // Créer le dossier de logs
      const logDir = path.dirname(this.logFile);
      try {
        await fs.mkdir(logDir, { recursive: true });
      } catch (error) {
        // Ignore si le dossier existe déjà
      }
    }

    this.initialized = true;

    // Écrire les logs en buffer
    if (this.logBuffer.length > 0) {
      for (const entry of this.logBuffer) {
        await this.writeLog(entry);
      }
      this.logBuffer = [];
    }

    this.info('LoggerService initialisé', {
      level: Object.keys(this.levels)[this.currentLevel],
      format: this.format,
      file: !!this.logToFile,
      console: this.logToConsole,
    });
  }

  isInitialized() {
    return this.initialized;
  }

  info(message, meta = {}) {
    this.log('info', message, meta);
  }

  error(message, error = null, meta = {}) {
    const errorMeta = error
      ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
          ...meta,
        }
      : meta;

    this.log('error', message, errorMeta);
  }

  warn(message, meta = {}) {
    this.log('warn', message, meta);
  }

  debug(message, meta = {}) {
    this.log('debug', message, meta);
  }

  /**
   * Méthodes privées
   */

  log(level, message, meta = {}) {
    if (this.levels[level] > this.currentLevel) {
      return; // Level trop bas, ignorer
    }

    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      meta,
      pid: process.pid,
    };

    if (!this.initialized) {
      // Stocker en buffer si pas encore initialisé
      this.logBuffer.push(entry);
      return;
    }

    this.writeLog(entry);
  }

  async writeLog(entry) {
    const formatted = this.formatLog(entry);

    // Écrire en fichier si activé
    if (this.logToFile && this.logFile) {
      try {
        await fs.appendFile(this.logFile, formatted + '\n', 'utf8');
      } catch (error) {
        // Ne pas polluer stderr/stdout pour MCP
        // En cas d'erreur, on peut essayer de créer le fichier
        try {
          await fs.writeFile(this.logFile, formatted + '\n', 'utf8');
        } catch {
          // Silencieux pour éviter les boucles d'erreur
        }
      }
    }

    // Écrire en console si activé (désactivé pour MCP par défaut)
    if (this.logToConsole) {
      // ATTENTION: Ceci peut corrompre le protocole MCP
      // Utiliser seulement en mode debug local
      console.error(formatted);
    }
  }

  formatLog(entry) {
    if (this.format === 'json') {
      return JSON.stringify(entry);
    }

    // Format texte simple
    const metaStr = Object.keys(entry.meta).length > 0 ? ' ' + JSON.stringify(entry.meta) : '';

    return `${entry.timestamp} [${entry.level.toUpperCase()}] ${entry.message}${metaStr}`;
  }

  /**
   * Méthodes utilitaires
   */

  setLevel(level) {
    if (this.levels[level] !== undefined) {
      this.currentLevel = this.levels[level];
      this.info(`Niveau de log changé: ${level}`);
    }
  }

  async getRecentLogs(count = 100) {
    if (!this.logToFile || !this.logFile) {
      return [];
    }

    try {
      const content = await fs.readFile(this.logFile, 'utf8');
      const lines = content.trim().split('\n');

      return lines.slice(-count).map((line) => {
        try {
          return JSON.parse(line);
        } catch {
          return { message: line, level: 'info', timestamp: new Date().toISOString() };
        }
      });
    } catch (error) {
      return [];
    }
  }

  async clearLogs() {
    if (this.logToFile && this.logFile) {
      try {
        await fs.writeFile(this.logFile, '', 'utf8');
        this.info('Logs effacés');
      } catch (error) {
        this.error("Erreur lors de l'effacement des logs", error);
      }
    }
  }

  async rotateLogs() {
    if (!this.logToFile || !this.logFile) {
      return;
    }

    try {
      const stats = await fs.stat(this.logFile);
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (stats.size > maxSize) {
        const rotatedFile = this.logFile + '.' + Date.now();
        await fs.rename(this.logFile, rotatedFile);

        this.info('Logs pivotés', {
          oldFile: rotatedFile,
          size: stats.size,
        });
      }
    } catch (error) {
      // Ignorer les erreurs de rotation
    }
  }

  async dispose() {
    // Écrire les logs en attente
    if (this.logBuffer.length > 0) {
      for (const entry of this.logBuffer) {
        await this.writeLog(entry);
      }
    }

    this.initialized = false;
    this.info('LoggerService fermé');
  }
}

module.exports = LoggerService;
