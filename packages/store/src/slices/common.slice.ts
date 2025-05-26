import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NavigationMenuItem } from '../types';

export interface CommonState {
  loading: boolean;
  error: string | null;
  menuItems: NavigationMenuItem[];
}

const initialState: CommonState = {
  loading: false,
  error: null,
  menuItems: [],
};

const commonSlice = createSlice({
  name: 'common',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setMenuItems: (state, action: PayloadAction<NavigationMenuItem[]>) => {
      state.menuItems = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { setLoading, setError, clearError, setMenuItems } = commonSlice.actions;
export const commonReducer = commonSlice.reducer;
