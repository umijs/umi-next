import { lodash, winPath } from '@umijs/utils';
import { join } from 'path';
import { IConfig, IRoute } from '..';
import assert from 'assert';
import getConventionalRoutes from './getConventionalRoutes';
import routesToJSON from './routesToJSON';

interface IOpts {
  onPatchRoutesBefore?: Function;
  onPatchRoutes?: Function;
  onPatchRouteBefore?: Function;
  onPatchRoute?: Function;
}

interface IGetRoutesOpts {
  config: IConfig;
  // root 通常是 src/pages 目录
  root: string;
  componentPrefix?: string;
  isConventional?: boolean;
}

class Route {
  opts: IOpts;
  constructor(opts?: IOpts) {
    this.opts = opts || {};
  }

  async getRoutes(opts: IGetRoutesOpts) {
    const { config, root, componentPrefix } = opts;
    // 避免修改配置里的 routes，导致重复 patch
    let routes = lodash.cloneDeep(config.routes);
    let isConventional = false;
    if (!routes) {
      assert(root, `opts.root must be supplied for conventional routes.`);
      routes = this.getConventionRoutes({ root: root!, componentPrefix });
      isConventional = true;
    }
    await this.patchRoutes(routes, {
      ...opts,
      isConventional,
    });
    return routes;
  }

  // TODO:
  // 1. 移动 /404 到最后，并处理 component 和 redirect
  // 2. exportStatic 时同步 / 到 /index.html
  async patchRoutes(routes: IRoute[], opts: IGetRoutesOpts) {
    if (this.opts.onPatchRoutesBefore) {
      await this.opts.onPatchRoutesBefore({
        routes,
      });
    }
    for (const route of routes) {
      await this.patchRoute(route, opts);
    }
    if (this.opts.onPatchRoutes) {
      await this.opts.onPatchRoutes({
        routes,
      });
    }
  }

  async patchRoute(route: IRoute, opts: IGetRoutesOpts) {
    if (this.opts.onPatchRouteBefore) {
      await this.opts.onPatchRouteBefore({
        route,
      });
    }

    if (route.routes) {
      await this.patchRoutes(route.routes, opts);
    } else if (!('exact' in route)) {
      // exact by default
      route.exact = true;
    }

    // resolve component path
    if (
      route.component &&
      !opts.isConventional &&
      typeof route.component === 'string' &&
      !route.component.startsWith('@/') &&
      !route.component.startsWith('/')
    ) {
      route.component = winPath(join(opts.root, route.component));
    }

    // resolve wrappers path
    if (route.wrappers) {
      route.wrappers = route.wrappers.map(wrapper => {
        return winPath(join(opts.root, wrapper));
      });
    }

    if (this.opts.onPatchRoute) {
      await this.opts.onPatchRoute({
        route,
      });
    }
  }

  getConventionRoutes(opts: any): IRoute[] {
    return getConventionalRoutes(opts);
  }

  getJSON(opts: { routes: IRoute[]; config: IConfig; cwd: string }) {
    return routesToJSON(opts);
  }

  getPaths({ routes }: { routes: IRoute[] }): string[] {
    return lodash.uniq(
      routes.reduce((memo: string[], route) => {
        if (route.path) memo.push(route.path);
        if (route.routes)
          memo = memo.concat(this.getPaths({ routes: route.routes }));
        return memo;
      }, []),
    );
  }
}

export default Route;
