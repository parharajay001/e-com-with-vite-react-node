import { OrderStatus } from '@prisma/client';
import { z } from 'zod';

export const updateOrderSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});

export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;