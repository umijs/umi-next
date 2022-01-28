export default {
  srcTranspiler: 'swc',
  targets: {
    // chrome 53 is last not support async version
    // https://caniuse.com/async-functions
    chrome: 54,
  },
};
