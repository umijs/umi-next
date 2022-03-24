import rules, { typescript as tsRules } from './rules/recommended';
import { TYPE_AWARE_ENABLE } from './setup';

module.exports = {
  extends: [
    'prettier',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  parser: '@babel/eslint-parser',
  plugins: ['react', 'react-hooks', 'jest'],
  env: {
    browser: true,
    node: true,
    es6: true,
    mocha: true,
    jest: true,
    jasmine: true,
  },
  rules,
  overrides: [
    {
      files: ['**/*.{ts,tsx}'],
      parser: '@typescript-eslint/parser',
      rules: {
        ...tsRules,
        ...(TYPE_AWARE_ENABLE
          ? {
              '@typescript-eslint/dot-notation': 0,
              '@typescript-eslint/no-throw-literal': 0,
              '@typescript-eslint/switch-exhaustiveness-check': 0,
            }
          : {}),
      },
      extends: [
        'prettier',
        'plugin:@typescript-eslint/recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
      ],
    },
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    babelOptions: {
      presets: [
        '@babel/preset-env',
        '@babel/preset-react',
        '@babel/preset-typescript',
      ],
      plugins: [['@babel/plugin-proposal-decorators', { legacy: true }]],
    },
    requireConfigFile: false,
    project: TYPE_AWARE_ENABLE ? './tsconfig.json' : undefined,
  },
};
