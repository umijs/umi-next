import { yParser } from '@umijs/utils';
import { Plugin } from './plugin';

type CommandRuntimeConfig = {
  configResolveMode: 'strict' | 'loose';
};

export interface IOpts {
  name: string;
  description?: string;
  options?: string;
  details?: string;
  fn: {
    ({ args }: { args: yParser.Arguments }): void;
  };
  plugin: Plugin;
  runtimeConfig?: CommandRuntimeConfig;
}

export class Command {
  name: string;
  description?: string;
  options?: string;
  details?: string;
  runtimeConfig: CommandRuntimeConfig = {
    configResolveMode: 'strict',
  };
  fn: {
    ({ args }: { args: yParser.Arguments }): void;
  };
  plugin: Plugin;

  constructor(opts: IOpts) {
    this.name = opts.name;
    this.description = opts.description;
    this.options = opts.options;
    this.details = opts.details;
    this.fn = opts.fn;
    this.plugin = opts.plugin;
    this.runtimeConfig = {
      ...this.runtimeConfig,
      ...opts.runtimeConfig,
    };
  }
}
