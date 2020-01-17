import express from 'express';
import { got } from '@umijs/utils';
import portfinder from 'portfinder';
import SockJS from 'sockjs-client';
import Server from './Server';

function initSocket({
  url,
  onMessage,
}: {
  url: string;
  onMessage: any;
}): Promise<WebSocket> {
  return new Promise(resolve => {
    const sock = new SockJS(url);
    sock.onopen = () => {
      resolve(sock);
    };
    sock.onmessage = onMessage;
  });
}

test('normal', async () => {
  const server = new Server({
    beforeMiddlewares: [
      (req, res, next) => {
        if (req.path === '/before') {
          res.end('before');
        } else {
          next();
        }
      },
    ],
    afterMiddlewares: [
      (req, res, next) => {
        if (req.path === '/after') {
          res.end('after');
        } else {
          next();
        }
      },
    ],
    compilerMiddleware: (req, res, next: NextFunction) => {
      if (req.path === '/compiler') {
        res.end('compiler');
      } else {
        next();
      }
    },
  });
  const serverPort = await portfinder.getPortPromise({
    port: 3000,
  });
  const { port, hostname } = await server.listen({
    port: serverPort,
    hostname: 'localhost',
  });
  const { body: compilerBody } = await got(
    `http://${hostname}:${port}/compiler`,
  );
  expect(compilerBody).toEqual('compiler');
  const { body: beforeBody } = await got(`http://${hostname}:${port}/before`);
  expect(beforeBody).toEqual('before');
  const { body: afterBody } = await got(`http://${hostname}:${port}/after`);
  expect(afterBody).toEqual('after');

  const messages: string[] = [];
  const sock = await initSocket({
    url: `http://${hostname}:${port}/dev-server`,
    onMessage: (message: { data: string }) => {
      messages.push(message.data);
    },
  });
  server.sockWrite({
    type: 'foo',
    data: 'bar',
  });

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  await delay(100);

  expect(messages).toEqual(['{"type":"foo","data":"bar"}']);
  sock.close();
  await delay(100);

  server.listeningApp?.close();
});

describe('proxy', () => {
  const host = 'localhost';
  let proxyServer1;
  let proxyServer1Port;
  let proxyServer2;
  let proxyServer2Port;

  beforeAll(async () => {
    proxyServer1 = express();
    proxyServer1.get('/api', (req, res) => {
      res.json({
        hello: 'umi proxy',
      });
    });
    proxyServer1Port = await portfinder.getPortPromise({
      port: 3001,
    });
    proxyServer1.listen(proxyServer1Port);

    proxyServer2 = express();
    proxyServer2.get('/api2', (req, res) => {
      res.json({
        hello: 'umi proxy2',
      });
    });
    proxyServer2Port = await portfinder.getPortPromise({
      port: 3002,
    });
    proxyServer2.listen(proxyServer2Port);
  });

  afterAll(() => {
    proxyServer1?.close();
    proxyServer2?.close();
  });

  it('proxy normal', async () => {
    const server = new Server({
      beforeMiddlewares: [],
      afterMiddlewares: [],
      compilerMiddleware: (req, res, next) => {
        if (req.path === '/compiler') {
          res.end('compiler');
        } else {
          next();
        }
      },
      proxy: {
        '/api2': {
          target: `http://${host}:${proxyServer2Port}`,
          changeOrigin: true,
        },
        '/api': {
          target: `http://${host}:${proxyServer1Port}`,
          changeOrigin: true,
        },
      },
    });
    const { port, hostname } = await server.listen({
      port: 3000,
      hostname: host,
    });
    const { body: compilerBody } = await got(
      `http://${hostname}:${port}/compiler`,
    );
    expect(compilerBody).toEqual('compiler');

    const { body: proxyBody } = await got(`http://${hostname}:${port}/api`);
    expect(proxyBody).toEqual(
      JSON.stringify({
        hello: 'umi proxy',
      }),
    );

    const { body: proxy2Body } = await got(`http://${hostname}:${port}/api2`);
    expect(proxy2Body).toEqual(
      JSON.stringify({
        hello: 'umi proxy2',
      }),
    );
  });
});
