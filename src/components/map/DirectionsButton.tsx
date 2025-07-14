import React from 'react'
import { Button } from '@heroui/react'
import { Navigation } from 'lucide-react'
import { Property } from '../../interfaces/Property'

export interface DirectionsButtonProps {
  property: Property
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'solid' | 'bordered' | 'light'
  onDirectionsClick?: (property: Property) => void
}

const DirectionsButton: React.FC<DirectionsButtonProps> = ({
  property,
  className = '',
  size = 'md',
  variant = 'bordered',
  onDirectionsClick
}) => {
  const handleDirections = () => {
    // Placeholder implementation - will be implemented in task 3.3
    console.log('Directions to:', property.title)
    onDirectionsClick?.(property)
  }

  return (
    <Button
      variant={variant}
      size={size}
      color="primary"
      startContent={<Navigation size={16} />}
      onClick={handleDirections}
      className={className}
    >
      Directions
    </Button>
  )
}

export default DirectionsButton 