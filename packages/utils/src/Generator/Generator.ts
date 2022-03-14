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
    const realTargetPath = this.getRealPath(opts.target, opts.context);
    fsExtra.mkdirpSync(dirname(realTargetPath));
    console.log(
      `${chalk.green('Write:')} ${relative(this.cwd, realTargetPath)}`,
    );
    writeFileSync(realTargetPath, content, 'utf-8');
    this.renameFile({
      target: realTargetPath,
      data: opts.context,
    });
  }

  getRealPath(value: string, data: Record<string, any>) {
    return value.replace(/({{)(\w)+(}})/g, (v) => {
      const name = v.slice(2, -2);
      return v ? data[name] : v;
    });
  }

  renameFile(opts: { target: string; data: Record<string, any> }) {
    const realTargetPath = this.getRealPath(opts.target, opts.data);
    fsExtra.renameSync(opts.target, realTargetPath);
    console.log(
      `${chalk.green('Rename: ')} ${basename(opts.target)} => ${basename(
        realTargetPath,
      )}`,
    );
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
        const realTargetPath = this.getRealPath(absTarget, opts.context);
        fsExtra.mkdirpSync(dirname(realTargetPath));
        copyFileSync(absFile, realTargetPath);
        this.renameFile({
          target: realTargetPath,
          data: opts.context,
        });
      }
    });
  }
}

export default Generator;
