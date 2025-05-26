import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { RouterConfig } from '../../types/route.types';
import GuardedRoute from '../GuardedRoute/GuardedRoute';

export const RouterProvider: React.FC<RouterConfig> = ({ routes, fallback: Fallback, Loader }) => {
  const renderRoutes = (routes: RouterConfig['routes']) => {
    return routes.map((route) => (
      <Route
        key={route.path}
        path={route.path}
        element={
          <GuardedRoute
            guards={route.guards}
            component={route.component}
            meta={route?.meta}
            Loader={Loader}
          />
        }
      >
        {route.children && renderRoutes(route.children)}
      </Route>
    ));
  };

  return (
    <BrowserRouter>
      <Routes>
        {renderRoutes(routes)}
        {Fallback && <Route path='*' element={<Fallback />} />}
      </Routes>
    </BrowserRouter>
  );
};

export default RouterProvider;
