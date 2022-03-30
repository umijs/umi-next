import { join, resolve } from 'path';
import { IApi } from '../../types';

/** esbuild plugin for ignore @fs prefix */
export function esbuildIgnorePathPrefixPlugin() {
  return {
    name: 'ignore-path-prefix',
    setup(build: any) {
      build.onResolve({ filter: /^@fs/ }, (args: any) => ({
        path: args.path.replace(/^@fs/, ''),
      }));
    },
  };
}

/** esbuild plugin for resolving umi imports */
export function esbuildUmiPlugin(api: IApi) {
  return {
    name: 'umi',
    setup(build: any) {
      build.onResolve({ filter: /^react-router$/ }, () => ({
        path: resolve(require.resolve('react-router'), ''),
      }));
      build.onResolve({ filter: /^umi$/ }, () => ({
        path: join(api.paths.absTmpPath, 'exports.ts'),
      }));
    },
  };
}
