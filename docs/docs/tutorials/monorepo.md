import { Message } from 'umi';

# Monorepo 指南

当你需要在一个大仓内管理多个项目，或有拆解、解耦子包的需求时，你可能需要使用 monorepo 来管理项目。

本文将介绍如何使用 umi 提供的快捷能力，从零快速搭建一个 monorepo 项目，并讲解一些经验谈。

## 创建 monorepo

执行以下命令，在当前目录 `./project` 位置创建一个新的 monorepo 项目：

```bash
  pnpx create-umi@next project --monorepo
```

选择 `Init monorepo` ：

```bash
? Pick monorepo command › - Use arrow-keys. Return to submit.
❯ Init monorepo ( monorepo basic )
  Init monorepo shared ( simple lib boilerplate )
  Migration ( init monorepo and move current project to 'apps/*' )
```

### 文件结构

```bash
./project
  ├── apps/web
  ├── packages/shared
  ├── ...
  └── pnpm-workspace.yaml # 
```

默认为你准备了一个基于 umi 的应用 `apps/web` 和解耦的组件子包 `packages/shared` 作为示例。

## 扩大 monorepo

### 新项目

当你需要接入新项目时，根据项目类型的不同，你可以自行决定他们应该放到哪个文件夹下。

这里给出两个实例演示。

#### 创建新 umijs 项目

与 [快速上手](./getting-started) 章节中描述的一致，你只需在目标位置初始化一个新的 umi 项目即可，如：

```bash
  pnpx create-umi@next apps/docs
```

此命令将在 `apps/docs` 创建一个名为 `docs` 的新 umi 项目

#### 创建新 shared lib

umi 支持通过 `Init monorepo shared` 功能来快速创建一个分享代码的子包。

```bash
  pnpx create-umi@next packages/ui --monorepo
```

```bash
? Pick monorepo command › - Use arrow-keys. Return to submit.
  Init monorepo ( monorepo basic )
❯ Init monorepo shared ( simple lib boilerplate )
  Migration ( init monorepo and move current project to 'apps/*' )
```

之后你将在 `packages/ui` 得到一个简单的子包模板项目。

## 运作 monorepo

### 构建流

umi 创建的 monorepo 项目默认自带了 `turbo` 构建工具来支持各个子包的最佳构建行为。

通过内置的 `umi monorepo <command>` 命令，可以快速构建一个指定的子包：

```bash
  # 构建 apps/web 项目，这里 scope 的值需要与对应的 package.json#name 一致
  umi monorepo build --scope=web
```

<Message emoji="🚀" type='success'>
在构建过程中，`turbo` 会自下而上的自动寻找最佳的构建路径，不会有冗余的构建。
</Message>

#### 更定制的构建流

当你需要更定制的构建行为时，你可以：

1. 通过查看 <a href="https://turborepo.org/docs" target="_blank">turbo</a> 文档来获取更多可用的选项、相关配置的打开方式

2. 通过编写构建脚本来定制相关行为

### 发布流

当你有发布 monorepo 中子包的需求时，除了可以在子包内使用 `npm publish` 进行发布以外，还可以使用 <a href="https://github.com/changesets/changesets" target="_blank">changesets</a> 来进行大批量的包管理和发布。

有关 changesets 的概念繁多，这里不做进一步展开。

## 优化 monorepo

### 依赖重定向

在 monorepo 的子项目开发中，若你进行了工具、组件等代码的抽取、解耦。你可能会遇到两个问题。

#### 实时热更新

在改动抽离的其他子包代码时，当前项目不能实现热更新。

你可以通过在当前项目配置 `monorepoRedirect` 选项来解决：

```ts
// .umirc.ts
export default {
  // 开启重定向：到子包的 src 目录加载原代码，而不是加载产物
  monorepoRedirect: {}
};
```

通过查看 `monorepoRedirect` 选项的[说明](../api/config#monoreporedirect)，配置更多重定向的方法。

#### 组件多实例

与安装 npm 上的包只会安装对应的 `dependencies` 依赖不同，在 monorepo 中直接引用子包代码时，子包由于存在 `devDependencies` 的影响，可能会产生子包加载的依赖与当前项目加载的依赖并非同一实例的问题（如多组件实例、弹出消息不成队列、react 多 hooks 崩溃问题等）。

对此 umi 提供了自动重定位对应子包的 `peerDependencies` 依赖来解决：

```ts
// .umirc.ts
export default {
  // 引用子包 peerDependencies 中的依赖会重定位到当前项目中
  monorepoRedirect: { peerDeps: true }
};
```

你只需将需要重定位的依赖配置入子包的 `peerDependencies` 即可。

<Message>
① 你也可以通过将依赖都提升至全局来保持实例的一致性，但这可能对该子包在 npm 发包产生影响。 \
② pnpm v6.20 以后，支持通过 `dependenciesMeta` 来模拟 npm 式的第三方包安装行为，选择此解法需要增加额外的配置，详情参见对应 <a href="https://pnpm.io/package_json#dependenciesmeta" target="_blank">文档</a> 说明。
</Message>

### 提升全局依赖

当你的子包逐渐增多，monorepo 变大时，你可以人为的将子包中的依赖提升到全局（删去子包中的该依赖，然后在全局根目录安装）。

比如将 `apps/web` 中的 `lodash` 放至全局：

```bash
  # in `${root}/apps/web`
  pnpm remove lodash
  # in ${root}
  pnpm add -DW lodash
```

这可以做到减少冗余的依赖，统一管理版本等。

### 缩减配置

umi 不会强约束你应该怎么管理配置，因为你可能有各种各样不同的项目。

当你的配置变多时，你可以选择性的通过抽取、继承等方式来缩减配置，一个继承 `tsconfig.json` 的示例如下：

1. 在 monorepo 项目根目录创建 `tsconfig.base.json`：

    ```json
    // tsconfig.base.json
    {
      "compilerOptions": {
        "target": "esnext",
        "module": "esnext",
        "moduleResolution": "node",
        "importHelpers": true,
        "jsx": "react",
        "esModuleInterop": true,
        "sourceMap": true,
        "strict": true,
        "allowSyntheticDefaultImports": true
      }
    }
    ```

2. 在 `apps/web` 中修改 `tsconfig.json` 为：

    ```json
    {
      "extends": "../../tsconfig.base.json",
      "compilerOptions": {
        "baseUrl": ".",
        "paths": {
          "@/*": ["*"],
          "@@/*": [".umi/*"]
        },
      }
    }
    ```

### 规范化

在设计 monorepo 时，若你的规范足够统一，可以将 `eslint` 等依赖安装至根目录作为全局依赖，在根目录配置 `.eslintrc.js` ，由此来减少每个子包依赖、配置的冗余成本。

## 迁移 monorepo

### 从独立项目迁移

umi 支持将单项目改造成 monorepo 的形式：

```bash
  pnpx create-umi@next project --monorepo
```

选择 `Migration` ：

```bash
? Pick monorepo command › - Use arrow-keys. Return to submit.
  Init monorepo ( monorepo basic )
  Init monorepo shared ( simple lib boilerplate )
❯ Migration ( init monorepo and move current project to 'apps/*' )
```

此行为是 **不可逆** 的（操作前请做好备份），以上命令将在 `./project` 生成一个全新的 monorepo，并将当前项目移至 `apps/*` 下作为一个子包。

不是所有的独立项目都可以迁移 monorepo ，在进行迁移前，你需要进行一些评估，以下是不推荐迁移的场景：

<Message type='warning'>
① 原来的项目就是 monorepo \
② 需要保留 git history (可实验性尝试 `lerna import`) \
③ 用不到 monorepo 的功能（如不需要、很少解耦，只有单项目的场景）
</Message>
