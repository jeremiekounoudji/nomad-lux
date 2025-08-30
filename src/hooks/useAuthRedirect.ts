import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../lib/stores/authStore';
import { ROUTES } from '../router/types';

export const useAuthRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isAdmin } = useAuthStore();

  useEffect(() => {
    console.log('🔄 Auth redirect check:', {
      isAuthenticated,
      isAdmin,
      pathname: location.pathname,
      state: location.state
    });

    // Get return URL from location state or default to home
    const from = (location.state as any)?.from?.pathname || ROUTES.HOME;

    // Handle authenticated user redirects
    if (isAuthenticated) {
      if ([ROUTES.LOGIN, ROUTES.REGISTER].includes(location.pathname)) {
        console.log('🔄 Redirecting authenticated user from auth page to:', from);
        navigate(from, { replace: true });
      }
    }

    // Handle admin redirects
    if (isAdmin) {
      if ([ROUTES.ADMIN_LOGIN, ROUTES.ADMIN_REGISTER].includes(location.pathname)) {
        console.log('🔄 Redirecting admin from auth page to admin dashboard');
        navigate(ROUTES.ADMIN, { replace: true });
      }
    }
  }, [isAuthenticated, isAdmin, location.pathname, navigate]);

  // Function to redirect after successful login
  const redirectAfterLogin = () => {
    const from = (location.state as any)?.from?.pathname || ROUTES.HOME;
    console.log('🔄 Redirecting after login to:', from);
    navigate(from, { replace: true });
  };

  // Function to redirect after logout
  const redirectAfterLogout = () => {
    console.log('🔄 Redirecting after logout to login page');
    navigate(ROUTES.LOGIN, { replace: true });
  };

  return {
    redirectAfterLogin,
    redirectAfterLogout
  };
}; 