import { Generator, mkdirp } from '@umijs/utils';
import * as prompts from '@umijs/utils/compiled/prompts';
import { copyFileSync, statSync } from 'fs';
import { basename, dirname, join } from 'path';

interface IOpts {
  path: string;
  target: string;
  data?: any;
  questions?: prompts.PromptObject[];
}

export default class BaseGenerator extends Generator {
  path: string;
  target: string;
  data: any;
  questions: prompts.PromptObject[];

  constructor({ path, target, data, questions }: IOpts) {
    super({ cwd: target, args: data });
    this.path = path;
    this.target = target;
    this.data = data;
    this.questions = questions || [];
  }

  prompting() {
    return this.questions;
  }

  async writing() {
    const context = {
      ...this.data,
      ...this.prompts,
    };
    if (statSync(this.path).isDirectory()) {
      this.copyDirectory({
        context,
        path: this.path,
        target: this.target,
      });
    } else {
      const file = basename(this.path.replace(/\.tpl$/, ''));
      if (this.path.endsWith('.tpl')) {
        this.copyTpl({
          templatePath: this.path,
          target: join(this.target, file),
          context,
        });
      } else {
        const absTarget = join(this.target, file);
        mkdirp.sync(dirname(absTarget));
        copyFileSync(this.path, absTarget);
      }
    }
  }
}
