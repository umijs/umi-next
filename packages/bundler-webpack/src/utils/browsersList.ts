import { DEFAULT_ESBUILD_TARGET_KEYS } from '../constants';

interface IOpts {
  targets: Record<string, any>;
}

export function getBrowsersList({ targets }: IOpts) {
  return (
    targets.browsers ||
    Object.keys(targets).map((key) => {
      return `${key} >= ${targets[key] === true ? '0' : targets[key]}`;
    })
  );
}

export function getEsBuildTarget({ targets }: IOpts) {
  return Object.keys(targets)
    .filter((key) => DEFAULT_ESBUILD_TARGET_KEYS.includes(key))
    .map((key) => {
      return `${key}${targets[key] === true ? '0' : targets[key]}`;
    });
}
