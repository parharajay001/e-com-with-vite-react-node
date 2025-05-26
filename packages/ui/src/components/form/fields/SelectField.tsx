import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormLabel,
} from '@mui/material';
import { useField } from 'formik';
import { SelectFieldConfig } from '../types';

interface SelectFieldProps {
  config: SelectFieldConfig;
}

export const SelectField = ({ config }: SelectFieldProps) => {
  const [field, meta] = useField(config.name);
  const hasError = Boolean(meta.touched && meta.error);

  if (config.type === 'radio') {
    return (
      <FormControl error={hasError} required={config.required} disabled={config.disabled}>
        <FormLabel>{config.label}</FormLabel>
        <RadioGroup {...field} row>
          {config.options.map((option) => (
            <FormControlLabel
              key={option.value}
              value={option.value}
              control={<Radio />}
              label={option.label}
              disabled={option.disabled}
            />
          ))}
        </RadioGroup>
        {(hasError || config.helperText) && (
          <FormHelperText>{hasError ? meta.error : config.helperText}</FormHelperText>
        )}
      </FormControl>
    );
  }

  return (
    <FormControl
      fullWidth={config.fullWidth !== false}
      error={hasError}
      required={config.required}
      disabled={config.disabled}
    >
      <InputLabel>{config.label}</InputLabel>
      <Select {...field} label={config.label} multiple={config.type === 'multiselect'}>
        {config.options.map((option) => (
          <MenuItem key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
      {(hasError || config.helperText) && (
        <FormHelperText>{hasError ? meta.error : config.helperText}</FormHelperText>
      )}
    </FormControl>
  );
};
