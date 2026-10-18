const expoConfig = require('eslint-config-expo/flat');

module.exports = [
  ...expoConfig,
  {
    ignores: ['dist/*', 'node_modules/*', '.expo/*'],
  },
  {
    files: ['__tests__/**', 'jest.setup.js'],
    languageOptions: {
      globals: {
        jest: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        afterEach: 'readonly',
        beforeEach: 'readonly',
      },
    },
  },
  {
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-unused-vars': ['warn', { caughtErrors: 'none' }],
      // Falso positivo habitual con Animated: `useRef(new Animated.Value(0)).current`
      'react-hooks/refs': 'off',
    },
  },
];
