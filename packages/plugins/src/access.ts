import { join } from 'path';
import { IApi } from 'umi';
import { withTmpPath } from './utils/withTmpPath';

export default (api: IApi) => {
  api.describe({
    config: {
      schema(joi) {
        return joi.object();
      },
    },
    enableBy: api.EnableBy.config,
  });

  api.onGenerateFiles(async () => {
    // runtime.tsx
    api.writeTmpFile({
      path: 'runtime.tsx',
      content: `
import React from 'react';
import accessFactory from '@/access';
import { useModel } from '@@/plugin-model';
import { getInitialState } from '@@/plugin-initialState/@@initialState.ts'
import { AccessContext } from './context';

function Provider(props) {
  const { initialState } = useModel('@@initialState');
  const access = React.useMemo(() => accessFactory(initialState), [initialState]);
  return (
    <AccessContext.Provider value={access}>
      { props.children }
    </AccessContext.Provider>
  );
}

export function accessProvider(container) {
  return <Provider>{ container }</Provider>;
}

export async function patchRoutes({ routes }) {
  const findAccessCode = (route) => (
    route.access ||
    (route.parentId && findAccessCode(routes[route.parentId]))
  );
  const access = accessFactory(await getInitialState());
  const parentsNoAccessibleChild: Record<string, boolean> = {};

  Object.keys(routes).forEach(key => {
    const route = routes[key];
    const accessCode = findAccessCode(route);

    // set default status
    route.unaccessible = ${api.config.access.strictMode ? 'true' : 'false'};

    // check access code
    if (typeof accessCode === 'string') {
      const detector = access[route.access];

      if (typeof detector === 'function') {
        route.unaccessible = !detector(route);
      } else if (typeof detector === 'boolean') {
        route.unaccessible = !detector;
      } else if (typeof detector === 'undefined') {
        route.unaccessible = true;
      }
    }

    // set parent status
    if (route.parentId && !route.redirect && parentsNoAccessibleChild[route.parentId] !== 'false') {
      // 'false' means there has at least 1 child route can be accessed, so skip directly
      parentsNoAccessibleChild[route.parentId] = route.unaccessible;
    }
  });

  // re-check parent route accessibility, make sure parent route is unaccessible if all children are unaccessible
  Object.keys(parentsNoAccessibleChild).forEach(key => {
    if (parentsNoAccessibleChild[key] === true) {
      routes[key].unaccessible = true;
    }
  });
}
      `,
    });

    // index.ts
    api.writeTmpFile({
      path: 'index.ts',
      content: `
import React from 'react';
import { AccessContext } from './context';

export const useAccess = () => {
  return React.useContext(AccessContext);
};

export interface AccessProps {
  accessible: boolean;
  fallback?: React.ReactNode;
}
export const Access: React.FC<AccessProps> = (props) => {
  if (process.env.NODE_ENV === 'development' && typeof props.accessible !== 'boolean') {
    throw new Error('[access] the \`accessible\` property on <Access /> should be a boolean');
  }

  return props.accessible ? props.children : props.fallback;
};
      `,
    });

    // context.ts
    api.writeTmpFile({
      path: 'context.ts',
      content: `
import React from 'react';
export const AccessContext = React.createContext<any>(null);
      `,
    });
  });

  api.addRuntimePlugin(() => {
    return [withTmpPath({ api, path: 'runtime.tsx' })];
  });

  api.addTmpGenerateWatcherPaths(() => [
    join(api.paths.absSrcPath, 'access.ts'),
    join(api.paths.absSrcPath, 'access.js'),
  ]);
};
