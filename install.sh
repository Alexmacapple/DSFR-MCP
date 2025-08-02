#!/bin/bash

# Script d'installation automatique pour DSFR-MCP
# Ce script installe et configure automatiquement le serveur MCP DSFR

set -e  # Arrêter en cas d'erreur

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logo et titre
echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║     🇫🇷  DSFR-MCP Installation Automatique  🇫🇷             ║"
echo "║                                                           ║"
echo "║     Serveur MCP pour le Système de Design de l'État      ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# Fonction pour afficher les messages
print_step() {
    echo -e "${BLUE}➤${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Vérifier les prérequis
print_step "Vérification des prérequis..."

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js n'est pas installé !"
    echo "Veuillez installer Node.js version 18 ou supérieure depuis https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version $NODE_VERSION détectée. Version 18+ requise."
    exit 1
fi
print_success "Node.js $(node -v) détecté"

# Vérifier npm
if ! command -v npm &> /dev/null; then
    print_error "npm n'est pas installé !"
    exit 1
fi
print_success "npm $(npm -v) détecté"

# Obtenir le chemin absolu du projet
PROJECT_PATH=$(pwd)
print_success "Chemin du projet : $PROJECT_PATH"

# Installation des dépendances
print_step "Installation des dépendances npm..."
npm install
if [ $? -eq 0 ]; then
    print_success "Dépendances installées avec succès"
else
    print_error "Erreur lors de l'installation des dépendances"
    exit 1
fi

# Créer le fichier .env si nécessaire
if [ ! -f ".env" ]; then
    print_step "Création du fichier .env..."
    cat > .env << EOF
# Configuration DSFR-MCP
NODE_ENV=production
LOG_LEVEL=info
AUTO_INDEX_UPDATE=true
INDEX_UPDATE_INTERVAL=3600000
EOF
    print_success "Fichier .env créé"
else
    print_warning "Fichier .env existant conservé"
fi

# Créer les dossiers nécessaires
print_step "Création des dossiers manquants..."
mkdir -p data
mkdir -p test/unit/services
mkdir -p test/integration
mkdir -p src/templates
mkdir -p scripts
mkdir -p docs
print_success "Structure de dossiers créée"

# Tester l'installation
print_step "Test de l'installation..."
npm run test:mcp
if [ $? -eq 0 ]; then
    print_success "Tests réussis !"
else
    print_error "Les tests ont échoué"
    exit 1
fi

# Détecter le système d'exploitation
OS="unknown"
if [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
    CONFIG_PATH="$HOME/Library/Application Support/Claude/claude_desktop_config.json"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "win32" ]]; then
    OS="windows"
    CONFIG_PATH="$APPDATA/Claude/claude_desktop_config.json"
else
    OS="linux"
    CONFIG_PATH="$HOME/.config/Claude/claude_desktop_config.json"
fi

print_success "Système détecté : $OS"

# Configuration Claude Desktop
echo ""
print_step "Configuration pour Claude Desktop"
echo ""
echo "Ajoutez la configuration suivante dans votre fichier :"
echo -e "${YELLOW}$CONFIG_PATH${NC}"
echo ""
echo -e "${GREEN}{
  \"mcpServers\": {
    \"dsfr-documentation\": {
      \"command\": \"node\",
      \"args\": [\"src/index.js\"],
      \"cwd\": \"$PROJECT_PATH\"
    }
  }
}${NC}"
echo ""

# Proposer d'ouvrir automatiquement le fichier de config
if [[ "$OS" == "macos" ]]; then
    read -p "Voulez-vous ouvrir le dossier de configuration Claude ? (o/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Oo]$ ]]; then
        open "$HOME/Library/Application Support/Claude/"
    fi
fi

# Instructions finales
echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                           ║${NC}"
echo -e "${GREEN}║               Installation terminée ! 🎉                   ║${NC}"
echo -e "${GREEN}║                                                           ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "Prochaines étapes :"
echo "1. Copiez la configuration ci-dessus dans claude_desktop_config.json"
echo "2. Redémarrez Claude Desktop"
echo "3. Vérifiez que l'icône 🔧 apparaît dans Claude"
echo ""
echo "Pour démarrer le serveur manuellement :"
echo -e "${BLUE}npm start${NC}"
echo ""
echo "Pour plus d'aide, consultez :"
echo -e "${BLUE}cat GUIDE_INSTALLATION_MCP_CLAUDE.md${NC}"
echo ""
print_success "Bonne utilisation du DSFR-MCP !"
