import { dirname } from 'path';

export default {
  alias: {
    react: dirname(require.resolve('react/package')),
  },
  chainWebpack(memo: any) {
    memo;
  },
  mfsu: {
    esbuild: true,
  },
  // fastRefresh: false,
  // favicon: 'https://sivers.com/favicon.ico',
  headScripts: [`console.log('head script')`],
  scripts: [`console.log('script')`],
  npmClient: 'pnpm',
};
