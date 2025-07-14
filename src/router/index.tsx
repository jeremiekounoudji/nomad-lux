import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { AppRoute, ROUTES } from './types';
import { AuthGuard } from './guards/AuthGuard';

// Page imports
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import { AdminLoginPage } from '../pages/AdminLoginPage';
import { AdminRegisterPage } from '../pages/AdminRegisterPage';
import { AdminPage } from '../pages/AdminPage';
import CreatePropertyPage from '../pages/CreatePropertyPage';
import LikedPropertiesPage from '../pages/LikedPropertiesPage';
import MyBookingsPage from '../pages/MyBookingsPage';
import MyListingsPage from '../pages/MyListingsPage';
import NotificationsPage from '../pages/NotificationsPage';
import BookingRequestsPage from '../pages/BookingRequestsPage';
import SearchPage from '../pages/SearchPage';
import HelpPage from '../pages/HelpPage';
import TermsPage from '../pages/TermsPage';
import WalletPage from '../pages/WalletPage';
import PropertyDetailPage from '../pages/PropertyDetailPage';

// Layout imports
import MainLayout from '../components/layout/MainLayout';
import { AdminLayout } from '../components/features/admin/AdminLayout';

// Helper to wrap route element with AuthGuard
const guardRoute = (element: React.ReactNode, requireAuth = false, requireAdmin = false) => (
  <AuthGuard requireAuth={requireAuth} requireAdmin={requireAdmin}>
    {element}
  </AuthGuard>
);

// Admin layout wrapper with required props
const AdminLayoutWrapper = () => {
  return (
    <AdminLayout 
      currentSection="dashboard"
      onSectionChange={() => {}}
    >
      <Outlet />
    </AdminLayout>
  );
};

// Define routes configuration
const routes: AppRoute[] = [
  {
    path: ROUTES.HOME,
    element: guardRoute(<MainLayout />, true),
    requireAuth: true,
    layout: 'main',
    children: [
      { path: ROUTES.HOME, element: <HomePage /> },
      { path: ROUTES.CREATE_PROPERTY, element: <CreatePropertyPage /> },
      { path: ROUTES.LIKED_PROPERTIES, element: <LikedPropertiesPage /> },
      { path: ROUTES.MY_BOOKINGS, element: <MyBookingsPage /> },
      { path: ROUTES.MY_LISTINGS, element: <MyListingsPage /> },
      { path: ROUTES.NOTIFICATIONS, element: <NotificationsPage /> },
      { path: ROUTES.BOOKING_REQUESTS, element: <BookingRequestsPage /> },
      { path: ROUTES.SEARCH, element: <SearchPage /> },
      { path: ROUTES.WALLET, element: <WalletPage /> },
      { path: '*', element: <Navigate to={ROUTES.HOME} replace /> }
    ]
  },
  {
    path: ROUTES.PROPERTY_DETAIL,
    element: guardRoute(<PropertyDetailPage />, true),
    requireAuth: true,
    layout: null, // No main layout for this page
  },
  {
    path: ROUTES.ADMIN,
    element: guardRoute(<AdminLayoutWrapper />, true, true),
    requireAuth: true,
    requireAdmin: true,
    layout: 'admin',
    children: [
      { path: ROUTES.ADMIN, element: <AdminPage /> }
    ]
  },
  {
    path: '/',
    element: <Outlet />,
    layout: 'auth',
    children: [
      { path: ROUTES.LOGIN, element: guardRoute(<LoginPage />) },
      { path: ROUTES.REGISTER, element: guardRoute(<RegisterPage />) },
      { path: ROUTES.ADMIN_LOGIN, element: guardRoute(<AdminLoginPage />) },
      { path: ROUTES.ADMIN_REGISTER, element: guardRoute(<AdminRegisterPage />) },
      { path: ROUTES.HELP, element: <HelpPage /> },
      { path: ROUTES.TERMS, element: <TermsPage /> }
    ]
  }
];

// Create and export the router
export const router = createBrowserRouter(routes);

// Export routes for use in navigation components
export { routes, ROUTES }; 