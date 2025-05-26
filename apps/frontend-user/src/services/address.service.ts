import { api } from './api';

export interface Address {
  id: number;
  userId: number;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postalCode: string;
  country: string;
  telephone?: string;
  mobile?: string;
  addressType: string;
  createdAt: string;
  modifiedAt: string;
  deletedAt?: string;
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

export const addressService = {
  getAddresses: async (userId: number): Promise<PaginatedResponse<Address>> => {
    const { data } = await api.get(`/api/v1/users/${userId}/addresses`);
    return data;
  },

  createAddress: async (address: Partial<Address>) => {
    const { data } = await api.post('/api/v1/addresses', address);
    return data;
  },

  updateAddress: async (id: number, address: Partial<Address>) => {
    const { data } = await api.put(`/api/v1/addresses/${id}`, address);
    return data;
  },

  deleteAddress: async (id: number) => {
    await api.delete(`/api/v1/addresses/${id}`);
  },
};
