import path from 'path';
import type { IConfigProcessor } from '.';
import copy from '../../../compiled/rollup-plugin-copy';
import visualizer from '../../../compiled/rollup-plugin-visualizer';

/**
 * transform umi configs to vite rollup options
 * @note  include configs:
 *        - externals
 *        - polyfill
 *        - analyze
 *        - copy
 */
export default (function rollup(userConfig) {
  console.log('userConfig------------rollup');
  console.log(userConfig);
  const config: ReturnType<IConfigProcessor> = {
    build: { rollupOptions: { plugins: [], output: {} } },
  };

  // TODO: handle externals
  // refer: https://github.com/vitejs/vite/issues/3001#issuecomment-836352935

  // handle polyfill
  if (Array.isArray(userConfig.polyfill?.imports)) {
    console.log('polyfill import -----------------');

    config.build!.rollupOptions!.plugins!.push(
      polyfill(userConfig.polyfill.imports),
    );
  }

  // handle analyze
  if (typeof userConfig.analyze === 'object' || process.env.ANALYZE) {
    console.log('analyze--------------');

    config.build!.rollupOptions!.plugins!.push(
      visualizer({
        open: true,
        json: userConfig.analyze.generateStatsFile,
        // TODO: other options transform, refer: https://umijs.org/config#analyze
      }),
    );
  }

  // handle copy
  if (Array.isArray(userConfig.copy)) {
    config.build!.rollupOptions!.plugins!.push(
      copy({
        targets: userConfig.copy.map((item) => {
          if (typeof item === 'string') {
            // umi copy support ['a.txt', 'b.txt'], need to transform
            return {
              src: item,
              dest: userConfig.outputPath || 'dist',
            };
          } else {
            // transform fields
            return {
              src: item.from,
              dest: path.dirname(item.to),
              rename: path.basename(item.to),
            };
          }
        }),
        hook: 'writeBundle',
      }),
    );
  }

  // handle hash
  if (userConfig.hash !== true) {
    // disable vite default hash filename
    // refer: https://github.com/vitejs/vite/blob/deb84c0b053b5c1e6a4162a224108d1d853dbb04/packages/vite/src/node/build.ts#L452
    Object.assign(config.build!.rollupOptions!.output, {
      entryFileNames: '[name].js',
      chunkFileNames: '[name].js',
      assetFileNames: '[name].[ext]',
    });
  }
  console.log('config-------------------');
  console.log(config);
  console.log('config.build?.rollupOptions?.output');
  console.log(config.build?.rollupOptions?.output);

  return config;
} as IConfigProcessor);
