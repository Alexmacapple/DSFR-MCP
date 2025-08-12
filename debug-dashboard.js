#!/usr/bin/env node

// Script de debug pour le dashboard
console.log('🔍 Debug Dashboard DSFR-MCP...');

try {
  console.log('1. Test des imports...');
  const { MetricsService } = require('./src/services/metrics-service.js');
  const { DashboardService } = require('./src/services/dashboard-service.js');
  console.log('✅ Imports OK');

  console.log('2. Test instanciation MetricsService...');
  const metricsService = new MetricsService(console.log);
  console.log('✅ MetricsService créé');

  console.log('3. Test instanciation DashboardService...');
  const dashboardService = new DashboardService(metricsService, console, 3002);
  console.log('✅ DashboardService créé');

  console.log('4. Test démarrage dashboard...');
  dashboardService.start()
    .then(() => {
      console.log('✅ Dashboard démarré sur port 3002');
      console.log('🌐 Test: curl http://localhost:3002/dashboard');
      
      // Tester l'endpoint
      setTimeout(() => {
        const http = require('http');
        const req = http.request('http://localhost:3002/api/health', (res) => {
          console.log('✅ Health check OK:', res.statusCode);
          process.exit(0);
        });
        
        req.on('error', (err) => {
          console.log('❌ Health check error:', err.message);
          process.exit(1);
        });
        
        req.end();
      }, 1000);
    })
    .catch((error) => {
      console.error('❌ Erreur démarrage dashboard:', error.message);
      console.error('Stack:', error.stack);
      process.exit(1);
    });

} catch (error) {
  console.error('❌ Erreur critique:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}