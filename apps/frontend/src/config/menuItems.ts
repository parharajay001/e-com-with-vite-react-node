import { NavigationMenuItem } from '@workspace/ui/src/types';

export const menuItems: NavigationMenuItem[] = [
  {
    title: 'Dashboard',
    key: 'dashboard',
    link: '/admin',
    icon: 'Dashboard',
  },
  {
    title: 'Products',
    key: 'products',
    icon: 'ShoppingCart',
    children: [
      {
        title: 'All Products',
        key: 'all-products',
        link: '/admin/products',
        icon: 'ShoppingCart',
      },
      {
        title: 'Categories',
        key: 'categories',
        link: '/admin/categories',
        icon: 'Category',
      },
    ],
  },
  {
    title: 'Orders',
    key: 'orders',
    icon: 'LocalShipping',
    children: [
      {
        title: 'All Orders',
        key: 'all-orders',
        link: '/admin/orders',
        icon: 'LocalShipping',
      },
    ],
  },
  {
    title: 'Users',
    key: 'users',
    icon: 'People',
    children: [
      {
        title: 'All Users',
        key: 'all-users',
        link: '/admin/users',
        icon: 'People',
      },
      {
        title: 'Roles',
        key: 'roles',
        link: '/admin/roles',
        icon: 'SupervisorAccount',
      },
    ],
  },
  {
    title: 'Sellers',
    key: 'sellers',
    link: '/admin/sellers',
    icon: 'Store',
  },
  {
    title: 'Tax Management',
    key: 'taxes',
    link: '/admin/taxes',
    icon: 'PriceChange',
  },
  {
    title: 'Settings',
    key: 'settings',
    link: '/admin/settings',
    icon: 'Settings',
  },
  {
    title: 'Profile',
    key: 'profile',
    link: '/admin/profile',
    icon: 'AccountCircle',
  },
];
