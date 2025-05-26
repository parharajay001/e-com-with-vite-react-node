import fs from 'fs';
import path from 'path';
import { Prisma, PrismaClient } from '@prisma/client';
import { DatabaseError, getPrismaErrorMessage } from '../utils/errors';
import { AddProductInput, UpdateProductInput } from '../validators/product.validators';

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

export const createProduct = async (productData: AddProductInput) => {
  try {
    // Check if SKU exists
    const existingProduct = await prisma.product.findUnique({
      where: { SKU: productData.SKU },
    });

    if (existingProduct) {
      throw new DatabaseError(
        `Product with SKU ${productData.SKU} already exists`,
        'DUPLICATE_ENTRY',
        ['Please use a different SKU'],
      );
    }

    // Create product with inventory
    return await prisma.$transaction(async (tx) => {
      // Create inventory first
      const inventory = await tx.productInventory.create({
        data: {
          quantity: 0,
          lowStockThreshold: 10,
        },
      });
      // Then create the product
      const product = await tx.product.create({
        data: {
          name: productData.name,
          description: productData.description,
          SKU: productData.SKU,
          categoryId: productData.categoryId || 1, // Default category if not provided
          inventoryId: inventory.id,
          price: productData.price,
          brand: productData.brand,
          weight: productData.weight,
          dimensions: productData.dimensions,
          tags: productData.tags || [],
          isPublished: productData.isPublished ?? false,
          metaDescription: productData.metaDescription,
          metaKeywords: productData.metaKeywords,
          metaTitle: productData.metaTitle,
        },
        include: {
          inventory: true,
          category: true,
          productImage: true,
          variants: true,
        },
      });

      return product;
    });
  } catch (error: unknown) {
    handleDatabaseError(error, 'Product creation failed');
  }
};

export const getProductById = async (productId: number) => {
  try {
    return await prisma.product.findUnique({
      where: { id: productId },
      include: {
        inventory: true,
        category: true,
        productImage: true,
        variants: true,
      },
    });
  } catch (error: unknown) {
    handleDatabaseError(error, `Failed to fetch product ${productId}`);
  }
};

export const updateProduct = async (productId: number, productData: UpdateProductInput) => {
  try {
    // Check if SKU exists and belongs to a different product
    if (productData.SKU) {
      const existingProduct = await prisma.product.findFirst({
        where: {
          SKU: productData.SKU,
          NOT: {
            id: productId,
          },
        },
      });

      if (existingProduct) {
        throw new DatabaseError(
          `Product with SKU ${productData.SKU} already exists`,
          'DUPLICATE_ENTRY',
          ['Please use a different SKU'],
        );
      }
    }

    // Prepare the update data
    const { inventory, categoryId, ...restProductData } = productData;

    const updateData = {
      ...restProductData,
      ...(inventory && {
        inventory: {
          update: {
            quantity: inventory.quantity,
          },
        },
      }),
      ...(categoryId && {
        category: {
          connect: {
            id: categoryId,
          },
        },
      }),
    };
    return await prisma.product.update({
      where: { id: productId },
      data: updateData,
      include: {
        inventory: true,
        category: true,
        productImage: true,
        variants: true,
      },
    });
  } catch (error: unknown) {
    handleDatabaseError(error, `Failed to update product ${productId}`);
  }
};

export const getProducts = async (
  page: number,
  limit: number,
  sortBy?: keyof Prisma.ProductWhereInput,
  sortOrder: 'asc' | 'desc' = 'asc',
) => {
  try {
    const validSortFields = ['id', 'name', 'price', 'isPublished', 'averageRating', 'createdAt'];
    if (sortBy && !validSortFields.includes(sortBy)) {
      throw new Error(`Invalid sort field: ${sortBy}`);
    }

    const [total, products] = await prisma.$transaction([
      prisma.product.count(),
      prisma.product.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: sortBy ? { [sortBy]: sortOrder } : { modifiedAt: 'desc' },
        include: {
          inventory: true,
          category: true,
          productImage: true,
          variants: true,
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
    handleDatabaseError(error, 'Failed to fetch products');
  }
};

export const deleteProduct = async (productId: number) => {
  try {
    return await prisma.$transaction(async (tx) => {
      // Delete related records first
      await Promise.all([
        tx.productVariant.deleteMany({ where: { productId } }),
        tx.productImage.deleteMany({ where: { productId } }),
      ]);

      // Get inventory ID to delete after product
      const product = await tx.product.findUnique({
        where: { id: productId },
        select: { inventoryId: true },
      });

      if (!product) {
        throw new DatabaseError('Product not found', 'NOT_FOUND');
      }

      // Delete the product
      await tx.product.delete({ where: { id: productId } });

      // Delete the inventory
      await tx.productInventory.delete({ where: { id: product.inventoryId } });

      return { id: productId };
    });
  } catch (error: unknown) {
    handleDatabaseError(error, `Failed to delete product ${productId}`);
  }
};

export const updateProductImages = async (productId: number, images: { imageUrl: string }[]) => {
  try {
    // Create new images
    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        productImage: {
          create: images,
        },
      },
      include: {
        inventory: true,
        category: true,
        productImage: true,
        variants: true,
      },
    });

    return product;
  } catch (error: unknown) {
    handleDatabaseError(error, `Failed to update product images for product ${productId}`);
  }
};

export const deleteProductImages = async (productId: number, images: { imageUrl: string }[]) => {
  try {
    //Delete images
    const product = await prisma.productImage.deleteMany({
      where: {
        productId,
        AND: {
          imageUrl: {
            in: images.map((image) => image.imageUrl),
          },
        },
      },
    });

    //remove images from folder
    try {
      await Promise.all(
        images.map((image) => {
          const filePath = path.join(__dirname, '..', '..', image.imageUrl);
          return fs.promises.unlink(filePath);
        }),
      );
    } catch {
      //todo: handle error
    }

    return product;
  } catch (error: unknown) {
    handleDatabaseError(error, `Failed to update product images for product ${productId}`);
  }
};

export default {
  createProduct,
  getProductById,
  updateProduct,
  getProducts,
  deleteProduct,
  updateProductImages,
  deleteProductImages,
};
