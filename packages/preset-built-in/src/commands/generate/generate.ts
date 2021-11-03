import { GeneratorType, IGeneratorOpts } from '@umijs/core';
import {
  generateFile,
  installDeps,
  prompts,
  updatePackageJSON,
} from '@umijs/utils';
import { IApi } from '../../types';

export default (api: IApi) => {
  api.registerCommand({
    name: 'generate',
    alias: 'g',
    details: `
umi generate
`,
    description: 'generate code snippets quickly',
    async fn({ args }) {
      const [type] = args._;
      const runGenerator = (generator: IGeneratorOpts) => {
        generator?.fn({
          api,
          args,
          generateFile,
          installDeps,
          updatePackageJSON,
        });
      };

      if (type) {
        const generator = api.service.generators[type];
        if (!generator) {
          throw new Error(`Generator ${type} not found.`);
        }
        if (generator.type === GeneratorType.enable) {
          const enable = await generator.checkEnable?.({
            api,
            args,
          });
          if (!enable) {
            throw new Error(
              `Generator ${type} is unable.The corresponding function has been turned on or is not available.`,
            );
          }
        }
        runGenerator(generator);
      } else {
        const getEnableGenerators = async (
          generators: typeof api.service.generators,
        ) => {
          const questions = [] as { title: string; value: string }[];
          Object.keys(generators).forEach(async (key) => {
            if (generators[key].type === GeneratorType.generate) {
              questions.push({
                title:
                  `${generators[key].name} -- ${generators[key].description}` ||
                  '',
                value: generators[key].key,
              });
            } else {
              const enable = await generators[key]?.checkEnable?.({
                api,
                args,
              });
              if (enable) {
                questions.push({
                  title:
                    `${generators[key].name} -- ${generators[key].description}` ||
                    '',
                  value: generators[key].key,
                });
              }
            }
          });
          return questions;
        };
        const questions = await getEnableGenerators(api.service.generators);
        const { gType } = await prompts({
          type: 'select',
          name: 'gType',
          message: 'Pick generator type',
          choices: questions,
        });
        runGenerator(api.service.generators[gType]);
      }
    },
  });
};
