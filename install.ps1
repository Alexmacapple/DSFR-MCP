# Script d'installation automatique pour DSFR-MCP (Windows)
# Ce script installe et configure automatiquement le serveur MCP DSFR

# Définir les couleurs
$Host.UI.RawUI.BackgroundColor = "Black"
$Host.UI.RawUI.ForegroundColor = "White"
Clear-Host

# Logo et titre
Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Blue
Write-Host "║                                                           ║" -ForegroundColor Blue
Write-Host "║     🇫🇷  DSFR-MCP Installation Automatique  🇫🇷             ║" -ForegroundColor Blue
Write-Host "║                                                           ║" -ForegroundColor Blue
Write-Host "║     Serveur MCP pour le Système de Design de l'État      ║" -ForegroundColor Blue
Write-Host "║                                                           ║" -ForegroundColor Blue
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Blue
Write-Host ""

# Fonctions utilitaires
function Write-Step {
    param($Message)
    Write-Host "➤ " -ForegroundColor Blue -NoNewline
    Write-Host $Message
}

function Write-Success {
    param($Message)
    Write-Host "✓ " -ForegroundColor Green -NoNewline
    Write-Host $Message
}

function Write-Error {
    param($Message)
    Write-Host "✗ " -ForegroundColor Red -NoNewline
    Write-Host $Message
}

function Write-Warning {
    param($Message)
    Write-Host "⚠ " -ForegroundColor Yellow -NoNewline
    Write-Host $Message
}

# Vérifier les prérequis
Write-Step "Vérification des prérequis..."

# Vérifier Node.js
$nodeVersion = $null
try {
    $nodeVersion = node -v
    if ($nodeVersion) {
        $versionNumber = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
        if ($versionNumber -lt 18) {
            Write-Error "Node.js version $nodeVersion détectée. Version 18+ requise."
            Write-Host "Veuillez installer Node.js depuis https://nodejs.org"
            exit 1
        }
        Write-Success "Node.js $nodeVersion détecté"
    }
} catch {
    Write-Error "Node.js n'est pas installé !"
    Write-Host "Veuillez installer Node.js version 18 ou supérieure depuis https://nodejs.org"
    exit 1
}

# Vérifier npm
try {
    $npmVersion = npm -v
    Write-Success "npm $npmVersion détecté"
} catch {
    Write-Error "npm n'est pas installé !"
    exit 1
}

# Obtenir le chemin absolu du projet
$projectPath = (Get-Location).Path
Write-Success "Chemin du projet : $projectPath"

# Installation des dépendances
Write-Step "Installation des dépendances npm..."
try {
    npm install
    Write-Success "Dépendances installées avec succès"
} catch {
    Write-Error "Erreur lors de l'installation des dépendances"
    exit 1
}

# Créer le fichier .env si nécessaire
if (-not (Test-Path ".env")) {
    Write-Step "Création du fichier .env..."
    @"
# Configuration DSFR-MCP
NODE_ENV=production
LOG_LEVEL=info
AUTO_INDEX_UPDATE=true
INDEX_UPDATE_INTERVAL=3600000
"@ | Out-File -FilePath ".env" -Encoding UTF8
    Write-Success "Fichier .env créé"
} else {
    Write-Warning "Fichier .env existant conservé"
}

# Créer les dossiers nécessaires
Write-Step "Création des dossiers manquants..."
$folders = @("data", "test\unit\services", "test\integration", "src\templates", "scripts", "docs")
foreach ($folder in $folders) {
    New-Item -ItemType Directory -Path $folder -Force | Out-Null
}
Write-Success "Structure de dossiers créée"

# Tester l'installation
Write-Step "Test de l'installation..."
try {
    npm run test:mcp
    Write-Success "Tests réussis !"
} catch {
    Write-Error "Les tests ont échoué"
    exit 1
}

# Configuration Claude Desktop
$configPath = "$env:APPDATA\Claude\claude_desktop_config.json"
Write-Success "Fichier de configuration Claude : $configPath"

Write-Host ""
Write-Step "Configuration pour Claude Desktop"
Write-Host ""
Write-Host "Ajoutez la configuration suivante dans votre fichier :" -ForegroundColor Yellow
Write-Host $configPath -ForegroundColor Yellow
Write-Host ""

$jsonConfig = @"
{
  "mcpServers": {
    "dsfr-documentation": {
      "command": "node",
      "args": ["src/index.js"],
      "cwd": "$($projectPath -replace '\\', '\\\\')"
    }
  }
}
"@

Write-Host $jsonConfig -ForegroundColor Green
Write-Host ""

# Proposer d'ouvrir le fichier de configuration
$response = Read-Host "Voulez-vous ouvrir le dossier de configuration Claude ? (o/n)"
if ($response -eq "o" -or $response -eq "O") {
    explorer "$env:APPDATA\Claude"
}

# Instructions finales
Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                                                           ║" -ForegroundColor Green
Write-Host "║               Installation terminée ! 🎉                   ║" -ForegroundColor Green
Write-Host "║                                                           ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "Prochaines étapes :"
Write-Host "1. Copiez la configuration ci-dessus dans claude_desktop_config.json"
Write-Host "2. Redémarrez Claude Desktop"
Write-Host "3. Vérifiez que l'icône 🔧 apparaît dans Claude"
Write-Host ""
Write-Host "Pour démarrer le serveur manuellement :" -NoNewline
Write-Host " npm start" -ForegroundColor Blue
Write-Host ""
Write-Host "Pour plus d'aide, consultez :" -NoNewline
Write-Host " type GUIDE_INSTALLATION_MCP_CLAUDE.md" -ForegroundColor Blue
Write-Host ""
Write-Success "Bonne utilisation du DSFR-MCP !"

# Attendre que l'utilisateur appuie sur une touche
Write-Host ""
Write-Host "Appuyez sur une touche pour fermer..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
