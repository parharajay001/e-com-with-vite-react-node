import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  duration?: number;
}

export interface NotificationState {
  notifications: Notification[];
}

const initialState: NotificationState = {
  notifications: [],
};

export const notificationSlice: Slice<NotificationState> = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    enqueueNotification: (state, action: PayloadAction<Omit<Notification, 'id'>>) => {
      const id = Math.random().toString(36).slice(2);
      state.notifications.push({ ...action.payload, id });
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter((n) => n.id !== action.payload);
    },
  },
});

export const { enqueueNotification, removeNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
