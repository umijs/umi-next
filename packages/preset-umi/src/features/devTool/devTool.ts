import { serveUmiApp } from '@umijs/utils';
import { join } from 'path';
import { IApi } from '../../types';

const devToolAppDist = join(__dirname, '../../../devToolAppDist');

export default (api: IApi) => {
  api.addBeforeMiddlewares(() => {
    if (process.env.DEVTOOL_LOCAL) {
      return [
        {
          path: '/__umi/api/:item',
          handler: (req, res) => {
            const { item } = req.params;
            if (item === 'config') {
              return res.json(api.config);
            }
            if (item === 'app-data') {
              return res.json(api.appData);
            }
            res.json({});
          },
        },
        {
          path: '/__umi',
          handler: serveUmiApp(devToolAppDist),
        },
      ];
    } else {
      return [];
    }
  });
};
