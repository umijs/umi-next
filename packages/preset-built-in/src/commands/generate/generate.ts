import { BaseGenerator, randomColor } from '@umijs/utils';
import { join } from 'path';
import { IApi, IRegisterGenerator } from '../../types';

export default (api: IApi) => {
  const generators = {} as any;

  api.registerCommand({
    name: 'generate',
    alias: 'g',
    details: `
umi g page pageName
`,
    description: 'generate code snippets quickly',
    async fn({ args }) {
      const [type, ..._] = args._;
      const Generator = generators[type];
      if (!Generator || (!Generator.class && !Generator.fn)) {
        throw new Error(`Generator ${type} not found.`);
      }

      // 支持构造器函数，让用户更自由的自定义内容
      if (Generator.fn) {
        await Generator.fn({
          cwd: api.cwd,
          args: {
            ...args,
            _,
          },
        });
        return;
      }

      const generator = new Generator({
        cwd: api.cwd,
        args: {
          ...args,
          _,
        },
      });
      await generator.run();
    },
  });

  api.registerMethod({
    name: 'registerGenerator',
    fn: ({ key, Generator, fn }: IRegisterGenerator) => {
      generators[key] = { class: Generator, fn };
    },
  });

  const createPageGenerator = ({ api }: { api: IApi }) => {
    return class PageGenerator extends BaseGenerator {
      constructor(opts: any) {
        const { args } = opts;
        const [, name, ..._] = args._;
        super({
          path: require.resolve('./templates/page'),
          target: join(api.paths.absPagesPath, name),
          data: {
            color: randomColor(),
          },
        });
      }
    };
  };
  api.registerGenerator({
    key: 'page',
    Generator: createPageGenerator({ api }),
  });
  api.registerGenerator({
    key: 'page2',
    fn: async (options) => {
      const { args } = options;
      const [, name, ..._] = args._;
      const generator = new BaseGenerator({
        path: require.resolve('./templates/page'),
        target: join(api.paths.absPagesPath, name),
        data: {
          color: randomColor(),
        },
      });
      await generator.run();
    },
  });
};
