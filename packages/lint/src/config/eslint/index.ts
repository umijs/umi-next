import rules, {
  jest as jestRules,
  typescript as tsRules,
} from './rules/recommended';
import './setup';

module.exports = {
  parser: '@babel/eslint-parser',
  plugins: ['react', 'react-hooks', 'jest'],
  settings: {
    react: {
      version: 'detect',
    },
    jest: {
      version: 26,
    },
  },
  env: {
    browser: true,
    node: true,
    es2022: true,
    jest: true,
  },
  rules,
  overrides: [
    {
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint/eslint-plugin'],
      files: ['**/*.{ts,tsx}'],
      rules: tsRules,
    },
    {
      files: ['*.test.ts'],
      plugins: ['eslint-plugin-jest'],
      rules: jestRules,
    },
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    babelOptions: {
      presets: [require.resolve('@umijs/babel-preset-umi')],
    },
    requireConfigFile: false,
  },
};
