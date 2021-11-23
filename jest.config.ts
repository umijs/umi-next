import type { Config } from '@jest/types';

export default {
  testMatch: ['**/packages/*/src/**/*.test.ts'],
  transform: {
    // alternatives:
    // 1. @swc-node/jest
    // 2. esbuild-jest need use babel https://github.com/aelbore/esbuild-jest/issues/21
    '^.+\\.ts$': 'ts-jest',
  },
  testTimeout: 30000,
  modulePathIgnorePatterns: [
    '<rootDir>/packages/.+/compiled',
    '<rootDir>/packages/.+/fixtures',
  ],
} as Config.InitialOptions;
