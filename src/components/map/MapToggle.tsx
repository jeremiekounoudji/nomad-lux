import React from 'react'
import { Button } from '@heroui/react'
import { Map, List } from 'lucide-react'
import { useTranslation } from '../../lib/stores/translationStore'

export interface MapToggleProps {
  isMapView: boolean
  onToggle: (isMapView: boolean) => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const MapToggle: React.FC<MapToggleProps> = ({
  isMapView,
  onToggle,
  className = '',
  size = 'md'
}) => {
  const { t } = useTranslation('common');
  // Placeholder implementation - will be implemented in task 4.1
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        variant={!isMapView ? 'solid' : 'bordered'}
        color="primary"
        size={size}
        startContent={<List size={16} />}
        onClick={() => onToggle(false)}
      >
        {t('list')}
      </Button>
      <Button
        variant={isMapView ? 'solid' : 'bordered'}
        color="primary"
        size={size}
        startContent={<Map size={16} />}
        onClick={() => onToggle(true)}
      >
        {t('map')}
      </Button>
    </div>
  )
}

export default MapToggle 