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
      <div className="flex h-32">
        {/* Left side - Image */}
        <div className="relative m-2 w-40 shrink-0">
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

        {/* Right side - Details */}
        <div className="flex flex-1 flex-col justify-between p-4">
          {/* Top section */}
          <div className="space-y-2">
            {/* Title and location */}
            <div className="text-left">
              <h3 className="line-clamp-1 text-base font-semibold text-gray-900">
                {property.title}
              </h3>
              <div className="flex items-center gap-1 text-gray-600">
                <MapPin className="size-3" />
                <span className="text-xs">{property.location.city}, {property.location.country}</span>
              </div>
            </div>

            {/* Property specs */}
            <div className="flex items-center gap-3 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <Users className="size-3" />
                <span>{property.max_guests} {t('labels.guests')}</span>
              </div>
              <div className="flex items-center gap-1">
                <Bed className="size-3" />
                <span>{property.bedrooms} {t('labels.beds')}</span>
              </div>
              <div className="flex items-center gap-1">
                <Bath className="size-3" />
                <span>{property.bathrooms} {t('labels.baths')}</span>
              </div>
            </div>
          </div>

          {/* Bottom section - Price and actions */}
          <div className="mt-2 flex items-center justify-between">
            <div className="text-left">
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-gray-900">
                  {property.currency} {property.price}
                </span>
                <span className="text-xs text-gray-600">{t('perNight')}</span>
              </div>
            </div>

            <Button
              size="sm"
              color="primary"
              variant="solid"
              onPress={handleCardClick}
              className="bg-main px-3 py-1 text-xs hover:bg-primary-600"
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