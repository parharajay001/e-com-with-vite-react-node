import { FormController, Modal } from '@workspace/ui';
import {
  FormConfig,
  NumberFieldConfig,
  TextFieldConfig,
} from '@workspace/ui/src/components/form/types';
import { Joi } from '@workspace/ui/src/lib/joi';
import { ProductVariant } from '../../../services/product.service';

interface VariantFormData {
  sku: string;
  options: {
    color?: string;
    size?: string;
    material?: string;
  };
  price?: number;
}

interface ProductVariantFormProps {
  open: boolean;
  variant: ProductVariant | null;
  onClose: () => void;
  onSubmit: (data: Omit<ProductVariant, 'id'>) => void;
}

const defaultVariantState: VariantFormData = {
  sku: '',
  options: {
    color: '',
    size: '',
    material: '',
  },
  price: 0,
};

export const ProductVariantForm = ({
  open,
  variant,
  onClose,
  onSubmit,
}: ProductVariantFormProps) => {
  const handleSubmit = async (values: VariantFormData) => {
    const sanitizedData = {
      sku: values.sku,
      options: Object.fromEntries(
        Object.entries(values.options).filter(([, value]) => value !== ''),
      ),
      price: values.price,
    };

    await onSubmit(sanitizedData);
  };

  const formConfig: FormConfig<VariantFormData> = {
    fields: [
      {
        name: 'sku',
        type: 'text',
        label: 'Variant SKU',
        placeholder: 'Enter variant SKU',
        xs: 12,
        sm: 6,
        joi: Joi.string().required().min(3).max(50).messages({
          'string.empty': 'SKU is required',
          'string.min': 'SKU must be at least {#limit} characters',
          'string.max': 'SKU must be at most {#limit} characters',
        }),
      } as TextFieldConfig,
      {
        name: 'options.color',
        type: 'text',
        label: 'Color',
        placeholder: 'Enter color',
        xs: 12,
        sm: 6,
        joi: Joi.string().allow(''),
      } as TextFieldConfig,
      {
        name: 'options.size',
        type: 'text',
        label: 'Size',
        placeholder: 'Enter size',
        xs: 12,
        sm: 6,
        joi: Joi.string().allow(''),
      } as TextFieldConfig,
      {
        name: 'options.material',
        type: 'text',
        label: 'Material',
        placeholder: 'Enter material',
        xs: 12,
        sm: 6,
        joi: Joi.string().allow(''),
      } as TextFieldConfig,
      {
        name: 'price',
        type: 'number',
        label: 'Variant Price',
        placeholder: 'Enter variant price',
        xs: 12,
        sm: 6,
        defaultValue: 0,
        joi: Joi.number().min(0).messages({
          'number.min': 'Price cannot be negative',
        }),
      } as NumberFieldConfig,
    ],
    onSubmit: handleSubmit,
    initialValues: variant
      ? {
          sku: variant.sku,
          options: {
            color: (variant.options.color as string) || '',
            size: (variant.options.size as string) || '',
            material: (variant.options.material as string) || '',
          },
          price: variant.price || 0,
        }
      : defaultVariantState,
  };

  return (
    <Modal open={open} onClose={onClose} title={variant ? 'Edit Variant' : 'Add Variant'}>
      <FormController<VariantFormData>
        {...formConfig}
        submitLabel={variant ? 'Update' : 'Create'}
      />
    </Modal>
  );
};
