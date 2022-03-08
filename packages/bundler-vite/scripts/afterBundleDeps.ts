import fs from 'fs';
import path from 'path';
import { compiledConfig } from '../package.json';

const COMPILED_DIR = path.join(__dirname, '..', 'compiled');

// generate externalized type from sibling packages (such as @umijs/bundler-utils)
Object.entries(compiledConfig.externals)
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
