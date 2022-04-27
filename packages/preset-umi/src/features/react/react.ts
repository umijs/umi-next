import { semver } from '@umijs/utils';
import type { IApi } from '../../types';

export default (api: IApi) => {
  api.chainWebpack((memo) => {
    const isLTEReact18 = semver.lte(api.appData.react.version, '18.0.0');

    // compatible with < react@18 for @umijs/renderer-react
    if (isLTEReact18) {
      const reactDOM = memo.resolve.alias.get('react-dom');

      memo.resolve.alias.set('react-dom/client$', reactDOM);

      // put react-dom after react-dom/client
      memo.resolve.alias.delete('react-dom');
      memo.resolve.alias.set('react-dom', reactDOM);
    }

    return memo;
  });
};
