import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { FormControl, FormHelperText } from '@mui/material';
import { useField } from 'formik';
import { DateFieldConfig } from '../types';
import dayjs from 'dayjs';

interface DateFieldProps {
  config: DateFieldConfig;
}

export const DateField = ({ config }: DateFieldProps) => {
  const [field, meta, helpers] = useField(config.name);
  const hasError = Boolean(meta.touched && meta.error);

  const handleChange = (value: dayjs.Dayjs | null) => {
    helpers.setValue(value?.toISOString() ?? null);
  };

  const value = field.value ? dayjs(field.value) : null;

  const commonProps = {
    value,
    onChange: handleChange,
    slotProps: {
      textField: {
        fullWidth: config.fullWidth !== false,
        required: config.required,
        error: hasError,
        helperText: hasError ? meta.error : config.helperText,
      },
    },
    disabled: config.disabled,
    label: config.label,
  };

  const renderPicker = () => {
    switch (config.type) {
      case 'time':
        return <TimePicker {...commonProps} />;
      case 'datetime':
        return <DateTimePicker {...commonProps} />;
      default:
        return <DatePicker {...commonProps} />;
    }
  };

  return (
    <FormControl error={hasError} required={config.required} fullWidth={config.fullWidth !== false}>
      {renderPicker()}
      {(hasError || config.helperText) && (
        <FormHelperText>{hasError ? meta.error : config.helperText}</FormHelperText>
      )}
    </FormControl>
  );
};
