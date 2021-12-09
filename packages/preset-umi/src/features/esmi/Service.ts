import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';
import type { IApi } from '../../types';

export interface IImportmapData {
  importMap: {
    imports: Record<string, string>;
    scopes: Record<string, any>;
  };
  deps: {
    name: string;
    version: string;
    type: string;
  }[];
}

export interface IPkgData {
  pkgJsonContent: IApi['pkg'];
  pkgInfo: {
    name: string;
    version: string;
    type: 'esm';
    exports: {
      name: string;
      path: string;
      from: string;
      deps: {
        name: string;
        version: string;
        usedMap: Record<
          string,
          {
            usedNamespace?: boolean;
            usedDefault?: boolean;
            usedNames: string[];
          }
        >;
      }[];
    }[];
    assets: any[];
  };
}

/**
 * class for connect esmi server
 */
export default class ESMIService {
  cdnOrigin: string = '';
  cacheDir: string = '';
  cache: Record<string, IImportmapData> = {};

  constructor(opts: { cdnOrigin: string; cacheDir: string }) {
    this.cdnOrigin = opts.cdnOrigin;
    this.cacheDir = opts.cacheDir;

    // restore local cache
    const cacheFilePath = path.join(this.cacheDir, 'importmap.json');

    if (fs.existsSync(cacheFilePath)) {
      try {
        this.cache = require(cacheFilePath);
      } catch {
        /* nothing */
      }
    }
  }

  /**
   * get cache file path by cache key
   * @param data  pkg data
   */
  static getCacheKey(data: IPkgData) {
    const hash = createHash('md4');

    hash.update(JSON.stringify(data.pkgInfo.exports));

    return hash.digest('hex');
  }

  /**
   * get importmap cache by cache key
   * @param key cache key
   */
  getCache(key: string) {
    return this.cache[key];
  }

  /**
   * set importmap cache
   * @param key   cache key
   * @param data  importmap data
   */
  setCache(key: string, data: IImportmapData) {
    this.cache[key] = data;

    // create cache dir
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }

    // write cache to file system
    fs.writeFileSync(
      path.join(this.cacheDir, 'importmap.json'),
      JSON.stringify(this.cache, null, 2),
    );
  }

  /**
   * build importmap from deps tree
   * @param data  package data
   * @returns ticketId
   */
  async build(data: IPkgData) {
    return axios
      .post<{ success: boolean; data?: { ticketId?: string } }>(
        `${this.cdnOrigin}/api/v1/esm/build`,
        data,
      )
      .then((a) => a.data.data?.ticketId);
  }

  /**
   * get importmap from deps tree
   * @param data  package data
   * @returns importmap
   */
  async getImportmap(data: IPkgData) {
    const cacheKey = ESMIService.getCacheKey(data);
    const cache = this.getCache(cacheKey);

    // use valid cache first
    if (cache) {
      return cache;
    }

    // get the build ticket id
    const ticketId = await this.build(data);
    // continue to the next request after 2s
    const next = () =>
      new Promise<IImportmapData | undefined>((resolve) =>
        setTimeout(() => resolve(deferrer()), 2000),
      );
    const deferrer = (): Promise<IImportmapData | undefined> => {
      return axios
        .get<{ success: boolean; data?: IImportmapData }>(
          `${this.cdnOrigin}/api/v1/esm/importmap/${ticketId}`,
        )
        .then((res) => {
          if (res.data.success) {
            this.setCache(cacheKey, res.data.data!);

            return res.data.data;
          }

          return next();
        }, next);
    };

    // TODO: timeout + time spend log

    return deferrer();
  }
}
