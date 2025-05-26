import { api } from './api';

export interface Category {
  id: number;
  name: string;
  imageUrl: string;
  description?: string | null;
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

  createCategory: async (formData: FormData) => {
    const { data } = await api.post('/api/v1/categories', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  updateCategory: async (id: number, formData: FormData) => {
    const { data } = await api.put(`/api/v1/categories/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  updateCategoryImage: async (id: number, formData: FormData) => {
    const { data } = await api.put(`/api/v1/categories/${id}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  deleteCategoryImage: async (id: number, formdata: { imageUrl: string }) => {
    return await api.delete(`/api/v1/categories/${id}/image`, {
      data: formdata,
    });
  },

  deleteCategory: async (id: number) => {
    await api.delete(`/api/v1/categories/${id}`);
  },
};
