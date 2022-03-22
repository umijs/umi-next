import { ApplyPluginsType, PluginManager } from './plugin';

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

describe('PluginManager', function () {
  it('does NOT wait async calls in async=false mode', async () => {
    const pm = new PluginManager({
      validKeys: ['foo'],
    });

    const asyncCall = jest.fn();
    const syncCall = jest.fn();

    pm.register({
      apply: {
        foo: async () => {
          await delay(100);
          asyncCall();
        },
      },
      path: '/a',
    });
    pm.register({
      apply: {
        foo: syncCall,
      },
      path: '/a',
    });

    await pm.applyPlugins({
      key: 'foo',
      type: ApplyPluginsType.event,
      async: false,
    });

    expect(syncCall).toBeCalled();
    expect(asyncCall).not.toBeCalled();
  });

  it('waits all calls in async=true mode', async () => {
    const pm = new PluginManager({
      validKeys: ['foo'],
    });

    const asyncCall = jest.fn();
    const syncCall = jest.fn();

    pm.register({
      apply: {
        foo: async () => {
          await delay(100);
          asyncCall();
        },
      },
      path: '/a',
    });
    pm.register({
      apply: {
        foo: syncCall,
      },
      path: '/a',
    });

    await pm.applyPlugins({
      key: 'foo',
      type: ApplyPluginsType.event,
      async: true,
    });

    expect(syncCall).toBeCalled();
    expect(asyncCall).toBeCalled();
  });
});
