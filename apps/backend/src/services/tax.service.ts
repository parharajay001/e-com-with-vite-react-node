import { Prisma, PrismaClient } from '@prisma/client';
import { DatabaseError } from '../utils/errors';
import { AddTaxInput, UpdateTaxInput } from '../validators/tax.validators';

const prisma = new PrismaClient();

const getTaxes = async (
  page: number,
  limit: number,
  sortBy?: keyof Prisma.TaxWhereInput,
  sortOrder: 'asc' | 'desc' = 'asc',
) => {
  try {
    const skip = (page - 1) * limit;
    const validSortFields = ['id', 'country', 'state', 'rate', 'createdAt'];

    if (sortBy && !validSortFields.includes(sortBy)) {
      throw new DatabaseError(
        `Invalid sort field. Valid fields are: ${validSortFields.join(', ')}`,
        'INVALID_SORT_FIELD',
      );
    }

    const [taxes, total] = await Promise.all([
      prisma.tax.findMany({
        skip,
        take: limit,
        orderBy: sortBy ? { [sortBy]: sortOrder } : undefined,
      }),
      prisma.tax.count(),
    ]);

    return {
      data: taxes,
      meta: {
        total,
        page,
        limit,
      },
    };
  } catch (error) {
    if (error instanceof DatabaseError) throw error;
    throw new DatabaseError('Failed to fetch taxes', 'QUERY_FAILED');
  }
};

const getTaxById = async (id: number) => {
  try {
    const tax = await prisma.tax.findUnique({
      where: { id },
    });

    if (!tax) {
      throw new DatabaseError(`Tax not found with id ${id}`, 'NOT_FOUND');
    }

    return tax;
  } catch (error) {
    if (error instanceof DatabaseError) throw error;
    throw new DatabaseError(`Failed to fetch tax ${id}`, 'QUERY_FAILED');
  }
};

const createTax = async (taxData: AddTaxInput) => {
  try {
    // Check if tax rate exists for country/state combination
    const existingTax = await prisma.tax.findFirst({
      where: {
        country: taxData.country,
        state: taxData.state || null,
      },
    });

    if (existingTax) {
      throw new DatabaseError(
        `Tax rate already exists for ${taxData.country}${taxData.state ? '/' + taxData.state : ''}`,
        'DUPLICATE_ENTRY',
      );
    }

    return await prisma.tax.create({
      data: taxData,
    });
  } catch (error) {
    if (error instanceof DatabaseError) throw error;
    throw new DatabaseError('Failed to create tax', 'CREATE_FAILED');
  }
};

const updateTax = async (id: number, taxData: UpdateTaxInput) => {
  try {
    // Check if tax exists
    const existingTax = await prisma.tax.findUnique({
      where: { id },
    });

    if (!existingTax) {
      throw new DatabaseError(`Tax not found with id ${id}`, 'NOT_FOUND');
    }

    // Check if update would create a duplicate country/state combination
    if (taxData.country || taxData.state) {
      const duplicateTax = await prisma.tax.findFirst({
        where: {
          id: { not: id },
          country: taxData.country || existingTax.country,
          state: taxData.state ?? existingTax.state,
        },
      });

      if (duplicateTax) {
        throw new DatabaseError(
          `Tax rate already exists for ${taxData.country || existingTax.country}${
            taxData.state || existingTax.state ? '/' + (taxData.state || existingTax.state) : ''
          }`,
          'DUPLICATE_ENTRY',
        );
      }
    }

    return await prisma.tax.update({
      where: { id },
      data: taxData,
    });
  } catch (error) {
    if (error instanceof DatabaseError) throw error;
    throw new DatabaseError(`Failed to update tax ${id}`, 'UPDATE_FAILED');
  }
};

const deleteTax = async (id: number) => {
  try {
    // Check if tax exists
    const tax = await prisma.tax.findUnique({
      where: { id },
    });

    if (!tax) {
      throw new DatabaseError(`Tax not found with id ${id}`, 'NOT_FOUND');
    }

    await prisma.tax.delete({
      where: { id },
    });
  } catch (error) {
    if (error instanceof DatabaseError) throw error;
    throw new DatabaseError(`Failed to delete tax ${id}`, 'DELETE_FAILED');
  }
};

export default {
  getTaxes,
  getTaxById,
  createTax,
  updateTax,
  deleteTax,
};
