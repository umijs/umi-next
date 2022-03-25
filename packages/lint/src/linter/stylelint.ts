import type { ILintArgs } from '../types';
import BaseLinter from './base';

/**
 * linter for drive stylelint
 */
export default class StyleLinter extends BaseLinter {
  linter = 'stylelint';

  userFiles = { lintConfig: '.stylelintrc' };

  paths = {
    lintConfig: require.resolve('../config/stylelint'),
  };

  getRunArgs(args: ILintArgs) {
    return [
      '--config',
      this.paths.lintConfig,
      '--quiet', // no warnings
      ...(args.fix ? ['--fix'] : []),
      ...args._,
    ];
  }
}
