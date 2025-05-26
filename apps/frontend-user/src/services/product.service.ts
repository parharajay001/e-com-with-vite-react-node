import { api } from './api';

export interface ProductVariant {
  id?: number;
  sku: string;
  options: Record<string, unknown>;
  price?: number;
}

export interface ProductImage {
  id: number;
  imageUrl: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  SKU: string;
  category: {
    id: number;
    name: string;
  };
  categoryId: number;
  inventoryId: number;
  price: number;
  discountId?: number;
  brand?: string;
  weight?: number;
  inventory?: { quantity?: number };
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  tags: string[];
  isPublished: boolean;
  averageRating?: number;
  totalReviews: number;
  variants: ProductVariant[];
  productImage: ProductImage[];
  createdAt: string;
  modifiedAt: string;
}

interface ProductParams {
  page?: number;
  limit?: number;
  sortBy?: 'id' | 'name' | 'price' | 'createdAt';
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

export const productService = {
  getProducts: async (params: ProductParams): Promise<PaginatedResponse<Product>> => {
    const { data } = await api.get('/api/v1/products', { params });
    return data;
  },

  getProductById: async (id: number): Promise<Product> => {
    const { data } = await api.get(`/api/v1/products/${id}`);
    return data;
  },

  createProduct: async (productData: Partial<Product>) => {
    const { data } = await api.post('/api/v1/products', productData);
    return data;
  },

  updateProduct: async (id: number, productData: Partial<Product>) => {
    const { data } = await api.put(`/api/v1/products/${id}`, productData);
    return data;
  },

  updateProductImages: async (id: number, formdata: FormData) => {
    return await api.put(`/api/v1/products/${id}/images`, formdata, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  //todo
  deleteProductImages: async (id: number, formdata: { images: { imageUrl: string }[] }) => {
    return await api.delete(`/api/v1/products/${id}/images`, {
      data: formdata,
    });
  },

  deleteProduct: async (id: number) => {
    await api.delete(`/api/v1/products/${id}`);
  },

  // New variant-specific methods
  getProductVariants: async (productId: number): Promise<ProductVariant[]> => {
    const { data } = await api.get(`/api/v1/products/${productId}/variants`);
    return data;
  },

  createVariant: async (productId: number, variantData: Omit<ProductVariant, 'id'>) => {
    const { data } = await api.post(`/api/v1/products/${productId}/variants`, variantData);
    return data;
  },

  updateVariant: async (
    productId: number,
    variantId: number,
    variantData: Partial<ProductVariant>,
  ) => {
    const { data } = await api.put(
      `/api/v1/products/${productId}/variants/${variantId}`,
      variantData,
    );
    return data;
  },

  deleteVariant: async (productId: number, variantId: number) => {
    await api.delete(`/api/v1/products/${productId}/variants/${variantId}`);
  },
};

export const fetchImageUrl = async (imageUrl: string): Promise<string> => {
  const response = await api.get(imageUrl, {
    responseType: 'arraybuffer',
  });
  return response.data;
};
