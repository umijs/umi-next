import { Config, createConfig } from 'umi/test';
import { join } from 'path';

const IGNORE_PATTERN_DIRS = ['compiled', 'fixtures', 'bundles'];
export const createJestConfig = (opts: { ci?: boolean } = {}) => {
  const isCI = opts.ci;
  // In CI:    running on `${root}` -> parallel by shard
  // In Local: running on `${root}/packages/${package}` -> parallel by package
  const rootDir = isCI ? __dirname : process.cwd();
  const createIgnorePattern = (dir: string) => {
    return isCI ? `<rootDir>/packages/.+/${dir}` : `<rootDir>/${dir}`;
  };
  const modulePathIgnorePatterns = IGNORE_PATTERN_DIRS.map(createIgnorePattern);
  const testMatch = isCI
    ? ['**/packages/*/src/**/*.test.ts']
    : ['<rootDir>/src/**/*.test.ts'];

  const config: Config.InitialOptions = {
    ...createConfig(),
    rootDir,
    testMatch,
    modulePathIgnorePatterns,
    cacheDirectory: join(__dirname, '.jest-cache'),
  };

  return config;
};

export default createJestConfig();
