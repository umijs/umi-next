import { IApi } from '../../types';

export default (api: IApi) => {
  api.describe({
    enableBy() {
      return !!api.config.target?.ie;
    },
  });
  api.addPolyfillImports(() => [
    {
      source: 'current-script-polyfill',
      specifiers: 'current-script-polyfill',
    },
  ]);
};
