import { Plugin } from '@umijs/bundler-utils/compiled/esbuild';
import enhancedResolve from 'enhanced-resolve';
import { promises as fs } from 'fs';
import less from 'less';
import LessPluginAliases from 'less-plugin-aliases';
import path from 'path';
import { IConfig } from '../types';
import { postcssProcess } from '../utils/postcssProcess';
import { sortByAffix } from '../utils/sortByAffix';

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
    '.less',
    '.css',
  ],
  // TODO: support exports
  exportsFields: [],
});

async function resolve(context: string, path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    resolver(context, path, (err: Error, result: string) =>
      err ? reject(err) : resolve(result),
    );
  });
}

const aliasLessImports = async (
  ctx: string,
  alias: Record<string, string>,
  importer: string,
) => {
  const importRegex = /@import(?:\s+\((.*)\))?\s+['"](.*)['"]/;
  const globalImportRegex = /@import(?:\s+\((.*)\))?\s+['"](.*)['"]/g;
  const match = ctx.match(globalImportRegex) || [];
  for (const el of match) {
    const [imp, _, filePath] = el.match(importRegex) || [];
    let aliaPath = await aliasLessImportPath(filePath, alias, importer);
    if (aliaPath) {
      ctx = ctx.replace(imp, el.replace(filePath, aliaPath));
    }
  }
  return ctx;
};

export const aliasLessImportPath = async (
  filePath: string,
  alias: Record<string, string>,
  importer: string,
) => {
  // ～ 写法在 esbuild 中无实际意义
  let aliaPath = filePath.startsWith('~')
    ? filePath.replace('~', '')
    : filePath;
  const keys = sortByAffix({ arr: Object.keys(alias), affix: '$' });
  for (const key of keys) {
    const pathSegments = aliaPath.split(path.sep);
    if (pathSegments[0] === key) {
      pathSegments[0] = alias[key];
      aliaPath = pathSegments.join(path.sep);
      aliaPath = path.extname(aliaPath) ? aliaPath : `${aliaPath}.less`;
      return await resolve(importer, aliaPath);
    }
  }
  return null;
};

export default (
  options: Less.Options & {
    alias?: Record<string, string>;
    inlineStyle?: boolean;
    config?: IConfig;
  } = {},
): Plugin => {
  const { alias, inlineStyle, config, ...lessOptions } = options;
  return {
    name: 'less',
    setup({ onResolve, onLoad }) {
      onResolve({ filter: /\.less$/, namespace: 'file' }, async (args) => {
        let filePath = args.path;
        let isMatchedAlias = false;
        let isImportFromDeps = false;
        if (!!alias) {
          const aliasMatchPath = await aliasLessImportPath(
            filePath,
            alias,
            args.path,
          );
          if (aliasMatchPath) {
            isMatchedAlias = true;
            filePath = aliasMatchPath;
          } else {
            // if alias not matched, identify whether import from deps (node_modules)
            if (!path.isAbsolute(filePath) && !filePath.startsWith('.')) {
              isImportFromDeps = true;
            }
          }
        } else {
          //没有别名也要对路径进行处理
          isImportFromDeps = false;
        }
        if (!isMatchedAlias) {
          filePath = isImportFromDeps
            ? await resolve(process.cwd(), filePath)
            : path.resolve(
                process.cwd(),
                path.relative(process.cwd(), args.resolveDir),
                args.path,
              );
        }
        return {
          path: filePath,
          namespace: inlineStyle ? 'less-file' : 'file',
        };
      });
      if (inlineStyle) {
        onResolve({ filter: /\.less$/, namespace: 'less-file' }, (args) => {
          return { path: args.path, namespace: 'less-content' };
        });

        onResolve(
          { filter: /^__style_helper__$/, namespace: 'less-file' },
          (args) => ({
            path: args.path,
            namespace: 'style-helper',
            sideEffects: false,
          }),
        );

        onLoad({ filter: /.*/, namespace: 'less-file' }, async (args) => ({
          contents: `
            import { injectStyle } from "__style_helper__"
            import css from ${JSON.stringify(args.path)}
            injectStyle(css)
            export default{}
          `,
        }));
      }

      onLoad(
        { filter: /\.less$/, namespace: inlineStyle ? 'less-content' : 'file' },
        async (args) => {
          let content = await fs.readFile(args.path, 'utf-8');
          if (!!alias) {
            content = await aliasLessImports(content, alias, args.path);
          }
          const dir = path.dirname(args.path);
          const filename = path.basename(args.path);
          try {
            const result = await less.render(content, {
              plugins: [
                new LessPluginAliases({
                  prefix: '~',
                  aliases: alias || {},
                }),
              ],
              filename,
              rootpath: dir,
              ...lessOptions,
              paths: [...(lessOptions.paths || []), dir],
            });
            const postcssrResult = await postcssProcess(
              config!,
              result.css,
              args.path,
            );
            return {
              contents: postcssrResult.css,
              loader: inlineStyle ? 'text' : 'css',
              resolveDir: dir,
            };
          } catch (error: any) {
            return {
              errors: [
                {
                  text: error.message,
                  location: {
                    namespace: 'file',
                    file: error.filename,
                    line: error.line,
                    column: error.column,
                  },
                },
              ],
              resolveDir: dir,
            };
          }
        },
      );
    },
  };
};
