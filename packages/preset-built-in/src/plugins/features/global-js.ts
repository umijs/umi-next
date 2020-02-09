import { relative } from 'path';
import { IApi } from '@umijs/types';
import { getGlobalFile } from '../utils';

export default (api: IApi) => {
  const { paths } = api;
  const { absSrcPath = '', absTmpPath = '' } = paths;
  const files = ['global.tsx', 'global.ts', 'global.jsx', 'global.js'];
  const globalJSFile = getGlobalFile({ absSrcPath, files });
  console.log('globalJSFile', globalJSFile);

  api.addEntryImportsAhead(() =>
    globalJSFile.map(file => ({
      source: relative(absTmpPath, file),
    })),
  );
};
