import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { ReactNode } from 'react';

interface DateTimeProviderProps {
  children: ReactNode;
}

export const DateTimeProvider = ({ children }: DateTimeProviderProps) => {
  return <LocalizationProvider dateAdapter={AdapterDayjs}>{children}</LocalizationProvider>;
};
