# 插件 API

为方便查找，以下内容通过字母排序。

在查用 umi 插件 API 之前，我们建议你先阅读[插件](../guides/plugins.md)一节，以了解 umi 插件的机制及原理，这将帮助你更好的使用插件 API。

## 核心 API
service 和 PluginAPI 里定义的方法。

### applyPlugins
```ts
api.applyPlugins({ key: string, type?: api.ApplyPluginsType, initialValue?: any, args?: any })
```
取得 `register()` 注册的 hooks 执行后的数据，这是一个异步函数，因此它返回的将是一个 Promise。这个方法的例子和详解见 [register](#register) api

### describe
```ts
api.describe({ key?:string, config?: { default , schema, onChange }, enableBy? })
```
在插件注册阶段( initPresets or initPlugins stage )执行，用于描述插件或者插件集的 key、配置信息和启用方式等。

- `key` 是配置中该插件配置的键名
- `config.default` 是插件配置的默认值，当用户没有在配置中配置 key 时，默认配置将生效。
- `config.schema` 用于声明配置的类型，基于 [joi](https://hapi.dev/family/joi/) 。 **如果你希望用户进行配置，这个是必须的** ，否则用户的配置无效
- `config.onChange` 是 dev 模式下，配置被修改后的处理机制。默认值为 `api.ConfigChangeType.reload`，表示在 dev 模式下，配置项被修改时会重启 dev 进程。 你也可以修改为 `api.ConfigChangeType.regenerateTmpFiles`, 表示只重新生成临时文件。你还可以传入一个方法，来自定义处理机制。
- `enableBy` 是插件的启用方式，默认是`api.EnableBy.register`，表示注册启用，即插件只要被注册就会被启用。可以更改为 `api.EnableBy.config` ，表示配置启用，只有配置插件的配置项才启用插件。你还可以自定义一个返回布尔值的方法（ true 为启用 ）来决定其启用时机，这通常用来实现动态生效。

e.g.
```ts
api.describe({
  key: 'foo',
  config: {
    default: 'Hello, Umi!',
    schema(joi){
      return joi.string();
    },
    onChange: api.ConfigCHangeType.regenerateTmpFiles,
  },
  enableBy: api.EnableBy.config,
})
```
这个例子中，插件的 `key` 为 `foo`，因此配置中的键名为 `foo`，配置的类型是字符串，默认值为 "Hello, Umi!"，当配置 `foo` 发生变化时，dev 只会重新生成临时文件。该插件只有在用户配置了 `foo` 之后才会启用。

### register <span id = 'register'/>
```ts
register({ key: string, fn, before?: string, stage?: number})
```
为 `api.applyPlugins` 注册可供其使用的 hook。

- `key` 是注册的 hook 的类别名称，可以多次使用 `register` 向同一个 `key` 注册 hook，它们将会依次执行。这个 `key` 也同样是使用 `applyPlugins` 收集 hooks 数据时使用的 `key`。注意： **这里的 key 和 插件的 key 没有任何联系。** 
- `fn` 是 hook 的定义，可以是同步的，也可以是异步的（返回一个 Promise 即可）
- `stage` 用于调整执行顺序，默认为 0，设为 -1 或更少会提前执行，设为 1 或更多会后置执行。
- `before` 同样用于调整执行的顺序，传入的值为注册的 hook 的名称。注意：**`register` 注册的 hook 的名称是所在 umi 插件的 id。** stage 和 before 的更多用法参考 [tapable](https://github.com/webpack/tapable)

fn 的写法需要结合即将使用的 applyPlugins 的 type 参数来确定：
- `api.ApplyPluginsType.add` `applyPlugins` 将按照 hook 顺序来将它们的返回值拼接成一个数组。此时 `fn` 需要有返回值，`fn` 将获取 `applyPlugins` 的参数 `args` 来作为自己的参数。`applyPlugins` 的 `initialValue` 必须是一个数组，它的默认值是空数组。当 `key` 以 `'add'` 开头且没有显式地声明 `type` 时，`applyPlugins` 会默认按此类型执行。
- `api.ApplyPluginsType.modify` `applyPlugins` 将按照 hook 顺序来依次更改 `applyPlugins` 接收的 `initialValue`， 因此此时 **`initialValue` 是必须的** 。此时 `fn` 需要接收一个 `memo` 作为自己的第一个参数，而将会把 `applyPlugins` 的参数 `args` 来作为自己的第二个参数。`memo` 是前面一系列 hook 修改 `initialValue` 后的结果， `fn` 需要返回修改后的`memo` 。当 `key` 以 `'modify'` 开头且没有显式地声明 `type` 时，`applyPlugins` 会默认按此类型执行。
- `api.ApplyPluginsType.event` `applyPlugins` 将按照 hook 顺序来依次执行。此时不用传入 `initialValue` 。`fn` 不需要有返回值，并且将会把 `applyPlugins` 的参数 `args` 来作为自己的参数。当 `key` 以 `'on'` 开头且没有显式地声明 `type` 时，`applyPlugins` 会默认按此类型执行。

e.g.1 add 型
```ts
api.regiser({
  key: 'addFoo',
  // 同步
  fn: (args) => args
});

api.regiser({
  key: 'addFoo',
  // 异步
  fn: async (args) => args * 2
})

api.applyPlugins({
  key: 'addFoo',
  // key 是 add 型，不用显式声明为 api.ApplyPluginsType.add
  args: 1
}).then((data)=>{
  console.log(data); // [1,2]
})
```
e.g.2 modify 型
```ts
api.register({
  key: 'foo',
  fn: (memo, args) => ({ ...memo, a: args})
})
api.register({
  key: 'foo',
  fn: (memo) => ({...memo, b: 2})
})
api.applyPlugins({ 
  key: 'foo', 
  type: api.ApplyPluginsType.modify,
  // 必须有 initialValue
  initialValue: { 
    a: 0,
    b: 0
  },
  args: 1
}).then((data) => {
    console.log(data); // { a: 1, b: 2 }
});
```
