import { Mustache } from '@umijs/utils';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { IApi } from 'umi';

interface IDayJsOpts {
  preset?: string; // 'antd' | 'antdv3'
  plugins?: string[];
  replaceMoment?: boolean;
}

interface IAntdOpts {
  dark?: boolean;
  compact?: boolean;
  dayjs?: boolean | IDayJsOpts;
}

const presets = {
  antd: {
    plugins: [
      'isSameOrBefore',
      'isSameOrAfter',
      'advancedFormat',
      'customParseFormat',
      'weekday',
      'weekYear',
      'weekOfYear',
      'isMoment',
      'localeData',
      'localizedFormat',
    ],
    replaceMoment: true,
  },
  antdv3: {
    plugins: [
      'isSameOrBefore',
      'isSameOrAfter',
      'advancedFormat',
      'customParseFormat',
      'weekday',
      'weekYear',
      'weekOfYear',
      'isMoment',
      'localeData',
      'localizedFormat',
      'badMutable',
    ],
    replaceMoment: true,
  },
} as any;

const getConfig = (api: IApi) => {
  let {
    preset = 'antd',
    plugins,
    replaceMoment,
  } = api.userConfig.antdDayjs || {};

  if (preset && presets[preset]) {
    plugins = presets[preset].plugins;
    replaceMoment = presets[preset].replaceMoment;
  }
  if (plugins) plugins = plugins;
  if (replaceMoment !== undefined) replaceMoment = replaceMoment;
  return {
    plugins,
    replaceMoment,
  };
};

export default (api: IApi) => {
  const opts: IAntdOpts = api.userConfig.antd;

  api.describe({
    config: {
      schema(Joi) {
        return Joi.object({
          dark: Joi.boolean(),
          compact: Joi.boolean(),
          dayjs: Joi.alternatives(
            Joi.boolean(),
            Joi.object({
              preset: Joi.string(), // 'antd' | 'antdv3'
              plugins: Joi.array(),
              replaceMoment: Joi.boolean(),
            }),
          ),
        });
      },
    },
  });

  // antd import
  api.chainWebpack((memo) => {
    memo.resolve.alias.set(
      'antd',
      dirname(require.resolve('antd/package.json')),
    );
    if (opts.dayjs !== false) {
      const { replaceMoment } = getConfig(api);
      if (replaceMoment) {
        memo.resolve.alias.set(
          'moment',
          dirname(require.resolve('dayjs/package.json')),
        );
      }
    }
    return memo;
  });
  // dark mode
  // compat mode
  if (opts?.dark || opts?.compact) {
    // support dark mode, user use antd 4 by default
    const { getThemeVariables } = require('antd/dist/theme');
    api.modifyDefaultConfig((config) => {
      config.theme = {
        ...getThemeVariables(opts),
        ...config.theme,
      };
      return config;
    });
  }
  // dayjs (by default?)
  if (opts.dayjs !== false) {
    api.onGenerateFiles({
      fn: () => {
        const { plugins } = getConfig(api);

        const runtimeTpl = readFileSync(
          join(__dirname, '../templates/antd/dayjs.tpl'),
          'utf-8',
        );
        api.writeTmpFile({
          path: 'plugin-antd/dayjs.tsx',
          content: Mustache.render(runtimeTpl, {
            plugins,
            dayjsPath: dirname(require.resolve('dayjs/package.json')),
          }),
        });
      },
    });
    api.addEntryCodeAhead(() => {
      return [`import './plugin-antd/dayjs.tsx'`];
    });
  }
  // babel-plugin-import
  api.addExtraBabelPlugins(() => {
    return [
      require.resolve('babel-plugin-import'),
      {
        libraryName: 'antd',
        libraryDirectory: 'es',
        style: true,
      },
    ];
  });
  // antd config provider (HOLD, depends on umi)
};
