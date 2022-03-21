import type { PluginPass } from '@babel/core';
import type { Visitor } from '@babel/traverse';
import type {
  JSXAttribute,
  JSXIdentifier,
  JSXMemberExpression,
  JSXNamespacedName,
  JSXOpeningElement,
  Node,
} from '@babel/types';
import {
  jsxAttribute,
  jsxIdentifier,
  stringLiteral,
} from '@babel/types/lib/builders/generated';
import { winPath } from '@umijs/utils';
import type { RequestHandler } from 'express';
import { join, relative } from 'path';
import createReactLaunchEditorMiddleware from 'react-dev-utils/errorOverlayMiddleware';
// @ts-ignore
import launchEditorEndpoint from 'react-dev-utils/launchEditorEndpoint';
import { IApi } from 'umi';
import { Mustache } from 'umi/plugin-utils';
import { withTmpPath } from './utils/withTmpPath';

interface InspectorPluginOptions {
  /** override process.cwd() */
  cwd?: string;
  /** patterns to exclude matched files */
  excludes?: (string | RegExp)[];
}

type ElementTypes = JSXOpeningElement['name']['type'];

type NodeHandler<T = Node, O = void> = (
  node: T,
  option: O,
) => {
  /**
   * stop processing flag
   */
  stop?: boolean;

  /**
   * throw error
   */
  error?: any;

  /**
   * node after processing
   */
  result?: Node;
};

const reactLaunchEditorMiddleware: RequestHandler =
  createReactLaunchEditorMiddleware();

export const launchEditorMiddleware: RequestHandler = (req, res, next) => {
  if (req.url.startsWith(launchEditorEndpoint)) {
    /**
     * retain origin endpoint for backward compatibility <= v1.2.0
     */
    if (
      // relative route used in `Inspector.tsx` `gotoEditor()`
      req.url.startsWith(`${launchEditorEndpoint}/relative`) &&
      typeof req.query.fileName === 'string'
    ) {
      req.query.fileName = join(process.cwd(), req.query.fileName);
    }
    reactLaunchEditorMiddleware(req, res, next);
  } else {
    next();
  }
};

/**
 * retain create method for backward compatibility <= v1.2.0
 */
const createLaunchEditorMiddleware: () => RequestHandler = () =>
  launchEditorMiddleware;

const isNil = (value: any): value is null | undefined =>
  value === null || value === undefined;

/**
 * simple path match method, only use string and regex
 */
export const pathMatch = (
  filePath: string,
  matches?: (string | RegExp)[],
): boolean => {
  if (!matches?.length) return false;

  return matches.some((match) => {
    if (typeof match === 'string') {
      return filePath.includes(match);
    } else if (match instanceof RegExp) {
      return match.test(filePath);
    }
    // default is do not filter when match is illegal, so return true
    return true;
  });
};

const doJSXIdentifierName: NodeHandler<JSXIdentifier> = (name) => {
  if (name.name.endsWith('Fragment')) {
    return { stop: true };
  }
  return { stop: false };
};

const doJSXMemberExpressionName: NodeHandler<JSXMemberExpression> = (name) => {
  return doJSXIdentifierName(name.property);
};

const doJSXNamespacedNameName: NodeHandler<JSXNamespacedName> = (name) => {
  return doJSXIdentifierName(name.name);
};

const doJSXPathName: NodeHandler<JSXOpeningElement['name']> = (name) => {
  const dealMap: {
    [key in ElementTypes]:
      | NodeHandler<JSXIdentifier>
      | NodeHandler<JSXMemberExpression>
      | NodeHandler<JSXNamespacedName>;
  } = {
    JSXIdentifier: doJSXIdentifierName,
    JSXMemberExpression: doJSXMemberExpressionName,
    JSXNamespacedName: doJSXNamespacedNameName,
  };

  // @ts-ignore
  return dealMap[name.type](name);
};

const doJSXOpeningElement: NodeHandler<
  JSXOpeningElement,
  { relativePath: string }
> = (node, option) => {
  const { stop } = doJSXPathName(node.name);
  if (stop) return { stop };

  const { relativePath } = option;
  const line = node.loc?.start.line;
  const column = node.loc?.start.column;

  const findCodeString: JSXAttribute | null =
    isNil(line) && isNil(column)
      ? null
      : jsxAttribute(
          jsxIdentifier('data-find-code'),
          stringLiteral(
            JSON.stringify([
              line?.toString(),
              column?.toString(),
              relativePath,
            ]),
          ),
        );

  const attributes = [findCodeString] as JSXAttribute[];

  // Make sure that there are exist together
  if (attributes.every(Boolean)) {
    node.attributes.unshift(...attributes);
  }

  return { result: node };
};

const memo = (handler: any): typeof handler => {
  const cache = new Map<any, ReturnType<typeof handler>>();
  return (arg: any) => {
    if (cache.has(arg)) {
      return cache.get(arg);
    }
    const result = handler(arg);
    cache.set(arg, result);
    return result;
  };
};

const createVisitor = ({
  cwd,
  excludes,
}: {
  cwd?: string;
  excludes?: (string | RegExp)[];
}): Visitor => {
  const isExclude = excludes?.length
    ? memo((filePath: string): boolean => pathMatch(filePath, excludes))
    : () => false;

  const pathRelative = memo((filePath: string): string =>
    relative(cwd ?? process.cwd(), filePath),
  );

  const visitor: Visitor = {
    JSXOpeningElement: {
      // @ts-ignore
      enter(path, state: PluginPass) {
        const filePath = state?.file?.opts?.filename;
        if (!filePath) return;
        if (isExclude(filePath)) return;

        const relativePath = pathRelative(filePath);

        doJSXOpeningElement(path.node, {
          relativePath,
        });
      },
    },
  };

  return visitor;
};

export default function inspectorPlugin(api: IApi) {
  api.describe({
    key: 'inspectorConfig',
    config: {
      schema: (joi) => {
        return joi.object().keys({
          cwd: joi.string(),
          excludes: joi.array().items(joi.string()),
        });
      },
    },
    enableBy: () => {
      /**
       * Handle whether the plugin needs to be pre-released or used online.
       * If it is installed in devDependencies, it only supports local
       */
      const inDevDependencies = api.pkg.devDependencies?.['@umijs/plugins'];
      const isDev = process.env.NODE_ENV === 'development';
      return isDev || !inDevDependencies;
    },
  });

  const uiFindCodePkgPath = winPath(require.resolve('./findcode/index'));

  const inspectorConfig = api.userConfig.inspectorConfig as
    | InspectorPluginOptions
    | undefined;

  api.registerPlugins([
    {
      id: 'virtual: config-findcode',
      key: 'findcode',
      config: {
        visitor: createVisitor({
          cwd: inspectorConfig?.cwd || api.cwd,
          excludes: [
            'node_modules/',
            /\.umi(-production)?\//,
            ...(inspectorConfig?.excludes ?? []),
          ],
        }),
      },
    },
  ]);

  api.onGenerateFiles(() => {
    const runtimeTpl = `
// @ts-ignore
import React from 'react';
// @ts-ignore
import { Inspector } from '{{{uiFindCodePkgPath}}}';

//判断用户是否在内网
let timeoutPromise = (timeout) => new Promise((resolve) => setTimeout(() => resolve(''), timeout));
// @ts-ignore
Promise.race([
  timeoutPromise(1000),
  fetch('https://dev.g.alicdn.com/aliyun_pip/pip-mobile-assets/1.0.4/detect.js'),
])// @ts-ignore
  .then(res => res && res.text && res.text())
  .then(res => {
    try {
      // @ts-ignore
      window.IS_IN_INTERNAL_NETWORK = false;
      eval(res);
    } catch (e) {
    }
  })
  .catch((e) => {
    // @ts-ignore
    window.IS_IN_INTERNAL_NETWORK = false;
  });


export function rootContainer(container: React.ReactNode) {
  const isDev = process.env.NODE_ENV === 'development';
  const gitUrl = "{{{gitUrl}}}";
  const props = {
    disableLaunchEditor: !isDev,
    onClickElement: (inspect: any) => {
      // @ts-ignore
      const noJump = isDev || !inspect.codeInfo?.relativePath || !window.IS_IN_INTERNAL_NETWORK;
      if (noJump) return;
      const {
        relativePath,
        lineNumber,
      } = inspect.codeInfo;

      if (gitUrl.indexOf('://') > -1) {
        window.open(\`\${gitUrl}/\${relativePath}#L\${lineNumber}\`);
      } else {
        console.log(">>>>需要在项目 package.json 补充 repository 的 url 字段为 git 仓库可访问地址")
      }
    }
  };
  return React.createElement(Inspector, props, container);
}
`;

    //处理仓库地址
    let gitUrl = '';
    const { repository } = api.pkg;

    if (repository && repository.url) {
      gitUrl = repository.url;
    }

    if (gitUrl.indexOf('/tree/master') === -1) {
      gitUrl += '/tree/master';
    }

    api.writeTmpFile({
      path: 'runtime.tsx',
      content: Mustache.render(runtimeTpl, { gitUrl, uiFindCodePkgPath }),
    });
  });

  // @ts-ignore
  api.addBeforeMiddlewares(createLaunchEditorMiddleware);

  api.addRuntimePlugin(() => {
    return [withTmpPath({ api, path: 'runtime.tsx' })];
  });
}
