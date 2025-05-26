import { FormController } from '../FormController';
import { Joi } from '../../../lib/joi';
import { FormConfig } from '../types';

interface DemoFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: Date;
  password: string;
  confirmPassword: string;
  role: string;
  skills: string[];
  avatar: File | null;
  newsletter: boolean;
  bio: string;
}

const formConfig: FormConfig<DemoFormData> = {
  fields: [
    {
      name: 'firstName',
      type: 'text',
      label: 'First Name',
      placeholder: 'Enter your first name',
      xs: 12,
      sm: 6,
      joi: Joi.string().required().min(2).max(50).messages({
        'string.empty': 'First name is required',
        'string.min': 'First name must be at least {#limit} characters',
        'string.max': 'First name must be at most {#limit} characters',
      }),
    },
    {
      name: 'lastName',
      type: 'text',
      label: 'Last Name',
      placeholder: 'Enter your last name',
      xs: 12,
      sm: 6,
      joi: Joi.string().required().min(2).max(50).messages({
        'string.empty': 'Last name is required',
        'string.min': 'Last name must be at least {#limit} characters',
        'string.max': 'Last name must be at most {#limit} characters',
      }),
    },
    {
      name: 'email',
      type: 'email',
      label: 'Email Address',
      placeholder: 'Enter your email',
      xs: 12,
      sm: 6,
      joi: Joi.string().required().email({ tlds: false }).messages({
        'string.empty': 'Email is required',
        'string.email': 'Please enter a valid email address',
      }),
    },
    {
      name: 'phone',
      type: 'phone',
      label: 'Phone Number',
      placeholder: 'Enter your phone number',
      xs: 12,
      sm: 6,
      joi: Joi.string()
        .pattern(/^\+?[\d\s-()]+$/)
        .messages({
          'string.pattern.base': 'Please enter a valid phone number',
        }),
    },
    {
      name: 'password',
      type: 'password',
      label: 'Password',
      placeholder: 'Enter your password',
      helperText: 'Password must be at least 8 characters long',
      xs: 12,
      sm: 6,
      joi: Joi.string()
        .required()
        .min(8)
        .max(50)
        .pattern(/[A-Za-z]/)
        .pattern(/[0-9]/)
        .pattern(/[^A-Za-z0-9]/)
        .messages({
          'string.empty': 'Password is required',
          'string.min': 'Password must be at least {#limit} characters',
          'string.max': 'Password must be at most {#limit} characters',
          'string.pattern.base':
            'Password must include at least one letter, number, and special character',
        }),
    },
    {
      name: 'confirmPassword',
      type: 'password',
      label: 'Confirm Password',
      placeholder: 'Confirm your password',
      xs: 12,
      sm: 6,
      joi: Joi.string().required().equal(Joi.ref('$values.password')).messages({
        'string.empty': 'Please confirm your password',
        'any.only': 'Passwords must match',
      }),
    },
    {
      name: 'role',
      type: 'select',
      label: 'Role',
      options: [
        { value: 'user', label: 'User' },
        { value: 'admin', label: 'Administrator' },
        { value: 'editor', label: 'Editor' },
      ],
      xs: 12,
      sm: 6,
      joi: Joi.string().required().valid('user', 'admin', 'editor').messages({
        'string.empty': 'Please select a role',
        'any.only': 'Please select a valid role',
      }),
    },
    {
      name: 'skills',
      type: 'multiselect',
      label: 'Skills',
      options: [
        { value: 'react', label: 'React' },
        { value: 'typescript', label: 'TypeScript' },
        { value: 'nodejs', label: 'Node.js' },
        { value: 'python', label: 'Python' },
      ],
      xs: 12,
      sm: 6,
      joi: Joi.array().items(Joi.string()).min(1).messages({
        'array.min': 'Please select at least one skill',
      }),
    },
    {
      name: 'avatar',
      type: 'file',
      label: 'Profile Picture',
      accept: 'image/*',
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ['image/jpeg', 'image/png'],
      helperText: 'Max file size: 5MB. Supported formats: JPEG, PNG',
      xs: 12,
      joi: Joi.any()
        .custom((value, helpers) => {
          if (!value) return value;

          const file = value as File;
          if (file.size > 5 * 1024 * 1024) {
            return helpers.error('file.maxSize');
          }
          if (!['image/jpeg', 'image/png'].includes(file.type)) {
            return helpers.error('file.type');
          }
          return value;
        })
        .messages({
          'file.maxSize': 'File size must be less than 5MB',
          'file.type': 'Only JPEG and PNG files are allowed',
        }),
    },
    {
      name: 'bio',
      type: 'textarea',
      label: 'Bio',
      placeholder: 'Tell us about yourself',
      xs: 12,
      joi: Joi.string().max(500).allow('').messages({
        'string.max': 'Bio must be at most {#limit} characters',
      }),
    },
    {
      name: 'newsletter',
      type: 'checkbox',
      label: 'Subscribe to newsletter',
      xs: 12,
      joi: Joi.boolean(),
    },
  ],
  layout: {
    spacing: 2,
    direction: 'row',
  },
  onSubmit: async (values: DemoFormData) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log('Form submitted:', values);
  },
};

export const DemoForm = () => {
  return <FormController {...formConfig} submitLabel='Create Account' showReset />;
};
