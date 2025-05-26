import { Store } from '@reduxjs/toolkit';
import { ReactNode } from 'react';
import { Provider } from 'react-redux';

export const GlobalProvider = ({ children, store }: { children: ReactNode; store: Store }) => {
  return <Provider store={store}>{children}</Provider>;
};
