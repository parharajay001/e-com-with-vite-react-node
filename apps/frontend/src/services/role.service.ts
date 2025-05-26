import { api } from './api';

export enum UserRoleType {
  ADMIN = 'ADMIN',
  USER = 'USER',
  SELLER = 'SELLER',
  CUSTOMER = 'CUSTOMER',
}

export interface Role {
  id: number;
  name: UserRoleType;
  description?: string | null;
  createdAt: string;
  modifiedAt: string;
  deletedAt?: string | null;
  _count?: {
    users: number;
  };
}

interface RoleParams {
  page?: number;
  limit?: number;
  sortBy?: 'id' | 'name' | 'createdAt';
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

export const roleService = {
  getRoles: async (params: RoleParams): Promise<PaginatedResponse<Role>> => {
    const { data } = await api.get('/api/v1/roles', { params });
    return data;
  },

  createRole: async (roleData: Partial<Role>) => {
    const { data } = await api.post('/api/v1/roles', roleData);
    return data;
  },

  updateRole: async (id: number, roleData: Partial<Role>) => {
    const { data } = await api.put(`/api/v1/roles/${id}`, roleData);
    return data;
  },

  deleteRole: async (id: number) => {
    await api.delete(`/api/v1/roles/${id}`);
  },
};
