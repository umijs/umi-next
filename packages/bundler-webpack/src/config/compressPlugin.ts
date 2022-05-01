import type { CommonOptions as EsbuildOpts } from '@umijs/bundler-utils/compiled/esbuild';
// @ts-ignore
import CSSMinimizerWebpackPlugin from '@umijs/bundler-webpack/compiled/css-minimizer-webpack-plugin';
import type { TerserOptions } from '../../compiled/terser-webpack-plugin';
import TerserPlugin from '../../compiled/terser-webpack-plugin';
import Config from '../../compiled/webpack-5-chain';
import ESBuildCSSMinifyPlugin from '../plugins/ESBuildCSSMinifyPlugin';
import { ParcelCSSMinifyPlugin } from '../plugins/ParcelCSSMinifyPlugin';
import { CSSMinifier, Env, IConfig, JSMinifier } from '../types';
import { getEsBuildTarget } from '../utils/getEsBuildTarget';

interface IOpts {
  config: Config;
  userConfig: IConfig;
  cwd: string;
  env: Env;
}

export async function addCompressPlugin(opts: IOpts) {
  const { config, userConfig, env } = opts;
  const jsMinifier = userConfig.jsMinifier || JSMinifier.esbuild;
  const cssMinifier = userConfig.cssMinifier || CSSMinifier.esbuild;
  const { dropConsole = false, dropDebugger = true } = userConfig;

  if (
    env === Env.development ||
    process.env.COMPRESS === 'none' ||
    (jsMinifier === JSMinifier.none && cssMinifier === CSSMinifier.none)
  ) {
    config.optimization.minimize(false);
    return;
  }
  config.optimization.minimize(true);

  let minify: any;
  let terserOptions: IConfig['jsMinifierOptions'];

  const compress: TerserOptions['compress'] = {
    drop_console: dropConsole,
    drop_debugger: dropDebugger,
  };

  if (jsMinifier === JSMinifier.esbuild) {
    minify = TerserPlugin.esbuildMinify;
    const drop: EsbuildOpts['drop'] = [];
    if (dropConsole) {
      drop.push('console');
    }
    if (dropDebugger) {
      drop.push('debugger');
    }
    terserOptions = {
      target: getEsBuildTarget({
        targets: userConfig.targets || {},
      }),
      drop: drop,
    } as EsbuildOpts;
  } else if (jsMinifier === JSMinifier.terser) {
    minify = TerserPlugin.terserMinify;
    terserOptions = {
      compress,
    };
  } else if (jsMinifier === JSMinifier.swc) {
    minify = TerserPlugin.swcMinify;
    terserOptions = {
      compress,
    };
  } else if (jsMinifier === JSMinifier.uglifyJs) {
    minify = TerserPlugin.uglifyJsMinify;
    terserOptions = {
      compress,
    };
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
