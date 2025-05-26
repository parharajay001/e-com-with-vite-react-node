import { FormController, Modal } from '@workspace/ui';
import {
  FormConfig,
  TextFieldConfig
} from '@workspace/ui/src/components/form/types';
import { Joi } from '@workspace/ui/src/lib/joi';
import { Role, UserRoleType } from '../../../services/role.service';

interface FormData {
  name: UserRoleType;
  description: string;
}

interface RoleFormProps {
  open: boolean;
  role: Role | null;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
}

export const RoleForm = ({ open, role, onClose, onSubmit }: RoleFormProps) => {
  const formConfig: FormConfig<FormData> = {
    fields: [
      {
        name: 'name',
        type: 'text',
        label: 'Role Name',
        placeholder: 'Select role type',
        xs: 12,
        joi: Joi.string().required().messages({
          'string.empty': 'Role name is required',
        }),
      } as TextFieldConfig,
      {
        name: 'description',
        type: 'text',
        label: 'Description',
        placeholder: 'Enter role description',
        xs: 12,
        multiline: true,
        rows: 4,
        joi: Joi.string().optional().allow('').max(500).messages({
          'string.max': 'Description must be at most {#limit} characters',
        }),
      } as TextFieldConfig,
    ],
    onSubmit,
    initialValues: role
      ? {
          name: role.name,
          description: role.description || '',
        }
      : undefined,
  };

  return (
    <Modal open={open} onClose={onClose} title={role ? 'Edit Role' : 'Add Role'}>
      <FormController<FormData> {...formConfig} submitLabel={role ? 'Update' : 'Create'} />
    </Modal>
  );
};
