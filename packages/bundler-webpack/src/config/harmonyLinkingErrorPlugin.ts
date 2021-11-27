import {
  Compiler,
  NormalModule,
} from '@umijs/bundler-webpack/compiled/webpack';
import Config from '@umijs/bundler-webpack/compiled/webpack-5-chain';

interface IOpts {
  config: Config;
}

class HarmonyLinkingErrorPlugin {
  apply(compiler: Compiler) {
    compiler.hooks.afterCompile.tap(
      'HarmonyLinkingErrorPlugin',
      (compilation) => {
        if (!compilation.warnings.length) {
          return;
        }
        const harmonyLinkingErrors = compilation.warnings.filter((w) => {
          return (
            w.name === 'ModuleDependencyWarning' &&
            !(w.module as NormalModule).resource.includes('node_modules')
          );
        });
        if (!harmonyLinkingErrors.length) {
          return;
        }
        compilation.errors.push(...harmonyLinkingErrors);
      },
    );
  }
}
export async function addHarmonyLinkingErrorPlugin(opts: IOpts) {
  const { config } = opts;
  config.plugin('harmony-linking-error-plugin').use(HarmonyLinkingErrorPlugin);
}
