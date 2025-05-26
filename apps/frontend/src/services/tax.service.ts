import { api } from './api';

export interface Tax {
  id: number;
  country: string;
  state?: string | null;
  rate: number;
  createdAt: string;
  modifiedAt: string;
}

interface TaxParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

export const taxService = {
  getTaxes: async (params: TaxParams): Promise<PaginatedResponse<Tax>> => {
    const { data } = await api.get('/api/v1/taxes', { params });
    return data;
  },

  getTaxById: async (id: number): Promise<Tax> => {
    const { data } = await api.get(`/api/v1/taxes/${id}`);
    return data;
  },

  createTax: async (taxData: Omit<Tax, 'id' | 'createdAt' | 'modifiedAt'>) => {
    const { data } = await api.post('/api/v1/taxes', taxData);
    return data;
  },

  updateTax: async (id: number, taxData: Partial<Omit<Tax, 'id' | 'createdAt' | 'modifiedAt'>>) => {
    const { data } = await api.put(`/api/v1/taxes/${id}`, taxData);
    return data;
  },

  deleteTax: async (id: number) => {
    await api.delete(`/api/v1/taxes/${id}`);
  },
};