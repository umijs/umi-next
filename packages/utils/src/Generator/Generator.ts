import {
  copyFileSync,
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'fs';
import { dirname, join, relative } from 'path';
import chalk from '../../compiled/chalk';
import fsExtra from '../../compiled/fs-extra';
import glob from '../../compiled/glob';
import Mustache from '../../compiled/mustache';
import prompts from '../../compiled/prompts';
import yParser from '../../compiled/yargs-parser';

interface IOpts {
  baseDir: string;
  args: yParser.Arguments;
}

class Generator {
  baseDir: string;
  args: yParser.Arguments;
  prompts: any;

  constructor({ baseDir, args }: IOpts) {
    this.baseDir = baseDir;
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

  copyTpl(opts: {
    templatePath: string;
    target: string;
    context: object;
    skipCheckStat?: boolean;
  }) {
    // skip write file when target is exists.
    if (!opts?.skipCheckStat && existsSync(opts.target)) {
      console.log(
        `${chalk.yellow('Skip:')} ${relative(
          this.baseDir,
          opts.target,
        )} is exists.`,
      );
      return;
    }
    const tpl = readFileSync(opts.templatePath, 'utf-8');
    const content = Mustache.render(tpl, opts.context);
    fsExtra.mkdirpSync(dirname(opts.target));
    console.log(
      `${chalk.green('Write:')} ${relative(this.baseDir, opts.target)}`,
    );
    writeFileSync(opts.target, content, 'utf-8');
  }

  copyDirectory(opts: {
    path: string;
    context: object;
    target: string;
    skipCheckStat?: boolean;
  }) {
    // skip write file when target is Non Empty Directory.
    if (
      !opts?.skipCheckStat &&
      existsSync(opts.target) &&
      readdirSync(opts.target).length > 0
    ) {
      console.log(
        `${chalk.yellow('Skip:')} ${opts.target} is Non Empty Directory.`,
      );
      return;
    }
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
      }
    });
  }
}

export default Generator;
