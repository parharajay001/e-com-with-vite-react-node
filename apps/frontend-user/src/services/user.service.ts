import { api } from './api';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  telephone: string;
  isVerified: boolean;
  roles: Array<{
    role: {
      name: string;
    };
  }>;
}

interface UserParams {
  page?: number;
  limit?: number;
  sortBy?: 'id' | 'email' | 'firstName' | 'lastName' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  search?: string;
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

export const userService = {
  getUsers: async (params: UserParams): Promise<PaginatedResponse<User>> => {
    const { data } = await api.get('/api/v1/users', { params });
    return data;
  },

  createUser: async (userData: Partial<User>) => {
    const { data } = await api.post('/api/v1/users', userData);
    return data;
  },

  updateUser: async (id: number, userData: Partial<User>) => {
    const { data } = await api.put(`/api/v1/users/${id}`, userData);
    return data;
  },

  deleteUser: async (id: number) => {
    await api.delete(`/api/v1/users/${id}`);
  },
};
