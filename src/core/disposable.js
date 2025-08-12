/**
 * @fileoverview Pattern Disposable pour resource management
 * @module core/disposable
 */

/**
 * Interface Disposable pour gestion automatique des ressources
 * @interface IDisposable
 */
class IDisposable {
  /**
   * Libère toutes les ressources utilisées par cet objet
   * @abstract
   * @returns {Promise<void>}
   */
  async dispose() {
    throw new Error('dispose() method must be implemented');
  }

  /**
   * Indique si l'objet a été disposé
   * @returns {boolean}
   */
  get isDisposed() {
    return this._disposed || false;
  }
}

/**
 * Classe de base avec support Disposable automatique
 */
class DisposableBase extends IDisposable {
  constructor() {
    super();
    this._disposed = false;
    this._disposables = [];
    this._timers = new Set();
    this._intervals = new Set();
    this._eventListeners = new Map();
  }

  /**
   * Ajoute une ressource à disposer automatiquement
   * @param {IDisposable|Function|Object} resource - Ressource à disposer
   * @returns {*} La ressource ajoutée
   */
  addDisposable(resource) {
    if (this._disposed) {
      throw new Error('Cannot add disposable to already disposed object');
    }

    this._disposables.push(resource);
    return resource;
  }

  /**
   * Crée un timer auto-disposable
   * @param {Function} callback - Callback à exécuter
   * @param {number} delay - Délai en ms
   * @returns {NodeJS.Timeout}
   */
  setTimeout(callback, delay) {
    const timer = setTimeout(() => {
      this._timers.delete(timer);
      callback();
    }, delay);

    this._timers.add(timer);
    return timer;
  }

  /**
   * Crée un interval auto-disposable
   * @param {Function} callback - Callback à exécuter
   * @param {number} interval - Interval en ms
   * @returns {NodeJS.Timeout}
   */
  setInterval(callback, interval) {
    const timer = setInterval(callback, interval);
    this._intervals.add(timer);
    return timer;
  }

  /**
   * Ajoute un event listener auto-disposable
   * @param {EventEmitter} emitter - Event emitter
   * @param {string} event - Nom de l'événement
   * @param {Function} listener - Listener function
   */
  addEventListener(emitter, event, listener) {
    emitter.on(event, listener);

    if (!this._eventListeners.has(emitter)) {
      this._eventListeners.set(emitter, new Map());
    }

    const listeners = this._eventListeners.get(emitter);
    if (!listeners.has(event)) {
      listeners.set(event, []);
    }

    listeners.get(event).push(listener);
  }

  /**
   * Force garbage collection si disponible
   */
  forceGC() {
    if (global.gc && typeof global.gc === 'function') {
      try {
        global.gc();
      } catch (error) {
        // GC not available, ignore silently
      }
    }
  }

  /**
   * Dispose de toutes les ressources
   * @returns {Promise<void>}
   */
  async dispose() {
    if (this._disposed) {
      return;
    }

    this._disposed = true;

    // Clear timers
    for (const timer of this._timers) {
      clearTimeout(timer);
    }
    this._timers.clear();

    for (const timer of this._intervals) {
      clearInterval(timer);
    }
    this._intervals.clear();

    // Remove event listeners
    for (const [emitter, events] of this._eventListeners) {
      for (const [event, listeners] of events) {
        for (const listener of listeners) {
          emitter.removeListener(event, listener);
        }
      }
    }
    this._eventListeners.clear();

    // Dispose registered resources
    const disposePromises = this._disposables.map(async (resource) => {
      try {
        if (resource && typeof resource.dispose === 'function') {
          await resource.dispose();
        } else if (typeof resource === 'function') {
          await resource();
        } else if (resource && typeof resource.close === 'function') {
          await resource.close();
        } else if (resource && typeof resource.destroy === 'function') {
          resource.destroy();
        }
      } catch (error) {
        console.warn('Error disposing resource:', error);
      }
    });

    await Promise.all(disposePromises);
    this._disposables.length = 0;

    // Force garbage collection
    this.forceGC();
  }

  /**
   * Vérifie si l'objet n'est pas disposé
   * @throws {Error} Si l'objet est disposé
   */
  assertNotDisposed() {
    if (this._disposed) {
      throw new Error('Object has been disposed');
    }
  }
}

/**
 * Utility function pour créer un using block (pattern C#)
 * @param {IDisposable|Function} resource - Ressource à disposer automatiquement
 * @param {Function} action - Action à exécuter avec la ressource
 * @returns {Promise<*>} Résultat de l'action
 */
async function using(resource, action) {
  try {
    return await action(resource);
  } finally {
    if (resource && typeof resource.dispose === 'function') {
      await resource.dispose();
    } else if (typeof resource === 'function') {
      await resource();
    }
  }
}

/**
 * Decorator pour auto-dispose des méthodes
 * @param {Function} method - Méthode à décorer
 * @returns {Function} Méthode décorée
 */
function autoDispose(method) {
  return function (...args) {
    this.assertNotDisposed();
    return method.apply(this, args);
  };
}

module.exports = {
  IDisposable,
  DisposableBase,
  using,
  autoDispose,
};
