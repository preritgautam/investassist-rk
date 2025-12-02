module.exports = {
  'env': {
    'browser': true,
    'es6': true,
  },
  'extends': [
    'plugin:react/recommended',
    'google',
  ],
  'settings': {
    'react': {
      'version': 'detect',
    },
  },
  'globals': {
    'Atomics': 'readonly',
    'SharedArrayBuffer': 'readonly',
  },
  'parser': '@typescript-eslint/parser',
  'parserOptions': {
    'ecmaFeatures': {
      'jsx': true,
    },
    'ecmaVersion': 11,
    'sourceType': 'module',
  },
  'plugins': [
    'react',
    'react-hooks',
    '@typescript-eslint',
  ],
  'rules': {
    'object-curly-spacing': ['error', 'always'],
    'require-jsdoc': 'off',
    'max-len': ['error', { 'code': 120 }],
    'indent': ['error', 2, {
      'SwitchCase': 1,
      'ignoredNodes': [
        'TemplateLiteral',
      ],
    }],
    'no-invalid-this': 'off',
    'react-hooks/rules-of-hooks': 'error', // Checks rules of Hooks
    'react-hooks/exhaustive-deps': 'error', // Checks effect dependencies
  },
};
