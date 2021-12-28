import { createJestConfig } from '@umijs/test';

export default createJestConfig(
  {
    testMatch: ['**/packages/*/src/**/*.test.ts'],
    testTimeout: 30000,
    modulePathIgnorePatterns: [
      '<rootDir>/packages/.+/compiled',
      '<rootDir>/packages/.+/fixtures',
    ],
    transformIgnorePatterns: [
      '<rootDir>/packages/.+/compiled',
      '[/\\\\]node_modules[/\\\\].+\\.(js|jsx|mjs|cjs)$',
      '^.+\\.module\\.(css|sass|scss)$',
    ],
  },
  { useEsbuild: true, hasE2e: false, svgr: false },
);
