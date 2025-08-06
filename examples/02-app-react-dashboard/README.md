# 🏛️ Exemple : Dashboard administratif public React + DSFR

> **Cas d'usage :** Application React pour l'administration publique française - tableau de bord de gestion interne d'une préfecture, ministère ou collectivité territoriale.

## ⚠️ Usage institutionnel exclusif

**Le DSFR est réservé exclusivement aux institutions publiques françaises** : administrations, préfectures, ministères, ambassades, collectivités territoriales, etc. Cet exemple illustre un dashboard interne pour ces organismes publics.

## 🎯 Objectif

Démontrer l'intégration de DSFR-MCP dans une application React d'administration publique avec :
- Dashboard de métriques pour services publics
- Gestion des agents et habilitations
- Formulaires administratifs complexes
- Interface de back-office institutionnel

## 📋 Structure du projet

```
02-app-react-dashboard/
├── README.md
├── package.json
├── src/
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── Header.jsx
│   │   │   ├── Navigation.jsx
│   │   │   └── Footer.jsx
│   │   ├── Dashboard/
│   │   │   ├── MetricsCards.jsx
│   │   │   ├── ChartWidget.jsx
│   │   │   └── ActivityFeed.jsx
│   │   ├── Users/
│   │   │   ├── UserList.jsx
│   │   │   ├── UserForm.jsx
│   │   │   └── UserModal.jsx
│   │   └── Common/
│   │       ├── Button.jsx
│   │       ├── Card.jsx
│   │       └── Form.jsx
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Users.jsx
│   │   └── Settings.jsx
│   ├── hooks/
│   │   └── useDSFR.js
│   ├── utils/
│   │   └── validation.js
│   └── App.jsx
├── public/
│   └── index.html
└── docs/
    └── DEVELOPMENT.md
```

## 🚀 Commandes Claude Desktop utilisées

### Génération des composants React
```
Convertis ces composants DSFR en composants React avec hooks modernes :
- En-tête avec navigation responsive
- Cartes de métriques avec icônes
- Tableau d'utilisateurs avec tri et pagination
- Formulaire de création d'utilisateur avec validation
```

### Architecture de l'application
```
Génère l'architecture React complète pour un dashboard administratif utilisant :
- React Router pour la navigation
- Context API pour le state management
- Hooks personnalisés pour DSFR
- Gestion des erreurs et du loading
```

### Configuration et tooling
```
Crée la configuration complète pour :
- Package.json avec toutes les dépendances
- Configuration Webpack/Vite optimisée
- Scripts de build et développement
- Tests unitaires avec Testing Library
```

## 🛠️ Technologies utilisées

- **React 18** : Framework principal
- **React Router v6** : Navigation SPA
- **@gouvfr/dsfr** : Système de design
- **Vite** : Build tool moderne
- **TypeScript** : Typage statique
- **React Hook Form** : Gestion des formulaires
- **React Query** : Gestion des données
- **Vitest** : Tests unitaires

## 🎨 Composants DSFR intégrés

### Layout Components
- `<Header />` - En-tête avec navigation
- `<Navigation />` - Menu latéral responsive
- `<Footer />` - Pied de page institutionnel

### UI Components
- `<Button />` - Boutons DSFR avec variantes
- `<Card />` - Cartes avec différents styles
- `<Form />` - Formulaires avec validation
- `<Table />` - Tableaux avec tri et pagination
- `<Modal />` - Modales accessibles
- `<Alert />` - Messages d'alerte

### Dashboard Components
- `<MetricCard />` - Cartes de métriques
- `<Chart />` - Graphiques avec données
- `<ActivityFeed />` - Flux d'activité
- `<QuickActions />` - Actions rapides

## 📊 Fonctionnalités implémentées

### Dashboard
- ✅ Métriques temps réel
- ✅ Graphiques interactifs
- ✅ Flux d'activité
- ✅ Actions rapides

### Gestion des agents publics
- ✅ Annuaire des agents avec recherche et filtres
- ✅ Création/édition de comptes agents
- ✅ Gestion des habilitations et profils
- ✅ Import/export données RH

### Administration publique
- ✅ Configuration services publics
- ✅ Logs d'activité et monitoring
- ✅ Archivage réglementaire
- ✅ Gestion des notifications citoyens

## 🛠️ Outils DSFR-MCP utilisés

- ✅ `convert_to_framework` - Conversion HTML vers React
- ✅ `generate_dsfr_component` - Génération composants
- ✅ `validate_dsfr_html` - Validation des templates
- ✅ `check_accessibility` - Tests accessibilité
- ✅ `create_dsfr_theme` - Thème personnalisé
- ✅ `analyze_dsfr_usage` - Analyse du code React
- ✅ `suggest_improvements` - Optimisations

## 🔧 Installation et développement

### 1. Prérequis
```bash
# DSFR-MCP configuré (voir Quickstart)
# Node.js 18+
# Git
```

### 2. Installation
```bash
cd examples/02-app-react-dashboard
npm install
```

### 3. Développement
```bash
# Démarrage du serveur de dev
npm run dev

# Tests
npm run test

# Build production
npm run build

# Preview production
npm run preview
```

### 4. Génération avec Claude
```
Génère les composants manquants :
- Composant de graphique avec Chart.js
- Hook personnalisé pour la gestion des utilisateurs
- Pages d'administration avancée
- Tests unitaires pour tous les composants
```

## 📝 Prompts Claude recommandés

### Ajout de fonctionnalités
```
Ajoute à cette application React :
- Système de notifications en temps réel
- Module de reporting avec exports PDF
- Interface de configuration des permissions
- Dashboard mobile-first optimisé
```

### Optimisation performance
```
Optimise cette application React pour :
- Lazy loading des composants
- Memoization appropriée
- Bundle splitting optimal
- Performance mobile
```

### Tests et qualité
```
Génère une suite de tests complète avec :
- Tests unitaires pour chaque composant
- Tests d'intégration pour les workflows
- Tests e2e avec Cypress
- Configuration de coverage
```

## 🎯 Points d'apprentissage

1. **Intégration DSFR/React** : Bonnes pratiques
2. **Composants réutilisables** : Architecture modulaire
3. **State management** : Context + hooks
4. **Performance** : Optimisations React
5. **Accessibilité** : RGAA en application SPA
6. **Tests** : Stratégie de test complète

## 📈 Métriques de qualité

- **Bundle size** : < 500KB gzipped
- **Performance** : 90+ Lighthouse
- **Accessibilité** : AA (RGAA 4.1)
- **Tests coverage** : 95%+
- **TypeScript** : Strict mode

## 🚀 Déploiement

### Build production
```bash
npm run build
# Build optimisé dans /dist
```

### Docker (optionnel)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["npx", "serve", "dist"]
```

## 💡 Cas d'usage institutionnels

### Exemples d'implémentation publique
- **Préfectures** - Dashboard gestion des démarches administratives
- **Ministères** - Interface de pilotage des services
- **Collectivités** - Gestion des services municipaux  
- **Établissements publics** - Back-office de gestion interne

### Bénéfices pour l'administration
- **Conformité DSFR** - Respect du système de design de l'État
- **Accessibilité RGAA** - Conforme aux obligations légales
- **Cohérence institutionnelle** - Identité visuelle République Française
- **Efficacité administrative** - Composants standardisés et testés

## 🎉 Résultat attendu

Une application React moderne pour l'administration publique française, performante et accessible, intégrant parfaitement le DSFR avec tous les composants nécessaires pour un back-office institutionnel professionnel.