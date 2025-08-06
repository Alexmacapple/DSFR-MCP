# 🐳 Guide d'installation DSFR-MCP avec Docker

[![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com)
[![Version](https://img.shields.io/badge/version-1.4.1-blue.svg)](https://github.com/Alexmacapple/DSFR-MCP)

> **🎯 Solution recommandée** : Docker élimine tous les problèmes de configuration entre environnements !

## 📖 Table des matières

1. [Pourquoi Docker ?](#pourquoi-docker)
2. [Pré-requis](#pré-requis)
3. [Installation rapide](#installation-rapide)
4. [Modes de fonctionnement](#modes-de-fonctionnement)
5. [Configuration avancée](#configuration-avancée)
6. [Dépannage](#dépannage)
7. [Migration depuis l'installation native](#migration)

## 🤔 Pourquoi Docker ?

### ✅ Avantages Docker vs Installation Native

| Critère | Docker | Installation Native |
|---------|---------|-------------------|
| **Portabilité** | ✅ Identique sur tous les Mac/PC | ❌ Config différente par machine |
| **Isolation** | ✅ Pas de conflit avec Node.js local | ❌ Risques de conflits |
| **Versioning** | ✅ Images taguées par version | ❌ Dépendant de l'environnement |
| **Configuration** | ✅ Script automatique | ❌ Configuration manuelle |
| **Mise à jour** | ✅ `docker pull` et redémarrage | ❌ npm update + reconfiguration |
| **Débogage** | ✅ Logs centralisés | ❌ Logs éparpillés |

## 📋 Pré-requis

### 1. Docker Desktop
- **Mac** : [Télécharger Docker Desktop](https://www.docker.com/products/docker-desktop/)
- **Windows** : [Télécharger Docker Desktop](https://www.docker.com/products/docker-desktop/)
- **Linux** : [Installer Docker Engine](https://docs.docker.com/engine/install/)

### 2. Vérification de l'installation
```bash
docker --version
docker-compose --version
```

**Versions minimum requises :**
- Docker: 20.10+
- Docker Compose: 1.29+

## 🚀 Installation rapide

### Option 1: Script automatique (Recommandé)

#### Sur macOS/Linux :
```bash
# Cloner le projet (si pas déjà fait)
git clone https://github.com/Alexmacapple/DSFR-MCP.git
cd DSFR-MCP

# Lancer la configuration automatique
./docker/scripts/configure-claude.sh
```

#### Sur Windows :
```powershell
# Dans PowerShell en tant qu'administrateur
cd DSFR-MCP
.\docker\scripts\configure-claude.ps1
```

### Option 2: Configuration manuelle

```bash
# 1. Build de l'image
docker-compose build

# 2. Démarrage du service
docker-compose up -d

# 3. Vérification
docker ps
```

## ⚙️ Modes de fonctionnement

### 🔄 Mode stdio (Par défaut)
Communication directe avec Claude Desktop via stdin/stdout.

```bash
./docker/scripts/configure-claude.sh
```

**Configuration générée :**
```json
{
  "mcpServers": {
    "dsfr-documentation": {
      "command": "docker",
      "args": ["exec", "-i", "dsfr-mcp-server", "node", "src/index.js"],
      "env": {}
    }
  }
}
```

### 🌐 Mode TCP
Communication réseau (plus flexible pour le debugging).

```bash
./docker/scripts/configure-claude.sh --mode tcp --port 3000
```

### 🛠️ Mode Développement
Hot-reload et debugging activés.

```bash
./docker/scripts/configure-claude.sh --dev
```

## 🔧 Configuration avancée

### Variables d'environnement

Créer un fichier `.env` dans le projet :

```bash
# Mode d'exécution
NODE_ENV=production

# Niveau de logs
LOG_LEVEL=info

# Mode MCP
MCP_MODE=stdio

# Port (mode TCP uniquement)
PORT=3000
```

### Volumes persistants

Les données sont automatiquement persistées dans des volumes Docker :
- `dsfr-mcp-data` : Données de l'application
- `dsfr-mcp-logs` : Logs du serveur

```bash
# Voir les volumes
docker volume ls | grep dsfr

# Inspecter un volume
docker volume inspect dsfr-mcp-data
```

### Customisation du Dockerfile

Pour des besoins spécifiques, vous pouvez modifier le `Dockerfile` :

```dockerfile
# Exemple: ajouter des outils de debugging
RUN apk add --no-cache curl wget
```

## 🔧 Commandes utiles

### Gestion des services

```bash
# Démarrer
docker-compose up -d

# Arrêter
docker-compose down

# Redémarrer
docker-compose restart

# Voir les logs
docker-compose logs -f dsfr-mcp

# Status des containers
docker ps
```

### Debugging

```bash
# Accéder au container
docker exec -it dsfr-mcp-server /bin/sh

# Voir les logs en temps réel
./docker/scripts/configure-claude.sh --logs

# Mode développement avec hot-reload
./docker/scripts/configure-claude.sh --dev
```

### Maintenance

```bash
# Nettoyer les images inutilisées
docker system prune

# Mettre à jour l'image
docker-compose pull
docker-compose up -d

# Backup des volumes
docker run --rm -v dsfr-mcp-data:/data -v $(pwd):/backup alpine tar czf /backup/dsfr-backup.tar.gz -C /data .
```

## 🛠️ Dépannage

### Problème : Container ne démarre pas

**Diagnostic :**
```bash
docker logs dsfr-mcp-server
```

**Solutions courantes :**
1. Vérifier que le port n'est pas utilisé : `lsof -i :3000`
2. Reconstruire l'image : `docker-compose build --no-cache`
3. Nettoyer Docker : `docker system prune -f`

### Problème : Claude Desktop ne voit pas le MCP

**Solutions :**
1. Vérifier que le container fonctionne : `docker ps`
2. Redémarrer Claude Desktop complètement
3. Vérifier la config : `cat ~/Library/Application\ Support/Claude/claude_desktop_config.json`

### Problème : Performance lente

**Optimisations :**
```bash
# Limiter les ressources
docker-compose up -d --scale dsfr-mcp=1
```

**Dans docker-compose.yml :**
```yaml
deploy:
  resources:
    limits:
      memory: 1G
      cpus: '1.0'
```

### Problème : Permissions sur macOS

```bash
# Donner les permissions d'exécution
chmod +x docker/scripts/configure-claude.sh

# Si problème de sécurité macOS
xattr -d com.apple.quarantine docker/scripts/configure-claude.sh
```

## 🔄 Migration depuis l'installation native

### 1. Sauvegarder la configuration actuelle

```bash
# Backup de la config Claude
cp ~/Library/Application\ Support/Claude/claude_desktop_config.json ~/claude_config_backup.json
```

### 2. Arrêter les processus natifs

```bash
# Tuer les processus Node.js du MCP
pkill -f "dsfr-mcp"
```

### 3. Installation Docker

```bash
# Utiliser le script de configuration Docker
./docker/scripts/configure-claude.sh
```

### 4. Vérification

```bash
# Tester la nouvelle installation
docker ps
docker logs dsfr-mcp-server
```

### 5. Nettoyage (optionnel)

```bash
# Supprimer l'installation native
rm -rf node_modules
# Garder les données dans /data
```

## 📊 Monitoring et observabilité

### Monitoring avec Prometheus (optionnel)

```bash
# Démarrer avec monitoring
docker-compose --profile monitoring up -d

# Accéder à Prometheus
open http://localhost:9090
```

### Métriques disponibles

- Uptime du container
- Utilisation mémoire/CPU
- Nombre de requêtes MCP
- Temps de réponse

## 🚀 Mise en production

### Configuration recommandée

```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  dsfr-mcp:
    restart: always
    environment:
      - NODE_ENV=production
      - LOG_LEVEL=warn
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
```

### Déploiement

```bash
# Mode production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 📞 Support Docker

### Informations utiles pour le support

```bash
# Informations système
docker version
docker-compose version
docker system info

# Status des containers
docker ps -a

# Logs détaillés
docker logs dsfr-mcp-server --timestamps

# Configuration Claude
cat ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

### FAQ Docker

**Q: Puis-je utiliser Docker et l'installation native en parallèle ?**
R: Oui, mais vous devez changer le nom du serveur MCP dans la configuration Claude.

**Q: Comment faire des mises à jour ?**
R: `docker-compose pull && docker-compose up -d`

**Q: Les données sont-elles persistées ?**
R: Oui, dans des volumes Docker nommés `dsfr-mcp-data` et `dsfr-mcp-logs`.

---

## 🎉 Conclusion

Avec Docker, vous avez maintenant :
- ✅ **Configuration identique** sur tous vos environnements
- ✅ **Installation en une commande**
- ✅ **Isolation complète** des dépendances
- ✅ **Mises à jour simplifiées**
- ✅ **Monitoring intégré**

**La solution Docker est désormais la méthode recommandée pour DSFR-MCP !**