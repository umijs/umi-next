import { IApi } from '../types';

export default (api: IApi) => {
  api.registerCommand({
    name: 'version',
    description: 'show umi version',
    fn({ args }) {
      const version = require('../../package.json').version;
      if (!args.quiet) {
        console.log(`umi@${version}`);
      }
      return version;
    },
  });
};
