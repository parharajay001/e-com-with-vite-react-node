import { authGuard, roleGuard, RouteConfig } from '@workspace/router';
import { lazy } from 'react';

const Login = lazy(() => import('../pages/auth/Login'));
const Register = lazy(() => import('../pages/auth/Register'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const AdminLayout = lazy(() => import('@workspace/ui/src/components/Layout/AdminLayout'));
const NoLayout = lazy(() => import('@workspace/ui/src/components/Layout/NoLayout'));
const Unauthoried = lazy(() => import('../pages/auth/Unauthoried'));
const PageNotFound = lazy(() => import('../pages/auth/404PageNotFound'));
const Users = lazy(() => import('../pages/admin/Users'));
const Products = lazy(() => import('../pages/admin/Products'));
const ProductVariants = lazy(() => import('../pages/admin/ProductVariants'));
const Orders = lazy(() => import('../pages/admin/Orders'));
const OrderDetails = lazy(() => import('../pages/admin/OrderDetails'));
const Settings = lazy(() => import('../pages/admin/Settings'));
const Categories = lazy(() => import('../pages/admin/Categories'));
const Profile = lazy(() => import('../pages/admin/Profile'));
const Roles = lazy(() => import('../pages/admin/Roles'));
const Addresses = lazy(() => import('../pages/admin/Addresses'));
const Taxes = lazy(() => import('../pages/admin/Taxes'));
const Sellers = lazy(() => import('../pages/admin/Sellers'));
const SellerProducts = lazy(() => import('../pages/admin/SellerProducts'));

export const routes: RouteConfig[] = [
  {
    path: '',
    component: () => {
      location.replace('/admin');
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
      layout: AdminLayout,
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
  // This route is for the admin dashboard
  // It is protected by the authGuard and roleGuard
  // The authGuard checks if the user is authenticated
  // The roleGuard checks if the user has the required role
  // The layout for this route is the AdminLayout
  // The children of this route are the different sections of the admin dashboard
  {
    path: '/admin',
    component: () => null,
    guards: [authGuard, roleGuard],
    meta: {
      requiresAuth: true,
      roles: ['ADMIN'],
      layout: AdminLayout,
    },
    children: [
      {
        path: '',
        component: Dashboard,
      },
      {
        path: 'settings',
        component: Settings,
      },
      {
        path: 'profile',
        component: Profile,
      },
      {
        path: 'users',
        component: () => null,
        meta: {
          requiresAuth: true,
          layout: NoLayout,
        },
        children: [
          {
            path: '',
            component: Users,
          },
          {
            path: 'addresses',
            component: Addresses,
          },
        ],
      },
      {
        path: 'products',
        component: () => null,
        meta: {
          requiresAuth: true,
          layout: NoLayout,
        },
        children: [
          {
            path: '',
            component: Products,
          },
          {
            path: 'variants',
            component: ProductVariants,
          },
        ],
      },
      {
        path: 'categories',
        component: () => null,
        meta: {
          requiresAuth: true,
          layout: NoLayout,
        },
        children: [
          {
            path: '',
            component: Categories,
          },
          {
            path: 'create',
            component: () => 'create',
          },
        ],
      },
      {
        path: 'orders',
        component: () => null,
        meta: {
          requiresAuth: true,
          layout: NoLayout,
        },
        children: [
          {
            path: '',
            component: Orders,
          },
          {
            path: 'details',
            component: OrderDetails,
          },
        ],
      },
      {
        path: 'roles',
        component: () => null,
        meta: {
          requiresAuth: true,
          layout: NoLayout,
        },
        children: [
          {
            path: '',
            component: Roles,
          },
        ],
      },
      {
        path: 'taxes',
        component: () => null,
        meta: {
          requiresAuth: true,
          layout: NoLayout,
        },
        children: [
          {
            path: '',
            component: Taxes,
          },
        ],
      },
      {
        path: 'sellers',
        component: () => null,
        meta: {
          requiresAuth: true,
          layout: NoLayout,
        },
        children: [
          {
            path: '',
            component: Sellers,
          },
          {
            path: 'products',
            component: SellerProducts,
          },
        ],
      },
    ],
  },
];
