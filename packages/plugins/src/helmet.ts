import { dirname } from 'path';
import { IApi } from 'umi';
import { resolveProjectDep } from './utils/resolveProjectDep';

export default (api: IApi) => {
  const pkgPath =
    resolveProjectDep({
      pkg: api.pkg,
      cwd: api.cwd,
      dep: 'react-helmet',
    }) || dirname(require.resolve('react-helmet/package.json'));

  api.modifyAppData((memo) => {
    const version = require(`${pkgPath}/package.json`).version;
    memo['react-helmet'] = {
      pkgPath,
      version,
    };
    return memo;
  });

  api.modifyConfig((memo) => {
    // react-helmet import
    memo.alias['react-helmet'] = pkgPath;
    return memo;
  });

  api.onGenerateFiles(() => {
    // index.ts for export
    api.writeTmpFile({
      path: 'index.ts',
      content: `export { Helmet } from 'react-helmet';`,
    });
  });

  //TODO: umi ssr rumtime
};
