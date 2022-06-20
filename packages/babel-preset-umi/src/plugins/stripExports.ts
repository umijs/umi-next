import * as Babel from '@umijs/bundler-utils/compiled/babel/core';
import * as t from '@umijs/bundler-utils/compiled/babel/types';

export default (): Babel.PluginObj => {
  return {
    visitor: {
      Program: {
        enter(path, { opts }) {
          const expressions = path.get('body');
          const needStrip: any[] = [];

          expressions.forEach((exp) => {
            if (
              !(
                t.isExportNamedDeclaration(exp) ||
                t.isExportDefaultDeclaration(exp)
              )
            )
              return;

            needStrip.splice(
              needStrip.length,
              0,
              ...handleExportsIndividual(exp),
            );
            needStrip.splice(needStrip.length, 0, ...handleExportsList(exp));
            needStrip.splice(needStrip.length, 0, ...handleExportsDefault(exp));
          });

          needStrip.forEach((exp) => exp.remove());

          function handleExportsIndividual(path) {
            const needStrip = [];
            if (!t.isExportNamedDeclaration(path)) return needStrip;

            const declaration = path.get('declaration');
            if (!declaration.node) return needStrip;

            if (t.isVariableDeclaration(declaration)) {
              const variables = declaration.get('declarations');
              variables.forEach((variable) => {
                const namePath = variable.get('id.name');
                opts?.exports?.includes(namePath.node) &&
                  needStrip.push(variable);
              });
            } else {
              const namePath = declaration.get('id.name');
              opts?.exports?.includes(namePath.node) &&
                needStrip.push(declaration);
            }
            return needStrip;
          }

          function handleExportsList(path) {
            const needStrip = [];
            if (!t.isExportNamedDeclaration(path)) return needStrip;

            const specifiers = path.get('specifiers');
            if (!specifiers) return needStrip;

            specifiers.forEach((specifier) => {
              const namePath = specifier.get('exported.name');
              console.log('namePath', namePath, namePath.node);
              opts?.exports?.includes(namePath.node) &&
                needStrip.push(specifier);
            });

            return needStrip;
          }

          function handleExportsDefault(path) {
            const needStrip = [];
            if (!t.isExportDefaultDeclaration(path)) return needStrip;

            const declaration = path.get('declaration');
            if (!declaration.node) return needStrip;

            const namePath = declaration.get('name');
            opts?.exports?.includes(namePath.node) &&
              needStrip.push(declaration);
            return needStrip;
          }
        },
        exit(path) {
          console.log(path.scope);

          const unRefBindings = new Map();

          Object.entries(path.scope.bindings).forEach(([name, binding]) => {
            if (!binding.path.parentPath || binding.kind !== 'module') return;

            const source = binding.path.parentPath.get('source');
            const importName = source.node.value;

            if (!t.isStringLiteral(source)) return;

            const key = `${importName}(${
              source.node.loc && source.node.loc.start.line
            })`;

            if (!unRefBindings.has(key)) {
              unRefBindings.set(key, binding);
            }

            if (binding.referenced) {
              unRefBindings.set(key, null);
            } else {
              const nodeType = binding.path.node.type;
              if (nodeType === 'ImportSpecifier') {
                binding.path.remove();
              } else if (nodeType === 'ImportDefaultSpecifier') {
                binding.path.remove();
              } else if (nodeType === 'ImportNamespaceSpecifier') {
                binding.path.remove();
              } else if (binding.path.parentPath) {
                binding.path.parentPath.remove();
              }
            }
          });

          unRefBindings.forEach((binding) => {
            if (binding && binding.path.parentPath) {
              binding.path.parentPath.remove();
            }
          });
        },
      },
    },
  };
};
