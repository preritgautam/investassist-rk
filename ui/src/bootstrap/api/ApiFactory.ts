import ApiClient from './ApiClient';
import { AxiosRequestConfig, Method, ResponseType } from 'axios';

export type ApiFactoryConfig = {
  apiClient: ApiClient,
  onError?: (e: Error) => Promise<boolean> | boolean,
}

export type UrlOrBuilder = string | ((any) => string);
export type ApiFactoryOptions = {
  responseType?: ResponseType,
  inputTransformer?: (any) => any,
  makeHeaders?: (any) => Record<string, string>,
}
export type ApiCallOptions = {
  urlParams?: any,
  data?: any,
  queryParams?: any,
  options?: Omit<AxiosRequestConfig, 'method' | 'url' | 'data' | 'responseType' | 'params'>
}

class ApiFactory {
  private readonly apiClient: ApiClient;
  private readonly onError: (e: Error) => Promise<boolean> | boolean;

  constructor({ apiClient, onError }: ApiFactoryConfig) {
    this.apiClient = apiClient;
    this.onError = onError;
  }

  apiFactoryBuilder =
    (method: Method) =>
      (
        urlOrBuilder: UrlOrBuilder,
        { responseType = undefined, inputTransformer = null, makeHeaders }: ApiFactoryOptions = {},
      ) =>
        async ({ urlParams = {}, data = undefined, queryParams = {}, options = {} }: ApiCallOptions = {}) => {
          try {
            // eslint-disable-next-line no-invalid-this
            return await this.apiClient.makeRequest({
              method,
              url: typeof urlOrBuilder === 'string' ? urlOrBuilder : urlOrBuilder(urlParams),
              data: inputTransformer ? inputTransformer(data) : data,
              responseType,
              params: queryParams,
              options: {
                ...options,
                headers: makeHeaders?.(urlParams),
              },
            });
          } catch (e) {
            if (this.onError) {
              const handled = await this.onError(e);
              if (!handled) {
                throw e;
              }
            } else {
              throw e;
            }
          }
        };

  // eslint-disable-next-line no-invalid-this
  createGetApi = this.apiFactoryBuilder('get');
  // eslint-disable-next-line no-invalid-this
  createPostApi = this.apiFactoryBuilder('post');
  // eslint-disable-next-line no-invalid-this
  createPatchApi = this.apiFactoryBuilder('patch');
  // eslint-disable-next-line no-invalid-this
  createPutApi = this.apiFactoryBuilder('put');
  // eslint-disable-next-line no-invalid-this
  createDeleteApi = this.apiFactoryBuilder('delete');
}

export default ApiFactory;
