import { StyleLinter } from './linter';
import type { ILintArgs, ILinterOpts } from './types';

// FIXME: test only
const stylelint = new StyleLinter({
  cwd: process.cwd(),
  linterResolveDir: process.cwd(),
});

stylelint.run({ _: ['*.less'] });

export type { ILintArgs, ILinterOpts };

export default (opts: ILinterOpts, args: ILintArgs) => {
  opts;
  args;
  return '@umijs/lint';
};
