# 🤝 Contribuer au projet DSFR-MCP

Merci de votre intérêt pour contribuer au projet DSFR-MCP ! Ce guide vous aidera à comprendre comment participer efficacement au développement de ce serveur MCP.

## 📋 Table des matières

- [Code de conduite](#code-de-conduite)
- [Comment contribuer](#comment-contribuer)
- [Environnement de développement](#environnement-de-développement)
- [Signaler un bug](#signaler-un-bug)
- [Proposer une fonctionnalité](#proposer-une-fonctionnalité)
- [Soumettre une Pull Request](#soumettre-une-pull-request)
- [Style de code](#style-de-code)
- [Tests](#tests)
- [Documentation](#documentation)

## Code de conduite

Ce projet adhère à un code de conduite bienveillant. En participant, vous vous engagez à respecter ce code. Veuillez signaler tout comportement inacceptable.

## Comment contribuer

1. **Fork** le projet
2. **Clone** votre fork : `git clone https://github.com/votre-username/DSFR-MCP.git`
3. **Créez** une branche : `git checkout -b feature/ma-fonctionnalite`
4. **Committez** vos changements : `git commit -m "feat: ajout de ma fonctionnalité"`
5. **Push** vers votre fork : `git push origin feature/ma-fonctionnalite`
6. **Ouvrez** une Pull Request

## Environnement de développement

> **🎯 Recommandé : Utilisez Docker pour un environnement de développement cohérent !**

### 🐳 Développement avec Docker (Recommandé)

**Avantages :**
- Environnement identique pour tous les contributeurs
- Aucun conflit avec votre installation Node.js locale
- Configuration automatique des dépendances
- Hot-reload intégré

```bash
# Cloner le projet
git clone https://github.com/votre-username/DSFR-MCP.git
cd DSFR-MCP

# Démarrer l'environnement de développement
docker-compose --profile dev up -d

# Voir les logs en temps réel
docker-compose logs -f dsfr-mcp-dev

# Exécuter des commandes dans le container
docker-compose exec dsfr-mcp-dev npm test
docker-compose exec dsfr-mcp-dev npm run lint

# Shell interactif pour le développement
docker-compose exec dsfr-mcp-dev sh
```

#### Scripts Docker pour le développement

```bash
# Tests
docker-compose exec dsfr-mcp-dev npm test              # Tous les tests
docker-compose exec dsfr-mcp-dev npm run test:unit     # Tests unitaires
docker-compose exec dsfr-mcp-dev npm run test:watch    # Tests en mode watch

# Qualité de code
docker-compose exec dsfr-mcp-dev npm run lint          # Vérification ESLint
docker-compose exec dsfr-mcp-dev npm run lint:fix      # Correction automatique

# Performance
docker-compose exec dsfr-mcp-dev npm run benchmark     # Benchmark complet
docker-compose exec dsfr-mcp-dev npm run quick-benchmark # Benchmark rapide

# Redémarrer le service après modification
docker-compose restart dsfr-mcp-dev
```

### 📦 Développement natif

**Pré-requis :**
- Node.js 18+
- npm 9+

```bash
# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev
```

## Signaler un bug

Les bugs sont suivis via les [issues GitHub](https://github.com/votre-repo/DSFR-MCP/issues).

Avant de créer un rapport de bug, vérifiez que le problème n'a pas déjà été signalé.

**Un bon rapport de bug contient :**

- Un titre clair et descriptif
- Les étapes pour reproduire le problème
- Le comportement attendu
- Le comportement observé
- Des captures d'écran si pertinent
- Votre environnement :
  - **Docker** : `docker --version` et `docker-compose --version`
  - **Natif** : OS, version Node.js, npm, Claude Desktop
  - Mode d'installation utilisé (Docker/natif)
  - Logs du container : `docker-compose logs dsfr-mcp`

## Proposer une fonctionnalité

Les propositions de fonctionnalités sont également gérées via les issues.

**Une bonne proposition contient :**

- Un cas d'usage clair
- La solution proposée
- Les alternatives considérées
- Les impacts potentiels

## Soumettre une Pull Request

1. **Assurez-vous** que votre code suit le style du projet
2. **Ajoutez** des tests pour toute nouvelle fonctionnalité
3. **Mettez à jour** la documentation si nécessaire
4. **Vérifiez** que tous les tests passent : `npm test`
5. **Écrivez** un message de commit clair suivant la convention

### Convention de commits

Nous suivons la [Conventional Commits](https://www.conventionalcommits.org/fr/) :

- `feat:` Nouvelle fonctionnalité
- `fix:` Correction de bug
- `docs:` Documentation uniquement
- `style:` Formatage, point-virgules manquants, etc.
- `refactor:` Refactoring du code
- `test:` Ajout de tests
- `chore:` Maintenance, configuration

Exemples :
```
feat: ajout de l'outil de génération pour Vue.js
fix: correction de la recherche dans les patterns
docs: mise à jour du guide d'installation
```

## Style de code

- **Indentation** : 2 espaces
- **Quotes** : Simples pour JavaScript, doubles pour JSON
- **Point-virgule** : Toujours
- **ES6+** : Utilisez les fonctionnalités modernes de JavaScript
- **Commentaires** : En français pour la documentation, en anglais pour le code technique

### ESLint

Le projet utilise ESLint. Vérifiez votre code :

```bash
npm run lint
npm run lint:fix  # Pour corriger automatiquement
```

## Tests

### 🐳 Lancer les tests avec Docker (Recommandé)

```bash
# Dans le container de développement
docker-compose exec dsfr-mcp-dev npm test              # Tous les tests
docker-compose exec dsfr-mcp-dev npm run test:unit     # Tests unitaires
docker-compose exec dsfr-mcp-dev npm run test:integration # Tests d'intégration
docker-compose exec dsfr-mcp-dev npm run test:coverage # Couverture
docker-compose exec dsfr-mcp-dev npm run test:watch    # Mode watch

# Ou directement sur l'image de production
docker-compose exec dsfr-mcp npm test
```

### 📦 Tests natifs

```bash
# Tous les tests
npm test

# Tests unitaires
npm run test:unit

# Tests d'intégration
npm run test:integration

# Couverture
npm run test:coverage
```

### Écrire des tests

- Placez les tests unitaires dans `test/unit/`
- Placez les tests d'intégration dans `test/integration/`
- Nommez les fichiers de test `*.test.js`
- Utilisez des descriptions claires en français

Exemple :
```javascript
describe('DocumentationService', () => {
  describe('searchComponents', () => {
    it('devrait retourner les composants correspondant à la requête', async () => {
      // ...
    });
  });
});
```

## Documentation

- **README.md** : Gardez-le à jour avec les nouvelles fonctionnalités
- **JSDoc** : Documentez toutes les fonctions publiques
- **Exemples** : Ajoutez des exemples pour les nouvelles fonctionnalités
- **Changelog** : Mettez à jour le CHANGELOG.md

### Format JSDoc

```javascript
/**
 * Recherche des composants DSFR
 * @param {Object} params - Paramètres de recherche
 * @param {string} params.query - Terme de recherche
 * @param {string} [params.category] - Catégorie à filtrer
 * @param {number} [params.limit=10] - Nombre de résultats
 * @returns {Promise<Object>} Résultats de la recherche
 */
async function searchComponents(params) {
  // ...
}
```

## Questions ?

N'hésitez pas à ouvrir une issue pour toute question ou discussion !

Merci de contribuer à DSFR-MCP ! 🇫🇷
