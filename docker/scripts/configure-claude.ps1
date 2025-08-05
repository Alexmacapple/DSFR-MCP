# ==============================================
# Script de configuration automatique Claude Desktop (Windows)
# Pour DSFR-MCP en mode Docker
# ==============================================

param(
    [string]$Mode = "stdio",
    [int]$Port = 3000,
    [switch]$Dev,
    [switch]$Stop,
    [switch]$Logs,
    [switch]$Help
)

# Couleurs pour l'affichage
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"

function Show-Help {
    Write-Host "🐳 Configuration automatique DSFR-MCP Docker pour Claude Desktop" -ForegroundColor Blue
    Write-Host "============================================================================="
    Write-Host ""
    Write-Host "Usage: .\configure-claude.ps1 [OPTIONS]" -ForegroundColor White
    Write-Host ""
    Write-Host "Options:" -ForegroundColor White
    Write-Host "    -Mode <stdio|tcp>    Mode de fonctionnement [défaut: stdio]"
    Write-Host "    -Port <number>       Port pour le mode TCP [défaut: 3000]"
    Write-Host "    -Dev                 Utiliser le mode développement"
    Write-Host "    -Stop                Arrêter les containers"
    Write-Host "    -Logs                Afficher les logs"
    Write-Host "    -Help                Afficher cette aide"
    Write-Host ""
    Write-Host "Exemples:" -ForegroundColor Yellow
    Write-Host "    .\configure-claude.ps1                   # Configuration standard"
    Write-Host "    .\configure-claude.ps1 -Mode tcp -Port 3001  # Mode TCP"
    Write-Host "    .\configure-claude.ps1 -Dev             # Mode développement"
    Write-Host "    .\configure-claude.ps1 -Stop            # Arrêter les services"
}

if ($Help) {
    Show-Help
    exit 0
}

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$ProjectDir = Split-Path -Parent (Split-Path -Parent $ScriptDir)
$ContainerName = "dsfr-mcp-server"

Write-Host "🐳 Configuration automatique de DSFR-MCP Docker pour Claude Desktop" -ForegroundColor Blue
Write-Host "============================================================================="

# Fonction pour arrêter les services
function Stop-Services {
    Write-Host "🛑 Arrêt des services DSFR-MCP..." -ForegroundColor Yellow
    Set-Location $ProjectDir
    docker-compose down
    Write-Host "✅ Services arrêtés" -ForegroundColor Green
}

# Fonction pour afficher les logs
function Show-Logs {
    Write-Host "📝 Logs DSFR-MCP..." -ForegroundColor Blue
    Set-Location $ProjectDir
    docker-compose logs -f dsfr-mcp
}

# Actions spéciales
if ($Stop) {
    Stop-Services
    exit 0
}

if ($Logs) {
    Show-Logs
    exit 0
}

# Vérifications préalables
Write-Host "🔍 Vérifications préalables..." -ForegroundColor Blue

# Vérifier Docker
try {
    docker --version | Out-Null
    Write-Host "✅ Docker détecté" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker n'est pas installé. Veuillez l'installer d'abord." -ForegroundColor Red
    exit 1
}

# Vérifier Docker Compose
try {
    docker-compose --version | Out-Null
    Write-Host "✅ Docker Compose détecté" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose n'est pas installé. Veuillez l'installer d'abord." -ForegroundColor Red
    exit 1
}

# Configuration Claude Desktop
$ClaudeConfigDir = "$env:APPDATA\Claude"

# Build et démarrage des containers
Write-Host "🔨 Build et démarrage des containers..." -ForegroundColor Blue
Set-Location $ProjectDir

if ($Dev) {
    Write-Host "🚀 Mode développement activé" -ForegroundColor Yellow
    docker-compose --profile dev up --build -d dsfr-mcp-dev
    $ContainerName = "dsfr-mcp-dev"
} else {
    docker-compose up --build -d dsfr-mcp
}

# Attendre que le container soit prêt
Write-Host "⏳ Attente du démarrage du container..." -ForegroundColor Blue
Start-Sleep -Seconds 5

# Vérifier que le container fonctionne
$ContainerRunning = docker ps --filter "name=$ContainerName" --format "{{.Names}}"
if (-not $ContainerRunning) {
    Write-Host "❌ Le container $ContainerName ne fonctionne pas" -ForegroundColor Red
    Write-Host "Logs du container :"
    docker logs $ContainerName
    exit 1
}

Write-Host "✅ Container $ContainerName démarré avec succès" -ForegroundColor Green

# Configuration de Claude Desktop
Write-Host "⚙️ Configuration de Claude Desktop..." -ForegroundColor Blue

# Créer le répertoire de config s'il n'existe pas
if (-not (Test-Path $ClaudeConfigDir)) {
    New-Item -ItemType Directory -Path $ClaudeConfigDir -Force | Out-Null
}

# Générer la configuration selon le mode
if ($Mode -eq "tcp") {
    $ConfigContent = @"
{
  "mcpServers": {
    "dsfr-documentation": {
      "command": "docker",
      "args": ["exec", "-i", "$ContainerName", "node", "src/index.js"],
      "env": {
        "MCP_MODE": "tcp",
        "PORT": "$Port"
      }
    }
  }
}
"@
} else {
    $ConfigContent = @"
{
  "mcpServers": {
    "dsfr-documentation": {
      "command": "docker",
      "args": ["exec", "-i", "$ContainerName", "node", "src/index.js"],
      "env": {}
    }
  }
}
"@
}

# Sauvegarder la configuration
$ConfigPath = Join-Path $ClaudeConfigDir "claude_desktop_config.json"
$ConfigContent | Out-File -FilePath $ConfigPath -Encoding UTF8

Write-Host "✅ Configuration Claude Desktop créée" -ForegroundColor Green
Write-Host "📍 Fichier: $ConfigPath" -ForegroundColor Blue

# Afficher les informations finales
Write-Host ""
Write-Host "🎉 Configuration terminée avec succès !" -ForegroundColor Green
Write-Host "============================================================================="
Write-Host "Container: $ContainerName" -ForegroundColor Blue
Write-Host "Mode: $Mode" -ForegroundColor Blue
if ($Mode -eq "tcp") {
    Write-Host "Port: $Port" -ForegroundColor Blue
}

$ContainerStatus = docker ps --filter "name=$ContainerName" --format "{{.Status}}"
Write-Host "Status: $ContainerStatus" -ForegroundColor Blue

Write-Host ""
Write-Host "📝 Prochaines étapes :" -ForegroundColor Yellow
Write-Host "1. Redémarrez Claude Desktop complètement"
Write-Host "2. Vérifiez la présence de l'icône 🔧 en bas de Claude"
Write-Host "3. Testez avec: 'Recherche les composants DSFR qui contiennent `"button`"'"
Write-Host ""
Write-Host "🔧 Commandes utiles :" -ForegroundColor Blue
Write-Host "  .\configure-claude.ps1 -Logs    # Voir les logs"
Write-Host "  .\configure-claude.ps1 -Stop    # Arrêter les services"
Write-Host "  docker ps                       # Voir les containers actifs"