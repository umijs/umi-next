import defu from '@umijs/utils/compiled/defu';
import { type UserConfig } from 'vitest/config';

const configDefaults: UserConfig = {
  test: {
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
    ],
  },
};

export function createVitestConfig(userConfig: UserConfig = {}): UserConfig {
  const config: UserConfig = {
    test: {
      globals: true,
      // Default include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}']
      exclude: ['./packages/*/compiled/**', './packages/*/fixtures/**'],
      root: process.cwd(),
      testTimeout: (process.env.CI ? 50 : 20) * 1e3,
      setupFiles: [
        require.resolve('../setupFiles/shim'),
        require.resolve('../setupFiles/vitest-compatible-jest'),
        require.resolve('../setupFiles/vitest-transform-ts'),
      ],
    },
    esbuild: {
      target: 'node14',
      format: 'cjs',
    },
  };

  return defu(configDefaults, config, userConfig);
}
