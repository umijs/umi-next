import * as traverse from '@umijs/bundler-utils/compiled/babel/traverse';
import * as t from '@umijs/bundler-utils/compiled/babel/types';

export function setConfigByName(ast: t.File, name: string, value: any) {
  traverse.default(ast, {
    ObjectProperty(path) {
      //@ts-ignore
      if (path.node.key?.name === name) {
        switch (path.node.value.type) {
          case 'ObjectExpression':
            const valueObj =
              typeof value === 'string' ? JSON.parse(value) : value;
            const valueObjs = [] as t.ObjectProperty[];
            Object.keys(valueObj).forEach((key) => {
              valueObjs.push(
                t.objectProperty(
                  t.identifier(key),
                  t.stringLiteral(valueObj[key]),
                ),
              );
            });
            path.node.value = t.objectExpression(valueObjs);
            break;
          case 'ArrayExpression':
            const valueArr =
              typeof value === 'string' ? JSON.parse(value) : value;
            path.node.value = t.arrayExpression(
              valueArr.map((i: string) => {
                return t.stringLiteral(i);
              }),
            );
            break;
          case 'BooleanLiteral':
            path.node.value = t.booleanLiteral(value);
            break;
          case 'NumericLiteral':
            path.node.value = t.numericLiteral(value);
            break;
          default:
            console.log(`${path.node.value.type} is not supported.`);
            break;
        }
      }
    },
  });
  return ast;
}
