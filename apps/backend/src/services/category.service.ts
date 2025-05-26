import fs from 'fs';
import path from 'path';
import { Prisma, PrismaClient } from '@prisma/client';
import { DatabaseError } from '../utils/errors';
import { AddCategoryInput, UpdateCategoryInput } from '../validators/category.validators';

const prisma = new PrismaClient();

function handleDatabaseError(error: unknown, context: string): never {
  throw new DatabaseError(
    error instanceof Error ? error.message : 'Unknown database error',
    'OPERATION_FAILED',
    [context],
  );
}

export const createCategory = async (categoryData: AddCategoryInput) => {
  try {
    // Check if category name exists
    const existingCategory = await prisma.productCategory.findFirst({
      where: { name: categoryData.name },
    });

    if (existingCategory) {
      throw new DatabaseError(
        `Category with name ${categoryData.name} already exists`,
        'DUPLICATE_ENTRY',
        ['Please use a different category name'],
      );
    }

    return await prisma.productCategory.create({
      data: categoryData,
    });
  } catch (error: unknown) {
    handleDatabaseError(error, 'Category creation failed');
  }
};

export const getCategoryById = async (categoryId: number) => {
  try {
    return await prisma.productCategory.findUnique({
      where: { id: categoryId },
    });
  } catch (error: unknown) {
    handleDatabaseError(error, `Failed to fetch category ${categoryId}`);
  }
};

export const updateCategory = async (categoryId: number, categoryData: UpdateCategoryInput) => {
  try {
    // Check if category exists
    const existingCategory = await prisma.productCategory.findUnique({
      where: { id: categoryId },
    });

    if (!existingCategory) {
      throw new DatabaseError('Category not found', 'NOT_FOUND');
    }

    // If name is being updated, check for duplicates
    if (categoryData.name) {
      const duplicateName = await prisma.productCategory.findFirst({
        where: {
          name: categoryData.name,
          id: { not: categoryId },
        },
      });

      if (duplicateName) {
        throw new DatabaseError(
          `Category with name ${categoryData.name} already exists`,
          'DUPLICATE_ENTRY',
          ['Please use a different category name'],
        );
      }
    }

    return await prisma.productCategory.update({
      where: { id: categoryId },
      data: categoryData,
    });
  } catch (error: unknown) {
    handleDatabaseError(error, `Failed to update category ${categoryId}`);
  }
};

export const getCategories = async (
  page: number,
  limit: number,
  sortBy?: keyof Prisma.ProductCategoryWhereInput,
  sortOrder: 'asc' | 'desc' = 'asc',
) => {
  try {
    const validSortFields = ['id', 'name', 'createdAt'];
    if (sortBy && !validSortFields.includes(sortBy)) {
      throw new Error(`Invalid sort field: ${sortBy}`);
    }

    const [total, categories] = await prisma.$transaction([
      prisma.productCategory.count(),
      prisma.productCategory.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: sortBy ? { [sortBy]: sortOrder } : { modifiedAt: 'desc' },
      }),
    ]);

    return {
      data: categories,
      meta: {
        total,
        page,
        pageSize: limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error: unknown) {
    handleDatabaseError(error, 'Failed to fetch categories');
  }
};

export const deleteCategoryImage = async (categoryId: number, imageUrl: string) => {
  try {
    //Delete images
    await prisma.productCategory.updateMany({
      where: {
        id: categoryId,
      },
      data: {
        imageUrl: null,
      },
    });

    //remove images from folder
    try {
      const filePath = path.join(__dirname, '..', '..', imageUrl);
      await fs.promises.unlink(filePath);
    } catch {
      //todo: handle error
    }

    return { message: 'Image deleted successfully' };
  } catch (error: unknown) {
    handleDatabaseError(error, `Failed to update category images for category ${categoryId}`);
  }
};

export const deleteCategory = async (categoryId: number) => {
  try {
    // Check if category has associated products
    const productsCount = await prisma.product.count({
      where: { categoryId },
    });

    if (productsCount > 0) {
      throw new DatabaseError(
        'Cannot delete category with associated products',
        'CONSTRAINT_VIOLATION',
        ['Please reassign or delete associated products first'],
      );
    }

    return await prisma.productCategory.delete({
      where: { id: categoryId },
    });
  } catch (error: unknown) {
    handleDatabaseError(error, `Failed to delete category ${categoryId}`);
  }
};

export default {
  createCategory,
  getCategoryById,
  updateCategory,
  getCategories,
  deleteCategory,
  deleteCategoryImage,
};
