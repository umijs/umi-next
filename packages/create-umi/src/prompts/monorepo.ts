import {
  BaseGenerator,
  chalk,
  fsExtra,
  installWithNpmClient,
  lodash,
  prompts,
} from '@umijs/utils';
import assert from 'assert';
import { basename, join } from 'path';
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
  cwd,
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

  const initMonorepo = async () => {
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
  };

  if (type === EMonorepoType.initMonorepo) {
    await initMonorepo();
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
  if (type === EMonorepoType.migration) {
    const pkgPath = join(cwd, 'package.json');
    assert(
      fsExtra.existsSync(pkgPath),
      chalk.red(`Not found package.json, current cwd must be a project.`),
    );
    const pkg = require(pkgPath);
    const targetDir = `apps/${basename(cwd)}`;
    // danger: second confirm
    const { confirm_move } = await prompts([
      {
        type: 'confirm',
        name: 'confirm_init',
        message: `You will init a monorepo project based on currently project ${chalk.blue(
          pkg.name,
        )}, Continue?`,
      },
      {
        type: (_, values) => (values.confirm_init ? 'confirm' : null),
        name: 'confirm_move',
        message: `${chalk.red(
          'This is an irreversible operation',
        )}, project will move to ${chalk.yellow(targetDir)}, Confirm?`,
      },
    ]);
    if (confirm_move) {
      moveProject({ from: cwd, dest: join(dest, targetDir) });
      await initMonorepo();
    }
  }

  if (args.install !== false) {
    // install
    installWithNpmClient({ npmClient });
  }
};

const IGNORES = ['node_modules'];
function moveProject(opts: { dest: string; from: string }) {
  const { dest, from } = opts;
  // delete not need files
  IGNORES.forEach((p) => {
    const targetPath = join(from, p);
    if (fsExtra.existsSync(targetPath)) {
      fsExtra.removeSync(targetPath);
    }
  });
  const files = fsExtra.readdirSync(from).filter((file) => {
    if (fsExtra.statSync(file).isDirectory() && file.startsWith('.')) {
      return false;
    }
    return true;
  });
  // move
  if (!fsExtra.existsSync(dest)) {
    fsExtra.mkdirpSync(dest);
  }
  files.forEach((file) => {
    fsExtra.moveSync(join(from, file), join(dest, file));
  });
}
