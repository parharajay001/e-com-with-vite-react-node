import { useNotification } from '@workspace/store';
import { FormController, Modal } from '@workspace/ui';
import {
  CheckboxFieldConfig,
  CustomFieldConfig,
  FormConfig,
  NumberFieldConfig,
  SelectFieldConfig,
  TextFieldConfig,
} from '@workspace/ui/src/components/form/types';
import { Joi } from '@workspace/ui/src/lib/joi';
import { Box } from '@workspace/ui/src/lib/mui';
import { TagInput } from '../../../components/TagInput';
import { Category } from '../../../services/category.service';
import { Product } from '../../../services/product.service';

export interface FormData {
  name: string;
  description: string;
  SKU: string;
  categoryId: number;
  price: number;
  brand?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  tags: string[];
  isPublished: boolean;
  inventory: {
    quantity?: number;
  };
}

interface ProductFormProps {
  open: boolean;
  product: Product | null;
  categories: Category[];
  onClose: () => void;
  onSubmit: (data: FormData) => void;
}

export const ProductForm = ({ open, product, categories, onClose, onSubmit }: ProductFormProps) => {
  const { showError } = useNotification();

  const handleSubmit = async (formData: FormData) => {
    try {
      // Remove the flattened dimension fields
      const cleanedData = Object.fromEntries(
        Object.entries(formData).filter(
          ([key]) => !key.startsWith('dimensions.') && !key.startsWith('inventory.'),
        ),
      ) as FormData;
      // Combine form data with variants
      const finalData = {
        ...cleanedData,
        // Ensure all optional fields have default values
        brand: formData.brand || '',
        weight: formData.weight || 0,
        dimensions: formData.dimensions || { length: 0, width: 0, height: 0 },
        metaTitle: formData.metaTitle || '',
        metaDescription: formData.metaDescription || '',
        metaKeywords: formData.metaKeywords || '',
        tags: formData.tags || [],
      };

      await onSubmit(finalData);
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to submit form');
    }
  };

  const suggestedTags = ['new', 'sale', 'trending', 'popular', 'featured'];

  const formConfig: FormConfig<FormData> = {
    fields: [
      {
        name: 'name',
        type: 'text',
        label: 'Product Name',
        placeholder: 'Enter product name',
        xs: 12,
        joi: Joi.string().required().min(3).max(100).messages({
          'string.empty': 'Product name is required',
          'string.min': 'Product name must be at least {#limit} characters',
          'string.max': 'Product name must be at most {#limit} characters',
        }),
      } as TextFieldConfig,
      {
        name: 'categoryId',
        type: 'select',
        label: 'Category',
        placeholder: 'Select category',
        xs: 12,
        sm: 6,
        options: categories.map((cat) => ({
          value: cat.id,
          label: cat.name,
        })),
        joi: Joi.number().required().messages({
          'any.required': 'Category is required',
          'number.base': 'Please select a category',
        }),
      } as SelectFieldConfig,
      {
        name: 'inventory.quantity',
        type: 'number',
        label: 'Quantity',
        placeholder: 'Enter product quantity',
        xs: 6,
        // joi: Joi.number().required().min(0).messages({
        //   'number.base': 'Quantity must be a number',
        //   'number.min': 'Quantity cannot be negative',
        // }),
        //todo
      } as NumberFieldConfig,
      {
        name: 'description',
        type: 'text',
        multiline: true,
        rows: 4,
        label: 'Description',
        placeholder: 'Enter product description',
        xs: 12,
        joi: Joi.string().required().min(10).max(1000).messages({
          'string.empty': 'Description is required',
          'string.min': 'Description must be at least {#limit} characters',
          'string.max': 'Description must be at most {#limit} characters',
        }),
      } as TextFieldConfig,
      {
        name: 'SKU',
        type: 'text',
        label: 'SKU',
        placeholder: 'Enter SKU',
        xs: 12,
        sm: 6,
        joi: Joi.string().required().min(3).max(50).messages({
          'string.empty': 'SKU is required',
          'string.min': 'SKU must be at least {#limit} characters',
          'string.max': 'SKU must be at most {#limit} characters',
        }),
      } as TextFieldConfig,
      {
        name: 'price',
        type: 'number',
        label: 'Price',
        placeholder: 'Enter price',
        xs: 12,
        sm: 6,
        joi: Joi.number().required().min(0).messages({
          'number.base': 'Price must be a number',
          'number.min': 'Price cannot be negative',
        }),
      } as NumberFieldConfig,
      {
        name: 'brand',
        type: 'text',
        label: 'Brand',
        placeholder: 'Enter brand name',
        xs: 12,
        sm: 6,
        joi: Joi.string().optional().allow('').max(50).messages({
          'string.max': 'Brand name must be at most {#limit} characters',
        }),
      } as TextFieldConfig,
      {
        name: 'weight',
        type: 'number',
        label: 'Weight (kg)',
        placeholder: 'Enter weight',
        xs: 12,
        sm: 6,
        joi: Joi.number().optional().min(0).messages({
          'number.base': 'Weight must be a number',
          'number.min': 'Weight cannot be negative',
        }),
      } as NumberFieldConfig,
      {
        name: 'dimensions.length',
        type: 'number',
        label: 'Length (cm)',
        placeholder: 'Enter length',
        xs: 12,
        sm: 4,
        // joi: Joi.number().optional().min(0).messages({
        //   'number.base': 'Length must be a number',
        //   'number.min': 'Length cannot be negative',
        // }),
        // todo
      } as NumberFieldConfig,
      {
        name: 'dimensions.width',
        type: 'number',
        label: 'Width (cm)',
        placeholder: 'Enter width',
        xs: 12,
        sm: 4,
        // joi: Joi.number().optional().min(0).messages({
        //   'number.base': 'Width must be a number',
        //   'number.min': 'Width cannot be negative',
        // }),
        // todo
      } as NumberFieldConfig,
      {
        name: 'dimensions.height',
        type: 'number',
        label: 'Height (cm)',
        placeholder: 'Enter height',
        xs: 12,
        sm: 4,
        // joi: Joi.number().optional().min(0).messages({
        //   'number.base': 'Height must be a number',
        //   'number.min': 'Height cannot be negative',
        // }),
        // todo
      } as NumberFieldConfig,
      {
        name: 'metaTitle',
        type: 'text',
        label: 'Meta Title',
        placeholder: 'Enter meta title for SEO',
        xs: 12,
        sm: 6,
        joi: Joi.string().optional().max(100).messages({
          'string.max': 'Meta title must be at most {#limit} characters',
        }),
      } as TextFieldConfig,
      {
        name: 'metaDescription',
        type: 'text',
        label: 'Meta Description',
        placeholder: 'Enter meta description for SEO',
        multiline: true,
        rows: 2,
        xs: 12,
        sm: 6,
        joi: Joi.string().optional().max(200).messages({
          'string.max': 'Meta description must be at most {#limit} characters',
        }),
      } as TextFieldConfig,
      {
        name: 'metaKeywords',
        type: 'text',
        label: 'Meta Keywords',
        placeholder: 'Enter meta keywords for SEO (comma separated)',
        xs: 12,
        joi: Joi.string().optional().max(200).messages({
          'string.max': 'Meta keywords must be at most {#limit} characters',
        }),
      } as TextFieldConfig,
      {
        name: 'tags',
        type: 'custom',
        label: 'Tags',
        xs: 12,
        defaultValue: [],
        render: ({ field: { value, onChange, name }, error }) => (
          <TagInput
            value={value || []}
            onChange={(newValue) => {
              onChange({ target: { value: newValue, name, type: 'custom' } });
            }}
            name={name}
            error={error}
            suggestedTags={suggestedTags}
          />
        ),
        joi: Joi.array().items(Joi.string()).optional(),
      } as CustomFieldConfig,
      {
        name: 'isPublished',
        type: 'checkbox',
        label: 'Publish Product',
        xs: 12,
        checkedValue: true,
        uncheckedValue: false,
      } as CheckboxFieldConfig,
    ],
    onSubmit: handleSubmit,
    initialValues: product
      ? {
          name: product.name,
          description: product.description || '',
          SKU: product.SKU,
          categoryId: product.categoryId,
          price: product.price,
          brand: product.brand || '',
          weight: product.weight || 0,
          dimensions: product.dimensions || { length: 0, width: 0, height: 0 },
          metaTitle: product.metaTitle || '',
          metaDescription: product.metaDescription || '',
          metaKeywords: product.metaKeywords || '',
          isPublished: product.isPublished,
          tags: product.tags || [],
          inventory: product.inventory || { quantity: 0 },
        }
      : {
          dimensions: { length: 0, width: 0, height: 0 },
          tags: [],
          isPublished: false,
          inventory: { quantity: 0 },
        },
  };

  return (
    <Modal open={open} onClose={onClose} title={product ? 'Edit Product' : 'Add Product'}>
      <Box>
        <FormController<FormData> {...formConfig} submitLabel={product ? 'Update' : 'Create'} />
      </Box>
    </Modal>
  );
};
