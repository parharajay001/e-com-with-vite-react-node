import { NextFunction, Request, Response } from 'express';
import logger from '../config/logger';

const maskSensitiveData = (body: any) => {
  const maskedBody = { ...body };
  if (maskedBody.password) maskedBody.password = '******';
  if (maskedBody.token) maskedBody.token = '******';
  return maskedBody;
};

const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  res.setHeader('X-Request-Id', requestId);

  // Log request
  logger.info(
    JSON.stringify({
      requestId,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      ...(req.method !== 'GET' && { body: maskSensitiveData(req.body) }),
    }),
  );

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(
      JSON.stringify({
        requestId,
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip,
      }),
    );
  });

  res.on('error', (error) => {
    logger.error(
      JSON.stringify({
        requestId,
        method: req.method,
        url: req.originalUrl,
        error: error.message,
      }),
    );
  });

  next();
};

export default requestLogger;
