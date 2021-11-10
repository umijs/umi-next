import { Plugin } from '@umijs/bundler-utils/compiled/esbuild';
import { winPath } from '@umijs/utils';
import assert from 'assert';
import enhancedResolve from 'enhanced-resolve';
import { dirname } from 'path';

const getRealFile = async (cwd: string, file: string) => {
  try {
    return await resolve(cwd, file);
  } catch (e) {
    console.error(e);
    return null;
  }
};
const resolver = enhancedResolve.create({
  mainFields: ['module', 'browser', 'main'],
  extensions: [
    '.json',
    '.js',
    '.jsx',
    '.ts',
    '.tsx',
    '.cjs',
    '.mjs',
    '.cjsx',
    '.mjsx',
  ],
  // TODO: support exports
  // tried to add exports, but it don't work with swr
  exportsFields: [],
});

async function resolve(context: string, path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    resolver(context, path, (err: Error, result: string) =>
      err ? reject(err) : resolve(result),
    );
  });
}

// https://esbuild.github.io/plugins/#resolve-callbacks
export default (options?: Record<string, string>): Plugin => {
  return {
    name: 'alias',
    setup({ onResolve }) {
      if (!options || Object.keys(options).length === 0) {
        return;
      }
      Object.keys(options).forEach((key) => {
        onResolve({ filter: new RegExp(`^${key}`) }, async (args) => {
          const dir = dirname(args.path);
          try {
            console.log(options.cwd);
            console.log(args.path);
            const realFile = await getRealFile(
              options.cwd,
              winPath(args.path).replace(new RegExp(`^${key}`), options[key]),
            );
            console.log(realFile);

            assert(realFile, `filePath not found of ${args.path}`);
            return {
              path: realFile,
            };
          } catch (error: any) {
            console.log('errror');
            console.log(args.path);

            return {
              errors: [
                {
                  text: error.message,
                },
              ],
              resolveDir: dir,
            };
          }
        });
      });
    },
  };
};
