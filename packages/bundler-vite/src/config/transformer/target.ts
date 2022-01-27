import type { Options } from '@vitejs/plugin-legacy';
import legacyPlugin from '@vitejs/plugin-legacy';
import type { IConfigProcessor } from '.';
import { getBrowserlist } from './css';

/**
 * transform umi targets to vite build.target
 */
export default (function target(userConfig) {
  const config: ReturnType<IConfigProcessor> = { build: {}, plugins: [] };

  // convert { ie: 11 } to ['ie11']
  if (typeof userConfig.targets === 'object') {
    config.build!.target = Object.entries(userConfig.targets).map(
      ([name, ver]) => `${name}${ver}`,
    );
  }
  const LEGACY_BROWSERS: Record<string, number> = {
    ie: 12,
    edge: 16,
    firefox: 60,
    chrome: 61,
    safari: 11,
    opera: 48,
    ios: 11,
  };

  // targets: {} > false
  // targets: { edge: 11 } > true
  // targets: { edge: 20 } > false
  // refer: https://caniuse.com/?search=esm
  function isLegacyBrowser(targets: Record<string, number>) {
    for (const browserName of Object.keys(targets)) {
      const version = targets[browserName];
      if (
        version &&
        LEGACY_BROWSERS[browserName] &&
        version < LEGACY_BROWSERS[browserName]
      ) {
        return true;
      }
    }
    return false;
  }
  if (isLegacyBrowser(userConfig.targets)) {
    const legacyOpts: Options = {
      targets: getBrowserlist(userConfig.targets),
    };
    if (userConfig.targets.ie && userConfig.targets.ie <= 11) {
      legacyOpts.polyfills = ['regenerator-runtime/runtime'];
    }
    config.plugins!.push(legacyPlugin(legacyOpts));
  }
  return config;
} as IConfigProcessor);
