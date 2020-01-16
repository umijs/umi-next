export default function mergeConfig<
  T extends Record<string, any>,
  U extends Record<string, any>
>(defaultConfig: T, ...configs: (U | null | undefined)[]) {
  const ret: Partial<T & U> = { ...defaultConfig };
  configs.forEach(config => {
    if (!config) return;
    Object.keys(config).forEach((key: keyof typeof config) => {
      const val = config[key];
      if (typeof val === 'function') {
        ret[key] = val(ret[key]);
      } else {
        ret[key] = val;
      }
    });
  });
  return ret as T & U;
}
