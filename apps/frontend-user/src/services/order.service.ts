import { api } from './api';
import { OrderStatus, PaymentStatus } from '../types/enums';

export interface OrderItem {
  id: number;
  productId: number;
  orderId: number;
  quantity: number;
  price: number;
  product: {
    id: number;
    name: string;
    SKU: string;
    price: number;
  };
}

export interface PaymentDetails {
  id: number;
  orderId: number;
  amount: number;
  provider: string;
  status: PaymentStatus;
  transactionId: string;
}

export interface Order {
  id: number;
  userId: number;
  status: OrderStatus;
  total: number;
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  currency: string;
  trackingNumber: string | null;
  estimatedDelivery: string | null;
  shippingAddress: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    postalCode: string;
    country: string;
    telephone: string;
  };
  billingAddress: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    postalCode: string;
    country: string;
    telephone: string;
  };
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  orderItems: OrderItem[];
  paymentDetails: PaymentDetails;
  createdAt: string;
  modifiedAt: string;
}

interface OrderParams {
  page?: number;
  limit?: number;
  sortBy?: 'id' | 'status' | 'total' | 'createdAt';
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

export const orderService = {
  getOrders: async (params: OrderParams): Promise<PaginatedResponse<Order>> => {
    const { data } = await api.get('/api/v1/orders', { params });
    return data;
  },

  getOrderById: async (id: number): Promise<Order> => {
    const { data } = await api.get(`/api/v1/orders/${id}`);
    return data;
  },

  updateOrderStatus: async (id: number, status: OrderStatus) => {
    const { data } = await api.put(`/api/v1/orders/${id}`, { status });
    return data;
  },

  deleteOrder: async (id: number) => {
    await api.delete(`/api/v1/orders/${id}`);
  },
};