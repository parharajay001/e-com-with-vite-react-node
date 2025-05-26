import { FormController, Modal } from '@workspace/ui';
import {
  FormConfig,
  NumberFieldConfig,
  TextFieldConfig,
} from '@workspace/ui/src/components/form/types';
import { Joi } from '@workspace/ui/src/lib/joi';
import { Tax } from '../../../services/tax.service';

interface FormData {
  country: string;
  state?: string;
  rate: number;
}

interface TaxFormProps {
  open: boolean;
  initialValues?: Tax;
  onClose: () => void;
  onSubmit: (values: FormData) => Promise<void>;
}

export const TaxForm = ({ open, initialValues, onClose, onSubmit }: TaxFormProps) => {
  const formConfig: FormConfig<FormData> = {
    fields: [
      {
        name: 'country',
        type: 'text',
        label: 'Country Code',
        placeholder: 'Enter country code (e.g., US, GB)',
        helperText: 'ISO country code (2-3 characters)',
        xs: 12,
        joi: Joi.string()
          .required()
          .min(2)
          .max(3)
          .pattern(/^[A-Z]+$/)
          .messages({
            'string.empty': 'Country code is required',
            'string.min': 'Country code must be at least {#limit} characters',
            'string.max': 'Country code must be at most {#limit} characters',
            'string.pattern.base': 'Country code must be uppercase letters only',
          }),
      } as TextFieldConfig,
      {
        name: 'state',
        type: 'text',
        label: 'State/Province',
        placeholder: 'Enter state/province (optional)',
        helperText: 'Leave empty for country-wide rate',
        xs: 12,
        joi: Joi.string()
          .optional()
          .allow('')
          .min(1)
          .max(50)
          .messages({
            'string.min': 'State must be at least {#limit} character',
            'string.max': 'State must be at most {#limit} characters',
          }),
      } as TextFieldConfig,
      {
        name: 'rate',
        type: 'number',
        label: 'Tax Rate',
        placeholder: 'Enter tax rate (e.g., 0.20 for 20%)',
        helperText: 'Enter as decimal (e.g., 0.20 for 20%)',
        xs: 12,
        step: 0.01,
        min: 0,
        max: 1,
        joi: Joi.number()
          .required()
          .min(0)
          .max(1)
          .messages({
            'number.base': 'Tax rate must be a number',
            'number.min': 'Tax rate must be at least {#limit}',
            'number.max': 'Tax rate must be at most {#limit} (100%)',
          }),
      } as NumberFieldConfig,
    ],
    onSubmit,
    initialValues: initialValues
      ? {
          country: initialValues.country,
          state: initialValues.state || '',
          rate: initialValues.rate,
        }
      : undefined,
  };

  return (
    <Modal open={open} onClose={onClose} title={initialValues ? 'Edit Tax Rate' : 'Add Tax Rate'}>
      <FormController<FormData> {...formConfig} submitLabel={initialValues ? 'Update' : 'Create'} />
    </Modal>
  );
};