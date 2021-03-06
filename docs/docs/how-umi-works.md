---
translateHelp: true
---

# How Umi Works


写写 Umi 背后的思考和重要概念。

## 技术收敛

<img src="https://img.alicdn.com/tfs/TB1hE8ywrr1gK0jSZFDXXb9yVXa-1227-620.png" width="600">

这张图是给内部框架 Bigfish 画的，套到 Umi 上同样合适。他把大家常用的技术栈进行整理，收敛到一起，让大家只用 Umi 就可以完整 80% 的日常工作。

## 插件和插件集

<img src="https://img.alicdn.com/tfs/TB1mrhuwqL7gK0jSZFBXXXZZpXa-956-728.png" width="400">

Umi 支持插件和插件集，通过这张图应该很好理解到他们的关系，通过插件集我们把插件收敛依赖然后支持不同的业务类型。

## 配置式路由和约定式路由

Umi 的路由既支持配置式，又支持约定式。配置式是对于现实的低头，也是大部分用户在用的，因为他功能强大；约定式是我们希望走去的方向，因为他简洁优雅。

## .umi 临时文件

.umi 临时目录是整个 Umi 项目的发动机，你的入口文件、路由等等都在这里，这些是由 umi 内部插件及三方插件生成的。

你通常会在 .umi 下看到以下目录，

```bash
+ .umi
  + core     # 内部插件生成
  + pluginA  # 外部插件生成
  + presetB  # 外部插件生成
  + umi.ts   # 入口文件
```

临时文件是 Umi 框架中非常重要的一部分，框架或插件会根据你的代码生成临时文件，这些原来需要放在项目里的脏乱差的部分都被藏在了这里。

你可以在这里调试代码，但不要在 .git 仓库里提交他，因为他的临时性，每次启动 umi 时都会被删除并重新生成。
