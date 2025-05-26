import rateLimit from 'express-rate-limit';
import logger from '../config/logger';

const keyGenerator = (req: any) => req.user?.id || req.ip;

const createRateLimiter = (options: any) => {
  const limiter = rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    keyGenerator,
    handler: (req, res) => {
      logger.warn({
        requestId: req.headers['x-request-id'],
        message: 'Rate limit exceeded',
        ip: req.ip,
        path: req.path,
      });
      res.status(429).json({ error: options.message });
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
  return limiter;
};

export const apiLimiter = createRateLimiter({
  windowMs: 24 * 60 * 60 * 1000,
  max: 10000, // todo
  message: 'Too many requests, please try again later.',
});

export const loginLimiter = createRateLimiter({
  windowMs: 24 * 60 * 60 * 1000,
  max: 10000, // todo
  message: 'Too many login attempts, please try again after an hour',
});

export const registerLimiter = createRateLimiter({
  windowMs: 24 * 60 * 60 * 1000,
  max: 10000, // todo
  message: 'Too many accounts created, please try again after an hour',
});
