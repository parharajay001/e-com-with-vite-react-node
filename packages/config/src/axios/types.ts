export interface ApiConfig {
  baseURL: string;
  timeout: number;
  headers: Record<string, string>;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: unknown;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
}
