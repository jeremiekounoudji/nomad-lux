import React from 'react';

// Custom route interface with additional properties
export interface AppRoute {
  path?: string;
  element?: React.ReactNode;
  children?: AppRoute[];
  requireAuth?: boolean;
  requireAdmin?: boolean;
  layout?: 'main' | 'admin' | null;
  // Add other RouteObject properties as needed
  index?: boolean;
  caseSensitive?: boolean;
  id?: string;
}

// Route constants
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  ADMIN_LOGIN: '/admin/login',
  ADMIN_REGISTER: '/admin/register',
  ADMIN: '/admin',
  CREATE_PROPERTY: '/create-property',
  EDIT_PROPERTY: '/edit-property/:id',
  PROPERTY_DETAIL: '/property/:id',
  LIKED_PROPERTIES: '/liked-properties',
  MY_BOOKINGS: '/my-bookings',
  MY_LISTINGS: '/my-listings',
  NOTIFICATIONS: '/notifications',
  BOOKING_REQUESTS: '/booking-requests',
  SEARCH: '/search',
  WALLET: '/wallet',
  PROFILE: '/profile',
  HELP: '/help',
  TERMS: '/terms',
} as const;

export type RouteKey = keyof typeof ROUTES;