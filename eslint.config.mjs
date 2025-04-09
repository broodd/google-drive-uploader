import perfectionist from 'eslint-plugin-perfectionist';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: ['**/dist/**', '**/node_modules/**'],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
      },
      globals: {
        jest: true,
        node: true,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      perfectionist,
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
  },
];
