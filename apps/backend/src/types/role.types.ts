import { UserRoleType } from '@prisma/client';

export interface RoleCreateInput {
  name: UserRoleType;
  description?: string;
}

export interface RoleUpdateInput {
  name?: UserRoleType;
  description?: string;
}
