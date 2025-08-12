/**
 * Service Dashboard pour exposition des métriques via HTTP
 * Fournit une interface web simple pour monitoring DSFR-MCP
 */

const http = require('http');
const url = require('url');
const path = require('path');

class DashboardService {
  constructor(metricsService, logger, port = 3001) {
    this.metricsService = metricsService;
    this.logger = logger;
    this.port = port;
    this.server = null;
  }

  /**
   * Démarre le serveur dashboard
   */
  async start() {
    return new Promise((resolve, reject) => {
      this.server = http.createServer((req, res) => {
        this.handleRequest(req, res);
      });

      this.server.listen(this.port, () => {
        this.logger?.info(`Dashboard disponible sur http://localhost:${this.port}/dashboard`);
        resolve();
      });

      this.server.on('error', (error) => {
        this.logger?.error('Erreur serveur dashboard:', error);
        reject(error);
      });
    });
  }

  /**
   * Gestionnaire des requêtes HTTP
   */
  handleRequest(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    try {
      if (pathname === '/dashboard' || pathname === '/') {
        this.serveDashboard(res);
      } else if (pathname === '/api/metrics') {
        this.serveMetrics(res);
      } else if (pathname === '/api/health') {
        this.serveHealth(res);
      } else {
        this.serve404(res);
      }
    } catch (error) {
      this.logger?.error('Erreur handling request:', error);
      this.serveError(res, 500, 'Erreur serveur interne');
    }
  }

  /**
   * Sert la page dashboard HTML
   */
  serveDashboard(res) {
    const html = this.generateDashboardHTML();
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  }

  /**
   * Sert les métriques en JSON
   */
  serveMetrics(res) {
    const metrics = this.metricsService.getDashboardMetrics();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(metrics, null, 2));
  }

  /**
   * Sert le health check
   */
  serveHealth(res) {
    const metrics = this.metricsService.getDashboardMetrics();
    const health = {
      status: metrics.overview.status,
      uptime: metrics.overview.uptime,
      timestamp: new Date().toISOString(),
      services: {
        mcp_server: metrics.overview.status,
        cache: metrics.cache.hitRate > 0 ? 'healthy' : 'idle',
        memory: parseFloat(metrics.system.memoryUsage.percentage) < 80 ? 'healthy' : 'warning'
      }
    };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(health, null, 2));
  }

  /**
   * Sert une erreur 404
   */
  serve404(res) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Page non trouvée');
  }

  /**
   * Sert une erreur générique
   */
  serveError(res, code, message) {
    res.writeHead(code, { 'Content-Type': 'text/plain' });
    res.end(message);
  }

  /**
   * Génère le HTML du dashboard
   */
  generateDashboardHTML() {
    return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard DSFR-MCP</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f5f5;
            color: #333;
            line-height: 1.6;
        }
        
        .header {
            background: #000091;
            color: white;
            padding: 1rem 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .header h1 {
            font-size: 1.5rem;
            font-weight: 600;
        }
        
        .status-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.875rem;
            font-weight: 500;
        }
        
        .status-healthy { background: #27d545; }
        .status-warning { background: #ffa500; }
        .status-error { background: #ff3333; }
        .status-idle { background: #666; }
        
        .container {
            max-width: 1200px;
            margin: 2rem auto;
            padding: 0 1rem;
        }
        
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }
        
        .card {
            background: white;
            border-radius: 8px;
            padding: 1.5rem;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            border-left: 4px solid #000091;
        }
        
        .card h2 {
            font-size: 1.125rem;
            color: #000091;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .metric {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.75rem;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid #eee;
        }
        
        .metric:last-child {
            margin-bottom: 0;
            border-bottom: none;
        }
        
        .metric-value {
            font-weight: 600;
            color: #000091;
        }
        
        .tools-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 1rem;
        }
        
        .tool-card {
            background: #f8f9fa;
            padding: 1rem;
            border-radius: 6px;
            border: 1px solid #e9ecef;
        }
        
        .tool-name {
            font-weight: 600;
            margin-bottom: 0.5rem;
            font-size: 0.875rem;
        }
        
        .tool-stats {
            font-size: 0.75rem;
            color: #666;
        }
        
        .activity-log {
            max-height: 300px;
            overflow-y: auto;
            background: #f8f9fa;
            padding: 1rem;
            border-radius: 6px;
            font-family: 'Courier New', monospace;
            font-size: 0.75rem;
        }
        
        .activity-item {
            margin-bottom: 0.25rem;
            padding: 0.25rem;
            border-radius: 3px;
        }
        
        .activity-success { background: rgba(39, 213, 69, 0.1); }
        .activity-error { background: rgba(255, 51, 51, 0.1); }
        
        .refresh-info {
            text-align: center;
            color: #666;
            font-size: 0.875rem;
            margin-top: 1rem;
        }
        
        @media (max-width: 768px) {
            .header {
                flex-direction: column;
                gap: 1rem;
            }
            
            .container {
                padding: 0 0.5rem;
            }
            
            .grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🇫🇷 Dashboard DSFR-MCP</h1>
        <div class="status-badge" id="globalStatus">Chargement...</div>
    </div>
    
    <div class="container">
        <div class="grid">
            <!-- Vue d'ensemble -->
            <div class="card">
                <h2>📊 Vue d'ensemble</h2>
                <div id="overview">Chargement des métriques...</div>
            </div>
            
            <!-- Cache -->
            <div class="card">
                <h2>💾 Cache Performance</h2>
                <div id="cache">Chargement...</div>
            </div>
            
            <!-- Système -->
            <div class="card">
                <h2>⚙️ Système</h2>
                <div id="system">Chargement...</div>
            </div>
        </div>
        
        <!-- Outils MCP -->
        <div class="card">
            <h2>🛠️ Outils MCP (16/16)</h2>
            <div class="tools-grid" id="tools">Chargement des outils...</div>
        </div>
        
        <!-- Activité récente -->
        <div class="card">
            <h2>📋 Activité récente</h2>
            <div class="activity-log" id="activity">Chargement de l'activité...</div>
        </div>
        
        <div class="refresh-info">
            Page mise à jour automatiquement toutes les 10 secondes
        </div>
    </div>
    
    <script>
        // Mise à jour des métriques
        async function updateMetrics() {
            try {
                const response = await fetch('/api/metrics');
                const metrics = await response.json();
                
                // Status global
                const statusElement = document.getElementById('globalStatus');
                statusElement.textContent = metrics.overview.status.toUpperCase();
                statusElement.className = 'status-badge status-' + metrics.overview.status;
                
                // Vue d'ensemble
                document.getElementById('overview').innerHTML = \`
                    <div class="metric">
                        <span>Uptime</span>
                        <span class="metric-value">\${metrics.overview.uptime}</span>
                    </div>
                    <div class="metric">
                        <span>Requêtes totales</span>
                        <span class="metric-value">\${metrics.overview.requestsTotal}</span>
                    </div>
                    <div class="metric">
                        <span>Req/min</span>
                        <span class="metric-value">\${metrics.overview.requestsPerMinute}</span>
                    </div>
                    <div class="metric">
                        <span>Taux de succès</span>
                        <span class="metric-value">\${metrics.overview.successRate}%</span>
                    </div>
                    <div class="metric">
                        <span>Temps moyen</span>
                        <span class="metric-value">\${metrics.overview.avgResponseTime}ms</span>
                    </div>
                \`;
                
                // Cache
                document.getElementById('cache').innerHTML = \`
                    <div class="metric">
                        <span>Hit Rate</span>
                        <span class="metric-value">\${metrics.cache.hitRate}</span>
                    </div>
                    <div class="metric">
                        <span>Hits / Misses</span>
                        <span class="metric-value">\${metrics.cache.hits} / \${metrics.cache.misses}</span>
                    </div>
                    <div class="metric">
                        <span>Mémoire utilisée</span>
                        <span class="metric-value">\${metrics.cache.memoryUsage}</span>
                    </div>
                    <div class="metric">
                        <span>Entrées</span>
                        <span class="metric-value">\${metrics.cache.size}</span>
                    </div>
                \`;
                
                // Système
                document.getElementById('system').innerHTML = \`
                    <div class="metric">
                        <span>Heap utilisé</span>
                        <span class="metric-value">\${metrics.system.memoryUsage.used}</span>
                    </div>
                    <div class="metric">
                        <span>Heap total</span>
                        <span class="metric-value">\${metrics.system.memoryUsage.total}</span>
                    </div>
                    <div class="metric">
                        <span>% Mémoire</span>
                        <span class="metric-value">\${metrics.system.memoryUsage.percentage}%</span>
                    </div>
                    <div class="metric">
                        <span>RSS</span>
                        <span class="metric-value">\${metrics.system.rss}</span>
                    </div>
                \`;
                
                // Outils
                const toolsHtml = Object.entries(metrics.tools).map(([name, stats]) => \`
                    <div class="tool-card">
                        <div class="tool-name">\${name}</div>
                        <div class="tool-stats">
                            <div>Utilisations: \${stats.usage}</div>
                            <div>Temps moyen: \${stats.avgResponseTime}ms</div>
                            <div>Erreurs: \${stats.errorRate}%</div>
                            <div>Status: <span class="status-\${stats.status}">\${stats.status}</span></div>
                        </div>
                    </div>
                \`).join('');
                document.getElementById('tools').innerHTML = toolsHtml || '<p>Aucun outil utilisé</p>';
                
                // Activité récente
                const activityHtml = metrics.recentActivity.map(item => \`
                    <div class="activity-item activity-\${item.success ? 'success' : 'error'}">
                        [\${item.timestamp}] \${item.tool} - \${item.responseTime}ms \${item.success ? '✓' : '✗'}
                    </div>
                \`).join('');
                document.getElementById('activity').innerHTML = activityHtml || '<p>Aucune activité récente</p>';
                
            } catch (error) {
                console.error('Erreur lors de la mise à jour:', error);
                document.getElementById('globalStatus').textContent = 'ERREUR';
                document.getElementById('globalStatus').className = 'status-badge status-error';
            }
        }
        
        // Mise à jour initiale
        updateMetrics();
        
        // Mise à jour automatique toutes les 10 secondes
        setInterval(updateMetrics, 10000);
    </script>
</body>
</html>`;
  }

  /**
   * Arrête le serveur dashboard
   */
  async stop() {
    if (this.server) {
      return new Promise((resolve) => {
        this.server.close(() => {
          this.logger?.info('Dashboard arrêté');
          resolve();
        });
      });
    }
  }
}

module.exports = { DashboardService };