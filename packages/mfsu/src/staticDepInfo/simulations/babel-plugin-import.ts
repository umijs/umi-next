import type { ImportSpecifier } from '@umijs/bundler-utils/compiled/es-module-lexer';
import { logger, winPath } from '@umijs/utils';
import { join } from 'path';
import { getAliasedPathWithLoopDetect } from '../../babelPlugins/awaitImport/getAliasedPath';
import parseImport from '../importParser';
import type { Match } from '../staticDepInfo';

export default function createHandle(importOptions: {
  libraryName: string;
  libraryDirectory: string;
  style: boolean | string;
}) {
  const { libraryName, libraryDirectory } = importOptions;

  return function handleImports(opts: {
    rawCode: string;
    imports: ImportSpecifier[];
    mfName: string;
    alias: Record<string, string>;
    pathToVersion(p: string): string;
  }): Match[] {
    const { imports, rawCode } = opts;
    if (imports?.length > 0) {
      const version = opts.pathToVersion(libraryName);

      const importSnippets = imports
        .map(({ ss, se }) => {
          return rawCode.slice(ss, se + 1);
        })
        .join('\n');
      const retMatched: Match[] = [];

      const parsedImports = parseImport(importSnippets);
      const importedVariable = new Set<string>();

      for (const i of parsedImports) {
        i.imports.forEach((v) => {
          if (v === '*') {
            logger.error(
              `"import * as ant from 'antd'" or "export * from '${libraryName}'" are not allowed in mfsu#version=v4`,
            );
            logger.error(`solutions:`);
            logger.error(
              `  change to "import { Xxx } from '${libraryName}'" or`,
            );
            logger.error(
              `            "export { Xxx } from '${libraryName}'" syntax`,
            );
            logger.error(`  or use mfsu#version=v3 configuration`);

            throw Error(
              `"import * as ant from 'antd'" not allowed in mfsu#version=4`,
            );
          }
          importedVariable.add(v);
        });
      }

      const mfName = opts.mfName;

      for (const v of importedVariable.entries()) {
        const importVariableName = v[0];

        if (importVariableName === 'default') {
          const importBase = winPath(join(libraryName, libraryDirectory));
          const styleBase = winPath(
            join(libraryName, libraryDirectory, 'style'),
          );

          const componentPath = getAliasedPathWithLoopDetect({
            value: winPath(importBase),
            alias: opts.alias,
          });
          retMatched.push({
            isMatch: true,
            value: componentPath,
            replaceValue: `${mfName}/${componentPath}`,
            version,
          });

          const stylePath = getAliasedPathWithLoopDetect({
            value: winPath(styleBase),
            alias: opts.alias,
          });
          retMatched.push({
            isMatch: true,
            value: stylePath,
            replaceValue: `${mfName}/${stylePath}`,
            version,
          });

          continue;
        }

        const dashed = toDash(importVariableName);
        // fixme respect to config#antd

        const importBase = winPath(join(libraryName, libraryDirectory, dashed));
        const styleImportPath = winPath(
          join(libraryName, libraryDirectory, dashed, 'style'),
        );

        const componentPath = getAliasedPathWithLoopDetect({
          value: importBase,
          alias: opts.alias,
        });
        retMatched.push({
          isMatch: true,
          value: componentPath,
          replaceValue: `${mfName}/${componentPath}`,
          version,
        });

        const stylePath = getAliasedPathWithLoopDetect({
          value: styleImportPath,
          alias: opts.alias,
        });
        retMatched.push({
          isMatch: true,
          value: stylePath,
          replaceValue: `${mfName}/${stylePath}`,
          version,
        });
      }
      return retMatched;
    }
    return [];
  };
}

const capitalLettersReg = /([A-Z])/g;

// https://github.com/node4good/lodash-contrib/blob/91dded5d52f6dca50a4c74782740b02478c2c548/common-js/_.util.strings.js#L104
function toDash(string: string): string {
  string = string.replace(capitalLettersReg, function ($1) {
    return '-' + $1.toLowerCase();
  });
  // remove first dash
  return string.charAt(0) == '-' ? string.substr(1) : string;
}
