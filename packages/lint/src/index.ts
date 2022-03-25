import { StyleLinter } from './linter';
import type { ILintArgs } from './types';

// FIXME: test only
const stylelint = new StyleLinter({
  cwd: process.cwd(),
  linterResolveDir: process.cwd(),
});

stylelint.run({ _: [] });

export type { ILintArgs };

export default (args: ILintArgs) => {
  args;
  return '@umijs/lint';
};
