import { UserRoleType } from '@prisma/client';
import { z } from 'zod';

export const addUserSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Za-z]/, 'Password must contain at least one letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
    .optional(),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  telephone: z.string().min(10),
  role: z.nativeEnum(UserRoleType).optional(),
});

export const updateUserSchema = z.object({
  email: z.string().email().optional(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Za-z]/, 'Password must contain at least one letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
    .optional(),
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  telephone: z.string().min(10).optional(),
  role: z.nativeEnum(UserRoleType).optional(),
});

export default {
  addUserSchema,
  updateUserSchema,
};

export type AddUserInput = z.infer<typeof addUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
