import { IApi } from '@umijs/types';
import { cleanTmpPathExceptCache, getBundleAndConfigs } from '../buildDevUtils';
import generateFiles from '../generateFiles';

export default function(api: IApi) {
  const {
    paths,
    utils: { rimraf, chalk },
  } = api;

  api.registerCommand({
    name: 'build',
    fn: async function() {
      cleanTmpPathExceptCache({
        absTmpPath: paths.absTmpPath!,
      });

      // generate files
      await generateFiles({ api, watch: false });

      // build
      const {
        bundler,
        bundleConfigs,
        bundleImplementor,
      } = await getBundleAndConfigs({ api });
      try {
        const { stats } = await bundler.build({
          bundleConfigs,
          bundleImplementor,
        });
        if (process.env.RM_TMPDIR !== 'none') {
          rimraf.sync(paths.absTmpPath!);
        }
        console.log(chalk.green(`Build success.`));
        // console.log(stats);
      } catch (e) {}
    },
  });
}
