export class SimpleAutoReconnectWebSocket {
  private ws: WebSocket;

  private listenerMap: Record<string, Function[]> = {};
  onMessage: (e: any) => void;
  onOpen: (e: any) => void;
  private connected: boolean;
  onClose: (event: any) => void;

  constructor(url: string | URL, protocols?: string | string[]) {
    this.ws = new WebSocket(url, protocols);

    this.connected = false;
    this.onOpen = (e) => {
      this.connected = true;
      this.pipeTo('open', e);
    };

    this.onMessage = (e) => this.pipeTo('message', e);

    this.onClose = (event: any) => {
      this.pipeTo('close', event);
      this.connected = false;
      this.removeAllListeners();

      console.warn('ws closed due to ', event);
      console.warn('reconnecting...');
      setTimeout(() => {
        this.ws = new WebSocket(url, protocols);
        this.addAllListeners();
      }, 2000);
    };

    this.addAllListeners();
  }

  send(data: any) {
    if (this.connected) {
      this.ws.send(data);
    } else {
      console.warn('ws reconnecting message dropped', data);
    }
  }

  addEventListener<K extends keyof WebSocketEventMap>(
    type: K,
    listener: (this: WebSocket, ev: WebSocketEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions,
  ): void;
  addEventListener(type: string, callback: Function) {
    if (this.listenerMap[type]) {
      this.listenerMap[type].push(callback);
    } else {
      this.listenerMap[type] = [callback];
    }
  }

  private pipeTo = (key: string, event: any) => {
    const ls = this.listenerMap[key] || [];
    for (const l of ls) {
      l(event);
    }
  };

  private addAllListeners() {
    this.ws.addEventListener('open', this.onOpen);
    this.ws.addEventListener('close', this.onClose);
    this.ws.addEventListener('message', this.onMessage);
  }

  private removeAllListeners() {
    this.ws.removeEventListener('open', this.onOpen);
    this.ws.removeEventListener('close', this.onClose);
    this.ws.removeEventListener('message', this.onMessage);
  }
}
