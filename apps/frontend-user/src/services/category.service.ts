import { api } from './api';

export interface Category {
  id: number;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  createdAt: string;
  modifiedAt: string;
  deletedAt?: string | null;
}

interface CategoryParams {
  page?: number;
  limit?: number;
  sortBy?: 'id' | 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export const categoryService = {
  getCategories: async (params: CategoryParams): Promise<PaginatedResponse<Category>> => {
    const { data } = await api.get('/api/v1/categories', { params });
    return data;
  },

  createCategory: async (categoryData: Partial<Category>) => {
    const { data } = await api.post('/api/v1/categories', categoryData);
    return data;
  },

  updateCategory: async (id: number, categoryData: Partial<Category>) => {
    const { data } = await api.put(`/api/v1/categories/${id}`, categoryData);
    return data;
  },

  deleteCategory: async (id: number) => {
    await api.delete(`/api/v1/categories/${id}`);
  },
};
