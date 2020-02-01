import { IApi } from '@umijs/types';
import DevCompileDonePlugin from './DevCompileDonePlugin';

export default (api: IApi) => {
  api.modifyBundleConfig((bundleConfig, { env, bundler: { id } }) => {
    if (env === 'development' && id === 'webpack') {
      bundleConfig.plugins?.push(
        new DevCompileDonePlugin({
          port: api.getPort(),
          https: !!(api.config?.devServer?.https || process.env.HTTPS),
          onCompileDone({ isFirstCompile }) {
            if (isFirstCompile) {
              api.service.emit('firstDevCompileDone');
            }
          },
          onCompileFail() {},
        }),
      );
    }
    return bundleConfig;
  });
};
