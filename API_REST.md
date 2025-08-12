# 🌐 API REST DSFR-MCP - Documentation Complète

[![Version](https://img.shields.io/github/v/release/Alexmacapple/DSFR-MCP?label=version)](https://github.com/Alexmacapple/DSFR-MCP/releases)
[![API Status](https://img.shields.io/badge/API-Production%20Ready-brightgreen.svg)](http://localhost:3001/api/health)
[![OpenAPI](https://img.shields.io/badge/OpenAPI-3.0.0-blue.svg)](#openapi-specification)

> **🚀 Accès programmatique aux 16 outils DSFR-MCP** - Intégrez facilement le DSFR dans vos workflows CI/CD et applications.

## 📋 Table des matières

- [🏗️ URL de base et authentification](#️-url-de-base-et-authentification)
- [🔍 Endpoints de recherche](#-endpoints-de-recherche)
- [🛠️ Endpoints de génération](#️-endpoints-de-génération)
- [✅ Endpoints de validation](#-endpoints-de-validation)
- [🎨 Endpoints de personnalisation](#-endpoints-de-personnalisation)
- [📊 Endpoints de monitoring](#-endpoints-de-monitoring)
- [💻 Exemples d'intégration](#-exemples-dintégration)
- [🔧 SDKs et clients](#-sdks-et-clients)

---

## 🏗️ URL de base et authentification

### Base URL
```
http://localhost:3001/api
```

### Headers requis
```http
Content-Type: application/json
Accept: application/json
```

### Authentification
L'API est actuellement **ouverte** en développement. En production, utiliser:
```http
Authorization: Bearer YOUR_API_KEY
```

### Format de réponse standard
```json
{
  "success": true,
  "tool": "nom_de_l_outil",
  "result": { /* données spécifiques à l'outil */ },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "response_time": 85
}
```

---

## 🔍 Endpoints de recherche

### POST /api/tools/search_dsfr_components
Recherche des composants DSFR par nom, catégorie ou mot-clé.

**Paramètres:**
```json
{
  "query": "bouton",
  "category": "actions",
  "limit": 10
}
```

**Réponse:**
```json
{
  "success": true,
  "tool": "search_dsfr_components",
  "result": {
    "query": "bouton",
    "results": [
      {
        "name": "fr-btn",
        "category": "actions",
        "description": "Bouton standard DSFR",
        "classes": ["fr-btn", "fr-btn--primary", "fr-btn--secondary"],
        "example": "<button class=\"fr-btn fr-btn--primary\">Mon bouton</button>"
      }
    ],
    "total": 1,
    "limit": 10
  }
}
```

**Exemple cURL:**
```bash
curl -X POST http://localhost:3001/api/tools/search_dsfr_components \
  -H "Content-Type: application/json" \
  -d '{"query": "bouton", "limit": 5}'
```

### POST /api/tools/get_component_details
Obtient les détails complets d'un composant DSFR spécifique.

**Paramètres:**
```json
{
  "component_name": "fr-btn"
}
```

### POST /api/tools/list_dsfr_categories
Liste toutes les catégories DSFR disponibles.

**Paramètres:**
```json
{}
```

---

## 🛠️ Endpoints de génération

### POST /api/tools/generate_dsfr_component
Génère un composant DSFR complet avec TypeScript et accessibilité.

**Paramètres:**
```json
{
  "component_type": "button",
  "framework": "react",
  "options": {
    "typescript": true,
    "accessibility": true,
    "testing": true
  }
}
```

**Réponse:**
```json
{
  "success": true,
  "tool": "generate_dsfr_component",
  "result": {
    "component_type": "button",
    "framework": "react",
    "code": "import React from 'react';\n\nconst Button = ({ children, variant = 'primary' }) => {\n  return (\n    <button className={`fr-btn fr-btn--${variant}`} type=\"button\">\n      {children}\n    </button>\n  );\n};\n\nexport default Button;",
    "files": ["button.tsx", "button.css", "button.test.js"],
    "features": ["accessibility", "responsive", "typescript-ready"]
  }
}
```

**Exemple cURL:**
```bash
curl -X POST http://localhost:3001/api/tools/generate_dsfr_component \
  -H "Content-Type: application/json" \
  -d '{
    "component_type": "button",
    "framework": "react",
    "options": {"typescript": true}
  }'
```

### POST /api/tools/generate_dsfr_template
Génère un template complet (page, layout, etc.).

**Paramètres:**
```json
{
  "template_name": "landing-page",
  "framework": "vue",
  "customizations": {
    "theme": "dark",
    "layout": "centered"
  }
}
```

---

## ✅ Endpoints de validation

### POST /api/tools/validate_dsfr_html
Valide la conformité de votre code HTML avec les standards DSFR.

**Paramètres:**
```json
{
  "html_code": "<button class=\"fr-btn fr-btn--primary\">Mon bouton</button>",
  "strict_mode": true
}
```

**Réponse:**
```json
{
  "success": true,
  "tool": "validate_dsfr_html",
  "result": {
    "valid": true,
    "score": 95,
    "issues": [
      {
        "type": "warning",
        "message": "Attribut aria-label manquant pour l'accessibilité",
        "line": 1,
        "severity": "medium"
      }
    ],
    "suggestions": [
      "Ajouter des attributs ARIA appropriés",
      "Vérifier la hiérarchie des titres"
    ]
  }
}
```

### POST /api/tools/check_accessibility
Vérifie l'accessibilité RGAA de votre code.

**Paramètres:**
```json
{
  "html_code": "<button>Cliquez ici</button>",
  "rgaa_level": "AA"
}
```

---

## 🎨 Endpoints de personnalisation

### POST /api/tools/create_dsfr_theme
Crée un thème personnalisé avec palette couleurs et variables SCSS.

**Paramètres:**
```json
{
  "theme_name": "mon-theme",
  "primary_color": "#1e3a8a",
  "secondary_color": "#0f766e",
  "custom_variables": {
    "border-radius": "8px",
    "font-size-base": "16px"
  }
}
```

**Réponse:**
```json
{
  "success": true,
  "tool": "create_dsfr_theme",
  "result": {
    "theme_name": "mon-theme",
    "primary_color": "#1e3a8a",
    "generated_colors": {
      "primary": "#1e3a8a",
      "primary-hover": "#1e40af",
      "primary-active": "#1e3a8a"
    },
    "css_file": ":root {\n  --color-primary: #1e3a8a;\n  --color-primary-hover: #1e40af;\n}",
    "scss_file": "$primary: #1e3a8a;\n@import 'dsfr/mixins';"
  }
}
```

### POST /api/tools/get_dsfr_colors
Récupère la palette de couleurs DSFR avec utilitaires CSS.

### POST /api/tools/get_dsfr_icons
Liste les icônes DSFR avec prévisualisations.

---

## 📊 Endpoints de monitoring

### GET /api/health
Status de santé de l'API et des services.

**Réponse:**
```json
{
  "status": "healthy",
  "uptime": "2h 15m 30s",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "services": {
    "mcp_server": "healthy",
    "cache": "healthy",
    "memory": "healthy"
  }
}
```

### GET /api/metrics
Métriques détaillées de performance et utilisation.

**Réponse:**
```json
{
  "overview": {
    "uptime": "2h 15m 30s",
    "status": "healthy",
    "requestsTotal": 1247,
    "requestsPerMinute": 5.2,
    "successRate": "98.1",
    "avgResponseTime": 89
  },
  "tools": {
    "search_dsfr_components": {
      "usage": 456,
      "avgResponseTime": 67,
      "errorRate": 0,
      "status": "healthy"
    }
  }
}
```

---

## 💻 Exemples d'intégration

### 🟢 Node.js / Express
```javascript
const axios = require('axios');

class DSFRClient {
  constructor(baseURL = 'http://localhost:3001/api') {
    this.baseURL = baseURL;
  }

  async searchComponents(query, options = {}) {
    const response = await axios.post(`${this.baseURL}/tools/search_dsfr_components`, {
      query,
      ...options
    });
    return response.data.result;
  }

  async generateComponent(componentType, framework, options = {}) {
    const response = await axios.post(`${this.baseURL}/tools/generate_dsfr_component`, {
      component_type: componentType,
      framework,
      options
    });
    return response.data.result;
  }

  async validateHTML(htmlCode, strictMode = true) {
    const response = await axios.post(`${this.baseURL}/tools/validate_dsfr_html`, {
      html_code: htmlCode,
      strict_mode: strictMode
    });
    return response.data.result;
  }
}

// Usage
const dsfr = new DSFRClient();

// Recherche
const components = await dsfr.searchComponents('bouton', { limit: 5 });

// Génération
const buttonCode = await dsfr.generateComponent('button', 'react', {
  typescript: true,
  accessibility: true
});

// Validation
const validation = await dsfr.validateHTML('<button class="fr-btn">Test</button>');
console.log(`Score: ${validation.score}/100`);
```

### 🔵 Python / Requests
```python
import requests
import json

class DSFRClient:
    def __init__(self, base_url="http://localhost:3001/api"):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
    
    def search_components(self, query, category=None, limit=10):
        payload = {"query": query, "limit": limit}
        if category:
            payload["category"] = category
            
        response = self.session.post(
            f"{self.base_url}/tools/search_dsfr_components",
            json=payload
        )
        return response.json()["result"]
    
    def generate_component(self, component_type, framework="vanilla", **options):
        payload = {
            "component_type": component_type,
            "framework": framework,
            "options": options
        }
        
        response = self.session.post(
            f"{self.base_url}/tools/generate_dsfr_component",
            json=payload
        )
        return response.json()["result"]

# Usage
dsfr = DSFRClient()

# Recherche de composants
buttons = dsfr.search_components("bouton", limit=3)
for btn in buttons["results"]:
    print(f"- {btn['name']}: {btn['description']}")

# Génération React TypeScript
component = dsfr.generate_component(
    "card",
    framework="react",
    typescript=True,
    accessibility=True
)
print(component["code"])
```

### 🟡 JavaScript / Fetch (Vanilla)
```javascript
class DSFRClient {
  constructor(baseURL = 'http://localhost:3001/api') {
    this.baseURL = baseURL;
  }

  async request(endpoint, data) {
    const response = await fetch(`${this.baseURL}/tools/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    return result.result;
  }

  searchComponents(query, options = {}) {
    return this.request('search_dsfr_components', { query, ...options });
  }

  generateComponent(componentType, framework, options = {}) {
    return this.request('generate_dsfr_component', {
      component_type: componentType,
      framework,
      options
    });
  }

  validateHTML(htmlCode, strictMode = true) {
    return this.request('validate_dsfr_html', {
      html_code: htmlCode,
      strict_mode: strictMode
    });
  }
}

// Usage dans une page web
const dsfr = new DSFRClient();

// Générateur interactif
async function generateButton() {
  const framework = document.getElementById('framework').value;
  const typescript = document.getElementById('typescript').checked;
  
  try {
    const result = await dsfr.generateComponent('button', framework, {
      typescript,
      accessibility: true
    });
    
    document.getElementById('output').textContent = result.code;
  } catch (error) {
    console.error('Erreur:', error);
  }
}
```

---

## 🔧 Workflow CI/CD

### GitHub Actions
```yaml
name: DSFR Validation

on: [push, pull_request]

jobs:
  validate-dsfr:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Start DSFR-MCP Server
        run: |
          docker run -d --name dsfr-mcp -p 3001:3001 dsfr-mcp:latest
          sleep 10
      
      - name: Validate HTML Files
        run: |
          for file in src/**/*.html; do
            echo "Validating $file..."
            curl -X POST http://localhost:3001/api/tools/validate_dsfr_html \
              -H "Content-Type: application/json" \
              -d "$(jq -n --rawfile html "$file" '{"html_code": $html, "strict_mode": true}')" \
              | jq -e '.result.valid'
          done
      
      - name: Check Accessibility
        run: |
          for file in src/**/*.html; do
            echo "Checking accessibility for $file..."
            curl -X POST http://localhost:3001/api/tools/check_accessibility \
              -H "Content-Type: application/json" \
              -d "$(jq -n --rawfile html "$file" '{"html_code": $html, "rgaa_level": "AA"}')" \
              | jq '.result'
          done
```

### Makefile pour développement local
```makefile
DSFR_API = http://localhost:3001/api

.PHONY: validate generate-components clean

validate:
	@echo "🔍 Validation DSFR..."
	@for file in src/*.html; do \
		echo "Validation de $$file..."; \
		curl -s -X POST $(DSFR_API)/tools/validate_dsfr_html \
			-H "Content-Type: application/json" \
			-d "$$(jq -n --rawfile html "$$file" '{"html_code": $$html}')"; \
	done

generate-react-components:
	@echo "🛠️ Génération des composants React..."
	@mkdir -p generated/react
	@for comp in button card form table; do \
		echo "Génération $$comp..."; \
		curl -s -X POST $(DSFR_API)/tools/generate_dsfr_component \
			-H "Content-Type: application/json" \
			-d '{"component_type": "'$$comp'", "framework": "react", "options": {"typescript": true}}' \
			| jq -r '.result.code' > generated/react/$$comp.tsx; \
	done

health-check:
	@curl -s $(DSFR_API)/health | jq '.status'

metrics:
	@curl -s $(DSFR_API)/metrics | jq '.overview'
```

---

## 🧪 Tests et exemples

### Test de l'API avec Jest
```javascript
const axios = require('axios');

describe('DSFR-MCP API', () => {
  const baseURL = 'http://localhost:3001/api';

  test('Health check', async () => {
    const response = await axios.get(`${baseURL}/health`);
    expect(response.data.status).toBe('healthy');
  });

  test('Search components', async () => {
    const response = await axios.post(`${baseURL}/tools/search_dsfr_components`, {
      query: 'bouton',
      limit: 5
    });
    
    expect(response.data.success).toBe(true);
    expect(response.data.result.results).toBeInstanceOf(Array);
    expect(response.data.result.results.length).toBeGreaterThan(0);
  });

  test('Generate React component', async () => {
    const response = await axios.post(`${baseURL}/tools/generate_dsfr_component`, {
      component_type: 'button',
      framework: 'react',
      options: { typescript: true }
    });
    
    expect(response.data.success).toBe(true);
    expect(response.data.result.code).toContain('React');
    expect(response.data.result.code).toContain('fr-btn');
  });

  test('Validate HTML', async () => {
    const response = await axios.post(`${baseURL}/tools/validate_dsfr_html`, {
      html_code: '<button class="fr-btn fr-btn--primary">Test</button>',
      strict_mode: true
    });
    
    expect(response.data.success).toBe(true);
    expect(response.data.result.score).toBeGreaterThan(0);
  });
});
```

---

## 📚 Référence complète

### Status Codes
- `200` - Succès
- `400` - Erreur de paramètres
- `405` - Méthode non autorisée
- `500` - Erreur serveur

### Rate Limiting
- **Développement**: Aucune limite
- **Production**: 1000 requêtes/heure par IP

### Cache
- **TTL**: 5 minutes pour les recherches
- **Headers**: `Cache-Control`, `ETag` supportés

### WebSockets (à venir)
```javascript
const ws = new WebSocket('ws://localhost:3001/ws');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'metrics_update') {
    updateDashboard(data.metrics);
  }
};
```

---

**🎉 API DSFR-MCP prête pour la production !**

🔗 **Liens utiles:**
- 📊 [Dashboard temps réel](http://localhost:3001/dashboard)
- 🎮 [Playground interactif](http://localhost:3001/playground)
- 🧪 [Health check](http://localhost:3001/api/health)
- 📈 [Métriques](http://localhost:3001/api/metrics)

*Fait avec ❤️ pour démocratiser l'accès programmatique au DSFR*