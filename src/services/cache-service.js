/**
 * Service de cache intelligent avec invalidation et compression
 * Optimisé pour les performances et la gestion mémoire
 */

const fs = require('fs').promises;
const path = require('path');
const { ICacheService } = require('../core/interfaces');
const { DisposableBase: _DisposableBase } = require('../core/disposable');
const { LRUCache } = require('../core/lru-cache');

class CacheService extends ICacheService {
  constructor(config, logger) {
    super();
    this.config = config;
    this.logger = logger;

    // Configuration
    this.maxMemorySize = config.cache?.maxMemorySize || 50 * 1024 * 1024; // 50MB
    this.defaultTTL = config.cache?.defaultTTL || 30 * 60 * 1000; // 30 minutes
    this.cleanupInterval = config.cache?.cleanupInterval || 5 * 60 * 1000; // 5 minutes

    // Cache en mémoire optimisé avec LRU
    this.memoryCache = new LRUCache({
      maxSize: 1000,
      maxMemory: this.maxMemorySize,
      defaultTTL: this.defaultTTL,
      autoCompress: config.cache?.compression !== false,
      enableStats: true,
    });
    this.persistentCachePath =
      config.cache?.persistentPath || path.join(config.paths.data, 'cache');

    // État interne
    this.initialized = false;
    this.cleanupTimer = null;
    this.compressionEnabled = config.cache?.compression !== false;

    // Initialiser les statistiques du cache
    this.cacheStats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0,
      memoryUsage: 0,
    };
  }

  async initialize() {
    if (this.initialized) return;

    this.logger.info('Initialisation du CacheService');

    try {
      // Créer le dossier de cache persistant si nécessaire
      await this.ensureCacheDirectory();

      // Charger le cache persistant
      await this.loadPersistentCache();

      // Démarrer le nettoyage périodique
      this.startCleanupTimer();

      this.initialized = true;
      this.logger.info('CacheService initialisé', {
        memoryCache: this.memoryCache.size,
        maxMemorySize: this.formatBytes(this.maxMemorySize),
      });
    } catch (error) {
      this.logger.error("Erreur lors de l'initialisation du CacheService", error);
      throw error;
    }
  }

  isInitialized() {
    return this.initialized;
  }

  async get(key) {
    const entry = this.memoryCache.get(key);

    if (!entry) {
      this.cacheStats.misses++;
      return null;
    }

    // Vérifier l'expiration
    if (this.isExpired(entry)) {
      this.memoryCache.delete(key);
      this.cacheStats.evictions++;
      this.updateMemoryUsage();
      return null;
    }

    // Mettre à jour l'accès
    entry.lastAccessed = Date.now();
    entry.accessCount++;

    this.cacheStats.hits++;

    // Décompresser si nécessaire
    const rawValue =
      this.compressionEnabled && entry.compressed ? this.decompress(entry.value) : entry.value;

    // Désérialiser JSON
    try {
      return JSON.parse(rawValue);
    } catch (error) {
      this.logger.warn('Erreur lors de la désérialisation du cache', { key, error: error.message });
      return rawValue; // Retourner la valeur brute en cas d'erreur
    }
  }

  async set(key, value, ttl = null) {
    const now = Date.now();
    const expiresAt = ttl ? now + ttl : now + this.defaultTTL;

    // Calculer la taille approximative
    const serialized = JSON.stringify(value);
    let finalValue = serialized;
    let compressed = false;

    // Compression si activée et si la valeur est assez grande
    if (this.compressionEnabled && serialized.length > 1024) {
      try {
        finalValue = this.compress(serialized);
        compressed = true;
      } catch (error) {
        this.logger.warn('Erreur lors de la compression', { key, error: error.message });
      }
    }

    const entry = {
      value: finalValue,
      compressed,
      expiresAt,
      createdAt: now,
      lastAccessed: now,
      accessCount: 0,
      size: finalValue.length,
    };

    // Vérifier l'espace disponible et faire de la place si nécessaire
    await this.ensureMemorySpace(entry.size);

    this.memoryCache.set(key, entry);
    this.cacheStats.sets++;
    this.updateMemoryUsage();

    // Sauvegarder en cache persistant pour les clés importantes
    if (this.shouldPersist(key)) {
      await this.saveToPersistentCache(key, entry);
    }
  }

  async delete(key) {
    const deleted = this.memoryCache.delete(key);

    if (deleted) {
      this.cacheStats.deletes++;
      this.updateMemoryUsage();
    }

    // Supprimer du cache persistant aussi
    await this.deleteFromPersistentCache(key);

    return deleted;
  }

  async clear(pattern = null) {
    if (!pattern) {
      // Vider tout le cache
      this.memoryCache.clear();
      this.cacheStats.memoryUsage = 0;
      await this.clearPersistentCache();
    } else {
      // Supprimer les clés correspondant au pattern
      const keysToDelete = [];
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));

      if (this.memoryCache.cache && this.memoryCache.cache instanceof Map) {
        for (const key of this.memoryCache.cache.keys()) {
          if (regex.test(key)) {
            keysToDelete.push(key);
          }
        }
      }

      for (const key of keysToDelete) {
        await this.delete(key);
      }
    }
  }

  async getStats() {
    return {
      ...this.cacheStats,
      entries: this.memoryCache.size,
      memoryUsageFormatted: this.formatBytes(this.cacheStats.memoryUsage),
      hitRate: this.cacheStats.hits / (this.cacheStats.hits + this.cacheStats.misses) || 0,
      averageEntrySize:
        this.memoryCache.size > 0 ? this.cacheStats.memoryUsage / this.memoryCache.size : 0,
    };
  }

  /**
   * Méthodes privées
   */

  isExpired(entry) {
    return Date.now() > entry.expiresAt;
  }

  async ensureMemorySpace(requiredSize) {
    // Si on a assez d'espace, pas besoin de faire quoi que ce soit
    if (this.cacheStats.memoryUsage + requiredSize <= this.maxMemorySize) {
      return;
    }

    this.logger.info("Nettoyage du cache pour libérer de l'espace", {
      current: this.formatBytes(this.cacheStats.memoryUsage),
      required: this.formatBytes(requiredSize),
      max: this.formatBytes(this.maxMemorySize),
    });

    // Stratégie LRU : supprimer les entrées les moins récemment utilisées
    const entries = [];
    if (this.memoryCache.cache && this.memoryCache.cache instanceof Map) {
      for (const [key, value] of this.memoryCache.cache) {
        entries.push({ key, ...value });
      }
    }
    entries.sort((a, b) => a.lastAccessed - b.lastAccessed);

    let freedSpace = 0;
    const keysToDelete = [];

    for (const entry of entries) {
      keysToDelete.push(entry.key);
      freedSpace += entry.size;

      if (this.cacheStats.memoryUsage - freedSpace + requiredSize <= this.maxMemorySize) {
        break;
      }
    }

    // Supprimer les entrées sélectionnées
    for (const key of keysToDelete) {
      this.memoryCache.delete(key);
      this.cacheStats.evictions++;
    }

    this.updateMemoryUsage();

    this.logger.info(
      `${keysToDelete.length} entrées supprimées, ${this.formatBytes(freedSpace)} libérés`
    );
  }

  updateMemoryUsage() {
    let totalSize = 0;
    // Le LRUCache custom utilise un Map interne .cache
    if (this.memoryCache.cache && this.memoryCache.cache.values) {
      for (const entry of this.memoryCache.cache.values()) {
        totalSize += entry.size || 0;
      }
    } else {
      // Fallback pour d'autres implémentations
      console.warn('updateMemoryUsage: API LRUCache non reconnue');
    }
    this.cacheStats.memoryUsage = totalSize;
  }

  compress(data) {
    // Simple compression avec JSON + base64
    // En production, on pourrait utiliser une vraie lib de compression comme zlib
    return Buffer.from(data).toString('base64');
  }

  decompress(compressedData) {
    return Buffer.from(compressedData, 'base64').toString('utf8');
  }

  shouldPersist(key) {
    // Persister les index et données importantes
    return key.includes('search_index') || key.includes('metadata') || key.startsWith('config:');
  }

  async ensureCacheDirectory() {
    try {
      await fs.mkdir(this.persistentCachePath, { recursive: true });
    } catch (error) {
      if (error.code !== 'EEXIST') {
        throw error;
      }
    }
  }

  async loadPersistentCache() {
    try {
      const files = await fs.readdir(this.persistentCachePath);
      const cacheFiles = files.filter((f) => f.endsWith('.cache.json'));

      let loadedCount = 0;
      for (const file of cacheFiles) {
        try {
          const filePath = path.join(this.persistentCachePath, file);
          const data = await fs.readFile(filePath, 'utf8');
          const { key, entry } = JSON.parse(data);

          // Vérifier si l'entrée n'est pas expirée
          if (!this.isExpired(entry)) {
            this.memoryCache.set(key, entry);
            loadedCount++;
          } else {
            // Supprimer le fichier expiré
            await fs.unlink(filePath);
          }
        } catch (error) {
          this.logger.warn(`Erreur lors du chargement de ${file}`, { error: error.message });
        }
      }

      if (loadedCount > 0) {
        this.updateMemoryUsage();
        this.logger.info(`${loadedCount} entrées chargées depuis le cache persistant`);
      }
    } catch (error) {
      if (error.code !== 'ENOENT') {
        this.logger.warn('Erreur lors du chargement du cache persistant', { error: error.message });
      }
    }
  }

  async saveToPersistentCache(key, entry) {
    try {
      const filename = this.sanitizeKey(key) + '.cache.json';
      const filePath = path.join(this.persistentCachePath, filename);
      const data = JSON.stringify({ key, entry });

      await fs.writeFile(filePath, data, 'utf8');
    } catch (error) {
      this.logger.warn('Erreur lors de la sauvegarde en cache persistant', {
        key,
        error: error.message,
      });
    }
  }

  async deleteFromPersistentCache(key) {
    try {
      const filename = this.sanitizeKey(key) + '.cache.json';
      const filePath = path.join(this.persistentCachePath, filename);
      await fs.unlink(filePath);
    } catch (error) {
      // Ignore si le fichier n'existe pas
      if (error.code !== 'ENOENT') {
        this.logger.warn('Erreur lors de la suppression du cache persistant', {
          key,
          error: error.message,
        });
      }
    }
  }

  async clearPersistentCache() {
    try {
      const files = await fs.readdir(this.persistentCachePath);
      const cacheFiles = files.filter((f) => f.endsWith('.cache.json'));

      await Promise.all(
        cacheFiles.map((file) => fs.unlink(path.join(this.persistentCachePath, file)))
      );

      this.logger.info(`${cacheFiles.length} fichiers de cache persistant supprimés`);
    } catch (error) {
      this.logger.warn('Erreur lors du nettoyage du cache persistant', { error: error.message });
    }
  }

  sanitizeKey(key) {
    return key.replace(/[^a-zA-Z0-9_-]/g, '_');
  }

  startCleanupTimer() {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.cleanupInterval);
  }

  async cleanup() {
    let expired = 0;

    if (this.memoryCache.cache && this.memoryCache.cache instanceof Map) {
      for (const [key, entry] of this.memoryCache.cache) {
        if (this.isExpired(entry)) {
          this.memoryCache.delete(key);
          expired++;
        }
      }
    }

    if (expired > 0) {
      this.cacheStats.evictions += expired;
      this.updateMemoryUsage();

      this.logger.debug(`Nettoyage automatique: ${expired} entrées expirées supprimées`);
    }
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  async dispose() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }

    // Dispose du cache LRU (libère automatiquement la mémoire)
    if (this.memoryCache && typeof this.memoryCache.dispose === 'function') {
      await this.memoryCache.dispose();
    } else if (this.memoryCache) {
      this.memoryCache.clear();
    }

    this.initialized = false;
    this.logger.info('CacheService fermé');
  }
}

module.exports = CacheService;
