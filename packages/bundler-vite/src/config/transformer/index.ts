import { mergeConfig } from 'vite';
import rename from './rename';
import devServer from './devServer';
import css from './css';
import rollup from './rollup';
import react from './react';
import optimizeDeps from './optimizeDeps';
import target from './target';
import define from './define';

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
  const transformers = [
    rename,
    devServer,
    css,
    rollup,
    react,
    optimizeDeps,
    target,
    define,
  ];

  return transformers.reduce<ViteInlineConfig>(
    (memo, transformer) => mergeConfig(memo, transformer(userConfig, memo)),
    {},
  );
};
