import React from 'react'
import { Menu, Search } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { ROUTES } from '../../router/types'
import { CompactLanguageSelector } from '../shared/LanguageSelector'
import { useTranslation } from '../../lib/stores/translationStore'

interface MobileHeaderProps {
  onToggleDrawer: () => void
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ onToggleDrawer }) => {
  const { t } = useTranslation(['navigation', 'common'])

  return (
    <div className="sticky top-0 z-40 border-b border-gray-200 bg-white px-4 py-3 lg:hidden">
      <div className="flex items-center justify-between">
        {/* Left: Menu/Drawer */}
        <button 
          onClick={onToggleDrawer}
          className="shrink-0 rounded-lg p-2 transition-colors hover:bg-gray-100"
        >
          <Menu className="size-5" />
        </button>
        
        {/* Center: Nomad Lux Name */}
        <NavLink to={ROUTES.HOME} className="flex shrink-0 items-center">
          <span className="font-script text-xl font-bold text-primary-600">
            {t('navigation.brand.name')}
          </span>
        </NavLink>
        
        {/* Right: Search and Language */}
        <div className="flex shrink-0 items-center gap-2">
          <NavLink 
            to={ROUTES.SEARCH}
            className="rounded-lg p-2 transition-colors hover:bg-gray-100"
          >
            <Search className="size-5" />
          </NavLink>
          <CompactLanguageSelector className="shrink-0" />
        </div>
      </div>
    </div>
  )
}

export default MobileHeader
