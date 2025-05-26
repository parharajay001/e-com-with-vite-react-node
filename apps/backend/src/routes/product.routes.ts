import { Router } from 'express';
import productController from '../controllers/product.controller';
import variantController from '../controllers/variant.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { uploadProductImages } from '../middleware/upload.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import {
  addProductSchema,
  updateProductSchema,
  addVariantSchema,
  updateVariantSchema,
} from '../validators/product.validators';

const router: Router = Router();

// Public product routes
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

// Protected product routes
router.use(authenticate);
router.post('/', validateRequest(addProductSchema), productController.createProduct);
router.put('/:id', validateRequest(updateProductSchema), productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

// Variant routes (all protected)
router.get('/:productId/variants', variantController.getProductVariants);
router.post(
  '/:productId/variants',
  validateRequest(addVariantSchema),
  variantController.createVariant,
);
router.put(
  '/:productId/variants/:variantId',
  validateRequest(updateVariantSchema),
  variantController.updateVariant,
);
router.delete('/:productId/variants/:variantId', variantController.deleteVariant);
router.put(
  '/:id/images',
  authorize(['ADMIN']),
  uploadProductImages,
  productController.updateProductImages,
);
router.delete('/:id/images', authorize(['ADMIN']), productController.deleteProductImages);

export default router;
