import { lodash, prompts } from '@umijs/utils';
import { EMonorepoType, ICliOpts } from '../type';

interface IMonorepoOpts {
  type: EMonorepoType;
}

export const monorepoPrompts = async (opts: ICliOpts) => {
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
  // todo
  return;
};
