import { EsLinter, StyleLinter } from './linter';
import type { ILintArgs, ILinterOpts } from './types';

export type { ILintArgs, ILinterOpts };

export default (opts: ILinterOpts, args: ILintArgs) => {
  const stylelint = new StyleLinter(opts);
  if (!args.eslintOnly) {
    if (!args.cssinjs) {
      args._.unshift('--ignore-pattern', '**/*.js');
      args._.unshift('--ignore-pattern', '**/*.jsx');
      args._.unshift('--ignore-pattern', '**/*.ts');
      args._.unshift('--ignore-pattern', '**/*.tsx');
    }
    stylelint.run(args);
  }

  if (!args.stylelintOnly) {
    args._.unshift('--ignore-pattern', '*.less');
    args._.unshift('--ignore-pattern', '*.css');
    const eslint = new EsLinter(opts);
    eslint.run(args);
  }
};
