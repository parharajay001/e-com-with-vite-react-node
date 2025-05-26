import { ConfirmDialog, FormController, Modal } from '@workspace/ui';
import {
  FileFieldConfig,
  FormConfig,
  TextFieldConfig,
} from '@workspace/ui/src/components/form/types';
import { Joi } from '@workspace/ui/src/lib/joi';
import { Category, categoryService } from '../../../services/category.service';
import { Box, IconButton, Tooltip } from '@workspace/ui/src/lib/mui';
import { useEffect, useState } from 'react';
import { Delete as DeleteIcon } from '@workspace/ui/src/lib/mui-icons';
import { useNotification } from '@workspace/store';

interface FormData {
  name: string;
  description?: string;
  image?: File;
}

interface CategoryFormProps {
  open: boolean;
  category: Category | null;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
  categoryId?: number;
  imageUrl?: string;
}

export const CategoryForm = ({
  open,
  category,
  onClose,
  onSubmit,
  isLoading,
  categoryId,
  imageUrl,
}: CategoryFormProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currenImageUrl, setCurrentImageUrl] = useState<string>('');
  const [localLoading, setLocalLoading] = useState(false);
  const { showError } = useNotification();

  useEffect(() => {
    setCurrentImageUrl(imageUrl || '');
  }, [imageUrl, open]);

  const formConfig: FormConfig<FormData> = {
    fields: [
      {
        name: 'name',
        type: 'text',
        label: 'Category Name',
        placeholder: 'Enter category name',
        xs: 12,
        joi: Joi.string().required().min(2).max(50).messages({
          'string.empty': 'Category name is required',
          'string.min': 'Category name must be at least {#limit} characters',
          'string.max': 'Category name must be at most {#limit} characters',
        }),
      } as TextFieldConfig,
      {
        name: 'description',
        type: 'text',
        multiline: true,
        rows: 4,
        label: 'Description',
        placeholder: 'Enter category description',
        xs: 12,
        joi: Joi.string().min(10).max(500).messages({
          'string.min': 'Description must be at least {#limit} characters',
          'string.max': 'Description must be at most {#limit} characters',
        }),
      } as TextFieldConfig,      {
        name: 'image',
        type: 'file',
        label: 'Select Image',
        accept: 'image/*',
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        helperText: 'Max file size: 5MB. Supported formats: JPEG, PNG, GIF, WEBP',
        xs: 12,
        joi: Joi.any()
          .custom((value, helpers) => {
            if (!value) return value;

            const file = value as File;
            if (file.size > 5 * 1024 * 1024) {
              return helpers.error('file.maxSize');
            }
            if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
              return helpers.error('file.type');
            }
            return value;
          })
          .messages({
            'file.maxSize': 'File size must be less than 5MB',
            'file.type': 'Only JPEG, PNG, GIF and WEBP files are allowed',
          }),
      } as FileFieldConfig,
    ],
    onSubmit,
    initialValues: category
      ? {
          name: category.name,
          description: category.description || '',
        }
      : undefined,
  };

  const handleRemoveExisting = async () => {
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    setLocalLoading(true);
    try {
      if (categoryId) {
        await categoryService.deleteCategoryImage(categoryId, {
          imageUrl: currenImageUrl,
        });
        setCurrentImageUrl('');
      }
    } catch (error: unknown) {
      showError(error instanceof Error ? error.message : 'Failed to delete image');
    }
    setDeleteDialogOpen(false);
    setLocalLoading(false);
  };

  return (
    <Modal open={open} onClose={onClose} title={category ? 'Edit Category' : 'Add Category'}>
      <FormController<FormData> {...formConfig} submitLabel={category ? 'Update' : 'Create'} />
      {currenImageUrl ? (
        <Box sx={{ mt: 2 }}>
          <h4>Old Image</h4>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Box
              key={currenImageUrl}
              sx={{
                position: 'relative',
                width: 150,
                height: 150,
              }}
            >
              <img
                src={
                  currenImageUrl.startsWith('http')
                    ? currenImageUrl
                    : new URL(currenImageUrl, import.meta.env.VITE_SERVER_URL).toString()
                }
                crossOrigin='anonymous'
                alt={`Category ${currenImageUrl}`}
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
                  onClick={() => handleRemoveExisting()}
                  disabled={isLoading || localLoading}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>
      ) : null}
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
    </Modal>
  );
};
