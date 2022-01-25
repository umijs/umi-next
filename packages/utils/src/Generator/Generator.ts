import { copyFileSync, readFileSync, statSync, writeFileSync } from 'fs';
import { basename, dirname, join, relative } from 'path';
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

  copyTpl(opts: { templatePath: string; target: string; context: object }) {
    const tpl = readFileSync(opts.templatePath, 'utf-8');
    const content = Mustache.render(tpl, opts.context);
    fsExtra.mkdirpSync(dirname(opts.target));
    console.log(`${chalk.green('Write:')} ${relative(this.cwd, opts.target)}`);
    writeFileSync(opts.target, content, 'utf-8');
    this.renameFile({
      target: opts.target,
      data: opts.context,
    });
  }

  renameFile(opts: { target: string; data: Record<string, any> }) {
    const lastItem = basename(opts.target);
    lastItem.replace(/(?<={{)(\w)+(?=}})/g, (substring) => {
      if (substring) {
        const value = opts.data[substring];
        if (value) {
          const renameFileName = lastItem.replace(/({{)(\w)+(}})/g, value);
          fsExtra.renameSync(
            opts.target,
            join(dirname(opts.target), renameFileName),
          );
          console.log(
            `${chalk.green('Rename: ')} ${lastItem} => ${renameFileName}`,
          );
        }
      }
      return substring;
    });
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
        const absTarget = join(opts.target, file);
        fsExtra.mkdirpSync(dirname(absTarget));
        copyFileSync(absFile, absTarget);
        this.renameFile({
          target: absTarget,
          data: opts.context,
        });
      }
    });
  }
}

export default Generator;
