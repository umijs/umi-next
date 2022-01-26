import type { IEsbuildLoaderHandlerParams } from '@umijs/bundler-webpack';

export default function autoExportHandler(opts: IEsbuildLoaderHandlerParams) {
  if (!opts.exports.length) {
    return `${opts.code};\nexport const __mfsu = 1;`;
  }
  return opts.code;
}
