import autoCSSModulePlugin from './autoCSSModule';

import type { IConfig } from '../types';
import type { InlineConfig as ViteInlineConfig } from 'vite';


/**
 * config with plugins
 */
export default (userConfig: IConfig): ViteInlineConfig => {
  return {
    plugins: [
      autoCSSModulePlugin()
    ],
  };
};