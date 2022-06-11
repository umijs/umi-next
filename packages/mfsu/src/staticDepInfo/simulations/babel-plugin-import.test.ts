import { normalize as n } from 'path';
import handleImports from './babel-plugin-import';

function pathToVersion(): string {
  return '1.2.3';
}

test('babel-plugin-import: no imports', () => {
  expect(
    handleImports({
      imports: [],
      mfName: 'mf',
      alias: {},
      rawCode: '',
      pathToVersion,
    }),
  ).toEqual([]);
});

test('babel-plugin-import: with alias', () => {
  expect(
    handleImports({
      imports: [
        // prettier-ignore
        {n: "antd", s: 26, e: 30, ss: 0, se: 31, d: -1, a: -1},
      ],
      mfName: 'mf',
      alias: { antd: n('/project/node_modules/antd') },
      rawCode: 'import {Model, Row} from "antd";',
      pathToVersion,
    }),
  ).toEqual(
    // prettier-ignore
    [
        { replaceValue: `mf/${n('/project/node_modules/antd/es/model')}`,       value: n('/project/node_modules/antd/es/model'),       version: '1.2.3', isMatch: true,},
        { replaceValue: `mf/${n('/project/node_modules/antd/es/model/style')}`, value: n('/project/node_modules/antd/es/model/style'), version: '1.2.3', isMatch: true,},

        { replaceValue: `mf/${n('/project/node_modules/antd/es/row')}`,         value: n('/project/node_modules/antd/es/row'),         version: '1.2.3', isMatch: true,},
        { replaceValue: `mf/${n('/project/node_modules/antd/es/row/style')}`,   value: n('/project/node_modules/antd/es/row/style'),   version: '1.2.3', isMatch: true,},
    ],
  );
});

test('babel-plugin-import: 2 components import', () => {
  expect(
    handleImports({
      imports: [
        // prettier-ignore
        {n: "antd", s: 26, e: 30, ss: 0, se: 31, d: -1, a: -1},
      ],
      mfName: 'mf',
      alias: {},
      rawCode: 'import {Model, Row} from "antd";',
      pathToVersion,
    }),
  ).toEqual(
    // prettier-ignore
    [
            {replaceValue: `mf/${n('antd/es/model') }`,       value: n('antd/es/model'),       version: '1.2.3', isMatch: true,},
            {replaceValue: `mf/${n('antd/es/model/style') }`, value: n('antd/es/model/style'), version: '1.2.3', isMatch: true,},
            {replaceValue: `mf/${n('antd/es/row') }`,         value: n('antd/es/row'),         version: '1.2.3', isMatch: true,},
            {replaceValue: `mf/${n('antd/es/row/style') }`,   value: n('antd/es/row/style'),   version: '1.2.3', isMatch: true,},
        ],
  );
});

test('babel-plugin-import: default import', () => {
  expect(
    handleImports({
      imports: [
        // prettier-ignore
        {n: "antd", s: 18, e: 22, ss: 0, se: 23, d: -1, a: -1},
      ],
      mfName: 'mf',
      alias: {},
      rawCode: 'import antd from "antd";',
      pathToVersion,
    }),
  ).toEqual(
    // prettier-ignore
    [
            {replaceValue: 'mf/antd', value: 'antd', version: '1.2.3', isMatch: true,},
        ],
  );
});

test('babel-plugin-import: namespaces import', () => {
  expect(() =>
    handleImports({
      imports: [
        // prettier-ignore
        {n: "antd", s: 22, e: 26, ss: 0, se: 27, d: -1, a: -1},
      ],
      mfName: 'mf',
      alias: {},
      rawCode: 'import * as ant from "antd";',
      pathToVersion,
    }),
  ).toThrow();
});
