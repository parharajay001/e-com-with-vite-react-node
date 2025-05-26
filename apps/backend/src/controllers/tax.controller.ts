import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import taxService from '../services/tax.service';
import { DatabaseError } from '../utils/errors';

export const getTaxes = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sortBy = req.query.sortBy as keyof Prisma.TaxWhereInput;
    const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'asc';

    const taxes = await taxService.getTaxes(page, limit, sortBy, sortOrder);
    res.json(taxes);
  } catch (error) {
    if (error instanceof DatabaseError) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: error.message, code: error.code });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
    }
  }
};

export const getTaxById = async (req: Request, res: Response) => {
  try {
    const taxId = parseInt(req.params.id);
    const tax = await taxService.getTaxById(taxId);
    res.json(tax);
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

export const createTax = async (req: Request, res: Response) => {
  try {
    const tax = await taxService.createTax(req.body);
    res.status(StatusCodes.CREATED).json(tax);
  } catch (error) {
    if (error instanceof DatabaseError) {
      if (error.code === 'DUPLICATE_ENTRY') {
        res.status(StatusCodes.CONFLICT).json({ error: error.message });
      } else {
        res.status(StatusCodes.BAD_REQUEST).json({ error: error.message, code: error.code });
      }
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
    }
  }
};

export const updateTax = async (req: Request, res: Response) => {
  try {
    const taxId = parseInt(req.params.id);
    const tax = await taxService.updateTax(taxId, req.body);
    res.json(tax);
  } catch (error) {
    if (error instanceof DatabaseError) {
      if (error.code === 'NOT_FOUND') {
        res.status(StatusCodes.NOT_FOUND).json({ error: error.message });
      } else if (error.code === 'DUPLICATE_ENTRY') {
        res.status(StatusCodes.CONFLICT).json({ error: error.message });
      } else {
        res.status(StatusCodes.BAD_REQUEST).json({ error: error.message, code: error.code });
      }
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
    }
  }
};

export const deleteTax = async (req: Request, res: Response) => {
  try {
    const taxId = parseInt(req.params.id);
    await taxService.deleteTax(taxId);
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
  getTaxes,
  getTaxById,
  createTax,
  updateTax,
  deleteTax,
};