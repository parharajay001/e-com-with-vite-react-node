import { PrismaClient } from '@prisma/client';
import { AddressCreateInput, AddressUpdateInput } from '../types/address.types';
import { DatabaseError } from '../utils/errors';

const prisma = new PrismaClient();

export const createAddress = async (addressData: AddressCreateInput) => {
  try {
    return await prisma.userAddress.create({
      data: addressData,
    });
  } catch (error: unknown) {
    if (error instanceof DatabaseError) throw error;
    throw new DatabaseError('Failed to create address', 'CREATE_FAILED');
  }
};

export const getAddressById = async (addressId: number) => {
  try {
    const address = await prisma.userAddress.findUnique({
      where: { id: addressId },
    });

    if (!address) {
      throw new DatabaseError('Address not found', 'NOT_FOUND');
    }

    return address;
  } catch (error) {
    if (error instanceof DatabaseError) throw error;
    throw new DatabaseError('Failed to fetch address', 'FETCH_FAILED');
  }
};

export const getAddressesByUser = async (
  userId: number,
  page: number = 1,
  limit: number = 10,
  sortBy?: string,
  sortOrder: 'asc' | 'desc' = 'asc',
) => {
  try {
    const skip = (page - 1) * limit;

    const [addresses, total] = await Promise.all([
      prisma.userAddress.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: sortBy ? { [sortBy]: sortOrder } : undefined,
      }),
      prisma.userAddress.count({
        where: { userId },
      }),
    ]);

    return {
      data: addresses,
      meta: {
        total,
        page,
        pageSize: limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    if (error instanceof DatabaseError) throw error;
    throw new DatabaseError('Failed to fetch addresses', 'FETCH_FAILED');
  }
};

export const updateAddress = async (addressId: number, addressData: AddressUpdateInput) => {
  try {
    const address = await prisma.userAddress.update({
      where: { id: addressId },
      data: addressData,
    });

    if (!address) {
      throw new DatabaseError('Address not found', 'NOT_FOUND');
    }

    return address;
  } catch (error) {
    if (error instanceof DatabaseError) throw error;
    throw new DatabaseError('Failed to update address', 'UPDATE_FAILED');
  }
};

export const deleteAddress = async (addressId: number) => {
  try {
    const address = await prisma.userAddress.delete({
      where: { id: addressId },
    });

    if (!address) {
      throw new DatabaseError('Address not found', 'NOT_FOUND');
    }

    return address;
  } catch (error) {
    if (error instanceof DatabaseError) throw error;
    throw new DatabaseError('Failed to delete address', 'DELETE_FAILED');
  }
};
