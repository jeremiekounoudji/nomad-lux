import React from 'react';
import { Search, Plus, LogOut } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { ROUTES } from '../../router/types';
import { CompactLanguageSelector } from '../shared/LanguageSelector';
import { NotificationCenter } from '../shared/NotificationCenter';
import { useTranslation } from '../../lib/stores/translationStore';

interface DesktopTopBarProps {
  isAuthenticated: boolean;
  onLogout: () => void;
  onSearch: () => void;
}

const DesktopTopBar: React.FC<DesktopTopBarProps> = ({ isAuthenticated, onLogout, onSearch }) => {
  const { t } = useTranslation(['navigation', 'common']);

  return (
    <div className="sticky top-0 z-40 hidden border-b border-gray-200 bg-white px-6 py-4 lg:flex">
      <div className="max-w-2xl flex-1">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t('navigation.search.placeholder')}
            className="h-12 w-full rounded-full border border-gray-200 bg-gray-50 pl-12 pr-4 text-sm transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onSearch();
              }
            }}
          />
        </div>
      </div>
      <div className="ml-6 flex items-center gap-4">
        {/* Language Selector */}
        <CompactLanguageSelector />
        {/* Create Post - authenticated only */}
        {isAuthenticated && (
          <NavLink
            to={ROUTES.CREATE_PROPERTY}
            className="rounded-lg p-2 transition-colors hover:bg-gray-100"
          >
            <Plus className="size-5" />
          </NavLink>
        )}
        {/* Notification Center - authenticated only */}
        {isAuthenticated && (
          <NotificationCenter className="rounded-lg p-2 transition-colors hover:bg-gray-100" />
        )}
        {/* Sign Out - authenticated only */}
        {isAuthenticated && (
          <button
            onClick={onLogout}
            className="rounded-lg p-2 transition-colors hover:bg-red-50"
            title={t('navigation.actions.signOut')}
          >
            <LogOut className="size-5 text-red-500" />
          </button>
        )}
      </div>
    </div>
  );
};

export default DesktopTopBar;
