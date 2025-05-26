import { PrismaClient } from '@prisma/client';
import { Logger } from 'winston';

// Enhanced graceful shutdown
export const shutdown = async (
  signal: string,
  logger: Logger,
  prisma: PrismaClient,
  server: any,
) => {
  logger.info(`Received ${signal}, shutting down gracefully`);

  try {
    await prisma.$disconnect();
    logger.info('Database connection closed');

    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });

    // Force close after 10 seconds
    setTimeout(() => {
      logger.error('Forcing shutdown due to timeout');
      process.exit(1);
    }, 10000);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
};

export function getGoogleDriveFileId(url: string) {
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)\//);
  return match ? match[1] : null;
}
