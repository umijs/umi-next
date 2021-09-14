import { readdirSync, readFileSync, statSync } from 'fs';
import { extname, join } from 'path';
import { build } from './build';
import { CSSMinifier, JSMinifier } from './types';

interface IOpts {
  files: Record<string, string>;
}

const expects: Record<string, Function> = {
  alias({ files }: IOpts) {
    expect(files['index.js']).toContain(`var a = 'react';`);
  },
  'asset-avif'({ files }: IOpts) {
    expect(files['index.js']).toContain(`.avif"`);
  },
  'asset-fallback'({ files }: IOpts) {
    expect(files['index.js']).toContain(`.mp3"`);
  },
  'asset-image-large'({ files }: IOpts) {
    expect(files['index.js']).toContain(`.png"`);
  },
  'asset-image-small'({ files }: IOpts) {
    expect(files['index.js']).toContain(`"data:image/png;base64,`);
  },
  chainWebpack({ files }: IOpts) {
    expect(files['index.js']).toContain(`var a = 'react';`);
  },
  'css-modules'({ files }: IOpts) {
    expect(files['index.js']).toContain(`var a_module = ({"a":"`);
  },
  'css-modules-auto'({ files }: IOpts) {
    expect(files['index.js']).toContain(`var amodules = ({"a":"`);
  },
  'css-side-effects'({ files }: IOpts) {
    expect(files['index.css']).toContain(`color: red;`);
  },
  define({ files }: IOpts) {
    expect(files['index.js']).toContain(`console.log("1");`);
    expect(files['index.js']).toContain(`console.log("2");`);
    expect(files['index.js']).toContain(`console.log("3");`);
    expect(files['index.js']).toContain(`console.log("test");`);
  },
  externals({ files }: IOpts) {
    expect(files['index.js']).toContain(
      `var external_React_namespaceObject = React;`,
    );
  },
  json({ files }: IOpts) {
    expect(files['index.js']).toContain(
      `var react_namespaceObject = {"foo":"react"};`,
    );
  },
  'node-polyfill'({ files }: IOpts) {
    expect(files['index.js']).toContain(`exports.join = function() {`);
  },
  'postcss-autoprefixer'({ files }: IOpts) {
    expect(files['index.css']).toContain(
      `.a { display: -ms-flexbox; display: flex; }`,
    );
  },
  'postcss-extra-postcss-plugins'({ files }: IOpts) {
    expect(files['index.css']).toContain(`-webkit-overflow-scrolling: touch;`);
  },
  'postcss-flexbugs-fixes'({ files }: IOpts) {
    expect(files['index.css']).toContain(`.foo { flex: 1 1; }`);
  },
  svg({ files }: IOpts) {
    expect(files['index.js']).toContain(`.svg"`);
  },
  targets({ files }: IOpts) {
    expect(files['index.js']).toContain(`var foo = 'foo';`);
  },
  theme({ files }: IOpts) {
    expect(files['index.css']).toContain(`color: green;`);
  },
};

const fixtures = join(__dirname, 'fixtures');
for (const fixture of readdirSync(fixtures)) {
  if (fixture.startsWith('.')) continue;
  const base = join(fixtures, fixture);
  if (statSync(base).isFile()) continue;
  if (fixture.startsWith('x-')) continue;

  test(`build ${fixture}`, async () => {
    let config: Record<string, any> = {};
    try {
      config = require(join(base, 'config.ts')).default;
    } catch (e) {}
    await build({
      config: {
        ...config,
        jsMinifier: JSMinifier.none,
        cssMinifier: CSSMinifier.none,
      },
      cwd: base,
      entry: {
        index: join(base, 'index.ts'),
      },
    });
    const fileNames = readdirSync(join(base, 'dist'));
    const files = fileNames.reduce<Record<string, string>>((memo, fileName) => {
      if (['.css', '.js'].includes(extname(fileName))) {
        memo[fileName] = readFileSync(join(base, 'dist', fileName), 'utf-8');
      } else {
        memo[fileName] = '1';
      }
      return memo;
    }, {});
    expects[fixture]({
      files,
    });
  });
}
