import { StyleLinter } from './linter';
import type { ILintArgs } from './types';

// FIXME: test only
const stylelint = new StyleLinter(process.cwd());

stylelint.run({});

export type { ILintArgs };

export default (args: ILintArgs) => {
  args;
  return '@umijs/lint';
};
