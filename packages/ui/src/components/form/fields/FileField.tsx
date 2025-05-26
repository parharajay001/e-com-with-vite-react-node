import { Button, FormControl, FormHelperText, Typography } from '@mui/material';
import { useField } from 'formik';
import { ChangeEvent, useRef } from 'react';
import { FileFieldConfig } from '../types';
import { styled } from '@mui/material/styles';

const Input = styled('input')({
  display: 'none',
});

const FilePreview = styled('div')(({ theme }) => ({
  marginTop: theme.spacing(1),
  '& img': {
    height: '150px',
    width: '150px',
    objectFit: 'cover',
    borderRadius: '8px',
  },
}));

interface FileFieldProps {
  config: FileFieldConfig;
}

export const FileField = ({ config }: FileFieldProps) => {
  const [field, meta, helpers] = useField(config.name);
  const hasError = Boolean(meta.touched && meta.error);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (config.maxSize && file.size > config.maxSize) {
      return `File size must be less than ${config.maxSize / 1024 / 1024}MB`;
    }
    if (config.allowedTypes && !config.allowedTypes.includes(file.type)) {
      return `File type must be one of: ${config.allowedTypes.join(', ')}`;
    }
    return null;
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;

    if (config.multiple) {
      const fileArray = Array.from(files);
      const errors = fileArray.map(validateFile).filter(Boolean);
      if (errors.length) {
        helpers.setError(errors.join(', '));
        return;
      }
      helpers.setValue(fileArray);
    } else {
      const error = validateFile(files[0]);
      if (error) {
        helpers.setError(error);
        return;
      }
      helpers.setValue(files[0]);
    }
  };

  const clearFile = () => {
    helpers.setValue(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <FormControl error={hasError} required={config.required} fullWidth={config.fullWidth !== false}>
      <label htmlFor={`file-input-${config.name}`}>
        <Input
          ref={fileInputRef}
          accept={config.accept}
          id={`file-input-${config.name}`}
          multiple={config.multiple}
          type='file'
          onChange={handleFileChange}
        />
        <Button variant='outlined' fullWidth component='span' disabled={config.disabled}>
          {config.label}
        </Button>
      </label>

      {field.value && (
        <FilePreview>
          {config.multiple ? (
            <>
              <Typography variant='body2'>
                {(field.value as File[]).map((file) => file.name).join(', ')}
              </Typography>
              {(field.value as File[]).map((file) => (
                <img key={file.name} src={URL.createObjectURL(file)} alt={file.name} />
              ))}
            </>
          ) : (
            <>
              <Typography variant='body2'>{(field.value as File).name}</Typography>
              <img
                src={URL.createObjectURL(field.value as File)}
                alt={(field.value as File).name}
              />
            </>
          )}
          <Button fullWidth className='mt-5' variant='outlined' onClick={clearFile}>
            Clear
          </Button>
        </FilePreview>
      )}

      {(hasError || config.helperText) && (
        <FormHelperText>{hasError ? meta.error : config.helperText}</FormHelperText>
      )}
    </FormControl>
  );
};
