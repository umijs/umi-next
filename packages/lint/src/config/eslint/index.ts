import rules, {
  jest as jestRules,
  typescript as tsRules,
} from './rules/recommended';
import './setup';

module.exports = {
  parser: '@babel/eslint-parser',
  plugins: ['react', 'react-hooks'],
  settings: {
    react: {
      version: 'detect',
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
      settings: {
        jest: {
          version: getJestVersion(),
        },
      },
      files: ['**/*.{test,spec,unit,e2e}.{ts,tsx,js,jsx}'],
      plugins: ['jest'],
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

function getJestVersion() {
  const DEFAULT_JEST_VERSION = 28;
  try {
    const pkg = require.resolve('jest/package.json');
    const version = pkg ? require(pkg).version : DEFAULT_JEST_VERSION;
    return version;
  } catch {
    return DEFAULT_JEST_VERSION;
  }
}
