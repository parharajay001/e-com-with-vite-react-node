import { GridProps } from '@mui/material';
import { Schema } from 'joi';

export type FieldType =
  | 'text'
  | 'number'
  | 'email'
  | 'password'
  | 'date'
  | 'datetime'
  | 'time'
  | 'select'
  | 'multiselect'
  | 'radio'
  | 'checkbox'
  | 'file'
  | 'textarea'
  | 'phone'
  | 'custom';

export interface BaseFieldConfig {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  defaultValue?: any;
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  fullWidth?: boolean;
  joi?: Schema; // Joi schema for field validation
}

export interface TextFieldConfig extends BaseFieldConfig {
  type: 'text' | 'email' | 'password' | 'textarea' | 'phone';
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  autoComplete?: string;
}

export interface NumberFieldConfig extends BaseFieldConfig {
  type: 'number';
  min?: number;
  max?: number;
  step?: number;
}

export interface DateFieldConfig extends BaseFieldConfig {
  type: 'date' | 'datetime' | 'time';
  min?: string;
  max?: string;
}

export interface SelectFieldConfig extends BaseFieldConfig {
  type: 'select' | 'multiselect' | 'radio';
  options: Array<{
    label: string;
    value: string | number;
    disabled?: boolean;
  }>;
  multiple?: boolean;
}

export interface CheckboxFieldConfig extends BaseFieldConfig {
  type: 'checkbox';
  label: string;
  checkedValue?: any;
  uncheckedValue?: any;
}

export interface FileFieldConfig extends BaseFieldConfig {
  type: 'file';
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  allowedTypes?: string[];
}

export interface CustomFieldConfig extends BaseFieldConfig {
  type: 'custom';
  render: (props: {
    field: { value: any; onChange: (value: any) => void; name: string };
    error?: string;
  }) => JSX.Element;
}

export type FieldConfig =
  | TextFieldConfig
  | NumberFieldConfig
  | DateFieldConfig
  | SelectFieldConfig
  | CheckboxFieldConfig
  | FileFieldConfig
  | CustomFieldConfig;

export interface FormLayout {
  spacing?: number;
  direction?: 'row' | 'column';
  container?: boolean;
  gridProps?: Partial<GridProps>;
}

export interface FormConfig<T = any> {
  fields: FieldConfig[];
  layout?: FormLayout;
  onSubmit: (values: T) => void | Promise<void>;
  initialValues?: Partial<T>;
}

export interface FormControllerProps<T = any> extends FormConfig<T> {
  loading?: boolean;
  submitLabel?: string;
  resetLabel?: string;
  showReset?: boolean;
}
