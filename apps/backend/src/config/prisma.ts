import { PrismaClient } from '@prisma/client';
import { envConfig } from './envConfig';

const prisma = new PrismaClient({
  log: envConfig.nodeEnv === 'development' ? ['query', 'info', 'warn', 'error'] : [],
});

export { prisma };
