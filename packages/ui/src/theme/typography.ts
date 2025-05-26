import { TypographyOptions } from '@mui/material/styles/createTypography';

export const typography: TypographyOptions = {
  fontFamily: [
    'Inter',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Helvetica Neue',
    'Arial',
    'sans-serif',
  ].join(','),
  h1: {
    fontSize: '2.5rem',
    '@media (max-width:900px)': {
      fontSize: '2rem',
    },
    '@media (max-width:600px)': {
      fontSize: '1.75rem',
    },
  },
  h2: {
    fontSize: '2rem',
    '@media (max-width:900px)': {
      fontSize: '1.75rem',
    },
    '@media (max-width:600px)': {
      fontSize: '1.5rem',
    },
  },
  h3: {
    fontSize: '1.75rem',
    '@media (max-width:900px)': {
      fontSize: '1.5rem',
    },
    '@media (max-width:600px)': {
      fontSize: '1.25rem',
    },
  },
  h4: {
    fontSize: '1.5rem',
    '@media (max-width:900px)': {
      fontSize: '1.25rem',
    },
    '@media (max-width:600px)': {
      fontSize: '1.1rem',
    },
  },
  h5: {
    fontSize: '1.25rem',
    '@media (max-width:900px)': {
      fontSize: '1.1rem',
    },
    '@media (max-width:600px)': {
      fontSize: '1rem',
    },
  },
  h6: {
    fontSize: '1.1rem',
    '@media (max-width:900px)': {
      fontSize: '1rem',
    },
    '@media (max-width:600px)': {
      fontSize: '0.9rem',
    },
  },
  body1: {
    fontSize: '1rem',
    '@media (max-width:900px)': {
      fontSize: '0.95rem',
    },
    '@media (max-width:600px)': {
      fontSize: '0.9rem',
    },
  },
  body2: {
    fontSize: '0.9rem',
    '@media (max-width:900px)': {
      fontSize: '0.85rem',
    },
    '@media (max-width:600px)': {
      fontSize: '0.8rem',
    },
  },
};
