import { join } from 'path';
import { ENpmClient, ENpmRegistry } from '../type';

const pkgPath = join(__dirname, '../../package.json');

export const testData = {
  name: 'umi-plugin-demo',
  description: 'nothing',
  mail: 'xiaohuoni@gmail.com',
  author: 'xiaohuoni',
  org: 'umijs',
  version: require(pkgPath).version,
  npmClient: ENpmClient.pnpm,
  registry: ENpmRegistry.npm,
};
