import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate, validateToken } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import { loginSchema, refreshTokenSchema, registerSchema } from '../validators/auth.validator';
import { rateLimiter } from '../middleware/rateLimiter.middleware';

const router = Router();

// API version prefix
const API_VERSION = 'v1';

// Health check
router.get(`/${API_VERSION}/health`, (req, res) =>
  res.json({ status: 'ok', version: API_VERSION }),
);

// Auth routes with rate limiting
router.post(
  `/${API_VERSION}/register`,
  rateLimiter({ windowMs: 60 * 60 * 1000, max: 5 }), // 5 requests per hour
  validate(registerSchema),
  asyncHandler(AuthController.register),
);

router.post(
  `/${API_VERSION}/login`,
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 5 }), // 5 requests per 15 minutes
  validate(loginSchema),
  asyncHandler(AuthController.login),
);

router.post(
  `/${API_VERSION}/refresh-token`,
  validate(refreshTokenSchema),
  validateToken,
  asyncHandler(AuthController.refreshToken),
);

router.post(`/${API_VERSION}/logout`, authenticate, asyncHandler(AuthController.logout));

// Protected routes
router.get(`/${API_VERSION}/me`, authenticate, asyncHandler(AuthController.getCurrentUser));

export { router as authRoutes };
