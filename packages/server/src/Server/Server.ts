import express, { Express, IRouterHandler, Request, Response } from 'express';
import httpProxyMiddleware from 'http-proxy-middleware';
import http from 'http';
import portfinder from 'portfinder';
import sockjs, { Server as SocketServer, Connection } from 'sockjs';

interface ProxyConfigMap {
  [url: string]: string | httpProxyMiddleware.Config;
}

type ProxyConfigArrayItem = {
  path?: string | string[];
  context?: string | string[] | httpProxyMiddleware.Filter;
} & httpProxyMiddleware.Config;

type ProxyConfigArray = ProxyConfigArrayItem[];

export interface IOpts {
  compilerMiddleware?: any;
  afterMiddlewares?: any[];
  beforeMiddlewares?: any[];
  proxy?: ProxyConfigMap | ProxyConfigArray;
  onListening?: {
    ({
      port,
      hostname,
      listeningApp,
      server,
    }: {
      port: number;
      hostname: string;
      listeningApp: http.Server;
      server: Server;
    }): void;
  };
  onConnection?: {
    ({ connection, server }: { connection: Connection; server: Server }): void;
  };
  onConnectionClose?: Function;
}

class Server {
  app: Express;
  opts: IOpts;
  socketServer?: SocketServer;
  listeningApp?: http.Server;
  sockets: Connection[] = [];

  constructor(opts: IOpts) {
    this.opts = opts;
    this.app = express();
    this.setupFeatures();
  }

  setupFeatures() {
    (this.opts.beforeMiddlewares || []).forEach(middleware => {
      this.app.use(middleware);
    });
    this.setupProxy();
    this.app.use(this.opts.compilerMiddleware);
    (this.opts.afterMiddlewares || []).forEach(middleware => {
      this.app.use(middleware);
    });
  }

  setupProxy() {
    if (!this.opts.proxy) {
      return;
    }

    if (!Array.isArray(this.opts.proxy)) {
      if ('target' in this.opts.proxy) {
        this.opts.proxy = [this.opts.proxy];
      } else {
        this.opts.proxy = Object.keys(this.opts.proxy).map(context => {
          let proxyOptions;
          // For backwards compatibility reasons.
          const correctedContext = context
            .replace(/^\*$/, '**')
            .replace(/\/\*$/, '');

          if (typeof this.opts.proxy?.[context] === 'string') {
            proxyOptions = {
              context: correctedContext,
              target: this.opts.proxy[context],
            };
          } else {
            proxyOptions = {
              ...(this.opts.proxy?.[context] || {}),
            };
            proxyOptions.context = correctedContext;
          }

          proxyOptions.logLevel = proxyOptions.logLevel || 'warn';

          return proxyOptions;
        });
      }
    }

    const getProxyMiddleware = (proxyConfig: ProxyConfigArrayItem): any => {
      const context = proxyConfig.context || proxyConfig.path;

      // It is possible to use the `bypass` method without a `target`.
      // However, the proxy middleware has no use in this case, and will fail to instantiate.
      if (proxyConfig.target) {
        return httpProxyMiddleware(context as any, proxyConfig);
      }
    };

    this.opts.proxy.forEach((proxyConfigOrCallback: any) => {
      let proxyMiddleware: any;

      let proxyConfig =
        typeof proxyConfigOrCallback === 'function'
          ? proxyConfigOrCallback()
          : proxyConfigOrCallback;

      proxyMiddleware = getProxyMiddleware(proxyConfig);

      if (proxyConfig.ws) {
        this.sockets.push(proxyMiddleware);
      }

      this.app.use((req: Request, res: Response, next) => {
        if (typeof proxyConfigOrCallback === 'function') {
          const newProxyConfig = proxyConfigOrCallback();

          if (newProxyConfig !== proxyConfig) {
            proxyConfig = newProxyConfig;
            proxyMiddleware = getProxyMiddleware(proxyConfig);
          }
        }

        // - Check if we have a bypass function defined
        // - In case the bypass function is defined we'll retrieve the
        // bypassUrl from it otherwise bypassUrl would be null
        const isByPassFuncDefined = typeof proxyConfig.bypass === 'function';
        const bypassUrl = isByPassFuncDefined
          ? proxyConfig.bypass(req, res, proxyConfig)
          : null;

        if (typeof bypassUrl === 'boolean') {
          // skip the proxy
          req.url = '';
          next();
        } else if (typeof bypassUrl === 'string') {
          // byPass to that url
          req.url = bypassUrl;
          next();
        } else if (proxyMiddleware) {
          return proxyMiddleware(req, res, next);
        } else {
          next();
        }
      });
    });
  }

  sockWrite({
    sockets,
    type,
    data,
  }: {
    sockets?: Connection[];
    type: string;
    data?: string | object;
  }) {
    (sockets || this.sockets).forEach(socket => {
      socket.write(JSON.stringify({ type, data }));
    });
  }

  async listen({
    port,
    hostname,
  }: {
    port: number;
    hostname: string;
  }): Promise<{
    port: number;
    hostname: string;
    listeningApp: http.Server;
    server: Server;
  }> {
    const listeningApp = http.createServer(this.app);
    this.listeningApp = listeningApp;
    const foundPort = await portfinder.getPortPromise({
      port: port || 8000,
    });
    return new Promise(resolve => {
      listeningApp.listen(foundPort, hostname, 5, () => {
        this.createSocketServer();
        const ret = {
          port: foundPort,
          hostname,
          listeningApp,
          server: this,
        };
        this.opts.onListening?.(ret);
        resolve(ret);
      });
    });
  }

  createSocketServer() {
    const server = sockjs.createServer({
      log: (severity, line) => {
        console.log(line);
      },
    });
    server.installHandlers(this.listeningApp!, {
      prefix: '/dev-server',
    });
    server.on('connection', connection => {
      this.opts.onConnection?.({
        connection,
        server: this,
      });
      this.sockets.push(connection);
      connection.on('close', () => {
        this.opts.onConnectionClose?.({
          connection,
        });
        const index = this.sockets.indexOf(connection);
        if (index >= 0) {
          this.sockets.splice(index, 1);
        }
      });
    });
    this.socketServer = server;
  }
}

export default Server;
