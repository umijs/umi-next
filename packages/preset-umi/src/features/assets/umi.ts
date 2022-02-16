import type { Compiler } from '@umijs/bundler-webpack/compiled/webpack';
import type { IApi } from '../../types';

interface IAddUmiAssetsPluginOpts {
  addAssets: (opts: { js?: string[]; css?: string[] }) => void;
}

const UMI_ASSETS_REG = {
  js: /^umi(\..+)?\.js$/,
  css: /^umi(\..+)?\.css$/,
};

const PLUGIN_NAME = 'add-umi-assets-plugin';
class AddUmiAssetsPlugin {
  isJsAdded = false;
  isCssAdded = false;
  addAssets;

  constructor(options: IAddUmiAssetsPluginOpts) {
    this.addAssets = options.addAssets;
  }

  apply(compiler: Compiler) {
    compiler.hooks.done.tap(PLUGIN_NAME, (compilation) => {
      if (this.isCssAdded && this.isJsAdded) return;
      const assets = compilation.toJson().entrypoints?.['umi'].assets || [];
      for (let asset of assets) {
        const name = asset.name;
        if (!name.startsWith('umi')) return;
        if (!this.isJsAdded && UMI_ASSETS_REG.js.test(name)) {
          this.isJsAdded = true;
          this.addAssets({ js: [`/${name}`] });
        }
        if (!this.isCssAdded && UMI_ASSETS_REG.css.test(name)) {
          this.isCssAdded = true;
          this.addAssets({ css: [`/${name}`] });
        }
      }
    });
  }
}

export default (api: IApi) => {
  api.chainWebpack((memo) => {
    memo.plugin(PLUGIN_NAME).use(AddUmiAssetsPlugin, [
      {
        addAssets: ({ js = [], css = [] }) => {
          if (css.length) {
            api.addHTMLStyles({
              fn: () => css,
              stage: Number.NEGATIVE_INFINITY,
            });
          }
          if (js.length) {
            api.addHTMLScripts({
              fn: () => js,
              stage: Number.NEGATIVE_INFINITY,
            });
          }
        },
      },
    ]);
  });
};
