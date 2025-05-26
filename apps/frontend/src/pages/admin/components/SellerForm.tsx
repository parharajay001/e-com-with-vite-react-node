import { FormController, Modal } from '@workspace/ui';
import {
  FormConfig,
  NumberFieldConfig,
  TextFieldConfig,
} from '@workspace/ui/src/components/form/types';
import { Joi } from '@workspace/ui/src/lib/joi';
import { Seller } from '../../../services/seller.service';

interface FormData {
  businessName: string;
  description?: string;
  website?: string;
  taxId?: string;
  commissionRate: number;
}

interface SellerFormProps {
  open: boolean;
  initialData?: Seller;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
  isSubmitting?: boolean;
}

export const SellerForm = ({ open, initialData, onClose, onSubmit, isSubmitting }: SellerFormProps) => {
  const formConfig: FormConfig<FormData> = {
    fields: [
      {
        name: 'businessName',
        type: 'text',
        label: 'Business Name',
        placeholder: 'Enter business name',
        xs: 12,
        joi: Joi.string().required().min(3).max(100).messages({
          'string.empty': 'Business name is required',
          'string.min': 'Business name must be at least {#limit} characters',
          'string.max': 'Business name must be at most {#limit} characters',
        }),
      } as TextFieldConfig,
      {
        name: 'description',
        type: 'text',
        label: 'Description',
        placeholder: 'Enter business description',
        multiline: true,
        rows: 4,
        xs: 12,
        joi: Joi.string().optional().min(10).max(1000).messages({
          'string.max': 'Description must be at most {#limit} characters',
        }),
      } as TextFieldConfig,
      {
        name: 'website',
        type: 'text',
        label: 'Website',
        placeholder: 'Enter website URL',
        xs: 12,
        joi: Joi.string()
          .optional()
          .allow('')
          .pattern(/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/)
          .messages({
            'string.pattern.base': 'Please enter a valid URL',
          }),
      } as TextFieldConfig,
      {
        name: 'taxId',
        type: 'text',
        label: 'Tax ID',
        placeholder: 'Enter tax ID',
        xs: 12,
        joi: Joi.string().optional().allow('').max(50).messages({
          'string.max': 'Tax ID must be at most {#limit} characters',
        }),
      } as TextFieldConfig,
      {
        name: 'commissionRate',
        type: 'number',
        label: 'Commission Rate (%)',
        placeholder: 'Enter commission rate',
        xs: 12,
        min: 0,
        max: 100,
        step: 0.01,
        joi: Joi.number().required().min(0).max(100).messages({
          'number.base': 'Commission rate must be a number',
          'number.min': 'Commission rate cannot be negative',
          'number.max': 'Commission rate cannot exceed 100%',
        }),
      } as NumberFieldConfig,
    ],
    onSubmit,
    initialValues: initialData
      ? {
          businessName: initialData.businessName,
          description: initialData.description || '',
          website: initialData.website || '',
          taxId: initialData.taxId || '',
          commissionRate: initialData.commissionRate,
        }
      : undefined,
  };

  return (
    <Modal open={open} onClose={onClose} title={initialData ? 'Edit Seller' : 'Add Seller'}>
      <FormController<FormData>
        {...formConfig}
        submitLabel={initialData ? 'Update' : 'Create'}
        loading={isSubmitting}
      />
    </Modal>
  );
};