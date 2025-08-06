# 🚀 Quickstart DSFR-MCP - De zéro à votre première page en 30 minutes

> **Objectif :** Créer une page web complète utilisant le Système de Design de l'État Français (DSFR) avec l'aide de DSFR-MCP et Claude Desktop.

**Durée estimée :** 30 minutes  
**Prérequis :** Node.js 18+, Claude Desktop

---

## 📋 Étapes du tutorial

1. [⚡ Setup DSFR-MCP (5 min)](#-setup-dsfr-mcp-5-min)
2. [🖥️ Configuration Claude Desktop (5 min)](#️-configuration-claude-desktop-5-min) 
3. [🎨 Créer votre premier composant (10 min)](#-créer-votre-premier-composant-10-min)
4. [📄 Construire une page complète (10 min)](#-construire-une-page-complète-10-min)

---

## ⚡ Setup DSFR-MCP (5 min)

### Option A : Installation Docker (Recommandée)

```bash
# Cloner le dépôt
git clone https://github.com/Alexmacapple/DSFR-MCP.git
cd DSFR-MCP

# Lancer avec Docker
docker-compose up -d

# Configurer Claude Desktop automatiquement
./docker/scripts/configure-claude.sh
```

### Option B : Installation Node.js

```bash
# Cloner et installer
git clone https://github.com/Alexmacapple/DSFR-MCP.git
cd DSFR-MCP
npm install

# Lancer le serveur MCP
npm start
```

### ✅ Vérification

Votre serveur DSFR-MCP est prêt si vous voyez :
```
✅ DSFR-MCP Server v1.4.1 started
🔧 16/16 outils MCP chargés avec succès
🚀 Serveur prêt sur stdio
```

---

## 🖥️ Configuration Claude Desktop (5 min)

### 1. Ouvrir Claude Desktop

Lancez l'application Claude Desktop sur votre machine.

### 2. Vérifier la configuration MCP

La configuration devrait être automatique avec le script. Sinon, ajoutez manuellement dans `claude_desktop_config.json` :

```json
{
  "mcpServers": {
    "dsfr-mcp": {
      "command": "node",
      "args": ["./src/index.js"],
      "cwd": "/chemin/vers/DSFR-MCP"
    }
  }
}
```

### 3. Redémarrer Claude Desktop

Fermez et relancez Claude Desktop pour charger DSFR-MCP.

### ✅ Test de connexion

Dans Claude Desktop, tapez :
```
Peux-tu rechercher des composants DSFR pour "bouton" ?
```

Si ça fonctionne, Claude utilisera l'outil `search_dsfr_components` ! 🎉

---

## 🎨 Créer votre premier composant (10 min)

Maintenant, nous allons créer nos premiers composants DSFR avec l'aide de Claude en utilisant les 16 outils DSFR-MCP disponibles.

### Étape 1 : Générer un bouton DSFR

Dans Claude Desktop :

```
Génère-moi un bouton DSFR complet avec les variantes principales (primaire, secondaire, tertiaire).
```

Claude utilisera `generate_dsfr_component` et vous donnera :

```html
<!-- Bouton principal -->
<button class="fr-btn">
  Action principale
</button>

<!-- Bouton secondaire -->
<button class="fr-btn fr-btn--secondary">
  Action secondaire
</button>

<!-- Bouton tertiaire -->
<button class="fr-btn fr-btn--tertiary">
  Action tertiaire
</button>
```

### Étape 2 : Ajouter un formulaire

```
Crée-moi un formulaire de contact DSFR avec nom, email et message.
```

Claude génèrera :

```html
<form class="fr-form">
  <div class="fr-form-group">
    <label class="fr-label" for="nom">
      Nom complet
      <span class="fr-hint-text">Votre nom et prénom</span>
    </label>
    <input class="fr-input" type="text" id="nom" name="nom" required>
  </div>

  <div class="fr-form-group">
    <label class="fr-label" for="email">
      Adresse électronique
    </label>
    <input class="fr-input" type="email" id="email" name="email" required>
  </div>

  <div class="fr-form-group">
    <label class="fr-label" for="message">
      Message
    </label>
    <textarea class="fr-input" id="message" name="message" rows="4" required></textarea>
  </div>

  <button class="fr-btn" type="submit">
    Envoyer le message
  </button>
</form>
```

### Étape 3 : Validation du code

```
Valide ce code HTML pour la conformité DSFR et l'accessibilité.
```

Claude utilisera `validate_dsfr_html` et `check_accessibility` pour vérifier votre code !

---

## 📄 Construire une page complète (10 min)

Maintenant, assemblons tout dans une page complète.

### Créer la structure de base

```
Crée-moi une page HTML complète avec :
- En-tête DSFR avec navigation
- Section héro avec titre et bouton
- Le formulaire de contact qu'on a créé
- Pied de page DSFR

Pour un service public de l'État français.
```

Claude assemblera tout avec `generate_dsfr_component` :

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mairie de Exemple - Contact</title>
    <link href="https://unpkg.com/@gouvfr/dsfr@latest/dist/dsfr.min.css" rel="stylesheet">
</head>

<body>
    <!-- En-tête -->
    <header class="fr-header">
        <div class="fr-header__body">
            <div class="fr-container">
                <div class="fr-header__body-row">
                    <div class="fr-header__brand fr-enlarge-link">
                        <div class="fr-header__brand-top">
                            <div class="fr-header__logo">
                                <p class="fr-logo">
                                    République
                                    <br>Française
                                </p>
                            </div>
                            <div class="fr-header__operator">
                                <img class="fr-responsive-img" src="logo-service.png" alt="Service public">
                            </div>
                        </div>
                        <div class="fr-header__service">
                            <a href="/" title="Accueil - Service public">
                                <p class="fr-header__service-title">Service public</p>
                            </a>
                            <p class="fr-header__service-tagline">Au service des citoyens</p>
                        </div>
                    </div>
                    <div class="fr-header__tools">
                        <div class="fr-header__tools-links">
                            <ul class="fr-links-group">
                                <li>
                                    <a class="fr-link" href="/contact">Contact</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="fr-header__menu fr-modal" id="modal-header-navigation">
            <div class="fr-container">
                <nav class="fr-nav" aria-label="Menu principal">
                    <ul class="fr-nav__list">
                        <li class="fr-nav__item">
                            <a class="fr-nav__link" href="/" aria-current="page">Accueil</a>
                        </li>
                        <li class="fr-nav__item">
                            <a class="fr-nav__link" href="/demarches">Démarches</a>
                        </li>
                        <li class="fr-nav__item">
                            <a class="fr-nav__link" href="/actualites">Actualités</a>
                        </li>
                        <li class="fr-nav__item">
                            <a class="fr-nav__link" href="/contact">Contact</a>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    </header>

    <!-- Contenu principal -->
    <main>
        <!-- Section héro -->
        <div class="fr-container fr-py-6w">
            <div class="fr-grid-row fr-grid-row--gutters">
                <div class="fr-col-12 fr-col-md-8">
                    <h1 class="fr-h1">Contactez notre service</h1>
                    <p class="fr-text--lead">
                        Une question, une demande, une suggestion ? 
                        Notre équipe est à votre écoute pour vous accompagner dans vos démarches administratives.
                    </p>
                </div>
            </div>
        </div>

        <!-- Formulaire de contact -->
        <div class="fr-container fr-pb-6w">
            <div class="fr-grid-row fr-grid-row--gutters">
                <div class="fr-col-12 fr-col-md-8">
                    <form class="fr-form">
                        <fieldset class="fr-fieldset">
                            <legend class="fr-fieldset__legend fr-h3">
                                Formulaire de contact
                            </legend>

                            <div class="fr-form-group">
                                <label class="fr-label" for="nom">
                                    Nom complet
                                    <span class="fr-hint-text">Votre nom et prénom</span>
                                </label>
                                <input class="fr-input" type="text" id="nom" name="nom" required>
                            </div>

                            <div class="fr-form-group">
                                <label class="fr-label" for="email">
                                    Adresse électronique
                                </label>
                                <input class="fr-input" type="email" id="email" name="email" required>
                            </div>

                            <div class="fr-form-group">
                                <label class="fr-label" for="sujet">
                                    Sujet
                                </label>
                                <select class="fr-select" id="sujet" name="sujet" required>
                                    <option value="" disabled selected>Choisissez un sujet</option>
                                    <option value="etat-civil">État civil</option>
                                    <option value="urbanisme">Urbanisme</option>
                                    <option value="voirie">Voirie</option>
                                    <option value="autre">Autre</option>
                                </select>
                            </div>

                            <div class="fr-form-group">
                                <label class="fr-label" for="message">
                                    Message
                                    <span class="fr-hint-text">Décrivez votre demande en détail</span>
                                </label>
                                <textarea class="fr-input" id="message" name="message" rows="6" required></textarea>
                            </div>

                            <div class="fr-form-group">
                                <button class="fr-btn" type="submit">
                                    Envoyer le message
                                </button>
                            </div>
                        </fieldset>
                    </form>
                </div>

                <div class="fr-col-12 fr-col-md-4">
                    <div class="fr-card">
                        <div class="fr-card__body">
                            <div class="fr-card__content">
                                <h3 class="fr-card__title">Informations pratiques</h3>
                                <p class="fr-card__desc">
                                    <strong>Horaires d'ouverture :</strong><br>
                                    Lundi au vendredi : 9h00 - 17h00<br>
                                    Fermé le week-end
                                </p>
                                <p class="fr-card__desc">
                                    <strong>Adresse :</strong><br>
                                    Service public<br>
                                    75001 Paris
                                </p>
                                <p class="fr-card__desc">
                                    <strong>Téléphone :</strong><br>
                                    01 23 45 67 89
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <!-- Pied de page -->
    <footer class="fr-footer" role="contentinfo">
        <div class="fr-container">
            <div class="fr-footer__body">
                <div class="fr-footer__brand fr-enlarge-link">
                    <a href="/" title="Retour à l'accueil du site - Service public">
                        <p class="fr-logo">
                            République
                            <br>Française
                        </p>
                    </a>
                </div>
                <div class="fr-footer__content">
                    <p class="fr-footer__content-desc">
                        Site officiel du service public - Au service des citoyens français.
                    </p>
                    <ul class="fr-footer__content-list">
                        <li class="fr-footer__content-item">
                            <a class="fr-footer__content-link" href="/mentions-legales">Mentions légales</a>
                        </li>
                        <li class="fr-footer__content-item">
                            <a class="fr-footer__content-link" href="/donnees-personnelles">Données personnelles</a>
                        </li>
                        <li class="fr-footer__content-item">
                            <a class="fr-footer__content-link" href="/accessibilite">Accessibilité : non conforme</a>
                        </li>
                    </ul>
                </div>
            </div>
            <div class="fr-footer__bottom">
                <ul class="fr-footer__bottom-list">
                    <li class="fr-footer__bottom-item">
                        <a class="fr-footer__bottom-link" href="https://legifrance.gouv.fr">legifrance.gouv.fr</a>
                    </li>
                    <li class="fr-footer__bottom-item">
                        <a class="fr-footer__bottom-link" href="https://gouvernement.fr">gouvernement.fr</a>
                    </li>
                    <li class="fr-footer__bottom-item">
                        <a class="fr-footer__bottom-link" href="https://service-public.fr">service-public.fr</a>
                    </li>
                </ul>
                <div class="fr-footer__bottom-copy">
                    <p>
                        Sauf mention contraire, tous les contenus de ce site sont sous 
                        <a href="https://github.com/etalab/licence-ouverte/blob/master/LO.md" target="_blank" rel="noopener external">
                            licence etalab-2.0
                        </a>
                    </p>
                </div>
            </div>
        </div>
    </footer>

    <script src="https://unpkg.com/@gouvfr/dsfr@latest/dist/dsfr.min.js"></script>
</body>
</html>
```

### Finalisation et test

1. **Sauvegardez** le code dans un fichier `contact.html`
2. **Ouvrez** dans votre navigateur
3. **Testez** la responsivité (mobile/desktop)

### Demander une validation finale

```
Valide cette page complète pour la conformité DSFR, l'accessibilité RGAA et les bonnes pratiques.
```

Claude vérifiera avec `validate_dsfr_html` et `check_accessibility` !

---

## 🎉 Félicitations !

Vous venez de créer votre première page web complète utilisant :
- ✅ **DSFR-MCP** pour générer les composants
- ✅ **Claude Desktop** comme interface
- ✅ **Composants DSFR authentiques** 
- ✅ **Validation automatique** RGAA/DSFR
- ✅ **Page responsive** et accessible

## 🚀 Pour aller plus loin

Maintenant que vous maîtrisez les bases, vous pouvez :

1. **Explorer les 16 outils DSFR-MCP** disponibles (4 recherche + 3 génération + 2 validation + 3 utilitaires + 4 avancés)
2. **Créer des thèmes personnalisés** avec `create_dsfr_theme`
3. **Convertir vers React/Vue** avec `convert_to_framework`
4. **Analyser l'usage DSFR** de vos projets existants avec `analyze_dsfr_usage`
5. **Générer de la documentation** personnalisée avec `export_documentation`
6. **Obtenir des suggestions d'amélioration** avec `suggest_improvements`

## 🔗 Ressources utiles

- [Documentation DSFR officielle](https://www.systeme-de-design.gouv.fr/)
- [Guide d'installation Docker](./GUIDE_INSTALLATION_DOCKER.md)
- [API complète DSFR-MCP](./docs/API.md)
- [Exemples de projets](./examples/)

---

**Questions ou problèmes ?** Ouvrez une [issue sur GitHub](https://github.com/Alexmacapple/DSFR-MCP/issues) !