# 🚀 Guide d'installation du MCP DSFR dans Claude Desktop

## 📖 Table des matières
1. [Qu'est-ce que le MCP ?](#quest-ce-que-le-mcp)
2. [Pré-requis](#pré-requis)
3. [Installation étape par étape](#installation-étape-par-étape)
4. [Configuration dans Claude Desktop](#configuration-dans-claude-desktop)
5. [Vérification et tests](#vérification-et-tests)
6. [Utilisation quotidienne](#utilisation-quotidienne)
7. [Dépannage](#dépannage)
8. [Support](#support)

## 🤔 Qu'est-ce que le MCP ?

**MCP (Model Context Protocol)** est un protocole qui permet à Claude d'accéder à des outils externes. Dans notre cas, le **MCP DSFR** donne accès à toute la documentation du Système de Design de l'État Français directement dans Claude.

### Avantages :
- ✅ Accès direct à la documentation DSFR sans quitter Claude
- ✅ Recherche intelligente dans les composants
- ✅ Exemples de code directement disponibles
- ✅ Toujours à jour avec la dernière documentation

## 📋 Pré-requis

### 1. Node.js (version 18 ou supérieure)
- **Windows/Mac** : Télécharger depuis [nodejs.org](https://nodejs.org/)
- **Vérifier l'installation** :
  ```bash
  node --version
  # Doit afficher v18.0.0 ou plus récent
  ```

### 2. Claude Desktop
- Télécharger depuis [claude.ai/download](https://claude.ai/download)
- Installer et se connecter avec votre compte Anthropic

### 3. Le projet DSFR-MCP
- Récupérer le dossier `DSFR-MCP` auprès de votre collègue
- Ou cloner depuis le dépôt Git (si disponible)

## 🛠️ Installation étape par étape

### Étape 1 : Préparer le projet

1. **Placer le dossier du projet** dans un emplacement permanent (ex: `Documents/`)
   ```bash
   # Exemple sur Mac
cp -r DSFR-MCP ~/Documents/
   
   # Exemple sur Windows
   xcopy DSFR-MCP %USERPROFILE%\Documents\ /E
   ```

2. **Ouvrir un terminal** dans le dossier du projet
   ```bash
cd ~/Documents/DSFR-MCP  # Mac
   cd %USERPROFILE%\Documents\DSFR-MCP  # Windows
   ```

3. **Installer les dépendances**
   ```bash
   npm install
   ```

### Étape 2 : Tester l'installation

```bash
node test-mcp.js
```

**Résultat attendu :**
```
🚀 Test du serveur MCP DSFR...
✅ Service initialisé
✅ Trouvé X résultats pour "button"
✅ Catégories disponibles: component, core, layout, utility, analytics
🎉 Tous les tests ont réussi !
```

### Étape 3 : Noter le chemin absolu

```bash
pwd  # Mac/Linux
cd   # Windows (sans arguments)
```

**⚠️ IMPORTANT** : Copier ce chemin, vous en aurez besoin pour la configuration !

## ⚙️ Configuration dans Claude Desktop

### 1. Localiser le fichier de configuration

#### Sur macOS :
```bash
open ~/Library/Application\ Support/Claude/
```
Puis ouvrir `claude_desktop_config.json`

#### Sur Windows :
1. Appuyer sur `Windows + R`
2. Taper `%APPDATA%\Claude`
3. Ouvrir `claude_desktop_config.json`

### 2. Éditer la configuration

Remplacer le contenu du fichier par :

```json
{
  "mcpServers": {
    "dsfr-documentation": {
      "command": "node",
      "args": ["src/index.js"],
      "cwd": "REMPLACER_PAR_VOTRE_CHEMIN"
    }
  }
}
```

**⚠️ IMPORTANT** : Remplacer `REMPLACER_PAR_VOTRE_CHEMIN` par le chemin noté à l'étape 3.

#### Exemples de chemins :
- **Mac** : `/Users/votrenom/Documents/DSFR-MCP`
- **Windows** : `C:\\Users\\votrenom\\Documents\\DSFR-MCP`

**Note Windows** : Utiliser des doubles backslashes `\\` dans le chemin !

### 3. Sauvegarder et redémarrer Claude

1. Sauvegarder le fichier `claude_desktop_config.json`
2. **Fermer complètement Claude Desktop** (Cmd+Q sur Mac, fermer toutes les fenêtres sur Windows)
3. Relancer Claude Desktop

## ✅ Vérification et tests

### 1. Vérifier l'activation

Au lancement de Claude Desktop, vous devez voir :
- Une icône 🔧 en bas de l'interface
- En cliquant dessus, vous devriez voir "dsfr-documentation"

### 2. Tests pratiques

Essayez ces commandes dans Claude :

#### Test 1 : Recherche simple
```
Recherche les composants DSFR qui contiennent "button"
```

#### Test 2 : Liste des catégories
```
Quelles sont toutes les catégories de composants DSFR disponibles ?
```

#### Test 3 : Détails d'un composant
```
Donne-moi les détails complets du composant "accordion" DSFR
```

#### Test 4 : Exemples de code
```
Montre-moi des exemples de code pour le composant "card" DSFR
```

### 3. Signes de bon fonctionnement

✅ Claude mentionne qu'il utilise des outils comme `search_dsfr_components`
✅ Les réponses contiennent des liens vers la documentation officielle
✅ Claude peut donner des exemples de code HTML spécifiques au DSFR

## 💡 Utilisation quotidienne

### Exemples de requêtes utiles

1. **Recherche de composants**
   - "Trouve tous les composants de navigation DSFR"
   - "Quels composants DSFR pour créer un formulaire ?"
   - "Liste les composants DSFR pour les tableaux"

2. **Détails techniques**
   - "Comment utiliser le composant modal DSFR ?"
   - "Quelles sont les classes CSS du composant button ?"
   - "Montre-moi la structure HTML d'un accordion DSFR"

3. **Patterns et layouts**
   - "Cherche des patterns de page de connexion DSFR"
   - "Quels sont les layouts disponibles dans le DSFR ?"
   - "Trouve des exemples de formulaires DSFR"

4. **Bonnes pratiques**
   - "Quels composants DSFR sont dépréciés ?"
   - "Comment implémenter l'accessibilité avec les composants DSFR ?"
   - "Quelles sont les variantes du composant button ?"

## 🔧 Dépannage

### Problème : "Pas d'icône 🔧 dans Claude"

**Solutions :**
1. Vérifier que le fichier de config est bien sauvegardé
2. Vérifier le format JSON (attention aux virgules et guillemets)
3. S'assurer que Claude Desktop est complètement fermé avant de relancer

### Problème : "Error spawning process"

**Solutions :**
1. Vérifier que le chemin dans la config est correct
2. Sur Windows, utiliser des doubles backslashes `\\`
3. Vérifier que Node.js est bien installé : `node --version`

### Problème : "Cannot find module"

**Solutions :**
```bash
cd /chemin/vers/DSFR-MCP
npm install
```

### Problème : "MCP connection failed"

**Solutions :**
1. Tester manuellement :
   ```bash
   cd /chemin/vers/DSFR-MCP
   node test-mcp.js
   ```
2. Si le test échoue, vérifier que tous les fichiers sont présents
3. Réinstaller les dépendances : `npm install`

### Logs de débogage

Pour voir les logs détaillés :
- **Mac** : Ouvrir Console.app et filtrer par "Claude"
- **Windows** : Vérifier dans `%APPDATA%\Claude\logs`

## 📞 Support

### Checklist de vérification

Avant de demander de l'aide, vérifier :

- [ ] Node.js version 18+ installé
- [ ] `npm install` exécuté avec succès
- [ ] `node test-mcp.js` affiche "Tous les tests ont réussi"
- [ ] Le chemin dans la config est correct et absolu
- [ ] Claude Desktop a été complètement redémarré
- [ ] L'icône 🔧 apparaît dans Claude

### Informations à fournir en cas de problème

1. Version de Node.js : `node --version`
2. Système d'exploitation
3. Contenu du fichier `claude_desktop_config.json`
4. Résultat de `node test-mcp.js`
5. Messages d'erreur exacts

### Contact

Pour toute question ou problème :
- Documentation technique : Voir le README.md du projet
- Problèmes d'installation : Contacter l'équipe technique
- Questions sur l'utilisation : Consulter les exemples ci-dessus

---

**🎉 Félicitations !** Vous avez maintenant accès à toute la documentation DSFR directement dans Claude. Profitez de cette intégration pour développer plus efficacement avec le système de design de l'État français !
