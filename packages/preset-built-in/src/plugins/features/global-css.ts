import { relative } from 'path';
import { IApi } from '@umijs/types';
import { getGlobalFile } from '../utils';

export default (api: IApi) => {
  const {
    paths,
    utils: { winPath },
  } = api;
  const { absSrcPath = '', absTmpPath = '' } = paths;
  const files = [
    'global.css',
    'global.less',
    'global.scss',
    'global.sass',
    'global.styl',
    'global.stylus',
  ];
  const globalCSSFile = getGlobalFile({ absSrcPath, files });
  console.log('globalCSSFile', globalCSSFile);

  api.addEntryCodeAhead(
    () => `
    ${globalCSSFile
      .map(file => `require('${winPath(relative(absTmpPath, file))}');`)
      .join('')}`,
  );
};
