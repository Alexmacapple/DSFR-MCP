/**
 * Service de génération de composants DSFR optimisé
 * Version 2.0 avec cache intelligent et templates précalculés
 */

const { LRUCache } = require('lru-cache');

class OptimizedGeneratorService {
  constructor() {
    // Cache des templates avec TTL de 1 heure
    this.templateCache = new LRUCache({
      max: 500,
      ttl: 1000 * 60 * 60, // 1 heure
    });

    // Templates précalculés pour les composants les plus fréquents
    this.precompiledTemplates = this.initializePrecompiledTemplates();

    // Métriques de performance
    this.metrics = {
      cacheHits: 0,
      cacheMisses: 0,
      generationTime: [],
    };

    // Pré-chauffage du cache au démarrage
    this.warmUpCache();
  }

  initializePrecompiledTemplates() {
    return {
      react: {
        button: {
          primary: `import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const DSFRButton: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  disabled = false, 
  size = 'md',
  className = ''
}) => {
  const sizeClass = {
    sm: 'fr-btn--sm',
    md: '',
    lg: 'fr-btn--lg'
  }[size];

  return (
    <button 
      className={\`fr-btn \${sizeClass} \${className}\`}
      onClick={onClick}
      disabled={disabled}
      type="button"
    >
      {children}
    </button>
  );
};

export default DSFRButton;`,
          secondary: `import React from 'react';

interface SecondaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export const DSFRSecondaryButton: React.FC<SecondaryButtonProps> = ({ 
  children, 
  onClick, 
  disabled = false,
  className = ''
}) => {
  return (
    <button 
      className={\`fr-btn fr-btn--secondary \${className}\`}
      onClick={onClick}
      disabled={disabled}
      type="button"
    >
      {children}
    </button>
  );
};

export default DSFRSecondaryButton;`,
        },
        form: `import React, { useState } from 'react';

interface DSFRFormProps {
  onSubmit: (data: FormData) => void;
  className?: string;
}

interface FormData {
  [key: string]: string;
}

export const DSFRForm: React.FC<DSFRFormProps> = ({ onSubmit, className = '' }) => {
  const [formData, setFormData] = useState<FormData>({});
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  const updateField = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form className={\`fr-form \${className}\`} onSubmit={handleSubmit}>
      <div className="fr-form-group">
        <label className="fr-label" htmlFor="field-1">
          Champ requis
        </label>
        <input 
          className="fr-input" 
          type="text" 
          id="field-1"
          name="field1"
          required
          onChange={(e) => updateField('field1', e.target.value)}
        />
      </div>
      
      <div className="fr-form-group">
        <button className="fr-btn" type="submit">
          Valider
        </button>
      </div>
    </form>
  );
};

export default DSFRForm;`,
        card: `import React from 'react';

interface DSFRCardProps {
  title: string;
  description?: string;
  imageUrl?: string;
  href?: string;
  className?: string;
  children?: React.ReactNode;
}

export const DSFRCard: React.FC<DSFRCardProps> = ({ 
  title, 
  description, 
  imageUrl, 
  href,
  className = '',
  children 
}) => {
  const CardContent = (
    <div className={\`fr-card \${className}\`}>
      <div className="fr-card__body">
        <div className="fr-card__content">
          <h3 className="fr-card__title">
            {href ? <a href={href}>{title}</a> : title}
          </h3>
          {description && (
            <p className="fr-card__desc">{description}</p>
          )}
          {children}
        </div>
      </div>
      {imageUrl && (
        <div className="fr-card__header">
          <div className="fr-card__img">
            <img className="fr-responsive-img" src={imageUrl} alt="" />
          </div>
        </div>
      )}
    </div>
  );

  return CardContent;
};

export default DSFRCard;`,
      },
      vue: {
        button: `<template>
  <button 
    :class="buttonClasses"
    :disabled="disabled"
    @click="handleClick"
    type="button"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  className: ''
});

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const buttonClasses = computed(() => {
  const classes = ['fr-btn'];
  
  if (props.variant === 'secondary') classes.push('fr-btn--secondary');
  if (props.variant === 'tertiary') classes.push('fr-btn--tertiary');
  
  if (props.size === 'sm') classes.push('fr-btn--sm');
  if (props.size === 'lg') classes.push('fr-btn--lg');
  
  if (props.className) classes.push(props.className);
  
  return classes.join(' ');
});

const handleClick = (event: MouseEvent) => {
  if (!props.disabled) {
    emit('click', event);
  }
};
</script>`,
        form: `<template>
  <form :class="\`fr-form \${className}\`" @submit.prevent="handleSubmit">
    <div class="fr-form-group">
      <label class="fr-label" :for="fieldId">
        {{ label }}
      </label>
      <input 
        :id="fieldId"
        v-model="inputValue"
        class="fr-input" 
        :type="inputType"
        :required="required"
        :placeholder="placeholder"
      />
    </div>
    
    <div class="fr-form-group">
      <button class="fr-btn" type="submit" :disabled="!isValid">
        {{ submitText }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, generateId } from 'vue';

interface Props {
  label?: string;
  inputType?: string;
  required?: boolean;
  placeholder?: string;
  submitText?: string;
  className?: string;
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Champ requis',
  inputType: 'text',
  required: true,
  placeholder: '',
  submitText: 'Valider',
  className: ''
});

const emit = defineEmits<{
  submit: [value: string];
}>();

const inputValue = ref('');
const fieldId = ref(\`field-\${Math.random().toString(36).substr(2, 9)}\`);

const isValid = computed(() => {
  if (props.required) {
    return inputValue.value.trim().length > 0;
  }
  return true;
});

const handleSubmit = () => {
  if (isValid.value) {
    emit('submit', inputValue.value);
  }
};
</script>`,
      },
      angular: {
        button: `import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'dsfr-button',
  template: \`
    <button 
      [class]="buttonClasses"
      [disabled]="disabled"
      (click)="handleClick()"
      type="button">
      <ng-content></ng-content>
    </button>
  \`,
  styleUrls: ['./dsfr-button.component.scss']
})
export class DSFRButtonComponent {
  @Input() variant: 'primary' | 'secondary' | 'tertiary' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() disabled: boolean = false;
  @Input() className: string = '';
  
  @Output() click = new EventEmitter<MouseEvent>();

  get buttonClasses(): string {
    const classes = ['fr-btn'];
    
    if (this.variant === 'secondary') classes.push('fr-btn--secondary');
    if (this.variant === 'tertiary') classes.push('fr-btn--tertiary');
    
    if (this.size === 'sm') classes.push('fr-btn--sm');
    if (this.size === 'lg') classes.push('fr-btn--lg');
    
    if (this.className) classes.push(this.className);
    
    return classes.join(' ');
  }

  handleClick(): void {
    if (!this.disabled) {
      this.click.emit();
    }
  }
}`,
        form: `import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'dsfr-form',
  template: \`
    <form [formGroup]="dsfrForm" (ngSubmit)="handleSubmit()" [class]="'fr-form ' + className">
      <div class="fr-form-group">
        <label class="fr-label" [for]="fieldId">
          {{ label }}
        </label>
        <input 
          [id]="fieldId"
          formControlName="mainField"
          class="fr-input" 
          [type]="inputType"
          [placeholder]="placeholder"
        />
      </div>
      
      <div class="fr-form-group">
        <button 
          class="fr-btn" 
          type="submit" 
          [disabled]="dsfrForm.invalid">
          {{ submitText }}
        </button>
      </div>
    </form>
  \`,
  styleUrls: ['./dsfr-form.component.scss']
})
export class DSFRFormComponent {
  @Input() label: string = 'Champ requis';
  @Input() inputType: string = 'text';
  @Input() required: boolean = true;
  @Input() placeholder: string = '';
  @Input() submitText: string = 'Valider';
  @Input() className: string = '';
  
  @Output() submit = new EventEmitter<string>();

  dsfrForm: FormGroup;
  fieldId: string;

  constructor(private fb: FormBuilder) {
    this.fieldId = \`field-\${Math.random().toString(36).substr(2, 9)}\`;
    this.dsfrForm = this.fb.group({
      mainField: ['', this.required ? Validators.required : null]
    });
  }

  handleSubmit(): void {
    if (this.dsfrForm.valid) {
      this.submit.emit(this.dsfrForm.value.mainField);
    }
  }
}`,
      },
    };
  }

  async generateComponent(args) {
    const startTime = performance.now();

    try {
      const { component_type = 'button', framework = 'react', options = {} } = args;

      // Génération de la clé de cache
      const cacheKey = this.generateCacheKey(component_type, framework, options);

      // Vérifier le cache en premier
      if (this.templateCache.has(cacheKey)) {
        this.metrics.cacheHits++;
        const endTime = performance.now();
        this.metrics.generationTime.push(endTime - startTime);

        // Cache HIT - log supprimé pour compatibilité MCP

        return {
          content: [
            {
              type: 'text',
              text: this.templateCache.get(cacheKey),
            },
          ],
        };
      }

      // Cache MISS - génération nécessaire
      this.metrics.cacheMisses++;

      // Utiliser les templates précalculés si disponibles
      const precompiled = this.getPrecompiledTemplate(component_type, framework, options);
      if (precompiled) {
        // Personnaliser le template précalculé si nécessaire
        const customizedCode = this.customizeTemplate(precompiled, options);

        // Mettre en cache
        this.templateCache.set(cacheKey, customizedCode);

        const endTime = performance.now();
        this.metrics.generationTime.push(endTime - startTime);

        // Template précalculé - log supprimé pour compatibilité MCP

        return {
          content: [
            {
              type: 'text',
              text: customizedCode,
            },
          ],
        };
      }

      // Génération complète (fallback)
      const generatedCode = await this.generateFromScratch(component_type, framework, options);

      // Mettre en cache
      this.templateCache.set(cacheKey, generatedCode);

      const endTime = performance.now();
      this.metrics.generationTime.push(endTime - startTime);

      // Génération complète - log supprimé pour compatibilité MCP

      return {
        content: [
          {
            type: 'text',
            text: generatedCode,
          },
        ],
      };
    } catch (error) {
      // Erreur générateur - log supprimé pour compatibilité MCP
      return {
        content: [
          {
            type: 'text',
            text: `⚠️ Erreur de génération: ${error.message}\n\nCode de base ${args.component_type || 'button'} ${args.framework || 'React'}:\n\n\`\`\`${this.getFileExtension(args.framework)}\n${this.getBasicFallback(args.component_type, args.framework)}\n\`\`\``,
          },
        ],
      };
    }
  }

  generateCacheKey(componentType, framework, options) {
    const optionsHash = JSON.stringify(options, Object.keys(options).sort());
    return `${componentType}-${framework}-${Buffer.from(optionsHash).toString('base64').slice(0, 8)}`;
  }

  getPrecompiledTemplate(componentType, framework, options) {
    const templates = this.precompiledTemplates[framework];
    if (!templates) return null;

    if (componentType === 'button' && options.variant) {
      return templates.button[options.variant] || templates.button.primary;
    }

    return templates[componentType] || null;
  }

  customizeTemplate(template, options) {
    let customized = template;

    // Remplacement des variables communes
    if (options.componentName) {
      customized = customized.replace(/DSFR\w+/g, options.componentName);
    }

    if (options.className) {
      customized = customized.replace(
        /className=\{[^}]+\}/g,
        `className={\`\${baseClasses} ${options.className}\`}`
      );
    }

    return customized;
  }

  async generateFromScratch(componentType, framework) {
    // Fallback simple pour les cas non gérés
    const baseTemplate = `// Composant ${componentType} ${framework}
// Généré automatiquement par DSFR-MCP

${this.getBasicFallback(componentType, framework)}

// Guide d'utilisation :
// 1. Importer le composant
// 2. Personnaliser les props/classes
// 3. Tester l'accessibilité
// 4. Valider avec les outils DSFR-MCP`;

    return baseTemplate;
  }

  getBasicFallback(componentType, framework) {
    const fallbacks = {
      react: {
        button: `export const Button = ({ children, ...props }) => (
  <button className="fr-btn" {...props}>
    {children}
  </button>
);`,
        default: `export const Component = (props) => (
  <div className="fr-component" {...props}>
    {/* Contenu du composant */}
  </div>
);`,
      },
      vue: {
        button: `<template>
  <button class="fr-btn">
    <slot />
  </button>
</template>`,
        default: `<template>
  <div class="fr-component">
    <!-- Contenu du composant -->
  </div>
</template>`,
      },
      angular: {
        button: `@Component({
  template: '<button class="fr-btn"><ng-content></ng-content></button>'
})
export class ButtonComponent {}`,
        default: `@Component({
  template: '<div class="fr-component"><ng-content></ng-content></div>'
})
export class ComponentClass {}`,
      },
    };

    return (
      fallbacks[framework]?.[componentType] || fallbacks[framework]?.default || 'export default {};'
    );
  }

  getFileExtension(framework) {
    const extensions = {
      react: 'tsx',
      vue: 'vue',
      angular: 'ts',
      vanilla: 'js',
    };
    return extensions[framework] || 'js';
  }

  // Méthode pour obtenir les métriques
  getMetrics() {
    const avgTime =
      this.metrics.generationTime.length > 0
        ? this.metrics.generationTime.reduce((a, b) => a + b) / this.metrics.generationTime.length
        : 0;

    return {
      cacheHitRate:
        (this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses)) * 100,
      averageGenerationTime: avgTime,
      totalRequests: this.metrics.cacheHits + this.metrics.cacheMisses,
      cacheSize: this.templateCache.size,
    };
  }

  // Pré-chauffage du cache avec les templates les plus fréquents
  warmUpCache() {
    const frequentComponents = [
      { component_type: 'button', framework: 'react' },
      { component_type: 'button', framework: 'vue' },
      { component_type: 'button', framework: 'angular' },
      { component_type: 'form', framework: 'react' },
      { component_type: 'card', framework: 'react' },
    ];

    // Pré-chauffage du cache - log supprimé pour compatibilité MCP

    frequentComponents.forEach(({ component_type, framework }) => {
      const precompiled = this.getPrecompiledTemplate(component_type, framework, {});
      if (precompiled) {
        const cacheKey = this.generateCacheKey(component_type, framework, {});
        this.templateCache.set(cacheKey, precompiled);
      }
    });

    // Cache pré-chargé - log supprimé pour compatibilité MCP
  }

  // Méthode pour vider le cache si nécessaire
  clearCache() {
    this.templateCache.clear();
    this.metrics = {
      cacheHits: 0,
      cacheMisses: 0,
      generationTime: [],
    };
    // Cache vidé - log supprimé pour compatibilité MCP
  }
}

module.exports = OptimizedGeneratorService;
