import SockJS from 'sockjs-client';
import url from 'url';
import {
  handleErrors,
  handleHashChange,
  handleSuccess,
  handleWarnings,
  showPending,
} from './handlers';

let sock: InstanceType<typeof SockJS>;
let retries: number = 0;
let pending: HTMLDivElement | undefined;

const initSocket = () => {
  const dataFromSrc = document
    ?.querySelector?.('script[data-from="umi"]')
    ?.getAttribute('src');
  const { host, protocol } = url.parse(dataFromSrc || '');
  const hostname = host && protocol ? url.format({ host, protocol }) : '';
  sock = new SockJS(`${hostname}/dev-server`);

  sock.onopen = () => {
    retries = 0;
    pending?.parentElement?.removeChild(pending);
  };

  sock.onmessage = e => {
    const message = JSON.parse(e.data);
    switch (message.type) {
      case 'hash':
        handleHashChange(message.data);
        break;
      case 'still-ok':
      case 'ok':
        handleSuccess();
        break;
      case 'warnings':
        handleWarnings(message.data);
        break;
      case 'errors':
        handleErrors(message.data);
        break;
      default:
        break;
    }
  };
  sock.onclose = e => {
    if (retries === 0) {
      if (typeof console?.info === 'function') {
        console.info(
          'The development server has disconnected.\nRefresh the page if necessary.',
        );
      }
    }

    // @ts-ignore
    sock = null;
    if (!pending) {
      pending = showPending();
    }

    if (retries <= 10) {
      const retryInMs = 1000 * Math.pow(2, retries) + Math.random() * 100;
      retries += 1;

      setTimeout(() => {
        initSocket();
      }, retryInMs);
    }
  };
};

initSocket();
