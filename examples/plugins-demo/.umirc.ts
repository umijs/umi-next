export default {
  mfsu: {
    esbuild: false,
  },
  plugins: ['@umijs/plugins/src/antd'],
  // externals: {
  //   react: 'React',
  //   'react-dom': 'ReactDOM',
  // },
  antd: {
    external: true,
  },
};
