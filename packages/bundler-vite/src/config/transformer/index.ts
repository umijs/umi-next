import { mergeConfig } from 'vite';
import rename from './rename';
import devServer from './devServer';

import type { InlineConfig as ViteInlineConfig } from 'vite';

// FIXME: replace with real user config types
type ITmpUserConfig = Record<string, any>;

/**
 * type of config processor
 */
export type IConfigProcessor = (
  userConfig: ITmpUserConfig,
  currentViteConfig: Partial<ViteInlineConfig>,
) => Partial<ViteInlineConfig>;

/**
 * config transformer
 */
export default (userConfig: ITmpUserConfig): ViteInlineConfig => {
  const transformers = [rename, devServer];

  return transformers.reduce<ViteInlineConfig>(
    (memo, transformer) =>
      mergeConfig(memo, transformer(userConfig, memo)),
    {},
  );
};
