import { UserRoleType } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { envConfig } from '../config/envConfig';
import { prisma } from '../config/prisma';
import { AuthResponse, LoginInput, RegisterInput } from '../types/auth.types';
import { AuthenticationError, DatabaseError } from '../utils/errors';

// Validate environment variables
// Validated environment variables from config
const {
  auth: { jwtSecret, saltRounds, jwtExpiresIn },
} = envConfig;

// JWT expiration time handling (supports numeric seconds or vercel/ms format strings)
const JWT_OPTIONS: jwt.SignOptions = {
  expiresIn: jwtExpiresIn, // Default to 1 hour
  algorithm: 'HS256',
};

export const register = async (userData: RegisterInput): Promise<AuthResponse> => {
  try {
    // Check if email exists first
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new DatabaseError(
        `User with email ${userData.email} already exists`,
        'DUPLICATE_ENTRY',
        ['Try logging in instead or use a different email address'],
      );
    }

    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
    const roleName = userData.role || UserRoleType.USER;
    const role = await prisma.role.findUnique({
      where: {
        name: roleName as UserRoleType,
      },
    });

    if (!role) {
      throw new DatabaseError('Selected role is not available', 'ROLE_NOT_FOUND', [
        `Role ${roleName} does not exist in the system`,
      ]);
    }

    const user = await prisma.user.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        telephone: userData.telephone,
        roles: {
          create: {
            roleId: role.id,
          },
        },
      },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
      omit: { password: true },
    });

    const token = jwt.sign(
      {
        userId: user.id,
        roles: user.roles.map((r: { role: { name: string } }) => r.role.name),
        tokenVersion: 1,
      },
      jwtSecret,
      JWT_OPTIONS,
    );

    return {
      token,
      user,
    };
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new DatabaseError(
        `User with email ${userData.email} already exists`,
        'DUPLICATE_ENTRY',
        ['Try logging in instead or use a different email address'],
      );
    }
    throw error; // Let other errors be handled by the global error handler
  }
};

export const login = async (credentials: LoginInput): Promise<AuthResponse> => {
  const userData = await prisma.user.findUnique({
    where: { email: credentials.email },
    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
  });

  if (!userData) {
    throw new AuthenticationError('User not found with this email');
  }

  const { password, ...user } = userData;

  const isValidPassword = await bcrypt.compare(credentials.password, password);
  if (!isValidPassword) {
    throw new AuthenticationError('Invalid password');
  }

  const token = jwt.sign(
    {
      userId: user.id,
      roles: user.roles.map((r: { role: { name: string } }) => r.role.name),
    },
    jwtSecret,
    JWT_OPTIONS,
  );

  return {
    token,
    user,
  };
};

export const verifyToken = async (token: string) => {
  try {
    const decoded = jwt.verify(token, jwtSecret) as { userId: number };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
      omit: { password: true },
    });

    if (!user) {
      throw new DatabaseError('User not found', 'USER_NOT_FOUND');
    }

    return user;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new AuthenticationError(`Authentication failed: ${error.message}`);
    }
    throw new AuthenticationError('Invalid authentication token');
  }
};

export default {
  register,
  login,
  verifyToken,
};
