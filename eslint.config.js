import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // Generated / vendored output — never lint these.
  globalIgnores(['dist', '.vite', 'node_modules']),

  // Application source (browser runtime).
  {
    files: ['src/**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      // Underscore-prefixed identifiers are intentional throwaways
      // (e.g. `catch (_error)`, unused caught bindings).
      'no-unused-vars': [
        'error',
        { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      // Behavior-sensitive hook rules: kept visible as warnings, not errors.
      // Auto-"fixing" these (esp. exhaustive-deps) can introduce infinite
      // loops or stale state — each is addressed during component refactors.
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/purity': 'warn',
    },
  },

  // Build tooling / ESM Node scripts.
  {
    files: ['*.config.js', 'scripts/**/*.js'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.node },
    },
  },

  // Legacy CommonJS Node scripts.
  {
    files: ['updater.js', 'updater2.js'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: { ...globals.node },
    },
  },
])
