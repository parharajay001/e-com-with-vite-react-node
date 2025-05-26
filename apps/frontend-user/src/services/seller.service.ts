import { api } from './api';

export interface Seller {
  id: number;
  userId: number;
  businessName: string;
  description?: string;
  logo?: string;
  website?: string;
  taxId?: string;
  status: string;
  rating: number;
  totalSales: number;
  commissionRate: number;
  createdAt: string;
  modifiedAt: string;
  user?: {
    email: string;
    firstName: string;
    lastName: string;
    telephone?: string;
  };
}

export interface SellerProduct {
  id: number;
  sellerId: number;
  productId: number;
  price: number;
  quantity: number;
  status: string;
  product: {
    name: string;
    description?: string;
    SKU: string;
    category: {
      name: string;
    };
    productImage: {
      imageUrl: string;
    }[];
  };
}

interface SellerParams {
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
    pageSize: number;
    totalPages: number;
  };
}

export const sellerService = {
  getSellers: async (params: SellerParams): Promise<PaginatedResponse<Seller>> => {
    const { data } = await api.get('/api/v1/sellers', { params });
    return data;
  },

  getSellerById: async (id: number): Promise<Seller> => {
    const { data } = await api.get(`/api/v1/sellers/${id}`);
    return data;
  },

  createSeller: async (userId: number, sellerData: Partial<Seller>) => {
    const { data } = await api.post(`/api/v1/sellers/users/${userId}`, sellerData);
    return data;
  },

  updateSeller: async (id: number, sellerData: Partial<Seller>) => {
    const { data } = await api.put(`/api/v1/sellers/${id}`, sellerData);
    return data;
  },

  deleteSeller: async (id: number) => {
    await api.delete(`/api/v1/sellers/${id}`);
  },

  getSellerProducts: async (
    sellerId: number,
    params: SellerParams,
  ): Promise<PaginatedResponse<SellerProduct>> => {
    const { data } = await api.get(`/api/v1/sellers/${sellerId}/products`, { params });
    return data;
  },
};