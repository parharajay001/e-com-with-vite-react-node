import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import logger from '../config/logger';
import authService from '../services/auth.service';

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req?.headers?.authorization;
    const requestId = req.headers['x-request-id'];

    if (!authHeader) {
      logger.warn({ requestId, message: 'Authentication attempt without token' });
      res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Authentication token is missing' });
      return;
    }

    if (!authHeader.startsWith('Bearer ')) {
      res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ error: 'Invalid token format. Use Bearer token' });
      return;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Token is required' });
      return;
    }

    const user = await authService.verifyToken(token);
    if (!user) {
      res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Invalid or expired token' });
      return;
    }

    req.user = user;
    next();
  } catch (error: any) {
    logger.error(
      JSON.stringify({
        requestId: req.headers['x-request-id'],
        method: req.method,
        url: req.originalUrl,
        status: StatusCodes.UNAUTHORIZED,
        ip: req.ip,
        error: error.message,
      }),
    );
    const isTokenExpired = error.name === 'TokenExpiredError';
    res.status(StatusCodes.UNAUTHORIZED).json({
      error: isTokenExpired ? 'Token has expired' : 'Authentication failed',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

type Authorize = (
  roles: string[] | string,
) => (req: Request, res: Response, next: NextFunction) => void;

export const authorize: Authorize = (roles) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'User not authenticated' });
      }

      const userRoles = req.user.roles.map((role: any) => role.role.name);
      const requiredRoles = Array.isArray(roles) ? roles : [roles];
      const hasPermission = requiredRoles.some((role) => userRoles.includes(role));

      if (!hasPermission) {
        return res.status(StatusCodes.FORBIDDEN).json({
          error: 'Access denied',
          message: `Required roles: ${requiredRoles.join(', ')}`,
        });
      }

      next();
    } catch (error: any) {
      logger.error(
        JSON.stringify({
          requestId: req.headers['x-request-id'],
          method: req.method,
          url: req.originalUrl,
          status: StatusCodes.INTERNAL_SERVER_ERROR,
          ip: req.ip,
          error: error.message,
        }),
      );
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: error?.message || 'Authorization check failed' });
    }
  };
};

export default {
  authenticate,
  authorize,
};
