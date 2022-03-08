import fs from 'fs';
import path from 'path';

const COMPILED_DIR = path.join(__dirname, '..', 'compiled');
const compiledConfig = require('../package.json');

// generate externalized type from sibling packages (such as @umijs/bundler-utils)
Object.entries<string>(compiledConfig.externals)
  .filter(
    ([name, target]) =>
      target.startsWith('@umijs/') &&
      compiledConfig.extraDtsExternals.includes(name),
  )
  .forEach(([name, target]) => {
    fs.writeFileSync(
      path.join(COMPILED_DIR, `${name}.d.ts`),
      `export * from '${target}';`,
      'utf-8',
    );
  });

// copy sourcemap for vite client scripts
fs.copyFileSync(
  require.resolve('vite/dist/client/client.mjs.map'),
  path.join(COMPILED_DIR, 'vite', 'client.mjs.map'),
);
fs.copyFileSync(
  require.resolve('vite/dist/client/env.mjs.map'),
  path.join(COMPILED_DIR, 'vite', 'env.mjs.map'),
);
