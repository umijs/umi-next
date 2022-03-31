import { IApi } from '../types';

export default (api: IApi) => {
  api.registerCommand({
    name: 'lint',
    description: 'lint source code using eslint and stylelint',
    details: `
umi lint

# lint for specific files, default is "{src,test}/**/*.{js,jsx,ts,tsx,less}"
umi lint "**/*.{ts,scss}"

# lint eslint-only or stylelint-only
umi lint --eslint-only
umi lint --stylelint-only

# automatically fix, where possible
umi lint --fix
`,
    fn: async function () {
      const opts = await api.applyPlugins({
        key: 'modifyLinterOpts',
        type: api.ApplyPluginsType.modify,
        initialValue: { cwd: api.cwd, linterResolveDir: api.cwd },
      });
      if (api.args._.length == 0) {
        api.args._.unshift('{src,test}/**/*.{js,jsx,ts,tsx,less,css}');
      }

      // lazy require for CLI performance
      require('@umijs/lint').default(opts, api.args);
    },
  });
};
