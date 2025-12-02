import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, Method, ResponseType } from 'axios';
import FormApiError from './FormApiError';
import AuthManager from '../session/AuthManager';
import { UnauthorizedApiCallError } from './UnauthorizedApiCallError';

export type ApiClientConfig = {
  apiBaseUrl: string,
  authManager: AuthManager,
  debug?: boolean,
}

export type RequestConfig = {
  method: Method,
  url: string,
  data: any,
  responseType: ResponseType,
  params: any,
  options: Omit<AxiosRequestConfig, 'method' | 'url' | 'data' | 'responseType' | 'params'>
}

class ApiClient {
  private readonly authManager: AuthManager;
  private readonly debug: boolean;
  private readonly apiBaseUrl: string;
  private readonly client: AxiosInstance;

  constructor({ apiBaseUrl, authManager, debug = false }: ApiClientConfig) {
    this.authManager = authManager;
    this.debug = debug;
    this.apiBaseUrl = apiBaseUrl;

    this.client = axios.create({
      baseURL: apiBaseUrl,
      responseType: 'json',
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error?.response?.status === 401) {
          throw new UnauthorizedApiCallError();
        }

        if (error?.response?.data?.status === 'error' && error?.response?.data?.type === 'formError') {
          throw new FormApiError(error?.response?.data?.errors || { form: ['Something went wrong'] });
        }

        if (error?.response?.data?.form || error?.response?.data?.fields) {
          throw new FormApiError(error.response.data);
        }

        debug && console.error('[ApiClient Error:]', error);
        throw error;
      },
    );

    this.client.interceptors.request.use(this.onRequest.bind(this));
  }

  onRequest(config: AxiosRequestConfig): AxiosRequestConfig {
    if (this.authManager) {
      const sessionObj = this.authManager.getSessionObj();
      if (sessionObj?.token) {
        config.headers.Authorization = `Bearer ${sessionObj.token}`;
      }
    }

    if (typeof window !== undefined && config.data) {
      if (config.data instanceof FormData) {
        config.headers['Content-Type'] = 'multipart/form-data';
      }
    }

    return config;
  };

  async makeRequest({ method, url, data, responseType, params, options = {} }: RequestConfig): Promise<AxiosResponse> {
    this.debug && console.debug(`[${method}][${url}][${data}][${responseType}][${JSON.stringify(params)}]`);
    const response = await this.client.request({ ...options, method, url, data, params, responseType });
    this.debug && console.debug(`[${method}][${url}][${data}][${responseType}][${JSON.stringify(params)}]`, response);

    return response;
  }
}

export default ApiClient;
