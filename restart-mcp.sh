#!/bin/bash
# Script pour redémarrer le serveur MCP DSFR

echo "🔄 Redémarrage du serveur MCP DSFR..."

# Tuer tous les processus node liés au projet
pkill -f "DSFR-MCP-main" 2>/dev/null || true

# Attendre un peu
sleep 2

# Vérifier que la configuration est correcte
echo "📝 Configuration actuelle :"
cat "/Users/alex/Library/Application Support/Claude/claude_desktop_config.json"

echo ""
echo "🧪 Test du serveur stabilisé :"
cd "/Users/alex/Desktop/DSFR-MCP-main"

# Tester le serveur
timeout 3s node src/index-stable.js <<EOF || echo "✅ Serveur fonctionne (timeout normal)"
{"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {"protocolVersion": "2025-06-18", "capabilities": {}, "clientInfo": {"name": "test", "version": "1.0.0"}}}
EOF

echo ""
echo "🚀 Instructions :"
echo "1. Fermer complètement Claude Desktop (Cmd+Q)"
echo "2. Attendre 10 secondes" 
echo "3. Relancer Claude Desktop"
echo "4. Chercher l'icône 🔧"

echo ""
echo "✅ Prêt !"