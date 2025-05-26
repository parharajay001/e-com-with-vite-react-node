import { Prisma, PrismaClient, UserRoleType } from '@prisma/client';
import bcrypt from 'bcrypt';
import _ from 'lodash';
import { envConfig } from '../config/envConfig';
import { RegisterInput } from '../types/auth.types';
import { DatabaseError, getPrismaErrorMessage } from '../utils/errors';
// Singleton Prisma client instance
const prisma = new PrismaClient();

/** Unified error handler for database operations */
function handleDatabaseError(error: unknown, context: string): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    throw new Error(`Database error: ${context} ${getPrismaErrorMessage(error)}`);
  }
  if (error instanceof Error) {
    throw new Error(`${context}: ${error.message}`);
  }
  throw new Error(`${context}: Unknown error occurred`);
}

export const createUser = async (userData: RegisterInput) => {
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

    const hashedPassword = await bcrypt.hash(
      `${userData.firstName}@${userData.telephone?.substring(userData.telephone.length - 4, userData.telephone.length)}`,
      envConfig.auth.saltRounds,
    );
    const roleName = userData?.role || UserRoleType.USER;
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
    return user;
  } catch (error: unknown) {
    handleDatabaseError(error, 'User creation failed');
  }
};

export const getUserById = async (userId: number) => {
  try {
    return await prisma.user.findUnique({
      where: { id: userId },
      include: {
        addresses: true,
        roles: {
          include: {
            role: true,
          },
        },
      },
    });
  } catch (error: unknown) {
    handleDatabaseError(error, `Failed to fetch user ${userId}`);
  }
};

export const updateUser = async (
  userId: number,
  userData: Prisma.UserUpdateInput & { role?: string },
) => {
  try {
    // First get the role ID for the new role
    const role = await prisma.role.findUnique({
      where: { name: userData.role as UserRoleType },
    });

    if (userData.role && !role) {
      throw new DatabaseError('Selected role is not available', 'ROLE_NOT_FOUND', [
        `Role ${userData.role} does not exist in the system`,
      ]);
    }

    // Extract role from userData since it's not a direct field
    const userUpdateData = _.omit(userData, 'role');

    // Update the user in a transaction to handle both user data and role
    return await prisma.$transaction(async (tx) => {
      // Update user base data
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          ...userUpdateData,
          // If role is provided, update the user's roles
          ...(role && {
            roles: {
              deleteMany: {}, // Remove existing roles
              create: {
                roleId: role.id,
              },
            },
          }),
        },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      });

      return updatedUser;
    });
  } catch (error: unknown) {
    handleDatabaseError(error, `Failed to update user ${userId}`);
  }
};

export const getUsers = async (
  page: number,
  limit: number,
  sortBy?: keyof Prisma.UserWhereInput,
  sortOrder: 'asc' | 'desc' = 'asc',
) => {
  try {
    const validSortFields = [
      'id',
      'email',
      'firstName',
      'lastName',
      'telephone',
      'createdAt',
      'updatedAt',
    ];
    if (sortBy && !validSortFields.includes(sortBy)) {
      throw new Error(`Invalid sort field: ${sortBy}`);
    }

    const [total, users] = await prisma.$transaction([
      prisma.user.count(),
      prisma.user.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: sortBy ? { [sortBy]: sortOrder } : { modifiedAt: 'desc' },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        pageSize: limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error: unknown) {
    handleDatabaseError(error, 'Failed to fetch users');
  }
};

export const deleteUser = async (userId: number) => {
  try {
    return await prisma.$transaction(async (tx) => {
      await deleteUserDependencies(tx, userId);

      return tx.user.delete({
        where: { id: userId },
        select: { id: true }, // Optimize response by only returning ID
      });
    });
  } catch (error: unknown) {
    handleDatabaseError(error, `Failed to delete user ${userId}`);
  }
};

/** Helper to delete all user-related entities */
async function deleteUserDependencies(tx: Prisma.TransactionClient, userId: number) {
  // Get order IDs first
  const orders = await tx.orderDetails.findMany({
    where: { userId },
    select: { id: true },
  });
  const orderIds = orders.map((o) => o.id);

  // Delete order-related entities first (child tables)
  await Promise.all([
    tx.orderItems.deleteMany({
      where: { orderId: { in: orderIds } },
    }),
    tx.paymentDetails.deleteMany({
      where: { orderId: { in: orderIds } },
    }),
  ]);

  // Then delete the orders themselves
  await tx.orderDetails.deleteMany({ where: { userId } });

  // Get shopping sessions
  const sessions = await tx.shoppingSession.findMany({
    where: { userId },
    select: { id: true },
  });

  // Delete cart items first
  await tx.cartItem.deleteMany({
    where: { sessionId: { in: sessions.map((s) => s.id) } },
  });

  // Delete remaining user-related entities
  await Promise.all([
    tx.userRole.deleteMany({ where: { userId } }),
    tx.userAddress.deleteMany({ where: { userId } }),
    tx.userPayment.deleteMany({ where: { userId } }),
    tx.shoppingSession.deleteMany({ where: { userId } }),
    tx.wishlist.deleteMany({ where: { userId } }),
  ]);
}

export default {
  createUser,
  getUserById,
  updateUser,
  getUsers,
  deleteUser,
};
