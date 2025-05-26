import express, { Router } from 'express';
import orderController from '../controllers/order.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { updateOrderSchema } from '../validators/order.validators';

const router: Router = express.Router();

// Protected order routes - requires authentication
router.use(authenticate);

// Get all orders with pagination and sorting
router.get('/', authorize(['ADMIN']), orderController.getOrders);

// Get order by ID
router.get('/:id', orderController.getOrderById);

// Update order status
router.put('/:id', authorize(['ADMIN']), validateRequest(updateOrderSchema), orderController.updateOrderStatus);

// Delete order
router.delete('/:id', authorize(['ADMIN']), orderController.deleteOrder);

export default router;