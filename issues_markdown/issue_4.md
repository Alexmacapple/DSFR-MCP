# Mettre en place la CI minimale (GitHub Actions)

**Contexte**  
Exécuter automatiquement lint + build Docker à chaque push/PR.

**Tâches**  
- [ ] Ajouter `.github/workflows/ci.yml` :  
  ```yaml
  name: CI

  on:
    push:
      branches:
        - main
        - v2
    pull_request:

  jobs:
    build:
      runs-on: ubuntu-latest

      steps:
        - name: Checkout repository
          uses: actions/checkout@v4

        - name: Setup Node.js
          uses: actions/setup-node@v4
          with:
            node-version: '20'

        - name: Install dependencies
          run: npm install

        - name: Lint
          run: npm run lint --if-present

        - name: Build Docker image
          run: docker build . --file Dockerfile --tag dsfr-mcp:ci
  ```
- [ ] Pousser sur `main` et vérifier que le job passe.

**Definition of Done**  
- Le workflow s’exécute sur `main` et `v2`.  
- Le badge build (issue 8) peut afficher “passing”.

**Labels**: `automation`  
**Milestone**: `V1.0.0 – Stable`
