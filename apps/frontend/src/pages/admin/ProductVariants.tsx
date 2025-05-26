import { useNavigate, useSearchParams } from '@workspace/router';
import { useNotification } from '@workspace/store';
import { ConfirmDialog, DashboardLayout, LoadingSpinner } from '@workspace/ui';
import { Box, Button, Card, IconButton, Typography } from '@workspace/ui/src/lib/mui';
import { Delete as DeleteIcon, Edit as EditIcon } from '@workspace/ui/src/lib/mui-icons';
import { useCallback, useEffect, useState } from 'react';
import { Product, ProductVariant, productService } from '../../services/product.service';
import { ProductVariantForm } from './components/ProductVariantForm';

const ProductVariants = () => {
  const [searchParams] = useSearchParams();
  // Get userId from URL query params
  const productId = searchParams.get('productId');
  const navigate = useNavigate();
  const { showError, showSuccess } = useNotification();

  // Validate and parse id parameter
  useEffect(() => {
    if (!productId || isNaN(parseInt(productId))) {
      showError('Invalid product ID');
      navigate('/admin/products');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, navigate]); //todo

  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [variantToDelete, setVariantToDelete] = useState<number | null>(null);

  const loadProduct = useCallback(async () => {
    try {
      setLoading(true);
      const productData = await productService.getProductById(Number(productId));
      setProduct(productData);
      setVariants(productData.variants || []);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to load product');
      navigate('/admin/products');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, navigate]); // todo

  useEffect(() => {
    void loadProduct();
  }, [loadProduct]);

  const handleEdit = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    setIsModalOpen(true);
  };

  const handleDelete = (variantId: number) => {
    setVariantToDelete(variantId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!variantToDelete) return;

    setLoading(true);
    try {
      await productService.deleteVariant(Number(productId), variantToDelete);
      await loadProduct();
      showSuccess('Variant deleted successfully');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to delete variant');
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setVariantToDelete(null);
    }
  };

  const handleFormSubmit = async (formData: Omit<ProductVariant, 'id'>) => {
    setLoading(true);
    try {
      if (selectedVariant) {
        await productService.updateVariant(Number(productId), selectedVariant.id!, formData);
        showSuccess('Variant updated successfully');
      } else {
        await productService.createVariant(Number(productId), formData);
        showSuccess('Variant created successfully');
      }
      setIsModalOpen(false);
      setTimeout(() => {
        setSelectedVariant(null);
      }, 100);
      await loadProduct();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to save variant');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !product) {
    return <LoadingSpinner />;
  }

  return (
    <DashboardLayout title={`Variants - ${product?.name || 'Loading...'}`}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button variant='outlined' onClick={() => navigate('/admin/products')}>
          Back to Products
        </Button>
        <Button variant='contained' onClick={() => setIsModalOpen(true)}>
          Add Variant
        </Button>
      </Box>

      {variants.length === 0 ? (
        <Typography variant='subtitle1' color='text.secondary' textAlign='center' py={4}>
          No variants found. Click "Add Variant" to create one.
        </Typography>
      ) : (
        <Box display='grid' gridTemplateColumns='repeat(auto-fill, minmax(300px, 1fr))' gap={2}>
          {variants.map((variant) => (
            <Card key={variant.id} sx={{ p: 2 }}>
              <Box display='flex' justifyContent='space-between' alignItems='start'>
                <Box>
                  <Typography variant='h6' gutterBottom>
                    SKU: {variant.sku}
                  </Typography>
                  {variant.price && (
                    <Typography color='primary' gutterBottom>
                      Price: ₹{variant.price}
                    </Typography>
                  )}
                  <Typography variant='body2' color='text.secondary'>
                    Options:{' '}
                    {Object.entries(variant.options)
                      .filter(([, value]) => value)
                      .map(([key, value]) => `${key}: ${value}`)
                      .join(' | ') || 'No options'}
                  </Typography>
                </Box>
                <Box>
                  <IconButton size='small' onClick={() => handleEdit(variant)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton size='small' color='error' onClick={() => handleDelete(variant.id!)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            </Card>
          ))}
        </Box>
      )}

      <ProductVariantForm
        open={isModalOpen}
        variant={selectedVariant}
        onClose={() => {
          setIsModalOpen(false);
          setTimeout(() => {
            setSelectedVariant(null);
          }, 100);
        }}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title='Confirm Delete'
        message='Are you sure you want to delete this variant? This action cannot be undone.'
        confirmLabel='Delete'
        confirmColor='error'
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
        isLoading={loading}
      />
    </DashboardLayout>
  );
};

export default ProductVariants;
