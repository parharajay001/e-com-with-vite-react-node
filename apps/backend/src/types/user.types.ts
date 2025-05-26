import { User, UserAddress, UserPayment, UserRole } from '@prisma/client';

export interface UserCreateInput {
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
  telephone?: string;
  profilePicture?: string;
}

export interface UserUpdateInput {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  telephone?: string;
  profilePicture?: string;
  isVerified?: boolean;
}

export interface UserWithRelations extends User {
  addresses: UserAddress[];
  payments: UserPayment[];
  roles: (UserRole & {
    role: {
      name: string;
      description: string | null;
    };
  })[];
}
