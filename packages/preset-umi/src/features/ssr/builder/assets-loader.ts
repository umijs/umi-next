import esbuild from '@umijs/bundler-utils/compiled/esbuild';
import { readFileSync } from 'fs';
import { resolve } from 'path';

function assetsLoader(
  webpackAssetsManifest: Map<string, string> | undefined,
): esbuild.Plugin {
  const assetsFilter = /\.(png|jpg|jpeg|gif|woff|woff2|ttf|eot|mp3|mp4)$/;
  return {
    name: 'assets-loader',
    setup(build) {
      if (!webpackAssetsManifest) return;

      // 帮静态资源打上 staticAssets 的 namespace，然后 onLoad 的时候一起处理
      build.onResolve({ filter: assetsFilter }, (args) => {
        return {
          path: resolve(args.resolveDir, args.path),
          namespace: 'staticAssets',
        };
      });

      // 对于静态资源，我们根据 Webpack 最终打包出来的 manifest 文件，将他们解析到静态资源地址
      build.onLoad(
        { filter: assetsFilter, namespace: 'staticAssets' },
        async (args) => {
          const webpackAssetPath = webpackAssetsManifest.get(args.path);
          if (!webpackAssetPath) {
            return {
              contents: readFileSync(args.path),
              loader: 'dataurl',
            };
          }
          // TODO: / 可能不需要
          return { contents: '/' + webpackAssetPath, loader: 'text' };
        },
      );
    },
  };
}

export default assetsLoader;
