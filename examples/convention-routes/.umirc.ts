import { defineConfig } from 'umi';

export default defineConfig({
  conventionRoutes: {
    exclude: [/model\.(j|t)sx?$/, /models\//],
  },
});
