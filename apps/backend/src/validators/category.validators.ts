import { z } from 'zod';

export const addCategorySchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be at most 50 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be at most 500 characters')
    .optional(),
});

export const updateCategorySchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be at most 50 characters')
    .optional(),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be at most 500 characters')
    .optional(),
  imageUrl: z
    .string()
    .url('Image URL must be a valid URL')
    .optional(),
});

export type AddCategoryInput = z.infer<typeof addCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
