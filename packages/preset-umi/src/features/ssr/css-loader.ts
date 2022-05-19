import esbuild from '@umijs/bundler-utils/compiled/esbuild';
import { readFileSync } from 'fs';
import { dirname } from 'path';
import { IApi } from '../../types';

function cssLoader(
  api: IApi,
  manifest: Map<string, string> | undefined,
): esbuild.Plugin {
  return {
    name: 'css-loader',
    setup(build) {
      console.log(manifest);
      if (!manifest) return;

      build.onLoad({ filter: /\.css$/ }, (args) => {
        const cssFileContent = readFileSync(args.path);
        const cssClassNames = cssFileContent
          .toString()
          .replace(/{[^{]*?}/g, '')
          .split('\n')
          .filter(Boolean);

        const cssModuleObject: { [key: string]: string } = {};
        cssClassNames.map((className) => {
          const cssFilePath = args.path.replace(api.cwd, '');
          const nameFromWebpack = manifest.get(
            cssFilePath + className.replace(/^\./, '@').trim(),
          );
          if (!nameFromWebpack) return;
          cssModuleObject[className.replace(/^\./, '').trim()] =
            nameFromWebpack;
        });
        return {
          contents: `export default ${JSON.stringify(cssModuleObject)};`,
          loader: 'js',
          resolveDir: dirname(args.path),
        };
      });
    },
  };
}

export default cssLoader;
