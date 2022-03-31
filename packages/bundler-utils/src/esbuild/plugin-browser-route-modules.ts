import { dirname } from 'path';
import esbuild from '../../compiled/esbuild';

/**
 * 在 pre-compile 阶段，我们会使用 esbuild 来将页面代码 (例如 pages/index.tsx) 中，默认
 * 导出 (export default) 的页面组件及其依赖提取出来，而和页面组件无关的 (export loader,
 * export clientLoader) 等导出 (及其依赖) 则不需要。
 *
 * 这个 BrowserRouteModulesPlugin 能够让 esbuild 在 build 的时候，对于那些后面带有 ?browser 后缀
 * 的 entryPoints 进行路由组件的提取。
 * */
function BrowserRouteModulesPlugin(): esbuild.Plugin {
  return {
    name: 'browser-route-modules',
    async setup(build) {
      build.onResolve({ filter: /\?browser$/ }, (args) => {
        return {
          path: args.path,
          namespace: 'browser-route-module',
        };
      });

      build.onLoad(
        { filter: /\?browser$/, namespace: 'browser-route-module' },
        async (args) => {
          let file = args.path.replace(/\?browser$/, '');
          let contents = `export { default } from ${JSON.stringify(file)};`;
          return {
            contents,
            resolveDir: dirname(file),
            loader: 'js',
          };
        },
      );
    },
  };
}

export default BrowserRouteModulesPlugin;
