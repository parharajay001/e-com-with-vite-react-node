import { Checkbox, FormControl, FormControlLabel, FormHelperText } from '@mui/material';
import { useField } from 'formik';
import { CheckboxFieldConfig } from '../types';

interface CheckboxFieldProps {
  config: CheckboxFieldConfig;
}

export const CheckboxField = ({ config }: CheckboxFieldProps) => {
  const [field, meta] = useField(config.name);
  const hasError = Boolean(meta.touched && meta.error);

  return (
    <FormControl error={hasError} required={config.required}>
      <FormControlLabel
        control={
          <Checkbox
            {...field}
            checked={field.value === (config.checkedValue ?? true)}
            disabled={config.disabled}
          />
        }
        label={config.label}
      />
      {(hasError || config.helperText) && (
        <FormHelperText>{hasError ? meta.error : config.helperText}</FormHelperText>
      )}
    </FormControl>
  );
};
