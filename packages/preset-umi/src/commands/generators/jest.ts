import { GeneratorType } from '@umijs/core';
import { logger } from '@umijs/utils';
import { existsSync, writeFileSync } from 'fs';
import { join } from 'path';
import { IApi } from '../../types';
import { GeneratorHelper, promptsExitWhenCancel } from './utils';

export default (api: IApi) => {
  api.describe({
    key: 'generator:jest',
  });

  api.registerGenerator({
    key: 'jest',
    name: 'Enable Jest',
    description: 'Setup Jest Configuration',
    type: GeneratorType.enable,
    checkEnable: () => {
      return (
        !existsSync(join(api.paths.cwd, 'jest.config.ts')) &&
        !existsSync(join(api.paths.cwd, 'jest.config.js'))
      );
    },
    fn: async () => {
      const h = new GeneratorHelper(api);

      const res = await promptsExitWhenCancel({
        type: 'confirm',
        name: 'willUseTLR',
        message: 'Will you use @testing-library/react for UI testing?!',
        initial: true,
      });

      const JEST_VERSION = `^28`;
      const basicDeps = {
        jest: JEST_VERSION,
        '@types/jest': '^27',
        // we use `jest.config.ts` so jest needs ts and ts-node
        typescript: '^4',
        'ts-node': '^10',
      };
      const reactTestingDeps = {
        // As of Jest 28 "jest-environment-jsdom" is no longer shipped by default
        // make sure to install it separately.
        'jest-environment-jsdom': JEST_VERSION,
        // RTL
        '@testing-library/jest-dom': '^5',
        '@testing-library/react': '^13',
      };
      const packageToInstall: Record<string, string> = res.willUseTLR
        ? {
            ...basicDeps,
            ...reactTestingDeps,
          }
        : basicDeps;
      h.addDevDeps(packageToInstall);
      h.addScript('test', 'jest');

      writeFileSync(
        join(api.cwd, 'jest.config.ts'),
        `
import { Config, configUmiAlias, createConfig } from 'umi/test';

export default async () => {
  return (await configUmiAlias({
    ...createConfig({
      target: 'browser',
    }),
  })) as Config.InitialOptions;
};
`.trimStart(),
      );
      logger.info('Write jest.config.ts');

      h.installDeps();
    },
  });
};
