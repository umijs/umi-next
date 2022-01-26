import type { IEsbuildLoaderHandlerParams } from '@umijs/bundler-webpack';
import { checkMatch } from '../../babelPlugins/awaitImport/checkMatch';

interface IParams {
  cache: Map<string, any>;
  opts: any;
}

export default function getAwaitImportHandler(params: IParams) {
  return function awaitImportHandler(opts: IEsbuildLoaderHandlerParams) {
    let offset = 0;

    let { code } = opts;
    const { filePath, imports } = opts;
    imports.forEach((i) => {
      if (!i.n) return;

      const isLazyImport = i.d > 0;
      const from = i.n;
      const { isMatch, replaceValue } = checkMatch({
        cache: params.cache,
        value: from,
        opts: params.opts,
        filename: filePath,
      });
      if (isMatch) {
        // case: import x from './index.ts';
        //       import('./index.ts');

        // import x from '
        // import(
        const preSeg = code.substring(0, i.s + offset);
        // ';
        // );
        const tailSeg = code.substring(i.e + offset);
        const quote = isLazyImport ? '"' : '';
        code = `${preSeg}${quote}${replaceValue}${quote}${tailSeg}`;
        offset += replaceValue.length - from.length;
      }
    });

    if (params.cache.has(filePath)) {
      params.opts.onCollect?.({
        file: filePath,
        data: params.cache.get(filePath),
      });
    }

    return code;
  };
}
