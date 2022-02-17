import type { Plugin } from 'vite';
import { IConfig } from '../types';

/**
 * support externals like webpack
 * @note  only support key:value format
 */
export default function externals(externals: IConfig['externals']): Plugin {
  return {
    name: 'bundler-vite:externals',
    resolveId(id) {
      if (externals[id]) {
        return id;
      }
    },
    load(id) {
      if (externals[id]) {
        return `const external = window.${externals[id]};export default external;`;
      }
    },
  };
}
