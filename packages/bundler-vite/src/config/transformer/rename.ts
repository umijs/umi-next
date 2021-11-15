import type { IConfigProcessor } from '.';

const MAPPING = {
  alias: 'resolve.alias',
  extraVitePlugins: 'plugins',
  inlineLimit: 'build.assetsInlineLimit',
  manifest: 'build.manifest',
  outputPath: 'build.outDir',
  publicPath: 'base',
  jsMinifier: 'build.minify',
  jsMinifierOptions: 'build.terserOptions',
};

/**
 * set config value by field path
 * @param config  original origin
 * @param path    field path
 * @param value   value
 */
function setConfigByPath(config: any, path: string, value: any) {
  const fields = path.split('.');

  fields.reduce((memo, field, i) => {
    const isLastVar = i === fields.length - 1;

    if (isLastVar) {
      // to fix less import issue https://github.com/vitejs/vite/issues/2185
      // need to transform alias object to alias Array like https://vitejs.dev/config/#resolve-alias
      if (field === 'alias') {
        memo[field] = [
          { find: /^~/, replacement: '' },
          ...Object.keys(value).map((k) => ({
            find: k,
            replacement: value[k],
          })),
        ];
      } else {
        memo[field] = value;
      }
    } else if (!(field in memo)) {
      memo[field] = {};
    }

    return memo[field];
  }, config);
}

/**
 * rename umi user config fields to vite's, which can be rename directly
 */
export default (function rename(userConfig) {
  const config = {};

  Object.entries(MAPPING).forEach(([field, mapping]) => {
    // convert config with mapping name if it exists
    if (userConfig[field] !== undefined) {
      setConfigByPath(config, mapping, userConfig[field]);
    }
  });

  console.log('rename config', config);

  return config;
} as IConfigProcessor);
