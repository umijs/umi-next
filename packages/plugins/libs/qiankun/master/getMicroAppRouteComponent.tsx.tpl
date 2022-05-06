import React from 'react';
import { MicroApp } from './MicroApp';

export function getMicroAppRouteComponent(opts: {
  appName: string;
  base: string;
  routePath: string;
  masterHistoryType: string;
  routeProps?: any;
}) {
  const { base, masterHistoryType, appName, routeProps, routePath } = opts;
  const RouteComponent = () => {
    // 默认取静态配置的 base
    let umiConfigBase = base === '/' ? '' : base;

    // 拼接子应用挂载路由
    let runtimeMatchedBase = umiConfigBase + routePath.replace('/*', '');

    {{#dynamicRoot}}
    // @see https://github.com/umijs/umi/blob/master/packages/preset-built-in/src/plugins/commands/htmlUtils.ts#L102
    runtimeMatchedBase = window.routerBase || location.pathname.split('/').slice(0, -(path.split('/').length - 1)).concat('').join('/');
    {{/dynamicRoot}}

    const componentProps = {
      name: appName,
      base: runtimeMatchedBase,
      history: masterHistoryType,
      ...routeProps,
    };
    return <MicroApp {...componentProps} />;
  };

  return RouteComponent;
}
