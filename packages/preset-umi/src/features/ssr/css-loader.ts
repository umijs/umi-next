import esbuild from '@umijs/bundler-utils/compiled/esbuild';
import { appendFileSync, readFileSync, unlinkSync } from 'fs';
import { IApi } from '../../types';
import { absServerBuildPath } from './utils';

// 打包完成后，除了 umi.server.js 外，如果项目中有引入样式资源，
// 还会生成 umi.server.css 文件，我们需要将这个文件写入到 umi.server.ts 中
// 将 css 写入 umi.server.js 后就可以把 css 构建产物删除了
function cssLoader(api: IApi): esbuild.Plugin {
  return {
    name: 'css-loader',
    setup(build) {
      build.onEnd((result) => {
        if (result.errors.length > 0) return;
        const css = readFileSync(
          absServerBuildPath(api).replace(/\.js$/, '.css'),
        );
        appendFileSync(
          absServerBuildPath(api),
          `
const SERVER_SIDE_STYLES = \`${css.toString()}\`;
`,
        );
        unlinkSync(absServerBuildPath(api).replace(/\.js$/, '.css'));
      });
    },
  };
}

export default cssLoader;
