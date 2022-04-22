import { PATHS } from './.internal/constants';
import { spawnSync } from './utils';

(async () => {
  spawnSync(`jest -c ${PATHS.JEST_TURBO_CONFIG}`, { cwd: process.cwd() });
})();
