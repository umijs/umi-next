import { createJestConfig } from '@umijs/test';

const config = createJestConfig(
  {
    testMatch: ['**/packages/*/src/**/*.test.ts'],
    testTimeout: 30000,
    modulePathIgnorePatterns: [
      '<rootDir>/packages/.+/compiled',
      '<rootDir>/packages/.+/fixtures',
    ],
  },
  { useEsbuild: true },
);
export default config;
