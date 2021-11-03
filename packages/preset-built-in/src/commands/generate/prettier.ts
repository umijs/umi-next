import { GeneratorType } from '@umijs/core';
import { existsSync } from 'fs';
import { join } from 'path';
import { IApi } from '../../types';

export default (api: IApi) => {
  api.registerGenerator({
    key: 'prettier',
    name: 'Enable Prettier',
    description: 'Enable Prettier in the umi project',
    type: GeneratorType.enable,
    checkEnable: (opts) => {
      const { api } = opts;
      // 存在 .prettierrc，不开启
      if (existsSync(join(api.paths.cwd, '.prettierrc'))) {
        return false;
      }
      return true;
    },
    fn: async (options) => {
      console.log(options);
    },
  });
};
