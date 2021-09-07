import type { Config } from '@jest/types';
import { mergeConfig } from '../utils/mergeConfig/mergeConfig';

export interface UmiTestJestConfig extends Omit<Config.InitialOptions, 'collectCoverageFrom' | 'modulePathIgnorePatterns'> {
  collectCoverageFrom?: Config.InitialOptions['collectCoverageFrom'] | ((memo: Config.InitialOptions['collectCoverageFrom']) => Config.InitialOptions['collectCoverageFrom']);
}

export interface UmiTestJestOptions {
  hasE2e?: boolean;
  isLerna?: boolean;
  useEsbuild?: boolean;
}

export function createJestConfig(config: UmiTestJestConfig, options: UmiTestJestOptions = {}): UmiTestJestConfig {
  const jestDefaults: Config.DefaultOptions = require('jest-config').defaults;
  const { useEsbuild, hasE2e = true, isLerna } = options;
  const testMatchTypes = ['spec', 'test'];
  if (hasE2e) {
    testMatchTypes.push('e2e');
  }
  const testMatchPrefix = isLerna ? `**/packages/**/` : '';
  const umiTestDefaultsConfig: Config.InitialOptions = {
    testEnvironment: require.resolve('jest-environment-jsdom'),
    moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
    collectCoverageFrom: [
      '!**/.umi/**',
      '!**/.umi-production/**',
      '!**/typings/**',
      '!**/types/**',
      '!**/fixtures/**',
      '!**/examples/**',
      '!**/*.d.ts',
    ].filter(Boolean),
    moduleDirectories: ['node_modules'],
    transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$'],
    moduleNameMapper: {
      '\\.(css|less|sass|scss|stylus)$': require.resolve('identity-obj-proxy'),
      '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': require.resolve(
        './helpers/fileMock.js',
      ),
    },
    verbose: true,
    watchPlugins: [
      'jest-watch-typeahead/filename',
      'jest-watch-typeahead/testname',
    ],
    testMatch: [
      `${testMatchPrefix}**/?*.(${testMatchTypes.join('|')}).(j|t)s?(x)`,
    ],
    testPathIgnorePatterns: ['/node_modules/', '/fixtures/'],
    transform: {
      // esbuild-jest 比 ts-jest 快 3 倍左右
      "^.+\\.(js|jsx|ts|tsx)$": useEsbuild ? [
        require.resolve(
          'esbuild-jest',
        ),
        {
          sourcemap: true,
          loaders: {
            '.spec.ts': 'tsx',
            '.test.ts': 'tsx'
          }
        }
      ] : require.resolve(
        'ts-jest',
      ),
    },
    globals: useEsbuild ? {} : {
      'ts-jest': {
        tsconfig: 'tsconfig.json',
      },
    },
    // 用于设置 jest worker 启动的个数
    ...(process.env.MAX_WORKERS
      ? { maxWorkers: Number(process.env.MAX_WORKERS) }
      : {}),
  };

  const jestConfig = mergeConfig<UmiTestJestConfig, Config.InitialOptions>(
    jestDefaults,
    umiTestDefaultsConfig,
    config
  );

  return jestConfig;
}
