import dotenv from 'dotenv';
import { z } from 'zod';
// Load environment variables
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.coerce.number().default(3600),
  SALT_ROUNDS: z.coerce.number().int().min(10).max(16).default(12),
  DATABASE_URL: z.string().default('mysql://root:password@localhost:3306/ecom'),
  PORT: z.coerce.number().default(5000),
  LOG_LEVEL: z.string().default('info'),
  CLIENT_URL: z.string().default('http://localhost:3000'),
  CLIENT_URL_2: z.string().default('http://localhost:4000'),
});

const env = envSchema.parse(process.env);

export const envConfig = {
  nodeEnv: env.NODE_ENV,
  databaseUrl: env.DATABASE_URL,
  port: env.PORT,
  clientUrl: env.CLIENT_URL,
  clientUrl2: env.CLIENT_URL_2,
  logLevel: env.LOG_LEVEL,
  auth: {
    jwtSecret: env.JWT_SECRET,
    jwtExpiresIn: env.JWT_EXPIRES_IN,
    saltRounds: env.SALT_ROUNDS,
  },
};
