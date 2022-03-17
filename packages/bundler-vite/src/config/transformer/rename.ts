import type { IConfigProcessor } from '.';

const MAPPING = {
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
  // console.log('config----------------');
  // console.log(config);
  // console.log('path---------');
  // console.log(path);
  // console.log('value---------');
  // console.log(value);

  const fields = path.split('.');
  // console.log('fields----------------------');
  // console.log(fields);

  fields.reduce((memo, field, i) => {
    // console.log('memo------------');
    // console.log(memo);
    // console.log('field----------------');
    // console.log(field);
    // console.log('i------------------');
    // console.log(i);
    const isLastVar = i === fields.length - 1;

    if (isLastVar) {
      memo[field] = value;
    } else if (!(field in memo)) {
      memo[field] = {};
    }
    // console.log('memo[field]---------------');
    // console.log(memo[field]);
    return memo[field];
  }, config);
}

/**
 * rename umi user config fields to vite's, which can be rename directly
 */
export default (function rename(userConfig) {
  // console.log('userConfig---------------');
  // console.log(userConfig);
  const config = {};

  Object.entries(MAPPING).forEach(([field, mapping]) => {
    // convert config with mapping name if it exists
    // console.log('field----------');
    // console.log(field);
    // console.log('mapping-----------');
    // console.log(mapping);
    if (userConfig[field] !== undefined) {
      setConfigByPath(config, mapping, userConfig[field]);
    }
  });
  // console.log('config------------');
  // console.log(config);

  return config;
} as IConfigProcessor);
