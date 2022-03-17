import { GeneratorType } from '@umijs/core';
import { logger, prompts } from '@umijs/utils';
import { existsSync, writeFileSync } from 'fs';
import { join } from 'path';
import { IApi } from '../../types';
import { GeneratorHelper } from './utils';

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

      const res = await prompts({
        type: 'confirm',
        name: 'willUseTLR',
        message: 'Will you use @testing-library/react for UI testing?!',
        initial: true,
      });

      const packageToInstall: Record<string, string> = res.willUseTLR
        ? {
            jest: '^27',
            '@types/jest': '^27',
            'ts-node': '^10',
            '@testing-library/react': '^12',
          }
        : {
            jest: '^27',
            '@types/jest': '^27',
            'ts-node': '^10',
          };

      h.addDevDeps(packageToInstall);

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
`.trimLeft(),
      );
      logger.info('Write jest.config.ts');

      h.installDeps();
    },
  });
};
