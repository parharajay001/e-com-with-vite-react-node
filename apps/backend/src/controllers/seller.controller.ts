import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import sellerService from '../services/seller.service';
import { DatabaseError } from '../utils/errors';

export const getSellers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sortBy = req.query.sortBy as keyof Prisma.SellerWhereInput;
    const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'asc';

    const sellers = await sellerService.getSellers(page, limit, sortBy, sortOrder);
    res.json(sellers);
  } catch (error) {
    if (error instanceof DatabaseError) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: error.message, code: error.code });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
    }
  }
};

export const getSellerById = async (req: Request, res: Response) => {
  try {
    const sellerId = parseInt(req.params.id);
    const seller = await sellerService.getSellerById(sellerId);

    if (!seller) {
      res.status(StatusCodes.NOT_FOUND).json({ error: 'Seller not found' });
      return;
    }

    res.json(seller);
  } catch (error) {
    if (error instanceof DatabaseError) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: error.message, code: error.code });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
    }
  }
};

export const createSeller = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const seller = await sellerService.createSeller(userId, req.body);
    res.status(StatusCodes.CREATED).json(seller);
  } catch (error) {
    if (error instanceof DatabaseError) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: error.message, code: error.code });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
    }
  }
};

export const updateSeller = async (req: Request, res: Response) => {
  try {
    const sellerId = parseInt(req.params.id);
    const seller = await sellerService.updateSeller(sellerId, req.body);
    res.json(seller);
  } catch (error) {
    if (error instanceof DatabaseError) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: error.message, code: error.code });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
    }
  }
};

export const deleteSeller = async (req: Request, res: Response) => {
  try {
    const sellerId = parseInt(req.params.id);
    await sellerService.deleteSeller(sellerId);
    res.status(StatusCodes.NO_CONTENT).send();
  } catch (error) {
    if (error instanceof DatabaseError) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: error.message, code: error.code });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
    }
  }
};

export const getSellerProducts = async (req: Request, res: Response) => {
  try {
    const sellerId = parseInt(req.params.id);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sortBy = req.query.sortBy as keyof Prisma.SellerProductWhereInput;
    const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'asc';

    const products = await sellerService.getSellerProducts(sellerId, page, limit, sortBy, sortOrder);
    res.json(products);
  } catch (error) {
    if (error instanceof DatabaseError) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: error.message, code: error.code });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
    }
  }
};

export default {
  getSellers,
  getSellerById,
  createSeller,
  updateSeller,
  deleteSeller,
  getSellerProducts,
};