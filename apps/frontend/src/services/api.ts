import { ApiClient } from '@workspace/config';

export const api = ApiClient.getInstance({
  baseURL: import.meta.env.VITE_SERVER_URL || 'http://localhost:5000',
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' },
}).getAxiosInstance();
