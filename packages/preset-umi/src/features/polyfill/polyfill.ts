import { transform } from '@umijs/bundler-utils/compiled/babel/core';
import { Transpiler } from '@umijs/bundler-webpack/dist/types';
import { dirname } from 'path';
import { IApi } from '../../types';

export default (api: IApi) => {
  api.describe({
    key: 'polyfill',
    config: {
      schema(Joi) {
        return Joi.object().keys({
          imports: Joi.array().items(Joi.string()).required().unique(),
        });
      },
    },
    enableBy: ({ userConfig }) => {
      if (userConfig.srcTranspiler === Transpiler.swc) {
        return false;
      }
      return process.env.BABEL_POLYFILL !== 'none';
    },
  });

  api.onGenerateFiles(() => {
    const coreJsImports = api.config.polyfill?.imports
      ? api.config.polyfill?.imports
          .map((item: string) => `import '${item}';`)
          .join('\n')
      : `import 'core-js';`;
    const { code } = transform(
      `
${coreJsImports}
import '${require.resolve('regenerator-runtime/runtime')}';
export {};
`,
      {
        filename: 'polyfill.ts',
        presets: [
          [
            require.resolve('@umijs/bundler-utils/compiled/babel/preset-env'),
            {
              useBuiltIns: 'entry',
              corejs: '3',
              modules: false,
              targets: api.config.targets,
            },
          ],
        ],
        plugins: [
          require.resolve('@umijs/babel-preset-umi/dist/plugins/lockCoreJS'),
        ],
      },
    )!;
    api.writeTmpFile({
      path: 'core/polyfill.ts',
      noPluginDir: true,
      content: code!,
    });
  });

  api.addPolyfillImports(() => [{ source: `./core/polyfill` }]);

  api.modifyConfig((memo) => {
    memo.alias['regenerator-runtime'] = dirname(
      require.resolve('regenerator-runtime/package'),
    );
    return memo;
  });
};
