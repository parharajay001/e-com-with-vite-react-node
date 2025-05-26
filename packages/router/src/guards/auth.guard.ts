import { RouteConfig, RouteGuard } from '../types/route.types';

export const authGuard: RouteGuard = async (to: RouteConfig) => {
  if (!to.meta?.requiresAuth) {
    return true;
  }

  // Check if user is authenticated
  const token = localStorage.getItem('token');
  if (!token) {
    return false;
  }

  return true;
};

// Add a type property
authGuard.type = 'authGuard';

export const roleGuard: RouteGuard = async (to: RouteConfig) => {
  const requiredRoles = to.meta?.roles;
  if (!requiredRoles?.length) {
    return true;
  }

  const userRolesStr = localStorage.getItem('user_roles');
  if (!userRolesStr) return false;

  try {
    const userRoles = JSON.parse(userRolesStr);
    const userRoleNames = userRoles.map((roleObj: any) => roleObj.role?.name);
    return requiredRoles.some((role) => userRoleNames.includes(role));
  } catch (error) {
    console.error('Error parsing user roles:', error);
    return false;
  }
};
// Add a type property
roleGuard.type = 'roleGuard';
