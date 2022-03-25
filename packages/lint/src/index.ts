import { StyleLinter } from './linter';

// FIXME: test only
const stylelint = new StyleLinter(process.cwd());

stylelint.run({});

export default () => {
  return '@umijs/lint';
};
