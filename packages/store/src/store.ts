import { configureStore } from '@reduxjs/toolkit';
import { commonReducer } from './slices/common.slice';
import notificationReducer from './slices/notification.slice';
import { themeReducer } from './slices/theme.slice';

export const reducers = {
  common: commonReducer,
  theme: themeReducer,
  notification: notificationReducer,
};

export const store = configureStore({
  reducer: {
    ...reducers,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

// Let TypeScript infer the RootState type from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
