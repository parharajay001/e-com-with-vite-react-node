import { NavigationMenuItem } from '@workspace/ui/src/types';

export const menuItems: NavigationMenuItem[] = [
  {
    title: 'Dashboard',
    key: 'dashboard',
    link: '/admin',
    icon: 'Dashboard',
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
