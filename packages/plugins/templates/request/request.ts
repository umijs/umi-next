import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from '@umijs/utils/compiled/axios';
import { useRequest } from 'ahooks';
import { message, notification } from 'antd';
import { getPluginManager } from '../core/plugin';

export interface RequestConfig extends AxiosRequestConfig {
  errorConfig?: {
    errorPage?: string;
    adaptor?: IAdaptor; // adaptor 用以用户将不满足接口的后端数据修改成 errorInfo
    errorHandler?: IErrorHandler;
  };
}

export enum ErrorShowType {
  SILENT = 0,
  WARN_MESSAGE = 1,
  ERROR_MESSAGE = 2,
  NOTIFICATION = 4,
  REDIRECT = 9,
}

export interface IErrorInfo {
  success: boolean;
  data?: any;
  errorCode?: string;
  errorMessage?: string;
  showType?: ErrorShowType;
  traceId?: string;
  host?: string;
  [key: string]: any;
}
// resData 其实就是 response.data, response 则是 axios 的响应对象
interface IAdaptor {
  (resData: any, response: AxiosResponse): IErrorInfo;
}

export interface RequestError extends Error {
  data?: any;
  info?: IErrorInfo;
}

interface IRequest {
  (
    url: string,
    opts: AxiosRequestConfig & { skipErrorHandler?: boolean },
  ): Promise<AxiosResponse<any, any>>;
}

interface IErrorHandler {
  (error: any, opts: AxiosRequestConfig & { skipErrorHandler?: boolean }): void;
}

const defaultErrorHandler: IErrorHandler = (error, opts) => {
  if (opts?.skipErrorHandler) throw error;
  const config = getConfig();
  const { errorConfig } = config;
  if (error.response) {
    // 请求成功发出且服务器也响应了状态码，但状态代码超出了 2xx 的范围
    let errorInfo: IErrorInfo | undefined;
    const adaptor: IAdaptor =
      errorConfig?.adaptor || ((errorData) => errorData);
    errorInfo = adaptor(error.response.data, error.response);
    error.info = errorInfo;
    error.data = error.response.data;
    if (errorInfo) {
      const { errorMessage, errorCode } = errorInfo;
      switch (errorInfo.showType) {
        case ErrorShowType.SILENT:
          // do nothong
          break;
        case ErrorShowType.WARN_MESSAGE:
          message.warn(errorMessage);
          break;
        case ErrorShowType.ERROR_MESSAGE:
          message.error(errorMessage);
          break;
        case ErrorShowType.NOTIFICATION:
          notification.open({ description: errorMessage, message: errorCode });
          break;
        case ErrorShowType.REDIRECT:
          // TODO: redirect
          break;
      }
    }
  } else if (error.request) {
    // 请求已经成功发起，但没有收到响应
    // `error.request` 在浏览器中是 XMLHttpRequest 的实例，
    // 而在node.js中是 http.ClientRequest 的实例
  } else {
    // 发送请求时出了点问题
  }
  throw error;
};

let requestInstance: AxiosInstance;
let config: RequestConfig;
// TODO: type: ApplygPluginsTYPE.modify
const getConfig = (): RequestConfig => {
  if (config) return config;
  config = getPluginManager().applyPlugins({
    key: 'request',
    type: 'modify',
    initialValue: {},
  });
  return config;
};
const getRequestInstance = (): AxiosInstance => {
  if (requestInstance) return requestInstance;
  requestInstance = axios.create(getConfig());
  return requestInstance;
};

const request: IRequest = (url, opts) => {
  const requestInstance = getRequestInstance();
  return new Promise((resolve, reject) => {
    requestInstance
      .request({ ...opts, url })
      .then((res) => {
        resolve(res);
      })
      .catch((error) => {
        try {
          const config = getConfig();
          const handler =
            config.errorConfig?.errorHandler || defaultErrorHandler;
          handler(error, opts);
        } catch (e) {
          reject(e);
        }
      });
  });
};

export { useRequest, AxiosRequestConfig, request };
