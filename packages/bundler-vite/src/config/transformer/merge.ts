import type { IConfigProcessor } from '.';

/**
 * Modify the interface of vite configuration
 */
export default (function target(userConfig) {
  if (typeof userConfig.vite === 'object') {
    return userConfig.vite;
  }
} as IConfigProcessor);
