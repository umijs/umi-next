import { dirname } from 'path';
import { winPath } from 'umi/plugin-utils';

/**
 * replace dependencies import which not be externalized with absolute path
 */
export function replaceDepToAbsPath(
  content: string,
  deps: string[],
  externals: Record<string, any> = {},
) {
  const externalDeps = Object.keys(externals);

  // filter externalized deps, but exclude exact match (e.g. 'react$')
  deps
    .filter((dep) => !externalDeps.includes(dep))
    .forEach((dep) => {
      let regexp: RegExp;

      if (externals[`${dep}$`]) {
        // only replace subpath import if dep is exact match external
        regexp = new RegExp(`from '${dep}(/)`, 'g');
      } else {
        // otherwise, replace all path import
        regexp = new RegExp(`from '${dep}(/|')`, 'g');
      }

      content = content.replace(
        regexp,
        `from '${winPath(dirname(require.resolve(`${dep}/package`)))}$1`,
      );
    });

  return content;
}
