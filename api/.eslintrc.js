module.exports = {
  'env': {
    'browser': true,
    'es6': true,
  },
  'extends': [
    'google',
  ],
  'globals': {
    'Atomics': 'readonly',
    'SharedArrayBuffer': 'readonly',
  },
  'parser': '@typescript-eslint/parser',
  'parserOptions': {
    'ecmaVersion': 11,
    'sourceType': 'module',
  },
  'plugins': [
    '@typescript-eslint',
    'babel',
  ],
  'rules': {
    'object-curly-spacing': ['error', 'always'],
    'require-jsdoc': 'off',
    'max-len': ['error', { 'code': 120 }],
    'indent': ['error', 2, { SwitchCase: 1 }],
    'no-invalid-this': 0,
    'babel/no-invalid-this': 1,
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error', {
      'vars': 'all',
      'args': 'after-used',
      'ignoreRestSiblings': false,
    }],
    'new-cap': [
      'error',
      {
        'capIsNewExceptions':
          ['Entity', 'PrimaryGeneratedColumn', 'Column', 'OneToMany', 'ManyToOne', 'OneToOne', 'Unique',
            'CreateDateColumn', 'UpdateDateColumn', 'RelationId', 'JoinColumn'],
      },
    ],
  },
};
