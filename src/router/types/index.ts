import { RouteObject } from 'react-router-dom'

// Route paths constants
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  ADMIN_LOGIN: '/admin/login',
  ADMIN_REGISTER: '/admin/register',
  ADMIN: '/admin',
  CREATE_PROPERTY: '/properties/create',
  LIKED_PROPERTIES: '/properties/liked',
  MY_BOOKINGS: '/bookings',
  MY_LISTINGS: '/listings',
  NOTIFICATIONS: '/notifications',
  BOOKING_REQUESTS: '/booking-requests',
  SEARCH: '/search',
  HELP: '/help',
  TERMS: '/terms',
  WALLET: '/wallet',
  PROPERTY_DETAIL: '/properties/:id'
} as const

// Route configuration type
export type AppRoute = RouteObject & {
  requireAuth?: boolean;
  requireAdmin?: boolean;
  layout?: 'main' | 'admin' | 'auth' | null;
  title?: string;
}

// Navigation item type for sidebar
export interface NavItem {
  path: string;
  label: string;
  icon?: React.ComponentType;
  requireAuth?: boolean;
  requireAdmin?: boolean;
} 