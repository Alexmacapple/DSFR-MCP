// Service de génération de composants et thèmes DSFR
const DSFRSourceParser = require('./dsfr-source-parser-silent');
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
      // Essayer de générer un composant basique même s'il n'est pas trouvé
      const basicComponent = this.createBasicComponentStructure(component_type);
      return {
        content: [{
          type: 'text',
          text: this.generateAdvancedComponent(basicComponent, framework, options, component_type)
        }]
      };
    }

    const generatedCode = this.generateAdvancedComponent(component, framework, options, component_type);

    return {
      content: [{
        type: 'text',
        text: generatedCode
      }]
    };
  }

  generateAdvancedComponent(component, framework, options, componentType) {
    let output = `# Composant DSFR avancé : ${componentType}\n\n`;
    
    // Informations sur le composant
    output += '## Informations\n\n';
    output += `- **Type**: ${componentType}\n`;
    output += `- **Framework**: ${framework}\n`;
    output += `- **Version DSFR**: 1.14.0\n`;
    output += `- **Statut**: ${component.name ? 'Disponible' : 'Généré automatiquement'}\n\n`;
    
    // Variantes disponibles
    if (options.variant || this.getAvailableVariants(componentType).length > 0) {
      output += '## Variantes disponibles\n\n';
      const variants = this.getAvailableVariants(componentType);
      variants.forEach(variant => {
        output += `- **${variant.name}**: ${variant.description}\n`;
      });
      output += '\n';
    }

    // Génération selon le framework
    switch (framework) {
      case 'vanilla':
        output += this.generateVanillaComponentAdvanced(component, options, componentType);
        break;
      case 'react':
        output += this.generateReactComponentAdvanced(component, options, componentType);
        break;
      case 'vue':
        output += this.generateVueComponentAdvanced(component, options, componentType);
        break;
      case 'angular':
        output += this.generateAngularComponentAdvanced(component, options, componentType);
        break;
      default:
        output += `Framework "${framework}" non supporté. Frameworks disponibles: vanilla, react, vue, angular.\n`;
        return output;
    }

    // Guide d'accessibilité
    output += this.generateAccessibilityGuide(componentType);
    
    // Exemples d'utilisation
    output += this.generateUsageExamples(componentType, framework, options);
    
    return output;
  }

  generateVanillaComponentAdvanced(component, options, componentType) {
    let output = '## HTML Structure\n\n';
    
    // Template HTML amélioré
    const htmlTemplate = this.getAdvancedTemplate(componentType, options);
    output += '```html\n';
    output += htmlTemplate;
    output += '\n```\n\n';

    // CSS requis avec personnalisation
    output += '## CSS et personnalisation\n\n';
    output += '### CSS de base\n\n';
    output += '```scss\n';
    output += `// Import du composant DSFR\n`;
    output += `@import "@gouvfr/dsfr/dist/component/${componentType}/${componentType}.css";\n\n`;
    
    // CSS personnalisé selon les options
    if (options.custom_styles) {
      output += '// Styles personnalisés\n';
      output += `.custom-${componentType} {\n`;
      if (options.primary_color) {
        output += `  --component-primary-color: ${options.primary_color};\n`;
      }
      if (options.spacing) {
        output += `  --component-spacing: ${options.spacing};\n`;
      }
      output += '  // Vos styles personnalisés ici\n';
      output += '}\n';
    }
    output += '```\n\n';

    // JavaScript interactif
    if (this.requiresJavaScript(componentType)) {
      output += '### JavaScript interactif\n\n';
      output += '```javascript\n';
      output += this.generateJavaScriptForComponent(componentType, options);
      output += '```\n\n';
    }

    return output;
  }

  generateReactComponentAdvanced(component, options, componentType) {
    const componentNamePascal = this.toPascalCase(componentType);
    
    let output = '## Composant React TypeScript\n\n';
    output += '```tsx\n';
    output += `import React, { useState, useCallback, useEffect } from 'react';\n`;
    output += `import '@gouvfr/dsfr/dist/component/${componentType}/${componentType}.css';\n\n`;
    
    // Interface TypeScript
    output += `interface ${componentNamePascal}Props {\n`;
    const props = this.getComponentProps(componentType, options);
    props.forEach(prop => {
      output += `  ${prop.name}${prop.optional ? '?' : ''}: ${prop.type};\n`;
    });
    output += `  className?: string;\n`;
    output += `  children?: React.ReactNode;\n`;
    output += `}\n\n`;
    
    // Composant principal
    output += `const ${componentNamePascal}: React.FC<${componentNamePascal}Props> = ({\n`;
    props.forEach(prop => {
      output += `  ${prop.name}${prop.defaultValue ? ` = ${prop.defaultValue}` : ''},\n`;
    });
    output += `  className = '',\n`;
    output += `  children,\n`;
    output += `  ...props\n`;
    output += `}) => {\n`;
    
    // Hooks et state management
    if (this.requiresState(componentType)) {
      output += `  const [isActive, setIsActive] = useState(false);\n`;
      output += `  const [isLoading, setIsLoading] = useState(false);\n\n`;
    }
    
    // Event handlers
    output += `  const handleClick = useCallback((event: React.MouseEvent) => {\n`;
    output += `    // Gérer les interactions\n`;
    if (options.onClick) {
      output += `    ${options.onClick}?.(event);\n`;
    }
    output += `  }, [${options.onClick ? options.onClick : ''}]);\n\n`;
    
    // Effects
    output += `  useEffect(() => {\n`;
    output += `    // Initialisation du composant DSFR\n`;
    output += `    // Chargement des scripts nécessaires\n`;
    output += `  }, []);\n\n`;
    
    // Render
    const htmlTemplate = this.getAdvancedTemplate(componentType, options);
    const jsxTemplate = this.htmlToJSXAdvanced(htmlTemplate, '  ', { hasButtons: true });
    
    output += `  return (\n`;
    output += `    <div className={\`fr-${componentType} \${className}\`} {...props}>\n`;
    output += jsxTemplate;
    output += `\n    </div>\n`;
    output += `  );\n`;
    output += `};\n\n`;
    
    // Display name et export
    output += `${componentNamePascal}.displayName = '${componentNamePascal}';\n\n`;
    output += `export default ${componentNamePascal};\n`;
    output += '```\n\n';
    
    return output;
  }

  generateVueComponentAdvanced(component, options, componentType) {
    const componentNamePascal = this.toPascalCase(componentType);
    
    let output = '## Composant Vue 3 avec Composition API\n\n';
    output += '```vue\n';
    output += '<template>\n';
    
    // Template Vue avec directives
    let template = this.getAdvancedTemplate(componentType, options);
    template = template.replace(/onclick=/g, '@click=');
    template = template.replace(/Titre de la carte/g, '{{ title }}');
    template = template.replace(/Description/g, '{{ description }}');
    
    output += `  <div :class="componentClass" v-bind="$attrs">\n`;
    output += this.indentHTML(template, '    ');
    output += `\n  </div>\n`;
    output += '</template>\n\n';
    
    // Script avec Composition API
    output += '<script setup lang="ts">\n';
    output += `import { ref, computed, onMounted } from 'vue';\n\n`;
    
    // Props
    output += `interface Props {\n`;
    const props = this.getComponentProps(componentType, options);
    props.forEach(prop => {
      output += `  ${prop.name}${prop.optional ? '?' : ''}: ${prop.type};\n`;
    });
    output += `}\n\n`;
    
    output += `const props = withDefaults(defineProps<Props>(), {\n`;
    props.forEach(prop => {
      if (prop.defaultValue) {
        output += `  ${prop.name}: ${prop.defaultValue},\n`;
      }
    });
    output += `});\n\n`;
    
    // Emits
    output += `const emit = defineEmits<{\n`;
    output += `  click: [event: MouseEvent];\n`;
    output += `  change: [value: any];\n`;
    output += `}>();\n\n`;
    
    // Reactive state
    if (this.requiresState(componentType)) {
      output += `const isActive = ref(false);\n`;
      output += `const isLoading = ref(false);\n\n`;
    }
    
    // Computed properties
    output += `const componentClass = computed(() => [\n`;
    output += `  \`fr-${componentType}\`,\n`;
    output += `  {\n`;
    output += `    'fr-${componentType}--active': isActive.value,\n`;
    output += `    'fr-${componentType}--loading': isLoading.value,\n`;
    output += `  }\n`;
    output += `]);\n\n`;
    
    // Methods
    output += `const handleClick = (event: MouseEvent) => {\n`;
    output += `  emit('click', event);\n`;
    output += `};\n\n`;
    
    // Lifecycle
    output += `onMounted(() => {\n`;
    output += `  // Initialisation du composant\n`;
    output += `});\n`;
    
    output += '</script>\n\n';
    
    // Styles
    output += '<style scoped>\n';
    output += `@import "@gouvfr/dsfr/dist/component/${componentType}/${componentType}.css";\n\n`;
    output += `/* Styles personnalisés */\n`;
    output += `.fr-${componentType} {\n`;
    output += `  /* Vos styles ici */\n`;
    output += `}\n`;
    output += '</style>\n';
    output += '```\n\n';
    
    return output;
  }

  generateAngularComponentAdvanced(component, options, componentType) {
    const componentNamePascal = this.toPascalCase(componentType);
    const kebabName = this.toKebabCase(componentType);
    
    let output = '## Composant Angular avec TypeScript\n\n';
    
    // Component TypeScript
    output += '### Component\n\n';
    output += '```typescript\n';
    output += `import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';\n`;
    output += `import { Subject } from 'rxjs';\n`;
    output += `import { takeUntil } from 'rxjs/operators';\n\n`;
    
    output += `@Component({\n`;
    output += `  selector: 'dsfr-${kebabName}',\n`;
    output += `  templateUrl: './${kebabName}.component.html',\n`;
    output += `  styleUrls: ['./${kebabName}.component.scss'],\n`;
    output += `  host: {\n`;
    output += `    '[class]': 'hostClasses',\n`;
    output += `    '[attr.role]': 'role'\n`;
    output += `  }\n`;
    output += `})\n`;
    output += `export class ${componentNamePascal}Component implements OnInit, OnDestroy {\n`;
    
    // Inputs
    const props = this.getComponentProps(componentType, options);
    props.forEach(prop => {
      output += `  @Input() ${prop.name}: ${prop.type}${prop.defaultValue ? ` = ${prop.defaultValue}` : ''};\n`;
    });
    
    // Outputs
    output += `  @Output() click = new EventEmitter<MouseEvent>();\n`;
    output += `  @Output() change = new EventEmitter<any>();\n\n`;
    
    // Properties
    output += `  private destroy$ = new Subject<void>();\n`;
    if (this.requiresState(componentType)) {
      output += `  isActive = false;\n`;
      output += `  isLoading = false;\n`;
    }
    output += `\n`;
    
    // Getters
    output += `  get hostClasses(): string {\n`;
    output += `    return [\n`;
    output += `      \`fr-${componentType}\`,\n`;
    output += `      this.isActive ? \`fr-${componentType}--active\` : '',\n`;
    output += `      this.isLoading ? \`fr-${componentType}--loading\` : ''\n`;
    output += `    ].filter(Boolean).join(' ');\n`;
    output += `  }\n\n`;
    
    output += `  get role(): string {\n`;
    output += `    return '${this.getComponentRole(componentType)}';\n`;
    output += `  }\n\n`;
    
    // Lifecycle methods
    output += `  ngOnInit(): void {\n`;
    output += `    // Initialisation du composant\n`;
    output += `  }\n\n`;
    
    output += `  ngOnDestroy(): void {\n`;
    output += `    this.destroy$.next();\n`;
    output += `    this.destroy$.complete();\n`;
    output += `  }\n\n`;
    
    // Event handlers
    output += `  onClick(event: MouseEvent): void {\n`;
    output += `    this.click.emit(event);\n`;
    output += `  }\n\n`;
    
    output += `  onChange(value: any): void {\n`;
    output += `    this.change.emit(value);\n`;
    output += `  }\n`;
    
    output += `}\n`;
    output += '```\n\n';
    
    // Template
    output += '### Template HTML\n\n';
    output += '```html\n';
    const template = this.getAdvancedTemplate(componentType, options);
    const angularTemplate = template
      .replace(/onclick="handleClick\(\$event\)"/g, '(click)="onClick($event)"')
      .replace(/Titre de la carte/g, '{{ title }}')
      .replace(/Description/g, '{{ description }}');
    
    output += angularTemplate;
    output += '\n```\n\n';
    
    return output;
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
    
    // Génération des variables de couleur avancées
    const colorPalette = this.generateColorPalette(primary_color, secondary_color);
    
    output += '## Variables CSS principales\n\n';
    output += '```css\n';
    output += ':root {\n';
    
    // Couleurs système DSFR
    if (primary_color) {
      output += `  /* Couleur principale */\n`;
      output += `  --blue-france-950: ${colorPalette.primary.dark};\n`;
      output += `  --blue-france-925: ${colorPalette.primary.darker};\n`;
      output += `  --blue-france-main: ${primary_color};\n`;
      output += `  --blue-france-200: ${colorPalette.primary.light};\n`;
      output += `  --blue-france-150: ${colorPalette.primary.lighter};\n\n`;
    }
    
    if (secondary_color) {
      output += `  /* Couleur secondaire */\n`;
      output += `  --red-marianne-main: ${secondary_color};\n`;
      output += `  --red-marianne-425: ${this.adjustColor(secondary_color, -0.3)};\n`;
      output += `  --red-marianne-300: ${this.adjustColor(secondary_color, 0.2)};\n\n`;
    }
    
    // Palette de gris harmonisée
    output += `  /* Palette de gris harmonisée */\n`;
    output += `  --grey-1000: #161616;\n`;
    output += `  --grey-925: #242424;\n`;
    output += `  --grey-850: #3a3a3a;\n`;
    output += `  --grey-750: #6a6a6a;\n`;
    output += `  --grey-500: #929292;\n`;
    output += `  --grey-425: #b1b1b1;\n`;
    output += `  --grey-300: #cecece;\n`;
    output += `  --grey-200: #e5e5e5;\n`;
    output += `  --grey-150: #f0f0f0;\n`;
    output += `  --grey-100: #f6f6f6;\n\n`;
    
    // Variables typographiques
    output += `  /* Typographie personnalisée */\n`;
    output += `  --font-family-primary: 'Marianne', system-ui, sans-serif;\n`;
    output += `  --font-family-secondary: 'Spectral', serif;\n`;
    output += `  --text-title-blue-france: var(--blue-france-main);\n`;
    output += `  --text-action-high-blue-france: var(--blue-france-main);\n\n`;
    
    // Espacements et dimensions
    output += `  /* Espacements et dimensions */\n`;
    output += `  --spacing-xs: 0.25rem;\n`;
    output += `  --spacing-sm: 0.5rem;\n`;
    output += `  --spacing-md: 1rem;\n`;
    output += `  --spacing-lg: 1.5rem;\n`;
    output += `  --spacing-xl: 2rem;\n`;
    output += `  --spacing-2xl: 3rem;\n\n`;
    
    // Variables personnalisées
    if (Object.keys(custom_variables).length > 0) {
      output += `  /* Variables personnalisées */\n`;
      for (const [key, value] of Object.entries(custom_variables)) {
        output += `  --${key}: ${value};\n`;
      }
      output += '\n';
    }
    
    output += '}\n';
    output += '```\n\n';
    
    // Mode sombre
    output += '## Mode sombre\n\n';
    output += '```css\n';
    output += '[data-theme="dark"] {\n';
    output += '  /* Adaptation automatique pour le mode sombre */\n';
    output += '  --background-default-grey: var(--grey-1000);\n';
    output += '  --background-alt-grey: var(--grey-925);\n';
    output += '  --text-default-grey: var(--grey-150);\n';
    output += '  --text-mention-grey: var(--grey-300);\n';
    output += '  --border-default-grey: var(--grey-750);\n';
    if (primary_color) {
      output += `  --blue-france-main: ${this.adjustColorForDarkMode(primary_color)};\n`;
    }
    output += '}\n';
    output += '```\n\n';
    
    // SCSS pour personnalisation avancée
    output += '## SCSS complet avec mixins\n\n';
    output += '```scss\n';
    output += '// Variables SASS personnalisées\n';
    if (primary_color) {
      output += `$blue-france: ${primary_color};\n`;
      output += `$blue-france-sun: ${colorPalette.primary.light};\n`;
      output += `$blue-france-moon: ${colorPalette.primary.dark};\n`;
    }
    
    output += '\n// Mixins utilitaires\n';
    output += '@mixin button-variant($bg-color, $text-color: white) {\n';
    output += '  background-color: $bg-color;\n';
    output += '  color: $text-color;\n';
    output += '  border-color: $bg-color;\n';
    output += '  \n';
    output += '  &:hover {\n';
    output += '    background-color: darken($bg-color, 10%);\n';
    output += '    border-color: darken($bg-color, 10%);\n';
    output += '  }\n';
    output += '}\n\n';
    
    output += '@mixin focus-style($color: $blue-france) {\n';
    output += '  outline: 2px solid $color;\n';
    output += '  outline-offset: 2px;\n';
    output += '}\n\n';
    
    output += '// Import DSFR avec variables personnalisées\n';
    output += '@import "@gouvfr/dsfr/dist/core/core";\n';
    output += '@import "@gouvfr/dsfr/dist/dsfr";\n\n';
    
    output += '// Classe de thème principale\n';
    output += `.theme-${theme_name} {\n`;
    output += '  // Application des variables personnalisées\n';
    if (primary_color) {
      output += '  \n';
      output += '  // Boutons personnalisés\n';
      output += '  .fr-btn {\n';
      output += `    @include button-variant(${primary_color});\n`;
      output += '  }\n';
    }
    
    output += '  \n';
    output += '  // Focus personnalisé\n';
    output += '  *:focus {\n';
    output += '    @include focus-style();\n';
    output += '  }\n';
    
    output += '  \n';
    output += '  // Typographie enrichie\n';
    output += '  .fr-h1, h1 {\n';
    output += '    font-family: var(--font-family-primary);\n';
    output += '    font-weight: 700;\n';
    output += '    line-height: 1.2;\n';
    output += '  }\n';
    
    output += '}\n';
    output += '```\n\n';
    
    // Configuration JavaScript
    output += '## Configuration JavaScript\n\n';
    output += '```javascript\n';
    output += '// Configuration du thème pour les composants interactifs\n';
    output += `window.dsfrTheme = {\n`;
    output += `  name: '${theme_name}',\n`;
    output += `  colors: {\n`;
    if (primary_color) {
      output += `    primary: '${primary_color}',\n`;
    }
    if (secondary_color) {
      output += `    secondary: '${secondary_color}',\n`;
    }
    output += `  },\n`;
    output += `  darkMode: {\n`;
    output += `    enabled: true,\n`;
    output += `    toggle: true\n`;
    output += `  }\n`;
    output += `};\n\n`;
    
    output += '// Fonction pour basculer le mode sombre\n';
    output += 'function toggleDarkMode() {\n';
    output += '  const html = document.documentElement;\n';
    output += '  const currentTheme = html.getAttribute("data-theme");\n';
    output += '  const newTheme = currentTheme === "dark" ? "light" : "dark";\n';
    output += '  html.setAttribute("data-theme", newTheme);\n';
    output += '  localStorage.setItem("theme", newTheme);\n';
    output += '}\n\n';
    
    output += '// Initialisation du thème au chargement\n';
    output += 'document.addEventListener("DOMContentLoaded", () => {\n';
    output += '  const savedTheme = localStorage.getItem("theme") || "light";\n';
    output += '  document.documentElement.setAttribute("data-theme", savedTheme);\n';
    output += `  document.body.classList.add("theme-${theme_name}");\n`;
    output += '});\n';
    output += '```\n\n';
    
    // Instructions d'utilisation détaillées
    output += '## Guide d\'installation\n\n';
    output += '### 1. Installation des fichiers\n\n';
    output += `Créez les fichiers suivants dans votre projet :\n\n`;
    output += `- \`themes/${theme_name}/${theme_name}.scss\` - Variables et styles SCSS\n`;
    output += `- \`themes/${theme_name}/${theme_name}.css\` - Variables CSS compilées\n`;
    output += `- \`themes/${theme_name}/${theme_name}.js\` - Configuration JavaScript\n\n`;
    
    output += '### 2. Intégration HTML\n\n';
    output += '```html\n';
    output += '<!DOCTYPE html>\n';
    output += '<html lang="fr" data-theme="light">\n';
    output += '<head>\n';
    output += '  <meta charset="UTF-8">\n';
    output += '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n';
    output += '  <title>Mon site avec thème DSFR</title>\n';
    output += '  \n';
    output += '  <!-- DSFR CSS -->\n';
    output += '  <link rel="stylesheet" href="@gouvfr/dsfr/dist/dsfr.min.css">\n';
    output += '  \n';
    output += '  <!-- Thème personnalisé -->\n';
    output += `  <link rel="stylesheet" href="themes/${theme_name}/${theme_name}.css">\n`;
    output += '</head>\n';
    output += `<body class="theme-${theme_name}">\n`;
    output += '  <!-- Votre contenu -->\n';
    output += '  \n';
    output += '  <!-- Scripts -->\n';
    output += '  <script src="@gouvfr/dsfr/dist/dsfr.min.js"></script>\n';
    output += `  <script src="themes/${theme_name}/${theme_name}.js"></script>\n`;
    output += '</body>\n';
    output += '</html>\n';
    output += '```\n\n';
    
    output += '### 3. Utilisation avec un framework\n\n';
    output += '#### React\n';
    output += '```jsx\n';
    output += `import './themes/${theme_name}/${theme_name}.css';\n\n`;
    output += 'function App() {\n';
    output += '  useEffect(() => {\n';
    output += `    document.body.classList.add('theme-${theme_name}');\n`;
    output += '  }, []);\n';
    output += '  \n';
    output += '  return (\n';
    output += '    <div className="App">\n';
    output += '      {/* Votre application */}\n';
    output += '    </div>\n';
    output += '  );\n';
    output += '}\n';
    output += '```\n\n';
    
    output += '#### Vue.js\n';
    output += '```vue\n';
    output += '<template>\n';
    output += '  <div id="app">\n';
    output += '    <!-- Votre application -->\n';
    output += '  </div>\n';
    output += '</template>\n\n';
    output += '<script>\n';
    output += 'export default {\n';
    output += '  mounted() {\n';
    output += `    document.body.classList.add('theme-${theme_name}');\n`;
    output += '  }\n';
    output += '}\n';
    output += '</script>\n\n';
    output += '<style>\n';
    output += `@import './themes/${theme_name}/${theme_name}.css';\n`;
    output += '</style>\n';
    output += '```\n\n';
    
    // Validation et tests
    output += '## Tests et validation\n\n';
    output += '### Contraste et accessibilité\n\n';
    if (primary_color) {
      const contrastInfo = this.analyzeColorContrast(primary_color);
      output += `**Couleur principale**: ${primary_color}\n`;
      output += `- Contraste avec blanc: ${contrastInfo.whiteContrast}\n`;
      output += `- Contraste avec noir: ${contrastInfo.blackContrast}\n`;
      output += `- Recommandation: ${contrastInfo.recommendation}\n\n`;
    }
    
    output += '### Checklist de validation\n\n';
    output += '- [ ] Contraste suffisant (minimum 4.5:1 pour le texte normal)\n';
    output += '- [ ] Thème fonctionne en mode sombre\n';
    output += '- [ ] Compatible avec tous les composants DSFR\n';
    output += '- [ ] Testé sur différents navigateurs\n';
    output += '- [ ] Validation W3C des CSS\n';
    output += '- [ ] Test d\'accessibilité avec lecteur d\'écran\n\n';
    
    return {
      content: [{
        type: 'text',
        text: output
      }]
    };
  }

  async convertToFramework({ html_code, target_framework, component_name = 'MyComponent' }) {
    // Validation et nettoyage du code HTML
    const cleanedHtml = this.cleanHTMLExample(html_code);
    const analysis = this.analyzeHtmlStructure(cleanedHtml);
    
    let output = `# Conversion avancée vers ${target_framework}\n\n`;
    
    // Analyse préliminaire
    output += '## Analyse du code source\n\n';
    output += `- **Boutons détectés**: ${analysis.hasButtons ? 'Oui' : 'Non'}\n`;
    output += `- **Champs de saisie**: ${analysis.hasInputs ? 'Oui' : 'Non'}\n`;
    output += `- **Modales**: ${analysis.hasModals ? 'Oui' : 'Non'}\n`;
    output += `- **Accordéons**: ${analysis.hasAccordions ? 'Oui' : 'Non'}\n`;
    output += `- **Onglets**: ${analysis.hasTabs ? 'Oui' : 'Non'}\n`;
    output += `- **Éléments interactifs**: ${analysis.hasInteractiveElements ? 'Oui' : 'Non'}\n\n`;
    
    // Recommandations spécifiques au framework
    output += '## Recommandations\n\n';
    switch (target_framework) {
      case 'react':
        output += '- Utilisez les hooks React pour gérer l\'état local\n';
        output += '- Implémentez PropTypes pour la validation des props\n';
        output += '- Considérez l\'utilisation de React.memo() pour l\'optimisation\n';
        if (analysis.hasInteractiveElements) {
          output += '- Utilisez useCallback() pour les gestionnaires d\'événements\n';
        }
        break;
      case 'vue':
        output += '- Utilisez la Composition API pour les composants complexes\n';
        output += '- Définissez des props typées avec TypeScript\n';
        output += '- Utilisez les directives Vue pour la manipulation du DOM\n';
        break;
      case 'angular':
        output += '- Implémentez OnInit pour l\'initialisation\n';
        output += '- Utilisez les Output() pour la communication parent-enfant\n';
        output += '- Considérez l\'injection de dépendances pour les services\n';
        break;
    }
    output += '\n';
    
    // Conversion avancée
    switch (target_framework) {
      case 'react':
        output += this.convertToReactAdvanced(cleanedHtml, component_name);
        break;
      case 'vue':
        output += this.convertToVueAdvanced(cleanedHtml, component_name);
        break;
      case 'angular':
        output += this.convertToAngularAdvanced(cleanedHtml, component_name);
        break;
      default:
        return {
          content: [{
            type: 'text',
            text: `Framework cible "${target_framework}" non supporté. Frameworks disponibles: react, vue, angular.`
          }]
        };
    }
    
    // Guide de test
    output += '\n## Guide de test\n\n';
    output += '### Tests unitaires\n\n';
    
    switch (target_framework) {
      case 'react':
        output += '```jsx\n';
        output += `import { render, screen, fireEvent } from '@testing-library/react';\n`;
        output += `import ${component_name} from './${component_name}';\n\n`;
        output += `test('renders component correctly', () => {\n`;
        output += `  render(<${component_name} />);\n`;
        if (analysis.hasButtons) {
          output += `  const button = screen.getByRole('button');\n`;
          output += `  expect(button).toBeInTheDocument();\n`;
        }
        output += `});\n`;
        if (analysis.hasButtons) {
          output += `\ntest('handles button click', () => {\n`;
          output += `  const mockHandler = jest.fn();\n`;
          output += `  render(<${component_name} onButtonClick={mockHandler} />);\n`;
          output += `  fireEvent.click(screen.getByRole('button'));\n`;
          output += `  expect(mockHandler).toHaveBeenCalled();\n`;
          output += `});\n`;
        }
        output += '```\n\n';
        break;
        
      case 'vue':
        output += '```javascript\n';
        output += `import { mount } from '@vue/test-utils';\n`;
        output += `import ${component_name} from './${component_name}.vue';\n\n`;
        output += `describe('${component_name}', () => {\n`;
        output += `  test('renders correctly', () => {\n`;
        output += `    const wrapper = mount(${component_name});\n`;
        output += `    expect(wrapper.exists()).toBe(true);\n`;
        output += `  });\n`;
        if (analysis.hasButtons) {
          output += `\n  test('emits click event', async () => {\n`;
          output += `    const wrapper = mount(${component_name});\n`;
          output += `    await wrapper.find('button').trigger('click');\n`;
          output += `    expect(wrapper.emitted('click')).toBeTruthy();\n`;
          output += `  });\n`;
        }
        output += `});\n`;
        output += '```\n\n';
        break;
        
      case 'angular':
        output += '```typescript\n';
        output += `import { ComponentFixture, TestBed } from '@angular/core/testing';\n`;
        output += `import { ${component_name}Component } from './${this.toKebabCase(component_name)}.component';\n\n`;
        output += `describe('${component_name}Component', () => {\n`;
        output += `  let component: ${component_name}Component;\n`;
        output += `  let fixture: ComponentFixture<${component_name}Component>;\n\n`;
        output += `  beforeEach(() => {\n`;
        output += `    TestBed.configureTestingModule({\n`;
        output += `      declarations: [${component_name}Component]\n`;
        output += `    });\n`;
        output += `    fixture = TestBed.createComponent(${component_name}Component);\n`;
        output += `    component = fixture.componentInstance;\n`;
        output += `  });\n\n`;
        output += `  it('should create', () => {\n`;
        output += `    expect(component).toBeTruthy();\n`;
        output += `  });\n`;
        if (analysis.hasButtons) {
          output += `\n  it('should emit buttonClick on button press', () => {\n`;
          output += `    spyOn(component.buttonClick, 'emit');\n`;
          output += `    const button = fixture.nativeElement.querySelector('button');\n`;
          output += `    button.click();\n`;
          output += `    expect(component.buttonClick.emit).toHaveBeenCalled();\n`;
          output += `  });\n`;
        }
        output += `});\n`;
        output += '```\n\n';
        break;
    }
    
    // Bonnes pratiques
    output += '### Bonnes pratiques\n\n';
    output += '1. **Accessibilité**: Vérifiez que tous les éléments interactifs sont accessibles au clavier\n';
    output += '2. **Performance**: Implémentez la mémorisation pour les composants coûteux\n';
    output += '3. **Tests**: Couvrez au minimum 80% du code avec des tests\n';
    output += '4. **Documentation**: Documentez les props et les événements\n';
    output += '5. **DSFR**: Respectez les guidelines du DSFR pour la cohérence\n\n';
    
    // Déploiement
    output += '### Intégration dans un projet existant\n\n';
    output += '```bash\n';
    output += '# Installation des dépendances DSFR\n';
    output += 'npm install @gouvfr/dsfr\n\n';
    
    switch (target_framework) {
      case 'react':
        output += '# Dépendances React supplémentaires\n';
        output += 'npm install prop-types\n';
        output += 'npm install --save-dev @testing-library/react @testing-library/jest-dom\n';
        break;
      case 'vue':
        output += '# Dépendances Vue supplémentaires\n';
        output += 'npm install --save-dev @vue/test-utils\n';
        break;
      case 'angular':
        output += '# Le CLI Angular gère automatiquement les dépendances de test\n';
        output += 'ng test  # Pour lancer les tests\n';
        break;
    }
    output += '```\n';
    
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

  // Méthodes utilitaires pour la création de thèmes avancés

  generateColorPalette(primaryColor, secondaryColor) {
    if (!primaryColor) {
      return { primary: {}, secondary: {} };
    }

    return {
      primary: {
        lighter: this.adjustColor(primaryColor, 0.4),
        light: this.adjustColor(primaryColor, 0.2),
        main: primaryColor,
        dark: this.adjustColor(primaryColor, -0.2),
        darker: this.adjustColor(primaryColor, -0.4)
      },
      secondary: secondaryColor ? {
        lighter: this.adjustColor(secondaryColor, 0.4),
        light: this.adjustColor(secondaryColor, 0.2),
        main: secondaryColor,
        dark: this.adjustColor(secondaryColor, -0.2),
        darker: this.adjustColor(secondaryColor, -0.4)
      } : {}
    };
  }

  adjustColor(color, amount) {
    // Conversion hex vers RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Ajustement de luminosité
    const adjust = (val) => {
      const adjusted = amount > 0 
        ? val + (255 - val) * amount 
        : val + val * amount;
      return Math.round(Math.max(0, Math.min(255, adjusted)));
    };

    const newR = adjust(r);
    const newG = adjust(g);
    const newB = adjust(b);

    // Retour au format hex
    const toHex = (val) => val.toString(16).padStart(2, '0');
    return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
  }

  adjustColorForDarkMode(color) {
    // Ajustement spécifique pour le mode sombre (plus lumineux)
    return this.adjustColor(color, 0.3);
  }

  analyzeColorContrast(color) {
    // Calcul simplifié du contraste (luminance relative)
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    // Luminance relative
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    // Contraste avec blanc et noir
    const whiteContrast = (1 + 0.05) / (luminance + 0.05);
    const blackContrast = (luminance + 0.05) / (0 + 0.05);

    return {
      whiteContrast: whiteContrast.toFixed(2),
      blackContrast: blackContrast.toFixed(2),
      recommendation: whiteContrast >= 4.5 ? 'Texte blanc recommandé' : 'Texte noir recommandé'
    };
  }

  // Méthodes avancées pour la conversion de framework

  convertToReactAdvanced(html, componentName) {
    // Analyse du HTML pour extraire les composants
    const analysis = this.analyzeHtmlStructure(html);
    
    let output = '```jsx\n';
    output += `import React from 'react';\n`;
    output += `import PropTypes from 'prop-types';\n`;
    output += `import '@gouvfr/dsfr/dist/dsfr.css';\n\n`;
    
    // Génération des props basées sur l'analyse
    const props = this.extractPropsFromHtml(html);
    const propsSignature = props.length > 0 ? `{ ${props.join(', ')} }` : 'props';
    
    output += `const ${componentName} = (${propsSignature}) => {\n`;
    
    // Hooks et état local si nécessaire
    if (analysis.hasInteractiveElements) {
      output += `  const [isOpen, setIsOpen] = React.useState(false);\n\n`;
    }
    
    // Gestionnaires d'événements
    if (analysis.hasButtons) {
      output += `  const handleClick = (event) => {\n`;
      output += `    // Gérer les interactions\n`;
      output += `    console.log('Button clicked:', event);\n`;
      output += `  };\n\n`;
    }
    
    output += `  return (\n`;
    output += this.htmlToJSXAdvanced(html, '    ', analysis);
    output += `\n  );\n`;
    output += `};\n\n`;
    
    // PropTypes
    if (props.length > 0) {
      output += `${componentName}.propTypes = {\n`;
      props.forEach(prop => {
        output += `  ${prop}: PropTypes.string,\n`;
      });
      output += `};\n\n`;
    }
    
    // Valeurs par défaut
    if (props.length > 0) {
      output += `${componentName}.defaultProps = {\n`;
      props.forEach(prop => {
        output += `  ${prop}: '',\n`;
      });
      output += `};\n\n`;
    }
    
    output += `export default ${componentName};\n`;
    output += '```\n\n';
    
    // Documentation d'utilisation
    output += '### Utilisation\n\n';
    output += '```jsx\n';
    output += `import ${componentName} from './${componentName}';\n\n`;
    output += 'function App() {\n';
    output += '  return (\n';
    output += `    <${componentName}`;
    if (props.length > 0) {
      output += '\n';
      props.forEach(prop => {
        output += `      ${prop}="valeur"\n`;
      });
      output += '    ';
    }
    output += '/>\n';
    output += '  );\n';
    output += '}\n';
    output += '```\n';
    
    return output;
  }

  convertToVueAdvanced(html, componentName) {
    const analysis = this.analyzeHtmlStructure(html);
    const props = this.extractPropsFromHtml(html);
    
    let output = '```vue\n';
    output += '<template>\n';
    output += this.htmlToVueTemplate(html, '  ', analysis);
    output += '\n</template>\n\n';
    
    output += '<script>\n';
    output += 'export default {\n';
    output += `  name: '${componentName}',\n`;
    
    // Props
    if (props.length > 0) {
      output += '  props: {\n';
      props.forEach(prop => {
        output += `    ${prop}: {\n`;
        output += `      type: String,\n`;
        output += `      default: ''\n`;
        output += `    },\n`;
      });
      output += '  },\n';
    }
    
    // Data
    if (analysis.hasInteractiveElements) {
      output += '  data() {\n';
      output += '    return {\n';
      output += '      isOpen: false\n';
      output += '    };\n';
      output += '  },\n';
    }
    
    // Methods
    if (analysis.hasButtons) {
      output += '  methods: {\n';
      output += '    handleClick(event) {\n';
      output += '      console.log("Button clicked:", event);\n';
      output += '    }\n';
      output += '  },\n';
    }
    
    // Lifecycle
    output += '  mounted() {\n';
    output += '    // Initialisation des composants DSFR si nécessaire\n';
    output += '  }\n';
    
    output += '}\n';
    output += '</script>\n\n';
    
    output += '<style scoped>\n';
    output += '@import "@gouvfr/dsfr/dist/dsfr.css";\n';
    output += '</style>\n';
    output += '```\n';
    
    return output;
  }

  convertToAngularAdvanced(html, componentName) {
    const analysis = this.analyzeHtmlStructure(html);
    const props = this.extractPropsFromHtml(html);
    const kebabName = this.toKebabCase(componentName);
    
    let output = '## Component TypeScript\n\n';
    output += '```typescript\n';
    output += `import { Component, Input, Output, EventEmitter } from '@angular/core';\n\n`;
    
    output += '@Component({\n';
    output += `  selector: 'dsfr-${kebabName}',\n`;
    output += `  templateUrl: './${kebabName}.component.html',\n`;
    output += `  styleUrls: ['./${kebabName}.component.scss']\n`;
    output += '})\n';
    output += `export class ${componentName}Component {\n`;
    
    // Inputs
    props.forEach(prop => {
      output += `  @Input() ${prop}: string = '';\n`;
    });
    
    // Outputs
    if (analysis.hasButtons) {
      output += `  @Output() buttonClick = new EventEmitter<Event>();\n\n`;
    }
    
    // Properties
    if (analysis.hasInteractiveElements) {
      output += `  isOpen = false;\n\n`;
    }
    
    // Methods
    if (analysis.hasButtons) {
      output += `  onButtonClick(event: Event) {\n`;
      output += `    this.buttonClick.emit(event);\n`;
      output += `  }\n\n`;
    }
    
    output += '}\n';
    output += '```\n\n';
    
    // Template
    output += '## Template HTML\n\n';
    output += '```html\n';
    output += this.htmlToAngularTemplate(html, analysis);
    output += '\n```\n\n';
    
    // Module
    output += '## Module Declaration\n\n';
    output += '```typescript\n';
    output += `import { NgModule } from '@angular/core';\n`;
    output += `import { CommonModule } from '@angular/common';\n`;
    output += `import { ${componentName}Component } from './${kebabName}.component';\n\n`;
    
    output += '@NgModule({\n';
    output += '  declarations: [\n';
    output += `    ${componentName}Component\n`;
    output += '  ],\n';
    output += '  imports: [\n';
    output += '    CommonModule\n';
    output += '  ],\n';
    output += '  exports: [\n';
    output += `    ${componentName}Component\n`;
    output += '  ]\n';
    output += '})\n';
    output += `export class ${componentName}Module { }\n`;
    output += '```\n';
    
    return output;
  }

  analyzeHtmlStructure(html) {
    return {
      hasButtons: html.includes('<button') || html.includes('fr-btn'),
      hasInputs: html.includes('<input') || html.includes('<textarea'),
      hasModals: html.includes('fr-modal'),
      hasAccordions: html.includes('fr-accordion'),
      hasTabs: html.includes('fr-tabs'),
      hasInteractiveElements: html.includes('fr-btn') || html.includes('fr-modal') || html.includes('fr-accordion')
    };
  }

  extractPropsFromHtml(html) {
    const props = [];
    
    // Extraire les attributs class dynamiques
    const classMatches = html.match(/class="[^"]*\{[^}]*\}[^"]*"/g);
    if (classMatches) {
      props.push('className');
    }
    
    // Extraire les titres, labels, etc.
    if (html.includes('fr-btn')) {
      props.push('label');
    }
    
    if (html.includes('<h') || html.includes('fr-card__title')) {
      props.push('title');
    }
    
    if (html.includes('fr-card__desc') || html.includes('<p')) {
      props.push('description');
    }
    
    return [...new Set(props)]; // Dédoublonner
  }

  htmlToJSXAdvanced(html, indent, analysis) {
    let jsx = html
      .replace(/class=/g, 'className=')
      .replace(/for=/g, 'htmlFor=')
      .replace(/tabindex=/g, 'tabIndex=')
      .replace(/<!--/g, '{/*')
      .replace(/-->/g, '*/}');
    
    // Remplacer les événements
    if (analysis.hasButtons) {
      jsx = jsx.replace(/<button([^>]*)>/g, '<button$1 onClick={handleClick}>');
    }
    
    // Ajouter des props dynamiques
    jsx = jsx.replace(/Titre de la carte/g, '{title || "Titre de la carte"}');
    jsx = jsx.replace(/Description/g, '{description || "Description"}');
    jsx = jsx.replace(/Libellé bouton/g, '{label || "Libellé bouton"}');
    
    return jsx.split('\n').map(line => indent + line).join('\n');
  }

  htmlToVueTemplate(html, indent, analysis) {
    let template = html;
    
    // Remplacer les événements
    if (analysis.hasButtons) {
      template = template.replace(/<button([^>]*)>/g, '<button$1 @click="handleClick">');
    }
    
    // Ajouter des props dynamiques avec syntaxe Vue
    template = template.replace(/Titre de la carte/g, '{{ title || "Titre de la carte" }}');
    template = template.replace(/Description/g, '{{ description || "Description" }}');
    template = template.replace(/Libellé bouton/g, '{{ label || "Libellé bouton" }}');
    
    return template.split('\n').map(line => indent + line).join('\n');
  }

  htmlToAngularTemplate(html, analysis) {
    let template = html;
    
    // Remplacer les événements
    if (analysis.hasButtons) {
      template = template.replace(/<button([^>]*)>/g, '<button$1 (click)="onButtonClick($event)">');
    }
    
    // Ajouter des props dynamiques avec syntaxe Angular
    template = template.replace(/Titre de la carte/g, '{{ title || "Titre de la carte" }}');
    template = template.replace(/Description/g, '{{ description || "Description" }}');
    template = template.replace(/Libellé bouton/g, '{{ label || "Libellé bouton" }}');
    
    return template;
  }

  toKebabCase(str) {
    return str
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase()
      .replace(/^-/, '');
  }

  // Méthodes utilitaires pour les composants avancés

  createBasicComponentStructure(componentType) {
    return {
      name: componentType,
      type: 'component',
      examples: [{
        content: this.getAdvancedTemplate(componentType, {})
      }],
      documentation: `Composant ${componentType} généré automatiquement`,
      scripts: this.requiresJavaScript(componentType) ? { main: 'component.js' } : {}
    };
  }

  getAvailableVariants(componentType) {
    const variants = {
      'button': [
        { name: 'primary', description: 'Bouton principal (action importante)' },
        { name: 'secondary', description: 'Bouton secondaire (action moins importante)' },
        { name: 'tertiary', description: 'Bouton tertiaire (action optionnelle)' },
        { name: 'tertiary-no-outline', description: 'Bouton tertiaire sans contour' }
      ],
      'alert': [
        { name: 'info', description: 'Information neutre' },
        { name: 'success', description: 'Message de succès' },
        { name: 'warning', description: 'Avertissement' },
        { name: 'error', description: 'Message d\'erreur' }
      ],
      'card': [
        { name: 'default', description: 'Carte standard' },
        { name: 'horizontal', description: 'Carte horizontale' },
        { name: 'download', description: 'Carte de téléchargement' },
        { name: 'grey', description: 'Carte avec fond gris' }
      ],
      'badge': [
        { name: 'info', description: 'Badge informatif' },
        { name: 'success', description: 'Badge de succès' },
        { name: 'warning', description: 'Badge d\'avertissement' },
        { name: 'error', description: 'Badge d\'erreur' },
        { name: 'new', description: 'Badge nouveau' }
      ]
    };
    
    return variants[componentType] || [
      { name: 'default', description: 'Variante par défaut' }
    ];
  }

  getAdvancedTemplate(componentType, options) {
    const templates = {
      'button': this.getButtonTemplate(options),
      'alert': this.getAlertTemplate(options),
      'card': this.getCardTemplate(options),
      'badge': this.getBadgeTemplate(options),
      'input': this.getInputTemplate(options),
      'modal': this.getModalTemplate(options),
      'accordion': this.getAccordionTemplate(options),
      'breadcrumb': this.getBreadcrumbTemplate(options),
      'navigation': this.getNavigationTemplate(options),
      'header': this.getHeaderTemplate(options),
      'footer': this.getFooterTemplate(options)
    };
    
    return templates[componentType] || this.getGenericTemplate(componentType, options);
  }

  getButtonTemplate(options) {
    const variant = options.variant || 'primary';
    const size = options.size || '';
    const icon = options.icon || '';
    const iconPosition = options.icon_position || 'left';
    
    let classes = ['fr-btn'];
    if (variant !== 'primary') classes.push(`fr-btn--${variant}`);
    if (size) classes.push(`fr-btn--${size}`);
    if (icon) {
      classes.push(`fr-icon-${icon}`);
      classes.push(`fr-btn--icon-${iconPosition}`);
    }
    
    const disabled = options.disabled ? ' disabled' : '';
    const label = options.label || 'Libellé bouton';
    
    return `<button type="button" class="${classes.join(' ')}"${disabled} onclick="handleClick($event)">
  ${label}
</button>`;
  }

  getAlertTemplate(options) {
    const variant = options.variant || 'info';
    const title = options.title || 'Titre de l\'alerte';
    const description = options.description || 'Description de l\'alerte';
    const closable = options.closable || false;
    
    let template = `<div class="fr-alert fr-alert--${variant}" role="alert">
  <p class="fr-alert__title">${title}</p>
  <p>${description}</p>`;
    
    if (closable) {
      template += `
  <button class="fr-btn--close fr-btn" title="Fermer l'alerte" onclick="handleClose($event)">
    Fermer
  </button>`;
    }
    
    template += '\n</div>';
    return template;
  }

  getCardTemplate(options) {
    const title = options.title || 'Titre de la carte';
    const description = options.description || 'Description de la carte';
    const imageUrl = options.image_url || '';
    const linkUrl = options.link_url || '#';
    const variant = options.variant || 'default';
    
    let classes = ['fr-card'];
    if (variant !== 'default') classes.push(`fr-card--${variant}`);
    
    let template = `<div class="${classes.join(' ')}">`;
    
    if (imageUrl) {
      template += `
  <div class="fr-card__header">
    <div class="fr-card__img">
      <img src="${imageUrl}" alt="${title}" class="fr-responsive-img">
    </div>
  </div>`;
    }
    
    template += `
  <div class="fr-card__body">
    <div class="fr-card__content">
      <h3 class="fr-card__title">
        <a href="${linkUrl}" class="fr-card__link">${title}</a>
      </h3>
      <p class="fr-card__desc">${description}</p>
    </div>
  </div>
</div>`;
    
    return template;
  }

  getBadgeTemplate(options) {
    const variant = options.variant || 'info';
    const label = options.label || 'Badge';
    const small = options.small ? ' fr-badge--sm' : '';
    
    return `<span class="fr-badge fr-badge--${variant}${small}">${label}</span>`;
  }

  getInputTemplate(options) {
    const type = options.type || 'text';
    const label = options.label || 'Libellé du champ';
    const placeholder = options.placeholder || '';
    const required = options.required ? ' required' : '';
    const disabled = options.disabled ? ' disabled' : '';
    const error = options.error || '';
    const hint = options.hint || '';
    
    let template = `<div class="fr-input-group${error ? ' fr-input-group--error' : ''}">
  <label class="fr-label" for="input-example">
    ${label}${required ? ' *' : ''}`;
    
    if (hint) {
      template += `
    <span class="fr-hint-text">${hint}</span>`;
    }
    
    template += `
  </label>
  <input class="fr-input${error ? ' fr-input--error' : ''}" type="${type}" id="input-example" placeholder="${placeholder}"${required}${disabled}>`;
    
    if (error) {
      template += `
  <p class="fr-error-text">${error}</p>`;
    }
    
    template += '\n</div>';
    return template;
  }

  getModalTemplate(options) {
    const title = options.title || 'Titre de la modale';
    const content = options.content || 'Contenu de la modale';
    const size = options.size || '';
    
    let classes = ['fr-modal'];
    if (size) classes.push(`fr-modal--${size}`);
    
    return `<dialog id="modal-example" class="${classes.join(' ')}" role="dialog" aria-labelledby="modal-title">
  <div class="fr-container fr-container--fluid fr-container-md">
    <div class="fr-grid-row fr-grid-row--center">
      <div class="fr-col-12 fr-col-md-8 fr-col-lg-6">
        <div class="fr-modal__body">
          <div class="fr-modal__header">
            <button class="fr-btn--close fr-btn" title="Fermer la modale" onclick="handleClose($event)">
              Fermer
            </button>
          </div>
          <div class="fr-modal__content">
            <h1 id="modal-title" class="fr-modal__title">${title}</h1>
            <p>${content}</p>
          </div>
          <div class="fr-modal__footer">
            <ul class="fr-btns-group fr-btns-group--right fr-btns-group--inline-reverse fr-btns-group--inline-lg">
              <li>
                <button class="fr-btn fr-btn--secondary" onclick="handleCancel($event)">
                  Annuler
                </button>
              </li>
              <li>
                <button class="fr-btn" onclick="handleConfirm($event)">
                  Confirmer
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</dialog>`;
  }

  getAccordionTemplate(options) {
    const title = options.title || 'Titre de l\'accordéon';
    const content = options.content || 'Contenu de l\'accordéon';
    
    return `<section class="fr-accordion">
  <h3 class="fr-accordion__title">
    <button class="fr-accordion__btn" aria-expanded="false" aria-controls="accordion-example" onclick="handleToggle($event)">
      ${title}
    </button>
  </h3>
  <div class="fr-collapse" id="accordion-example">
    <div class="fr-accordion__content">
      <p>${content}</p>
    </div>
  </div>
</section>`;
  }

  getBreadcrumbTemplate(options) {
    const items = options.items || [
      { label: 'Accueil', url: '/' },
      { label: 'Section', url: '/section' },
      { label: 'Page courante', url: '', current: true }
    ];
    
    let template = `<nav role="navigation" class="fr-breadcrumb" aria-label="vous êtes ici :">
  <button class="fr-breadcrumb__btn" aria-expanded="false" aria-controls="breadcrumb-example" onclick="handleToggle($event)">
    Voir le fil d'Ariane
  </button>
  <div class="fr-collapse" id="breadcrumb-example">
    <ol class="fr-breadcrumb__list">`;
    
    items.forEach((item, index) => {
      if (item.current) {
        template += `
      <li>
        <a class="fr-breadcrumb__link" aria-current="page">${item.label}</a>
      </li>`;
      } else {
        template += `
      <li>
        <a class="fr-breadcrumb__link" href="${item.url}">${item.label}</a>
      </li>`;
      }
    });
    
    template += `
    </ol>
  </div>
</nav>`;
    
    return template;
  }

  getNavigationTemplate(options) {
    const items = options.items || [
      { label: 'Accueil', url: '/', current: true },
      { label: 'Services', url: '/services' },
      { label: 'Contact', url: '/contact' }
    ];
    
    let template = `<nav class="fr-nav" role="navigation" aria-label="Menu principal">
  <ul class="fr-nav__list">`;
    
    items.forEach(item => {
      template += `
    <li class="fr-nav__item">
      <a class="fr-nav__link${item.current ? ' fr-nav__link--active' : ''}" href="${item.url}"${item.current ? ' aria-current="page"' : ''}>
        ${item.label}
      </a>
    </li>`;
    });
    
    template += `
  </ul>
</nav>`;
    
    return template;
  }

  getHeaderTemplate(options) {
    const serviceName = options.service_name || 'Nom du service';
    const tagline = options.tagline || 'Baseline du service';
    
    return `<header role="banner" class="fr-header">
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
            <a href="/" title="Accueil - ${serviceName}">
              <p class="fr-header__service-title">${serviceName}</p>
            </a>
            <p class="fr-header__service-tagline">${tagline}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</header>`;
  }

  getFooterTemplate(options) {
    const serviceName = options.service_name || 'Nom du service';
    
    return `<footer class="fr-footer" role="contentinfo">
  <div class="fr-container">
    <div class="fr-footer__body">
      <div class="fr-footer__brand fr-enlarge-link">
        <p class="fr-logo">
          République
          <br>Française
        </p>
      </div>
      <div class="fr-footer__content">
        <p class="fr-footer__content-desc">
          ${serviceName} est un service public numérique.
        </p>
        <ul class="fr-footer__content-list">
          <li class="fr-footer__content-item">
            <a class="fr-footer__content-link" href="/mentions-legales">Mentions légales</a>
          </li>
          <li class="fr-footer__content-item">
            <a class="fr-footer__content-link" href="/accessibilite">Accessibilité</a>
          </li>
          <li class="fr-footer__content-item">
            <a class="fr-footer__content-link" href="/donnees-personnelles">Données personnelles</a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</footer>`;
  }

  getGenericTemplate(componentType, options) {
    const content = options.content || `Contenu du composant ${componentType}`;
    return `<div class="fr-${componentType}">
  ${content}
</div>`;
  }

  getComponentProps(componentType, options) {
    const commonProps = [
      { name: 'id', type: 'string', optional: true, defaultValue: null },
      { name: 'className', type: 'string', optional: true, defaultValue: "''" }
    ];
    
    const specificProps = {
      'button': [
        { name: 'label', type: 'string', optional: false, defaultValue: "'Bouton'" },
        { name: 'variant', type: "'primary' | 'secondary' | 'tertiary'", optional: true, defaultValue: "'primary'" },
        { name: 'size', type: "'sm' | 'lg'", optional: true, defaultValue: null },
        { name: 'disabled', type: 'boolean', optional: true, defaultValue: 'false' },
        { name: 'onClick', type: '(event: MouseEvent) => void', optional: true, defaultValue: null }
      ],
      'alert': [
        { name: 'title', type: 'string', optional: false, defaultValue: "'Titre'" },
        { name: 'description', type: 'string', optional: true, defaultValue: null },
        { name: 'variant', type: "'info' | 'success' | 'warning' | 'error'", optional: true, defaultValue: "'info'" },
        { name: 'closable', type: 'boolean', optional: true, defaultValue: 'false' }
      ],
      'card': [
        { name: 'title', type: 'string', optional: false, defaultValue: "'Titre'" },
        { name: 'description', type: 'string', optional: true, defaultValue: null },
        { name: 'imageUrl', type: 'string', optional: true, defaultValue: null },
        { name: 'linkUrl', type: 'string', optional: true, defaultValue: "'#'" }
      ],
      'input': [
        { name: 'label', type: 'string', optional: false, defaultValue: "'Libellé'" },
        { name: 'type', type: "'text' | 'email' | 'password' | 'tel'", optional: true, defaultValue: "'text'" },
        { name: 'placeholder', type: 'string', optional: true, defaultValue: null },
        { name: 'required', type: 'boolean', optional: true, defaultValue: 'false' },
        { name: 'disabled', type: 'boolean', optional: true, defaultValue: 'false' },
        { name: 'error', type: 'string', optional: true, defaultValue: null }
      ]
    };
    
    return [...commonProps, ...(specificProps[componentType] || [])];
  }

  requiresJavaScript(componentType) {
    const jsComponents = ['modal', 'accordion', 'navigation', 'tab', 'toggle', 'breadcrumb'];
    return jsComponents.includes(componentType);
  }

  requiresState(componentType) {
    const statefulComponents = ['modal', 'accordion', 'tab', 'toggle', 'input', 'select'];
    return statefulComponents.includes(componentType);
  }

  getComponentRole(componentType) {
    const roles = {
      'button': 'button',
      'modal': 'dialog',
      'alert': 'alert',
      'navigation': 'navigation',
      'breadcrumb': 'navigation',
      'input': 'textbox',
      'select': 'combobox'
    };
    return roles[componentType] || 'region';
  }

  generateJavaScriptForComponent(componentType, options) {
    const templates = {
      'modal': `// Gestion de la modale
function handleOpen() {
  const modal = document.getElementById('modal-example');
  modal.showModal();
}

function handleClose() {
  const modal = document.getElementById('modal-example');
  modal.close();
}

function handleConfirm(event) {
  // Logique de confirmation
  console.log('Confirmé');
  handleClose();
}

function handleCancel(event) {
  // Logique d'annulation
  console.log('Annulé');
  handleClose();
}`,

      'accordion': `// Gestion de l'accordéon
function handleToggle(event) {
  const button = event.target;
  const isExpanded = button.getAttribute('aria-expanded') === 'true';
  button.setAttribute('aria-expanded', !isExpanded);
  
  const collapse = document.getElementById(button.getAttribute('aria-controls'));
  collapse.classList.toggle('fr-collapse--expanded');
}`,

      'breadcrumb': `// Gestion du fil d'Ariane
function handleToggle(event) {
  const button = event.target;
  const isExpanded = button.getAttribute('aria-expanded') === 'true';
  button.setAttribute('aria-expanded', !isExpanded);
  
  const collapse = document.getElementById(button.getAttribute('aria-controls'));
  collapse.classList.toggle('fr-collapse--expanded');
}`
    };
    
    return templates[componentType] || `// Gestion des événements pour ${componentType}
function handleClick(event) {
  console.log('${componentType} clicked:', event);
}`;
  }

  generateAccessibilityGuide(componentType) {
    let output = '\n## Guide d\'accessibilité\n\n';
    
    const guidelines = {
      'button': [
        'Utilisez des libellés explicites et descriptifs',
        'Assurez-vous que les boutons sont accessibles au clavier',
        'Utilisez `aria-pressed` pour les boutons à bascule',
        'Respectez un contraste minimum de 4.5:1'
      ],
      'modal': [
        'Gérez le focus lors de l\'ouverture et fermeture',
        'Piégez le focus à l\'intérieur de la modale',
        'Utilisez `aria-labelledby` et `aria-describedby`',
        'Permettez la fermeture avec Échap'
      ],
      'input': [
        'Associez toujours un label au champ',
        'Utilisez `aria-describedby` pour les messages d\'aide',
        'Marquez les champs obligatoires avec `required`',
        'Fournissez des messages d\'erreur explicites'
      ]
    };
    
    const componentGuidelines = guidelines[componentType] || [
      'Respectez les standards WCAG 2.1 AA',
      'Testez avec un lecteur d\'écran',
      'Assurez-vous de la navigation au clavier',
      'Vérifiez le contraste des couleurs'
    ];
    
    componentGuidelines.forEach(guideline => {
      output += `- ${guideline}\n`;
    });
    
    output += '\n### Tests recommandés\n\n';
    output += '- Test avec lecteur d\'écran (NVDA, JAWS, VoiceOver)\n';
    output += '- Navigation complète au clavier\n';
    output += '- Validation automatisée (axe-core)\n';
    output += '- Test de contraste (Colour Contrast Analyser)\n\n';
    
    return output;
  }

  generateUsageExamples(componentType, framework, options) {
    let output = '\n## Exemples d\'utilisation\n\n';
    
    switch (framework) {
      case 'vanilla':
        output += '### Intégration HTML simple\n\n';
        output += '```html\n';
        output += '<!DOCTYPE html>\n';
        output += '<html lang="fr">\n';
        output += '<head>\n';
        output += '  <meta charset="UTF-8">\n';
        output += '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n';
        output += '  <title>Exemple DSFR</title>\n';
        output += '  <link rel="stylesheet" href="@gouvfr/dsfr/dist/dsfr.min.css">\n';
        output += '</head>\n';
        output += '<body>\n';
        output += this.indentHTML(this.getAdvancedTemplate(componentType, options), '  ');
        output += '\n  <script src="@gouvfr/dsfr/dist/dsfr.min.js"></script>\n';
        output += '</body>\n';
        output += '</html>\n';
        output += '```\n\n';
        break;
        
      case 'react':
        output += '### Utilisation dans une application React\n\n';
        output += '```jsx\n';
        output += `import ${this.toPascalCase(componentType)} from './components/${this.toPascalCase(componentType)}';\n\n`;
        output += 'function App() {\n';
        output += '  return (\n';
        output += '    <div className="App">\n';
        output += `      <${this.toPascalCase(componentType)}\n`;
        
        const props = this.getComponentProps(componentType, options);
        props.slice(0, 3).forEach(prop => {
          output += `        ${prop.name}="${prop.defaultValue || 'valeur'}"\n`;
        });
        
        output += '      />\n';
        output += '    </div>\n';
        output += '  );\n';
        output += '}\n';
        output += '```\n\n';
        break;
        
      case 'vue':
        output += '### Utilisation dans une application Vue\n\n';
        output += '```vue\n';
        output += '<template>\n';
        output += '  <div id="app">\n';
        output += `    <${this.toPascalCase(componentType)}\n`;
        
        const vueProps = this.getComponentProps(componentType, options);
        vueProps.slice(0, 3).forEach(prop => {
          output += `      :${prop.name}="${prop.defaultValue || 'value'}"\n`;
        });
        
        output += '    />\n';
        output += '  </div>\n';
        output += '</template>\n\n';
        output += '<script>\n';
        output += `import ${this.toPascalCase(componentType)} from './components/${this.toPascalCase(componentType)}.vue';\n\n`;
        output += 'export default {\n';
        output += '  components: {\n';
        output += `    ${this.toPascalCase(componentType)}\n`;
        output += '  }\n';
        output += '}\n';
        output += '</script>\n';
        output += '```\n\n';
        break;
        
      case 'angular':
        output += '### Utilisation dans une application Angular\n\n';
        output += '```html\n';
        output += `<dsfr-${this.toKebabCase(componentType)}\n`;
        
        const ngProps = this.getComponentProps(componentType, options);
        ngProps.slice(0, 3).forEach(prop => {
          output += `  [${prop.name}]="${prop.defaultValue || 'value'}"\n`;
        });
        
        output += '  (click)="onComponentClick($event)">\n';
        output += `</dsfr-${this.toKebabCase(componentType)}>\n`;
        output += '```\n\n';
        break;
    }
    
    return output;
  }
}

module.exports = GeneratorService;
