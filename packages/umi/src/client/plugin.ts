import { assert, compose, isPromiseLike } from './utils.js';

export enum ApplyPluginsType {
  compose = 'compose',
  modify = 'modify',
  event = 'event',
}

interface IPlugin {
  path?: string;
  apply: Record<string, any>;
}

export class PluginManager {
  opts: { validKeys: string[] };
  hooks: {
    [key: string]: any;
  } = {};
  constructor(opts: { validKeys: string[] }) {
    this.opts = opts;
  }

  register(plugin: IPlugin) {
    assert(
      plugin.apply && plugin.path,
      `plugin register failed, apply and path must supplied`,
    );
    Object.keys(plugin.apply).forEach((key) => {
      assert(
        this.opts.validKeys.indexOf(key) > -1,
        `register failed, invalid key ${key} from plugin ${plugin.path}.`,
      );
      this.hooks[key] = (this.hooks[key] || []).concat(plugin.apply[key]);
    });
  }

  getHooks(keyWithDot: string) {
    const [key, ...memberKeys] = keyWithDot.split('.');
    let hooks = this.hooks[key] || [];
    if (memberKeys.length) {
      hooks = hooks
        .map((hook: any) => {
          try {
            let ret = hook;
            for (const memberKey of memberKeys) {
              ret = ret[memberKey];
            }
            return ret;
          } catch (e) {
            return null;
          }
        })
        .filter(Boolean);
    }
    return hooks;
  }

  applyPlugins({
    key,
    type,
    initialValue,
    args,
    async,
  }: {
    key: string;
    type: ApplyPluginsType;
    initialValue?: any;
    args?: object;
    async?: boolean;
  }) {
    const hooks = this.getHooks(key) || [];

    if (args) {
      assert(
        typeof args === 'object',
        `applyPlugins failed, args must be plain object.`,
      );
    }

    switch (type) {
      case ApplyPluginsType.modify:
        if (async) {
          return hooks.reduce(
            async (memo: any, hook: Function | Promise<any> | object) => {
              assert(
                typeof hook === 'function' ||
                  typeof hook === 'object' ||
                  isPromiseLike(hook),
                `applyPlugins failed, all hooks for key ${key} must be function, plain object or Promise.`,
              );
              if (isPromiseLike(memo)) {
                memo = await memo;
              }
              if (typeof hook === 'function') {
                const ret = hook(memo, args);
                if (isPromiseLike(ret)) {
                  return await ret;
                } else {
                  return ret;
                }
              } else {
                if (isPromiseLike(hook)) {
                  hook = await hook;
                }
                return { ...memo, ...hook };
              }
            },
            isPromiseLike(initialValue)
              ? initialValue
              : Promise.resolve(initialValue),
          );
        } else {
          return hooks.reduce((memo: any, hook: Function | object) => {
            assert(
              typeof hook === 'function' || typeof hook === 'object',
              `applyPlugins failed, all hooks for key ${key} must be function or plain object.`,
            );
            if (typeof hook === 'function') {
              return hook(memo, args);
            } else {
              // TODO: deepmerge?
              return { ...memo, ...hook };
            }
          }, initialValue);
        }

      case ApplyPluginsType.event:
        return hooks.forEach((hook: Function) => {
          assert(
            typeof hook === 'function',
            `applyPlugins failed, all hooks for key ${key} must be function.`,
          );
          hook(args);
        });

      case ApplyPluginsType.compose:
        return () => {
          return compose({
            fns: hooks.concat(initialValue),
            args,
          })();
        };
    }
  }

  static create(opts: { validKeys: string[]; plugins: IPlugin[] }) {
    const pluginManager = new PluginManager({
      validKeys: opts.validKeys,
    });
    opts.plugins.forEach((plugin) => {
      pluginManager.register(plugin);
    });
    return pluginManager;
  }
}

// plugins meta info (in tmp file)
// hooks api: usePlugin
