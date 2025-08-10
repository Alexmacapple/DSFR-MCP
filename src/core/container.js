/**
 * Container de dépendances pour DSFR-MCP
 * Implémente le pattern Dependency Injection avec lazy loading
 */

class Container {
  constructor() {
    this.services = new Map();
    this.singletons = new Map();
    this.factories = new Map();
  }

  /**
   * Enregistre un service comme singleton
   */
  registerSingleton(name, factory) {
    this.services.set(name, {
      type: 'singleton',
      factory,
      instance: null,
    });
    return this;
  }

  /**
   * Enregistre un service avec une nouvelle instance à chaque appel
   */
  registerTransient(name, factory) {
    this.services.set(name, {
      type: 'transient',
      factory,
    });
    return this;
  }

  /**
   * Enregistre une valeur constante
   */
  registerValue(name, value) {
    this.services.set(name, {
      type: 'value',
      value,
    });
    return this;
  }

  /**
   * Résout un service par son nom
   */
  resolve(name) {
    const service = this.services.get(name);

    if (!service) {
      throw new Error(`Service "${name}" non trouvé dans le container`);
    }

    switch (service.type) {
      case 'singleton':
        if (!service.instance) {
          service.instance = service.factory(this);
        }
        return service.instance;

      case 'transient':
        return service.factory(this);

      case 'value':
        return service.value;

      default:
        throw new Error(`Type de service invalide: ${service.type}`);
    }
  }

  /**
   * Vérifie si un service est enregistré
   */
  has(name) {
    return this.services.has(name);
  }

  /**
   * Liste tous les services enregistrés
   */
  getRegisteredServices() {
    return Array.from(this.services.keys());
  }

  /**
   * Nettoyage des ressources
   */
  dispose() {
    // Appelle dispose() sur tous les singletons qui l'implémentent
    for (const [, service] of this.services) {
      if (service.type === 'singleton' && service.instance) {
        if (typeof service.instance.dispose === 'function') {
          service.instance.dispose();
        }
      }
    }

    this.services.clear();
    this.singletons.clear();
    this.factories.clear();
  }
}

module.exports = Container;
