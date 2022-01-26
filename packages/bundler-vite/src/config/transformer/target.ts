import legacyPlugin from '@vitejs/plugin-legacy';
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

  if (userConfig.targets?.ie <= 11) {
    config.plugins?.push(
      legacyPlugin(userConfig.legacy === true ? {} : userConfig.legacy),
    );
  }

  return config;
} as IConfigProcessor);
