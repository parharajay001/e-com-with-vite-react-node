export enum AddressType {
  SHIPPING = 'SHIPPING',
  BILLING = 'BILLING',
  BOTH = 'BOTH',
}

export interface AddressCreateInput {
  userId: number;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postalCode: string;
  country: string;
  telephone?: string;
  mobile?: string;
  addressType: AddressType;
}

export interface AddressUpdateInput {
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  telephone?: string;
  mobile?: string;
  addressType?: AddressType;
}
