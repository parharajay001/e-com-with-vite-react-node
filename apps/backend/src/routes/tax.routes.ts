import express, { Router } from 'express';
import taxController from '../controllers/tax.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { addTaxSchema, updateTaxSchema } from '../validators/tax.validators';

const router: Router = express.Router();

// Protected routes - requires authentication and admin role
router.use(authenticate);
router.use(authorize(['ADMIN']));

// Get all taxes with pagination and sorting
router.get('/', taxController.getTaxes);

// Get tax by ID
router.get('/:id', taxController.getTaxById);

// Create new tax
router.post('/', validateRequest(addTaxSchema), taxController.createTax);

// Update tax
router.put('/:id', validateRequest(updateTaxSchema), taxController.updateTax);

// Delete tax
router.delete('/:id', taxController.deleteTax);

export default router;