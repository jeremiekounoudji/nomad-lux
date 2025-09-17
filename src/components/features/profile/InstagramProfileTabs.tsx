import React from 'react'
import { Card, CardBody } from '@heroui/react'
import { Grid3X3, User } from 'lucide-react'
import { useTranslation } from '../../../lib/stores/translationStore'

interface InstagramProfileTabsProps {
  activeTab: 'posts' | 'tagged'
  onTabChange: (tab: 'posts' | 'tagged') => void
}

const InstagramProfileTabs: React.FC<InstagramProfileTabsProps> = ({
  activeTab,
  onTabChange
}) => {
  const { t } = useTranslation(['profile'])

  return (
    <Card className="w-full border-0 bg-white/80 shadow-lg backdrop-blur-sm">
      <CardBody className="p-0">
        <div className="flex border-t border-gray-200">
          <button
            className={`flex flex-1 items-center justify-center py-4 ${
              activeTab === 'posts' 
                ? 'border-t-2 border-primary-500 text-primary-500' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => onTabChange('posts')}
          >
            <Grid3X3 className="mr-2 size-5" aria-hidden="true" />
            <span className="font-medium">{t('profile.tabs.posts')}</span>
          </button>
          <button
            className={`flex flex-1 items-center justify-center py-4 ${
              activeTab === 'tagged' 
                ? 'border-t-2 border-primary-500 text-primary-500' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => onTabChange('tagged')}
          >
            <User className="mr-2 size-5" aria-hidden="true" />
            <span className="font-medium">{t('profile.tabs.tagged')}</span>
          </button>
        </div>
      </CardBody>
    </Card>
  )
}

export default InstagramProfileTabs