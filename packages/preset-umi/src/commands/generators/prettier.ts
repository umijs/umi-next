import { GeneratorType } from '@umijs/core';
import { logger } from '@umijs/utils';
import { existsSync, writeFileSync } from 'fs';
import { join } from 'path';
import { IApi } from '../../types';
import { GeneratorHelper } from './utils';

const PRETTIER_CONFIG_FILE = `.prettierrc.js`;

export default (api: IApi) => {
  api.describe({
    key: 'generator:prettier',
  });

  api.registerGenerator({
    key: 'prettier',
    name: 'Enable Prettier',
    description: 'Setup Prettier Configurations',
    type: GeneratorType.enable,
    checkEnable: () => {
      // Not enable when prettier config file exist
      return !existsSync(join(api.cwd, PRETTIER_CONFIG_FILE));
    },
    disabledDescription: `prettier has been enabled; You can remove "${PRETTIER_CONFIG_FILE}" to run this again to re-setup.`,
    fn: async () => {
      const h = new GeneratorHelper(api);

      h.addDevDeps({
        prettier: '^2',
        'prettier-plugin-organize-imports': '^2',
        'prettier-plugin-packagejson': '^2',
      });

      // Generate prettier config file and .prettierignore
      writeFileSync(
        join(api.cwd, PRETTIER_CONFIG_FILE),
        // Use `require.resolve(plugin)` to resolve prettier
        //  cannot correctly find plugin entry in pnpm `node_modules/.pnpm`
        // https://github.com/umijs/umi-next/issues/820
        `
module.exports = {
  printWidth: 80,
  singleQuote: true,
  trailingComma: 'all',
  proseWrap: 'never',
  plugins: [
    require.resolve('prettier-plugin-packagejson'),
    require.resolve('prettier-plugin-organize-imports'),
  ],
};
`.trimStart(),
      );
      logger.info(`Write ${PRETTIER_CONFIG_FILE}`);
      writeFileSync(
        join(api.cwd, '.prettierignore'),
        `
node_modules
.umi
.umi-production
`.trimLeft(),
      );
      logger.info('Write .prettierignore');

      h.installDeps();
    },
  });
};
