import { StyledEngineProvider, ThemeProvider, createTheme as muiCreateTheme } from '@mui/material';
import { typography } from './typography';
import { lightPalette } from './lightPalette';
import { darkPalette } from './darkPalette';
import { getComponents } from './components';

export const getTheme = (mode: 'light' | 'dark') => {
  return muiCreateTheme({
    palette: mode === 'light' ? lightPalette : darkPalette,
    typography: {
      ...typography,
      button: {
        textTransform: 'none',
      },
    },
    components: getComponents(mode),
  });
};

export { StyledEngineProvider, ThemeProvider };
