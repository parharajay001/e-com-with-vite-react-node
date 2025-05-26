import { TextField as MuiTextField } from '@mui/material';
import { useField } from 'formik';
import { NumberFieldConfig, TextFieldConfig } from '../types';

interface TextFieldProps {
  config: TextFieldConfig | NumberFieldConfig;
}

export const TextField = ({ config }: TextFieldProps) => {
  const [field, meta] = useField(config.name);
  const hasError = Boolean(meta.touched && meta.error);

  return (
    <MuiTextField
      {...field}
      onChange={(e) => {
        if (config.type === 'number') {
          console.log(e.target.value);
          const value = e.target.value;
          const parsedValue = value ? parseFloat(value) : 0;
          field.onChange({ target: { name: field.name, value: parsedValue } });
        } else {
          field.onChange(e);
        }
      }}
      type={config.type}
      label={config.label}
      placeholder={config.placeholder}
      helperText={hasError ? meta.error : config.helperText}
      error={hasError}
      required={config.required}
      disabled={config.disabled}
      fullWidth={config.fullWidth !== false}
      inputProps={
        config.type === 'number'
          ? { min: config.min, max: config.max, step: config.step }
          : config.type === 'text'
            ? {
                minLength: config.minLength,
                maxLength: config.maxLength,
                pattern: config.pattern,
                autoComplete: config.autoComplete,
              }
            : {}
      }
      multiline={config.type === 'textarea'}
      rows={config.type === 'textarea' ? 4 : undefined}
    />
  );
};
