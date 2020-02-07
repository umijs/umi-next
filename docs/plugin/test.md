# 插件测试

## 为什么要测试？

Umi 3 我们采用微内核的架构，大部分功能以插件的形式加载，这意味着**插件质量**很大程度决定了 Umi 功能稳定性。

当插件有良好的测试用例，能带给很多保障：

1. 功能迭代、持续集成
2. 更详细的用法
3. 利于代码重构
4. ...

那么 Umi 插件的测试包括：

- 单元测试（必选）
- E2E（可选）
- 基准测试（可选）

## 测试框架

我们提供 `@umijs/test` 来运行测试脚本，内置 `jest` 测试框架。（注：建议 Node.js 版本 ≥ 10）

只需要在 `package.json` 上配置好 `scripts` 即可：

```json
// package.json
{
  "scripts": {
    "test": "umi-test"
  },
  "devDependencies": {
    "@types/jest": "^25.1.2",
    "@umijs/test": "^3.0.0-beta.1"
  }
}
```

然后在 `src` 目录下新建一个 `bar.test.ts` ，写上一句测试用例：

```js
test('hello', () => {
  expect(1 + 1).toEqual(2);
});
```

运行 `yarn test` ，恭喜你

```bash
➜ yarn test
yarn run v1.21.1
$ umi-test
  PASS  src/bar.test.ts
  ✓ hello (3ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        1.139s, estimated 2s
Ran all test suites.
✨  Done in 2.11s.
```

如果你喜欢 TDD（测试驱动开发），可以使用 `yarn test -w` 监听，更多用法见。

如果涉及到 UI 相关的测试，推荐使用 @testing-library/react

## 测试约定

目录规范

```bash
.
├── example # 可用于 E2E 测试，一个完整的 umi 项目
├── package.json
├── src
│   ├── fixtures # 适用于插件单测的 umi 项目集
│   │   └── normal
│   │       └── pages
│   ├── index.test.ts # 插件运行测试用例
│   ├── index.ts
│   ├── utils.test.ts # 一般的单测
│   └── utils.ts
├── tsconfig.json
├── .fatherrc.ts
└── yarn.lock
```

用于测试的 umi 项目配置 `src/fixtures/.umirc.ts`

```js
import { IConfig } from '@umijs/types';

export default {
  history: 'memory',
  mountElementId: '',
  routes: [
    { path: '/', component: './index' },
  ],
  // 加载需要测试的插件
  plugins: ['../src/index.ts'],
} as IConfig;
```

<details>
  <summary>jest 配置模块映射</summary>

~~为了保持测试项目与真实 umi 项目一致性，我们需要将一些模块路径做映射，有 bug，没跑通：~~

```js
// jest.config.js
module.exports = {
  moduleNameMapper: {
    // 确保 import {} from 'umi' 正常 work
    '^@@/core/umiExports$':
      '<rootDir>/src/fixtures/.umi-test/core/umiExports.ts',
  },
};
```

</details>

## 准备单元测试

我们以 `umi-plugin-utils` 插件为例，循序渐进地学习 Umi 插件测试。

### 插件功能

该插件提供一系列 utils 常用工具类，插件加载后，可以方便从 `umi` 导出我们插件定义的方法：

```js
// src/fixtures/pages/index.tsx
// 真实使用：import { getUsername } from 'umi';
// TODO: jest moduleNameMapper 映射 @@/core/umiExports 有 bug
import { getUserName } from '../.umi-test/plugin-utils/utils';

export default () => <h1>{getUsername('Hello World')}</h1>;
```

### 编写测试用例

这里我们可以从 `umi` 里创建一个 `Service` 对象。(`@umijs/core` 的 `Service` 不内置插件)

然后用 `@testing-library/react` 组件渲染库来渲染出我们的组件。

```jsx
// src/index.test.ts
import { join } from 'path';
import { Service } from 'umi';
import { render } from '@testing-library/react';

const fixtures = join(__dirname, './fixtures');

test('normal', async () => {
  const cwd = join(fixtures, 'normal');
  const service = new Service({
    cwd,
    plugins: [require.resolve('./')],
  });
  // 用于产生临时文件
  await service.run({
    name: 'g',
    args: {
      _: ['g', 'tmp'],
    },
  });

  const reactNode = require(join(cwd, '.umi-test', 'umi.ts')).default;
  const { container } = render(reactNode);
  expect(container.textContent).toEqual('Hello World');
});
```

> 这里我们约定测试用例使用 test 书写单测，不推荐使用 `describe` + `it` 测试用例嵌套。

### 运行

`yarn test` 来跑下我们的测试用例

```bash
yarn run v1.21.1
$ umi-test
  PASS  src/index.test.ts
  ✓ test getUserName export (760ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        3.55s, estimated 4s
Ran all test suites.
✨  Done in 4.58s.
```

🎉 恭喜你，写完了 Umi 插件单元测试！

## E2E 测试

TODO

## 示例代码

完整实例代码可参照：

- [ycjcl868/umi3-plugin-test](https://www.notion.so/ycjcl868/e67c8980e957454eb2f1b0fe83ebd38d)
- [@umijs/plugin-locale](https://github.com/umijs/plugins/tree/master/packages/plugin-locale) 国际化插件
- [@umijs/plugin-dva](https://github.com/umijs/plugins/tree/master/packages/plugin-dva) dva 插件

## TODO

- Umi UI 插件测试方案
