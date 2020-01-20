import { IApi } from '@umijs/types';
import { winPath, createDebug, glob } from '@umijs/utils';
import { join, basename } from 'path';
import { existsSync } from 'fs';

const debug = createDebug('umi:preset-build-in:mock:utils');

export interface IOpts {
  api: IApi;
}

interface IGetMockPaths extends Required<Pick<IApi, 'paths' | 'config'>> {
  cwd: string;
  registerBabel: (paths: string[]) => void;
}

export interface IGetMockDataResult {
  mockData: object;
  mockPaths: string[];
}

/**
 * mock/*
 * .umirc.mock.js
 * .umirc.mock.ts
 * src/** or pages/**
 *
 * @param param
 */
export const getMockData: (opts: IGetMockPaths) => IGetMockDataResult = ({
  cwd,
  paths,
  config,
  registerBabel,
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
  const mockPaths = [
    ...(absMockPaths || []),
    absConfigPath,
    absConfigPathWithTS,
    ...(childMockPaths || []),
  ]
    .filter(path => path && existsSync(path))
    .map(path => winPath(path));

  debug(`load mock data including files ${JSON.stringify(mockPaths)}`);
  console.log('existedMockPathsexistedMockPaths', mockPaths);

  // register babel
  registerBabel(mockPaths);

  // get mock data
  const mockData = getMockConfig(mockPaths);
  return {
    mockData,
    mockPaths,
  };
};

export const getMockConfig = (files: string[]): object => {
  return files.reduce((memo, mockFile) => {
    try {
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

export const cleanRequireCache = (paths: string[]): void => {
  Object.keys(require.cache).forEach(file => {
    if (
      paths.some(path => {
        return winPath(file).indexOf(path) > -1;
      })
    ) {
      delete require.cache[file];
    }
  });
};
