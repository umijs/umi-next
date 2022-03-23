import type { prompts } from '@umijs/utils';
import { ENpmRegistry } from '../type';

export const COMMON_PROMPT: Record<string, prompts.PromptObject> = {
  registry: {
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
};
