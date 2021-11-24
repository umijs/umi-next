import { IApi } from '../../types';

export default (api: IApi) => {
  api.addPolyfillImports(() => {
    const polyfillImports: { source: string; specifier?: string }[] = [];
    if (!!api.config.targets?.ie) {
      polyfillImports.push({
        source: 'current-script-polyfill',
      });
    }
    return polyfillImports;
  });
};
