import React from 'react'
import { Property } from '../../interfaces/Property'
import { useTranslation } from '../../lib/stores/translationStore'

export interface PropertyMarkerProps {
  property: Property
  isSelected?: boolean
  onClick?: (property: Property) => void
  showPrice?: boolean
  showImage?: boolean
}

const PropertyMarker: React.FC<PropertyMarkerProps> = ({
  property,
  isSelected = false,
  onClick,
  showPrice = true,
  showImage = false
}) => {
  const { /* t */ } = useTranslation('property'); // Commented out unused variable
  // Placeholder implementation - will be implemented in task 3.2
  return (
    <div 
      className={`cursor-pointer transition-transform hover:scale-110${
        isSelected ? 'scale-110' : ''
      }`}
      onClick={() => onClick?.(property)}
    >
      <div className="rounded-lg border-2 border-primary-500 bg-white p-2 shadow-lg">
        {showImage && (
          <div className="mb-1 flex h-8 w-12 items-center justify-center rounded bg-gray-300">
            🏠
          </div>
        )}
        <div className="text-center">
          {showPrice && (
            <p className="text-sm font-bold text-primary-600">
              ${property.currency} ${property.price}
            </p>
          )}
          <p className="max-w-20 truncate text-xs text-gray-600">
            {property.title}
          </p>
        </div>
      </div>
    </div>
  )
}

export default PropertyMarker 