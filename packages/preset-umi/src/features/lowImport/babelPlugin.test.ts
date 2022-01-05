import { transform } from '@umijs/bundler-utils/compiled/babel/core';

interface IOpts {
  code: string;
  filename?: string;
  opts?: any;
  css?: string;
  components?: Map<string, string>;
}

function doTransform(opts: IOpts): string {
  return transform(opts.code, {
    filename: opts.filename || 'foo.js',
    plugins: [
      [
        require.resolve('./babelPlugin.ts'),
        {
          opts: opts.opts.opts,
          css: opts.css || 'less',
          components: opts.components,
        },
      ],
    ],
  })!.code as string;
}

test('import', () => {
  expect(
    doTransform({
      code: `Button;`,
      opts: {
        opts: {
          identifierToLib: { Button: 'antd' },
        },
      },
    }),
  ).toEqual(`import { Button as _Button } from "antd";\n_Button;`);
});

// FIXME: one import for one identifier
test('multiple imports', () => {
  expect(
    doTransform({
      code: `Button;Button;`,
      opts: {
        opts: {
          identifierToLib: { Button: 'antd' },
        },
      },
    }),
  ).toEqual(
    `import { Button as _Button2 } from "antd";\nimport { Button as _Button } from "antd";\n_Button;\n_Button2;`,
  );
});

test('import default', () => {
  expect(
    doTransform({
      code: `Foo;`,
      opts: {
        opts: {
          defaultToLib: { Foo: '@/components/Foo' },
        },
      },
    }),
  ).toEqual(`import _Foo from "@/components/Foo";\n_Foo;`);
});

test('import with objs', () => {
  expect(
    doTransform({
      code: `techui.QrCode;`,
      opts: {
        opts: {
          withObjs: { techui: { importFrom: 'techui', members: ['QrCode'] } },
        },
      },
    }),
  ).toEqual(`import { QrCode as _QrCode } from "techui";\n_QrCode;`);
});

test('import do not support member expression', () => {
  expect(
    doTransform({
      code: `a.Button;`,
      opts: {
        opts: {
          identifierToLib: { Button: 'antd' },
        },
      },
    }),
  ).toEqual(`a.Button;`);
});

test('import do not support object property', () => {
  expect(
    doTransform({
      code: `const a = { Button: 1 };`,
      opts: {
        opts: {
          identifierToLib: { Button: 'antd' },
        },
      },
    }),
  ).toEqual(`const a = {\n  Button: 1\n};`);
});

test('import styles', () => {
  expect(
    doTransform({
      code: `styles.btn;`,
      opts: {
        opts: { withObjs: {} },
      },
      filename: 'index.tsx',
    }),
  ).toEqual(`import _styles from "./index.less";\n_styles.btn;`);
});

test('import styles css', () => {
  expect(
    doTransform({
      code: `styles.btn`,
      opts: {
        opts: { withObjs: {} },
      },
      filename: 'index.tsx',
      css: 'css',
    }),
  ).toEqual(`import _styles from "./index.css";\n_styles.btn;`);
});

test('import components', () => {
  const components = new Map<string, string>();
  components.set('MyComponent', './MyComponent');
  expect(
    doTransform({
      code: 'components.MyComponent',
      opts: { opts: { withObjs: {} } },
      components,
    }),
  ).toEqual(`import _MyComponent from "./MyComponent";\n_MyComponent;`);
});
