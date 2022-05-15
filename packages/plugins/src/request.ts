import { dirname } from 'path';
import { IApi } from 'umi';
import { Mustache, winPath } from 'umi/plugin-utils';

export default (api: IApi) => {
  api.describe({
    key: 'request',
    config: {
      schema: (joi) => {
        return joi.object({
          dataField: joi
            .string()
            .pattern(/^[a-zA-Z]*$/)
            .allow(''),
        });
      },
    },
    enableBy: api.EnableBy.config,
  });

  api.addRuntimePluginKey(() => ['request']);

  const requestTpl = `
import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from '{{{axiosPath}}}';
import useUmiRequest, { UseRequestProvider } from '{{{umiRequestPath}}}';
import { ApplyPluginsType } from 'umi';
import { getPluginManager } from '../core/plugin';

import {
  BaseOptions,
  BasePaginatedOptions,
  BaseResult,
  CombineService,
  LoadMoreFormatReturn,
  LoadMoreOptions,
  LoadMoreOptionsWithFormat,
  LoadMoreParams,
  LoadMoreResult,
  OptionsWithFormat,
  PaginatedFormatReturn,
  PaginatedOptionsWithFormat,
  PaginatedParams,
  PaginatedResult,
} from '{{{umiRequestPath}}}/es/types';

type ResultWithData< T = any > = { data?: T; [key: string]: any };

function useRequest<
  R = any,
  P extends any[] = any,
  U = any,
  UU extends U = any,
>(
  service: CombineService<R, P>,
  options: OptionsWithFormat<R, P, U, UU>,
): BaseResult<U, P>;
function useRequest<R extends ResultWithData = any, P extends any[] = any>(
  service: CombineService<R, P>,
  options?: BaseOptions<R['data'], P>,
): BaseResult<R['data'], P>;
function useRequest<R extends LoadMoreFormatReturn = any, RR = any>(
  service: CombineService<RR, LoadMoreParams<R>>,
  options: LoadMoreOptionsWithFormat<R, RR>,
): LoadMoreResult<R>;
function useRequest<
  R extends ResultWithData<LoadMoreFormatReturn | any> = any,
  RR extends R = any,
>(
  service: CombineService<R, LoadMoreParams<R['data']>>,
  options: LoadMoreOptions<RR['data']>,
): LoadMoreResult<R['data']>;

function useRequest<R = any, Item = any, U extends Item = any>(
  service: CombineService<R, PaginatedParams>,
  options: PaginatedOptionsWithFormat<R, Item, U>,
): PaginatedResult<Item>;
function useRequest<Item = any, U extends Item = any>(
  service: CombineService<
    ResultWithData<PaginatedFormatReturn<Item>>,
    PaginatedParams
  >,
  options: BasePaginatedOptions<U>,
): PaginatedResult<Item>;
function useRequest(service: any, options: any = {}) {
  return useUmiRequest(service, {
    formatResult: {{{formatResult}}},
    requestMethod: (requestOptions: any) => {
      if (typeof requestOptions === 'string') {
        return request(requestOptions);
      }
      if (typeof requestOptions === 'object') {
        const { url, ...rest } = requestOptions;
        return request(url, rest);
      }
      throw new Error('request options error');
    },
    ...options,
  });
}

// request 方法 opts 参数的接口
interface IRequestOptions extends AxiosRequestConfig {
  skipErrorHandler?: boolean;
  requestInterceptors?: IRequestInterceptorTuple[];
  responseInterceptors?: IResponseInterceptorTuple[];
  [key: string]: any;
}

interface IRequestOptionsWithResponse extends IRequestOptions {
  getResponse: true;
}

interface IRequestOptionsWithoutResponse extends IRequestOptions{
  getResponse: false;
}

interface IRequest{
   <T = any>(url: string, opts: IRequestOptionsWithResponse): Promise<AxiosResponse<T>>;
   <T = any>(url: string, opts: IRequestOptionsWithoutResponse): Promise<T>;
   <T = any>(url: string, opts: IRequestOptions): Promise<T>; // getResponse 默认是 false， 因此不提供该参数时，只返回 data
   <T = any>(url: string): Promise<T>;  // 不提供 opts 时，默认使用 'GET' method，并且默认返回 data
}

interface IErrorHandler {
  (error: RequestError, opts: IRequestOptions): void;
}
type IRequestInterceptorAxios = (config: RequestOptions) => RequestOptions;
type IRequestInterceptorUmiRequest = (url: string, config : RequestOptions) => { url: string, options: RequestOptions };
type IRequestInterceptor = IRequestInterceptorAxios;
type IErrorInterceptor = (error: Error) => Promise<Error>;
type IResponseInterceptor = <T = any>(response : AxiosResponse<T>) => AxiosResponse<T> ;
type IRequestInterceptorTuple = [IRequestInterceptor , IErrorInterceptor] | [ IRequestInterceptor ] | IRequestInterceptor
type IResponseInterceptorTuple = [IResponseInterceptor, IErrorInterceptor] | [IResponseInterceptor] | IResponseInterceptor

export interface RequestConfig extends AxiosRequestConfig {
  errorConfig?: {
    errorHandler?: IErrorHandler;
    errorThrower?: <T = any>( res: T ) => void
  };
  requestInterceptors?: IRequestInterceptorTuple[];
  responseInterceptors?: IResponseInterceptorTuple[];
}

let requestInstance: AxiosInstance;
let config: RequestConfig;
const getConfig = (): RequestConfig => {
  if (config) return config;
  config = getPluginManager().applyPlugins({
    key: 'request',
    type: ApplyPluginsType.modify,
    initialValue: {},
  });
  return config;
};

const gbkRequestInterceptor = (config) => {
  return {
    ...config,
    responseType: 'blob',
    transformResponse: (blob) => {
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve(reader.result);
        };
        reader.onerror = reject;
        reader.readAsText(blob, 'GBK'); // setup GBK decoding
      })
    }
  }
}

const createRequestInstance = (): AxiosInstance => {
  const config = getConfig();
  const instance = axios.create(config);
  config?.requestInterceptors?.forEach((interceptor) => {
    if(interceptor instanceof Array){
      instance.interceptors.request.use((config) => {
        const { url } = config;
        if(interceptor[0].length === 2){
          const { url: newUrl, options } = interceptor[0](url, config);
          return { ...options, url: newUrl };
        }
        return interceptor[0](config);
      }, interceptor[1]);
    } else {
      instance.interceptors.request.use((config) => {
        const { url } = config;
        if(interceptor.length === 2){
          const { url: newUrl, options } = interceptor(url, config);
          return { ...options, url: newUrl };
        }
        return interceptor(config);
      })
    }
  });
  if(config?.charset === 'gbk'){
    instance.interceptors.request.use(gbkRequestInterceptor);
  }
  config?.responseInterceptors?.forEach((interceptor) => {
    interceptor instanceof Array ?
      instance.interceptors.response.use(interceptor[0], interceptor[1]) :
      instance.interceptors.response.use(interceptor);
  });
  // 当响应的数据 success 是 false 的时候，抛出 error 以供 errorHandler 处理。
  instance.interceptors.response.use((response) => {
    const { data } = response;
    if(data?.success === false && config?.errorConfig?.errorThrower){
      config.errorConfig.errorThrower(data);
    }
    return response;
  })
  return instance;
};

const getRequestInstance = () => {
  if (requestInstance) return requestInstance;
  const instance = createRequestInstance();
  requestInstance = instance;
  return instance;
};

const request: IRequest = (url: string, opts: any = { method: 'GET' }) => {
  const { getResponse = false, requestInterceptors=[], responseInterceptors=[], charset } = opts;
  let instance;
  const neecHandleGBK = charset === 'gbk';
  const needNewInstance: boolean = requestInterceptors.length || responseInterceptors.length || neecHandleGBK;

  if (needNewInstance) {
    instance = createRequestInstance()
    requestInterceptors?.map((interceptor) => {
      if (interceptor instanceof Array) {
        return instance.interceptors.request.use((config) => {
          const { url } = config;
          if (interceptor[0].length === 2) {
            const { url: newUrl, options } = interceptor[0](url, config);
            return { ...options, url: newUrl };
          }
          return interceptor[0](config);
        }, interceptor[1]);
      } else {
        return instance.interceptors.request.use((config) => {
          const { url } = config;
          if (interceptor.length === 2) {
            const { url: newUrl, options } = interceptor(url, config);
            return { ...options, url: newUrl };
          }
          return interceptor(config);
        })
      }
    });
    responseInterceptors?.map((interceptor) => {
      return interceptor instanceof Array ?
        instance.interceptors.response.use(interceptor[0], interceptor[1]) :
        instance.interceptors.response.use(interceptor);
    });
    neecHandleGBK
      ? instance.interceptors.request.use(gbkRequestInterceptor)
      : instance.interceptors.request.eject(gbkRequestInterceptor);
  } else {
    instance = getRequestInstance()
  }
  const config = getConfig();
  return new Promise((resolve, reject) => {
    instance
      .request({ ...opts, url })
      .then((res) => {
        resolve(getResponse ? res : res.data);
      })
      .catch((error) => {
        try {
          const handler =
            config.errorConfig?.errorHandler;
          if(handler)
            handler(error, opts, config);
        } catch (e) {
          reject(e);
        }
        reject(error);
      })
  })
}

export {
  useRequest,
  UseRequestProvider,
  request,
  getRequestInstance,
};

export type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
};

`;

  api.onGenerateFiles(() => {
    const umiRequestPath = winPath(
      dirname(require.resolve('@ahooksjs/use-request/package.json')),
    );
    const axiosPath = winPath(dirname(require.resolve('axios/package.json')));
    let dataField = api.config.request?.dataField;
    if (dataField === undefined) dataField = 'data';
    const formatResult =
      dataField === '' ? `result => result` : `result => result?.${dataField}`;
    api.writeTmpFile({
      path: 'request.ts',
      content: Mustache.render(requestTpl, {
        umiRequestPath,
        axiosPath,
        formatResult,
      }),
    });
    api.writeTmpFile({
      path: 'types.d.ts',
      content: `
export type { RequestConfig } from './request';
`,
    });
    api.writeTmpFile({
      path: 'index.ts',
      content: `
export {
  useRequest,
  UseRequestProvider,
  request,
} from './request';
`,
    });
  });
};
