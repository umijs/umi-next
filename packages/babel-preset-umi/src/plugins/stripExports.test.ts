import { transform } from '@umijs/bundler-utils/compiled/babel/core';

interface IOpts {
  code: string;
  filename?: string;
  opts?: { exports: string[] };
}

function doTransform(opts: IOpts): string {
  return transform(opts.code, {
    filename: opts.filename || 'foo.js',
    plugins: [[require.resolve('./stripExports.ts'), opts.opts || {}]],
  })!.code as string;
}

test('only replace core-js/', () => {
  const code = doTransform({
    code: `import a from 'a';
    import b from 'b';
    b;
    export function foo() { a; }`,
    opts: {
      exports: ['foo'],
    },
  });
  expect(code).toBe(`import b from 'b';\nb;`);
});
