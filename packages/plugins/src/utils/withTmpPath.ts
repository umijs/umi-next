import { join } from 'pathe';
import { IApi } from 'umi';

export function withTmpPath(opts: {
  api: IApi;
  path: string;
  noPluginDir?: boolean;
}) {
  return join(
    opts.api.paths.absTmpPath,
    opts.api.plugin.key && !opts.noPluginDir
      ? `plugin-${opts.api.plugin.key}`
      : '',
    opts.path,
  );
}
