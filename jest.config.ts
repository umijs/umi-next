import { Config, createConfig } from 'umi/test';
import { join } from 'path';

const cwd = process.cwd();

export default {
  ...createConfig(),
  rootDir: cwd,
  testMatch: ['<rootDir>/src/**/*.test.ts'],
  modulePathIgnorePatterns: [
    '<rootDir>/compiled',
    '<rootDir>/fixtures',
    '<rootDir>/bundles',
  ],
  cacheDirectory: join(__dirname, '.jest-cache'),
} as Config.InitialOptions;
