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

  return (
    <div 
      className={`bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden ${className}`}
      onClick={handleCardClick}
    >
      <div className="flex h-32">
        {/* Left side - Image */}
        <div className="relative w-40 flex-shrink-0 m-2">
          <img
            src={property.images[0]}
            alt={property.title}
            className="w-full h-full object-cover rounded-lg border-2 border-primary/20"
          />
          
          {/* Action buttons */}
          <div className="absolute top-2 right-2 flex gap-1">
            <button
              onClick={handleShare}
              className="p-1.5 rounded-full bg-black/20 hover:bg-black/30 transition-colors"
            >
              <Share2 className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={handleLike}
              className="p-1.5 rounded-full bg-black/20 hover:bg-black/30 transition-colors"
            >
              <Heart
                className={`w-4 h-4 ${
                  property.is_liked ? 'fill-red-500 text-red-500' : 'text-white'
                }`}
              />
            </button>
          </div>

          {/* Property type badge */}
          <div className="absolute bottom-2 left-2">
            <span className="bg-black/60 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">
              {property.property_type}
            </span>
          </div>
        </div>

        {/* Right side - Details */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          {/* Top section */}
          <div className="space-y-2">
            {/* Title and location */}
            <div className="text-left">
              <h3 className="font-semibold text-base text-gray-900 line-clamp-1">
                {property.title}
              </h3>
              <div className="flex items-center gap-1 text-gray-600">
                <MapPin className="w-3 h-3" />
                <span className="text-xs">{property.location.city}, {property.location.country}</span>
              </div>
            </div>

            {/* Property specs */}
            <div className="flex items-center gap-3 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{property.max_guests} {t('labels.guests')}</span>
              </div>
              <div className="flex items-center gap-1">
                <Bed className="w-3 h-3" />
                <span>{property.bedrooms} {t('labels.beds')}</span>
              </div>
              <div className="flex items-center gap-1">
                <Bath className="w-3 h-3" />
                <span>{property.bathrooms} {t('labels.baths')}</span>
              </div>
            </div>
          </div>

          {/* Bottom section - Price and actions */}
          <div className="flex items-center justify-between mt-2">
            <div className="text-left">
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-gray-900">
                  ${property.price}
                </span>
                <span className="text-xs text-gray-600">{t('perNight')}</span>
              </div>
            </div>

            <Button
              size="sm"
              color="primary"
              variant="solid"
              onPress={handleCardClick}
              className="text-xs px-3 py-1 bg-main hover:bg-primary-600"
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