import { prompts } from '@umijs/utils';
import { ENpmClient, ENpmRegistry } from '../type';

interface IGeneralOpts {
  npmClient: ENpmClient;
  registry: ENpmRegistry;
}

export const generalPrompts = async () => {
  const response = await prompts([
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
    {
      type: 'select',
      name: 'registry',
      message: 'Pick Npm Registry',
      choices: [
        {
          title: 'npm',
          value: ENpmRegistry.npm,
          selected: true,
        },
        { title: 'taobao', value: ENpmRegistry.taobao },
      ],
    },
  ]);
  return response as IGeneralOpts;
};
