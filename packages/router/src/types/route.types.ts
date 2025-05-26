import { ComponentType, ReactNode } from 'react';

export interface RouteConfig {
  path: string;
  component: ComponentType;
  guards?: RouteGuard[];
  children?: RouteConfig[];
  meta?: RouteMeta;
}

export interface RouteMeta {
  title?: string;
  requiresAuth?: boolean;
  roles?: string[];
  layout?: ComponentType<{ children: ReactNode }>;
}

export interface RouteGuardFunction {
  (params: { path: string; component: any; meta?: any }): Promise<boolean> | boolean;
  type?: 'authGuard' | 'roleGuard';
}

export type RouteGuard = RouteGuardFunction;

export interface RouterConfig {
  routes: RouteConfig[];
  fallback?: ComponentType;
  guards?: RouteGuard[];
  Loader?: ComponentType;
}
