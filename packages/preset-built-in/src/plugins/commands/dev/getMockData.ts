import { IApi } from '@umijs/types';
import { chokidar, winPath, createDebug, glob } from '@umijs/utils';
import { join, basename } from 'path';
import { existsSync } from 'fs';

const debug = createDebug('umi:preset-build-in:dev:getMockData');

export interface IOpts {
  api: IApi;
}

interface IGetMockPaths extends Required<Pick<IApi, 'paths' | 'config'>> {
  cwd: string;
}

/**
 * mock/*
 * .umirc.mock.js
 * .umirc.mock.ts
 * src/** or pages/**
 *
 * @param param
 */
export const getMockPaths: (opts: IGetMockPaths) => string[] = ({
  cwd,
  paths,
  config,
}) => {
  const absMockPaths = glob.sync(join(cwd, 'mock/**/*.[jt]s'), {
    ignore: config?.mock?.exclude || [],
  });
  const absConfigPath = join(cwd, '.umirc.mock.js');
  const absConfigPathWithTS = join(cwd, '.umirc.mock.ts');

  // src/* or <pages/>
  const absPagesPath =
    basename(paths.absSrcPath || '') === 'src'
      ? paths.absSrcPath
      : paths.absPagesPath;

  // src/**/_mock.(js|ts)
  const childMockPaths = glob.sync(join(absPagesPath || '', '**/_mock.[jt]s'), {
    ignore: config?.mock?.exclude || [],
  });
  const existedMockPaths = [
    ...(absMockPaths || []),
    absConfigPath,
    absConfigPathWithTS,
    ...(childMockPaths || []),
  ]
    .filter(path => path && existsSync(path))
    .map(path => winPath(path));

  debug(`load mock data including files ${JSON.stringify(existedMockPaths)}`);
  console.log('existedMockPathsexistedMockPaths', existedMockPaths);

  return existedMockPaths;
};

export const getMockConfig = (files: string[]): object => {
  return files.reduce((memo, mockFile) => {
    try {
      // TODO: registerBabel
      const m = require(mockFile); // eslint-disable-line
      memo = {
        ...memo,
        ...(m.default || m),
      };
      return memo;
    } catch (e) {
      throw new Error(e.stack);
    }
  }, {});
};

export default (opts = {} as IOpts) => {
  const { api } = opts;
  const { paths, cwd, config } = api;

  const mockPaths = getMockPaths({
    cwd,
    paths,
    config,
  });

  const data = getMockConfig(mockPaths);
  if (Object.keys(data || {}).length > 0) {
    return {
      data,
    };
  }
  return null;
};
