import { z } from 'zod';
import { AddressType } from '../types/address.types';

export const createAddressSchema = z.object({
  userId: z.number({
    required_error: 'User ID is required',
    invalid_type_error: 'User ID must be a number',
  }),
  addressLine1: z
    .string({
      required_error: 'Address line 1 is required',
    })
    .min(1, 'Address line 1 is required'),
  addressLine2: z.string().optional(),
  city: z
    .string({
      required_error: 'City is required',
    })
    .min(2, 'City must be at least 2 characters')
    .max(50, 'City must be at most 50 characters'),
  postalCode: z
    .string({
      required_error: 'Postal code is required',
    })
    .min(4, 'Postal code must be at least 4 characters')
    .max(10, 'Postal code must be at most 10 characters'),
  country: z
    .string({
      required_error: 'Country is required',
    })
    .min(2, 'Country must be at least 2 characters')
    .max(50, 'Country must be at most 50 characters'),
  telephone: z
    .string()
    .min(10, 'Telephone must be at least 10 digits')
    .max(15, 'Telephone must be at most 15 digits')
    .optional(),
  mobile: z
    .string()
    .min(10, 'Mobile must be at least 10 digits')
    .max(15, 'Mobile must be at most 15 digits')
    .optional(),
  addressType: z.nativeEnum(AddressType, {
    errorMap: () => ({ message: 'Address type must be one of: HOME, WORK, OTHER' }),
  }),
});

export const updateAddressSchema = createAddressSchema.partial();

export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
