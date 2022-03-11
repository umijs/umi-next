import { copyFileSync, readFileSync, statSync, writeFileSync } from 'fs';
import { dirname, join, relative } from 'path';
import chalk from '../../compiled/chalk';
import fsExtra from '../../compiled/fs-extra';
import glob from '../../compiled/glob';
import Mustache from '../../compiled/mustache';
import prompts from '../../compiled/prompts';
import yParser from '../../compiled/yargs-parser';

interface IOpts {
  cwd: string;
  args: yParser.Arguments;
}

class Generator {
  cwd: string;
  args: yParser.Arguments;
  prompts: any;

  constructor({ cwd, args }: IOpts) {
    this.cwd = cwd;
    this.args = args;
    this.prompts = {};
  }

  async run() {
    const questions = this.prompting();
    this.prompts = await prompts(questions);
    await this.writing();
  }

  prompting() {
    return [] as any;
  }

  async writing() {}

  private convertFilePrefix(rawPath: string) {
    if (rawPath.indexOf('_') === -1) {
      return rawPath;
    }

    return rawPath
      .split('/')
      .map((filename) => {
        // dotfiles are ignored when published to npm, therefore in templates
        // we need to use underscore instead (e.g. "_gitignore")
        if (filename.charAt(0) === '_' && filename.charAt(1) !== '_') {
          return `.${filename.slice(1)}`;
        }
        if (filename.charAt(0) === '_' && filename.charAt(1) === '_') {
          return `${filename.slice(1)}`;
        }
        return filename;
      })
      .join('/');
  }

  copyTpl(opts: { templatePath: string; target: string; context: object }) {
    const tpl = readFileSync(opts.templatePath, 'utf-8');
    const content = Mustache.render(tpl, opts.context);
    fsExtra.mkdirpSync(dirname(opts.target));
    console.log(`${chalk.green('Write:')} ${relative(this.cwd, opts.target)}`);
    writeFileSync(this.convertFilePrefix(opts.target), content, 'utf-8');
  }

  copyDirectory(opts: { path: string; context: object; target: string }) {
    const files = glob.sync('**/*', {
      cwd: opts.path,
      dot: true,
      ignore: ['**/node_modules/**'],
    });
    files.forEach((file: any) => {
      const absFile = join(opts.path, file);
      if (statSync(absFile).isDirectory()) return;
      if (file.endsWith('.tpl')) {
        this.copyTpl({
          templatePath: absFile,
          target: join(opts.target, file.replace(/\.tpl$/, '')),
          context: opts.context,
        });
      } else {
        console.log(`${chalk.green('Copy: ')} ${file}`);
        const absTarget = join(opts.target, this.convertFilePrefix(file));
        fsExtra.mkdirpSync(dirname(absTarget));
        copyFileSync(absFile, absTarget);
      }
    });
  }
}

export default Generator;
