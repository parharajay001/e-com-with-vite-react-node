import { useNotification } from '@workspace/store';
import { ConfirmDialog, LoadingSpinner, Modal } from '@workspace/ui';
import { Box, Button, Grid, IconButton, TextField, Tooltip } from '@workspace/ui/src/lib/mui';
import { Delete as DeleteIcon } from '@workspace/ui/src/lib/mui-icons';
import { useEffect, useState } from 'react';
import { TagInput } from '../../../components/TagInput';
import { ProductImage, productService } from '../../../services/product.service';

interface ProductImagesModalProps {
  open: boolean;
  onClose: () => void;
  images: ProductImage[];
  onSave: (images: { imageUrl: string }[]) => void;
  isLoading?: boolean;
  productId?: number;
}

export const ProductImagesModal = ({
  open,
  onClose,
  images,
  onSave,
  isLoading,
  productId,
}: ProductImagesModalProps) => {
  const { showError } = useNotification();
  const [currentImages, setCurrentImages] = useState<{ imageUrl: string }[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [localLoading, setLocalLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(0);

  useEffect(() => {
    setCurrentImages(images || []);
    setNewImages([]);
    setImageUrls([]);
  }, [images, open]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter((file) => {
      const isValid = file.type.startsWith('image/');
      if (!isValid) {
        showError('Only image files are allowed');
      }
      return isValid;
    });
    setNewImages((prev) => [...prev, ...validFiles]);
  };

  const handleRemoveExisting = async (index: number) => {
    setImageToDelete(index);
    setDeleteDialogOpen(true);
  };

  const handleRemoveNew = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!productId) {
      showError('Product ID is required');
      return;
    }

    setLocalLoading(true);
    try {
      const formData = new FormData();

      newImages.forEach((file) => {
        formData.append('images', file);
      });

      imageUrls.forEach((imageUrl) => {
        formData.append('imageUrls', imageUrl);
      });

      const response = await productService.updateProductImages(productId, formData);

      if (!response.status) {
        throw new Error('Failed to upload images');
      }

      const result = await response.data;
      onClose();

      // Return the updated images array
      const updatedImages = result.productImage || [];
      onSave(updatedImages);
    } catch (error: unknown) {
      showError(error instanceof Error ? error.message : 'Failed to upload images');
    } finally {
      setLocalLoading(false);
    }
  };

  const confirmDelete = async () => {
    setLocalLoading(true);
    try {
      if (productId) {
        await productService.deleteProductImages(productId, {
          images: [{ imageUrl: currentImages[imageToDelete].imageUrl }],
        });
        setCurrentImages((prev) => prev.filter((_, i) => i !== imageToDelete));
      }
    } catch (error: unknown) {
      showError(error instanceof Error ? error.message : 'Failed to delete image');
    }
    setDeleteDialogOpen(false);
    setLocalLoading(false);
    setImageToDelete(0);
  };

  // Rest of the component remains the same
  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title='Manage Product Images'
        maxWidth='md'
        actions={
          <>
            <Button onClick={onClose} variant='outlined' disabled={isLoading || localLoading}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              variant='contained'
              color='primary'
              disabled={
                isLoading || localLoading || (newImages.length === 0 && imageUrls.length === 0)
              }
            >
              {isLoading || localLoading ? 'Saving...' : 'Upload'}
            </Button>
          </>
        }
      >
        {(isLoading || localLoading) && <LoadingSpinner />}
        <Box sx={{ p: 2, opacity: isLoading || localLoading ? 0.5 : 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                type='file'
                variant='standard'
                name='images'
                inputProps={{ accept: 'image/*', multiple: true }}
                onChange={handleFileChange}
                disabled={isLoading || localLoading}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TagInput
                value={imageUrls}
                onChange={(images) => {
                  setImageUrls(images);
                }}
                name='imageUrls'
                label='Image URLs'
                placeholder='Add Image URLs...'
                disabled={isLoading || localLoading}
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 2 }}>
            <h4>Current Images</h4>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {currentImages.map((image, index) => (
                <Box
                  key={index}
                  sx={{
                    position: 'relative',
                    width: 150,
                    height: 150,
                  }}
                >
                  <img
                    src={
                      image.imageUrl.startsWith('http')
                        ? image.imageUrl
                        : new URL(image.imageUrl, import.meta.env.VITE_SERVER_URL).toString()
                    }
                    crossOrigin='anonymous'
                    alt={`Product ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '8px',
                    }}
                  />
                  <Tooltip title='Remove Image'>
                    <IconButton
                      size='small'
                      color='error'
                      aria-label='delete'
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        },
                      }}
                      onClick={() => handleRemoveExisting(index)}
                      disabled={isLoading || localLoading}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              ))}
            </Box>
          </Box>

          {newImages.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <h4>New Images</h4>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {newImages.map((file, index) => (
                  <Box
                    key={index}
                    sx={{
                      position: 'relative',
                      width: 150,
                      height: 150,
                    }}
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`New ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '8px',
                      }}
                    />
                    <IconButton
                      size='small'
                      color='error'
                      aria-label='delete'
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        },
                      }}
                      onClick={() => handleRemoveNew(index)}
                      disabled={isLoading || localLoading}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </Modal>
      <ConfirmDialog
        open={deleteDialogOpen}
        title='Confirm Delete'
        message='Are you sure you want to delete this image? This action cannot be undone.'
        confirmLabel='Delete'
        confirmColor='error'
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
        isLoading={localLoading}
      />
    </>
  );
};
