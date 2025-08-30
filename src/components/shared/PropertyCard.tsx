import React from 'react'
import { PropertyCardProps } from '../../interfaces/PropertyCardProps'
import { Card, CardBody, Button } from '@heroui/react'
import { Heart, Star, MapPin } from 'lucide-react'
import { useTranslation } from '../../lib/stores/translationStore'
import { usePropertyTypeTranslation, useContentTranslation } from '../../hooks/useTranslatedContent'

const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onView,
  onLike,
  onShare,
  onBook,
  onClick,
  showStats = false,
  showActions = true,
  className = '',
  variant
}) => {
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0)
  const { t } = useTranslation('property')
  
  // Translate property type
  const { translation: propertyTypeTranslation } = usePropertyTypeTranslation(property.property_type)
  
  // Translate property title and description if available
  const { translatedContent: translatedTitle } = useContentTranslation(
    'property',
    property.id,
    'title',
    property.title
  )
  
  const { translatedContent: translatedDescription } = useContentTranslation(
    'property',
    property.id,
    'description',
    property.description
  )

  const nextImage = () => {
    if (property.images && property.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % property.images.length)
    }
  }

  const handleViewDetails = () => {
    onClick?.(property)
  }

  // Ensure images array exists and has content
  const images = property.images || []
  const currentImage = images[currentImageIndex] || images[0] || ''

  return (
    <Card className={`overflow-hidden ${className}`}>
      <div className="relative">
        {/* Image carousel */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={currentImage}
            alt={property.title}
            className="size-full object-cover"
            onClick={nextImage}
          />
          {showActions && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onLike?.(property.id)
              }}
              className="absolute right-2 top-2 rounded-full bg-white/80 p-2 hover:bg-white"
            >
              <div className="flex items-center gap-1">
                <Heart
                  className={`size-5 ${property.is_liked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                />
                <span className="text-xs font-semibold text-gray-700">{property.like_count ?? 0}</span>
              </div>
            </button>
          )}
        </div>

        <CardBody className="p-4">
          {/* Title and Description */}
          <h3 className="mb-2 truncate text-left font-semibold text-gray-900">
            {translatedTitle}
          </h3>

          <p className="mb-3 line-clamp-1 text-left text-sm text-gray-600">
            {translatedDescription}
          </p>
          
          {/* Property Type */}
          <p className="mb-2 text-xs text-gray-500">
            {propertyTypeTranslation}
          </p>

          <div className="mb-3 flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Star className="size-4" />
              <span>{(property.rating || 0).toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="size-4" />
              <span>{property.location.city}</span>
            </div>
          </div>

          {/* Stats if enabled */}
          {showStats && (
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-500">{t('views')}</p>
                <p className="font-semibold">{property.view_count}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">{t('bookings')}</p>
                <p className="font-semibold">{property.booking_count}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">{t('revenue')}</p>
                <p className="font-semibold">{property.currency} {property.total_revenue}</p>
              </div>
            </div>
          )}

          {/* Price and Action Button */}
          <div className="mt-2 flex items-center justify-between">
            <div className="text-left">
              <p className="font-semibold text-gray-900">{property.currency} {property.price || property.price_per_night}</p>
              <p className="text-sm text-gray-500">{t('perNight')}</p>
            </div>
            {showActions && (
              <Button
                color="primary"
                onClick={handleViewDetails}
                className="bg-primary-600 text-sm text-white hover:bg-primary-700"
              >
                {t('actions.viewDetails')}
              </Button>
            )}
          </div>
        </CardBody>
      </div>
    </Card>
  )
}

export default PropertyCard