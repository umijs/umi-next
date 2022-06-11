import type { ImportSpecifier } from '@umijs/bundler-utils/compiled/es-module-lexer';
import { logger } from '@umijs/utils';
import { join } from 'path';
import { getAliasedPathWithLoopDetect } from '../../babelPlugins/awaitImport/getAliasedPath';
import parseImport from '../importParser';
import type { Match } from '../staticDepInfo';

export default function handleImports(opts: {
  rawCode: string;
  imports: ImportSpecifier[];
  mfName: string;
  alias: Record<string, string>;
  pathToVersion(p: string): string;
}): Match[] {
  const { imports, rawCode } = opts;
  if (imports?.length > 0) {
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
            `"import * as ant from 'antd'" or "export * from 'antd'" are not allowed in mfsu#version=v4`,
          );
          logger.error(`solutions:`);
          logger.error(`  change to "import { Xxx } from 'antd'" or`);
          logger.error(`            "export { Xxx } from 'antd'" syntax`);
          logger.error(`  or use mfsu#version=v3 configuration`);

          throw Error(
            `"import * as ant from 'antd'" not allowed in mfsu#version=4`,
          );
        }
        importedVariable.add(v);
      });
    }

    const mfName = opts.mfName;
    const base = 'antd';
    for (const v of importedVariable.entries()) {
      const importVariableName = v[0];

      if (importVariableName === 'default') {
        const componentPath = getAliasedPathWithLoopDetect({
          value: base,
          alias: opts.alias,
        });
        const version = opts.pathToVersion(componentPath);
        retMatched.push({
          isMatch: true,
          value: componentPath,
          replaceValue: `${mfName}/${componentPath}`,
          version,
        });
        continue;
      }

      const dashed = toDash(importVariableName);
      // fixme respect to config#antd
      const importBase = join(base, 'es', dashed);
      const componentPath = getAliasedPathWithLoopDetect({
        value: importBase,
        alias: opts.alias,
      });
      const styleImportPath = join(componentPath, 'style');

      const version = opts.pathToVersion(componentPath);

      retMatched.push({
        isMatch: true,
        value: componentPath,
        replaceValue: `${mfName}/${componentPath}`,
        version,
      });
      retMatched.push({
        isMatch: true,
        value: styleImportPath,
        replaceValue: `${mfName}/${styleImportPath}`,
        version,
      });
    }
    return retMatched;
  }
  return [];
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
