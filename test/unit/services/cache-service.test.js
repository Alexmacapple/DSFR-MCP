/**
 * Tests unitaires pour CacheService
 * Couvre toutes les fonctionnalités du service de cache
 */

const CacheService = require('../../../src/services/cache-service');
const path = require('path');

// Mock du module fs complet
jest.mock('fs', () => {
  const originalModule = jest.requireActual('fs');
  return {
    ...originalModule,
    promises: {
      access: jest.fn(),
      mkdir: jest.fn(),
      readFile: jest.fn(),
      writeFile: jest.fn(),
      unlink: jest.fn(),
      readdir: jest.fn()
    }
  };
});

const fs = require('fs').promises;

describe('CacheService', () => {
  let cacheService;
  let mockConfig;
  let mockLogger;

  beforeEach(() => {
    // Configuration mock
    mockConfig = {
      cache: {
        maxMemorySize: 10 * 1024 * 1024, // 10MB
        defaultTTL: 60000, // 1 minute
        cleanupInterval: 30000, // 30 secondes
        compression: true,
        persistentPath: '/tmp/test-cache'
      },
      paths: {
        data: '/tmp/data'
      }
    };

    // Logger mock
    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn()
    };

    // Créer une nouvelle instance pour chaque test
    cacheService = new CacheService(mockConfig, mockLogger);
    
    // Reset tous les mocks
    jest.clearAllMocks();
  });

  afterEach(async () => {
    // Nettoyer les timers et ressources
    if (cacheService.cleanupTimer) {
      clearInterval(cacheService.cleanupTimer);
    }
    await cacheService.dispose();
  });

  describe('Constructor', () => {
    it('should initialize with correct default values', () => {
      expect(cacheService.maxMemorySize).toBe(10 * 1024 * 1024);
      expect(cacheService.defaultTTL).toBe(60000);
      expect(cacheService.cleanupInterval).toBe(30000);
      expect(cacheService.compressionEnabled).toBe(true);
      expect(cacheService.initialized).toBe(false);
    });

    it('should initialize cacheStats correctly', () => {
      expect(cacheService.cacheStats).toBeDefined();
      expect(cacheService.cacheStats.hits).toBe(0);
      expect(cacheService.cacheStats.misses).toBe(0);
      expect(cacheService.cacheStats.sets).toBe(0);
      expect(cacheService.cacheStats.deletes).toBe(0);
      expect(cacheService.cacheStats.evictions).toBe(0);
      expect(cacheService.cacheStats.memoryUsage).toBe(0);
    });

    it('should use default values when config is missing', () => {
      const minimalConfig = { paths: { data: '/tmp' } };
      const service = new CacheService(minimalConfig, mockLogger);
      
      expect(service.maxMemorySize).toBe(50 * 1024 * 1024); // 50MB default
      expect(service.defaultTTL).toBe(30 * 60 * 1000); // 30 minutes default
      expect(service.cleanupInterval).toBe(5 * 60 * 1000); // 5 minutes default
    });
  });

  describe('initialize()', () => {
    it('should initialize successfully', async () => {
      fs.access.mockResolvedValue();
      fs.readdir.mockResolvedValue([]);

      await cacheService.initialize();

      expect(cacheService.initialized).toBe(true);
      expect(mockLogger.info).toHaveBeenCalledWith('Initialisation du CacheService');
      expect(mockLogger.info).toHaveBeenCalledWith(
        'CacheService initialisé',
        expect.any(Object)
      );
    });

    it('should not initialize twice', async () => {
      fs.access.mockResolvedValue();
      fs.readdir.mockResolvedValue([]);

      await cacheService.initialize();
      await cacheService.initialize();

      expect(mockLogger.info).toHaveBeenCalledTimes(2); // Only first initialization
    });

    it('should handle initialization errors', async () => {
      const error = new Error('Init failed');
      fs.access.mockRejectedValue(error);

      await expect(cacheService.initialize()).rejects.toThrow('Init failed');
      expect(mockLogger.error).toHaveBeenCalled();
      expect(cacheService.initialized).toBe(false);
    });
  });

  describe('get() and set()', () => {
    beforeEach(async () => {
      fs.access.mockResolvedValue();
      fs.readdir.mockResolvedValue([]);
      await cacheService.initialize();
    });

    it('should set and get a value', async () => {
      const key = 'test-key';
      const value = { data: 'test data' };

      await cacheService.set(key, value);
      const retrieved = await cacheService.get(key);

      expect(retrieved).toEqual(value);
      expect(cacheService.cacheStats.sets).toBe(1);
      expect(cacheService.cacheStats.hits).toBe(1);
    });

    it('should return null for non-existent key', async () => {
      const result = await cacheService.get('non-existent');
      
      expect(result).toBeNull();
      expect(cacheService.cacheStats.misses).toBe(1);
    });

    it('should handle TTL expiration', async () => {
      const key = 'ttl-test';
      const value = { data: 'expires soon' };
      const ttl = 100; // 100ms

      await cacheService.set(key, value, ttl);
      
      // Vérifier que la valeur existe
      let retrieved = await cacheService.get(key);
      expect(retrieved).toEqual(value);
      
      // Attendre l'expiration
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Vérifier que la valeur a expiré
      retrieved = await cacheService.get(key);
      expect(retrieved).toBeNull();
      expect(cacheService.cacheStats.evictions).toBeGreaterThan(0);
    });

    it('should update existing value', async () => {
      const key = 'update-test';
      const value1 = { data: 'original' };
      const value2 = { data: 'updated' };

      await cacheService.set(key, value1);
      await cacheService.set(key, value2);
      const retrieved = await cacheService.get(key);

      expect(retrieved).toEqual(value2);
      expect(cacheService.cacheStats.sets).toBe(2);
    });
  });

  describe('delete()', () => {
    beforeEach(async () => {
      fs.access.mockResolvedValue();
      fs.readdir.mockResolvedValue([]);
      await cacheService.initialize();
    });

    it('should delete an existing key', async () => {
      const key = 'delete-test';
      const value = { data: 'to be deleted' };

      await cacheService.set(key, value);
      const deleted = await cacheService.delete(key);
      
      expect(deleted).toBe(true);
      expect(await cacheService.get(key)).toBeNull();
      expect(cacheService.cacheStats.deletes).toBe(1);
    });

    it('should return false for non-existent key', async () => {
      const deleted = await cacheService.delete('non-existent');
      
      expect(deleted).toBe(false);
      expect(cacheService.cacheStats.deletes).toBe(0);
    });
  });

  describe('clear()', () => {
    beforeEach(async () => {
      fs.access.mockResolvedValue();
      fs.readdir.mockResolvedValue([]);
      await cacheService.initialize();
    });

    it('should clear all cache entries', async () => {
      await cacheService.set('key1', { data: 'value1' });
      await cacheService.set('key2', { data: 'value2' });
      await cacheService.set('key3', { data: 'value3' });

      await cacheService.clear();

      expect(await cacheService.get('key1')).toBeNull();
      expect(await cacheService.get('key2')).toBeNull();
      expect(await cacheService.get('key3')).toBeNull();
      expect(cacheService.cacheStats.memoryUsage).toBe(0);
    });
  });

  describe('has()', () => {
    beforeEach(async () => {
      fs.access.mockResolvedValue();
      fs.readdir.mockResolvedValue([]);
      await cacheService.initialize();
    });

    it('should return true for existing key', async () => {
      await cacheService.set('exists', { data: 'value' });
      
      expect(await cacheService.has('exists')).toBe(true);
    });

    it('should return false for non-existent key', async () => {
      expect(await cacheService.has('not-exists')).toBe(false);
    });

    it('should return false for expired key', async () => {
      await cacheService.set('expired', { data: 'value' }, 50); // 50ms TTL
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(await cacheService.has('expired')).toBe(false);
    });
  });

  describe('getStats()', () => {
    beforeEach(async () => {
      fs.access.mockResolvedValue();
      fs.readdir.mockResolvedValue([]);
      await cacheService.initialize();
    });

    it('should return correct statistics', async () => {
      await cacheService.set('key1', { data: 'value1' });
      await cacheService.set('key2', { data: 'value2' });
      await cacheService.get('key1'); // hit
      await cacheService.get('key3'); // miss
      await cacheService.delete('key2'); // delete

      const stats = await cacheService.getStats();

      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(1);
      expect(stats.sets).toBe(2);
      expect(stats.deletes).toBe(1);
      expect(stats.size).toBe(1);
      expect(stats.hitRate).toBeCloseTo(0.5, 2);
    });
  });

  describe('Memory management', () => {
    beforeEach(async () => {
      fs.access.mockResolvedValue();
      fs.readdir.mockResolvedValue([]);
      await cacheService.initialize();
    });

    it('should track memory usage', async () => {
      const initialMemory = cacheService.cacheStats.memoryUsage;
      
      await cacheService.set('large-key', { data: 'x'.repeat(1000) });
      
      expect(cacheService.cacheStats.memoryUsage).toBeGreaterThan(initialMemory);
    });

    it('should format bytes correctly', () => {
      expect(cacheService.formatBytes(0)).toBe('0 B');
      expect(cacheService.formatBytes(1024)).toBe('1.00 KB');
      expect(cacheService.formatBytes(1024 * 1024)).toBe('1.00 MB');
      expect(cacheService.formatBytes(1024 * 1024 * 1024)).toBe('1.00 GB');
    });
  });

  describe('Compression', () => {
    beforeEach(async () => {
      fs.access.mockResolvedValue();
      fs.readdir.mockResolvedValue([]);
      await cacheService.initialize();
    });

    it('should compress and decompress data when enabled', async () => {
      const key = 'compress-test';
      const largeData = { data: 'x'.repeat(10000) };

      await cacheService.set(key, largeData);
      const retrieved = await cacheService.get(key);

      expect(retrieved).toEqual(largeData);
    });

    it('should not compress when disabled', async () => {
      cacheService.compressionEnabled = false;
      
      const key = 'no-compress';
      const data = { data: 'test' };

      await cacheService.set(key, data);
      const retrieved = await cacheService.get(key);

      expect(retrieved).toEqual(data);
    });
  });

  describe('Cleanup', () => {
    beforeEach(async () => {
      fs.access.mockResolvedValue();
      fs.readdir.mockResolvedValue([]);
      await cacheService.initialize();
    });

    it('should cleanup expired entries', async () => {
      // Ajouter des entrées avec différents TTL
      await cacheService.set('expire-1', { data: 'value1' }, 50);
      await cacheService.set('expire-2', { data: 'value2' }, 100);
      await cacheService.set('keep', { data: 'value3' }, 10000);

      // Attendre l'expiration des premières entrées
      await new Promise(resolve => setTimeout(resolve, 150));

      // Déclencher le nettoyage
      await cacheService.cleanup();

      expect(await cacheService.has('expire-1')).toBe(false);
      expect(await cacheService.has('expire-2')).toBe(false);
      expect(await cacheService.has('keep')).toBe(true);
    });
  });

  describe('dispose()', () => {
    it('should cleanup resources on dispose', async () => {
      fs.access.mockResolvedValue();
      fs.readdir.mockResolvedValue([]);
      
      await cacheService.initialize();
      const timerSpy = jest.spyOn(global, 'clearInterval');
      
      await cacheService.dispose();
      
      expect(timerSpy).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith('CacheService fermé');
    });
  });

  describe('Error handling', () => {
    beforeEach(async () => {
      fs.access.mockResolvedValue();
      fs.readdir.mockResolvedValue([]);
      await cacheService.initialize();
    });

    it('should handle invalid JSON gracefully', async () => {
      // Simuler une corruption de données
      const key = 'corrupt';
      cacheService.memoryCache.set(key, {
        value: 'not-valid-json{',
        created: Date.now(),
        lastAccessed: Date.now(),
        accessCount: 1,
        size: 100
      });

      const result = await cacheService.get(key);
      
      expect(result).toBeNull();
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should handle set errors gracefully', async () => {
      const key = 'error-test';
      const value = {};
      // Créer une référence circulaire qui causera une erreur JSON
      value.circular = value;

      const result = await cacheService.set(key, value);
      
      expect(result).toBe(false);
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });
});