import { Plugin } from '@umijs/bundler-utils/compiled/esbuild';
import { winPath } from '@umijs/utils';

const checkPath = (p: string) => {
  try {
    const existed = require.resolve(p);
    return existed;
  } catch (e) {
    return p;
  }
};
// https://esbuild.github.io/plugins/#resolve-callbacks
export default (options?: Record<string, string>): Plugin => {
  return {
    name: 'alias',
    setup({ onResolve }) {
      if (!options || Object.keys(options).length === 0) {
        return;
      }
      Object.keys(options).forEach((key) => {
        onResolve({ filter: new RegExp(`^${key}`) }, (args) => {
          return {
            path: checkPath(
              winPath(args.path).replace(new RegExp(`^${key}`), options[key]),
            ),
          };
        });
      });
    },
  };
};
