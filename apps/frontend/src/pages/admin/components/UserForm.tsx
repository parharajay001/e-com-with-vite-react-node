import { FormController, Modal } from '@workspace/ui';
import {
  FormConfig,
  SelectFieldConfig,
  TextFieldConfig,
} from '@workspace/ui/src/components/form/types';
import { Joi } from '@workspace/ui/src/lib/joi';
import { User } from '../../../services/user.service';
import { Role, roleService } from '../../../services/role.service';
import { useEffect, useState } from 'react';

interface FormData {
  email: string;
  firstName: string;
  lastName: string;
  telephone: string;
  role: string;
}

interface UserFormProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
}

export const UserForm = ({ open, user, onClose, onSubmit }: UserFormProps) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const response = await roleService.getRoles({
          limit: 100, // Get all roles since we need them for the dropdown
        });
        setRoles(response.data);
      } catch (error) {
        // Using optional chaining for error message
        const message = error instanceof Error ? error.message : 'Failed to load roles';
        setLoading(false);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    };

    void loadRoles();
  }, []);

  const formConfig: FormConfig<FormData> = {
    fields: [
      {
        name: 'email',
        type: 'email',
        label: 'Email',
        placeholder: 'Enter email',
        xs: 12,
        joi: Joi.string().required().email({ tlds: false }).messages({
          'string.empty': 'Email is required',
          'string.email': 'Please enter a valid email address',
        }),
      } as TextFieldConfig,
      {
        name: 'firstName',
        type: 'text',
        label: 'First Name',
        placeholder: 'Enter first name',
        xs: 12,
        sm: 6,
        joi: Joi.string().required().min(2).max(50).messages({
          'string.empty': 'First name is required',
          'string.min': 'First name must be at least {#limit} characters',
          'string.max': 'First name must be at most {#limit} characters',
        }),
      } as TextFieldConfig,
      {
        name: 'lastName',
        type: 'text',
        label: 'Last Name',
        placeholder: 'Enter last name',
        xs: 12,
        sm: 6,
        joi: Joi.string().required().min(2).max(50).messages({
          'string.empty': 'Last name is required',
          'string.min': 'Last name must be at least {#limit} characters',
          'string.max': 'Last name must be at most {#limit} characters',
        }),
      } as TextFieldConfig,
      {
        name: 'telephone',
        type: 'phone',
        label: 'Phone Number',
        placeholder: 'Enter phone number',
        xs: 12,
        joi: Joi.string().required().pattern(/^\d+$/).min(10).messages({
          'string.empty': 'Phone number is required',
          'string.min': 'Phone number must be at least {#limit} digits',
          'string.pattern.base': 'Phone number must contain only digits',
        }),
      } as TextFieldConfig,
      {
        name: 'role',
        type: 'select',
        label: 'Role',
        xs: 12,
        options: roles.map(role => ({
          value: role.name,
          label: role.name.charAt(0).toUpperCase() + role.name.slice(1).toLowerCase(),
        })),
        disabled: loading,
        joi: Joi.string()
          .required()
          .valid(...roles.map(role => role.name))
          .messages({
            'string.empty': 'Role is required',
            'any.only': 'Please select a valid role',
          }),
      } as SelectFieldConfig,
    ],
    onSubmit,
    initialValues: user
      ? {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName || '',
          telephone: user.telephone || '',
          role: user.roles?.[0]?.role.name || '',
        }
      : undefined,
  };

  return (
    <Modal open={open} onClose={onClose} title={user ? 'Edit User' : 'Add User'}>
      <FormController<FormData> {...formConfig} submitLabel={user ? 'Update' : 'Create'} loading={loading} />
    </Modal>
  );
};
