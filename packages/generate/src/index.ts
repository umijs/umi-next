import * as prompts from '@umijs/utils/compiled/prompts';
import Generator from './Generator';

export default async ({
  path,
  target,
  data,
  questions,
}: {
  path: string;
  target: string;
  data?: any;
  questions?: prompts.PromptObject[];
}) => {
  //TODO: ganerate examples
  //TODO: path is server address: https://github.com/XX

  const generator = new Generator({
    path,
    target,
    data,
    questions,
  });

  await generator.run();
};
