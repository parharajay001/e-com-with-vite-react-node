import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import authService from '../services/auth.service';
import { LoginInput, RegisterInput } from '../types/auth.types';
import { handleControllerError } from '../utils/errors';

export const register = async (req: Request, res: Response) => {
  try {
    const userData: RegisterInput = req.body;
    const authPayload = await authService.register(userData);
    res.status(StatusCodes.CREATED).json(authPayload);
  } catch (error: unknown) {
    const { statusCode, errorResponse } = handleControllerError(error);
    res.status(statusCode).json(errorResponse);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const credentials: LoginInput = req.body;
    const authPayload = await authService.login(credentials);
    res.status(StatusCodes.OK).json(authPayload);
  } catch (error: unknown) {
    const { statusCode, errorResponse } = handleControllerError(error);
    res.status(statusCode).json(errorResponse);
  }
};

export default {
  register,
  login,
};
