import express, { Router } from 'express';
import {
  createAddressController,
  deleteAddressController,
  getAddressController,
  getAddressesController,
  updateAddressController,
} from '../controllers/address.controller';
import { validateRequest } from '../middleware/validation.middleware';
import { createAddressSchema, updateAddressSchema } from '../validators/address.validators';

const router: Router = express.Router();

// Get all addresses for a user with pagination and sorting
router.get('/users/:userId/addresses', getAddressesController);

// Get single address by ID
router.get('/addresses/:id', getAddressController);

// Create new address
router.post('/addresses', validateRequest(createAddressSchema), createAddressController);

// Update address
router.put('/addresses/:id', validateRequest(updateAddressSchema), updateAddressController);

// Delete address
router.delete('/addresses/:id', deleteAddressController);

export default router;
