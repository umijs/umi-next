import { EsLinter, StyleLinter } from './linter';
import type { ILintArgs, ILinterOpts } from './types';

export type { ILintArgs, ILinterOpts };

export default (opts: ILinterOpts, args: ILintArgs) => {
  console.log('opts-----------------');
  console.log(opts);
  console.log('args----------------');
  console.log(args);
  if (!args.eslintOnly) {
    const stylelint = new StyleLinter(opts);
    stylelint.run(args);
  }

  if (!args.stylelintOnly) {
    const eslint = new EsLinter(opts);
    eslint.run(args);
  }

  return '@umijs/lint';
};
