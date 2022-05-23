import { Config, createConfig } from 'umi/test';

export default {
  ...createConfig(),
  testMatch: ['**/packages/*/src/**/*.test.ts'],
  modulePathIgnorePatterns: [
    '<rootDir>/packages/.+/compiled',
    '<rootDir>/packages/.+/fixtures',
  ],

  transformIgnorePatterns: [
    // default values
    '/node_modules/',
    '\\.pnp\\.[^\\/]+$',

    // for umi-next self
    '/compiled/',
  ],
} as Config.InitialOptions;
