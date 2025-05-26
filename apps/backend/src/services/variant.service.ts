import { prisma } from '../config/prisma';
import { DatabaseError } from '../utils/errors';
import { AddVariantInput, UpdateVariantInput } from '../validators/product.validators';

export const getVariantsByProductId = async (productId: number) => {
  try {
    return await prisma.productVariant.findMany({
      where: { productId },
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new DatabaseError(error.message, 'QUERY_ERROR');
    }
    throw error;
  }
};

export const createVariant = async (productId: number, variantData: AddVariantInput) => {
  try {
    // Check if SKU exists
    const existingVariant = await prisma.productVariant.findFirst({
      where: { sku: variantData.sku },
    });

    if (existingVariant) {
      throw new DatabaseError(
        `Variant with SKU ${variantData.sku} already exists`,
        'DUPLICATE_ENTRY',
        ['Please use a different SKU'],
      );
    }

    return await prisma.productVariant.create({
      data: {
        productId,
        sku: variantData.sku,
        options: variantData.options ?? {},
        price: variantData.price,
      },
    });
  } catch (error: unknown) {
    if (error instanceof DatabaseError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new DatabaseError(error.message, 'CREATE_ERROR');
    }
    throw error;
  }
};

export const updateVariant = async (variantId: number, variantData: UpdateVariantInput) => {
  try {
    // Check if SKU exists and belongs to a different variant
    if (variantData.sku) {
      const existingVariant = await prisma.productVariant.findFirst({
        where: {
          sku: variantData.sku,
          NOT: {
            id: variantId,
          },
        },
      });

      if (existingVariant) {
        throw new DatabaseError(
          `Variant with SKU ${variantData.sku} already exists`,
          'DUPLICATE_ENTRY',
          ['Please use a different SKU'],
        );
      }
    }

    return await prisma.productVariant.update({
      where: { id: variantId },
      data: {
        ...(variantData.sku && { sku: variantData.sku }),
        ...(variantData.options && { options: variantData.options }),
        ...(variantData.price !== undefined && { price: variantData.price }),
      },
    });
  } catch (error: unknown) {
    if (error instanceof DatabaseError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new DatabaseError(error.message, 'UPDATE_ERROR');
    }
    throw error;
  }
};

export const deleteVariant = async (variantId: number) => {
  try {
    await prisma.productVariant.delete({
      where: { id: variantId },
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new DatabaseError(error.message, 'DELETE_ERROR');
    }
    throw error;
  }
};

export default {
  getVariantsByProductId,
  createVariant,
  updateVariant,
  deleteVariant,
};
