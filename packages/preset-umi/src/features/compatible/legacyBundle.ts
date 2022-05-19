import {
  CSSMinifier,
  Env,
  JSMinifier,
  Transpiler,
} from '@umijs/bundler-webpack/dist/types';
import { chalk, lodash } from '@umijs/utils';
import assert from 'assert';
import type { IApi } from '../../types';

interface ILegacyBundleOpts {
  transformAllDeps?: boolean;
}

export default (api: IApi) => {
  api.describe({
    key: 'legacyBundle',
    config: {
      schema(Joi) {
        return Joi.alternatives(
          Joi.boolean(),
          Joi.object({
            transformAllDeps: Joi.boolean(),
          }),
        );
      },
    },
    enableBy: ({ env, userConfig }) => {
      return userConfig.legacyBundle && env === Env.production;
    },
  });

  api.modifyConfig({
    stage: Number.MAX_SAFE_INTEGER,
    fn: (memo) => {
      const { userConfig } = api;
      const { legacyBundle } = userConfig;
      const opts: ILegacyBundleOpts = lodash.isBoolean(legacyBundle)
        ? {}
        : legacyBundle;

      assert(
        !userConfig.srcTranspiler &&
          !userConfig.jsMinifier &&
          !userConfig.cssMinifier,
        `Manual configuration ${['srcTranspiler', 'jsMinifier', 'cssMinifier']
          .map((i) => chalk.yellow(i))
          .join(', ')} is not supported in ${chalk.cyan('legacyBundle')} mode`,
      );

      /**
       * 🟢 babel:    only babel supported transform to es5
       * 🟡 swc:      support es5, but existence of edge case
       * 🔴 esbuild:  not supported es5
       */
      memo.srcTranspiler = Transpiler.babel;

      /**
       * 🟢 terser:   keep ecma target, same behavior as old bundle cli
       * 🟡 uglifyJs: cannot compress some package, may throw error
       * 🟡 swc:      support es5, but existence of edge case, need additional install @swc/core dep
       * 🔴 esbuild:  not supported es5
       */
      memo.jsMinifier = JSMinifier.terser;

      /**
       * 🟢 cssnano:   same behavior as before
       * 🟢 parcelCSS: support low version targets, but need additional install package
       * 🔴 esbuild:   not supported low version browser as targets
       */
      memo.cssMinifier = CSSMinifier.cssnano;

      // specified a old browser target
      memo.targets = {
        ...userConfig.targets,
        ie: 10,
      };

      // extend the range of babel transform as much as possible
      // so the source code will all transform to es5
      if (opts?.transformAllDeps) {
        const cwd = process.cwd();
        memo.extraBabelIncludes = [
          ...(Array.isArray(memo.extraBabelIncludes)
            ? memo.extraBabelIncludes
            : []),
          /node_modules/,
          cwd,
        ].filter(Boolean);
      }

      return memo;
    },
  });

  api.chainWebpack((memo) => {
    if (!api.userConfig.svgr) return;

    // transform svgr outputs to es5
    memo.module
      .rule('svgr')
      .use('babel-loader')
      .loader(require.resolve('@umijs/bundler-webpack/compiled/babel-loader'))
      .options({
        sourceType: 'unambiguous',
        babelrc: false,
        cacheDirectory: false,
        targets: api.config.targets,
        presets: [
          [
            require.resolve('@umijs/babel-preset-umi'),
            {
              presetEnv: {},
              presetReact: {},
              presetTypeScript: {},
            },
          ],
        ],
      })
      .before('svgr-loader')
      .end();

    return memo;
  });
};
