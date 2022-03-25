import path from 'path';
import BaseLinter from './base';

/**
 * linter for drive stylelint
 */
export default class StyleLinter extends BaseLinter {
  userFiles = { lintConfig: '.stylelintrc', ignoreConfig: '.stylelintignore' };

  paths = {
    bin: require.resolve(
      './' + require('stylelint/package.json').bin.stylelint,
      { paths: [path.dirname(require.resolve('stylelint/package.json'))] },
    ),
    lintConfig: require.resolve('../config/stylelint'),
  };

  getRunArgs(args: Record<string, string>) {
    return [
      '--custom-syntax',
      args['stylelint.customSyntax'] || 'postcss-less',
      '--config',
      this.paths.lintConfig,
      '--quiet', // no warnings
      ...(args.fix || args['stylelint.fix'] ? ['--fix'] : []),
      '*.less',
    ];
  }
}
