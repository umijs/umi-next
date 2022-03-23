import {
  BaseGenerator,
  installWithNpmClient,
  lodash,
  prompts,
} from '@umijs/utils';
import { join } from 'path';
import { testData } from './data/default';
import { generalPrompts } from './prompts/general';
import { monorepoPrompts } from './prompts/monorepo';
import { ENpmClient, ENpmRegistry, ICliOpts } from './type';

export default async (opts: ICliOpts) => {
  const { cwd, args } = opts;
  const [name] = args._;
  let npmClient = ENpmClient.pnpm;
  let registry = ENpmRegistry.npm;

  // for monorepo
  if (args.monorepo) {
    await monorepoPrompts(opts);
    return;
  }

  // for general project
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
    path: join(__dirname, '..', 'templates', args.plugin ? 'plugin' : 'app'),
    target: name ? join(cwd, name) : cwd,
    data: isDefaultInit
      ? testData
      : {
          version: require('../package').version,
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
