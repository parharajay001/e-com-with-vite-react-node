import { Prisma, PrismaClient } from '@prisma/client';
import { RoleCreateInput, RoleUpdateInput } from '../types/role.types';
import { DatabaseError, getPrismaErrorMessage } from '../utils/errors';

const prisma = new PrismaClient();

function handleDatabaseError(error: unknown, context: string): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const message = getPrismaErrorMessage(error);
    throw new DatabaseError(message, error.code);
  }
  throw new DatabaseError(
    error instanceof Error ? error.message : 'An unknown error occurred',
    'UNKNOWN_ERROR',
    [context],
  );
}

export const createRole = async (roleData: RoleCreateInput) => {
  try {
    // Check if role name exists
    const existingRole = await prisma.role.findUnique({
      where: { name: roleData.name },
    });

    if (existingRole) {
      throw new DatabaseError(`Role ${roleData.name} already exists`, 'DUPLICATE_ENTRY', [
        'Please use a different role name',
      ]);
    }

    return await prisma.role.create({
      data: roleData,
      include: {
        _count: {
          select: { users: true },
        },
      },
    });
  } catch (error: unknown) {
    handleDatabaseError(error, 'Failed to create role');
  }
};

export const getRoles = async (
  page: number,
  limit: number,
  sortBy?: keyof Prisma.RoleWhereInput,
  sortOrder: 'asc' | 'desc' = 'asc',
  includeDeleted = false,
) => {
  try {
    const validSortFields = ['id', 'name', 'createdAt'];
    if (sortBy && !validSortFields.includes(sortBy)) {
      throw new Error(`Invalid sort field: ${sortBy}`);
    }

    const where = includeDeleted ? {} : { deletedAt: null };

    const [total, roles] = await prisma.$transaction([
      prisma.role.count({ where }),
      prisma.role.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: sortBy ? { [sortBy]: sortOrder } : { modifiedAt: 'desc' },
        include: {
          _count: {
            select: { users: true },
          },
        },
      }),
    ]);

    return {
      data: roles,
      meta: {
        total,
        page,
        pageSize: limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error: unknown) {
    handleDatabaseError(error, 'Failed to fetch roles');
  }
};

export const updateRole = async (roleId: number, roleData: RoleUpdateInput) => {
  try {
    // Check if role exists
    const existingRole = await prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!existingRole) {
      throw new DatabaseError('Role not found', 'NOT_FOUND');
    }

    // Check if new role name already exists
    if (roleData.name) {
      const duplicateRole = await prisma.role.findFirst({
        where: {
          name: roleData.name,
          NOT: { id: roleId },
        },
      });

      if (duplicateRole) {
        throw new DatabaseError(`Role ${roleData.name} already exists`, 'DUPLICATE_ENTRY', [
          'Please use a different role name',
        ]);
      }
    }

    return await prisma.role.update({
      where: { id: roleId },
      data: roleData,
      include: {
        _count: {
          select: { users: true },
        },
      },
    });
  } catch (error: unknown) {
    handleDatabaseError(error, `Failed to update role ${roleId}`);
  }
};

export const deleteRole = async (roleId: number) => {
  try {
    return await prisma.$transaction(async (tx) => {
      // Check if role exists
      const role = await tx.role.findUnique({
        where: { id: roleId },
        include: {
          _count: {
            select: { users: true },
          },
        },
      });

      if (!role) {
        throw new DatabaseError('Role not found', 'NOT_FOUND');
      }

      // Check if role is in use
      if (role._count.users > 0) {
        throw new DatabaseError('Cannot delete role that is assigned to users', 'ROLE_IN_USE', [
          'Remove this role from all users first',
        ]);
      }

      // Soft delete the role
      return await tx.role.update({
        where: { id: roleId },
        data: { deletedAt: new Date() },
      });
    });
  } catch (error: unknown) {
    handleDatabaseError(error, `Failed to delete role ${roleId}`);
  }
};

export default {
  createRole,
  getRoles,
  updateRole,
  deleteRole,
};
