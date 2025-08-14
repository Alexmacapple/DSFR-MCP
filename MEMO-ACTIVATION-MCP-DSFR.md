# 📋 MÉMO - Activation MCP DSFR Docker

## 🚀 Démarrage Rapide (depuis n'importe quel répertoire)

### 1️⃣ Commande unique pour tout activer
```bash
# Depuis n'importe où sur votre Mac
cd ~/Desktop/MCP-DSFR && docker-compose up -d && ./docker/scripts/configure-claude.sh
```

### 2️⃣ Vérification rapide
```bash
# Vérifier que le serveur est actif
docker ps | grep dsfr-mcp
```

---

## 📦 Installation Complète (première fois)

### Prérequis
- Docker Desktop installé et lancé
- Claude Desktop installé
- Terminal avec accès bash/zsh

### Étapes d'installation
```bash
# 1. Cloner le repository (si pas déjà fait)
cd ~/Desktop
git clone [URL_DU_REPO] MCP-DSFR

# 2. Aller dans le dossier
cd MCP-DSFR

# 3. Construire et lancer
docker-compose build --no-cache
docker-compose up -d

# 4. Configurer Claude Desktop automatiquement
./docker/scripts/configure-claude.sh

# 5. Redémarrer Claude Desktop
# Sur Mac: Cmd+Q puis relancer Claude
```

---

## 🔧 Commandes Essentielles

### Démarrage/Arrêt du serveur MCP

```bash
# DÉMARRER le serveur MCP (depuis le dossier MCP-DSFR)
cd ~/Desktop/MCP-DSFR && docker-compose up -d

# ARRÊTER le serveur MCP
cd ~/Desktop/MCP-DSFR && docker-compose down

# REDÉMARRER le serveur MCP
cd ~/Desktop/MCP-DSFR && docker-compose restart

# VOIR LES LOGS
cd ~/Desktop/MCP-DSFR && docker logs dsfr-mcp-server -f
```

### Depuis n'importe quel répertoire (alias pratiques)

Ajoutez ces alias dans votre `~/.zshrc` ou `~/.bash_profile`:

```bash
# Alias MCP DSFR
alias mcp-start='cd ~/Desktop/MCP-DSFR && docker-compose up -d && echo "✅ MCP DSFR démarré"'
alias mcp-stop='cd ~/Desktop/MCP-DSFR && docker-compose down && echo "🛑 MCP DSFR arrêté"'
alias mcp-restart='cd ~/Desktop/MCP-DSFR && docker-compose restart && echo "🔄 MCP DSFR redémarré"'
alias mcp-logs='docker logs dsfr-mcp-server -f'
alias mcp-status='docker ps | grep dsfr-mcp && echo "📊 Dashboard: http://localhost:3001/dashboard"'
alias mcp-clean='cd ~/Desktop/MCP-DSFR && docker-compose down && docker system prune -af'
alias mcp-rebuild='cd ~/Desktop/MCP-DSFR && docker-compose down && docker-compose build --no-cache && docker-compose up -d'
```

Puis rechargez votre configuration:
```bash
source ~/.zshrc  # ou source ~/.bash_profile
```

---

## 🔍 Vérifications et Diagnostics

### Vérifier que tout fonctionne
```bash
# 1. Vérifier Docker
docker --version
docker ps

# 2. Vérifier le conteneur MCP
docker ps | grep dsfr-mcp
# Doit afficher: dsfr-mcp-server (healthy)

# 3. Vérifier le dashboard
open http://localhost:3001/dashboard

# 4. Vérifier les logs
docker logs dsfr-mcp-server --tail 20

# 5. Vérifier Claude Desktop
# Ouvrir Claude et chercher l'icône 🔧 en bas
```

### Test dans Claude Desktop
Après redémarrage de Claude, testez avec:
- "Recherche les composants DSFR"
- "Liste les catégories DSFR disponibles"
- "Génère un bouton DSFR en React"

---

## 🔴 Résolution des Problèmes

### Le serveur ne démarre pas
```bash
# 1. Nettoyer complètement Docker
docker-compose down
docker system prune -af --volumes
docker-compose build --no-cache
docker-compose up -d

# 2. Vérifier les permissions
cd ~/Desktop/MCP-DSFR
chmod +x docker/scripts/*.sh
```

### Claude ne voit pas le MCP
```bash
# 1. Reconfigurer Claude
cd ~/Desktop/MCP-DSFR
./docker/scripts/configure-claude.sh

# 2. Vérifier la config Claude
cat ~/Library/Application\ Support/Claude/claude_desktop_config.json

# 3. Redémarrer Claude complètement
# Cmd+Q puis relancer
```

### Port 3001 déjà utilisé
```bash
# Trouver et tuer le processus
lsof -i :3001
kill -9 [PID]

# Ou changer le port dans docker-compose.yml
```

### Rebuild complet après mise à jour
```bash
cd ~/Desktop/MCP-DSFR
git pull
docker-compose down
docker-compose build --no-cache
docker-compose up -d
./docker/scripts/configure-claude.sh
```

---

## 📊 Dashboard et Monitoring

### Accès au Dashboard
- **URL**: http://localhost:3001/dashboard
- **Métriques disponibles**:
  - État du serveur
  - Utilisation mémoire
  - Cache statistics
  - Requêtes MCP

### Commandes de monitoring
```bash
# Stats en temps réel
docker stats dsfr-mcp-server

# Utilisation mémoire
docker exec dsfr-mcp-server node -e "console.log(process.memoryUsage())"

# Santé du serveur
docker inspect dsfr-mcp-server --format='{{.State.Health.Status}}'
```

---

## 🎯 Workflow Quotidien Recommandé

### Matin - Démarrage
```bash
# 1. Lancer Docker Desktop (si pas déjà fait)
open -a Docker

# 2. Démarrer MCP DSFR
mcp-start  # ou: cd ~/Desktop/MCP-DSFR && docker-compose up -d

# 3. Vérifier le statut
mcp-status
```

### Soir - Arrêt (optionnel)
```bash
# Arrêter proprement
mcp-stop  # ou: cd ~/Desktop/MCP-DSFR && docker-compose down
```

### Mise à jour du MCP
```bash
cd ~/Desktop/MCP-DSFR
git pull
mcp-rebuild  # Reconstruit et redémarre
```

---

## 🔒 Sécurité et Bonnes Pratiques

1. **Ne jamais exposer le port 3001 sur internet** (localhost uniquement)
2. **Garder Docker Desktop à jour**
3. **Nettoyer régulièrement**: `docker system prune -af` (1x/semaine)
4. **Sauvegarder votre config Claude** avant mise à jour majeure

---

## 📝 Notes Importantes

- Le MCP DSFR utilise le mode **stdio** pour communiquer avec Claude
- Le dashboard sur **port 3001** est pour le monitoring uniquement
- Les données DSFR sont embarquées dans l'image Docker (pas de fetch externe)
- Configuration Claude dans: `~/Library/Application Support/Claude/claude_desktop_config.json`

---

## 🆘 Support

- **Logs détaillés**: `docker logs dsfr-mcp-server -f --tail 100`
- **Reset complet**: `mcp-clean && mcp-rebuild`
- **GitHub Issues**: Signaler les problèmes sur le repo
- **Documentation DSFR**: https://www.systeme-de-design.gouv.fr/

---

*Dernière mise à jour: 14/08/2025*
*Version MCP: 1.5.0*
*Compatible: Claude Desktop 0.7.0+*

---

## 🔧 Corrections Appliquées (14/08/2025)

### Erreur CacheService Résolue

**Problème identifié** : `TypeError: this.memoryCache.entries is not a function`

**Cause** : Le LRUCache personnalisé utilise `this.cache` comme Map interne, pas de méthode `entries()` directe.

**Solution appliquée** dans `src/services/cache-service.js` :
- Ligne 226 : Remplacé `this.memoryCache.entries()` par accès direct à `this.memoryCache.cache`
- Ligne 389 : Idem pour la méthode `cleanup()`
- Ligne 183 : Idem pour la méthode `clear()` avec pattern

**Statut** : ✅ Serveur Docker redémarré sans erreur, cache fonctionnel