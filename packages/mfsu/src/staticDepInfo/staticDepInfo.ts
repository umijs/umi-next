import { init, parse } from '@umijs/bundler-utils/compiled/es-module-lexer';
import { build as esBuild } from '@umijs/bundler-utils/compiled/esbuild';
import { uniq, uniqBy } from '@umijs/utils/compiled/lodash';
import fg from 'fast-glob';
import { readFileSync } from 'fs';
import { extname, join, relative } from 'path';
import { checkMatch } from '../babelPlugins/awaitImport/checkMatch';
import { getAliasedPathWithLoopDetect } from '../babelPlugins/awaitImport/getAliasedPath';
import { MFSU } from '../mfsu';
import parseImport from './importParser';

interface IOpts {
  mfsu: MFSU;
  absSrcPath: string;
  cachePath: string;
}

export class StaticDepInfo {
  private opts: IOpts;
  public cacheFilePath: string;
  private fileList: string[] = [];
  private srcPath: string;
  private cachePath: string;

  private fileContentCache: Record<string, string> = {};
  private mfsu: MFSU;
  private presetDep = [
    'react',
    'react-error-overlay',
    'react/jsx-dev-runtime',
    '@umijs/utils/compiled/strip-ansi',
  ];

  constructor(opts: IOpts) {
    this.srcPath = opts.absSrcPath;
    this.cachePath = opts.cachePath;
    this.mfsu = opts.mfsu;

    console.log('caching at ', opts.cachePath);
    this.opts = opts;
    this.cacheFilePath = join(this.opts.mfsu.opts.tmpBase!, 'MFSU_CACHE.json');
  }

  async init() {
    const files = await fg(join(this.srcPath, '**', '*.{ts,js,jsx,tsx}'), {
      dot: true,
      ignore: [
        '**/*.d.ts',
        '**/*.test.{js,ts,jsx,tsx}',
        // fixme respect to enviroment
        '**/.umi-production/**',
        '**/node_modules/**',
      ],
    });

    await init;

    this.fileList = files;

    const res = await this.batchProcess(this.fileList);

    console.log(res);

    for (const f of this.fileList) {
      let newFile = join(this.cachePath, relative(this.srcPath, f));

      // fixme ensure the last one
      newFile = newFile.replace(extname(newFile), '.js');

      const c = readFileSync(newFile, 'utf-8');
      this.fileContentCache[f] = c;
    }
  }

  async getDependencies(): Promise<string[]> {
    const bigCodeString = Object.keys(this.fileContentCache)
      .map((k) => this.fileContentCache[k])
      .join('\n');

    const [imports] = parse(bigCodeString);

    const opts = {
      exportAllMembers: this.mfsu.opts.exportAllMembers,
      unMatchLibs: this.mfsu.opts.unMatchLibs,
      remoteName: this.mfsu.opts.mfName,
      alias: this.mfsu.alias,
      externals: this.mfsu.externals,
    };

    console.log('------>', this.mfsu.alias);

    const cache = new Map<string, any>();
    const matchedImports = imports
      .map((imp) => {
        const { isMatch, replaceValue, value } = checkMatch({
          cache,
          value: imp.n as string,
          depth: 1,
          filename: '_.js',
          opts,
        });
        return {
          ...imp,
          isMatch,
          replaceName: replaceValue,
          value,
        };
      })
      .filter(({ isMatch }) => isMatch);

    const antdImports = matchedImports.filter(({ n }) => {
      return n === 'antd';
    });

    const dep: string[] = [];
    if (antdImports.length > 0) {
      const importSnippets = antdImports
        .map(({ ss, se }) => {
          return bigCodeString.slice(ss, se + 1);
        })
        .join('\n');

      const parsedImports = parseImport(importSnippets) as {
        from: string;
        imports: string[];
      }[];

      const importedVariable = new Set<string>();

      for (const i of parsedImports) {
        i.imports.forEach((v) => {
          importedVariable.add(v);
        });
      }

      for (const v of importedVariable.entries()) {
        const dashed = toDash(v[0]);
        // @ts-ignore
        const base = antdImports[0].value;
        const componentPath = join(base, 'es', dashed);
        // fixme respect to config#antd
        const stylePath = join(componentPath, 'style');

        dep.push(componentPath);
        dep.push(stylePath);
      }
    }

    const uniqDeps = uniqBy(matchedImports, 'n');

    const preset = this.presetDep.map(
      (d) =>
        getAliasedPathWithLoopDetect({
          value: d,
          alias: this.mfsu.alias,
        }) || d,
    );

    return uniq(
      uniqDeps
        // @ts-ignore
        .map(({ n, value }) => value || n)
        .concat(dep)
        .concat(preset),
    ) as string[];
  }

  async processFile(p: string) {
    try {
      await esBuild({
        entryPoints: [p],
        outdir: this.cachePath,
      });
    } catch (e) {}
  }

  async batchProcess(files: string[]) {
    try {
      await esBuild({
        entryPoints: files,
        outdir: this.cachePath,
      });
    } catch (e) {
      console.error(e);
    }
  }

  async allRuntimeHelpers() {
    // todo mfsu4
    // const umipack = await resolve(process.cwd(), 'umi');
    // return umipack;
  }
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
