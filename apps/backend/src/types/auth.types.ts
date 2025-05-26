import { UserRole, UserRoleType } from '@prisma/client';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

interface User {
  id: number;
  email: string;
  firstName: string;
  isVerified: boolean;
  createdAt: Date;
  modifiedAt: Date;
  roles: UserRole[];
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string | null;
  telephone?: string | null;
  role?: UserRoleType | null;
}

export interface AuthResponse {
  token: string;
  user: User;
}
