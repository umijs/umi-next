import dayjs from 'dayjs';
import fs from 'fs';
import path from 'path';
import pino from 'pino';
import type { Options } from 'rotating-file-stream';
import { omit as _omit } from '../compiled/lodash/index';

type RotationFileConfig = Options & {
  level: string;
};

// { fatal: 60, error: 50, warn: 40, info: 30, debug: 20, trace: 10 } }
const CUSTOM_LEVELS = [
  {
    level: 'ready',
    value: 11,
    color: 'green',
  },
  {
    level: 'event',
    value: 12,
    color: 'magenta',
  },
  {
    level: 'wait',
    value: 13,
    color: 'cyan',
  },
];
const [customLevels, customColors, pinoCustomLevels] = CUSTOM_LEVELS.reduce<
  [
    string,
    string,
    {
      [key: string]: number;
    },
  ]
>(
  (pre, current) => {
    const [preLevels, preColors, prePinoLevles] = pre;
    return [
      `${preLevels}${current.level}:${current.value},`,
      `${preColors}${current.level}:${current.color},`,
      {
        ...prePinoLevles,
        [current.level]: current.value,
      },
    ];
  },
  ['', '', Object.create(null)],
);

const defaultConfig: RotationFileConfig = {
  path: path.resolve(process.cwd(), 'node_modules/.cache/umi/logger'),
  size: '4MB',
  interval: '12h',
  maxFiles: 40,
  level: 'trace',
};
const config: RotationFileConfig = {
  path: process.env.UMI_LOG_PATH || defaultConfig.path,
  size: process.env.UMI_LOG_FILE_SIZE || defaultConfig.size,
  interval: process.env.UMI_LOG_INTERVAL || defaultConfig.interval,
  maxFiles: Number(process.env.UMI_LOG_MAX_FILES) || defaultConfig.maxFiles,
  level: process.env.UMI_LOG_LEVEL || defaultConfig.level,
  history: 'history',
};

const transport = pino.transport<any>({
  targets: [
    {
      level: config.level,
      target: path.join(__dirname, '..', 'node_modules/pino-pretty/index.js'),
      options: {
        useOnlyCustomProps: false,
        ignore: 'hostname,pid',
        translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
        colorize: true,
        customLevels,
        customColors,
      },
    },
    {
      level: config.level,
      target: path.join(__dirname, '..', 'dist/logger.transport.js'),
      options: _omit(config, 'level'),
    },
  ],
});
const logger = pino(
  {
    customLevels: pinoCustomLevels,
    timestamp: () => {
      return `,"time":"${dayjs().format('YYYY-MM-DD HH:mm:ss')}"`;
    },
    level: config.level,
  },
  transport,
);

export function getLatestLogFilePath() {
  const files = fs
    .readdirSync(config.path!)
    .filter((f) => f.endsWith('.txt') && f.indexOf('history') == -1);
  const res = files.sort(function (a, b) {
    return (
      fs.statSync(path.resolve(config.path!, a)).mtime.getTime() -
      fs.statSync(path.resolve(config.path!, b)).mtime.getTime()
    );
  })[0];
  return path.resolve(config.path!, res);
}

export function flush() {
  logger.flush();
}

export function fatal(o: any, ...args: any) {
  logger.fatal(o, ...args);
}

export function wait(o: any, ...args: any) {
  logger.wait(o, ...args);
}

export function error(o: any, ...args: any) {
  logger.error(o, ...args);
}

export function warn(o: any, ...args: any) {
  logger.warn(o, ...args);
}

export function ready(o: any, ...args: any) {
  logger.ready(o, ...args);
}

export function info(o: any, ...args: any) {
  logger.info(o, ...args);
}

export function event(o: any, ...args: any) {
  logger.event(o, ...args);
}

export function debug(o: any, ...args: any) {
  if (process.env.DEBUG) {
    logger.debug(o, ...args);
  }
}
