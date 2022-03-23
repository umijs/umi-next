import { BaseGenerator, lodash, prompts } from '@umijs/utils';
import { join } from 'path';
import { EMonorepoType, IPromptsOpts } from '../type';

interface IMonorepoOpts {
  type: EMonorepoType;
}

export const monorepoPrompts = async (opts: IPromptsOpts) => {
  const response: IMonorepoOpts = await prompts([
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
  ]);
  if (lodash.isEmpty(response)) return;

  const { type } = response;
  if (type === EMonorepoType.initMonorepo) {
    const generator = new BaseGenerator({
      path: join(opts.tplDir, 'monorepo'),
      target: opts.dest,
      data: opts.baseTplData,
      questions: [],
    });
    await generator.run();
  }

  return;
};
