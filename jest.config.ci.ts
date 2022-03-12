import type { Config } from 'umi/test';
import { createJestConfig } from './jest.config';

export default createJestConfig({ ci: true }) as Config.InitialOptions;
