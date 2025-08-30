import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../lib/stores/authStore';
import { ROUTES } from '../types';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAuth = false,
  requireAdmin = false,
}) => {
  const location = useLocation();
  const { isAuthenticated, isAdmin, isLoading } = useAuthStore();

  // Show nothing while loading auth state
  if (isLoading) {
    return null;
  }

  // If auth is required and user is not authenticated
  if (requireAuth && !isAuthenticated) {
    console.log('🔒 AuthGuard: Redirecting to login - Not authenticated');
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // If admin access is required and user is not admin
  if (requireAdmin && !isAdmin) {
    console.log('🔒 AuthGuard: Redirecting to home - Not admin');
    return <Navigate to={ROUTES.HOME} replace />;
  }

  // If user is authenticated but tries to access auth pages
  if (isAuthenticated && [ROUTES.LOGIN, ROUTES.REGISTER].includes(location.pathname as any)) {
    console.log('🔒 AuthGuard: Redirecting to home - Already authenticated');
    return <Navigate to={ROUTES.HOME} replace />;
  }

  // If admin is authenticated but tries to access admin auth pages
  if (isAdmin && [ROUTES.ADMIN_LOGIN, ROUTES.ADMIN_REGISTER].includes(location.pathname as any)) {
    console.log('🔒 AuthGuard: Redirecting to admin - Already authenticated admin');
    return <Navigate to={ROUTES.ADMIN} replace />;
  }

  return <>{children}</>;
}; 