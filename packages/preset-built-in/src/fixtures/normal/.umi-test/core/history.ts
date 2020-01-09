import { createMemoryHistory, createHashHistory, createBrowserHistory } from '/Users/jcl/github/umi/umi-next/packages/runtime/dist/index.js';

const userOptions = {};
const history = createBrowserHistory({
  basename: window.basename,
  ...userOptions,
});
export { history };
