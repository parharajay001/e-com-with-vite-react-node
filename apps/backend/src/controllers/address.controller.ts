import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import {
  createAddress,
  getAddressById,
  getAddressesByUser,
  updateAddress,
  deleteAddress,
} from '../services/address.service';
import { handleControllerError } from '../utils/errors';

export const createAddressController = async (req: Request, res: Response) => {
  try {
    const address = await createAddress(req.body);
    res.status(StatusCodes.CREATED).json(address);
  } catch (error) {
    const { statusCode, errorResponse } = handleControllerError(error);
    res.status(statusCode).json(errorResponse);
  }
};

export const getAddressController = async (req: Request, res: Response) => {
  try {
    const addressId = parseInt(req.params.id);
    const address = await getAddressById(addressId);
    res.status(StatusCodes.OK).json(address);
  } catch (error) {
    const { statusCode, errorResponse } = handleControllerError(error);
    res.status(statusCode).json(errorResponse);
  }
};

export const getAddressesController = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sortBy = req.query.sortBy as keyof Prisma.UserAddressWhereInput;
    const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'asc';

    const result = await getAddressesByUser(userId, page, limit, sortBy, sortOrder);
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    const { statusCode, errorResponse } = handleControllerError(error);
    res.status(statusCode).json(errorResponse);
  }
};

export const updateAddressController = async (req: Request, res: Response) => {
  try {
    const addressId = parseInt(req.params.id);
    const address = await updateAddress(addressId, req.body);
    res.status(StatusCodes.OK).json(address);
  } catch (error) {
    const { statusCode, errorResponse } = handleControllerError(error);
    res.status(statusCode).json(errorResponse);
  }
};

export const deleteAddressController = async (req: Request, res: Response) => {
  try {
    const addressId = parseInt(req.params.id);
    await deleteAddress(addressId);
    res.status(StatusCodes.NO_CONTENT).send();
  } catch (error) {
    const { statusCode, errorResponse } = handleControllerError(error);
    res.status(statusCode).json(errorResponse);
  }
};
