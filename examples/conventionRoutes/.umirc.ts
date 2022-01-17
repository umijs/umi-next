import { defineConfig } from 'umi';

export default defineConfig({
  conventionRoutes: {
    excludes: [/model\.(j|t)sx?$/, /models\//],
  },
});
