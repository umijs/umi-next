import { GeneratorType } from '@umijs/core';
import { IApi } from '../../types';
import { clearTmp } from '../../utils/clearTmp';

export default (api: IApi) => {
  api.registerGenerator({
    key: 'tmp',
    name: 'Init Umi files',
    description: 'Init Umi entry file: .umi/core/',
    type: GeneratorType.generate,
    fn: async (options) => {
      const { api } = options;

      // clear tmp except cache
      clearTmp(api.paths.absTmpPath);

      // check package.json
      await api.applyPlugins({
        key: 'onCheckPkgJSON',
        args: {
          origin: null,
          current: api.appData.pkg,
        },
      });

      // generate files
      async function generate(opts: { isFirstTime?: boolean; files?: any }) {
        await api.applyPlugins({
          key: 'onGenerateFiles',
          args: {
            files: opts.files || null,
            isFirstTime: opts.isFirstTime,
          },
        });
      }
      await generate({
        isFirstTime: true,
      });
    },
  });
};
