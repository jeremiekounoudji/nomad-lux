import React from 'react'
import { Property } from '../../interfaces/Property'
import { Heart, MapPin, Users, Bed, Bath } from 'lucide-react'

interface HomePagePropertyCardProps {
  property: Property
  onLike?: (id: string) => void
  onClick?: (property: Property) => void
  className?: string
}

const HomePagePropertyCard: React.FC<HomePagePropertyCardProps> = ({
  property,
  onLike,
  onClick,
  className = ''
}) => {
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0)

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

  return (
    <div 
      className={`bg-white rounded-lg overflow-hidden cursor-pointer shadow-lg hover:shadow-xl transition-shadow duration-300 ${className}`}
      onClick={handleCardClick}
    >
      {/* Header with host info */}
      <div className="flex items-center justify-between p-3 border-b border-gray-100">
        <div className="flex items-center gap-3 text-left">
          <img
            src={property.host.avatar_url}
            alt={property.host.name}
            className="w-8 h-8 rounded-full object-cover"
          />
          <div className="text-left">
            <p className="font-semibold text-sm text-gray-900 text-left truncate">{property.host.name}</p>
            <div className="flex items-center gap-1 text-xs text-gray-500 text-left">
              <MapPin className="w-3 h-3" />
              <span>{property.location.city}, {property.location.country}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Image */}
      <div className="relative p-3">
        <img
          src={property.images[currentImageIndex]}
          alt={property.title}
          className="w-full h-80 object-cover rounded-lg"
          onClick={nextImage}
        />
        
        {/* Image indicators */}
        {property.images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1">
            {property.images.map((_, index) => (
              <div
                key={index}
                className={`w-1.5 h-1.5 rounded-full ${
                  index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}

        {/* Like button */}
        <button
          onClick={handleLike}
          className="absolute top-3 right-3 p-2 rounded-full bg-black/20 hover:bg-black/30 transition-colors"
        >
          <Heart
            className={`w-6 h-6 ${
              property.is_liked ? 'fill-red-500 text-red-500' : 'text-white'
            }`}
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Actions row */}
        <div className="flex items-center gap-4 mb-3">
          <button
            onClick={handleLike}
            className="p-0 bg-transparent border-none"
          >
            <Heart
              className={`w-6 h-6 ${
                property.is_liked ? 'fill-red-500 text-red-500' : 'text-gray-700'
              } hover:text-gray-500 transition-colors`}
            />
          </button>
        </div>

        {/* Property details */}
        <div className="space-y-2 text-left">
          <h3 className="font-semibold text-gray-900 text-lg leading-tight text-left truncate">
            {property.title}
          </h3>

          {/* Property specs */}
          <div className="flex items-center gap-4 text-sm text-gray-600 text-left">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{property.max_guests} guests</span>
            </div>
            <div className="flex items-center gap-1">
              <Bed className="w-4 h-4" />
              <span>{property.bedrooms} beds</span>
            </div>
            <div className="flex items-center gap-1">
              <Bath className="w-4 h-4" />
              <span>{property.bathrooms} baths</span>
            </div>
          </div>

          {/* Price and Book Now Button */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-left">
              <p className="text-gray-900">
                <span className="font-semibold text-lg">${property.price}</span>
                <span className="text-gray-600 text-sm ml-1">per night</span>
              </p>
            </div>
            <button
              onClick={handleCardClick}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePagePropertyCard 