import express, { Application, Router } from 'express';
import { envConfig } from './config/envConfig';
import logger from './config/logger';
import { prisma } from './config/prisma';
import { authenticate } from './middleware/auth.middleware';
import { configureMiddleware } from './middleware/middleware.orchestrator';
import { apiLimiter } from './middleware/rateLimiter.middleware';
import addressRoutes from './routes/address.routes';
import authRoutes from './routes/auth.routes';
import categoryRoutes from './routes/category.routes';
import orderRoutes from './routes/order.routes';
import productRoutes from './routes/product.routes';
import roleRoutes from './routes/role.routes';
import sellerRoutes from './routes/seller.routes';
import taxRoutes from './routes/tax.routes';
import userRoutes from './routes/user.routes';

const app: Application = express();
const errorHandler = configureMiddleware(app);
const apiRouter = Router();

// API routes
apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', apiLimiter, authenticate, userRoutes);
apiRouter.use('/roles', apiLimiter, authenticate, roleRoutes);
apiRouter.use('/', apiLimiter, authenticate, addressRoutes);
apiRouter.use('/products', apiLimiter, productRoutes);
apiRouter.use('/categories', apiLimiter, categoryRoutes);
apiRouter.use('/orders', apiLimiter, orderRoutes);
apiRouter.use('/taxes', apiLimiter, taxRoutes);
apiRouter.use('/sellers', apiLimiter, authenticate, sellerRoutes);

// Mount API router with version prefix
app.use('/api/v1', apiRouter);

// Example of different log levels
// Remove test endpoint in production
if (envConfig?.nodeEnv === 'development') {
  app.get('/test-logs', (req, res) => {
    logger.debug('Debug message - sensitive data only in development');
    logger.info('Info message - system operational');
    logger.warn('Warning message - potential issue detected');
    logger.error('Error message - failed operation');
    res.status(200).json({ status: 'Test logs generated' });
  });
}

// Error handler must be last
app.use(errorHandler);

// Example error handling
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  // Ensure any pending logs are written before exiting
  logger.on('finish', () => {
    process.exit(1);
  });
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Define PORT with correct type
const PORT: number = envConfig?.port || 2020;

const server = app.listen(PORT, () => {
  logger.info(`Server started in ${envConfig?.nodeEnv} mode on port ${PORT}`);
  logger.debug(`Debug logging is enabled`);
});

// Graceful shutdown
const gracefulShutdown = (signal: string) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  server.close(async () => {
    logger.info('HTTP server closed');
    await prisma.$disconnect();
    logger.info('Database connections closed');
    process.exit(0);
  });

  // Force close after 10s
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
