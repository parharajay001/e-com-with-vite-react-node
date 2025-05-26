import express, { Router } from 'express';
import categoryController, {
  createCategory,
  deleteCategory,
  getCategories,
  getCategoryById,
  updateCategory,
} from '../controllers/category.controller';
import { authorize } from '../middleware/auth.middleware';
import { uploadCategoryImage } from '../middleware/upload.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { addCategorySchema, updateCategorySchema } from '../validators/category.validators';

const router: Router = express.Router();

// Get all categories with pagination and sorting
router.get('/', getCategories);

// Get category by ID
router.get('/:id', getCategoryById);

// Create new category
router.post('/', validateRequest(addCategorySchema), createCategory);

// Update category
router.put('/:id', validateRequest(updateCategorySchema), updateCategory);

// Upload/Update category image
router.put('/:id/image', authorize(['ADMIN']), uploadCategoryImage, categoryController.updateCategoryImage);

// Delete category
router.delete('/:id', deleteCategory);

// Delete category image
router.delete('/:id/image', authorize(['ADMIN']), categoryController.deleteCategoryImage);

export default router;
