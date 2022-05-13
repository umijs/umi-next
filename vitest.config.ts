import { createVitestConfig } from 'umi/test';
import type { UserConfig } from 'vitest/config';

export default createVitestConfig()({
  test: {
    include: ['./packages/**/*.test.ts'],
  },
}) as UserConfig;
