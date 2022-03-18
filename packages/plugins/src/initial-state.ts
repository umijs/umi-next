import { IApi } from 'umi';
import { withTmpPath } from './utils/withTmpPath';

export default (api: IApi) => {
  api.describe({
    config: {
      schema(Joi) {
        return Joi.object({
          loading: Joi.string(),
        });
      },
    },
    enableBy: api.EnableBy.config,
  });

  api.register({
    key: 'addExtraModels',
    fn: () => [withTmpPath({ api, path: '@@initialState.ts' })],
  });

  api.addRuntimePluginKey(() => ['getInitialState']);

  api.addRuntimePlugin(() => {
    return [withTmpPath({ api, path: 'runtime.tsx' })];
  });

  api.onGenerateFiles(() => {
    const { loading } = api.config.initialState;
    // Provider.tsx
    api.writeTmpFile({
      path: 'Provider.tsx',
      content: `
import React from 'react';
import { useModel } from '@@/plugin-model';
${
  loading
    ? `import Loading from ${loading}`
    : `function Loading() { return <div>loading</div>; }`
}
export default function InitialStateProvider(props: any) {
  const appLoaded = React.useRef(false);
  const { loading = false } = useModel("@@initialState") || {};
  React.useEffect(() => {
    if (!loading) {
      appLoaded.current = true;
    }
  }, [loading]);
  if (loading && !appLoaded.current) {
    return <Loading />;
  }
  return props.children;
}
      `,
    });

    // @@initialState.ts
    api.writeTmpFile({
      path: '@@initialState.ts',
      content: api.appData.appJS?.exports.includes('getInitialState')
        ? `
import { useState, useEffect, useCallback } from 'react';
import { getInitialState as getUserInitialState } from '@/app';

const initState = {
  initialState: undefined,
  loading: true,
  error: undefined,
};

export const getInitialState = (() => {
  let cachedState: any;

  return async () => {
    if (!cachedState) {
      try {
        cachedState = { loading: false, initialState: await getUserInitialState() };
      } catch (error) {
        cachedState = { loading: false, error };
      }
    }

    return cachedState;
  }
})();

export default () => {
  const [state, setState] = useState(initState);
  const refresh = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: undefined }));
    const ret = await getInitialState();
    setState((s) => ({ ...s, ...ret }));
    // [?]
    // await sleep(10);
  }, []);

  const setInitialState = useCallback(async (initialState) => {
    setState((s) => {
      if (typeof initialState === 'function') {
        return { ...s, initialState: initialState(s.initialState), loading: false };
      }
      return { ...s, initialState, loading: false };
    });
    // [?]
    // await sleep(10)
  }, []);

  useEffect(() => {
    refresh();
  }, []);

  return {
    ...state,
    refresh,
    setInitialState,
  };
}
        `
        : `
export default () => ({ loading: false, refresh: () => {} })
      `,
    });

    // runtime.tsx
    api.writeTmpFile({
      path: 'runtime.tsx',
      content: `
import React from 'react';
import Provider from './Provider';
export function innerProvider(container) {
  return <Provider>{ container }</Provider>;
}
      `,
    });
  });
};
