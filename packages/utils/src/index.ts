import * as chokidar from 'chokidar';
import * as clipboardy from 'clipboardy';
// @ts-ignore
import address from '../compiled/address/index.js';
import axios from '../compiled/axios/index.js';
import chalk from '../compiled/chalk/index.js';
// @ts-ignore
import cheerio from '../compiled/cheerio/index.js';
import crossSpawn from '../compiled/cross-spawn/index.js';
import debug from '../compiled/debug/index.js';
import deepmerge from '../compiled/deepmerge/index.js';
import fsExtra from '../compiled/fs-extra/index.js';
import glob from '../compiled/glob/index.js';
// import globby from '../compiled/globby';
import lodash from '../compiled/lodash/index.js';
import Mustache from '../compiled/mustache/index.js';
import pkgUp from '../compiled/pkg-up/index.js';
// @ts-ignore
import portfinder from '../compiled/portfinder/index.js';
import prompts from '../compiled/prompts/index.js';
import resolve from '../compiled/resolve/index.js';
import rimraf from '../compiled/rimraf/index.js';
import semver from '../compiled/semver/index.js';
import stripAnsi from '../compiled/strip-ansi/index.js';
import yParser from '../compiled/yargs-parser/index.js';
import BaseGenerator from './BaseGenerator/BaseGenerator.js';
import generateFile from './BaseGenerator/generateFile.js';
import Generator from './Generator/Generator.js';
import installDeps from './installDeps.js';
import * as logger from './logger.js';
import updatePackageJSON from './updatePackageJSON.js';
export * from './getCorejsVersion.js';
export * from './importLazy.js';
export * from './isStyleFile.js';
export * from './npmClient.js';
export * from './randomColor/randomColor.js';
export * as register from './register.js';
export * from './tryPaths.js';
export * from './winPath.js';
export {
  address,
  axios,
  chalk,
  cheerio,
  chokidar,
  clipboardy,
  crossSpawn,
  debug,
  deepmerge,
  fsExtra,
  glob,
  Generator,
  BaseGenerator,
  generateFile,
  installDeps,
  // globby,
  lodash,
  logger,
  Mustache,
  pkgUp,
  portfinder,
  prompts,
  resolve,
  rimraf,
  semver,
  stripAnsi,
  updatePackageJSON,
  yParser,
};
