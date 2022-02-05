import 'zx/globals';
(async () => {
  $`pnpm --filter ./packages/plugin-docs build:extra`;
  $`umi dev`;
})();
