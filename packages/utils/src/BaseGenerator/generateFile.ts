import prompts from '../../compiled/prompts';
import BaseGenerator from './BaseGenerator';

const generateFile = async ({
  path,
  target,
  cwd,
  data,
  questions,
}: {
  path: string;
  target: string;
  cwd?: string;
  data?: any;
  questions?: prompts.PromptObject[];
}) => {
  const generator = new BaseGenerator({
    path,
    target,
    cwd,
    data,
    questions,
  });

  await generator.run();
};

export default generateFile;
