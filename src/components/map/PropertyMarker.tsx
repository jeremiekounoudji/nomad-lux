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
  const { t } = useTranslation('property');
  // Placeholder implementation - will be implemented in task 3.2
  return (
    <div 
      className={`cursor-pointer transform transition-transform hover:scale-110 ${
        isSelected ? 'scale-110' : ''
      }`}
      onClick={() => onClick?.(property)}
    >
      <div className="bg-white rounded-lg shadow-lg p-2 border-2 border-primary-500">
        {showImage && (
          <div className="w-12 h-8 bg-gray-300 rounded mb-1 flex items-center justify-center">
            🏠
          </div>
        )}
        <div className="text-center">
          {showPrice && (
            <p className="font-bold text-sm text-primary-600">
              ${property.currency} ${property.price}
            </p>
          )}
          <p className="text-xs text-gray-600 truncate max-w-20">
            {property.title}
          </p>
        </div>
      </div>
    </div>
  )
}

export default PropertyMarker 