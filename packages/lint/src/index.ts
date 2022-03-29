import { EsLinter, StyleLinter } from './linter';
import type { ILintArgs, ILinterOpts } from './types';

export type { ILintArgs, ILinterOpts };

export default (opts: ILinterOpts, args: ILintArgs) => {
  if (!args.eslintOnly) {
    args._.unshift('--ignore-pattern', '*.js');
    args._.unshift('--ignore-pattern', '*.ts');
    const stylelint = new StyleLinter(opts);
    stylelint.run(args);
  }

  if (!args.stylelintOnly) {
    args._.unshift('--ignore-pattern', '*.less');
    args._.unshift('--ignore-pattern', '*.css');
    const eslint = new EsLinter(opts);
    eslint.run(args);
  }

  return '@umijs/lint';
};
