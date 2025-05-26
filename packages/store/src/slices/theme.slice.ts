import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ThemeState {
  mode: 'light' | 'dark';
  sidebarOpen: boolean;
  expandedMenuItems: string[];
}

const initialState: ThemeState = {
  mode: 'light',
  sidebarOpen: false,
  expandedMenuItems: [],
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === 'light' ? 'dark' : 'light';
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    toggleMenuItem: (state, action: PayloadAction<string>) => {
      const index = state.expandedMenuItems.indexOf(action.payload);
      if (index === -1) {
        state.expandedMenuItems.push(action.payload);
      } else {
        state.expandedMenuItems.splice(index, 1);
      }
    },
  },
});

export const { toggleTheme, toggleSidebar, toggleMenuItem } = themeSlice.actions;
export const { reducer: themeReducer } = themeSlice;
