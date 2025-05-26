import { Button, CircularProgress, Grid } from '@mui/material';
import { Form, Formik, Field, FieldProps } from 'formik';
import { CheckboxField, DateField, FileField, SelectField, TextField } from './fields';
import {
  FieldConfig,
  FormControllerProps,
  TextFieldConfig,
  SelectFieldConfig,
  CheckboxFieldConfig,
  FileFieldConfig,
  DateFieldConfig,
  NumberFieldConfig,
  CustomFieldConfig,
} from './types';

const getFieldComponent = (field: FieldConfig) => {
  switch (field.type) {
    case 'text':
    case 'email':
    case 'password':
    case 'textarea':
    case 'phone':
      return <TextField config={field as TextFieldConfig} />;
    case 'number':
      return <TextField config={field as NumberFieldConfig} />;
    case 'select':
    case 'multiselect':
    case 'radio':
      return <SelectField config={field as SelectFieldConfig} />;
    case 'checkbox':
      return <CheckboxField config={field as CheckboxFieldConfig} />;
    case 'file':
      return <FileField config={field as FileFieldConfig} />;
    case 'date':
    case 'datetime':
    case 'time':
      return <DateField config={field as DateFieldConfig} />;
    case 'custom': {
      const customConfig = field as CustomFieldConfig;
      return (
        <Field name={customConfig.name}>
          {({ field, meta }: FieldProps) =>
            customConfig.render({
              field,
              error: meta.touched && meta.error ? meta.error : undefined,
            })
          }
        </Field>
      );
    }
    default:
      return null;
  }
};

export const FormController = <T extends Record<string, any>>({
  fields,
  onSubmit,
  initialValues = {},
  layout = {},
  loading = false,
  submitLabel = 'Submit',
  resetLabel = 'Reset',
  showReset = true,
}: FormControllerProps<T>) => {
  const validate = (values: T) => {
    try {
      const errors: Record<string, string> = {};

      fields.forEach((field) => {
        if (!field.joi) return;

        const value = values[field.name];
        const { error } = field.joi.validate(value, { context: { values } });

        if (error) {
          errors[field.name] = error.message;
        }
      });
      console.log(errors);
      return errors;
    } catch (error) {
      console.error('Validation error:', error);
      return {};
    }
  };

  const defaultInitialValues = fields.reduce(
    (acc, field) => {
      if (!initialValues.hasOwnProperty(field.name)) {
        acc[field.name] =
          field.defaultValue ??
          (field.type === 'checkbox' ? false : field.type === 'multiselect' ? [] : '');
      }
      return acc;
    },
    {} as Record<string, any>,
  );

  const mergedInitialValues = { ...defaultInitialValues, ...initialValues };

  return (
    <Formik<T>
      initialValues={mergedInitialValues as T}
      validate={validate}
      onSubmit={async (values, { setSubmitting }) => {
        try {
          await onSubmit(values);
        } catch (error) {
          console.error('Form submission error:', error);
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ handleReset, isSubmitting }) => (
        <Form noValidate>
          <Grid
            container
            spacing={layout.spacing ?? 2}
            direction={layout.direction ?? 'row'}
            {...layout.gridProps}
          >
            {fields.map((field) =>
              field.hidden ? null : (
                <Grid
                  item
                  key={field.name}
                  xs={field.xs ?? 12}
                  sm={field.sm}
                  md={field.md}
                  lg={field.lg}
                  xl={field.xl}
                >
                  {getFieldComponent(field)}
                </Grid>
              ),
            )}

            <Grid item xs={12}>
              <Button
                type='submit'
                variant='contained'
                color='primary'
                disabled={isSubmitting || loading}
                sx={{ mr: showReset ? 2 : 0 }}
              >
                {isSubmitting || loading ? (
                  <CircularProgress size={24} color='inherit' />
                ) : (
                  submitLabel
                )}
              </Button>

              {showReset && (
                <Button
                  type='button'
                  variant='outlined'
                  onClick={handleReset}
                  disabled={isSubmitting || loading}
                >
                  {resetLabel}
                </Button>
              )}
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );
};
