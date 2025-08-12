/**
 * @fileoverview Cache LRU avec TTL et compression pour optimisation mémoire
 * @module core/lru-cache
 */

const { DisposableBase } = require('./disposable');

/**
 * Entry de cache avec métadonnées
 */
class CacheEntry {
  constructor(value, ttl = 0) {
    this.value = value;
    this.accessTime = Date.now();
    this.createTime = this.accessTime;
    this.ttl = ttl; // 0 = pas d'expiration
    this.accessCount = 1;
    this.size = this._calculateSize(value);
  }

  /**
   * Calcule la taille approximative en bytes
   * @param {*} value - Valeur à mesurer
   * @returns {number} Taille en bytes
   */
  _calculateSize(value) {
    if (value === null || value === undefined) return 0;

    try {
      const str = typeof value === 'string' ? value : JSON.stringify(value);
      return Buffer.byteLength(str, 'utf8');
    } catch {
      return 0;
    }
  }

  /**
   * Vérifie si l'entrée a expiré
   * @returns {boolean}
   */
  isExpired() {
    if (this.ttl === 0) return false;
    return Date.now() > this.createTime + this.ttl;
  }

  /**
   * Met à jour le temps d'accès
   */
  touch() {
    this.accessTime = Date.now();
    this.accessCount++;
  }

  /**
   * Compresse la valeur si elle est trop grande
   */
  compress() {
    if (this.size > 1024 && typeof this.value === 'string') {
      // Simple compression pour les strings longues
      try {
        const zlib = require('zlib');
        const compressed = zlib.deflateSync(this.value);
        if (compressed.length < this.size * 0.8) {
          this.value = {
            __compressed: true,
            data: compressed.toString('base64'),
          };
          this.size = compressed.length;
        }
      } catch (error) {
        // Compression failed, keep original
      }
    }
  }

  /**
   * Décompresse la valeur si nécessaire
   * @returns {*} Valeur décompressée
   */
  decompress() {
    if (this.value && this.value.__compressed) {
      try {
        const zlib = require('zlib');
        const buffer = Buffer.from(this.value.data, 'base64');
        return zlib.inflateSync(buffer).toString();
      } catch (error) {
        return null;
      }
    }
    return this.value;
  }
}

/**
 * Cache LRU optimisé avec TTL et compression
 */
class LRUCache extends DisposableBase {
  constructor(options = {}) {
    super();

    this.maxSize = options.maxSize || 100;
    this.defaultTTL = options.defaultTTL || 0; // 0 = pas d'expiration
    this.maxMemory = options.maxMemory || 50 * 1024 * 1024; // 50MB max
    this.autoCompress = options.autoCompress || true;
    this.enableStats = options.enableStats !== false;

    this.cache = new Map();
    this.stats = this.enableStats ? this._initStats() : null;

    // Cleanup automatique
    if (this.defaultTTL > 0) {
      this.cleanupInterval = this.setInterval(
        () => {
          this.cleanup();
        },
        Math.min(this.defaultTTL / 10, 60000)
      ); // Max 1 minute
    }
  }

  /**
   * Initialise les statistiques
   * @returns {Object} Objet stats
   */
  _initStats() {
    return {
      hits: 0,
      misses: 0,
      evictions: 0,
      expirations: 0,
      memoryUsage: 0,
      compressions: 0,
    };
  }

  /**
   * Calcule l'usage mémoire total
   * @returns {number} Bytes utilisés
   */
  _calculateMemoryUsage() {
    let total = 0;
    for (const entry of this.cache.values()) {
      total += entry.size;
    }
    return total;
  }

  /**
   * Vérifie si le cache dépasse les limites mémoire
   * @returns {boolean}
   */
  _isOverMemoryLimit() {
    const usage = this._calculateMemoryUsage();
    if (this.stats) {
      this.stats.memoryUsage = usage;
    }
    return usage > this.maxMemory;
  }

  /**
   * Éviction LRU basée sur le temps d'accès
   */
  _evictLRU() {
    let oldestKey = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache) {
      if (entry.accessTime < oldestTime) {
        oldestTime = entry.accessTime;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      if (this.stats) {
        this.stats.evictions++;
      }
    }
  }

  /**
   * Éviction intelligente basée sur usage/taille
   */
  _evictIntelligent() {
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      entry,
      score: this._calculateEvictionScore(entry),
    }));

    // Trie par score (plus bas = éviction prioritaire)
    entries.sort((a, b) => a.score - b.score);

    // Éviction des 25% les moins utilisées
    const toEvict = Math.max(1, Math.ceil(entries.length * 0.25));
    for (let i = 0; i < toEvict; i++) {
      this.cache.delete(entries[i].key);
      if (this.stats) {
        this.stats.evictions++;
      }
    }
  }

  /**
   * Calcule le score d'éviction (plus bas = éviction prioritaire)
   * @param {CacheEntry} entry - Entrée de cache
   * @returns {number} Score d'éviction
   */
  _calculateEvictionScore(entry) {
    const _age = Date.now() - entry.createTime;
    const timeSinceAccess = Date.now() - entry.accessTime;
    const sizeWeight = entry.size / 1024; // KB

    // Score basé sur fréquence, récence et taille
    return entry.accessCount * 100 - timeSinceAccess / 1000 - sizeWeight;
  }

  /**
   * Récupère une valeur du cache
   * @param {string} key - Clé
   * @returns {*} Valeur ou undefined
   */
  get(key) {
    this.assertNotDisposed();

    const entry = this.cache.get(key);
    if (!entry) {
      if (this.stats) this.stats.misses++;
      return undefined;
    }

    if (entry.isExpired()) {
      this.cache.delete(key);
      if (this.stats) {
        this.stats.misses++;
        this.stats.expirations++;
      }
      return undefined;
    }

    entry.touch();
    if (this.stats) this.stats.hits++;

    return entry.decompress();
  }

  /**
   * Stocke une valeur dans le cache
   * @param {string} key - Clé
   * @param {*} value - Valeur
   * @param {number} [ttl] - TTL en ms (optionnel)
   */
  set(key, value, ttl) {
    this.assertNotDisposed();

    const effectiveTTL = ttl || this.defaultTTL;
    const entry = new CacheEntry(value, effectiveTTL);

    // Compression automatique si activée
    if (this.autoCompress && entry.size > 1024) {
      entry.compress();
      if (this.stats && entry.value.__compressed) {
        this.stats.compressions++;
      }
    }

    this.cache.set(key, entry);

    // Gestion des limites
    while (this.cache.size > this.maxSize) {
      this._evictLRU();
    }

    while (this._isOverMemoryLimit()) {
      this._evictIntelligent();
    }
  }

  /**
   * Vérifie si une clé existe
   * @param {string} key - Clé
   * @returns {boolean}
   */
  has(key) {
    this.assertNotDisposed();

    const entry = this.cache.get(key);
    if (!entry || entry.isExpired()) {
      if (entry && entry.isExpired()) {
        this.cache.delete(key);
        if (this.stats) this.stats.expirations++;
      }
      return false;
    }
    return true;
  }

  /**
   * Supprime une clé
   * @param {string} key - Clé
   * @returns {boolean} true si supprimé
   */
  delete(key) {
    this.assertNotDisposed();
    return this.cache.delete(key);
  }

  /**
   * Vide le cache
   */
  clear() {
    this.assertNotDisposed();
    this.cache.clear();
    if (this.stats) {
      this.stats.memoryUsage = 0;
    }
  }

  /**
   * Nettoie les entrées expirées
   */
  cleanup() {
    this.assertNotDisposed();

    const keysToDelete = [];
    for (const [key, entry] of this.cache) {
      if (entry.isExpired()) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.cache.delete(key);
      if (this.stats) this.stats.expirations++;
    }

    // Force GC après cleanup
    if (keysToDelete.length > 10) {
      this.forceGC();
    }
  }

  /**
   * Retourne les statistiques
   * @returns {Object|null} Stats ou null si désactivées
   */
  getStats() {
    if (!this.stats) return null;

    const hitRate =
      this.stats.hits + this.stats.misses > 0
        ? ((this.stats.hits / (this.stats.hits + this.stats.misses)) * 100).toFixed(2)
        : 0;

    return {
      ...this.stats,
      size: this.cache.size,
      hitRate: `${hitRate}%`,
      memoryUsage: `${(this.stats.memoryUsage / 1024 / 1024).toFixed(2)}MB`,
    };
  }

  /**
   * Remet les statistiques à zéro
   */
  resetStats() {
    if (this.stats) {
      this.stats = this._initStats();
    }
  }

  /**
   * Dispose du cache et libère la mémoire
   * @returns {Promise<void>}
   */
  async dispose() {
    if (!this._disposed) {
      this.cache.clear();
      if (this.stats) {
        this.stats.memoryUsage = 0;
      }
    }
    await super.dispose();
  }
}

module.exports = { LRUCache, CacheEntry };
