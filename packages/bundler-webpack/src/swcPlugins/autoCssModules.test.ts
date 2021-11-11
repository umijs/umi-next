import { transformSync } from '@swc/core';
import AutoCSSModule from './autoCSSModules';

interface IOpts {
  code: string;
  filename?: string;
  opts?: any;
}

function doTransform(opts: IOpts): string {
  return transformSync(opts.code, {
    filename: opts.filename || 'foo.js',
    jsc: {
      parser: {
        syntax: 'ecmascript',
        jsx: false,
        topLevelAwait: true,
      },
      target: 'es2017',
      loose: false,
      minify: {
        compress: false,
        mangle: false,
      },
    },
    module: {
      type: 'es6',
    },
    minify: false,
    isModule: true,
    plugin: (m) => new AutoCSSModule().visitProgram(m),
  })!.code.trim() as string;
}

test('css modules', () => {
  expect(doTransform({ code: `import styles from 'a.css';` })).toEqual(
    `import styles from 'a.css?modules';`,
  );
  expect(doTransform({ code: `import styles from 'a.less';` })).toEqual(
    `import styles from 'a.less?modules';`,
  );
  expect(doTransform({ code: `import styles from 'a.scss';` })).toEqual(
    `import styles from 'a.scss?modules';`,
  );
  expect(doTransform({ code: `import styles from 'a.sass';` })).toEqual(
    `import styles from 'a.sass?modules';`,
  );
  expect(doTransform({ code: `import styles from 'a.stylus';` })).toEqual(
    `import styles from 'a.stylus?modules';`,
  );
  expect(doTransform({ code: `import styles from 'a.styl';` })).toEqual(
    `import styles from 'a.styl?modules';`,
  );
});

test('css with top level await', () => {
  expect(
    doTransform({ code: `const styles = await import('a.css');` }),
  ).toEqual(`const styles = await import('a.css?modules');`);
  expect(doTransform({ code: `await import('a.css');` })).toEqual(
    `await import('a.css');`,
  );
});

test('none css with top level await', () => {
  expect(doTransform({ code: `const styles = await import('a');` })).toEqual(
    `const styles = await import('a');`,
  );
  expect(doTransform({ code: `await import('a');` })).toEqual(
    `await import('a');`,
  );
});

test('no css modules', () => {
  expect(doTransform({ code: `import 'a.css';` })).toEqual(`import 'a.css';`);
});

test('do not infect non css imports', () => {
  expect(doTransform({ code: `import a from 'a';` })).toEqual(
    `import a from 'a';`,
  );
  expect(doTransform({ code: `import a from 'a.js';` })).toEqual(
    `import a from 'a.js';`,
  );
  expect(doTransform({ code: `import 'a';` })).toEqual(`import 'a';`);
});
