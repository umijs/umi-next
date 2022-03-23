import {
  BaseGenerator,
  installWithNpmClient,
  lodash,
  prompts,
} from '@umijs/utils';
import { join } from 'path';
import { EMonorepoType, ENpmClient, ENpmRegistry, IPromptsOpts } from '../type';
import { COMMON_PROMPT } from './common';

interface IMonorepoOpts {
  type: EMonorepoType;
  registry?: ENpmRegistry;
}

export const monorepoPrompts = async ({
  baseTplData,
  dest,
  tplDir,
  args,
}: IPromptsOpts) => {
  const response = (await prompts([
    {
      type: 'select',
      name: 'type',
      message: 'Pick monorepo command',
      choices: [
        {
          title: `Init monorepo ( monorepo basic with umi build flow )`,
          value: EMonorepoType.initMonorepo,
        },
        {
          title: `Init shared ( simple lib boilerplate )`,
          value: EMonorepoType.initLib,
        },
        {
          title: `Migration ( init monorepo and move current project to 'apps/*' )`,
          value: EMonorepoType.migration,
        },
      ],
      initial: 0,
    },
    {
      ...COMMON_PROMPT.registry,
      // @ts-ignore
      type: (prev: any, values: any) =>
        [EMonorepoType.initMonorepo].includes(values.type)
          ? COMMON_PROMPT.registry.type
          : false,
    },
  ])) as IMonorepoOpts;
  if (lodash.isEmpty(response)) return;

  const { type, registry } = response;
  const npmClient = ENpmClient.pnpm;
  if (type === EMonorepoType.initMonorepo) {
    const generator = new BaseGenerator({
      path: join(tplDir, 'monorepo'),
      target: dest,
      data: {
        ...baseTplData,
        registry,
        npmClient,
        sharedPkgName: 'shared',
      },
      questions: [],
    });
    await generator.run();
  }
  if (type === EMonorepoType.initLib) {
    const generator = new BaseGenerator({
      path: join(tplDir, 'monorepo', 'packages/shared'),
      target: dest,
      data: {
        sharedPkgName: baseTplData.name,
      },
      questions: [],
    });
    await generator.run();
  }

  if (args.install !== false) {
    // install
    installWithNpmClient({ npmClient });
  }
};
