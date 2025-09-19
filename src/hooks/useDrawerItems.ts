import { useTranslation } from '../lib/stores/translationStore';
import { ROUTES } from '../router/types';
import { ClipboardList, Wallet, HelpCircle, Shield, LogIn, UserPlus } from 'lucide-react';

export const useDrawerItems = (isAuthenticated: boolean) => {
  const { t } = useTranslation(['navigation', 'common']);

  const drawerItems = [
    {
      path: ROUTES.BOOKING_REQUESTS,
      label: t('navigation.menu.bookingRequests'),
      icon: ClipboardList,
      requireAuth: true,
    },
    { path: ROUTES.WALLET, label: t('navigation.menu.wallet'), icon: Wallet, requireAuth: true },
    { path: ROUTES.HELP, label: t('navigation.menu.help'), icon: HelpCircle },
    { path: ROUTES.TERMS, label: t('navigation.footer.terms'), icon: Shield },
    ...(isAuthenticated
      ? []
      : [
          { path: ROUTES.LOGIN, label: t('navigation.menu.login'), icon: LogIn },
          { path: ROUTES.REGISTER, label: t('navigation.menu.signup'), icon: UserPlus },
        ]),
    // { path: ROUTES.ADMIN_LOGIN, label: t('navigation.menu.admin'), icon: Crown }
  ];

  return { drawerItems };
};
