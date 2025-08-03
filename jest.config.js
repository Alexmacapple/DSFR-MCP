/** @type {import('jest').Config} */
module.exports = {
  // Environnement de test
  testEnvironment: 'node',
  
  // Dossiers de tests
  testMatch: [
    '**/test/**/*.test.js',
    '**/test/**/*.spec.js'
  ],
  
  // Dossiers à ignorer
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/'
  ],
  
  // Couverture de code
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js', // Point d'entrée MCP
    '!src/templates/**',
    '!**/node_modules/**'
  ],
  
  // Seuils de couverture
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  // Répertoire de couverture
  coverageDirectory: 'coverage',
  
  // Formats de rapport
  coverageReporters: ['text', 'lcov', 'html'],
  
  // Configuration des mocks
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  
  // Timeouts
  testTimeout: 10000,
  
  // Variables d'environnement pour les tests
  testEnvironmentOptions: {
    NODE_ENV: 'test'
  },
  
  // Pas de transform nécessaire pour Node.js moderne
  transform: {},
  
  // Setup des tests
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
  
  // Reporters
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: 'test-results',
      outputName: 'junit.xml'
    }]
  ],
  
  // Options supplémentaires
  verbose: true,
  bail: 0,
  errorOnDeprecated: true
};
