import { transform, transformSync } from '@swc/core';
import type { LoaderContext } from '../../compiled/webpack';
import type { SwcOptions } from '../types';

function swcLoader(this: LoaderContext<SwcOptions>, contents: string) {
  // 启用异步模式
  const callback = this.async();
  const filename = this.resourcePath;
  const isTSFile = filename.endsWith('.ts');
  const isTypeScript = isTSFile || filename.endsWith('.tsx');
  let swcOpts = this.getOptions();

  const { sync = false, parseMap = false } = swcOpts;

  if (swcOpts?.jsc) {
    swcOpts.jsc.parser = {
      ...swcOpts.jsc.parser,
      syntax: isTypeScript ? 'typescript' : 'ecmascript',
      [isTypeScript ? 'tsx' : 'jsx']: isTSFile,
      topLevelAwait: true,
      dynamicImport: !isTypeScript,
    };
    swcOpts.jsc.target = 'es2017';
  }

  try {
    if (sync) {
      const output = transformSync(contents, swcOpts);
      callback(
        null,
        output.code,
        parseMap ? JSON.parse(output.map!) : output.map,
      );
    } else {
      console.log('swcOpts >>> ', swcOpts);
      transform(contents, swcOpts).then(
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
