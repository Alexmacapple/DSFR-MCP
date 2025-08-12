/**
 * Service Dashboard pour exposition des métriques via HTTP
 * Fournit une interface web simple pour monitoring DSFR-MCP
 */

const http = require('http');
const url = require('url');

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
  async handleRequest(req, res) {
    // Validation de l'URL
    if (!req.url) {
      this.logger?.error('Requête sans URL');
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Bad Request: URL manquante');
      return;
    }

    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname || '';

    this.logger?.info(`${req.method} ${pathname}`);

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    try {
      if (pathname === '/dashboard' || pathname === '/') {
        this.serveDashboard(res);
      } else if (pathname === '/playground') {
        this.servePlayground(res);
      } else if (pathname === '/api/metrics') {
        this.serveMetrics(res);
      } else if (pathname === '/api/health') {
        this.serveHealth(res);
      } else if (pathname.startsWith('/api/tools/')) {
        await this.handleToolAPI(req, res, pathname);
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
   * Sert le playground interactif
   */
  servePlayground(res) {
    const fs = require('fs');
    const path = require('path');
    
    try {
      const playgroundPath = path.join(process.cwd(), 'public', 'playground.html');
      const html = fs.readFileSync(playgroundPath, 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
    } catch (error) {
      this.logger?.error('Erreur chargement playground:', error);
      this.serveError(res, 500, 'Playground non disponible');
    }
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
        memory: parseFloat(metrics.system.memoryUsage.percentage) < 80 ? 'healthy' : 'warning',
      },
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
        /* Styles spécifiques pour cartes métriques DSFR */
        .fr-card--sm .fr-card__content {
            text-align: center;
        }
        
        .fr-card--sm .fr-display--lg {
            font-size: 2.5rem;
            font-weight: 700;
            line-height: 1.2;
            margin: 0.5rem 0;
        }
        
        .fr-card--sm .fr-text--lead {
            font-size: 1.5rem;
            font-weight: 600;
            line-height: 1.3;
            margin: 0.5rem 0;
        }
        
        .fr-card__detail {
            color: var(--text-mention-grey);
            font-size: 0.875rem;
            margin-bottom: 0.5rem;
            font-weight: 500;
        }
        
        .status-success { color: var(--background-flat-success); }
        .status-warning { color: var(--background-flat-warning); }
        .status-error { color: var(--background-flat-error); }
        .status-idle { color: var(--text-mention-grey); }
        .status-uniform { color: var(--text-default-grey); }
        
        .tools-table-full {
            font-size: 0.875rem;
            width: 100% !important;
            border-collapse: collapse !important;
            table-layout: auto !important;
            min-width: 100% !important;
        }
        
        .tools-table-full td {
            padding: 0.75rem !important;
            border: 1px solid var(--border-default-grey) !important;
            vertical-align: top !important;
        }
        
        .tools-table-full th {
            font-weight: 600 !important;
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

    <!-- Fil d'Ariane -->
    <nav role="navigation" class="fr-breadcrumb" aria-label="vous êtes ici :">
        <div class="fr-container">
            <button class="fr-breadcrumb__button" aria-expanded="false" aria-controls="breadcrumb-dashboard">
                Voir le fil d'Ariane
            </button>
            <div class="fr-collapse" id="breadcrumb-dashboard">
                <ol class="fr-breadcrumb__list">
                    <li>
                        <span class="fr-breadcrumb__link" aria-current="page">Outils</span>
                    </li>
                    <li>
                        <a class="fr-breadcrumb__link" href="/playground">Playground</a>
                    </li>
                    <li>
                        <span class="fr-breadcrumb__link">Dashboard</span>
                    </li>
                </ol>
            </div>
        </div>
    </nav>

    <!-- Main Content -->
    <main role="main" id="content">
        <div class="fr-container">
            <!-- Titre de page -->
            <div class="fr-grid-row fr-mb-4v">
                <div class="fr-col-12">
                    <h1 class="fr-h1">
                        Tableau de bord du serveur MCP
                    </h1>
                </div>
            </div>

            <!-- Bandeau d'information DSFR -->
            <div class="fr-grid-row fr-mb-6v">
                <div class="fr-col-12">
                    <div class="fr-alert fr-alert--info">
                        <h3 class="fr-alert__title">Information</h3>
                        <p>Page mise à jour automatiquement toutes les 10 secondes</p>
                    </div>
                </div>
            </div>

            <!-- Section Chiffres clés -->
            <div class="fr-grid-row fr-mb-4v">
                <div class="fr-col-12">
                    <h2 class="fr-h3 fr-mb-6v">
                        Métriques principales
                    </h2>
                </div>
            </div>
            
            <!-- Première ligne : Métriques principales -->
            <div class="fr-grid-row fr-grid-row--gutters fr-mb-6v">
                <!-- Uptime -->
                <div class="fr-col-12 fr-col-sm-6 fr-col-md-3">
                    <div class="fr-card fr-card--sm fr-card--grey fr-card--no-icon">
                        <div class="fr-card__body">
                            <div class="fr-card__content">
                                <p class="fr-card__detail">Temps de fonctionnement</p>
                                <h3 class="fr-card__title">
                                    <span class="fr-display--lg" id="overview-uptime">--</span>
                                </h3>
                                <p class="fr-card__desc fr-text--sm" id="overview-requests">
                                    -- requêtes totales
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Performance -->
                <div class="fr-col-12 fr-col-sm-6 fr-col-md-3">
                    <div class="fr-card fr-card--sm fr-card--grey fr-card--no-icon">
                        <div class="fr-card__body">
                            <div class="fr-card__content">
                                <p class="fr-card__detail">Temps de réponse moyen</p>
                                <h3 class="fr-card__title">
                                    <span class="fr-display--lg" id="overview-avg-time">-- ms</span>
                                </h3>
                                <p class="fr-card__desc fr-text--sm" id="overview-req-min">
                                    -- req/min
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Taux de réussite -->
                <div class="fr-col-12 fr-col-sm-6 fr-col-md-3">
                    <div class="fr-card fr-card--sm fr-card--grey fr-card--no-icon">
                        <div class="fr-card__body">
                            <div class="fr-card__content">
                                <p class="fr-card__detail">Taux de réussite</p>
                                <h3 class="fr-card__title">
                                    <span class="fr-display--lg" id="overview-success">--%</span>
                                </h3>
                                <p class="fr-card__desc fr-text--sm">
                                    Opérations réussies
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Efficacité du cache -->
                <div class="fr-col-12 fr-col-sm-6 fr-col-md-3">
                    <div class="fr-card fr-card--sm fr-card--grey fr-card--no-icon">
                        <div class="fr-card__body">
                            <div class="fr-card__content">
                                <p class="fr-card__detail">Efficacité du cache</p>
                                <h3 class="fr-card__title">
                                    <span class="fr-display--lg" id="cache-hitrate">--%</span>
                                </h3>
                                <p class="fr-card__desc fr-text--sm" id="cache-memory">
                                    -- mémoire utilisée
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Deuxième ligne : Métriques système -->
            <div class="fr-grid-row fr-grid-row--gutters fr-mb-8v">
                <!-- Carte Mémoire -->
                <div class="fr-col-12 fr-col-sm-6 fr-col-md-6">
                    <div class="fr-card fr-card--sm fr-card--grey fr-card--no-icon">
                        <div class="fr-card__body">
                            <div class="fr-card__content">
                                <p class="fr-card__detail">Mémoire utilisée</p>
                                <h3 class="fr-card__title">
                                    <span class="fr-text--lead" id="system-memory-used">--</span>
                                </h3>
                                <p class="fr-card__desc fr-text--sm" id="system-memory-total">
                                    sur -- total
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Carte RSS -->
                <div class="fr-col-12 fr-col-sm-6 fr-col-md-6">
                    <div class="fr-card fr-card--sm fr-card--grey fr-card--no-icon">
                        <div class="fr-card__body">
                            <div class="fr-card__content">
                                <p class="fr-card__detail">Mémoire RSS</p>
                                <h3 class="fr-card__title">
                                    <span class="fr-text--lead" id="system-rss-value">--</span>
                                </h3>
                                <p class="fr-card__desc fr-text--sm">
                                    Mémoire résidente
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Section Détails techniques (bloc 100%) -->
            <div class="fr-grid-row fr-mb-4v">
                <div class="fr-col-12">
                    <h2 class="fr-h3 fr-mb-6v">
                        Détails techniques - outils MCP (16)
                    </h2>
                </div>
            </div>
            
            <div class="fr-grid-row fr-mb-8v">
                <div class="fr-col-12" style="padding: 0;">
                    <div style="width: 100%; background: white; border: 1px solid var(--border-default-grey); border-radius: 0.25rem; box-shadow: 0 2px 6px 0 rgba(0, 0, 18, 0.16); overflow: hidden;">
                        <div style="padding: 1rem; margin: 0; width: calc(100% - 2rem);">
                            <div style="width: 100%; overflow-x: auto; margin: 0; padding: 0;">
                                <table class="tools-table-full" style="width: 100%; border-collapse: collapse; table-layout: auto; min-width: 100%;">
                                    <thead style="background: var(--background-alt-grey);">
                                        <tr>
                                            <th scope="col" style="padding: 0.75rem; text-align: left; border: 1px solid var(--border-default-grey); width: 30%;">Outil</th>
                                            <th scope="col" style="padding: 0.75rem; text-align: left; border: 1px solid var(--border-default-grey); width: 15%;">Usage</th>
                                            <th scope="col" style="padding: 0.75rem; text-align: left; border: 1px solid var(--border-default-grey); width: 20%;">Temps moyen</th>
                                            <th scope="col" style="padding: 0.75rem; text-align: left; border: 1px solid var(--border-default-grey); width: 15%;">Taux erreur</th>
                                            <th scope="col" style="padding: 0.75rem; text-align: left; border: 1px solid var(--border-default-grey); width: 20%;">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody id="tools">
                                        <tr>
                                            <td colspan="5" style="padding: 1rem; text-align: center; border: 1px solid var(--border-default-grey);">
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

            <!-- Section Activité récente (bloc 100%) -->
            <div class="fr-grid-row fr-mb-4v">
                <div class="fr-col-12">
                    <h2 class="fr-h3 fr-mb-6v">
                        Activité récente
                    </h2>
                </div>
            </div>
            
            <div class="fr-grid-row fr-mb-8v">
                <div class="fr-col-12">
                    <div class="fr-card fr-card--shadow">
                        <div class="fr-card__body">
                            <div class="fr-card__content">
                                <div class="activity-log" id="activity">
                                    <p class="fr-text--sm">Chargement de l'activité...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </main>
    
    <!-- Footer DSFR -->
    <footer class="fr-footer" role="contentinfo" id="footer-dashboard">
        <div class="fr-container">
            <div class="fr-footer__body">
                <div class="fr-footer__brand fr-enlarge-link">
                    <a title="Retour à l'accueil du site - Dashboard DSFR-MCP" href="/">
                        <p class="fr-logo">
                            République<br>Française
                        </p>
                    </a>
                </div>
                <div class="fr-footer__content">
                    <p class="fr-footer__content-desc">
                        Dashboard de monitoring - Service de surveillance et d'analyse des performances en temps réel pour le serveur MCP DSFR.
                    </p>
                    <ul class="fr-footer__content-list">
                        <li class="fr-footer__content-item">
                            <a title="info.gouv.fr - nouvelle fenêtre" href="https://info.gouv.fr" target="_blank" rel="noopener external" class="fr-footer__content-link">info.gouv.fr</a>
                        </li>
                        <li class="fr-footer__content-item">
                            <a title="service-public.fr - nouvelle fenêtre" href="https://service-public.fr" target="_blank" rel="noopener external" class="fr-footer__content-link">service-public.fr</a>
                        </li>
                        <li class="fr-footer__content-item">
                            <a title="legifrance.gouv.fr - nouvelle fenêtre" href="https://legifrance.gouv.fr" target="_blank" rel="noopener external" class="fr-footer__content-link">legifrance.gouv.fr</a>
                        </li>
                        <li class="fr-footer__content-item">
                            <a title="data.gouv.fr - nouvelle fenêtre" href="https://data.gouv.fr" target="_blank" rel="noopener external" class="fr-footer__content-link">data.gouv.fr</a>
                        </li>
                    </ul>
                </div>
            </div>
            <div class="fr-footer__bottom">
                <div class="fr-footer__bottom-copy">
                    <p>Sauf mention explicite de propriété intellectuelle détenue par des tiers, les contenus de ce site sont proposés sous 
                    <a href="https://github.com/etalab/licence-ouverte/blob/master/LO.md" target="_blank" rel="noopener external" title="Licence etalab - nouvelle fenêtre">licence etalab-2.0</a>
                    </p>
                </div>
            </div>
        </div>
    </footer>
    
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
                const statusText = metrics.overview.status === 'healthy' ? 'OPÉRATIONNEL' :
                                  metrics.overview.status === 'warning' ? 'ATTENTION' :
                                  metrics.overview.status === 'error' ? 'ERREUR' : 'INACTIF';
                statusElement.innerHTML = statusText;
                
                // Métriques principales avec cartes DSFR - couleur uniforme
                document.getElementById('overview-uptime').textContent = metrics.overview.uptime;
                document.getElementById('overview-uptime').className = 'fr-display--lg status-uniform';
                document.getElementById('overview-requests').textContent = \`\${metrics.overview.requestsTotal} requêtes totales\`;
                
                document.getElementById('overview-avg-time').textContent = \`\${metrics.overview.avgResponseTime}\`;
                document.getElementById('overview-avg-time').className = 'fr-display--lg status-uniform';
                document.getElementById('overview-req-min').textContent = \`\${metrics.overview.requestsPerMinute} req/min\`;
                
                document.getElementById('overview-success').textContent = \`\${metrics.overview.successRate}\`;
                document.getElementById('overview-success').className = 'fr-display--lg status-uniform';
                
                // Corriger l'affichage du cache - gérer le cas hitRate = 0
                const cacheHitRate = typeof metrics.cache.hitRate === 'number' ? 
                    metrics.cache.hitRate.toFixed(1) + '%' : 
                    (metrics.cache.hitRate || '0%');
                document.getElementById('cache-hitrate').textContent = cacheHitRate;
                document.getElementById('cache-hitrate').className = 'fr-display--lg status-uniform';
                document.getElementById('cache-memory').textContent = metrics.cache.memoryUsage || '0 B';
                
                // Système avec cartes
                document.getElementById('system-memory-used').textContent = metrics.system.memoryUsage.used;
                document.getElementById('system-memory-total').textContent = \`sur \${metrics.system.memoryUsage.total} (\${metrics.system.memoryUsage.percentage}%)\`;
                document.getElementById('system-rss-value').textContent = metrics.system.rss;
                
                // Outils MCP - Table format DSFR
                const toolsHtml = Object.entries(metrics.tools).map(([name, stats]) => {
                    const statusBadge = stats.status === 'healthy' ? 'fr-badge--success' :
                                       stats.status === 'warning' ? 'fr-badge--warning' :
                                       stats.status === 'error' ? 'fr-badge--error' : 'fr-badge--info';
                    
                    const statusTextFr = stats.status === 'healthy' ? 'Opérationnel' :
                                        stats.status === 'warning' ? 'Attention' :
                                        stats.status === 'error' ? 'Erreur' : 'Inactif';
                    
                    return \`
                        <tr>
                            <td style="padding: 0.75rem; border: 1px solid var(--border-default-grey); font-weight: 600;">\${name}</td>
                            <td style="padding: 0.75rem; border: 1px solid var(--border-default-grey);">\${stats.usage}</td>
                            <td style="padding: 0.75rem; border: 1px solid var(--border-default-grey);">\${stats.avgResponseTime}ms</td>
                            <td style="padding: 0.75rem; border: 1px solid var(--border-default-grey);">\${stats.errorRate}%</td>
                            <td style="padding: 0.75rem; border: 1px solid var(--border-default-grey);">
                                <span class="fr-badge fr-badge--sm \${statusBadge}">
                                    \${statusTextFr}
                                </span>
                            </td>
                        </tr>
                    \`;
                }).join('');
                
                document.getElementById('tools').innerHTML = toolsHtml || \`
                    <tr>
                        <td colspan="5" style="padding: 1rem; text-align: center; border: 1px solid var(--border-default-grey);">
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
                        <span class="fr-text--\${item.success ? 'success' : 'error'}">[\${item.success ? '✓' : '✗'}]</span>
                    </div>
                \`).join('');
                
                document.getElementById('activity').innerHTML = activityHtml || \`
                    <p class="fr-text--sm">
                        Aucune activité récente
                    </p>
                \`;
                
            } catch (error) {
                console.error('Erreur lors de la mise à jour:', error);
                const statusElement = document.getElementById('globalStatus');
                statusElement.innerHTML = 'ERREUR';
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
   * Gère les appels API REST vers les outils MCP
   */
  async handleToolAPI(req, res, pathname) {
    // Validation du pathname et extraction du toolName
    if (!pathname || typeof pathname !== 'string') {
      this.serveError(res, 400, 'Pathname invalide');
      return;
    }
    
    const pathParts = pathname.split('/api/tools/');
    if (pathParts.length < 2 || !pathParts[1]) {
      this.serveError(res, 400, 'Nom d\'outil manquant dans l\'URL');
      return;
    }
    
    const toolName = pathParts[1];
    this.logger?.info(`API Tool appelé: ${toolName}`);
    
    // CORS pour API publique
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }
    
    if (req.method !== 'POST') {
      this.serveError(res, 405, 'Méthode non autorisée. Utilisez POST.');
      return;
    }
    
    try {
      // Lire le body de la requête
      this.logger?.info(`Lecture du body pour l'outil: ${toolName}`);
      const body = await this.readRequestBody(req);
      this.logger?.info(`Body reçu (${body.length} chars): ${body.substring(0, 200)}...`);
      
      let params = {};
      if (body) {
        try {
          params = JSON.parse(body);
          this.logger?.info(`Paramètres parsés:`, params);
        } catch (parseError) {
          this.logger?.error(`Erreur parsing JSON: ${parseError.message}`);
          throw new Error(`Format JSON invalide: ${parseError.message}`);
        }
      }
      
      // Simuler l'appel d'outil MCP (à connecter au vrai serveur MCP)
      this.logger?.info(`Appel simulateToolCall pour: ${toolName}`);
      const result = await this.simulateToolCall(toolName, params);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        tool: toolName,
        result: result,
        timestamp: new Date().toISOString(),
        response_time: Math.floor(Math.random() * 100) + 50 // Simulation
      }, null, 2));
      
    } catch (error) {
      this.logger?.error('Erreur API tool:', error);
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }, null, 2));
    }
  }

  /**
   * Lit le body d'une requête HTTP
   */
  readRequestBody(req) {
    return new Promise((resolve, reject) => {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        resolve(body);
      });
      req.on('error', reject);
    });
  }

  /**
   * Simulation d'appel d'outil MCP
   */
  async simulateToolCall(toolName, params) {
    // Simulation réaliste basée sur le nom de l'outil
    const responses = {
      'search_dsfr_components': {
        query: params.query,
        results: [
          {
            name: 'fr-btn',
            category: 'actions',
            description: 'Bouton standard DSFR',
            classes: ['fr-btn', 'fr-btn--primary', 'fr-btn--secondary'],
            example: '<button class="fr-btn fr-btn--primary">Mon bouton</button>'
          },
          {
            name: 'fr-card',
            category: 'layout',
            description: 'Carte de contenu DSFR',
            classes: ['fr-card', 'fr-card__body', 'fr-card__title'],
            example: '<div class="fr-card"><div class="fr-card__body"><h3 class="fr-card__title">Titre</h3></div></div>'
          }
        ],
        total: 2,
        limit: params.limit || 10
      },
      
      'generate_dsfr_component': {
        component_type: params.component_type,
        framework: params.framework || 'vanilla',
        code: this.generateSampleCode(params.component_type, params.framework),
        files: [
          `${params.component_type}.${params.framework === 'typescript' ? 'tsx' : 'js'}`,
          `${params.component_type}.css`,
          `${params.component_type}.test.js`
        ],
        features: ['accessibility', 'responsive', 'typescript-ready']
      },
      
      'validate_dsfr_html': {
        valid: Math.random() > 0.3,
        score: Math.floor(Math.random() * 40) + 60,
        issues: [
          {
            type: 'warning',
            message: 'Attribut aria-label manquant pour l\'accessibilité',
            line: 1,
            severity: 'medium'
          }
        ],
        suggestions: [
          'Ajouter des attributs ARIA appropriés',
          'Vérifier la hiérarchie des titres',
          'S\'assurer que tous les liens ont un contexte'
        ]
      },
      
      'create_dsfr_theme': {
        theme_name: params.theme_name,
        primary_color: params.primary_color,
        generated_colors: {
          primary: params.primary_color,
          'primary-hover': this.darkenColor(params.primary_color, 10),
          'primary-active': this.darkenColor(params.primary_color, 20)
        },
        css_file: `:root {\n  --color-primary: ${params.primary_color};\n  --color-primary-hover: ${this.darkenColor(params.primary_color, 10)};\n}`,
        scss_file: `$primary: ${params.primary_color};\n@import 'dsfr/mixins';`
      }
    };

    return responses[toolName] || {
      tool: toolName,
      params: params,
      message: `Outil ${toolName} exécuté avec succès`,
      simulated: true
    };
  }

  /**
   * Génère du code d'exemple
   */
  generateSampleCode(componentType, framework = 'vanilla') {
    const codes = {
      vanilla: {
        button: '<button class="fr-btn fr-btn--primary" type="button">Mon bouton</button>',
        card: '<div class="fr-card"><div class="fr-card__body"><h3 class="fr-card__title">Titre de la carte</h3><p class="fr-card__desc">Description de la carte</p></div></div>',
        form: '<form class="fr-form"><div class="fr-input-group"><label class="fr-label" for="input">Label</label><input class="fr-input" type="text" id="input"></div></form>'
      },
      react: {
        button: `import React from 'react';\n\nconst Button = ({ children, variant = 'primary' }) => {\n  return (\n    <button className={\`fr-btn fr-btn--\${variant}\`} type="button">\n      {children}\n    </button>\n  );\n};\n\nexport default Button;`,
        card: `import React from 'react';\n\nconst Card = ({ title, description }) => {\n  return (\n    <div className="fr-card">\n      <div className="fr-card__body">\n        <h3 className="fr-card__title">{title}</h3>\n        <p className="fr-card__desc">{description}</p>\n      </div>\n    </div>\n  );\n};\n\nexport default Card;`
      }
    };

    return codes[framework]?.[componentType] || codes.vanilla[componentType] || `<!-- Composant ${componentType} pour ${framework} -->`;
  }

  /**
   * Assombrit une couleur (simulation)
   */
  darkenColor(color, percent) {
    // Validation de la couleur
    if (!color || typeof color !== 'string') {
      return '#0078f3'; // Couleur par défaut DSFR
    }
    
    // Simulation simple - en prod, utiliser une vraie lib de couleurs
    if (color.startsWith('#')) {
      const num = parseInt(color.replace('#', ''), 16);
      const amt = Math.round(2.55 * percent);
      const R = (num >> 16) - amt;
      const G = (num >> 8 & 0x00FF) - amt;
      const B = (num & 0x0000FF) - amt;
      return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }
    return color;
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
