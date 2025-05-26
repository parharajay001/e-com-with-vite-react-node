import { Components } from '@mui/material/styles';

export const getComponents = (mode: 'light' | 'dark'): Components => ({
  MuiAppBar: {
    defaultProps: {
      elevation: 0,
    },
    styleOverrides: {
      root: {
        borderBottom: '1px solid',
        borderColor: mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)',
      },
    },
  },
  MuiTextField: {
    defaultProps: {
      size: 'small',
    },
    styleOverrides: {
      root: {
        '& .MuiInputBase-root': {
          height: 40,
        },
      },
    },
  },
  MuiInput: {
    styleOverrides: {
      root: {
        height: 40,
      },
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        height: 40,
      },
    },
  },
  MuiFilledInput: {
    styleOverrides: {
      root: {
        height: 40,
      },
    },
  },
  MuiTypography: {
    defaultProps: {
      color: 'text.primary',
    },
  },
  MuiInputLabel: {
    styleOverrides: {
      root: {
        // base label positioning for an outlined TextField
        '&.MuiInputLabel-outlined': {
          // translateX stays at 14px (horizontal padding)
          // translateY: (fieldHeight – fontSize) / 2 = (40 – 16) / 2 = 12px
          transform: 'translate(14px, 9px) scale(1)',
        },
        // when that outlined label is in the shrunk/focused state…
        '&.MuiInputLabel-outlined.MuiInputLabel-shrink': {
          // float it above as usual
          transform: 'translate(14px, -6px) scale(0.75)',
        },
      },
    },
  },
});
