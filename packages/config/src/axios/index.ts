import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { ApiConfig, ApiError } from './types';

export class ApiClient {
  private static instance: ApiClient;
  private api: AxiosInstance;

  private constructor(config: ApiConfig) {
    this.api = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout,
      headers: config.headers,
    });

    this.setupInterceptors();
  }

  public static getInstance(config: ApiConfig): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient(config);
    }
    return ApiClient.instance;
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.api.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: AxiosError) => Promise.reject(this.handleError(error)),
    );

    // Response interceptor for success/error standardization
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        const errorResponse = this.handleError(error);
        // Remove token if unauthorized
        if (errorResponse.statusCode === 401) {
          localStorage.clear();
          sessionStorage.clear();
          if (
            window.location.href.includes('/auth/login') ||
            window.location.href.includes('/auth/register')
          ) {
            return Promise.reject(errorResponse);
          }
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
        }
        return Promise.reject(errorResponse);
      },
    );
  }

  private handleError(error: AxiosError): ApiError {
    const apiError: ApiError = {
      message: 'An unexpected error occurred',
      statusCode: 500,
      error,
    };

    if (error.response) {
      apiError.statusCode = error.response.status;
      apiError.message = (error.response.data as any)?.message || error.message;
      apiError.error = error.response.data;
    } else if (error.request) {
      apiError.statusCode = 503;
      apiError.message = 'Network error - server unreachable';
    }

    return apiError;
  }

  public getAxiosInstance(): AxiosInstance {
    return this.api;
  }
}

export * from './types';
