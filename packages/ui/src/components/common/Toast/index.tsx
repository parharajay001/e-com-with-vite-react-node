import { Alert, Snackbar, Typography } from '@mui/material';
import { useEffect } from 'react';
import { useDispatch, useSelector } from '@workspace/store';
import { RootState } from '@workspace/store';
import { removeNotification } from '@workspace/store/src/slices/notification.slice';

export const Toast = () => {
  const dispatch = useDispatch();
  const notifications = useSelector((state: RootState) => state.notification.notifications);

  useEffect(() => {
    if (notifications.length > 0) {
      const { id, duration = 3000 } = notifications[0];
      const timer = setTimeout(() => {
        dispatch(removeNotification(id));
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [notifications, dispatch]);

  if (!notifications.length) return null;

  const { id, message, type } = notifications[0];

  return (
    <Snackbar key={id} open={true} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
      <Alert
        onClose={() => dispatch(removeNotification(id))}
        severity={type}
        variant='filled'
        elevation={6}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};
