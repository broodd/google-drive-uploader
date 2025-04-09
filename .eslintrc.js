module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin', 'perfectionist'],
  extends: [
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  ignorePatterns: ['.eslintrc.js'],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'perfectionist/sort-imports': [
      'warn',
      {
        groups: [
          'builtin',
          'external',
          'nest',
          'internal',
          'common',
          'mainModules',
          'modules',
          'parent',
          'sibling',
        ],
        customGroups: {
          value: {
            nest: '^@nestjs/(.*)$',
            common: '(.*)/common/(.*)',
            mainModules: ['^src/(?!modules/).*'],
            modules: ['^src/modules/(.*)$', '^../../(.*)$'],
          },
        },
        newlinesBetween: 'always',
        type: 'line-length',
        order: 'desc',
      },
    ],
    'perfectionist/sort-named-imports': [
      'warn',
      {
        type: 'line-length',
        order: 'desc',
      },
    ],
    'perfectionist/sort-exports': [
      'warn',
      {
        type: 'line-length',
        order: 'desc',
      },
    ],
  },
};
