// Service de génération de templates DSFR

class TemplateService {
  constructor() {
    this.templates = this.initializeTemplates();
  }

  initializeTemplates() {
    return {
      'page-connexion': {
        name: 'Page de connexion',
        description: 'Template de page de connexion avec formulaire',
        generate: (options) => this.generateLoginPage(options),
      },
      'page-inscription': {
        name: "Page d'inscription",
        description: "Template de page d'inscription avec formulaire complet",
        generate: (options) => this.generateSignupPage(options),
      },
      'page-erreur-404': {
        name: "Page d'erreur 404",
        description: "Page d'erreur 404 - Page non trouvée",
        generate: (options) => this.generateError404Page(options),
      },
      'page-erreur-500': {
        name: "Page d'erreur 500",
        description: "Page d'erreur 500 - Erreur serveur",
        generate: (options) => this.generateError500Page(options),
      },
      'formulaire-contact': {
        name: 'Formulaire de contact',
        description: 'Formulaire de contact complet avec validation',
        generate: (options) => this.generateContactForm(options),
      },
      'tableau-donnees': {
        name: 'Tableau de données',
        description: 'Tableau de données responsive avec tri et pagination',
        generate: (options) => this.generateDataTable(options),
      },
      'page-recherche': {
        name: 'Page de recherche',
        description: 'Page de recherche avec filtres et résultats',
        generate: (options) => this.generateSearchPage(options),
      },
      dashboard: {
        name: 'Tableau de bord',
        description: 'Dashboard avec statistiques et graphiques',
        generate: (options) => this.generateDashboard(options),
      },
    };
  }

  async generateTemplate({ template_name, framework = 'vanilla', customizations = {} }) {
    const template = this.templates[template_name];

    if (!template) {
      return {
        content: [
          {
            type: 'text',
            text: `Template "${template_name}" non trouvé. Templates disponibles : ${Object.keys(this.templates).join(', ')}`,
          },
        ],
      };
    }

    const baseHTML = template.generate(customizations);
    let output = `# Template DSFR : ${template.name}\n\n`;
    output += `${template.description}\n\n`;

    switch (framework) {
      case 'vanilla':
        output += this.wrapInVanillaTemplate(baseHTML, customizations);
        break;
      case 'react':
        output += this.wrapInReactTemplate(baseHTML, template.name, customizations);
        break;
      case 'vue':
        output += this.wrapInVueTemplate(baseHTML, template.name, customizations);
        break;
      case 'angular':
        output += this.wrapInAngularTemplate(baseHTML, template.name, customizations);
        break;
    }

    return {
      content: [
        {
          type: 'text',
          text: output,
        },
      ],
    };
  }

  // Templates de base

  generateLoginPage(options = {}) {
    const { title = 'Connexion', showRememberMe = true, showForgotPassword = true } = options;

    return `
<div class="fr-container fr-mt-6w">
  <div class="fr-grid-row fr-grid-row--center">
    <div class="fr-col-12 fr-col-md-8 fr-col-lg-6">
      <h1>${title}</h1>
      
      <form action="/login" method="post">
        <div class="fr-form-group">
          <label class="fr-label" for="email">
            Adresse email
            <span class="fr-hint-text">Format attendu : nom@domaine.fr</span>
          </label>
          <input class="fr-input" type="email" id="email" name="email" required>
        </div>
        
        <div class="fr-form-group">
          <label class="fr-label" for="password">
            Mot de passe
          </label>
          <input class="fr-input" type="password" id="password" name="password" required>
          ${showForgotPassword ? '<a class="fr-link fr-link--sm" href="/forgot-password">Mot de passe oublié ?</a>' : ''}
        </div>
        
        ${
          showRememberMe
            ? `
        <div class="fr-form-group">
          <div class="fr-checkbox-group">
            <input type="checkbox" id="remember-me" name="remember-me">
            <label class="fr-label" for="remember-me">
              Se souvenir de moi
            </label>
          </div>
        </div>
        `
            : ''
        }
        
        <div class="fr-form-group">
          <button class="fr-btn" type="submit">
            Se connecter
          </button>
        </div>
      </form>
      
      <hr class="fr-hr fr-mt-3w">
      
      <p class="fr-text--sm fr-mt-3w">
        Vous n'avez pas de compte ?
        <a href="/signup" class="fr-link">Créer un compte</a>
      </p>
    </div>
  </div>
</div>`;
  }

  generateSignupPage(options = {}) {
    const { title = 'Créer un compte', includeTerms = true } = options;

    return `
<div class="fr-container fr-mt-6w">
  <div class="fr-grid-row fr-grid-row--center">
    <div class="fr-col-12 fr-col-md-8 fr-col-lg-6">
      <h1>${title}</h1>
      
      <form action="/signup" method="post">
        <fieldset class="fr-fieldset">
          <legend class="fr-fieldset__legend fr-text--regular">
            Informations personnelles
          </legend>
          
          <div class="fr-fieldset__content">
            <div class="fr-form-group">
              <label class="fr-label" for="firstname">
                Prénom
              </label>
              <input class="fr-input" type="text" id="firstname" name="firstname" required>
            </div>
            
            <div class="fr-form-group">
              <label class="fr-label" for="lastname">
                Nom
              </label>
              <input class="fr-input" type="text" id="lastname" name="lastname" required>
            </div>
          </div>
        </fieldset>
        
        <fieldset class="fr-fieldset fr-mt-3w">
          <legend class="fr-fieldset__legend fr-text--regular">
            Informations de connexion
          </legend>
          
          <div class="fr-fieldset__content">
            <div class="fr-form-group">
              <label class="fr-label" for="email">
                Adresse email
                <span class="fr-hint-text">Format attendu : nom@domaine.fr</span>
              </label>
              <input class="fr-input" type="email" id="email" name="email" required>
            </div>
            
            <div class="fr-form-group">
              <label class="fr-label" for="password">
                Mot de passe
                <span class="fr-hint-text">12 caractères minimum, avec majuscules, minuscules et chiffres</span>
              </label>
              <input class="fr-input" type="password" id="password" name="password" required>
              <div class="fr-password__checkbox fr-checkbox-group fr-checkbox-group--sm">
                <input type="checkbox" id="show-password">
                <label class="fr-label" for="show-password">
                  Afficher le mot de passe
                </label>
              </div>
            </div>
            
            <div class="fr-form-group">
              <label class="fr-label" for="password-confirm">
                Confirmer le mot de passe
              </label>
              <input class="fr-input" type="password" id="password-confirm" name="password-confirm" required>
            </div>
          </div>
        </fieldset>
        
        ${
          includeTerms
            ? `
        <div class="fr-form-group fr-mt-3w">
          <div class="fr-checkbox-group">
            <input type="checkbox" id="accept-terms" name="accept-terms" required>
            <label class="fr-label" for="accept-terms">
              J'accepte les <a href="/terms" target="_blank">conditions générales d'utilisation</a>
            </label>
          </div>
        </div>
        `
            : ''
        }
        
        <div class="fr-form-group">
          <button class="fr-btn" type="submit">
            Créer mon compte
          </button>
        </div>
      </form>
      
      <hr class="fr-hr fr-mt-3w">
      
      <p class="fr-text--sm fr-mt-3w">
        Vous avez déjà un compte ?
        <a href="/login" class="fr-link">Se connecter</a>
      </p>
    </div>
  </div>
</div>`;
  }

  generateError404Page(options = {}) {
    const { title = 'Page non trouvée', message = 'La page que vous cherchez est introuvable.' } =
      options;

    return `
<div class="fr-container">
  <div class="fr-my-7w fr-mt-md-12w fr-mb-md-10w fr-grid-row fr-grid-row--center">
    <div class="fr-py-0 fr-col-12 fr-col-md-6">
      <h1>${title}</h1>
      <p class="fr-text--sm fr-mb-3w">Erreur 404</p>
      <p class="fr-text--lead fr-mb-3w">${message}</p>
      <p class="fr-text--sm fr-mb-5w">
        Veuillez vérifier l'URL dans la barre d'adresse de votre navigateur et réessayer.
      </p>
      <ul class="fr-btns-group fr-btns-group--inline-md">
        <li>
          <a class="fr-btn" href="/">
            Page d'accueil
          </a>
        </li>
        <li>
          <a class="fr-btn fr-btn--secondary" href="/contact">
            Contactez-nous
          </a>
        </li>
      </ul>
    </div>
  </div>
</div>`;
  }

  generateError500Page(options = {}) {
    const { title = 'Erreur inattendue', message = "Une erreur inattendue s'est produite." } =
      options;

    return `
<div class="fr-container">
  <div class="fr-my-7w fr-mt-md-12w fr-mb-md-10w fr-grid-row fr-grid-row--center">
    <div class="fr-py-0 fr-col-12 fr-col-md-6">
      <h1>${title}</h1>
      <p class="fr-text--sm fr-mb-3w">Erreur 500</p>
      <p class="fr-text--lead fr-mb-3w">${message}</p>
      <p class="fr-text--sm fr-mb-5w">
        Essayez de rafraîchir la page. Si le problème persiste, essayez plus tard.
      </p>
      <ul class="fr-btns-group fr-btns-group--inline-md">
        <li>
          <a class="fr-btn" href="/">
            Page d'accueil
          </a>
        </li>
        <li>
          <a class="fr-btn fr-btn--secondary" href="/contact">
            Contactez-nous
          </a>
        </li>
      </ul>
    </div>
  </div>
</div>`;
  }

  generateContactForm(options = {}) {
    const { title = 'Nous contacter', includePhone = true, includeSubject = true } = options;

    return `
<div class="fr-container fr-mt-6w">
  <div class="fr-grid-row">
    <div class="fr-col-12 fr-col-md-8">
      <h1>${title}</h1>
      
      <form action="/contact" method="post">
        <div class="fr-grid-row fr-grid-row--gutters">
          <div class="fr-col-12 fr-col-md-6">
            <div class="fr-form-group">
              <label class="fr-label" for="firstname">
                Prénom
              </label>
              <input class="fr-input" type="text" id="firstname" name="firstname" required>
            </div>
          </div>
          
          <div class="fr-col-12 fr-col-md-6">
            <div class="fr-form-group">
              <label class="fr-label" for="lastname">
                Nom
              </label>
              <input class="fr-input" type="text" id="lastname" name="lastname" required>
            </div>
          </div>
        </div>
        
        <div class="fr-form-group">
          <label class="fr-label" for="email">
            Adresse email
            <span class="fr-hint-text">Format attendu : nom@domaine.fr</span>
          </label>
          <input class="fr-input" type="email" id="email" name="email" required>
        </div>
        
        ${
          includePhone
            ? `
        <div class="fr-form-group">
          <label class="fr-label" for="phone">
            Téléphone
            <span class="fr-hint-text">Format attendu : 01 23 45 67 89</span>
          </label>
          <input class="fr-input" type="tel" id="phone" name="phone">
        </div>
        `
            : ''
        }
        
        ${
          includeSubject
            ? `
        <div class="fr-form-group">
          <label class="fr-label" for="subject">
            Objet de votre demande
          </label>
          <select class="fr-select" id="subject" name="subject" required>
            <option value="" selected disabled>Sélectionnez un sujet</option>
            <option value="info">Demande d'information</option>
            <option value="help">Besoin d'aide</option>
            <option value="bug">Signaler un problème</option>
            <option value="other">Autre</option>
          </select>
        </div>
        `
            : ''
        }
        
        <div class="fr-form-group">
          <label class="fr-label" for="message">
            Votre message
            <span class="fr-hint-text">Décrivez votre demande en quelques lignes</span>
          </label>
          <textarea class="fr-input" id="message" name="message" rows="5" required></textarea>
        </div>
        
        <div class="fr-form-group">
          <div class="fr-checkbox-group">
            <input type="checkbox" id="accept-contact" name="accept-contact" required>
            <label class="fr-label" for="accept-contact">
              J'accepte d'être recontacté par email
            </label>
          </div>
        </div>
        
        <div class="fr-form-group">
          <button class="fr-btn" type="submit">
            Envoyer le message
          </button>
        </div>
      </form>
    </div>
    
    <div class="fr-col-12 fr-col-md-4">
      <div class="fr-callout">
        <p class="fr-callout__title">Besoin d'aide ?</p>
        <p class="fr-callout__text">
          Notre équipe est disponible du lundi au vendredi de 9h à 18h.
        </p>
        <p class="fr-callout__text">
          <strong>Email :</strong> contact@example.fr<br>
          <strong>Téléphone :</strong> 01 23 45 67 89
        </p>
      </div>
    </div>
  </div>
</div>`;
  }

  generateDataTable(options = {}) {
    const { title = 'Tableau de données', sortable = true, searchable = true } = options;

    return `
<div class="fr-container fr-mt-6w">
  <h1>${title}</h1>
  
  ${
    searchable
      ? `
  <div class="fr-search-bar" id="search" role="search">
    <label class="fr-label" for="search-input">
      Rechercher dans le tableau
    </label>
    <input class="fr-input" placeholder="Rechercher" type="search" id="search-input" name="search-input">
    <button class="fr-btn" type="submit">
      Rechercher
    </button>
  </div>
  `
      : ''
  }
  
  <div class="fr-table" id="table">
    <table>
      <caption>
        Liste des utilisateurs
        <span class="fr-hint-text">Tri par ordre alphabétique</span>
      </caption>
      <thead>
        <tr>
          <th scope="col" ${sortable ? 'aria-sort="none"' : ''}>Nom</th>
          <th scope="col" ${sortable ? 'aria-sort="none"' : ''}>Prénom</th>
          <th scope="col">Email</th>
          <th scope="col">Rôle</th>
          <th scope="col">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Dupont</td>
          <td>Jean</td>
          <td>jean.dupont@example.fr</td>
          <td>Administrateur</td>
          <td>
            <button class="fr-btn fr-btn--sm fr-btn--secondary" type="button">
              Modifier
            </button>
          </td>
        </tr>
        <tr>
          <td>Martin</td>
          <td>Marie</td>
          <td>marie.martin@example.fr</td>
          <td>Utilisateur</td>
          <td>
            <button class="fr-btn fr-btn--sm fr-btn--secondary" type="button">
              Modifier
            </button>
          </td>
        </tr>
        <tr>
          <td>Bernard</td>
          <td>Pierre</td>
          <td>pierre.bernard@example.fr</td>
          <td>Utilisateur</td>
          <td>
            <button class="fr-btn fr-btn--sm fr-btn--secondary" type="button">
              Modifier
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  
  <nav role="navigation" class="fr-pagination" aria-label="Pagination">
    <ul class="fr-pagination__list">
      <li>
        <a class="fr-pagination__link fr-pagination__link--first" href="#" aria-label="Première page">
          Première page
        </a>
      </li>
      <li>
        <a class="fr-pagination__link fr-pagination__link--prev" href="#" aria-label="Page précédente">
          Page précédente
        </a>
      </li>
      <li>
        <a class="fr-pagination__link" href="#" aria-label="Page 1">
          1
        </a>
      </li>
      <li>
        <a class="fr-pagination__link" href="#" aria-current="page" aria-label="Page 2">
          2
        </a>
      </li>
      <li>
        <a class="fr-pagination__link" href="#" aria-label="Page 3">
          3
        </a>
      </li>
      <li>
        <a class="fr-pagination__link fr-pagination__link--next" href="#" aria-label="Page suivante">
          Page suivante
        </a>
      </li>
      <li>
        <a class="fr-pagination__link fr-pagination__link--last" href="#" aria-label="Dernière page">
          Dernière page
        </a>
      </li>
    </ul>
  </nav>
</div>`;
  }

  generateSearchPage(options = {}) {
    const { title = 'Recherche', showFilters = true } = options;

    return `
<div class="fr-container fr-mt-6w">
  <div class="fr-grid-row fr-grid-row--gutters">
    ${
      showFilters
        ? `
    <div class="fr-col-12 fr-col-md-3">
      <nav class="fr-sidemenu" aria-label="Filtres de recherche">
        <div class="fr-sidemenu__inner">
          <button class="fr-sidemenu__btn" aria-controls="fr-sidemenu-wrapper" aria-expanded="false">
            Filtres
          </button>
          <div class="fr-collapse" id="fr-sidemenu-wrapper">
            <div class="fr-sidemenu__title">Filtres</div>
            
            <div class="fr-form-group">
              <fieldset class="fr-fieldset">
                <legend class="fr-fieldset__legend fr-text--regular">
                  Catégories
                </legend>
                <div class="fr-fieldset__content">
                  <div class="fr-checkbox-group">
                    <input type="checkbox" id="cat-1" name="cat-1">
                    <label class="fr-label" for="cat-1">
                      Documents
                    </label>
                  </div>
                  <div class="fr-checkbox-group">
                    <input type="checkbox" id="cat-2" name="cat-2">
                    <label class="fr-label" for="cat-2">
                      Articles
                    </label>
                  </div>
                  <div class="fr-checkbox-group">
                    <input type="checkbox" id="cat-3" name="cat-3">
                    <label class="fr-label" for="cat-3">
                      Pages
                    </label>
                  </div>
                </div>
              </fieldset>
            </div>
            
            <div class="fr-form-group">
              <label class="fr-label" for="date-filter">
                Date de publication
              </label>
              <select class="fr-select" id="date-filter" name="date-filter">
                <option value="">Toutes les dates</option>
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
                <option value="year">Cette année</option>
              </select>
            </div>
            
            <button class="fr-btn fr-btn--sm" type="button">
              Appliquer les filtres
            </button>
          </div>
        </div>
      </nav>
    </div>
    `
        : ''
    }
    
    <div class="fr-col-12 ${showFilters ? 'fr-col-md-9' : ''}">
      <h1>${title}</h1>
      
      <div class="fr-search-bar" id="search" role="search">
        <input class="fr-input" placeholder="Que recherchez-vous ?" type="search" id="search-input" name="search-input">
        <button class="fr-btn" type="submit">
          Rechercher
        </button>
      </div>
      
      <p class="fr-text--sm fr-mt-2w">
        <strong>25 résultats</strong> pour "terme recherché"
      </p>
      
      <div class="fr-mt-3w">
        <article class="fr-mb-3w">
          <h2 class="fr-h4">
            <a href="#" class="fr-link">Titre du premier résultat</a>
          </h2>
          <p class="fr-text--sm fr-mb-1w">
            <span class="fr-badge fr-badge--sm">Article</span>
            <time datetime="2023-11-15">15 novembre 2023</time>
          </p>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus.
            Suspendisse lectus tortor, dignissim sit amet, adipiscing nec.
          </p>
        </article>
        
        <article class="fr-mb-3w">
          <h2 class="fr-h4">
            <a href="#" class="fr-link">Titre du deuxième résultat</a>
          </h2>
          <p class="fr-text--sm fr-mb-1w">
            <span class="fr-badge fr-badge--sm">Document</span>
            <time datetime="2023-11-10">10 novembre 2023</time>
          </p>
          <p>
            Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper
            suscipit lobortis nisl ut aliquip ex ea commodo consequat.
          </p>
        </article>
        
        <article class="fr-mb-3w">
          <h2 class="fr-h4">
            <a href="#" class="fr-link">Titre du troisième résultat</a>
          </h2>
          <p class="fr-text--sm fr-mb-1w">
            <span class="fr-badge fr-badge--sm">Page</span>
            <time datetime="2023-11-05">5 novembre 2023</time>
          </p>
          <p>
            Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse
            molestie consequat, vel illum dolore eu feugiat nulla facilisis.
          </p>
        </article>
      </div>
      
      <nav role="navigation" class="fr-pagination" aria-label="Pagination">
        <ul class="fr-pagination__list">
          <li>
            <a class="fr-pagination__link fr-pagination__link--first" href="#" aria-label="Première page">
              Première page
            </a>
          </li>
          <li>
            <a class="fr-pagination__link fr-pagination__link--prev" href="#" aria-label="Page précédente">
              Page précédente
            </a>
          </li>
          <li>
            <a class="fr-pagination__link" href="#" aria-current="page" aria-label="Page 1">
              1
            </a>
          </li>
          <li>
            <a class="fr-pagination__link" href="#" aria-label="Page 2">
              2
            </a>
          </li>
          <li>
            <a class="fr-pagination__link" href="#" aria-label="Page 3">
              3
            </a>
          </li>
          <li>
            <a class="fr-pagination__link fr-pagination__link--next" href="#" aria-label="Page suivante">
              Page suivante
            </a>
          </li>
          <li>
            <a class="fr-pagination__link fr-pagination__link--last" href="#" aria-label="Dernière page">
              Dernière page
            </a>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</div>`;
  }

  generateDashboard(options = {}) {
    const { title = 'Tableau de bord', showStats = true, showChart = true } = options;

    return `
<div class="fr-container fr-mt-6w">
  <h1>${title}</h1>
  
  ${
    showStats
      ? `
  <div class="fr-grid-row fr-grid-row--gutters fr-mb-3w">
    <div class="fr-col-12 fr-col-md-3">
      <div class="fr-card">
        <div class="fr-card__body">
          <div class="fr-card__content">
            <h3 class="fr-card__title">Utilisateurs</h3>
            <p class="fr-display-xs fr-mb-1w">1,234</p>
            <p class="fr-text--sm fr-text--success">
              +12% ce mois
            </p>
          </div>
        </div>
      </div>
    </div>
    
    <div class="fr-col-12 fr-col-md-3">
      <div class="fr-card">
        <div class="fr-card__body">
          <div class="fr-card__content">
            <h3 class="fr-card__title">Documents</h3>
            <p class="fr-display-xs fr-mb-1w">456</p>
            <p class="fr-text--sm fr-text--info">
              +3 aujourd'hui
            </p>
          </div>
        </div>
      </div>
    </div>
    
    <div class="fr-col-12 fr-col-md-3">
      <div class="fr-card">
        <div class="fr-card__body">
          <div class="fr-card__content">
            <h3 class="fr-card__title">Visites</h3>
            <p class="fr-display-xs fr-mb-1w">12,345</p>
            <p class="fr-text--sm fr-text--warning">
              -5% cette semaine
            </p>
          </div>
        </div>
      </div>
    </div>
    
    <div class="fr-col-12 fr-col-md-3">
      <div class="fr-card">
        <div class="fr-card__body">
          <div class="fr-card__content">
            <h3 class="fr-card__title">Taux de conversion</h3>
            <p class="fr-display-xs fr-mb-1w">3.2%</p>
            <p class="fr-text--sm fr-text--success">
              +0.5% ce mois
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
  `
      : ''
  }
  
  <div class="fr-grid-row fr-grid-row--gutters">
    <div class="fr-col-12 fr-col-md-8">
      <div class="fr-card">
        <div class="fr-card__body">
          <div class="fr-card__content">
            <h3 class="fr-card__title">Activité récente</h3>
            ${
              showChart
                ? `
            <div class="fr-callout fr-callout--brown-caramel">
              <p class="fr-callout__text">
                Emplacement pour un graphique ou diagramme.
                Intégrez votre solution de visualisation préférée (Chart.js, D3.js, etc.)
              </p>
            </div>
            `
                : ''
            }
            
            <div class="fr-table fr-table--no-scroll">
              <table>
                <caption class="fr-sr-only">Dernières activités</caption>
                <thead>
                  <tr>
                    <th scope="col">Action</th>
                    <th scope="col">Utilisateur</th>
                    <th scope="col">Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Nouveau document ajouté</td>
                    <td>Jean Dupont</td>
                    <td>Il y a 5 minutes</td>
                  </tr>
                  <tr>
                    <td>Profil mis à jour</td>
                    <td>Marie Martin</td>
                    <td>Il y a 1 heure</td>
                  </tr>
                  <tr>
                    <td>Connexion</td>
                    <td>Pierre Bernard</td>
                    <td>Il y a 2 heures</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="fr-col-12 fr-col-md-4">
      <div class="fr-card">
        <div class="fr-card__body">
          <div class="fr-card__content">
            <h3 class="fr-card__title">Actions rapides</h3>
            <ul class="fr-btns-group fr-btns-group--block">
              <li>
                <button class="fr-btn fr-btn--secondary fr-btn--icon-left fr-icon-add-line">
                  Ajouter un utilisateur
                </button>
              </li>
              <li>
                <button class="fr-btn fr-btn--secondary fr-btn--icon-left fr-icon-file-add-line">
                  Nouveau document
                </button>
              </li>
              <li>
                <button class="fr-btn fr-btn--secondary fr-btn--icon-left fr-icon-download-line">
                  Exporter les données
                </button>
              </li>
              <li>
                <button class="fr-btn fr-btn--secondary fr-btn--icon-left fr-icon-settings-5-line">
                  Paramètres
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <div class="fr-card fr-mt-3w">
        <div class="fr-card__body">
          <div class="fr-card__content">
            <h3 class="fr-card__title">Notifications</h3>
            <div class="fr-alert fr-alert--info fr-alert--sm">
              <p>3 nouvelles mises à jour disponibles</p>
            </div>
            <div class="fr-alert fr-alert--warning fr-alert--sm fr-mt-2w">
              <p>Maintenance prévue demain à 14h</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>`;
  }

  // Méthodes de wrapping pour différents frameworks

  wrapInVanillaTemplate(content, options) {
    return `## HTML complet\n\n\`\`\`html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${options.pageTitle || 'Page DSFR'}</title>
  
  <!-- DSFR CSS -->
  <link rel="stylesheet" href="https://unpkg.com/@gouvfr/dsfr@1.11.2/dist/dsfr.min.css">
  <link rel="stylesheet" href="https://unpkg.com/@gouvfr/dsfr@1.11.2/dist/utility/icons/icons.min.css">
</head>
<body>
  ${this.generateHeader()}
  
  <main id="main" role="main">
    ${content}
  </main>
  
  ${this.generateFooter()}
  
  <!-- DSFR JS -->
  <script src="https://unpkg.com/@gouvfr/dsfr@1.11.2/dist/dsfr.module.min.js"></script>
</body>
</html>
\`\`\`

## Instructions d'utilisation

1. Copiez le code HTML ci-dessus
2. Créez un fichier \`.html\`
3. Ouvrez le fichier dans votre navigateur
4. Personnalisez selon vos besoins`;
  }

  wrapInReactTemplate(content, templateName) {
    const componentName = this.toPascalCase(templateName);

    return `## Composant React\n\n\`\`\`jsx
import React from 'react';
import '@gouvfr/dsfr/dist/dsfr.css';
import '@gouvfr/dsfr/dist/utility/icons/icons.css';

const ${componentName} = () => {
  return (
    <>
      ${this.htmlToJSX(this.generateHeader())}
      
      <main id="main" role="main">
        ${this.htmlToJSX(content)}
      </main>
      
      ${this.htmlToJSX(this.generateFooter())}
    </>
  );
};

export default ${componentName};
\`\`\`

## Installation

\`\`\`bash
npm install @gouvfr/dsfr
\`\`\`

## Import dans votre app

\`\`\`jsx
import ${componentName} from './components/${componentName}';

function App() {
  return <${componentName} />;
}
\`\`\``;
  }

  wrapInVueTemplate(content, templateName) {
    const componentName = this.toPascalCase(templateName);

    return `## Composant Vue\n\n\`\`\`vue
<template>
  <div>
    ${this.indentHTML(this.generateHeader(), '    ')}
    
    <main id="main" role="main">
      ${this.indentHTML(content, '      ')}
    </main>
    
    ${this.indentHTML(this.generateFooter(), '    ')}
  </div>
</template>

<script>
export default {
  name: '${componentName}',
  data() {
    return {
      // Vos données ici
    }
  },
  methods: {
    // Vos méthodes ici
  }
}
</script>

<style>
@import '@gouvfr/dsfr/dist/dsfr.css';
@import '@gouvfr/dsfr/dist/utility/icons/icons.css';
</style>
\`\`\`

## Installation

\`\`\`bash
npm install @gouvfr/dsfr
\`\`\``;
  }

  wrapInAngularTemplate(content, templateName) {
    const componentName = this.toPascalCase(templateName);
    const kebabName = templateName;

    return `## Composant Angular\n\n### TypeScript\n\`\`\`typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-${kebabName}',
  templateUrl: './${kebabName}.component.html',
  styleUrls: ['./${kebabName}.component.scss']
})
export class ${componentName}Component {
  // Propriétés et méthodes du composant
}
\`\`\`

### Template HTML\n\`\`\`html
${this.generateHeader()}

<main id="main" role="main">
  ${content}
</main>

${this.generateFooter()}
\`\`\`

### Styles SCSS\n\`\`\`scss
@import '@gouvfr/dsfr/dist/dsfr';
@import '@gouvfr/dsfr/dist/utility/icons/icons';
\`\`\`

## Installation

\`\`\`bash
npm install @gouvfr/dsfr
\`\`\`

## Import dans le module

\`\`\`typescript
import { ${componentName}Component } from './components/${kebabName}/${kebabName}.component';

@NgModule({
  declarations: [${componentName}Component],
  // ...
})
export class AppModule { }
\`\`\``;
  }

  // Méthodes utilitaires

  generateHeader() {
    return `
<header role="banner" class="fr-header">
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
          </div>
          <div class="fr-header__service">
            <a href="/" title="Accueil">
              <p class="fr-header__service-title">Nom du service</p>
            </a>
            <p class="fr-header__service-tagline">baseline - précisions sur l'organisation</p>
          </div>
        </div>
        <div class="fr-header__tools">
          <div class="fr-header__tools-links">
            <ul class="fr-links-group">
              <li>
                <a class="fr-link fr-icon-user-line" href="/compte">
                  Se connecter
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</header>`;
  }

  generateFooter() {
    return `
<footer class="fr-footer" role="contentinfo">
  <div class="fr-container">
    <div class="fr-footer__body">
      <div class="fr-footer__brand fr-enlarge-link">
        <a href="/" title="Retour à l'accueil">
          <p class="fr-logo">
            République
            <br>Française
          </p>
        </a>
      </div>
      <div class="fr-footer__content">
        <p class="fr-footer__content-desc">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </p>
        <ul class="fr-footer__content-list">
          <li class="fr-footer__content-item">
            <a class="fr-footer__content-link" target="_blank" href="https://legifrance.gouv.fr">
              legifrance.gouv.fr
            </a>
          </li>
          <li class="fr-footer__content-item">
            <a class="fr-footer__content-link" target="_blank" href="https://gouvernement.fr">
              gouvernement.fr
            </a>
          </li>
          <li class="fr-footer__content-item">
            <a class="fr-footer__content-link" target="_blank" href="https://service-public.fr">
              service-public.fr
            </a>
          </li>
          <li class="fr-footer__content-item">
            <a class="fr-footer__content-link" target="_blank" href="https://data.gouv.fr">
              data.gouv.fr
            </a>
          </li>
        </ul>
      </div>
    </div>
    <div class="fr-footer__bottom">
      <ul class="fr-footer__bottom-list">
        <li class="fr-footer__bottom-item">
          <a class="fr-footer__bottom-link" href="/mentions-legales">
            Mentions légales
          </a>
        </li>
        <li class="fr-footer__bottom-item">
          <a class="fr-footer__bottom-link" href="/donnees-personnelles">
            Données personnelles
          </a>
        </li>
        <li class="fr-footer__bottom-item">
          <a class="fr-footer__bottom-link" href="/accessibilite">
            Accessibilité : non conforme
          </a>
        </li>
      </ul>
      <div class="fr-footer__bottom-copy">
        <p>
          Sauf mention contraire, tous les contenus de ce site sont sous
          <a href="https://github.com/etalab/licence-ouverte/blob/master/LO.md" target="_blank">
            licence etalab-2.0
          </a>
        </p>
      </div>
    </div>
  </div>
</footer>`;
  }

  htmlToJSX(html) {
    return html
      .replace(/class=/g, 'className=')
      .replace(/for=/g, 'htmlFor=')
      .replace(/tabindex=/g, 'tabIndex=')
      .replace(/role=/g, 'role=')
      .replace(/aria-/g, 'aria-')
      .replace(/<!--/g, '{/*')
      .replace(/-->/g, '*/}');
  }

  indentHTML(html, indent) {
    return html
      .split('\n')
      .map((line) => indent + line)
      .join('\n');
  }

  toPascalCase(str) {
    return str
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }
}

module.exports = TemplateService;
