import rules, { typescript as tsRules } from './rules/fabric';

module.exports = {
  extends: ['prettier', 'plugin:react/recommended'],
  parser: '@babel/eslint-parser',
  plugins: ['react', 'react-hooks'],
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
      rules: tsRules,
      extends: ['prettier', 'plugin:@typescript-eslint/recommended'],
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
      plugins: [
        ['@babel/plugin-proposal-decorators', { legacy: true }],
        ['@babel/plugin-proposal-class-properties', { loose: true }],
      ],
    },
    requireConfigFile: false,
    project: './tsconfig.json',
  },
};
