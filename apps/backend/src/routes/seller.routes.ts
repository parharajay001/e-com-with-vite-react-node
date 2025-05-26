import express, { Router } from 'express';
import sellerController from '../controllers/seller.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { addSellerSchema, updateSellerSchema } from '../validators/seller.validators';

const router: Router = express.Router();

// All seller routes require authentication
router.use(authenticate);

// Get all sellers with pagination and sorting (Admin only)
router.get('/', authorize(['ADMIN']), sellerController.getSellers);

// Get seller by ID (Admin and owner)
router.get('/:id', sellerController.getSellerById);

// Create new seller for a user
router.post('/users/:userId', validateRequest(addSellerSchema), sellerController.createSeller);

// Update seller (Admin and owner)
router.put('/:id', validateRequest(updateSellerSchema), sellerController.updateSeller);

// Delete seller (Admin only)
router.delete('/:id', authorize(['ADMIN']), sellerController.deleteSeller);

// Get seller products
router.get('/:id/products', sellerController.getSellerProducts);

export default router;