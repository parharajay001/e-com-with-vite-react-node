import { OrderStatus, Prisma, PrismaClient } from '@prisma/client';
import { DatabaseError } from '../utils/errors';

const prisma = new PrismaClient();

function handleDatabaseError(error: unknown, context: string): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    throw new DatabaseError(context, error.code, [error.message]);
  }
  throw error;
}

export const getOrders = async (
  page: number,
  limit: number,
  sortBy?: keyof Prisma.OrderDetailsWhereInput,
  sortOrder: 'asc' | 'desc' = 'asc',
) => {
  try {
    const validSortFields = ['id', 'status', 'total', 'createdAt'];
    if (sortBy && !validSortFields.includes(sortBy)) {
      throw new Error(`Invalid sort field: ${sortBy}`);
    }

    const [total, orders] = await prisma.$transaction([
      prisma.orderDetails.count(),
      prisma.orderDetails.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: sortBy ? { [sortBy]: sortOrder } : { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  SKU: true,
                  price: true,
                  productImage: true,
                },
              },
            },
          },
          paymentDetails: true,
        },
      }),
    ]);

    return {
      data: orders,
      meta: {
        total,
        page,
        pageSize: limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error: unknown) {
    handleDatabaseError(error, 'Failed to fetch orders');
  }
};

export const getOrderById = async (orderId: number) => {
  try {
    return await prisma.orderDetails.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                SKU: true,
                price: true,
              },
            },
          },
        },
        paymentDetails: true,
      },
    });
  } catch (error: unknown) {
    handleDatabaseError(error, `Failed to fetch order ${orderId}`);
  }
};

export const updateOrderStatus = async (orderId: number, { status }: { status: OrderStatus }) => {
  try {
    return await prisma.orderDetails.update({
      where: { id: orderId },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                SKU: true,
                price: true,
              },
            },
          },
        },
        paymentDetails: true,
      },
    });
  } catch (error: unknown) {
    handleDatabaseError(error, `Failed to update order ${orderId}`);
  }
};

export const deleteOrder = async (orderId: number) => {
  try {
    return await prisma.$transaction(async (tx) => {
      // Delete related records first
      await tx.paymentDetails.deleteMany({
        where: { orderId },
      });

      await tx.orderItems.deleteMany({
        where: { orderId },
      });

      // Finally delete the order
      return await tx.orderDetails.delete({
        where: { id: orderId },
      });
    });
  } catch (error: unknown) {
    handleDatabaseError(error, `Failed to delete order ${orderId}`);
  }
};

export default {
  getOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
};
