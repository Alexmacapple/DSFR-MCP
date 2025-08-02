// Service de génération de composants et thèmes DSFR
const DSFRSourceParser = require('./dsfr-source-parser');
const config = require('../config');

class GeneratorService {
  constructor() {
    this.sourceParser = new DSFRSourceParser();
    this.initialized = false;
  }

  async initialize() {
    if (!this.initialized) {
      await this.sourceParser.parseSourceFile();
      this.initialized = true;
    }
  }

  async generateComponent({ component_type, framework = 'vanilla', options = {} }) {
    await this.initialize();
    
    const component = this.sourceParser.getComponent(component_type);
    
    if (!component) {
      return {
        content: [{
          type: 'text',
          text: `❌ Composant "${component_type}" non trouvé. Utilisez "search_dsfr_components" pour voir les composants disponibles.`
        }]
      };
    }

    let generatedCode = '';

    switch (framework) {
      case 'vanilla':
        generatedCode = this.generateVanillaComponent(component, options);
        break;
      case 'react':
        generatedCode = this.generateReactComponent(component, options);
        break;
      case 'vue':
        generatedCode = this.generateVueComponent(component, options);
        break;
      case 'angular':
        generatedCode = this.generateAngularComponent(component, options);
        break;
      default:
        return {
          content: [{
            type: 'text',
            text: `❌ Framework "${framework}" non supporté.`
          }]
        };
    }

    return {
      content: [{
        type: 'text',
        text: generatedCode
      }]
    };
  }

  generateVanillaComponent(component, options) {
    let output = `# Composant DSFR : ${component.name}\n\n`;
    
    // HTML de base
    output += `## HTML\n\n`;
    output += '```html\n';
    
    // Chercher un exemple HTML
    if (component.examples.length > 0) {
      const example = component.examples[0];
      output += this.cleanHTMLExample(example.content);
    } else {
      output += this.generateDefaultHTML(component.name, options);
    }
    
    output += '\n```\n\n';

    // CSS nécessaire
    output += `## CSS requis\n\n`;
    output += '```scss\n';
    output += `@import "@gouvfr/dsfr/dist/component/${component.name}/${component.name}.css";\n`;
    output += '```\n\n';

    // JavaScript si nécessaire
    if (component.scripts && Object.keys(component.scripts).length > 0) {
      output += `## JavaScript\n\n`;
      output += '```javascript\n';
      output += `import '@gouvfr/dsfr/dist/component/${component.name}/${component.name}.js';\n\n`;
      output += '// Initialisation automatique par le DSFR\n';
      output += '```\n\n';
    }

    // Options et variantes
    if (component.schema) {
      output += this.generateOptionsSection(component.schema);
    }

    // Documentation
    if (component.documentation) {
      output += `## Documentation\n\n`;
      output += component.documentation;
    }

    return output;
  }

  generateReactComponent(component, options) {
    let output = `# Composant React DSFR : ${component.name}\n\n`;
    
    const componentNamePascal = this.toPascalCase(component.name);
    
    output += '```jsx\n';
    output += `import React from 'react';\n`;
    output += `import '@gouvfr/dsfr/dist/component/${component.name}/${component.name}.css';\n\n`;
    
    output += `const ${componentNamePascal} = (${this.generatePropsSignature(options)}) => {\n`;
    output += `  return (\n`;
    
    // Convertir l'exemple HTML en JSX
    if (component.examples.length > 0) {
      output += this.htmlToJSX(component.examples[0].content, '    ');
    } else {
      output += this.generateDefaultJSX(component.name, options, '    ');
    }
    
    output += `\n  );\n`;
    output += `};\n\n`;
    output += `export default ${componentNamePascal};\n`;
    output += '```\n\n';

    // Props documentation
    output += this.generatePropsDocumentation(component, options);

    return output;
  }

  generateVueComponent(component, options) {
    let output = `# Composant Vue DSFR : ${component.name}\n\n`;
    
    const componentNamePascal = this.toPascalCase(component.name);
    
    output += '```vue\n';
    output += '<template>\n';
    
    // Template
    if (component.examples.length > 0) {
      output += this.indentHTML(component.examples[0].content, '  ');
    } else {
      output += this.generateDefaultHTML(component.name, options, '  ');
    }
    
    output += '\n</template>\n\n';
    
    // Script
    output += '<script>\n';
    output += 'export default {\n';
    output += `  name: '${componentNamePascal}',\n`;
    output += '  props: {\n';
    output += this.generateVueProps(options);
    output += '  }\n';
    output += '}\n';
    output += '</script>\n\n';
    
    // Style
    output += '<style scoped>\n';
    output += `@import "@gouvfr/dsfr/dist/component/${component.name}/${component.name}.css";\n`;
    output += '</style>\n';
    output += '```\n';

    return output;
  }

  generateAngularComponent(component, options) {
    let output = `# Composant Angular DSFR : ${component.name}\n\n`;
    
    const componentNamePascal = this.toPascalCase(component.name);
    const componentNameKebab = component.name;
    
    // TypeScript Component
    output += '## Component TypeScript\n\n';
    output += '```typescript\n';
    output += `import { Component, Input } from '@angular/core';\n\n`;
    
    output += `@Component({\n`;
    output += `  selector: 'dsfr-${componentNameKebab}',\n`;
    output += `  templateUrl: './${componentNameKebab}.component.html',\n`;
    output += `  styleUrls: ['./${componentNameKebab}.component.scss']\n`;
    output += `})\n`;
    output += `export class ${componentNamePascal}Component {\n`;
    output += this.generateAngularInputs(options);
    output += `}\n`;
    output += '```\n\n';
    
    // Template HTML
    output += '## Template HTML\n\n';
    output += '```html\n';
    if (component.examples.length > 0) {
      output += this.cleanHTMLExample(component.examples[0].content);
    } else {
      output += this.generateDefaultHTML(component.name, options);
    }
    output += '\n```\n\n';
    
    // Styles SCSS
    output += '## Styles SCSS\n\n';
    output += '```scss\n';
    output += `@import "@gouvfr/dsfr/dist/component/${component.name}/${component.name}";\n`;
    output += '```\n';

    return output;
  }

  async createTheme({ theme_name, primary_color, secondary_color, custom_variables = {} }) {
    let output = `# Thème DSFR personnalisé : ${theme_name}\n\n`;
    
    output += '## Variables CSS\n\n';
    output += '```css\n';
    output += ':root {\n';
    
    // Couleurs principales
    if (primary_color) {
      output += `  --primary-color: ${primary_color};\n`;
      output += `  --blue-france: ${primary_color};\n`;
    }
    
    if (secondary_color) {
      output += `  --secondary-color: ${secondary_color};\n`;
    }
    
    // Variables personnalisées
    for (const [key, value] of Object.entries(custom_variables)) {
      output += `  --${key}: ${value};\n`;
    }
    
    output += '}\n';
    output += '```\n\n';
    
    // SCSS pour personnalisation avancée
    output += '## SCSS pour personnalisation avancée\n\n';
    output += '```scss\n';
    output += '// Importer d\'abord les variables DSFR\n';
    output += '@import "@gouvfr/dsfr/dist/core/core";\n\n';
    
    output += '// Surcharger les variables\n';
    if (primary_color) {
      output += `$blue-france: ${primary_color};\n`;
    }
    
    output += '\n// Importer le reste du DSFR\n';
    output += '@import "@gouvfr/dsfr/dist/dsfr";\n\n';
    
    output += '// Styles personnalisés\n';
    output += `.theme-${theme_name} {\n`;
    output += '  // Vos styles personnalisés ici\n';
    output += '}\n';
    output += '```\n\n';
    
    // Instructions d'utilisation
    output += '## Utilisation\n\n';
    output += '1. Créez un fichier `' + theme_name + '.scss` avec le code SCSS ci-dessus\n';
    output += '2. Importez-le dans votre projet après le DSFR de base\n';
    output += '3. Appliquez la classe `theme-' + theme_name + '` sur votre élément racine\n';
    
    return {
      content: [{
        type: 'text',
        text: output
      }]
    };
  }

  async convertToFramework({ html_code, target_framework, component_name = 'MyComponent' }) {
    let output = `# Conversion vers ${target_framework}\n\n`;
    
    switch (target_framework) {
      case 'react':
        output += this.convertToReact(html_code, component_name);
        break;
      case 'vue':
        output += this.convertToVue(html_code, component_name);
        break;
      case 'angular':
        output += this.convertToAngular(html_code, component_name);
        break;
      default:
        return {
          content: [{
            type: 'text',
            text: `❌ Framework cible "${target_framework}" non supporté.`
          }]
        };
    }
    
    return {
      content: [{
        type: 'text',
        text: output
      }]
    };
  }

  // Méthodes utilitaires

  cleanHTMLExample(html) {
    // Nettoyer l'exemple HTML des numéros de ligne et formatage
    return html
      .split('\n')
      .map(line => line.replace(/^\d+\|/, ''))
      .join('\n')
      .trim();
  }

  generateDefaultHTML(componentName, options) {
    // Générer un HTML par défaut basé sur le nom du composant
    const templates = {
      'button': '<button class="fr-btn">Bouton</button>',
      'alert': '<div class="fr-alert fr-alert--info" role="alert">\n  <p class="fr-alert__title">Titre de l\'alerte</p>\n  <p>Message d\'information</p>\n</div>',
      'card': '<div class="fr-card">\n  <div class="fr-card__body">\n    <div class="fr-card__content">\n      <h3 class="fr-card__title">Titre de la carte</h3>\n      <p class="fr-card__desc">Description</p>\n    </div>\n  </div>\n</div>',
      'badge': '<span class="fr-badge">Badge</span>',
      'tag': '<span class="fr-tag">Tag</span>'
    };
    
    return templates[componentName] || `<div class="fr-${componentName}">Contenu du composant</div>`;
  }

  htmlToJSX(html, indent = '') {
    // Convertir HTML en JSX
    return html
      .replace(/class=/g, 'className=')
      .replace(/for=/g, 'htmlFor=')
      .replace(/tabindex=/g, 'tabIndex=')
      .replace(/<!--/g, '{/*')
      .replace(/-->/g, '*/}')
      .split('\n')
      .map(line => indent + line)
      .join('\n');
  }

  generateDefaultJSX(componentName, options, indent) {
    const html = this.generateDefaultHTML(componentName, options);
    return this.htmlToJSX(html, indent);
  }

  indentHTML(html, indent) {
    return html.split('\n').map(line => indent + line).join('\n');
  }

  toPascalCase(str) {
    return str
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }

  generatePropsSignature(options) {
    const props = Object.keys(options);
    if (props.length === 0) return 'props';
    return `{ ${props.join(', ')} }`;
  }

  generatePropsDocumentation(component, options) {
    let output = '## Props\n\n';
    output += '| Prop | Type | Description | Défaut |\n';
    output += '|------|------|-------------|--------|\n';
    
    // Props basiques communes
    output += '| className | string | Classes CSS additionnelles | - |\n';
    output += '| id | string | ID unique de l\'élément | - |\n';
    
    // Props spécifiques selon le composant
    if (component.name === 'button') {
      output += '| variant | string | Variante du bouton (primary, secondary, tertiary) | primary |\n';
      output += '| size | string | Taille du bouton (sm, md, lg) | md |\n';
      output += '| disabled | boolean | État désactivé | false |\n';
    }
    
    return output;
  }

  generateVueProps(options) {
    let props = '    className: String,\n';
    props += '    id: String,\n';
    
    // Ajouter des props selon les options
    for (const [key, value] of Object.entries(options)) {
      const type = typeof value === 'boolean' ? 'Boolean' : 
                   typeof value === 'number' ? 'Number' : 'String';
      props += `    ${key}: ${type},\n`;
    }
    
    return props;
  }

  generateAngularInputs(options) {
    let inputs = '  @Input() className: string = \'\';\n';
    inputs += '  @Input() id: string = \'\';\n';
    
    for (const [key, value] of Object.entries(options)) {
      const type = typeof value === 'boolean' ? 'boolean' : 
                   typeof value === 'number' ? 'number' : 'string';
      inputs += `  @Input() ${key}: ${type} = ${JSON.stringify(value)};\n`;
    }
    
    return inputs;
  }

  generateOptionsSection(schema) {
    let output = '## Options disponibles\n\n';
    
    // Parser le schéma pour extraire les options
    if (schema && typeof schema === 'object') {
      output += '| Option | Valeurs | Description |\n';
      output += '|--------|---------|-------------|\n';
      
      // Exemple d'options communes
      output += '| variant | primary, secondary, tertiary | Style visuel du composant |\n';
      output += '| size | sm, md, lg | Taille du composant |\n';
      output += '| icon | Nom de l\'icône | Icône à afficher |\n';
    }
    
    output += '\n';
    return output;
  }

  convertToReact(html, componentName) {
    const jsx = this.htmlToJSX(html);
    
    let output = '```jsx\n';
    output += `import React from 'react';\n`;
    output += `import '@gouvfr/dsfr/dist/dsfr.css';\n\n`;
    
    output += `const ${componentName} = () => {\n`;
    output += '  return (\n';
    output += this.indentHTML(jsx, '    ');
    output += '\n  );\n';
    output += '};\n\n';
    output += `export default ${componentName};\n`;
    output += '```\n';
    
    return output;
  }

  convertToVue(html, componentName) {
    let output = '```vue\n';
    output += '<template>\n';
    output += this.indentHTML(html, '  ');
    output += '\n</template>\n\n';
    
    output += '<script>\n';
    output += 'export default {\n';
    output += `  name: '${componentName}'\n`;
    output += '}\n';
    output += '</script>\n\n';
    
    output += '<style scoped>\n';
    output += '@import "@gouvfr/dsfr/dist/dsfr.css";\n';
    output += '</style>\n';
    output += '```\n';
    
    return output;
  }

  convertToAngular(html, componentName) {
    const kebabName = componentName
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase()
      .replace(/^-/, '');
    
    let output = '## Component TypeScript\n\n';
    output += '```typescript\n';
    output += `import { Component } from '@angular/core';\n\n`;
    
    output += '@Component({\n';
    output += `  selector: 'app-${kebabName}',\n`;
    output += `  templateUrl: './${kebabName}.component.html',\n`;
    output += `  styleUrls: ['./${kebabName}.component.scss']\n`;
    output += '})\n';
    output += `export class ${componentName}Component { }\n`;
    output += '```\n\n';
    
    output += '## Template HTML\n\n';
    output += '```html\n';
    output += html;
    output += '\n```\n\n';
    
    output += '## Styles SCSS\n\n';
    output += '```scss\n';
    output += '@import "@gouvfr/dsfr/dist/dsfr";\n';
    output += '```\n';
    
    return output;
  }
}

module.exports = GeneratorService;
