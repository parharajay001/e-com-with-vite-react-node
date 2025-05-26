import { Navigate, RouterProvider } from '@workspace/router';
import { RootState, setMenuItems, useDispatch, useSelector } from '@workspace/store';
import {
  LoadingSpinner,
  StyledEngineProvider,
  ThemeProvider,
  Toast,
  getTheme,
} from '@workspace/ui';
import { Suspense, useEffect, useMemo } from 'react';
import { routes } from '../routes/routes';
import { menuItems } from '../config/menuItems';

const LoadingFallback = () => (
  <div style={{ position: 'relative', height: '100vh' }}>
    <LoadingSpinner />
  </div>
);

export const Fallback = () => {
  return <Navigate to='/page-not-found' replace />;
};

export const AppGuard = () => {
  const dispatch = useDispatch();
  const { mode } = useSelector((state: RootState) => state.theme);
  const theme = useMemo(() => getTheme(mode), [mode]);

  useEffect(() => {
    dispatch(setMenuItems(menuItems));
  }, [dispatch]);

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <Suspense fallback={<LoadingFallback />}>
          <Toast />
          <RouterProvider routes={routes} fallback={Fallback} Loader={LoadingFallback} />
        </Suspense>
      </ThemeProvider>
    </StyledEngineProvider>
  );
};
