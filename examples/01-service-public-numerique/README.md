# 🇫🇷 Exemple : Service public numérique de l'État

> **Cas d'usage :** Site web d'un service public national - ministère, direction générale, ou service déconcentré de l'État français utilisant le DSFR réglementaire.

## ✅ Usage DSFR strictement conforme

**Cet exemple respecte parfaitement l'usage exclusif du DSFR** : il s'agit d'un service de l'État français (ministère, direction générale, préfecture, ambassade) qui DOIT utiliser le Système de Design de l'État conformément à la réglementation.

## 🎯 Objectif

Démontrer l'utilisation correcte de DSFR-MCP pour créer un site institutionnel de l'État avec :
- Page d'accueil officielle avec identité République Française
- Présentation des missions et services publics
- Informations pratiques et contacts institutionnels  
- Actualités officielles et communications gouvernementales

## 📋 Structure du projet

```
01-service-public-numerique/
├── README.md
├── index.html              # Page d'accueil institutionnelle
├── missions.html           # Présentation des missions
├── actualites.html         # Actualités officielles
├── contact.html            # Coordonnées et contacts
├── organisation.html       # Organigramme et équipes
└── assets/
    ├── css/
    │   └── custom.css      # Styles conformes DSFR
    ├── js/
    │   └── main.js         # Scripts institutionnels
    └── images/
        ├── logo-republique-francaise.png
        └── logo-ministere.png
```

## 🚀 Commandes Claude Desktop utilisées

### Page d'accueil institutionnelle
```
Crée une page d'accueil pour un ministère français avec :
- En-tête DSFR officiel avec logo République Française
- Section héro présentant la mission du service public
- Cartes d'accès aux principales informations
- Zone actualités officielles et communiqués
- Pied de page institutionnel réglementaire
```

### Pages de contenu officiel
```
Génère les pages institutionnelles avec :
- Page missions et attributions du service
- Organigramme et présentation des équipes
- Informations pratiques et coordonnées
- Actualités et communications officielles
```

### Validation conformité État
```
Valide ce site pour la conformité DSFR stricte et l'accessibilité RGAA obligatoire pour les services publics
```

## 🛠️ Outils DSFR-MCP utilisés

- ✅ `search_dsfr_components` - Composants institutionnels officiels
- ✅ `generate_dsfr_component` - Génération conforme réglementation
- ✅ `validate_dsfr_html` - Validation stricte DSFR
- ✅ `check_accessibility` - Conformité RGAA obligatoire
- ✅ `create_dsfr_theme` - Thème République Française
- ✅ `export_documentation` - Documentation officielle

## 🏛️ Exemples de services concernés

### Ministères et secrétariats d'État
- **Ministère de l'Intérieur** - Services préfectoraux et sécurité
- **Ministère de la Justice** - Services judiciaires et pénitentiaires
- **Ministère des Finances** - DGFIP, Douanes, Trésor public
- **Ministère de l'Éducation** - Rectorats et services académiques

### Directions et services déconcentrés  
- **Préfectures** - Services de l'État en département
- **Directions régionales** - DREAL, DREETS, ARS
- **Services spécialisés** - ANSSI, CNIL, Pôle Emploi
- **Établissements publics** - ANTS, CNOUS, CROUS

### Services à l'international
- **Ambassades** - Représentations diplomatiques
- **Consulats** - Services consulaires à l'étranger
- **Instituts français** - Coopération culturelle
- **Alliances françaises** - Enseignement du français

## 📊 Composants DSFR obligatoires

### En-tête institutionnel
- **Logo République Française** - Obligatoire et normalisé
- **Nom du service** - Dénomination officielle
- **Devise République** - "Liberté, Égalité, Fraternité"
- **Navigation principale** - Structure réglementaire

### Contenus officiels
- **Missions et attributions** - Définies par décret
- **Organigramme** - Hiérarchie administrative  
- **Textes de référence** - Base légale du service
- **Coordonnées officielles** - Adresses et contacts

### Pied de page réglementaire
- **Mentions légales** - Obligatoires pour tout site public
- **Accessibilité** - Déclaration RGAA
- **Données personnelles** - Information RGPD
- **Liens institutionnels** - legifrance.gouv.fr, etc.

## 🎯 Points d'apprentissage

1. **Conformité réglementaire** : Usage strict du DSFR selon la loi
2. **Identité institutionnelle** : Charte graphique République Française  
3. **Accessibilité obligatoire** : RGAA 4.1 niveau AA requis
4. **Communication officielle** : Ton et registre administratifs
5. **Mentions légales** : Obligations spécifiques service public
6. **Transparence administrative** : Information du citoyen

## 📋 Obligations légales

### Conformité DSFR obligatoire
- **Décret du 14 septembre 2021** - Usage obligatoire DSFR
- **Circulaire du 30 septembre 2021** - Modalités d'application
- **Référentiel technique** - Spécifications à respecter
- **Contrôles DINUM** - Vérifications de conformité

### Accessibilité RGAA
- **Article 47 de la loi du 11 février 2005** - Accessibilité obligatoire
- **Décret du 24 juillet 2019** - Modalités d'application RGAA
- **Niveau AA** - Exigence minimale pour services publics
- **Déclaration d'accessibilité** - Publication obligatoire

### Protection des données
- **RGPD** - Règlement européen applicable
- **Loi Informatique et Libertés** - Cadre national
- **Cookies et traceurs** - Consentement selon CNIL
- **Archivage** - Conservation selon Code du patrimoine

## 🔧 Installation et utilisation

### 1. Prérequis réglementaires
```bash
# DSFR-MCP configuré (voir Quickstart)
# Validation juridique du projet
# Autorisation hiérarchique d'usage DSFR
```

### 2. Développement conforme
```bash
cd examples/01-service-public-numerique

# Utilisation directe des fichiers HTML
# Serveur local pour tests (optionnel)
python -m http.server 8000

# Validation conformité DSFR
npm run validate:dsfr

# Audit accessibilité RGAA
npm run audit:rgaa
```

### 3. Personnalisation avec Claude
```
Adapte ce site institutionnel pour [nom du service] avec :
- Modification du nom et logo du service
- Adaptation des missions selon les attributions
- Personnalisation des coordonnées et contacts
- Ajout des actualités spécifiques au service
```

## 📝 Prompts Claude recommandés

### Adaptation par service
```
Adapte ce modèle pour la Direction départementale des territoires (DDT) avec :
- Missions urbanisme, environnement et logement
- Organigramme avec services spécialisés
- Formulaires de demandes d'autorisation
- Actualités réglementaires du secteur
```

### Enrichissement fonctionnel
```
Ajoute à ce site institutionnel :
- Moteur de recherche dans la réglementation
- Système d'abonnement aux actualités
- Interface multilingue (services consulaires)
- Module de prise de rendez-vous
```

### Optimisation technique
```
Optimise ce site public pour :
- Performance maximale (budget public)
- Référencement naturel institutionnel
- Sécurité renforcée (standards ANSSI)
- Monitoring et métriques d'usage
```

## 📈 Métriques service public

### Standards de qualité
- **Disponibilité** : 99,5% minimum (SLA service public)
- **Performance** : < 2s chargement (budget public optimisé)
- **Accessibilité** : 100% RGAA 4.1 niveau AA
- **Sécurité** : Standards ANSSI + chiffrement TLS 1.3
- **SEO** : Référencement institutionnel optimal

### Indicateurs de service
- **Taux de satisfaction** : Enquête citoyens trimestrielle  
- **Accessibilité réelle** : Tests utilisateurs en situation handicap
- **Performance mobile** : Adaptation tous supports
- **Conformité DSFR** : Audit technique semestriel
- **Transparence** : Publication métriques sur data.gouv.fr

## 🎉 Résultat attendu

Un site web institutionnel parfaitement conforme au DSFR et à la réglementation française, respectant toutes les obligations légales des services publics numériques. Interface officielle utilisant l'identité graphique de la République Française pour garantir la reconnaissance et la confiance des citoyens.

## 💡 Exemples d'URL réelles conformes

- **interieur.gouv.fr** - Ministère de l'Intérieur
- **economie.gouv.fr** - Ministère de l'Économie  
- **education.gouv.fr** - Ministère de l'Éducation nationale
- **justice.gouv.fr** - Ministère de la Justice
- **diplomatie.gouv.fr** - Ministère des Affaires étrangères

Ces sites utilisent tous le DSFR conformément à la réglementation en vigueur.