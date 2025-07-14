import React from 'react'
import { Button } from '@heroui/react'
import { Map, List } from 'lucide-react'

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
        List
      </Button>
      <Button
        variant={isMapView ? 'solid' : 'bordered'}
        color="primary"
        size={size}
        startContent={<Map size={16} />}
        onClick={() => onToggle(true)}
      >
        Map
      </Button>
    </div>
  )
}

export default MapToggle 