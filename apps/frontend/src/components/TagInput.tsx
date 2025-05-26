import { Autocomplete, Chip, TextField } from '@workspace/ui/src/lib/mui';
import { useId } from 'react';

interface TagInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  name?: string; // Add name prop
  error?: string;
  label?: string;
  placeholder?: string;
  suggestedTags?: string[];
  disabled?: boolean;
}

export const TagInput = ({
  value = [],
  onChange,
  name,
  error,
  label = 'Tags',
  placeholder = 'Add tag...',
  suggestedTags = [],
  disabled = false,
}: TagInputProps) => {
  const id = useId();

  const handleChange = (_event: React.SyntheticEvent, newValue: string[]) => {
    // Filter out empty strings and ensure array of strings
    const validTags = newValue.filter((tag) => typeof tag === 'string' && tag.trim() !== '');
    onChange(validTags);
  };

  return (
    <Autocomplete
      multiple
      id={id}
      options={suggestedTags}
      value={value}
      disabled={disabled}
      onChange={handleChange}
      freeSolo
      renderTags={(value: string[], getTagProps) =>
        value.map((option: string, index: number) => {
          const { key, ...tagProps } = getTagProps({ index });
          return (
            <Chip key={key} sx={{ height: '25px' }} variant='filled' label={option} {...tagProps} />
          );
        })
      }
      renderInput={(params) => (
        <TextField
          {...params}
          variant='outlined'
          fullWidth
          InputProps={{
            ...params.InputProps,
            style: {
              height: 'auto',
            },
          }}
          name={name}
          label={label}
          placeholder={placeholder}
          error={!!error}
          helperText={error}
          size='small'
          rows={5}
        />
      )}
    />
  );
};
