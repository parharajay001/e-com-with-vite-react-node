import cookieParser from 'cookie-parser';
import express, { Application } from 'express';
import { errorHandler } from './error.middleware';
import requestLogger from './requestLogger.middleware';
import { configureSecurityMiddleware } from './security.middleware';

export const configureMiddleware = (app: Application) => {
  // 1. Essential middleware (Always first)
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // 2. Security middleware (Early in the chain)
  configureSecurityMiddleware(app);

  // 3. Request logging (After security, before business logic)
  app.use(requestLogger);

  // 4. Static file serving (if needed)
  app.use(
    '/uploads',
    express.static('uploads', {
      maxAge: '1d',
      etag: true,
    }),
  );

  // Return error handler to be used last
  return errorHandler;
};
