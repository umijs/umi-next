import esbuild from '../../compiled/esbuild';

// 临时文件中，绝对路径会带有 @fs 前缀，透过这个 esbuild 插件来忽略这个前缀
function IgnorePathPrefixPlugin(): esbuild.Plugin {
  return {
    name: 'ignore-path-prefix',
    setup(build: any) {
      build.onResolve({ filter: /^@fs/ }, (args: any) => ({
        path: args.path.replace(/^@fs/, ''),
      }));
    },
  };
}

export default IgnorePathPrefixPlugin;
