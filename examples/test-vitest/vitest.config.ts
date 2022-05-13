import { createVitestConfig, getUmiAlias } from 'umi/test';

export default async () => {
  const alias = await getUmiAlias();
  return createVitestConfig({ target: 'browser' })({
    resolve: { alias },
  });
};
