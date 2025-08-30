module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'tailwindcss', 'unused-imports'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:tailwindcss/recommended',
    'prettier'
  ],
  rules: {
    // Prevent unused imports
    'unused-imports/no-unused-imports': 'error',

    // Prevent direct import of react-i18next
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: 'react-i18next',
            message:
              'Use custom translation store: import { useTranslation } from "../lib/stores/translationStore"',
          },
        ],
      },
    ],

    // Disallow hardcoded strings in JSX
    'react/jsx-no-literals': [
      'error',
      {
        noStrings: true,
        allowedStrings: [''],
        ignoreProps: true,
      },
    ],

    // Enforce component-based structure (custom rule suggestion)
    'max-lines-per-function': ['error', { max: 600, skipComments: true }],

    // Tailwind-specific
    'tailwindcss/no-custom-classname': 'off', // Allow custom names if needed
  },
  overrides: [
    {
      files: ['**/*.tsx'],
      rules: {
        // Only apply literal restriction to JSX files
        'react/jsx-no-literals': [
          'error',
          {
            noStrings: true,
            ignoreProps: true,
          },
        ],
      },
    },
  ],
  settings: {
    react: {
      version: 'detect',
    },
  },
};
