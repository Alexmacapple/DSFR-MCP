# Guide : Connexion au Serveur MCP DSFR via Docker

Ce guide explique comment se connecter manuellement au serveur MCP (Model-Context Protocol) qui s'exécute à l'intérieur du conteneur Docker `dsfr-mcp-server`.

Cette procédure est utile pour le débogage, les tests manuels ou pour permettre à un agent externe (comme une IA) d'interagir avec les outils du DSFR.

## Prérequis

1.  **Docker Desktop** doit être installé et en cours d'exécution.
2.  Le projet DSFR-MCP doit être lancé avec Docker Compose. Si ce n'est pas le cas, exécutez cette commande à la racine du projet :
    ```bash
    docker-compose up -d
    ```

## Étapes de Connexion

### Étape 1 : Vérifier que le conteneur est actif

Avant de vous connecter, assurez-vous que le conteneur `dsfr-mcp-server` est bien en cours d'exécution et en bonne santé.

Ouvrez un terminal et exécutez la commande suivante :

```bash
docker ps
```

Vous devriez voir une sortie similaire à celle-ci, listant le conteneur `dsfr-mcp-server` avec le statut `Up ... (healthy)` :

```
CONTAINER ID   IMAGE             COMMAND                  CREATED          STATUS                    PORTS      NAMES
52a3a8a90e2a   dsfr-mcp:latest   "docker-entrypoint.s…"   environ 30 minutes   Up environ 30 minutes (healthy)   3000/tcp   dsfr-mcp-server
```

Le nom important à retenir ici est `dsfr-mcp-server`.

### Étape 2 : Se connecter au serveur MCP

Une fois que vous avez confirmé que le conteneur est actif, vous pouvez vous y connecter en mode interactif pour communiquer avec le protocole MCP.

Utilisez la commande `docker exec`. Elle permet d'exécuter une commande à l'intérieur d'un conteneur déjà en marche.

```bash
docker exec -i dsfr-mcp-server node src/index.js --mcp
```

Détaillons cette commande :
- `docker exec` : La commande Docker pour exécuter une action dans un conteneur.
- `-i` : (pour "interactif") Ce drapeau est **crucial**. Il maintient l'entrée standard (`stdin`) ouverte, ce qui permet d'envoyer des commandes au processus MCP.
- `dsfr-mcp-server` : Le nom de notre conteneur.
- `node src/index.js --mcp` : La commande que nous exécutons *à l'intérieur* du conteneur pour démarrer le serveur en mode MCP, prêt à écouter les instructions sur son entrée standard.

### Étape 3 : Communiquer avec le MCP

Après avoir exécuté la commande de l'étape 2, votre terminal sera en attente. Il ne se passera rien visuellement, c'est normal. Il attend une requête JSON-RPC.

Vous pouvez maintenant envoyer des requêtes MCP. Par exemple, pour lister tous les outils disponibles, vous pouvez copier-coller le bloc JSON suivant dans votre terminal et appuyer sur `Entrée` :

```json
{
  "jsonrpc": "2.0",
  "id": "1",
  "method": "mcp.listTools",
  "params": {}
}
```

Le serveur MCP, à l'intérieur du conteneur, recevra cette requête, la traitera et vous renverra une réponse JSON contenant la liste de tous les outils, directement dans votre terminal.

---

Vous êtes maintenant connecté et prêt à interagir avec le serveur MCP en toute autonomie !
