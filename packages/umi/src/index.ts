import { IServicePluginAPI, PluginAPI } from '@umijs/core';

export { defineConfig } from './defineConfig.js';
export * from './service/service.js';
export type IApi = PluginAPI & IServicePluginAPI;
