# Activer Dependabot (npm + Docker)

**Contexte**  
Recevoir des PRs automatiques pour mettre à jour les dépendances.

**Tâches**  
- [ ] Ajouter `.github/dependabot.yml` :  
  ```yaml
  version: 2
  updates:
    - package-ecosystem: "npm"
      directory: "/"
      schedule:
        interval: "weekly"
      open-pull-requests-limit: 5

    - package-ecosystem: "docker"
      directory: "/"
      schedule:
        interval: "weekly"
      open-pull-requests-limit: 5
  ```
- [ ] Merger au besoin les PRs créées par Dependabot.

**Definition of Done**  
- Dependabot ouvre des PRs sur npm et Docker.

**Labels**: `security`, `automation`  
**Milestone**: `V1.0.0 – Stable`
