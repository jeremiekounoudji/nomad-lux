import React from 'react'
import { Property } from '../../interfaces/Property'
import { MapPin, Users, Bed, Bath, Heart, Share2 } from 'lucide-react'
import { Button } from '@heroui/react'
import { useTranslation } from '../../lib/stores/translationStore'

interface CityPropertyCardProps {
  property: Property
  onLike?: (id: string) => void
  onShare?: (property: Property) => void
  onClick?: (property: Property) => void
  className?: string
}

const CityPropertyCard: React.FC<CityPropertyCardProps> = ({
  property,
  onLike,
  onShare,
  onClick,
  className = ''
}) => {
  const { t } = useTranslation('property')
  const handleCardClick = () => {
    onClick?.(property)
  }

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    onLike?.(property.id)
  }

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation()
    onShare?.(property)
  }

  // Ensure images array exists and has content
  const images = property.images || []
  const firstImage = images[0] || ''

  return (
    <div 
      className={`cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-300 hover:border-gray-300 hover:shadow-lg ${className}`}
      onClick={handleCardClick}
    >
      {/* Mobile-first responsive layout */}
      <div className="flex flex-col sm:flex-row sm:h-32">
        {/* Left side - Image - Full width on mobile, fixed width on desktop */}
        <div className="relative w-full shrink-0 sm:m-2 sm:w-40 sm:h-28">
          <img
            src={firstImage}
            alt={property.title}
            className="border-primary/20 size-full rounded-lg border-2 object-cover"
          />
          
          {/* Action buttons */}
          <div className="absolute right-2 top-2 flex gap-1">
            <button
              onClick={handleShare}
              className="rounded-full bg-black/20 p-1.5 transition-colors hover:bg-black/30"
            >
              <Share2 className="size-4 text-white" />
            </button>
            <button
              onClick={handleLike}
              className="rounded-full bg-black/20 p-1.5 transition-colors hover:bg-black/30"
            >
              <Heart
                className={`size-4 ${
                  property.is_liked ? 'fill-red-500 text-red-500' : 'text-white'
                }`}
              />
            </button>
          </div>

          {/* Property type badge */}
          <div className="absolute bottom-2 left-2">
            <span className="rounded-full bg-black/60 px-2 py-0.5 text-xs text-white backdrop-blur-sm">
              {property.property_type}
            </span>
          </div>
        </div>

        {/* Right side - Details - Responsive padding and text */}
        <div className="flex flex-1 flex-col justify-between p-3 sm:p-4">
          {/* Top section */}
          <div className="space-y-2">
            {/* Title and location */}
            <div className="text-left">
              <h3 className="line-clamp-2 sm:line-clamp-1 text-base sm:text-lg font-semibold text-gray-900">
                {property.title}
              </h3>
              <div className="flex items-center gap-1 text-gray-600">
                <MapPin className="size-4" />
                <span className="text-sm">{property.location.city}, {property.location.country}</span>
              </div>
            </div>

            {/* Property specs - Responsive layout */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Users className="size-4" />
                <span>{property.max_guests} {t('labels.guests')}</span>
              </div>
              <div className="flex items-center gap-1">
                <Bed className="size-4" />
                <span>{property.bedrooms} {t('labels.beds')}</span>
              </div>
              <div className="flex items-center gap-1">
                <Bath className="size-4" />
                <span>{property.bathrooms} {t('labels.baths')}</span>
              </div>
            </div>
          </div>

          {/* Bottom section - Price and actions - Responsive layout */}
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-left">
              <div className="flex items-baseline gap-1">
                <span className="text-lg sm:text-xl font-bold text-gray-900">
                  {property.currency} {property.price}
                </span>
                <span className="text-sm text-gray-600">{t('labels.perNight')}</span>
              </div>
            </div>

            <Button
              size="sm"
              color="primary"
              variant="solid"
              onPress={handleCardClick}
              className="w-full sm:w-auto bg-main px-3 py-2 text-sm hover:bg-primary-600"
            >
              {t('actions.viewDetails')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CityPropertyCard 