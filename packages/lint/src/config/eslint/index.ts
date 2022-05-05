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
  try {
    const pkg = require.resolve('jest/package.json');
    return require(pkg).version;
  } catch {
    return 28;
  }
}
