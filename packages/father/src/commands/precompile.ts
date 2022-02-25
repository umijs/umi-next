import { chalk, logger } from '@umijs/utils';
import ncc from '@vercel/ncc';
import { Package } from 'dts-packer';
import {
  copyFileSync,
  copySync,
  ensureDirSync,
  existsSync,
  readdirSync,
  readFileSync,
  readJSONSync,
  removeSync,
  statSync,
  writeFileSync,
  writeJSONSync,
} from 'fs-extra';
import { basename, dirname, join } from 'path';
import resolve from 'resolve';
import { IApi } from '../types';

interface IOpts {
  base: string;
  pkgName?: string;
  file?: string;
  target: string;
  webpackExternals: Record<string, string>;
  dtsExternals: string[];
  minify: boolean;
  dtsOnly: boolean;
  noDts: boolean;
  isDependency: boolean;
  clean: boolean;
}

export default (api: IApi) => {
  api.registerCommand({
    name: 'precompile',
    description: 'precompile',
    fn({ args }) {
      logger.info(`precompile`, args);

      const base = process.cwd();
      const pkg = readJSONSync(join(base, 'package.json'));
      const pkgDeps = pkg.dependencies || {};
      const { deps = {} } = args;

      const {
        pkgs = [],
        externals = {},
        declaration: {
          excludeDtsDeps = [],
          extraDtsDeps = [],
          extraDtsExternals = [],
        } = {},
        noMinify = [],
        clean,
      } = deps;

      const webpackExternals: Record<string, string> = {};
      const dtsExternals = [...extraDtsDeps, ...extraDtsExternals];
      Object.keys(externals).forEach((name) => {
        const val = externals[name];
        if (val === '$$LOCAL') {
          dtsExternals.push(name);
          webpackExternals[name] = `${pkg.name}/compiled/${name}`;
        } else {
          webpackExternals[name] = val;
        }
      });
      pkgs.forEach((dep: string) => {
        const isDep = dep.charAt(0) !== '.';
        buildDep({
          ...(isDep ? { pkgName: dep } : { file: dep }),
          target: `compiled/${isDep ? dep : basename(dirname(dep))}`,
          base,
          webpackExternals,
          dtsExternals,
          clean,
          minify: !noMinify.includes(dep),
          dtsOnly: extraDtsDeps.includes(dep),
          noDts: excludeDtsDeps.includes(dep),
          isDependency: dep in pkgDeps,
        });
      });

      async function buildDep(opts: IOpts) {
        const nodeModulesPath = join(opts.base, 'node_modules');
        const target = join(opts.base, opts.target);

        if (opts.clean) {
          removeSync(target);
        }

        let entry;
        if (opts.pkgName) {
          let resolvePath = opts.pkgName;
          // mini-css-extract-plugin 用 dist/cjs 为入口会有问题
          if (opts.pkgName === 'mini-css-extract-plugin') {
            resolvePath = 'mini-css-extract-plugin/dist/index';
          }
          entry = require.resolve(resolvePath, {
            paths: [nodeModulesPath],
          });
        } else {
          entry = join(opts.base);
        }
        if (!opts.dtsOnly) {
          if (opts.isDependency) {
            ensureDirSync(target);
            writeFileSync(
              join(target, 'index.js'),
              `
      const exported = require("${opts.pkgName}");
      Object.keys(exported).forEach(function (key) {
        if (key === "default" || key === "__esModule") return;
        if (key in exports && exports[key] === exported[key]) return;
        Object.defineProperty(exports, key, {
          enumerable: true,
          get: function get() {
            return exported[key];
          }
        });
      });
            `.trim() + '\n',
              'utf-8',
            );
          } else {
            const filesToCopy: string[] = [];
            const res = await ncc(entry, {
              externals: opts.webpackExternals,
              minify: !!opts.minify,
              target: 'es5',
              assetBuilds: false,
              customEmit(filePath: string, { id }: any) {
                if (
                  (opts.file === './bundles/webpack/bundle' &&
                    filePath.endsWith('.runtime.js')) ||
                  (opts.pkgName === 'terser-webpack-plugin' &&
                    filePath.endsWith('./utils') &&
                    id.endsWith('terser-webpack-plugin/dist/index.js')) ||
                  (opts.pkgName === 'css-minimizer-webpack-plugin' &&
                    filePath.endsWith('./utils') &&
                    id.endsWith('css-minimizer-webpack-plugin/dist/index.js'))
                ) {
                  filesToCopy.push(
                    resolve.sync(filePath, {
                      basedir: dirname(id),
                    }),
                  );
                  return `'./${basename(filePath)}'`;
                }
              },
            });

            const { code, assets } = res;
            // assets
            for (const key of Object.keys(assets)) {
              const asset = assets[key];
              const data = asset.source;
              const filePath = join(target, key);
              ensureDirSync(dirname(filePath));
              writeFileSync(join(target, key), data);
            }

            // filesToCopy
            for (const fileToCopy of filesToCopy) {
              let content = readFileSync(fileToCopy, 'utf-8');
              for (const key of Object.keys(opts.webpackExternals)) {
                content = content.replace(
                  new RegExp(`require\\\(['"]${key}['"]\\\)`, 'gm'),
                  `require('${opts.webpackExternals[key]}')`,
                );
                content = content.replace(
                  new RegExp(
                    `require\\\(['"]${key}/package(\.json)?['"]\\\)`,
                    'gm',
                  ),
                  `require('${opts.webpackExternals[key]}/package.json')`,
                );
              }
              writeFileSync(
                join(target, basename(fileToCopy)),
                content,
                'utf-8',
              );
            }

            // entry code
            ensureDirSync(target);
            writeFileSync(join(target, 'index.js'), code, 'utf-8');

            // patch
            if (opts.pkgName === 'mini-css-extract-plugin') {
              copySync(
                join(nodeModulesPath, opts.pkgName, 'dist', 'hmr'),
                join(target, 'hmr'),
              );
              copyFileSync(
                join(nodeModulesPath, opts.pkgName, 'dist', 'utils.js'),
                join(target, 'utils.js'),
              );
              copyFileSync(
                join(
                  nodeModulesPath,
                  opts.pkgName,
                  'dist',
                  'loader-options.json',
                ),
                join(target, 'loader-options.json'),
              );
            }
            if (opts.pkgName === 'fork-ts-checker-webpack-plugin') {
              removeSync(join(target, 'typescript.js'));
            }
          }
        }

        // license & package.json
        if (opts.pkgName) {
          if (opts.isDependency) {
            ensureDirSync(target);
            writeFileSync(
              join(target, 'index.d.ts'),
              `export * from '${opts.pkgName}';\n`,
              'utf-8',
            );
          } else {
            ensureDirSync(target);
            const pkgRoot = dirname(
              resolve.sync(`${opts.pkgName}/package.json`, {
                basedir: opts.base,
              }),
            );
            if (existsSync(join(pkgRoot, 'LICENSE'))) {
              writeFileSync(
                join(target, 'LICENSE'),
                readFileSync(join(pkgRoot, 'LICENSE'), 'utf-8'),
                'utf-8',
              );
            }
            const { name, author, license, types, typing, typings } =
              JSON.parse(readFileSync(join(pkgRoot, 'package.json'), 'utf-8'));
            writeJSONSync(join(target, 'package.json'), {
              ...{},
              ...{ name },
              ...(author ? { author } : undefined),
              ...(license ? { license } : undefined),
              ...(types ? { types } : undefined),
              ...(typing ? { typing } : undefined),
              ...(typings ? { typings } : undefined),
            });

            // dts
            if (opts.noDts) {
              console.log(chalk.yellow(`Do not build dts for ${opts.pkgName}`));
            } else {
              new Package({
                cwd: opts.base,
                name: opts.pkgName,
                typesRoot: target,
                externals: opts.dtsExternals,
              });

              // patch
              if (opts.pkgName === 'webpack-5-chain') {
                const filePath = join(target, 'types/index.d.ts');
                writeFileSync(
                  filePath,
                  readFileSync(filePath, 'utf-8').replace(
                    `} from 'webpack';`,
                    `} from '@umijs/bunder-webpack/compiled/webpack';`,
                  ),
                  'utf-8',
                );
              }
            }
          }
        }

        // copy files in packages
        if (opts.file && !opts.dtsOnly) {
          const packagesDir = join(opts.base, dirname(opts.file), 'packages');
          if (existsSync(packagesDir)) {
            const files = readdirSync(packagesDir);
            files.forEach((file) => {
              if (file.charAt(0) === '.') return;
              if (!statSync(join(packagesDir, file)).isFile()) return;
              copyFileSync(join(packagesDir, file), join(target, file));
            });
          }
        }
      }
    },
  });
};
