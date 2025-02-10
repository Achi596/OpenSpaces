import globals from 'globals';
import pluginJs from '@eslint/js';
import pluginReactConfig from 'eslint-plugin-react/configs/recommended.js';
import { fixupConfigRules } from '@eslint/compat';

export default [
  { files: ['**/*.{js,jsx}'] },
  { ignores: ['**/*.{cjs,mjs}', 'Frontend/build/**'] },
  { settings: { react: { version: "18.3.1" } } },
  { languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } } },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        jest: true,
        it: true,
        afterAll: true,
        describe: true,
        afterEach: true,
        beforeEach: true,
        expect: true,
        info: true,
      },
    },
  },
  pluginJs.configs.recommended,
  ...fixupConfigRules(pluginReactConfig),
  {
    rules: {
      // Code style rules
      'max-len': ['error', { 'code': 80 }], // Maximum line length
      'indent': ['error', 2], // Enforce 2 spaces for indentation
      'quotes': ['error', 'single'], // Enforce single quotes
      'semi': ['error', 'always'], // Enforce semicolons
      'no-trailing-spaces': 'error', // Disallow trailing spaces
      'eol-last': ['error', 'always'], // Enforce newline at the end of files
      'no-multiple-empty-lines': ['error', { 'max': 1 }], // Disallow multiple empty lines

      // Best practices
      'eqeqeq': ['error', 'always'], // Enforce the use of === and !==
      'curly': 'error', // Enforce consistent brace style for all control statements
      "no-console": ["error", { "allow": ["error", "info"] }], // Allow console.error but disallow other console statements
      'no-unused-vars': ['error', { 'args': 'none' }], // Disallow unused variables
      'no-undef': 'error', // Disallow the use of undeclared variables

      // ECMAScript 6
      'prefer-const': 'error', // Prefer const over let for variables that are never reassigned
      'no-var': 'error', // Disallow var, prefer let and const
      'arrow-spacing': ['error', { 'before': true, 'after': true }], // Enforce consistent spacing before and after the arrow in arrow functions
      'no-duplicate-imports': 'error', // Disallow duplicate imports

      // React-specific rules (if using React)
      'react/jsx-uses-react': 'error', // Prevent React to be incorrectly marked as unused
      'react/jsx-uses-vars': 'error', // Prevent variables used in JSX to be incorrectly marked as unused
      'react/react-in-jsx-scope': 'error', // Ensure React is in scope when using JSX
      'react/prop-types': 'off', // Disable prop-types as we might use TypeScript for type checking
    }
  },
];
