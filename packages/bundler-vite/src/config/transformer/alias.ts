import type { IConfigProcessor } from '.';

/**
 * transform umi alias to vite alias
 */

export default (function alias(userConfig) {
  const config: ReturnType<IConfigProcessor> = {
    resolve: {
      alias: [
        // to support less-loader ~ for local deps, refer: https://github.com/vitejs/vite/issues/2185
        { find: /^~/, replacement: '' },
      ],
    },
  };

  if (typeof userConfig.alias === 'object') {
    config.resolve = {
      alias: Object.entries<string>(userConfig.alias).map(([name, target]) => ({
        // supports webpack suffix $ and less-loader prefix ~
        // example:
        //   - dep => ^~?dep(?=\/|$)
        //   - dep$ => ^~?dep$
        find: new RegExp(`^~?${name.replace(/(?<!\$)$/, '(?=/|$)')}`),
        replacement: target,
      })),
    };
  }

  return config;
} as IConfigProcessor);
