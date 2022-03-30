import { portfinder, rimraf } from '@umijs/utils';
import { execa } from '@umijs/utils/compiled/execa';
import { ensureDir, existsSync, readFile, writeFile } from 'fs-extra';
import * as http from 'http';
import { dirname, join, resolve } from 'path';
import sirv from 'sirv';

export function createUmi(opts: { name?: string; cwd: string }) {
  const projectRoot = opts.name ? resolve(opts.cwd, opts.name) : opts.cwd;

  const read = (file: string) => {
    return readFile(resolve(projectRoot, file), 'utf-8');
  };

  const has = (file: string) => {
    return existsSync(resolve(projectRoot, file));
  };

  const write = (file: string, content: string) => {
    const targetPath = resolve(projectRoot, file);
    const dir = dirname(targetPath);
    return ensureDir(dir).then(() => writeFile(targetPath, content));
  };

  const rm = (file: string) => {
    return rimraf.sync(resolve(projectRoot, file));
  };

  const build = () => {
    const command = require.resolve('umi/bin/umi');
    return execa(command, ['build'], {
      cwd: projectRoot,
    });
  };

  const getIndex = () => {
    return `file:${join(projectRoot, 'dist/index.html')}`;
  };

  const run = async (command: string, args?: string[]) => {
    return execa(command, args, {
      cwd: projectRoot,
    });
  };

  return {
    projectRoot,
    read,
    has,
    write,
    rm,
    build,
    getIndex,
    run,
  };
}

export function createServer(projectRoot: string) {
  let server: http.Server;

  const run = async (): Promise<string> => {
    const port = await portfinder.getPortPromise({
      port: 4173,
    });

    const serve = sirv(resolve(projectRoot, 'dist'));

    const httpServer = http.createServer((req, res) => {
      if (req.url === '/umi_e2e_ping') {
        res.statusCode = 200;
        res.end('pong');
      } else {
        serve(req, res);
      }
    });

    server = httpServer;

    return new Promise((resolve, reject) => {
      const onError = (e: any) => {
        if (e.code === 'EADDRINUSE') {
          httpServer.close();
          httpServer.listen(port);
        } else {
          reject(e);
        }
      };

      httpServer.on('error', onError);

      httpServer.listen(port, () => {
        httpServer.removeListener('error', onError);
        resolve(`http://localhost:${port}`);
      });
    });
  };

  const close = () => {
    server.close();
  };

  return {
    run,
    close,
  };
}

export { Server } from 'http';
