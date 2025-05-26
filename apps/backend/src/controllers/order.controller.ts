import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import orderService from '../services/order.service';
import { DatabaseError } from '../utils/errors';

export const getOrders = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sortBy = req.query.sortBy as keyof Prisma.OrderDetailsWhereInput;
    const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'asc';

    const orders = await orderService.getOrders(page, limit, sortBy, sortOrder);
    res.json(orders);
  } catch (error) {
    if (error instanceof DatabaseError) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: error.message, code: error.code });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
    }
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.id);
    const order = await orderService.getOrderById(orderId);

    if (!order) {
      res.status(StatusCodes.NOT_FOUND).json({ error: 'Order not found' });
      return;
    }

    res.json(order);
  } catch (error) {
    if (error instanceof DatabaseError) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: error.message, code: error.code });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
    }
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.id);
    const order = await orderService.updateOrderStatus(orderId, req.body);

    if (!order) {
      res.status(StatusCodes.NOT_FOUND).json({ error: 'Order not found' });
      return;
    }

    res.json(order);
  } catch (error) {
    if (error instanceof DatabaseError) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: error.message, code: error.code });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
    }
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.id);
    await orderService.deleteOrder(orderId);
    res.status(StatusCodes.NO_CONTENT).send();
  } catch (error) {
    if (error instanceof DatabaseError) {
      if (error.code === 'NOT_FOUND') {
        res.status(StatusCodes.NOT_FOUND).json({ error: error.message });
      } else {
        res.status(StatusCodes.BAD_REQUEST).json({ error: error.message, code: error.code });
      }
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
    }
  }
};

export default {
  getOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
};