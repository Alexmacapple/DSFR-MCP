# 🏛️ Exemple : Portail citoyen et téléservices

> **Cas d'usage :** Portail de services en ligne pour les citoyens - démarches administratives, téléservices et guichet unique numérique d'une institution publique française.

## ✅ Usage institutionnel conforme

**Cet exemple respecte l'usage exclusif du DSFR** réservé aux institutions publiques françaises. Ce portail représente l'interface citoyenne d'une administration : préfecture, mairie, conseil départemental, ou service de l'État proposant des téléprocédures.

## 🎯 Objectif

Démontrer l'utilisation de DSFR-MCP pour créer un portail citoyen complet avec :
- Interface d'accueil et présentation des services
- Catalogue des démarches et téléprocédures  
- Espace personnel citoyen sécurisé
- Formulaires administratifs conformes

## 📋 Structure du projet

```
03-portail-citoyen/
├── README.md
├── package.json
├── src/
│   ├── components/
│   │   ├── Auth/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── FranceConnect.jsx
│   │   ├── Services/
│   │   │   ├── ServiceCatalog.jsx
│   │   │   ├── ServiceCard.jsx
│   │   │   └── ServiceSearch.jsx
│   │   ├── Forms/
│   │   │   ├── DemandeActeNaissance.jsx
│   │   │   ├── DemandePasseport.jsx
│   │   │   └── ChangementAdresse.jsx
│   │   ├── Account/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── DemarchesEnCours.jsx
│   │   │   └── Notifications.jsx
│   │   └── Layout/
│   │       ├── Header.jsx
│   │       ├── Navigation.jsx
│   │       └── Footer.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Services.jsx
│   │   ├── MonCompte.jsx
│   │   └── Demarche.jsx
│   └── services/
│       ├── auth.js
│       ├── demarches.js
│       └── notifications.js
└── docs/
    └── INTEGRATION_SI.md
```

## 🚀 Commandes Claude Desktop utilisées

### Interface d'accueil citoyenne
```
Crée une page d'accueil de portail citoyen avec :
- En-tête DSFR avec logo République Française
- Section héro présentant les services principaux
- Cartes d'accès rapide aux démarches populaires
- Actualités et informations importantes
```

### Catalogue de services
```
Génère un catalogue des démarches administratives avec :
- Navigation par thématiques (État civil, Urbanisme, etc.)
- Moteur de recherche des téléprocédures
- Fiches explicatives pour chaque démarche
- Niveaux de dématérialisation et délais
```

### Formulaires de démarches
```
Crée des formulaires administratifs conformes avec :
- Demande d'acte de naissance sécurisée
- Formulaire de changement d'adresse
- Déclaration préalable de travaux
- Validation CERFA et contrôles réglementaires
```

## 🛠️ Outils DSFR-MCP utilisés

- ✅ `search_dsfr_components` - Composants portail citoyen
- ✅ `generate_dsfr_component` - Formulaires administratifs
- ✅ `validate_dsfr_html` - Conformité réglementaire  
- ✅ `check_accessibility` - Accessibilité RGAA obligatoire
- ✅ `create_dsfr_theme` - Thème institutionnel personnalisé
- ✅ `analyze_dsfr_usage` - Audit conformité DSFR
- ✅ `export_documentation` - Documentation téléprocédures

## 🎨 Composants DSFR citoyens

### Authentication Components
- `<FranceConnectButton />` - Bouton connexion FranceConnect
- `<LoginForm />` - Formulaire connexion locale
- `<IdentityVerification />` - Vérification d'identité
- `<SecureSession />` - Gestion session sécurisée

### Service Components  
- `<ServiceCatalog />` - Catalogue des téléprocédures
- `<ServiceCard />` - Carte service avec informations
- `<DeadlineStatus />` - Statut et délais démarche
- `<RequiredDocuments />` - Liste pièces justificatives
- `<ProcessStatus />` - Suivi d'avancement

### Form Components
- `<AdministrativeForm />` - Formulaire réglementaire
- `<FileUpload />` - Upload pièces justificatives
- `<DigitalSignature />` - Signature électronique
- `<ValidationSummary />` - Récapitulatif de demande
- `<ReceiptGeneration />` - Génération d'accusé de réception

## 🏛️ Services citoyens intégrés

### Téléprocédures courantes
- ✅ **État civil** - Actes de naissance, mariage, décès
- ✅ **Identité** - Demande passeport, CNI, permis
- ✅ **Domicile** - Changement d'adresse, attestations
- ✅ **Urbanisme** - Permis de construire, déclarations
- ✅ **Véhicules** - Immatriculation, contrôle technique

### Espace personnel citoyen
- ✅ **Tableau de bord** - Vue d'ensemble des démarches
- ✅ **Suivi en temps réel** - État d'avancement
- ✅ **Messagerie sécurisée** - Communication administration
- ✅ **Coffre-fort numérique** - Stockage documents officiels
- ✅ **Historique complet** - Archive des demandes

### Intégrations système
- ✅ **FranceConnect** - Authentification unique
- ✅ **API Particulier** - Récupération données
- ✅ **Démarches Simplifiées** - Workflows administratifs  
- ✅ **MonComptePro** - Professionnels et entreprises
- ✅ **Paiement en ligne** - PayFiP et cartes bancaires

## 🔧 Installation et développement

### 1. Prérequis
```bash
# DSFR-MCP configuré (voir Quickstart)
# Node.js 18+
# Certificats SSL (développement HTTPS obligatoire)
```

### 2. Installation
```bash
cd examples/03-portail-citoyen
npm install

# Configuration certificats SSL dev
npm run setup:ssl

# Variables d'environnement
cp .env.example .env
# Configurer clés API (FranceConnect, etc.)

# Base de données
npm run db:init
```

### 3. Développement sécurisé
```bash
# Serveur HTTPS obligatoire (téléprocédures)
npm run dev:secure

# Tests de sécurité
npm run test:security

# Audit conformité RGAA
npm run audit:accessibility

# Build production avec optimisations sécurité
npm run build:production
```

### 4. Génération avec Claude
```
Étends ce portail citoyen avec :
- Module de prise de rendez-vous en ligne
- Chat bot d'aide aux démarches
- Interface multilingue (régions frontalières)
- Notifications push et SMS citoyens
```

## 📝 Prompts Claude recommandés

### Extensions fonctionnelles
```
Ajoute à ce portail citoyen :
- Système de prise de rendez-vous préfecture
- Module de réclamations et médiation
- Interface de participation citoyenne
- Tableau de bord statistiques publiques
```

### Conformité et sécurité
```
Renforce la sécurité et conformité avec :
- Authentification à double facteur
- Chiffrement bout en bout des données
- Logs d'audit conformes à la réglementation
- Protection RGPD et droit à l'oubli
```

### Accessibilité avancée
```
Optimise l'accessibilité pour :
- Support lecteurs d'écran complet
- Navigation clavier exclusive
- Adaptation déficiences visuelles
- Simplification cognitive (FALC)
```

## 🎯 Points d'apprentissage

1. **Téléprocédures** : Dématérialisation démarches administratives
2. **Sécurité publique** : Standards de sécurité des SI étatiques
3. **Accessibilité RGAA** : Conformité obligatoire niveau AA
4. **Intégration SI** : APIs gouvernementales et interconnexions
5. **UX citoyenne** : Expérience utilisateur service public
6. **Conformité légale** : RGPD, archivage, transparence

## 📊 Standards du service public

### Obligations réglementaires
- **RGAA 4.1** - Accessibilité numérique obligatoire
- **RGS** - Référentiel Général de Sécurité  
- **RGPD** - Protection données personnelles
- **Standard CERFA** - Formulaires administratifs officiels
- **Archivage légal** - Conservation réglementaire

### Niveaux de service
- **Disponibilité** : 99.5% (SLA service public)
- **Performance** : < 3s chargement pages
- **Sécurité** : Chiffrement TLS 1.3 minimum
- **Support** : Assistance multicanal citoyens
- **Conformité** : Audits accessibilité trimestriels

## 📈 Métriques de qualité

- **Accessibilité** : AA RGAA 4.1 (audit externe)
- **Sécurité** : A+ SSL Labs + audit ANSSI
- **Performance** : 95+ Lighthouse (mobile/desktop)
- **SEO** : Référencement naturel optimisé
- **Utilisabilité** : Tests utilisateurs représentatifs
- **Conformité** : 100% standards techniques de l'État

## 🚀 Déploiement en production

### Infrastructure publique
```bash
# Environnement de production sécurisé
export NODE_ENV=production
export HTTPS_PORT=443
export SSL_CERT_PATH=/etc/ssl/certs/
export DB_ENCRYPT=true

# Déploiement avec CI/CD sécurisée
npm run deploy:production

# Monitoring et alertes
npm run monitoring:start
```

### Hébergement conforme
```yaml
# Infrastructure recommandée
hosting:
  provider: "Cloud public qualifié SecNumCloud"
  location: "France (souveraineté numérique)"
  backup: "3-2-1 avec archivage légal"
  monitoring: "24/7 avec astreinte"
  compliance: "HDS si données de santé"
```

## 💡 Cas d'usage institutionnels

### Implémentations types
- **Préfectures** - Démarches régaliennes et titres
- **Mairies** - Services de proximité et état civil
- **Conseils départementaux** - Action sociale et transport
- **CAF/CPAM** - Prestations sociales et santé
- **Pôle Emploi** - Services aux demandeurs d'emploi

### Bénéfices transformation numérique
- **Efficacité administrative** : Réduction délais et coûts
- **Satisfaction citoyenne** : Services 24h/7j accessibles
- **Inclusion numérique** : Accès garanti à tous les publics  
- **Transparence démocratique** : Traçabilité et information
- **Sécurité juridique** : Conformité totale aux obligations

## 🔗 Écosystème de l'État

### APIs et services intégrés
- **FranceConnect** - Identité numérique unique
- **API Particulier** - Données administratives citoyens
- **Démarches Simplifiées** - Plateforme de dématérialisation
- **MonComptePro** - Services aux professionnels
- **data.gouv.fr** - Données publiques ouvertes

### Partenaires techniques
- **DINUM** - Direction interministérielle du numérique
- **ANSSI** - Agence nationale cybersécurité
- **CNIL** - Protection données personnelles
- **DGFIP** - Paiements publics et fiscalité

## 🎉 Résultat attendu

Un portail citoyen complet, sécurisé et accessible, respectant tous les standards de l'administration électronique française. Interface moderne utilisant le DSFR pour une expérience utilisateur cohérente avec l'ensemble des services publics numériques, facilitant les démarches administratives de tous les citoyens.