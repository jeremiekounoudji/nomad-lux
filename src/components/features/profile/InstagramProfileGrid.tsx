import React from 'react'
import { useTranslation } from '../../../lib/stores/translationStore'

interface InstagramProfileGridProps {
  items: any[] // Will be updated with proper type when we have actual data
}

const InstagramProfileGrid: React.FC<InstagramProfileGridProps> = () => {
  const { t } = useTranslation(['profile'])

  // For now, we'll show placeholder items since we don't have actual post data
  // In a real implementation, this would be populated with user's properties/bookings
  const placeholderItems = Array(12).fill(null)

  return (
    <div className="mt-4">
      <div className="grid grid-cols-3 gap-1 sm:gap-4">
        {placeholderItems.map((_, index) => (
          <div 
            key={index} 
            className="aspect-square overflow-hidden rounded-sm bg-gradient-to-br from-blue-50 to-purple-50"
          >
            <div className="flex size-full items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-2 size-8 rounded-full bg-primary-100"></div>
                <p className="text-xs text-gray-500">{t('profile.noContent')}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default InstagramProfileGrid