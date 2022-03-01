import type { Plugin } from 'vite';

/**
 * delete specific files from output map
 * @param files file list which will be removed
 */
type a = Parameters<NonNullable<Plugin['generateBundle']>>[1]['file'];
export default function deleteOutputFiles(
  files: string[],
  beforeDelete: (file: a) => void,
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
