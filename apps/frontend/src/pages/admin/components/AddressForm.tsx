import { FormController, Modal } from '@workspace/ui';
import {
  FormConfig,
  SelectFieldConfig,
  TextFieldConfig,
} from '@workspace/ui/src/components/form/types';
import { Joi } from '@workspace/ui/src/lib/joi';
import { Address } from '../../../services/address.service';

interface FormData {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postalCode: string;
  country: string;
  telephone?: string;
  mobile?: string;
  addressType: string;
}

interface AddressFormProps {
  open: boolean;
  address: Address | null;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
}

export const AddressForm = ({ open, address, onClose, onSubmit }: AddressFormProps) => {
  const formConfig: FormConfig<FormData> = {
    fields: [
      {
        name: 'addressLine1',
        type: 'text',
        label: 'Address Line 1',
        placeholder: 'Enter street address',
        xs: 12,
        joi: Joi.string().required().min(5).max(100).messages({
          'string.empty': 'Address line 1 is required',
          'string.min': 'Address must be at least {#limit} characters',
          'string.max': 'Address must be at most {#limit} characters',
        }),
      } as TextFieldConfig,
      {
        name: 'addressLine2',
        type: 'text',
        label: 'Address Line 2',
        placeholder: 'Apartment, suite, unit, etc.',
        xs: 12,
        joi: Joi.string().optional().allow('').max(100).messages({
          'string.max': 'Address must be at most {#limit} characters',
        }),
      } as TextFieldConfig,
      {
        name: 'city',
        type: 'text',
        label: 'City',
        placeholder: 'Enter city',
        xs: 12,
        sm: 6,
        joi: Joi.string().required().min(2).max(50).messages({
          'string.empty': 'City is required',
          'string.min': 'City must be at least {#limit} characters',
          'string.max': 'City must be at most {#limit} characters',
        }),
      } as TextFieldConfig,
      {
        name: 'postalCode',
        type: 'text',
        label: 'Postal Code',
        placeholder: 'Enter postal code',
        xs: 12,
        sm: 6,
        joi: Joi.string().required().min(4).max(10).messages({
          'string.empty': 'Postal code is required',
          'string.min': 'Postal code must be at least {#limit} characters',
          'string.max': 'Postal code must be at most {#limit} characters',
        }),
      } as TextFieldConfig,
      {
        name: 'country',
        type: 'text',
        label: 'Country',
        placeholder: 'Enter country',
        xs: 12,
        sm: 6,
        joi: Joi.string().required().min(2).max(50).messages({
          'string.empty': 'Country is required',
          'string.min': 'Country must be at least {#limit} characters',
          'string.max': 'Country must be at most {#limit} characters',
        }),
      } as TextFieldConfig,
      {
        name: 'telephone',
        type: 'phone',
        label: 'Telephone',
        placeholder: 'Enter telephone number',
        xs: 12,
        sm: 6,
        joi: Joi.string().optional().allow('').pattern(/^\d+$/).min(10).max(15).messages({
          'string.pattern.base': 'Phone number must contain only digits',
          'string.min': 'Phone number must be at least {#limit} digits',
          'string.max': 'Phone number must be at most {#limit} digits',
        }),
      } as TextFieldConfig,
      {
        name: 'mobile',
        type: 'phone',
        label: 'Mobile',
        placeholder: 'Enter mobile number',
        xs: 12,
        sm: 6,
        joi: Joi.string().optional().allow('').pattern(/^\d+$/).min(10).max(15).messages({
          'string.pattern.base': 'Mobile number must contain only digits',
          'string.min': 'Mobile number must be at least {#limit} digits',
          'string.max': 'Mobile number must be at most {#limit} digits',
        }),
      } as TextFieldConfig,
      {
        name: 'addressType',
        type: 'select',
        label: 'Address Type',
        xs: 12,
        options: [
          { value: 'SHIPPING', label: 'Shipping' },
          { value: 'BILLING', label: 'Billing' },
          { value: 'BOTH', label: 'Both' },
        ],
        joi: Joi.string().required().valid('SHIPPING', 'BILLING', 'BOTH').messages({
          'string.empty': 'Address type is required',
          'any.only': 'Please select a valid address type',
        }),
      } as SelectFieldConfig,
    ],
    onSubmit,
    initialValues: address
      ? {
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2 || '',
          city: address.city,
          postalCode: address.postalCode,
          country: address.country,
          telephone: address.telephone || '',
          mobile: address.mobile || '',
          addressType: address.addressType,
        }
      : undefined,
  };

  return (
    <Modal open={open} onClose={onClose} title={address ? 'Edit Address' : 'Add Address'}>
      <FormController<FormData> {...formConfig} submitLabel={address ? 'Update' : 'Create'} />
    </Modal>
  );
};
