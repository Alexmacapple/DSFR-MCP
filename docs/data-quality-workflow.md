# Workflow de Validation Continue de la Qualité des Données

Ce document décrit le système automatisé de validation de la qualité des données DSFR-MCP.

## Vue d'ensemble

Le système de validation continue permet de détecter automatiquement les problèmes de qualité des données à chaque modification du code, en exécutant des contrôles complets sur :

- ✅ **Intégrité des données** : Validation de la structure et du contenu des fiches Markdown
- ✅ **Métadonnées YAML** : Vérification de la conformité des métadonnées
- ✅ **Doublons** : Détection des contenus dupliqués

## Architecture

### Scripts impliqués

1. **`scripts/run-data-quality-checks.js`** - Script d'orchestration principal
2. **`scripts/verify-data-integrity.js`** - Validation de l'intégrité des données
3. **`scripts/validate-yaml-metadata.js`** - Validation des métadonnées YAML
4. **`scripts/analyze-duplicates.js`** - Détection des doublons

### Intégration CI/CD

Le workflow GitHub Actions (`.github/workflows/ci.yml`) exécute automatiquement la validation sur :
- 🔄 Tous les push sur les branches `main` et `develop`
- 🔄 Toutes les Pull Requests vers `main`

## Utilisation

### Exécution locale

```bash
# Validation complète des données
npm run test:data

# Validation individuelle (si nécessaire)
npm run verify-data
npm run validate-metadata
node scripts/analyze-duplicates.js
```

### Interprétation des résultats

Le script génère un rapport détaillé avec :

#### Codes de sortie
- `0` : Toutes les validations ont réussi ✅
- `1` : Une ou plusieurs validations ont échoué ❌

#### Format du rapport
```
🔍 VALIDATION CONTINUE DE LA QUALITÉ DES DONNÉES
============================================================
Démarrage à [timestamp]

📁 Répertoire de données valide: X fiches trouvées

🔍 Contrôle d'intégrité des données...
  ✅ Intégrité des données validée

📋 Validation des métadonnées YAML...
  ❌ X erreurs de métadonnées détectées

🔄 Analyse des doublons...
  ✅ Aucun doublon détecté

📊 RAPPORT DE QUALITÉ DES DONNÉES
----------------------------------------
Timestamp: [ISO timestamp]
Erreurs totales: X
Avertissements: X
Statut global: [RÉUSSI/ÉCHEC]
```

## Types de contrôles

### 1. Intégrité des données (`verify-data-integrity.js`)

**Objectif** : Vérifier que chaque fiche Markdown respecte la structure attendue

**Contrôles effectués** :
- Présence des sections obligatoires
- Hiérarchie correcte des titres (H1-H6)
- Structure du front-matter YAML
- Cohérence du contenu
- Accessibilité des liens et références

**Critères de réussite** :
- Toutes les fiches ont une structure valide
- Aucune section obligatoire manquante
- Liens et références accessibles

### 2. Métadonnées YAML (`validate-yaml-metadata.js`)

**Objectif** : Valider la conformité des métadonnées YAML dans chaque fiche

**Contrôles effectués** :
- Syntaxe YAML valide
- Présence des champs obligatoires (`title`, `category`, `tags`, etc.)
- Types de données corrects
- Valeurs dans les énumérations autorisées
- Cohérence entre métadonnées et contenu

**Critères de réussite** :
- Toutes les fiches ont des métadonnées YAML valides
- Tous les champs obligatoires sont présents
- Types et valeurs conformes au schéma

### 3. Analyse des doublons (`analyze-duplicates.js`)

**Objectif** : Détecter les contenus dupliqués ou quasi-identiques

**Contrôles effectués** :
- Comparaison de hachage MD5 des contenus
- Détection des doublons exacts
- Identification des contenus similaires
- Analyse des noms de fichiers dupliqués

**Critères de réussite** :
- Aucun contenu exactement identique
- Pas de doublons de noms de fichiers
- Structures cohérentes

## Configuration

### Variables d'environnement

Aucune variable d'environnement n'est requise. Le script détecte automatiquement l'emplacement des données.

### Chemins par défaut

- **Données** : `fiches-markdown-v2/`
- **Rapports** : `data/data-quality-report.json`
- **Scripts** : `scripts/`

### Personnalisation

Pour modifier les seuils ou critères de validation, éditez directement les scripts individuels :

```javascript
// Exemple dans verify-data-integrity.js
const REQUIRED_SECTIONS = ['Description', 'Utilisation', 'Bonnes pratiques'];

// Exemple dans validate-yaml-metadata.js
const REQUIRED_FIELDS = ['title', 'category', 'tags', 'description'];
```

## Gestion des erreurs

### Types d'erreurs

1. **Erreurs critiques** : Empêchent le succès de la CI
   - Structure de fiche invalide
   - Métadonnées manquantes ou incorrectes
   - Doublons détectés

2. **Avertissements** : Signalent des améliorations possibles
   - Sections recommandées manquantes
   - Métadonnées optionnelles absentes
   - Structures pouvant être optimisées

### Actions correctrices

#### Pour les erreurs de structure :
```bash
# Identifier les fichiers problématiques
npm run verify-data

# Corriger manuellement selon les messages d'erreur
```

#### Pour les erreurs de métadonnées :
```bash
# Lancer la validation détaillée
npm run validate-metadata

# Utiliser les suggestions d'amélioration
```

#### Pour les doublons :
```bash
# Générer le rapport d'analyse
node scripts/analyze-duplicates.js

# Consulter data/duplicate-analysis-report.json
# Fusionner ou supprimer les doublons identifiés
```

## Rapports générés

### `data/data-quality-report.json`

Rapport JSON complet avec :
```json
{
  "timestamp": "2025-08-06T22:06:22.134Z",
  "overall": {
    "passed": false,
    "errors": 105,
    "warnings": 336
  },
  "checks": [
    {
      "name": "Intégrité des données",
      "passed": true,
      "errors": [],
      "warnings": [],
      "stats": {
        "totalFiles": 213,
        "validFiles": 213,
        "invalidFiles": 0
      }
    }
  ]
}
```

### Artifacts CI/CD

Les rapports sont automatiquement uploadés comme artifacts dans GitHub Actions :
- `test-results-node-[version]/data-quality-report.json`
- Disponibles pendant 90 jours après l'exécution

## Intégration avec l'écosystème

### Hooks Git (optionnel)

Pour validation en pré-commit :
```bash
# .git/hooks/pre-commit
#!/bin/sh
npm run test:data || exit 1
```

### VS Code (recommandé)

Tâche dans `.vscode/tasks.json` :
```json
{
  "label": "Validate Data Quality",
  "type": "npm",
  "script": "test:data",
  "group": "test",
  "presentation": {
    "echo": true,
    "reveal": "always"
  }
}
```

## Maintenance

### Mise à jour des critères

Les critères de validation évoluent avec le projet. Pour mettre à jour :

1. Modifier les scripts individuels selon les nouveaux besoins
2. Tester localement avec `npm run test:data`
3. Mettre à jour cette documentation si nécessaire
4. Créer une PR avec les modifications

### Performance

Le workflow complet prend environ 10-30 secondes selon la taille du dataset :
- Intégrité : ~5-10 secondes
- Métadonnées : ~3-8 secondes  
- Doublons : ~2-10 secondes

### Dépannage

#### Le script échoue au démarrage
```bash
# Vérifier les permissions
chmod +x scripts/run-data-quality-checks.js

# Vérifier les dépendances
npm ci
```

#### Erreurs de chemins
```bash
# Vérifier la structure des dossiers
ls -la fiches-markdown-v2/
ls -la scripts/
```

#### Timeout en CI
```bash
# Augmenter le timeout dans .github/workflows/ci.yml
timeout-minutes: 10
```

## Contribuer

Pour améliorer le workflow de validation :

1. Fork le repository
2. Créez une branche feature : `git checkout -b feature/improve-data-validation`
3. Modifiez les scripts selon vos besoins
4. Testez localement : `npm run test:data`
5. Créez une PR avec description détaillée des améliorations

---

> 📚 **Documentation mise à jour** : Août 2025  
> 🔧 **Version du workflow** : 1.0.0  
> 🎯 **Compatibilité** : Node.js 18.x, 20.x