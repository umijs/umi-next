// @ts-ignore
import CSSMinimizerWebpackPlugin from '@umijs/bundler-webpack/compiled/css-minimizer-webpack-plugin';
import TerserPlugin from '../../compiled/terser-webpack-plugin';
import Config from '../../compiled/webpack-5-chain';
import ESBuildCSSMinifyPlugin from '../plugins/ESBuildCSSMinifyPlugin';
import { ParcelCSSMinifyPlugin } from '../plugins/ParcelCSSMinifyPlugin';
import { CSSMinifier, DropConsole, Env, IConfig, JSMinifier } from '../types';
import { getEsBuildTarget } from '../utils/getEsBuildTarget';

interface IOpts {
  config: Config;
  userConfig: IConfig;
  cwd: string;
  env: Env;
}
const consoleFnName = Object.getOwnPropertyNames(console).map(
  (name) => `console.${name}`,
);
const consoleDropLevel = {
  [DropConsole.none]: [],
  [DropConsole.info]: consoleFnName.filter(
    (name) => name !== 'console.warn' && name !== 'console.error',
  ),
  [DropConsole.warn]: consoleFnName.filter((name) => name !== 'console.error'),
  [DropConsole.error]: consoleFnName,
};
export async function addCompressPlugin(opts: IOpts) {
  const { config, userConfig, env } = opts;
  const jsMinifier = userConfig.jsMinifier || JSMinifier.esbuild;
  const cssMinifier = userConfig.cssMinifier || CSSMinifier.esbuild;
  const { dropDebugger = true, dropConsole = DropConsole.none } = userConfig;
  if (
    env === Env.development ||
    process.env.COMPRESS === 'none' ||
    (jsMinifier === JSMinifier.none && cssMinifier === CSSMinifier.none)
  ) {
    config.optimization.minimize(false);
    return;
  }
  config.optimization.minimize(true);
  const pure_console = consoleDropLevel[dropConsole] ?? [];
  let minify: any;
  let terserOptions: IConfig['jsMinifierOptions'] = {
    compress: {
      drop_debugger: dropDebugger,
      pure_funcs: [...pure_console],
    },
  };
  if (jsMinifier === JSMinifier.esbuild) {
    minify = TerserPlugin.esbuildMinify;
    terserOptions = {
      target: getEsBuildTarget({
        targets: userConfig.targets || {},
      }),
      drop: dropDebugger ? ['debugger'] : [],
      pure: [...pure_console],
    };
  } else if (jsMinifier === JSMinifier.terser) {
    minify = TerserPlugin.terserMinify;
  } else if (jsMinifier === JSMinifier.swc) {
    minify = TerserPlugin.swcMinify;
    if (dropConsole === DropConsole.info || dropConsole === DropConsole.warn) {
      throw new Error(
        `dropConsole not supported with 1 or 2 when using ${userConfig.jsMinifier}.`,
      );
    }
    terserOptions.compress.drop_console = pure_console.length > 0;
  } else if (jsMinifier === JSMinifier.uglifyJs) {
    minify = TerserPlugin.uglifyJsMinify;
  } else if (jsMinifier !== JSMinifier.none) {
    throw new Error(`Unsupported jsMinifier ${userConfig.jsMinifier}.`);
  }
  terserOptions = {
    ...terserOptions,
    ...userConfig.jsMinifierOptions,
  };
  if (jsMinifier !== JSMinifier.none) {
    config.optimization.minimizer(`js-${jsMinifier}`).use(TerserPlugin, [
      {
        minify,
        terserOptions,
      },
    ] as any);
  }

  if (cssMinifier === CSSMinifier.esbuild) {
    config.optimization
      .minimizer(`css-${cssMinifier}`)
      .use(ESBuildCSSMinifyPlugin, [userConfig.cssMinifierOptions]);
  } else if (cssMinifier === CSSMinifier.cssnano) {
    config.optimization
      .minimizer(`css-${cssMinifier}`)
      .use(CSSMinimizerWebpackPlugin, [
        {
          minimizerOptions: userConfig.cssMinifierOptions,
          parallel: true,
        },
      ]);
  } else if (cssMinifier === CSSMinifier.parcelCSS) {
    config.optimization
      .minimizer(`css-${cssMinifier}`)
      .use(ParcelCSSMinifyPlugin);
  } else if (cssMinifier !== CSSMinifier.none) {
    throw new Error(`Unsupported cssMinifier ${userConfig.cssMinifier}.`);
  }
}
