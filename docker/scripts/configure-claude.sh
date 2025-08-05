#!/bin/bash

# ==============================================
# Script de configuration automatique Claude Desktop
# Pour DSFR-MCP en mode Docker
# ==============================================

set -euo pipefail

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
CONTAINER_NAME="dsfr-mcp-server"

echo -e "${BLUE}🐳 Configuration automatique de DSFR-MCP Docker pour Claude Desktop${NC}"
echo "============================================================================="

# Fonction d'aide
show_help() {
    cat << EOF
Usage: $0 [OPTIONS]

Options:
    -h, --help     Afficher cette aide
    -m, --mode     Mode de fonctionnement (stdio|tcp) [défaut: stdio]
    -p, --port     Port pour le mode TCP [défaut: 3000]
    --dev          Utiliser le mode développement
    --stop         Arrêter les containers
    --logs         Afficher les logs

Exemples:
    $0                    # Configuration standard (mode stdio)
    $0 --mode tcp -p 3001 # Mode TCP sur port 3001
    $0 --dev              # Mode développement
    $0 --stop             # Arrêter les services
    $0 --logs             # Voir les logs
EOF
}

# Variables par défaut
MODE="stdio"
PORT="3000"
DEV_MODE=false
STOP_SERVICES=false
SHOW_LOGS=false

# Parse des arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -m|--mode)
            MODE="$2"
            shift 2
            ;;
        -p|--port)
            PORT="$2"
            shift 2
            ;;
        --dev)
            DEV_MODE=true
            shift
            ;;
        --stop)
            STOP_SERVICES=true
            shift
            ;;
        --logs)
            SHOW_LOGS=true
            shift
            ;;
        *)
            echo -e "${RED}❌ Option inconnue: $1${NC}"
            show_help
            exit 1
            ;;
    esac
done

# Fonction pour arrêter les services
stop_services() {
    echo -e "${YELLOW}🛑 Arrêt des services DSFR-MCP...${NC}"
    cd "$PROJECT_DIR"
    docker-compose down
    echo -e "${GREEN}✅ Services arrêtés${NC}"
}

# Fonction pour afficher les logs
show_logs() {
    echo -e "${BLUE}📝 Logs DSFR-MCP...${NC}"
    cd "$PROJECT_DIR"
    docker-compose logs -f dsfr-mcp
}

# Actions spéciales
if [[ "$STOP_SERVICES" == true ]]; then
    stop_services
    exit 0
fi

if [[ "$SHOW_LOGS" == true ]]; then
    show_logs
    exit 0
fi

# Vérifications préalables
echo -e "${BLUE}🔍 Vérifications préalables...${NC}"

# Vérifier Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker n'est pas installé. Veuillez l'installer d'abord.${NC}"
    exit 1
fi

# Vérifier Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose n'est pas installé. Veuillez l'installer d'abord.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker et Docker Compose sont installés${NC}"

# Détection de l'OS
if [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
    CLAUDE_CONFIG_DIR="$HOME/Library/Application Support/Claude"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
    CLAUDE_CONFIG_DIR="$HOME/.config/claude"
else
    echo -e "${RED}❌ OS non supporté: $OSTYPE${NC}"
    exit 1
fi

echo -e "${GREEN}✅ OS détecté: $OS${NC}"

# Build et démarrage des containers
echo -e "${BLUE}🔨 Build et démarrage des containers...${NC}"
cd "$PROJECT_DIR"

if [[ "$DEV_MODE" == true ]]; then
    echo -e "${YELLOW}🚀 Mode développement activé${NC}"
    docker-compose --profile dev up --build -d dsfr-mcp-dev
    CONTAINER_NAME="dsfr-mcp-dev"
else
    docker-compose up --build -d dsfr-mcp
fi

# Attendre que le container soit prêt
echo -e "${BLUE}⏳ Attente du démarrage du container...${NC}"
sleep 5

# Vérifier que le container fonctionne
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo -e "${RED}❌ Le container $CONTAINER_NAME ne fonctionne pas${NC}"
    echo "Logs du container :"
    docker logs "$CONTAINER_NAME"
    exit 1
fi

echo -e "${GREEN}✅ Container $CONTAINER_NAME démarré avec succès${NC}"

# Configuration de Claude Desktop
echo -e "${BLUE}⚙️ Configuration de Claude Desktop...${NC}"

# Créer le répertoire de config s'il n'existe pas
mkdir -p "$CLAUDE_CONFIG_DIR"

# Générer la configuration selon le mode
if [[ "$MODE" == "tcp" ]]; then
    # Mode TCP - communication réseau
    CONFIG_CONTENT=$(cat << EOF
{
  "mcpServers": {
    "dsfr-documentation": {
      "command": "docker",
      "args": ["exec", "-i", "$CONTAINER_NAME", "node", "src/index.js"],
      "env": {
        "MCP_MODE": "tcp",
        "PORT": "$PORT"
      }
    }
  }
}
EOF
)
else
    # Mode stdio - communication directe (défaut)
    CONFIG_CONTENT=$(cat << EOF
{
  "mcpServers": {
    "dsfr-documentation": {
      "command": "docker",
      "args": ["exec", "-i", "$CONTAINER_NAME", "node", "src/index.js"],
      "env": {}
    }
  }
}
EOF
)
fi

# Sauvegarder la configuration
echo "$CONFIG_CONTENT" > "$CLAUDE_CONFIG_DIR/claude_desktop_config.json"

echo -e "${GREEN}✅ Configuration Claude Desktop créée${NC}"
echo -e "${BLUE}📍 Fichier: $CLAUDE_CONFIG_DIR/claude_desktop_config.json${NC}"

# Afficher les informations finales
echo ""
echo -e "${GREEN}🎉 Configuration terminée avec succès !${NC}"
echo "============================================================================="
echo -e "${BLUE}Container:${NC} $CONTAINER_NAME"
echo -e "${BLUE}Mode:${NC} $MODE"
if [[ "$MODE" == "tcp" ]]; then
    echo -e "${BLUE}Port:${NC} $PORT"
fi
echo -e "${BLUE}Status:${NC} $(docker ps --filter name=$CONTAINER_NAME --format 'table {{.Status}}')"
echo ""
echo -e "${YELLOW}📝 Prochaines étapes :${NC}"
echo "1. Redémarrez Claude Desktop complètement (Cmd+Q puis relancer)"
echo "2. Vérifiez la présence de l'icône 🔧 en bas de Claude"
echo "3. Testez avec: 'Recherche les composants DSFR qui contiennent \"button\"'"
echo ""
echo -e "${BLUE}🔧 Commandes utiles :${NC}"
echo "  $0 --logs          # Voir les logs"
echo "  $0 --stop          # Arrêter les services"
echo "  docker ps          # Voir les containers actifs"
echo ""