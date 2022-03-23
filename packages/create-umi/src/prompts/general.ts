import {
  BaseGenerator,
  installWithNpmClient,
  lodash,
  prompts,
} from '@umijs/utils';
import { join } from 'path';
import { testData } from '../data/default';
import { ENpmClient, ENpmRegistry, IPromptsOpts } from '../type';
import { COMMON_PROMPT } from './common';

interface IGeneralOpts {
  npmClient: ENpmClient;
  registry: ENpmRegistry;
}

export const generalPrompts = async ({
  args,
  baseTplData,
  tplDir,
  dest,
  name,
}: IPromptsOpts) => {
  let npmClient = ENpmClient.pnpm;
  let registry = ENpmRegistry.npm;

  // use default data, skip prompts init
  const isDefaultInit = args.default;
  if (!isDefaultInit) {
    const response = (await prompts([
      {
        type: 'select',
        name: 'npmClient',
        message: 'Pick Npm Client',
        choices: [
          { title: 'npm', value: ENpmClient.npm },
          { title: 'cnpm', value: ENpmClient.cnpm },
          { title: 'tnpm', value: ENpmClient.tnpm },
          { title: 'yarn', value: ENpmClient.yarn },
          { title: 'pnpm', value: ENpmClient.pnpm },
        ],
        initial: 4,
      },
      COMMON_PROMPT.registry,
    ])) as IGeneralOpts;
    if (lodash.isEmpty(response)) return;
    npmClient = response.npmClient;
    registry = response.registry;
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
          ...baseTplData,
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
