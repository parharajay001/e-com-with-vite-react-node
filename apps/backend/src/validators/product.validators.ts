import { z } from 'zod';

export const addProductSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().min(10).max(1000).optional(),
  SKU: z.string().min(3).max(50),
  categoryId: z.number().optional(),
  price: z.number().min(0),
  inventory: z
    .object({
      quantity: z.number().min(0).optional(),
    })
    .default({ quantity: 0 }),
  brand: z.string().max(50).optional(),
  weight: z.number().min(0).optional(),
  dimensions: z
    .object({
      length: z.number().min(0),
      width: z.number().min(0),
      height: z.number().min(0),
    })
    .optional(),
  tags: z.array(z.string()).optional(),
  isPublished: z.boolean().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  metaTitle: z.string().optional(),
});

export const updateProductSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  description: z.string().min(10).max(1000).optional(),
  SKU: z.string().min(3).max(50).optional(),
  categoryId: z.number().optional(),
  price: z.number().min(0).optional(),
  inventory: z
    .object({
      quantity: z.number().min(0).optional(),
    })
    .default({ quantity: 0 }),
  brand: z.string().max(50).optional(),
  weight: z.number().min(0).optional(),
  dimensions: z
    .object({
      length: z.number().min(0),
      width: z.number().min(0),
      height: z.number().min(0),
    })
    .optional(),
  tags: z.array(z.string()).optional(),
  isPublished: z.boolean().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  metaTitle: z.string().optional(),
});

export const addVariantSchema = z.object({
  sku: z.string().min(3).max(50),
  options: z
    .object({
      color: z.string(),
      material: z.string(),
      size: z.string(),
    })
    .optional(),
  price: z.number().min(0).optional(),
});

export const updateVariantSchema = z.object({
  sku: z.string().min(3).max(50).optional(),
  options: z
    .object({
      color: z.string(),
      material: z.string(),
      size: z.string(),
    })
    .optional(),
  price: z.number().min(0).optional(),
});

export type AddProductInput = z.infer<typeof addProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type AddVariantInput = z.infer<typeof addVariantSchema>;
export type UpdateVariantInput = z.infer<typeof updateVariantSchema>;
