/**
 * Interfaces et contrats pour les services DSFR-MCP
 * Définit les contrats que doivent respecter tous les services
 */

/**
 * Interface de base pour tous les services
 */
class IService {
  /**
   * Initialise le service de manière asynchrone
   * @returns {Promise<void>}
   */
  async initialize() {
    throw new Error('initialize() doit être implémentée');
  }

  /**
   * Indique si le service est initialisé
   * @returns {boolean}
   */
  isInitialized() {
    throw new Error('isInitialized() doit être implémentée');
  }

  /**
   * Libère les ressources du service
   * @returns {Promise<void>}
   */
  async dispose() {
    // Implémentation optionnelle
  }
}

/**
 * Interface pour les services de données (Repository pattern)
 */
class IDataRepository extends IService {
  /**
   * Trouve un élément par ID
   * @param {string} id - Identifiant unique
   * @returns {Promise<Object|null>}
   */
  async findById(_id) {
    throw new Error('findById() doit être implémentée');
  }

  /**
   * Trouve tous les éléments correspondant aux critères
   * @param {Object} criteria - Critères de recherche
   * @param {Object} options - Options (pagination, tri, etc.)
   * @returns {Promise<Array>}
   */
  async findAll(_criteria = {}, _options = {}) {
    throw new Error('findAll() doit être implémentée');
  }

  /**
   * Recherche avec texte libre
   * @param {string} query - Terme de recherche
   * @param {Object} options - Options de recherche
   * @returns {Promise<Array>}
   */
  async search(_query, _options = {}) {
    throw new Error('search() doit être implémentée');
  }

  /**
   * Compte le nombre d'éléments
   * @param {Object} criteria - Critères de comptage
   * @returns {Promise<number>}
   */
  async count(_criteria = {}) {
    throw new Error('count() doit être implémentée');
  }
}

/**
 * Interface pour les services de cache
 */
class ICacheService extends IService {
  /**
   * Obtient une valeur du cache
   * @param {string} key - Clé de cache
   * @returns {Promise<any|null>}
   */
  async get(_key) {
    throw new Error('get() doit être implémentée');
  }

  /**
   * Stocke une valeur dans le cache
   * @param {string} key - Clé de cache
   * @param {any} value - Valeur à stocker
   * @param {number} ttl - Durée de vie en millisecondes
   * @returns {Promise<void>}
   */
  async set(_key, _value, _ttl = null) {
    throw new Error('set() doit être implémentée');
  }

  /**
   * Supprime une entrée du cache
   * @param {string} key - Clé à supprimer
   * @returns {Promise<boolean>}
   */
  async delete(_key) {
    throw new Error('delete() doit être implémentée');
  }

  /**
   * Vide le cache complet ou par pattern
   * @param {string} pattern - Pattern optionnel
   * @returns {Promise<void>}
   */
  async clear(_pattern = null) {
    throw new Error('clear() doit être implémentée');
  }

  /**
   * Obtient les statistiques du cache
   * @returns {Promise<Object>}
   */
  async getStats() {
    throw new Error('getStats() doit être implémentée');
  }
}

/**
 * Interface pour les services de validation
 */
class IValidationService extends IService {
  /**
   * Valide une entrée selon des règles définies
   * @param {any} data - Données à valider
   * @param {Object} rules - Règles de validation
   * @returns {Promise<Object>} Résultat de validation
   */
  async validate(_data, _rules = {}) {
    throw new Error('validate() doit être implémentée');
  }

  /**
   * Valide un schéma
   * @param {any} data - Données à valider
   * @param {Object} schema - Schéma de validation
   * @returns {Promise<Object>} Résultat de validation
   */
  async validateSchema(_data, _schema) {
    throw new Error('validateSchema() doit être implémentée');
  }
}

/**
 * Interface pour les services de génération
 */
class IGeneratorService extends IService {
  /**
   * Génère du contenu selon un template
   * @param {string} template - Nom du template
   * @param {Object} data - Données pour la génération
   * @param {Object} options - Options de génération
   * @returns {Promise<Object>} Contenu généré
   */
  async generate(_template, _data, _options = {}) {
    throw new Error('generate() doit être implémentée');
  }

  /**
   * Liste les templates disponibles
   * @returns {Promise<Array>}
   */
  async getAvailableTemplates() {
    throw new Error('getAvailableTemplates() doit être implémentée');
  }
}

/**
 * Interface pour la configuration
 */
class IConfigService extends IService {
  /**
   * Obtient une valeur de configuration
   * @param {string} key - Clé de configuration
   * @param {any} defaultValue - Valeur par défaut
   * @returns {any}
   */
  get(_key, _defaultValue = null) {
    throw new Error('get() doit être implémentée');
  }

  /**
   * Définit une valeur de configuration
   * @param {string} key - Clé de configuration
   * @param {any} value - Valeur à définir
   * @returns {void}
   */
  set(_key, _value) {
    throw new Error('set() doit être implémentée');
  }

  /**
   * Vérifie si une clé existe
   * @param {string} key - Clé à vérifier
   * @returns {boolean}
   */
  has(_key) {
    throw new Error('has() doit être implémentée');
  }
}

/**
 * Interface pour les services de logging
 */
class ILoggerService extends IService {
  /**
   * Log d'information
   * @param {string} message - Message à logger
   * @param {Object} meta - Métadonnées optionnelles
   */
  info(_message, _meta = {}) {
    throw new Error('info() doit être implémentée');
  }

  /**
   * Log d'erreur
   * @param {string} message - Message d'erreur
   * @param {Error} error - Erreur optionnelle
   * @param {Object} meta - Métadonnées optionnelles
   */
  error(_message, _error = null, _meta = {}) {
    throw new Error('error() doit être implémentée');
  }

  /**
   * Log de warning
   * @param {string} message - Message de warning
   * @param {Object} meta - Métadonnées optionnelles
   */
  warn(_message, _meta = {}) {
    throw new Error('warn() doit être implémentée');
  }

  /**
   * Log de debug
   * @param {string} message - Message de debug
   * @param {Object} meta - Métadonnées optionnelles
   */
  debug(_message, _meta = {}) {
    throw new Error('debug() doit être implémentée');
  }
}

module.exports = {
  IService,
  IDataRepository,
  ICacheService,
  IValidationService,
  IGeneratorService,
  IConfigService,
  ILoggerService,
};
