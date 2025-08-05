/**
 * Tests du core de l'architecture V2 (sans dépendances MCP)
 */

const Container = require('../../src/core/container');
const { IService } = require('../../src/core/interfaces');
const ConfigService = require('../../src/services/config-service');
const LoggerService = require('../../src/services/logger-service');
const CacheService = require('../../src/services/cache-service');

describe('Architecture V2 - Core Components', () => {
  describe('Container DI', () => {
    let container;

    beforeEach(() => {
      container = new Container();
    });

    afterEach(() => {
      if (container) {
        container.dispose();
      }
    });

    it('should create and resolve singletons', () => {
      container.registerSingleton('testService', () => ({ id: 'test' }));
      
      const service1 = container.resolve('testService');
      const service2 = container.resolve('testService');
      
      expect(service1).toBe(service2); // Même instance
      expect(service1.id).toBe('test');
    });

    it('should create transient services', () => {
      container.registerTransient('transientService', () => ({ id: Math.random() }));
      
      const service1 = container.resolve('transientService');
      const service2 = container.resolve('transientService');
      
      expect(service1).not.toBe(service2); // Instances différentes
      expect(service1.id).not.toBe(service2.id);
    });

    it('should handle values', () => {
      const config = { key: 'value' };
      container.registerValue('config', config);
      
      const resolved = container.resolve('config');
      expect(resolved).toBe(config);
    });

    it('should handle dependencies', () => {
      container.registerValue('config', { db: 'test.db' });
      container.registerSingleton('database', (c) => {
        const config = c.resolve('config');
        return { connection: config.db };
      });
      
      const db = container.resolve('database');
      expect(db.connection).toBe('test.db');
    });

    it('should throw for unknown services', () => {
      expect(() => container.resolve('unknown')).toThrow('Service "unknown" non trouvé');
    });

    it('should list registered services', () => {
      container.registerSingleton('service1', () => ({}));
      container.registerValue('service2', {});
      
      const services = container.getRegisteredServices();
      expect(services).toContain('service1');
      expect(services).toContain('service2');
    });
  });

  describe('ConfigService', () => {
    let configService;

    beforeEach(() => {
      // Logger mock pour éviter les sorties console
      const mockLogger = {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn()
      };
      configService = new ConfigService(mockLogger);
    });

    it('should load default configuration', () => {
      expect(configService.get('server.name')).toBe('dsfr-mcp');
      expect(configService.get('server.version')).toBe('1.1.0');
    });

    it('should handle nested keys', () => {
      expect(configService.get('cache.maxMemorySize')).toBeDefined();
      expect(typeof configService.get('cache.maxMemorySize')).toBe('number');
    });

    it('should return default values', () => {
      expect(configService.get('nonexistent', 'default')).toBe('default');
    });

    it('should set and get values', () => {
      configService.set('test.key', 'test-value');
      expect(configService.get('test.key')).toBe('test-value');
    });

    it('should check key existence', () => {
      expect(configService.has('server.name')).toBe(true);
      expect(configService.has('nonexistent')).toBe(false);
    });

    it('should merge configurations', () => {
      configService.merge({
        custom: {
          setting: 'value'
        }
      });
      
      expect(configService.get('custom.setting')).toBe('value');
    });
  });

  describe('LoggerService', () => {
    let loggerService;
    let mockConfig;

    beforeEach(() => {
      mockConfig = {
        get: jest.fn((key, defaultValue) => {
          const config = {
            'logging.level': 'info',
            'logging.format': 'json',
            'logging.file': false,
            'logging.console': false,
            'paths.data': './test-data'
          };
          return config[key] || defaultValue;
        })
      };
      
      loggerService = new LoggerService(mockConfig);
    });

    it('should create logger with config', () => {
      expect(loggerService).toBeDefined();
      expect(loggerService.isInitialized()).toBe(false);
    });

    it('should log different levels', async () => {
      await loggerService.initialize();
      const formatSpy = jest.spyOn(loggerService, 'formatLog');
      
      loggerService.info('Test info');
      loggerService.warn('Test warn');
      loggerService.error('Test error');
      loggerService.debug('Test debug');
      
      expect(formatSpy).toHaveBeenCalledTimes(3); // debug ignoré avec level info
    });

    it('should format logs correctly', () => {
      const entry = {
        timestamp: '2025-01-01T00:00:00.000Z',
        level: 'info',
        message: 'Test message',
        meta: { key: 'value' },
        pid: 12345
      };
      
      const formatted = loggerService.formatLog(entry);
      const parsed = JSON.parse(formatted);
      
      expect(parsed.level).toBe('info');
      expect(parsed.message).toBe('Test message');
      expect(parsed.meta.key).toBe('value');
    });

    it('should handle log levels', () => {
      loggerService.setLevel('debug');
      expect(loggerService.currentLevel).toBe(3);
      
      loggerService.setLevel('error');
      expect(loggerService.currentLevel).toBe(0);
    });
  });

  describe('CacheService', () => {
    let cacheService;
    let mockConfig;
    let mockLogger;

    beforeEach(() => {
      mockLogger = {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn()
      };
      
      mockConfig = {
        get: jest.fn((key, defaultValue) => {
          const config = {
            'cache.maxMemorySize': 1024 * 1024, // 1MB pour les tests
            'cache.defaultTTL': 60000,
            'cache.cleanupInterval': 5000,
            'cache.compression': true,
            'paths.data': './test-data'
          };
          return config[key] || defaultValue;
        }),
        cache: {
          maxMemorySize: 1024 * 1024,
          defaultTTL: 60000,
          cleanupInterval: 5000,
          compression: true
        },
        paths: {
          data: './test-data'
        }
      };
      
      cacheService = new CacheService(mockConfig, mockLogger);
    });

    afterEach(async () => {
      if (cacheService) {
        await cacheService.dispose();
      }
    });

    it('should store and retrieve values', async () => {
      await cacheService.set('test-key', { data: 'test-value' });
      const result = await cacheService.get('test-key');
      
      expect(result).toEqual({ data: 'test-value' });
    });

    it('should handle TTL', async () => {
      await cacheService.set('ttl-key', 'value', 10); // 10ms
      
      // Immédiatement disponible
      expect(await cacheService.get('ttl-key')).toBe('value');
      
      // Attendre expiration
      await new Promise(resolve => setTimeout(resolve, 15));
      
      expect(await cacheService.get('ttl-key')).toBeNull();
    });

    it('should delete values', async () => {
      await cacheService.set('delete-key', 'value');
      expect(await cacheService.get('delete-key')).toBe('value');
      
      const deleted = await cacheService.delete('delete-key');
      expect(deleted).toBe(true);
      expect(await cacheService.get('delete-key')).toBeNull();
    });

    it('should clear cache', async () => {
      await cacheService.set('key1', 'value1');
      await cacheService.set('key2', 'value2');
      
      await cacheService.clear();
      
      expect(await cacheService.get('key1')).toBeNull();
      expect(await cacheService.get('key2')).toBeNull();
    });

    it('should provide statistics', async () => {
      await cacheService.set('stats-key', 'value');
      await cacheService.get('stats-key');
      await cacheService.get('nonexistent');
      
      const stats = await cacheService.getStats();
      
      expect(stats).toHaveProperty('hits');
      expect(stats).toHaveProperty('misses');
      expect(stats).toHaveProperty('sets');
      expect(stats).toHaveProperty('entries');
      expect(stats.hits).toBeGreaterThan(0);
      expect(stats.misses).toBeGreaterThan(0);
    });

    it('should handle compression', async () => {
      const largeData = 'x'.repeat(2000); // > 1024 bytes
      
      await cacheService.set('large-key', largeData);
      const retrieved = await cacheService.get('large-key');
      
      expect(retrieved).toBe(largeData);
    });

    it('should format bytes correctly', () => {
      expect(cacheService.formatBytes(0)).toBe('0 B');
      expect(cacheService.formatBytes(1024)).toBe('1 KB');
      expect(cacheService.formatBytes(1024 * 1024)).toBe('1 MB');
    });
  });

  describe('Performance Tests', () => {
    it('should initialize services quickly', async () => {
      const container = new Container();
      
      // Configuration avec logger mock
      const mockLogger = {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn()
      };
      
      container.registerSingleton('logger', () => mockLogger);
      container.registerSingleton('config', (c) => {
        const logger = c.resolve('logger');
        return new ConfigService(logger);
      });
      
      const startTime = Date.now();
      
      const config = container.resolve('config');
      await config.initialize();
      
      const initTime = Date.now() - startTime;
      
      expect(initTime).toBeLessThan(100); // Très rapide sans I/O
      
      container.dispose();
    });

    it('should handle multiple concurrent cache operations', async () => {
      const mockLogger = { info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() };
      const mockConfig = {
        get: () => 1024 * 1024, // 1MB
        cache: {
          maxMemorySize: 1024 * 1024,
          defaultTTL: 60000,
          cleanupInterval: 5000,
          compression: true
        },
        paths: {
          data: './test-data'
        }
      };
      
      const cache = new CacheService(mockConfig, mockLogger);
      
      const promises = [];
      for (let i = 0; i < 100; i++) {
        promises.push(cache.set(`key-${i}`, `value-${i}`));
      }
      
      const startTime = Date.now();
      await Promise.all(promises);
      const setTime = Date.now() - startTime;
      
      // Toutes les opérations doivent être rapides
      expect(setTime).toBeLessThan(1000);
      
      // Vérifier que toutes les valeurs sont présentes
      const getPromises = [];
      for (let i = 0; i < 100; i++) {
        getPromises.push(cache.get(`key-${i}`));
      }
      
      const getStartTime = Date.now();
      const results = await Promise.all(getPromises);
      const getTime = Date.now() - getStartTime;
      
      expect(getTime).toBeLessThan(500);
      expect(results).toHaveLength(100);
      expect(results[0]).toBe('value-0');
      expect(results[99]).toBe('value-99');
      
      await cache.dispose();
    });
  });
});