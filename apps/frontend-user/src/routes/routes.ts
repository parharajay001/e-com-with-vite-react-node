import { authGuard, roleGuard, RouteConfig } from '@workspace/router';
import { lazy } from 'react';

const Login = lazy(() => import('../pages/auth/Login'));
const Register = lazy(() => import('../pages/auth/Register'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const NoLayout = lazy(() => import('@workspace/ui/src/components/Layout/NoLayout'));
const Unauthoried = lazy(() => import('../pages/auth/Unauthoried'));
const PageNotFound = lazy(() => import('../pages/auth/404PageNotFound'));

export const routes: RouteConfig[] = [
  {
    path: '',
    component: () => {
      location.replace('/dashboard');
      return null;
    },
  },
  {
    path: '/auth',
    component: () => null,
    meta: {
      layout: NoLayout,
    },
    children: [
      {
        path: 'login',
        component: Login,
      },
      {
        path: 'register',
        component: Register,
      },
    ],
  },
  {
    path: '/unauthorised',
    component: () => null,
    meta: {
      layout: NoLayout,
    },
    children: [
      {
        path: '',
        component: Unauthoried,
      },
    ],
  },
  {
    path: '/page-not-found',
    component: () => null,
    meta: {
      layout: NoLayout,
    },
    children: [
      {
        path: '',
        component: PageNotFound,
      },
    ],
  },
  // User routes
  {
    path: '/',
    component: () => null,
    guards: [authGuard, roleGuard],
    meta: {
      requiresAuth: true,
      roles: ['ADMIN', 'USER'],
      layout: NoLayout,
    },
    children: [
      {
        path: '/dashboard',
        component: Dashboard,
      },
    ],
  },
];
