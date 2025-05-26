import express, { Router } from 'express';
import { login, register } from '../controllers/auth.controller';
import { loginLimiter, registerLimiter } from '../middleware/rateLimiter.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { loginSchema, registerSchema } from '../validators/auth.validators';

const router: Router = express.Router();

router.post('/register', registerLimiter, validateRequest(registerSchema), register);
router.post('/login', loginLimiter, validateRequest(loginSchema), login);

export default router;
