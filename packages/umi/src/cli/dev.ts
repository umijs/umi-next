import { createRequire } from 'module';
import fork from './fork.js';

const require = createRequire(import.meta.url);

export function dev() {
  const child = fork({
    scriptPath: require.resolve('../../bin/forkedDev'),
  });
  // ref:
  // http://nodejs.cn/api/process/signal_events.html
  // https://lisk.io/blog/development/why-we-stopped-using-npm-start-child-processes
  process.on('SIGINT', () => {
    child.kill('SIGINT');
    // ref:
    // https://github.com/umijs/umi/issues/6009
    process.exit(0);
  });
  process.on('SIGTERM', () => {
    child.kill('SIGTERM');
    process.exit(1);
  });
}
