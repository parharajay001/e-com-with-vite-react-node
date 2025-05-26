import { z } from 'zod';

export const addTaxSchema = z.object({
  country: z.string().min(2).max(3),
  state: z.string().min(1).max(50).optional(),
  rate: z.number().min(0).max(1),
});

export const updateTaxSchema = addTaxSchema.partial();

export type AddTaxInput = z.infer<typeof addTaxSchema>;
export type UpdateTaxInput = z.infer<typeof updateTaxSchema>;