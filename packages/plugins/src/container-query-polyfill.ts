import { IApi } from 'umi';

export default (api: IApi) => {
  api.describe({ key: 'container-query-polyfill' });

  /** https://www.skypack.dev/view/container-query-polyfill */
  api.addHTMLHeadScripts(() => [
    `
// Support Test
const supportsContainerQueries = "container" in document.documentElement.style;

// Conditional Import
if (!supportsContainerQueries) {
  import("https://cdn.skypack.dev/container-query-polyfill");
}
`,
  ]);
};
