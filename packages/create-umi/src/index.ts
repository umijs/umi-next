import {
  BaseGenerator,
  installWithNpmClient,
  lodash,
  prompts,
} from '@umijs/utils';
import { basename, join } from 'path';
import { testData } from './data/default';
import { generalPrompts } from './prompts/general';
import { monorepoPrompts } from './prompts/monorepo';
import { ENpmClient, ENpmRegistry, ICliOpts, IPromptsOpts } from './type';

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
  let npmClient = ENpmClient.pnpm;
  let registry = ENpmRegistry.npm;
  const isDefaultInit = args.default;
  if (!isDefaultInit) {
    const res = await generalPrompts();
    if (lodash.isEmpty(res)) return;
    npmClient = res.npmClient;
    registry = res.registry;
  }

  const pluginPrompts = [
    {
      name: 'name',
      type: 'text',
      message: `What's the plugin name?`,
      default: name,
    },
    {
      name: 'description',
      type: 'text',
      message: `What's your plugin used for?`,
    },
    {
      name: 'mail',
      type: 'text',
      message: `What's your email?`,
    },
    {
      name: 'author',
      type: 'text',
      message: `What's your name?`,
    },
    {
      name: 'org',
      type: 'text',
      message: `Which organization is your plugin stored under github?`,
    },
  ] as prompts.PromptObject[];

  const generator = new BaseGenerator({
    path: join(tplDir, args.plugin ? 'plugin' : 'app'),
    target: dest,
    data: isDefaultInit
      ? testData
      : {
          ...promptsOpts.baseTplData,
          npmClient,
          registry,
        },
    questions: isDefaultInit ? [] : args.plugin ? pluginPrompts : [],
  });
  await generator.run();

  if (!isDefaultInit && args.install !== false) {
    // install
    installWithNpmClient({ npmClient });
  }
};
