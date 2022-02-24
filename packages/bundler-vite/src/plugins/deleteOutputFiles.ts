import type { Plugin } from 'vite';

/**
 * delete specific files from output map
 * @param files file list which will be removed
 */
export function deleteOutputFiles(
  files: string[],
  beforeDelete: Function,
): Plugin {
  return {
    name: 'bundler-vite:delete-output-files',
    generateBundle(_, output) {
      Object.keys(output).forEach((name) => {
        if (files.includes(output[name].fileName)) {
          beforeDelete(output[name]);
          delete output[name];
        }
      });
    },
  };
}
