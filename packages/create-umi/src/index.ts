import { lodash } from '@umijs/utils';
import { basename, join } from 'path';
import { generalPrompts } from './prompts/general';
import { monorepoPrompts } from './prompts/monorepo';
import { ICliOpts, IPromptsOpts } from './type';

export default async (opts: ICliOpts) => {
  const { cwd, args } = opts;

  const [name] = args._;
  const dest = name ? join(cwd, name) : cwd;
  const dirName = basename(dest);
  const pkgName = lodash.kebabCase(lodash.lowerCase(dirName));
  const tplDir = join(__dirname, '../templates');
  const promptsOpts: IPromptsOpts = {
    dest,
    tplDir,
    name,
    baseTplData: {
      version: require(join(__dirname, '../package.json')).version,
      pkgName,
    },
    ...opts,
  };

  // for monorepo
  if (args.monorepo) {
    await monorepoPrompts(promptsOpts);
    return;
  }

  // for general project
  await generalPrompts(promptsOpts);
};
