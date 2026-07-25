import globals from 'globals';
import prettier from 'eslint-config-prettier';
import js from '@eslint/js';
import tselint from 'typescript-eslint';
import type { Linter } from 'eslint';

const config: Linter.Config[] = [
  js.configs.recommended,
  ...tselint.configs.recommended,
  {
    files: ['./src/**/*.{ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
  prettier,
];
export default config;
