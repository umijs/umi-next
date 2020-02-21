import { IApi } from 'umi';
import { join } from 'path';

export default (api: IApi) => {
  api.chainWebpack(webpackConfig => {
    webpackConfig.entry('mode-head').add(join(__dirname, `./mode.ts`));
    webpackConfig.entry('mode').add(join(__dirname, `./mode.ts`));
  })
  api.modifyHTML(($, { getAsset }) => {
    $('head').append(`<script src="${getAsset('mode-head')}"></script>`)
    $('body').append(`<script src="${getAsset('mode')}"></script>`)
  })
}
