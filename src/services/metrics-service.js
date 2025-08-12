/**
 * Service de métriques pour dashboard DSFR-MCP
 * Collecte et expose les métriques de performance et santé
 */

const { EventEmitter } = require('events');

class MetricsService extends EventEmitter {
  constructor(logger) {
    super();
    this.logger = logger;
    this.startTime = Date.now();
    
    // Métriques principales
    this.metrics = {
      requests: {
        total: 0,
        successful: 0,
        failed: 0,
        avgResponseTime: 0,
        lastRequests: []
      },
      tools: {
        usage: new Map(),
        responseTime: new Map(),
        errors: new Map()
      },
      cache: {
        hits: 0,
        misses: 0,
        hitRate: 0,
        memoryUsage: 0,
        size: 0
      },
      system: {
        uptime: 0,
        memoryUsage: process.memoryUsage(),
        cpuUsage: null
      }
    };

    // Mise à jour automatique toutes les 5 secondes
    this.updateInterval = setInterval(() => {
      this.updateSystemMetrics();
    }, 5000);
  }

  /**
   * Enregistre une requête MCP
   */
  recordRequest(toolName, responseTime, success = true) {
    const now = Date.now();
    
    // Métriques globales
    this.metrics.requests.total++;
    if (success) {
      this.metrics.requests.successful++;
    } else {
      this.metrics.requests.failed++;
    }

    // Temps de réponse moyen (rolling average)
    const currentAvg = this.metrics.requests.avgResponseTime;
    const total = this.metrics.requests.total;
    this.metrics.requests.avgResponseTime = 
      (currentAvg * (total - 1) + responseTime) / total;

    // Dernières requêtes (max 100)
    this.metrics.requests.lastRequests.push({
      tool: toolName,
      timestamp: now,
      responseTime,
      success
    });
    if (this.metrics.requests.lastRequests.length > 100) {
      this.metrics.requests.lastRequests.shift();
    }

    // Métriques par outil
    const toolUsage = this.metrics.tools.usage.get(toolName) || 0;
    this.metrics.tools.usage.set(toolName, toolUsage + 1);

    const toolTimes = this.metrics.tools.responseTime.get(toolName) || [];
    toolTimes.push(responseTime);
    // Garder seulement les 50 derniers temps
    if (toolTimes.length > 50) {
      toolTimes.shift();
    }
    this.metrics.tools.responseTime.set(toolName, toolTimes);

    if (!success) {
      const toolErrors = this.metrics.tools.errors.get(toolName) || 0;
      this.metrics.tools.errors.set(toolName, toolErrors + 1);
    }

    this.emit('request', { toolName, responseTime, success });
  }

  /**
   * Met à jour les métriques de cache
   */
  updateCacheMetrics(cacheStats) {
    if (cacheStats) {
      this.metrics.cache = {
        hits: cacheStats.hits || 0,
        misses: cacheStats.misses || 0,
        hitRate: cacheStats.hitRate || 0,
        memoryUsage: cacheStats.memoryUsage || 0,
        size: cacheStats.size || 0
      };
    }
  }

  /**
   * Met à jour les métriques système
   */
  updateSystemMetrics() {
    this.metrics.system.uptime = Date.now() - this.startTime;
    this.metrics.system.memoryUsage = process.memoryUsage();
    
    // CPU usage (approximatif)
    const usage = process.cpuUsage();
    this.metrics.system.cpuUsage = usage;
  }

  /**
   * Obtient les métriques formatées pour le dashboard
   */
  getDashboardMetrics() {
    const uptime = this.metrics.system.uptime;
    const memUsage = this.metrics.system.memoryUsage;

    // Calcul des moyennes par outil
    const toolsStats = {};
    for (const [toolName, times] of this.metrics.tools.responseTime) {
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      const usage = this.metrics.tools.usage.get(toolName) || 0;
      const errors = this.metrics.tools.errors.get(toolName) || 0;
      
      toolsStats[toolName] = {
        usage,
        avgResponseTime: Math.round(avgTime),
        errorRate: usage > 0 ? ((errors / usage) * 100).toFixed(1) : 0,
        status: errors === 0 ? 'healthy' : errors < usage * 0.1 ? 'warning' : 'error'
      };
    }

    // Requêtes par minute (dernières 10 minutes)
    const tenMinutesAgo = Date.now() - (10 * 60 * 1000);
    const recentRequests = this.metrics.requests.lastRequests
      .filter(req => req.timestamp > tenMinutesAgo);
    const requestsPerMinute = recentRequests.length / 10;

    return {
      overview: {
        uptime: this.formatUptime(uptime),
        status: this.getOverallStatus(),
        requestsTotal: this.metrics.requests.total,
        requestsPerMinute: Math.round(requestsPerMinute * 10) / 10,
        successRate: this.metrics.requests.total > 0 
          ? ((this.metrics.requests.successful / this.metrics.requests.total) * 100).toFixed(1)
          : 100,
        avgResponseTime: Math.round(this.metrics.requests.avgResponseTime)
      },
      cache: {
        hitRate: this.metrics.cache.hitRate,
        hits: this.metrics.cache.hits,
        misses: this.metrics.cache.misses,
        memoryUsage: this.formatBytes(this.metrics.cache.memoryUsage),
        size: this.metrics.cache.size
      },
      system: {
        memoryUsage: {
          used: this.formatBytes(memUsage.heapUsed),
          total: this.formatBytes(memUsage.heapTotal),
          percentage: ((memUsage.heapUsed / memUsage.heapTotal) * 100).toFixed(1)
        },
        rss: this.formatBytes(memUsage.rss)
      },
      tools: toolsStats,
      recentActivity: this.metrics.requests.lastRequests
        .slice(-20)
        .map(req => ({
          ...req,
          timestamp: new Date(req.timestamp).toLocaleTimeString()
        }))
    };
  }

  /**
   * Détermine le status global
   */
  getOverallStatus() {
    const total = this.metrics.requests.total;
    if (total === 0) return 'idle';
    
    const successRate = (this.metrics.requests.successful / total) * 100;
    const avgTime = this.metrics.requests.avgResponseTime;
    
    if (successRate >= 95 && avgTime < 500) return 'healthy';
    if (successRate >= 90 && avgTime < 1000) return 'warning';
    return 'error';
  }

  /**
   * Formate la durée de fonctionnement
   */
  formatUptime(ms) {
    const seconds = Math.floor(ms / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }

  /**
   * Formate les bytes en unités lisibles
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  }

  /**
   * Réinitialise les métriques
   */
  reset() {
    this.metrics.requests = {
      total: 0,
      successful: 0,
      failed: 0,
      avgResponseTime: 0,
      lastRequests: []
    };
    this.metrics.tools.usage.clear();
    this.metrics.tools.responseTime.clear();
    this.metrics.tools.errors.clear();
    this.startTime = Date.now();
  }

  /**
   * Nettoyage des ressources
   */
  dispose() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }
}

module.exports = { MetricsService };