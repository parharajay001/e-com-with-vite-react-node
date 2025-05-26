import express, { Router } from 'express';
import {
  createUser,
  deleteUser,
  getUserById,
  getUsers,
  updateUser,
} from '../controllers/user.controller';
import { validateRequest } from '../middleware/validation.middleware';
import { addUserSchema, updateUserSchema } from '../validators/user.validators';

const router: Router = express.Router();

// User registration
router.post('/', validateRequest(addUserSchema), createUser);

// Get user profile
router.get('/:id', getUserById);

// Update user profile
router.put('/:id', validateRequest(updateUserSchema), updateUser);

// List users with pagination and sorting
router.get('/', getUsers);

// Delete user
router.delete('/:id', deleteUser);

export default router;
