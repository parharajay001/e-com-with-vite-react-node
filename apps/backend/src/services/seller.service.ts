import { Prisma, PrismaClient } from '@prisma/client';
import { DatabaseError } from '../utils/errors';
import { AddSellerInput, UpdateSellerInput } from '../validators/seller.validators';

const prisma = new PrismaClient();

function handleDatabaseError(error: unknown, context: string): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    throw new DatabaseError(
      `Database error: ${context}`,
      error.code,
      error.meta?.cause ? [error.meta.cause as string] : undefined,
    );
  }
  if (error instanceof Error) {
    throw new DatabaseError(`Database error: ${context}`, 'UNKNOWN_ERROR', [error.message]);
  }
  throw new DatabaseError(`Database error: ${context}`, 'UNKNOWN_ERROR');
}

export const createSeller = async (userId: number, sellerData: AddSellerInput) => {
  try {
    const existingSeller = await prisma.seller.findUnique({
      where: { userId },
    });

    if (existingSeller) {
      throw new DatabaseError('User is already registered as a seller', 'DUPLICATE_ENTRY', [
        'Please use a different user account',
      ]);
    }

    return await prisma.seller.create({
      data: {
        ...sellerData,
        userId,
      },
    });
  } catch (error: unknown) {
    handleDatabaseError(error, 'Failed to create seller');
  }
};

export const getSellerById = async (id: number) => {
  try {
    return await prisma.seller.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
            telephone: true,
          },
        },
      },
    });
  } catch (error: unknown) {
    handleDatabaseError(error, `Failed to fetch seller ${id}`);
  }
};

export const updateSeller = async (id: number, sellerData: UpdateSellerInput) => {
  try {
    return await prisma.seller.update({
      where: { id },
      data: sellerData,
    });
  } catch (error: unknown) {
    handleDatabaseError(error, `Failed to update seller ${id}`);
  }
};

export const getSellers = async (
  page: number,
  limit: number,
  sortBy?: keyof Prisma.SellerWhereInput,
  sortOrder: 'asc' | 'desc' = 'asc',
) => {
  try {
    const validSortFields = ['id', 'businessName', 'status', 'rating', 'totalSales', 'createdAt'];
    if (sortBy && !validSortFields.includes(sortBy)) {
      throw new Error(`Invalid sort field: ${sortBy}`);
    }

    const [total, sellers] = await prisma.$transaction([
      prisma.seller.count(),
      prisma.seller.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ [sortBy || 'createdAt']: sortOrder }],
        include: {
          user: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
              telephone: true,
            },
          },
        },
      }),
    ]);

    return {
      data: sellers,
      meta: {
        total,
        page,
        pageSize: limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error: unknown) {
    handleDatabaseError(error, 'Failed to fetch sellers');
  }
};

export const deleteSeller = async (id: number) => {
  try {
    // Check if seller has associated products
    const productsCount = await prisma.sellerProduct.count({
      where: { sellerId: id },
    });

    if (productsCount > 0) {
      throw new DatabaseError(
        'Cannot delete seller with associated products',
        'CONSTRAINT_VIOLATION',
        ['Please remove all seller products first'],
      );
    }

    return await prisma.seller.delete({
      where: { id },
    });
  } catch (error: unknown) {
    handleDatabaseError(error, `Failed to delete seller ${id}`);
  }
};

export const getSellerProducts = async (
  sellerId: number,
  page: number,
  limit: number,
  sortBy?: keyof Prisma.SellerProductWhereInput,
  sortOrder: 'asc' | 'desc' = 'asc',
) => {
  try {
    const [total, products] = await prisma.$transaction([
      prisma.sellerProduct.count({ where: { sellerId } }),
      prisma.sellerProduct.findMany({
        where: { sellerId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: sortBy ? { [sortBy]: sortOrder } : { id: 'desc' },
        include: {
          product: {
            include: {
              category: true,
              productImage: true,
            },
          },
        },
      }),
    ]);

    return {
      data: products,
      meta: {
        total,
        page,
        pageSize: limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error: unknown) {
    handleDatabaseError(error, `Failed to fetch seller products for seller ${sellerId}`);
  }
};

export default {
  createSeller,
  getSellerById,
  updateSeller,
  getSellers,
  deleteSeller,
  getSellerProducts,
};
