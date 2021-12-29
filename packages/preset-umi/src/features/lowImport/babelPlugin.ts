import * as Babel from '@umijs/bundler-utils/compiled/babel/core';
import {
  // @ts-ignore
  addDefault,
  // @ts-ignore
  addNamed,
  // @ts-ignore
  addNamespace,
} from '@umijs/bundler-utils/compiled/babel/helper-module-imports';
import * as t from '@umijs/bundler-utils/compiled/babel/types';
import { IOpts } from './lowImport';

interface IPluginOpts {
  opts: IOpts;
  css: string;
}

export default function () {
  return {
    visitor: {
      Identifier(
        path: Babel.NodePath<t.Identifier>,
        state: { opts: IPluginOpts; file: any },
      ) {
        const { name } = path.node;
        if (path.scope.hasBinding(path.node.name)) {
          return;
        }
        const parentNode = path.parentPath.node;
        if (
          t.isImportSpecifier(parentNode) ||
          t.isImportDefaultSpecifier(parentNode) ||
          t.isImportNamespaceSpecifier(parentNode)
        ) {
          return;
        }
        if (state.opts.opts.identifierToLib?.[name]) {
          path.replaceWith(
            addNamed(path, name, state.opts.opts.identifierToLib[name]),
          );
        } else if (state.opts.opts.defaultToLib?.[name]) {
          path.replaceWith(
            addDefault(path, state.opts.opts.defaultToLib[name], {
              nameHint: name,
            }),
          );
        } else if (state.opts.opts.namespaceToLib?.[name]) {
          path.replaceWith(
            addNamespace(path, state.opts.opts.namespaceToLib[name]),
          );
        }
        // import css
        if (name === 'styles' && state.opts.css) {
          const { filename } = state.file.opts;
          const cssFilename = filename
            .substring(filename.lastIndexOf('/') + 1)
            .replace(/\.\w+$/, '.' + state.opts.css);
          path.replaceWith(
            addDefault(path, './' + cssFilename, { nameHint: name }),
          );
        }
      },
      MemberExpression(
        path: Babel.NodePath<t.MemberExpression>,
        state: { opts: IPluginOpts },
      ) {
        const { object, property } = path.node as {
          object: t.Identifier;
          property: t.Identifier;
        };
        if (path.scope.hasBinding(object.name)) {
          return;
        }
        const parentNode = path.parentPath.node;
        if (
          t.isImportSpecifier(parentNode) ||
          t.isImportDefaultSpecifier(parentNode) ||
          t.isImportNamespaceSpecifier(parentNode)
        ) {
          return;
        }
        if (
          state.opts.opts.withObjs[object.name] &&
          (state.opts.opts.withObjs[object.name].members || []).includes(
            property.name,
          )
        ) {
          path.replaceWith(
            addNamed(
              path,
              property.name,
              state.opts.opts.withObjs[object.name].importFrom,
            ),
          );
        }
      },
    },
  };
}
