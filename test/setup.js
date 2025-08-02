// Configuration globale pour tous les tests

// Augmenter le timeout pour les tests d'intégration
jest.setTimeout(10000);

// Mock des variables d'environnement
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error'; // Réduire les logs pendant les tests

// Configuration globale des mocks
global.console = {
  ...console,
  // Désactiver les logs pendant les tests sauf erreurs
  log: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: console.error,
};

// Helpers globaux pour les tests
global.testHelpers = {
  // Créer un mock de fichier markdown
  createMockMarkdownFile: (title, content) => {
    return `URL:\nhttps://example.com\nTitle:\n${title}\nMarkdown:\n${content}`;
  },
  
  // Créer un mock de composant DSFR
  createMockComponent: (name, category = 'component') => {
    return {
      id: name,
      filename: `${name}.md`,
      title: `${name} - Système de design`,
      category,
      content: `# ${name}\nDescription du composant ${name}`,
      tags: [name],
      codeExamples: []
    };
  },
  
  // Attendre un certain temps (utile pour les tests async)
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms))
};

// Nettoyer après chaque test
afterEach(() => {
  jest.clearAllMocks();
});
