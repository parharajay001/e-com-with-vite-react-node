export enum PaymentType {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  PAYPAL = 'PAYPAL',
  BANK_TRANSFER = 'BANK_TRANSFER',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELED = 'CANCELED',
  RETURNED = 'RETURNED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum UserRoleType {
  USER = 'USER',
  ADMIN = 'ADMIN',
  CUSTOMER = 'CUSTOMER',
  SELLER = 'SELLER',
}

export type ProductCategory = {
  id: number;
  name: string;
  description?: string | null;
  createdAt: Date;
  modifiedAt: Date;
  deletedAt?: Date | null;
};

export type ProductInventory = {
  id: number;
  quantity: number;
  lowStockThreshold: number;
  createdAt: Date;
  modifiedAt: Date;
  deletedAt?: Date | null;
};

export type Discount = {
  id: number;
  name: string;
  description?: string | null;
  discountPercent: number;
  active: boolean;
  createdAt: Date;
  modifiedAt: Date;
  deletedAt?: Date | null;
};

export type Product = {
  id: number;
  name: string;
  description?: string | null;
  SKU: string;
  categoryId: number;
  inventoryId: number;
  price: number;
  discountId?: number | null;
  createdAt: Date;
  modifiedAt: Date;
  deletedAt?: Date | null;
  version: number;
  wishlistId?: number | null;
};

export type ProductVariant = {
  id: number;
  productId: number;
  sku: string;
  options: Record<string, any>;
  price?: number | null;
  createdAt: Date;
  modifiedAt: Date;
};

export type ProductImage = {
  id: number;
  productId: number;
  imageUrl: string;
  createdAt: Date;
  deletedAt?: Date | null;
};

export type User = {
  id: number;
  email: string;
  password: string;
  firstName: string;
  lastName?: string | null;
  telephone?: string | null;
  isVerified: boolean;
  otp?: string | null;
  otpExpiry?: Date | null;
  profilePicture?: string | null;
  createdAt: Date;
  modifiedAt: Date;
  deletedAt?: Date | null;
  lastLogin?: Date | null;
  failedLoginAttempts: number;
  accountLocked: boolean;
};

export type Role = {
  id: number;
  name: UserRoleType;
  description?: string | null;
  createdAt: Date;
  modifiedAt: Date;
  deletedAt?: Date | null;
};

export type UserRole = {
  id: number;
  userId: number;
  roleId: number;
};

export type UserAddress = {
  id: number;
  userId: number;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  postalCode: string;
  country: string;
  telephone?: string | null;
  mobile?: string | null;
  addressType: string;
  createdAt: Date;
  modifiedAt: Date;
  deletedAt?: Date | null;
};

export type UserPayment = {
  id: number;
  userId: number;
  paymentType: PaymentType;
  provider: string;
  accountNo: string;
  expiryMonth: number;
  expiryYear: number;
  isPrimary: boolean;
  verified: boolean;
  createdAt: Date;
  modifiedAt: Date;
  deletedAt?: Date | null;
};

export type ShoppingSession = {
  id: number;
  userId: number;
  currency: string;
  createdAt: Date;
  modifiedAt: Date;
};

export type CartItem = {
  id: number;
  sessionId: number;
  productId: number;
  quantity: number;
  createdAt: Date;
  modifiedAt: Date;
};

export type OrderDetails = {
  id: number;
  userId: number;
  total: number;
  paymentId?: number | null;
  status: OrderStatus;
  shippingCost?: number | null;
  trackingNumber?: string | null;
  estimatedDelivery?: Date | null;
  currency: string;
  createdAt: Date;
  modifiedAt: Date;
  version: number;
};

export type OrderItems = {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  priceAtPurchase: number;
  createdAt: Date;
  modifiedAt: Date;
};

export type PaymentDetails = {
  id: number;
  orderId: number;
  amount: number;
  provider: string;
  status: PaymentStatus;
  transactionId?: string | null;
  currency: string;
  createdAt: Date;
  modifiedAt: Date;
};

export type AuditLog = {
  id: number;
  entityId: number;
  entityType: string;
  action: string;
  oldValue?: Record<string, any> | null;
  newValue?: Record<string, any> | null;
  userId?: number | null;
  createdAt: Date;
};

export type Tax = {
  id: number;
  country: string;
  state?: string | null;
  rate: number;
  createdAt: Date;
  modifiedAt: Date;
};

export type Wishlist = {
  id: number;
  userId: number;
  createdAt: Date;
  modifiedAt: Date;
};
