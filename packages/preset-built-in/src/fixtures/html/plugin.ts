import { IApi } from 'umi';
import { join } from 'path';

export default (api: IApi) => {
  api.chainWebpack(webpackConfig => {
    webpackConfig.entry('mode-head').add(join(__dirname, `./mode.ts`));
    webpackConfig.entry('mode').add(join(__dirname, `./mode.ts`));
  })
  api.modifyHTML(($, { getAsset, route }) => {
    $('head').append(`<script src="${getAsset({ file: 'mode-head', path: route.path })}"></script>`)
    $('body').append(`<script src="${getAsset({ file: 'mode', path: route.path })}"></script>`)
  })
}
