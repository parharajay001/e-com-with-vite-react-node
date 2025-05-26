import { z } from 'zod';

export const addSellerSchema = z.object({
  businessName: z.string().min(3).max(100),
  description: z.string().min(10).max(1000).optional(),
  logo: z.string().optional(),
  website: z.string().url().optional(),
  taxId: z.string().min(1).max(50).optional(),
  commissionRate: z.number().min(0).max(100).optional(),
});

export const updateSellerSchema = z.object({
  businessName: z.string().min(3).max(100).optional(),
  description: z.string().min(10).max(1000).optional(),
  logo: z.string().optional(),
  website: z.string().url().optional(),
  taxId: z.string().min(1).max(50).optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED']).optional(),
  commissionRate: z.number().min(0).max(100).optional(),
});

export type AddSellerInput = z.infer<typeof addSellerSchema>;
export type UpdateSellerInput = z.infer<typeof updateSellerSchema>;