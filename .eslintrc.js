module.exports = {
  env: {
    node: true,
    es2022: true,
    jest: true,
  },
  extends: [
    'eslint:recommended',
    'prettier'
  ],
  plugins: ['prettier'],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'commonjs',
  },
  rules: {
    'prettier/prettier': 'warn',
    'no-unused-vars': ['warn', { 
      "argsIgnorePattern": "^_",
      "varsIgnorePattern": "^_"
    }],
    'no-console': 'off',
    'prefer-const': 'error',
    'no-var': 'error',
  },
  ignorePatterns: [
    'node_modules/',
    'data/',
    'test-results/',
    'coverage/',
    '*.json'
  ]
};