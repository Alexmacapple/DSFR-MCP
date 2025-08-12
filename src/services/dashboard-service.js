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
   * Génère le HTML du dashboard conforme DSFR
   */
  generateDashboardHTML() {
    return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard DSFR-MCP - Monitoring Serveur</title>
    
    <!-- CSS DSFR officiel -->
    <link href="https://cdn.jsdelivr.net/npm/@gouvfr/dsfr@1.11.2/dist/dsfr.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/@gouvfr/dsfr@1.11.2/dist/utility/icons/icons.min.css" rel="stylesheet">
    
    <style>
        /* Styles spécifiques pour métriques */
        .metric-card {
            text-align: center;
        }
        
        .metric-value-large {
            font-size: 3rem;
            font-weight: 700;
            line-height: 1;
            margin: 0.5rem 0;
        }
        
        .metric-label {
            color: var(--text-mention-grey);
            font-size: 0.875rem;
            margin-bottom: 0.5rem;
        }
        
        .metric-sublabel {
            color: var(--text-mention-grey);
            font-size: 0.75rem;
        }
        
        .status-success { color: var(--background-flat-success); }
        .status-warning { color: var(--background-flat-warning); }
        .status-error { color: var(--background-flat-error); }
        .status-idle { color: var(--text-mention-grey); }
        
        .tools-table {
            font-size: 0.875rem;
        }
        
        .activity-log {
            max-height: 300px;
            overflow-y: auto;
            font-family: 'Courier New', monospace;
            font-size: 0.75rem;
            background: var(--background-contrast-grey);
            padding: 1rem;
        }
        
        .activity-item {
            margin-bottom: 0.25rem;
            padding: 0.25rem;
        }
        
        .activity-success { 
            background: var(--background-flat-success-light); 
            border-left: 3px solid var(--background-flat-success);
        }
        
        .activity-error { 
            background: var(--background-flat-error-light); 
            border-left: 3px solid var(--background-flat-error);
        }
        
        @media (max-width: 768px) {
            .fr-grid-row--gutters > [class*="fr-col-"] {
                margin-bottom: 1rem;
            }
        }
    </style>
</head>
<body>
    <!-- Header DSFR -->
    <header class="fr-header">
        <div class="fr-header__body">
            <div class="fr-container">
                <div class="fr-header__body-row">
                    <div class="fr-header__brand fr-enlarge-link">
                        <div class="fr-header__brand-top">
                            <div class="fr-header__logo">
                                <p class="fr-logo">
                                    République<br>Française
                                </p>
                            </div>
                        </div>
                        <div class="fr-header__service">
                            <a href="/dashboard" title="Accueil - Dashboard DSFR-MCP">
                                <p class="fr-header__service-title">Dashboard DSFR-MCP</p>
                            </a>
                            <p class="fr-header__service-tagline">Monitoring Serveur Model Context Protocol</p>
                        </div>
                    </div>
                    <div class="fr-header__tools">
                        <div class="fr-header__tools-links">
                            <div class="fr-badge-group">
                                <p class="fr-badge fr-badge--sm" id="globalStatus">
                                    <span class="fr-icon-time-line fr-icon--sm" aria-hidden="true"></span>
                                    Chargement...
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </header>

    <!-- Main Content -->
    <main role="main" id="content">
        <div class="fr-container">
            <!-- Titre de page -->
            <div class="fr-grid-row">
                <div class="fr-col-12">
                    <h1 class="fr-h1 fr-mb-4w">
                        <span class="fr-icon-dashboard-line fr-icon--lg fr-mr-1w" aria-hidden="true"></span>
                        Tableau de bord du serveur
                    </h1>
                </div>
            </div>

            <!-- Métriques principales -->
            <div class="fr-grid-row fr-grid-row--gutters fr-mb-4w">
                <!-- Vue d'ensemble -->
                <div class="fr-col-12 fr-col-md-3">
                    <div class="fr-card fr-card--no-border metric-card">
                        <div class="fr-card__body">
                            <div class="fr-card__content">
                                <h3 class="fr-card__title fr-h6">
                                    <span class="fr-icon-time-line fr-icon--sm fr-mr-1v" aria-hidden="true"></span>
                                    Uptime
                                </h3>
                                <div id="overview-uptime" class="metric-value-large status-idle">--</div>
                                <p class="metric-sublabel" id="overview-requests">-- requêtes totales</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Performance -->
                <div class="fr-col-12 fr-col-md-3">
                    <div class="fr-card fr-card--no-border metric-card">
                        <div class="fr-card__body">
                            <div class="fr-card__content">
                                <h3 class="fr-card__title fr-h6">
                                    <span class="fr-icon-flashlight-line fr-icon--sm fr-mr-1v" aria-hidden="true"></span>
                                    Performance
                                </h3>
                                <div id="overview-avg-time" class="metric-value-large status-idle">-- ms</div>
                                <p class="metric-sublabel" id="overview-req-min">-- req/min</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Succès -->
                <div class="fr-col-12 fr-col-md-3">
                    <div class="fr-card fr-card--no-border metric-card">
                        <div class="fr-card__body">
                            <div class="fr-card__content">
                                <h3 class="fr-card__title fr-h6">
                                    <span class="fr-icon-checkbox-circle-line fr-icon--sm fr-mr-1v" aria-hidden="true"></span>
                                    Succès
                                </h3>
                                <div id="overview-success" class="metric-value-large status-idle">--%</div>
                                <p class="metric-sublabel">Taux de succès</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Cache -->
                <div class="fr-col-12 fr-col-md-3">
                    <div class="fr-card fr-card--no-border metric-card">
                        <div class="fr-card__body">
                            <div class="fr-card__content">
                                <h3 class="fr-card__title fr-h6">
                                    <span class="fr-icon-database-2-line fr-icon--sm fr-mr-1v" aria-hidden="true"></span>
                                    Cache
                                </h3>
                                <div id="cache-hitrate" class="metric-value-large status-idle">--%</div>
                                <p class="metric-sublabel" id="cache-memory">-- mémoire</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Outils MCP -->
            <div class="fr-grid-row fr-mb-4w">
                <div class="fr-col-12">
                    <div class="fr-card">
                        <div class="fr-card__body">
                            <div class="fr-card__content">
                                <h2 class="fr-card__title fr-h4">
                                    <span class="fr-icon-tools-line fr-icon--lg fr-mr-1w" aria-hidden="true"></span>
                                    Outils MCP (16/16)
                                </h2>
                                <div class="fr-table fr-table--bordered">
                                    <table class="tools-table">
                                        <thead>
                                            <tr>
                                                <th scope="col">Outil</th>
                                                <th scope="col">Utilisations</th>
                                                <th scope="col">Temps moyen</th>
                                                <th scope="col">Taux erreur</th>
                                                <th scope="col">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody id="tools">
                                            <tr>
                                                <td colspan="5" class="fr-text--center">
                                                    <span class="fr-icon-loader-3-line fr-icon--sm fr-mr-1v" aria-hidden="true"></span>
                                                    Chargement des outils...
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Système et Activité -->
            <div class="fr-grid-row fr-grid-row--gutters">
                <!-- Système -->
                <div class="fr-col-12 fr-col-md-6">
                    <div class="fr-card">
                        <div class="fr-card__body">
                            <div class="fr-card__content">
                                <h2 class="fr-card__title fr-h5">
                                    <span class="fr-icon-settings-3-line fr-icon--sm fr-mr-1v" aria-hidden="true"></span>
                                    Système
                                </h2>
                                <div id="system">
                                    <div class="fr-grid-row fr-grid-row--gutters">
                                        <div class="fr-col-6">
                                            <p class="fr-text--sm fr-mb-1v">Mémoire utilisée</p>
                                            <p class="fr-text--bold" id="system-memory">Chargement...</p>
                                        </div>
                                        <div class="fr-col-6">
                                            <p class="fr-text--sm fr-mb-1v">RSS</p>
                                            <p class="fr-text--bold" id="system-rss">Chargement...</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Activité récente -->
                <div class="fr-col-12 fr-col-md-6">
                    <div class="fr-card">
                        <div class="fr-card__body">
                            <div class="fr-card__content">
                                <h2 class="fr-card__title fr-h5">
                                    <span class="fr-icon-file-text-line fr-icon--sm fr-mr-1v" aria-hidden="true"></span>
                                    Activité récente
                                </h2>
                                <div class="activity-log" id="activity">
                                    <p class="fr-text--sm">Chargement de l'activité...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Info mise à jour -->
            <div class="fr-grid-row fr-mt-4w">
                <div class="fr-col-12">
                    <div class="fr-notice fr-notice--info">
                        <div class="fr-container">
                            <div class="fr-notice__body">
                                <p class="fr-notice__title">
                                    <span class="fr-icon-refresh-line fr-icon--sm fr-mr-1v" aria-hidden="true"></span>
                                    Page mise à jour automatiquement toutes les 10 secondes
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>
    
    <script>
        // Mise à jour des métriques
        async function updateMetrics() {
            try {
                const response = await fetch('/api/metrics');
                const metrics = await response.json();
                
                // Status global  
                const statusElement = document.getElementById('globalStatus');
                const statusClass = 'fr-badge--' + (metrics.overview.status === 'healthy' ? 'success' : 
                                                   metrics.overview.status === 'warning' ? 'warning' : 
                                                   metrics.overview.status === 'error' ? 'error' : 'info');
                statusElement.className = 'fr-badge fr-badge--sm ' + statusClass;
                statusElement.innerHTML = \`<span class="fr-icon-pulse-line fr-icon--sm" aria-hidden="true"></span> \${metrics.overview.status.toUpperCase()}\`;
                
                // Métriques principales
                document.getElementById('overview-uptime').textContent = metrics.overview.uptime;
                document.getElementById('overview-uptime').className = 'metric-value-large status-' + metrics.overview.status;
                document.getElementById('overview-requests').textContent = \`\${metrics.overview.requestsTotal} requêtes totales\`;
                
                document.getElementById('overview-avg-time').textContent = \`\${metrics.overview.avgResponseTime} ms\`;
                document.getElementById('overview-avg-time').className = 'metric-value-large status-' + (metrics.overview.avgResponseTime < 500 ? 'success' : metrics.overview.avgResponseTime < 1000 ? 'warning' : 'error');
                document.getElementById('overview-req-min').textContent = \`\${metrics.overview.requestsPerMinute} req/min\`;
                
                document.getElementById('overview-success').textContent = \`\${metrics.overview.successRate}%\`;
                document.getElementById('overview-success').className = 'metric-value-large status-' + (parseFloat(metrics.overview.successRate) >= 95 ? 'success' : parseFloat(metrics.overview.successRate) >= 90 ? 'warning' : 'error');
                
                document.getElementById('cache-hitrate').textContent = metrics.cache.hitRate || '0%';
                document.getElementById('cache-hitrate').className = 'metric-value-large status-' + (metrics.cache.hits > 0 ? 'success' : 'idle');
                document.getElementById('cache-memory').textContent = metrics.cache.memoryUsage || '0 B';
                
                // Système
                document.getElementById('system-memory').textContent = \`\${metrics.system.memoryUsage.used} / \${metrics.system.memoryUsage.total} (\${metrics.system.memoryUsage.percentage}%)\`;
                document.getElementById('system-rss').textContent = metrics.system.rss;
                
                // Outils MCP - Table format DSFR
                const toolsHtml = Object.entries(metrics.tools).map(([name, stats]) => {
                    const statusBadge = stats.status === 'healthy' ? 'fr-badge--success' :
                                       stats.status === 'warning' ? 'fr-badge--warning' :
                                       stats.status === 'error' ? 'fr-badge--error' : 'fr-badge--info';
                    
                    return \`
                        <tr>
                            <td class="fr-text--bold">\${name}</td>
                            <td>\${stats.usage}</td>
                            <td>\${stats.avgResponseTime}ms</td>
                            <td>\${stats.errorRate}%</td>
                            <td>
                                <span class="fr-badge fr-badge--sm \${statusBadge}">
                                    \${stats.status}
                                </span>
                            </td>
                        </tr>
                    \`;
                }).join('');
                
                document.getElementById('tools').innerHTML = toolsHtml || \`
                    <tr>
                        <td colspan="5" class="fr-text--center">
                            <span class="fr-icon-information-line fr-icon--sm fr-mr-1v" aria-hidden="true"></span>
                            Aucun outil utilisé
                        </td>
                    </tr>
                \`;
                
                // Activité récente
                const activityHtml = metrics.recentActivity.map(item => \`
                    <div class="activity-item activity-\${item.success ? 'success' : 'error'}">
                        <span class="fr-text--xs fr-text--regular">[\${item.timestamp}]</span>
                        <span class="fr-text--sm fr-text--bold">\${item.tool}</span>
                        <span class="fr-text--xs">- \${item.responseTime}ms</span>
                        <span class="fr-icon-\${item.success ? 'checkbox-circle-line fr-text--success' : 'close-circle-line fr-text--error'} fr-icon--sm" aria-hidden="true"></span>
                    </div>
                \`).join('');
                
                document.getElementById('activity').innerHTML = activityHtml || \`
                    <p class="fr-text--sm">
                        <span class="fr-icon-information-line fr-icon--sm fr-mr-1v" aria-hidden="true"></span>
                        Aucune activité récente
                    </p>
                \`;
                
            } catch (error) {
                console.error('Erreur lors de la mise à jour:', error);
                const statusElement = document.getElementById('globalStatus');
                statusElement.innerHTML = '<span class="fr-icon-error-warning-line fr-icon--sm" aria-hidden="true"></span> ERREUR';
                statusElement.className = 'fr-badge fr-badge--sm fr-badge--error';
            }
        }
        
        // Mise à jour initiale
        updateMetrics();
        
        // Mise à jour automatique toutes les 10 secondes
        setInterval(updateMetrics, 10000);
    </script>
    
    <!-- JS DSFR officiel -->
    <script src="https://cdn.jsdelivr.net/npm/@gouvfr/dsfr@1.11.2/dist/dsfr.module.min.js" type="module"></script>
    <script nomodule src="https://cdn.jsdelivr.net/npm/@gouvfr/dsfr@1.11.2/dist/dsfr.nomodule.min.js"></script>
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