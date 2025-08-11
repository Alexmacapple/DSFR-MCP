/**
 * Tests pour les optimisations mémoire et resource management
 * Vérifie pattern Disposable et LRU cache
 */

const { DisposableBase, using } = require('../../../src/core/disposable');
const { LRUCache } = require('../../../src/core/lru-cache');

describe('Memory Optimization & Resource Management', () => {
  
  describe('DisposableBase Pattern', () => {
    let disposable;

    beforeEach(() => {
      disposable = new DisposableBase();
    });

    afterEach(async () => {
      if (disposable && !disposable.isDisposed) {
        await disposable.dispose();
      }
    });

    it('should initialize properly', () => {
      expect(disposable.isDisposed).toBe(false);
      expect(disposable._disposables).toEqual([]);
      expect(disposable._timers).toBeInstanceOf(Set);
      expect(disposable._intervals).toBeInstanceOf(Set);
    });

    it('should track and dispose of timers', (done) => {
      let timerExecuted = false;
      
      const timer = disposable.setTimeout(() => {
        timerExecuted = true;
      }, 50);
      
      expect(disposable._timers.has(timer)).toBe(true);
      
      // Dispose avant que le timer s'exécute
      setTimeout(async () => {
        await disposable.dispose();
        
        // Vérifier que le timer a été nettoyé
        setTimeout(() => {
          expect(timerExecuted).toBe(false);
          expect(disposable._timers.size).toBe(0);
          done();
        }, 100);
      }, 25);
    });

    it('should track and dispose of intervals', (done) => {
      let intervalCount = 0;
      
      const interval = disposable.setInterval(() => {
        intervalCount++;
      }, 25);
      
      expect(disposable._intervals.has(interval)).toBe(true);
      
      setTimeout(async () => {
        await disposable.dispose();
        const countAtDispose = intervalCount;
        
        // Vérifier que l'interval a été nettoyé
        setTimeout(() => {
          expect(intervalCount).toBe(countAtDispose);
          expect(disposable._intervals.size).toBe(0);
          done();
        }, 50);
      }, 75);
    });

    it('should track and dispose of event listeners', async () => {
      const EventEmitter = require('events');
      const emitter = new EventEmitter();
      
      let eventCount = 0;
      const listener = () => { eventCount++; };
      
      disposable.addEventListener(emitter, 'test', listener);
      
      // Vérifier que l'event listener fonctionne
      emitter.emit('test');
      expect(eventCount).toBe(1);
      
      // Dispose et vérifier que l'event listener a été supprimé
      await disposable.dispose();
      
      emitter.emit('test');
      expect(eventCount).toBe(1); // Pas d'augmentation après dispose
    });

    it('should prevent operations after disposal', async () => {
      await disposable.dispose();
      
      expect(() => {
        disposable.assertNotDisposed();
      }).toThrow('Object has been disposed');
      
      expect(() => {
        disposable.addDisposable(() => {});
      }).toThrow('Cannot add disposable to already disposed object');
    });
  });

  describe('LRUCache Optimization', () => {
    let cache;

    beforeEach(() => {
      cache = new LRUCache({
        maxSize: 5,
        maxMemory: 1024, // 1KB for testing
        defaultTTL: 1000, // 1 second
        enableStats: true
      });
    });

    afterEach(async () => {
      if (cache) {
        await cache.dispose();
      }
    });

    it('should enforce size limit with LRU eviction', () => {
      // Ajouter plus d'entrées que maxSize
      for (let i = 0; i < 7; i++) {
        cache.set(`key${i}`, `value${i}`);
      }
      
      // Vérifier que seules les 5 dernières sont conservées
      expect(cache.cache.size).toBe(5);
      expect(cache.has('key0')).toBe(false); // Première évincée
      expect(cache.has('key1')).toBe(false); // Deuxième évincée
      expect(cache.has('key6')).toBe(true);  // Dernière conservée
    });

    it('should handle TTL expiration', (done) => {
      cache.set('expiring', 'value', 100); // 100ms TTL
      
      expect(cache.get('expiring')).toBe('value');
      
      setTimeout(() => {
        expect(cache.get('expiring')).toBeUndefined();
        expect(cache.has('expiring')).toBe(false);
        done();
      }, 150);
    });

    it('should track access patterns and update timestamps', (done) => {
      cache.set('test', 'value');
      
      const entry = cache.cache.get('test');
      const initialAccessTime = entry.accessTime;
      const initialAccessCount = entry.accessCount;
      
      // Attendre un petit délai puis accéder
      setTimeout(() => {
        cache.get('test');
        
        const updatedEntry = cache.cache.get('test');
        expect(updatedEntry.accessTime).toBeGreaterThan(initialAccessTime);
        expect(updatedEntry.accessCount).toBe(initialAccessCount + 1);
        done();
      }, 10);
    });

    it('should provide accurate statistics', () => {
      // Générer hits et misses
      cache.set('test', 'value');
      cache.get('test');      // hit
      cache.get('missing');   // miss
      cache.get('test');      // hit
      
      const stats = cache.getStats();
      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBe('66.67%');
      expect(stats.size).toBe(1);
    });

    it('should cleanup expired entries', (done) => {
      cache.set('temp1', 'value1', 50);
      cache.set('temp2', 'value2', 50);
      cache.set('permanent', 'value'); // Pas de TTL
      
      expect(cache.cache.size).toBe(3);
      
      setTimeout(() => {
        cache.cleanup();
        expect(cache.cache.size).toBe(1);
        expect(cache.has('permanent')).toBe(true);
        expect(cache.has('temp1')).toBe(false);
        expect(cache.has('temp2')).toBe(false);
        done();
      }, 100);
    });

    it('should compress large values automatically', () => {
      const largeValue = 'x'.repeat(2000); // > 1KB
      cache.set('large', largeValue);
      
      const entry = cache.cache.get('large');
      expect(entry).toBeDefined();
      
      // Vérifier que la valeur est récupérable
      const retrieved = cache.get('large');
      expect(retrieved).toBe(largeValue);
      
      // Stats de compression
      const stats = cache.getStats();
      expect(stats.compressions).toBeGreaterThan(0);
    });

    it('should dispose properly and release memory', async () => {
      cache.set('test1', 'value1');
      cache.set('test2', 'value2');
      
      expect(cache.cache.size).toBe(2);
      
      await cache.dispose();
      
      expect(cache.cache.size).toBe(0);
      expect(cache.isDisposed).toBe(true);
      
      // Vérifier qu'on ne peut plus utiliser le cache
      expect(() => cache.get('test1')).toThrow();
    });
  });

  describe('Memory Growth Prevention', () => {
    it('should not leak memory with repeated operations', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      for (let i = 0; i < 100; i++) {
        const cache = new LRUCache({ maxSize: 10, maxMemory: 1024 });
        
        // Opérations répétées
        for (let j = 0; j < 20; j++) {
          cache.set(`key${j}`, `value${j}`);
          cache.get(`key${j}`);
        }
        
        await cache.dispose();
        
        // Force GC toutes les 25 itérations
        if (i % 25 === 0 && global.gc) {
          global.gc();
        }
      }
      
      // Force GC final
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryGrowth = (finalMemory - initialMemory) / 1024 / 1024; // MB
      
      // Ne devrait pas fuir plus de 5MB
      expect(memoryGrowth).toBeLessThan(5);
    });
  });

  describe('Using Block Pattern', () => {
    it('should auto-dispose resources', async () => {
      let disposed = false;
      
      const resource = {
        dispose: async () => { disposed = true; }
      };
      
      const result = await using(resource, async (res) => {
        expect(res).toBe(resource);
        return 'success';
      });
      
      expect(result).toBe('success');
      expect(disposed).toBe(true);
    });

    it('should dispose even on error', async () => {
      let disposed = false;
      
      const resource = {
        dispose: async () => { disposed = true; }
      };
      
      try {
        await using(resource, async () => {
          throw new Error('Test error');
        });
      } catch (error) {
        expect(error.message).toBe('Test error');
      }
      
      expect(disposed).toBe(true);
    });
  });
});