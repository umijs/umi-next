import esbuild from '@umijs/bundler-utils/compiled/esbuild';
import { loaders } from '@umijs/bundler-utils/dist/esbuild';
import { DEFAULT_OUTPUT_PATH } from '@umijs/bundler-webpack/dist/constants';
import { EnableBy } from '@umijs/core/dist/types';
import { appendFileSync, readFileSync, unlinkSync } from 'fs';
import { dirname, join, resolve } from 'path';
import type { IApi } from '../../types';
import { lessLoader } from './esbuild-less-plugin';
import { esbuildIgnorePathPrefixPlugin, esbuildUmiPlugin } from './utils';

export default (api: IApi) => {
  api.describe({
    key: 'ssr',
    config: {
      schema(Joi) {
        return Joi.object({
          serverBuildPath: Joi.string(),
        });
      },
    },
    enableBy: EnableBy.config,
  });

  api.addBeforeMiddlewares(() => [
    async (req, res, next) => {
      (await require(absServerBuildPath(api))).default(req, res, next);
    },
  ]);

  // 在 webpack 完成打包以后，使用 esbuild 编译 umi.server.js
  api.onBuildComplete(async ({ err }) => {
    if (err) return;
    const assetsFilter = /\.(png|jpg|jpeg|gif|woff|woff2|ttf|eot|mp3|mp4)$/;
    await esbuild.build({
      format: 'cjs',
      platform: 'node',
      target: 'esnext',
      bundle: true,
      watch: api.env === 'development' && {
        onRebuild() {
          delete require.cache[absServerBuildPath(api)];
        },
      },
      logLevel: 'error',
      loader: loaders,
      external: ['umi'],
      entryPoints: [resolve(api.paths.absTmpPath, 'server.ts')],
      plugins: [
        esbuildIgnorePathPrefixPlugin(),
        esbuildUmiPlugin(api),
        lessLoader(),
        {
          name: 'assets',
          setup(build) {
            const manifest = JSON.parse(
              readFileSync(
                join(
                  api.cwd,
                  api.userConfig.outputPath || DEFAULT_OUTPUT_PATH,
                  'asset-manifest.json',
                ),
              ).toString(),
            );

            // 打包完成后，除了 umi.server.js 外，如果项目中有引入样式资源，
            // 还会生成 umi.server.css 文件，我们需要将这个文件写入到 umi.server.ts 中
            // 将 css 写入 umi.server.js 后就可以把 css 构建产物删除了
            build.onEnd(() => {
              const css = readFileSync(
                absServerBuildPath(api).replace(/\.js$/, '.css'),
              );
              appendFileSync(
                absServerBuildPath(api),
                `
const SERVER_SIDE_STYLES = \`${css.toString()}\`;
`,
              );
              unlinkSync(absServerBuildPath(api).replace(/\.js$/, '.css'));
            });

            // 帮静态资源打上 staticAssets 的 namespace，然后 onLoad 的时候一起处理
            build.onResolve({ filter: assetsFilter }, (args) => {
              return {
                path: args.path,
                namespace: 'staticAssets',
              };
            });

            // 对于静态资源，我们根据 Webpack 最终打包出来的 manifest 文件，将他们解析到静态资源地址
            build.onLoad(
              { filter: assetsFilter, namespace: 'staticAssets' },
              (args) => {
                const contents =
                  manifest['static/' + args.path.split('/').pop()] || '';
                return { contents, loader: 'text' };
              },
            );

            // TODO: 对于 SVG 文件，将他解析成可以同时用静态资源 url 和 ReactComponent 两种形式使用的格式
            build.onLoad({ filter: /\.(svg)$/ }, (args) => {
              return {
                contents: `
const url = '';
export default url;
export function ReactComponent() { return null }
`,
                resolveDir: dirname(args.path),
                loader: 'js',
              };
            });
          },
        },
      ],
      outfile: absServerBuildPath(api),
    });
  });
};

function absServerBuildPath(api: IApi) {
  return resolve(
    api.paths.cwd,
    api.userConfig.ssr.serverBuildPath || 'server/umi.server.js',
  );
}
