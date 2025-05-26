import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { enqueueNotification, NotificationType } from '../slices/notification.slice';

export const useNotification = () => {
  const dispatch = useDispatch();

  const showNotification = useCallback(
    (message: string, type: NotificationType = 'info', duration = 3000) => {
      dispatch(enqueueNotification({ message, type, duration }));
    },
    [dispatch],
  );

  return {
    showSuccess: (message: string, duration?: number) =>
      showNotification(message, 'success', duration),
    showError: (message: string, duration?: number) => showNotification(message, 'error', duration),
    showInfo: (message: string, duration?: number) => showNotification(message, 'info', duration),
    showWarning: (message: string, duration?: number) =>
      showNotification(message, 'warning', duration),
  };
};
