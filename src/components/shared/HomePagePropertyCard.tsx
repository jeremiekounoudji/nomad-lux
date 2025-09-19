import React from 'react'
import { Property } from '../../interfaces/Property'
import { Heart, MapPin, Users, Bed, Bath, Share2 } from 'lucide-react'
import { useTranslation } from '../../lib/stores/translationStore'

interface HomePagePropertyCardProps {
  property: Property
  onLike?: (id: string) => void
  onShare?: (property: Property) => void
  onClick?: (property: Property) => void
  className?: string
}

const HomePagePropertyCard: React.FC<HomePagePropertyCardProps> = ({
  property,
  onLike,
  onShare,
  onClick,
  className = ''
}) => {
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0)
  const { t } = useTranslation(['property', 'labels', 'actions'])

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (property.images && property.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % property.images.length)
    }
  }

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
  const currentImage = images[currentImageIndex] || images[0] || ''

  return (
    <div 
      className={`w-full cursor-pointer overflow-hidden rounded-lg bg-white shadow-lg transition-shadow duration-300 hover:shadow-xl ${className}`}
      onClick={handleCardClick}
    >
      {/* Header with host info */}
      <div className="flex items-center justify-between border-b border-gray-100 p-3">
        <div className="flex items-center gap-3 text-left">
          <img
            src={property.host?.avatar_url || ''}
            alt={property.host?.name || 'Host'}
            className="size-8 rounded-full object-cover"
          />
          <div className="text-left">
            <p className="truncate text-left text-sm font-semibold text-gray-900">{property.host?.name || 'Host'}</p>
            <div className="flex items-center gap-1 text-left text-xs text-gray-500">
              <MapPin className="size-3" />
              <span>{property.location?.city || ''}, {property.location?.country || ''}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Image */}
      <div className="relative p-1">
        <img
          src={currentImage}
          alt={property.title}
          className="h-[400px] md:h-[200px] w-full rounded-lg object-cover"
          onClick={nextImage}
        />
        
        {/* Image indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1 mb-2">
            {images.map((_, index) => (
              <div
                key={index}
                className={`size-1.5 rounded-full ${
                  index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}


      </div>

      {/* Content */}
      <div className="p-4">
        {/* Actions row */}
        <div className="mb-3 flex items-center gap-4">
          <button
            onClick={handleLike}
            className="border-none bg-transparent p-0"
          >
            <div className="flex items-center gap-1">
              <Heart
                className={`size-4 ${
                  property.is_liked ? 'fill-red-500 text-red-500' : 'text-gray-700'
                } transition-colors hover:text-gray-500`}
              />
              <span className="text-xs font-semibold text-gray-700">{property.like_count ?? 0}</span>
            </div>
          </button>
          <button
            onClick={handleShare}
            className="border-none bg-transparent p-0"
          >
            <Share2 className="size-4 text-gray-700 transition-colors hover:text-gray-500" />
          </button>
        </div>

        {/* Property details */}
        <div className="space-y-2 text-left">
          <h3 className="truncate text-left text-md font-semibold leading-tight text-gray-900">
            {property.title}
          </h3>

          {/* Property specs */}
          <div className="flex items-center gap-4 text-left text-sm text-gray-600">
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

          {/* Price and Book Now Button */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-left">
              <p className="text-gray-900">
                <span className="text-lg font-semibold">{property.currency} {property.price}</span>
                <span className="ml-1 text-sm text-gray-600">{t('labels.perNight')}</span>
              </p>
            </div>
            <button
              onClick={handleCardClick}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
            >
              {t('actions.book')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePagePropertyCard 