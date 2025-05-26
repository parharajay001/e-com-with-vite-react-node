import { Request, Response, NextFunction } from 'express';
import { envConfig } from '../config/envConfig';
import logger from '../config/logger';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Safe way to get requestId from headers
  const requestId = (
    req.headers['x-request-id'] ||
    req.headers['X-Request-Id'] ||
    req.headers['request-id'] ||
    'No request ID available'
  ).toString();

  const stack = err.stack || 'No stack available';
  const details = err.details || null;

  logger.error(
    JSON.stringify({
      requestId,
      error: message,
      stack: stack,
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString(),
      ...(details && { details }),
    }),
  );

  res.status(statusCode).json({
    success: false,
    error: message,
    requestId,
    ...(envConfig.nodeEnv === 'development' && { stack, details }),
    message: envConfig.nodeEnv === 'development' ? message : 'Something went wrong',
    timestamp: new Date().toISOString(),
    path: req.path,
  });
};
