import fs from 'fs';
import path from 'path';
import pino, { LoggerOptions } from 'pino';
import dayjs from '../compiled/dayjs';
import { omit as _omit } from '../compiled/lodash';
import type { PrettyOptions } from '../compiled/pino-pretty';
import type { Options } from '../compiled/rotating-file-stream';

interface RotationFileConfig extends Options {
  level: string;
}

enum CustomLevels {
  ready = 'ready',
  event = 'event',
  wait = 'wait',
}

interface PinoCustomLevelParams {
  customLevels: string;
  customColors: string;
  pinoCustomLevels: {
    [key in string]: number;
  };
}

interface CustomLevelConfig {
  level: CustomLevels;
  value: number;
  color: string;
}

// { fatal: 60, error: 50, warn: 40, info: 30, debug: 20, trace: 10 } }
const CUSTOM_LEVELS_CONFIG: CustomLevelConfig[] = [
  {
    level: CustomLevels.ready,
    value: 11,
    color: 'green',
  },
  {
    level: CustomLevels.event,
    value: 12,
    color: 'magenta',
  },
  {
    level: CustomLevels.wait,
    value: 13,
    color: 'cyan',
  },
];

const { customLevels, customColors, pinoCustomLevels } =
  CUSTOM_LEVELS_CONFIG.reduce<PinoCustomLevelParams>((pre, current) => {
    const { customLevels = '', customColors = '', pinoCustomLevels = {} } = pre;
    return {
      customLevels: `${customLevels}${current.level}:${current.value},`,
      customColors: `${customColors}${current.level}:${current.color},`,
      pinoCustomLevels: {
        ...pinoCustomLevels,
        [current.level]: current.value,
      },
    };
  }, Object.create(null));

const DEFAULT_CONFIG: RotationFileConfig = {
  path: path.resolve(process.cwd(), 'node_modules/.cache/umi/logger'),
  size: '4MB',
  interval: '12h',
  maxFiles: 20,
  level: 'trace',
};

const config: RotationFileConfig = {
  path: process.env.UMI_LOG_PATH || DEFAULT_CONFIG.path,
  size: process.env.UMI_LOG_FILE_SIZE || DEFAULT_CONFIG.size,
  interval: process.env.UMI_LOG_INTERVAL || DEFAULT_CONFIG.interval,
  maxFiles: Number(process.env.UMI_LOG_MAX_FILES) || DEFAULT_CONFIG.maxFiles,
  level: process.env.UMI_LOG_LEVEL || DEFAULT_CONFIG.level,
  history: 'history',
};

type TransportOptions = PrettyOptions &
  Omit<RotationFileConfig, 'level'> &
  Omit<LoggerOptions, 'customLevels'> & {
    useOnlyCustomProps?: boolean;
    customColors?: string;
    customLevels?: string;
  };

const transport = pino.transport<TransportOptions>({
  targets: [
    {
      level: config.level,
      target: require.resolve('../compiled/pino-pretty'),
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
    .filter((f) => f.endsWith('.txt') && !f.includes('history'));
  const res = files.sort((a, b) => {
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

export function fatal(...args: any[]) {
  logger.fatal(args);
}

export function wait(o: any, ...args: any[]) {
  logger.wait(o, ...args);
}

export function error(o: any, ...args: any[]) {
  logger.error(o, ...args);
}

export function warn(o: any, ...args: any[]) {
  logger.warn(o, ...args);
}

export function ready(o: any, ...args: any[]) {
  logger.ready(o, ...args);
}

export function info(o: any, ...args: any[]) {
  logger.info(o, ...args);
}

export function event(o: any, ...args: any[]) {
  logger.event(o, ...args);
}

export function debug(o: any, ...args: any[]) {
  if (process.env.DEBUG) {
    logger.debug(o, ...args);
  }
}
