import legacyPlugin from '@vitejs/plugin-legacy';
// @ts-ignore
import polyfill from 'rollup-plugin-polyfill';
import type { IConfigProcessor } from '.';

/**
 * transform umi targets to vite build.target
 */
export default (function target(userConfig) {
  const config: ReturnType<IConfigProcessor> = { build: {} };

  // convert { ie: 11 } to ['ie11']
  if (typeof userConfig.targets === 'object') {
    config.build!.target = Object.entries(userConfig.targets).map(
      ([name, ver]) => `${name}${ver}`,
    );
  }

  // refer: https://caniuse.com/?search=esm
  if (
    userConfig.targets &&
    (userConfig.targets.ie <= 11 ||
      userConfig.targets.edge < 16 ||
      userConfig.targets.firefox < 60 ||
      userConfig.targets.chrome < 61 ||
      userConfig.targets.safari < 11 ||
      userConfig.targets.opera < 48 ||
      userConfig.targets.ios < 11)
  ) {
    if (userConfig.targets.ie <= 11) {
      config.plugins?.push(
        legacyPlugin({
          additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
        }),
      );
    }
    config.plugins?.push(legacyPlugin({}), polyfill({}));
  }

  return config;
} as IConfigProcessor);
