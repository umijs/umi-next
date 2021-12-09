import { transform, transformSync } from '@swc/core';
import { extname } from 'path';
import type { LoaderContext } from '../../compiled/webpack';
import type { SwcOptions } from '../types';

function swcLoader(
  this: LoaderContext<SwcOptions>,
  contents: string,
  sourceMap: any,
) {
  // 启用异步模式
  const callback = this.async();
  const filename = this.resourcePath;
  const ext = extname(filename);
  let loaderOptions = this.getOptions();

  if (sourceMap) {
    sourceMap = JSON.stringify(sourceMap);
  }

  const swcOptions = Object.assign({}, loaderOptions, {
    filename,
    inputSourceMap: sourceMap || undefined,
    sourceMaps: loaderOptions.sourceMaps ?? this.sourceMap,
    sourceFileName: filename,
  });

  const { sync = false, parseMap = false } = swcOptions;

  if (!swcOptions.inputSourceMap) {
    delete swcOptions.inputSourceMap;
  }

  // auto detect development mode
  if (this.mode && swcOptions?.jsc?.transform?.react) {
    swcOptions.jsc.transform.react.development = this.mode === 'development';
  }

  if (swcOptions.sourceMaps === 'inline') {
    swcOptions.sourceMaps = true;
  }

  // .js和.jsx文件使用 ecmascript 进行编译
  if (['.js', 'jsx'].includes(ext) && swcOptions?.jsc?.parser) {
    swcOptions.jsc.parser = {
      ...swcOptions.jsc.parser,
      syntax: 'ecmascript',
      jsx: ext === 'jsx',
    };
  }

  // .ts和.tsx文件使用 typescript 进行编译
  if (['.ts', 'tsx'].includes(ext) && swcOptions?.jsc?.parser) {
    swcOptions.jsc.parser = {
      ...swcOptions.jsc.parser,
      syntax: 'typescript',
      tsx: ext === 'tsx',
    };
  }

  try {
    if (sync) {
      const output = transformSync(contents, swcOptions);
      callback(
        null,
        output.code,
        parseMap ? JSON.parse(output.map!) : output.map,
      );
    } else {
      transform(contents, swcOptions).then(
        (output) => {
          callback(
            null,
            output.code,
            parseMap ? JSON.parse(output.map!) : output.map,
          );
        },
        (err) => {
          callback(err);
        },
      );
    }
  } catch (e: any) {
    callback(e);
  }
}

export default swcLoader;
export const custom = swcLoader;
