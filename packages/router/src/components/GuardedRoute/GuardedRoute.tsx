import React, { ComponentType, ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { RouteConfig, RouteGuard } from '../../types/route.types';

interface GuardedRouteProps {
  component: RouteConfig['component'];
  guards?: RouteGuard[];
  meta?: RouteConfig['meta'];
  Loader?: ComponentType;
}

export const GuardedRoute: React.FC<GuardedRouteProps> = ({
  component: Component,
  guards = [],
  meta,
  Loader = () => <div>Loading...</div>,
}) => {
  const location = useLocation();
  const [canActivate, setCanActivate] = useState<boolean | null>(null);
  const [isAuthorised, setIsAuthorised] = useState<boolean | null>(null);

  useEffect(() => {
    const checkGuards = async () => {
      try {
        let authResult = true;
        let authorizedResult = true;

        for (const guard of guards) {
          const result = await guard({ path: location.pathname, component: Component, meta });

          if (!result) {
            // Check if this is an auth guard failure
            if ('type' in guard && guard.type === 'authGuard') {
              authResult = false;
              break;
            }
            // Check if this is a role guard failure
            if ('type' in guard && guard.type === 'roleGuard') {
              authorizedResult = false;
              break;
            }
          }
        }

        setCanActivate(authResult);
        setIsAuthorised(authorizedResult);
      } catch (error) {
        console.error('Guard check failed:', error);
        setCanActivate(false);
      }
    };

    checkGuards();
  }, [location, guards, Component, meta]);

  if (canActivate === null) {
    return <Loader />;
  }

  // Handle authentication failure
  if (canActivate === false) {
    return (
      <Navigate
        to='/auth/login'
        state={{ from: { pathname: location.pathname, state: location.state } }}
        replace
      />
    );
  }

  // Handle authorization failure
  if (isAuthorised === false) {
    return (
      <Navigate
        to='/unauthorised'
        state={{ from: { pathname: location.pathname, state: location.state } }}
        replace
      />
    );
  }

  const Layout = meta?.layout;
  return Layout ? <Layout children={<Component />} /> : <Component />;
};

export default GuardedRoute;
