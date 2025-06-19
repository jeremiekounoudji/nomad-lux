import React, { useState } from 'react'
import { Heart, Star, MapPin, Users, Bed, Bath, MoreHorizontal, Share, Bookmark } from 'lucide-react'
import { PropertyCardProps, Property } from '../../interfaces'

const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  variant = 'feed',
  onLike,
  onShare,
  onBook,
  onClick
}) => {
  const [isLiked, setIsLiked] = useState(property.isLiked)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const handleLike = () => {
    setIsLiked(!isLiked)
    onLike?.(property.id)
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === property.images.length - 1 ? 0 : prev + 1
    )
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? property.images.length - 1 : prev - 1
    )
  }

  if (variant === 'feed') {
    return (
      <div 
        className="w-full bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer"
        onClick={() => onClick?.(property)}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 pb-3">
          <div className="flex items-center gap-3">
            <img
              src={property.host.avatar_url}
              alt={property.host.display_name}
              className="w-8 h-8 rounded-full ring-2 ring-gray-100"
            />
            <div>
              <div className="flex items-center gap-1">
                <p className="font-semibold text-sm">{property.host.username}</p>
                {property.host.is_email_verified && (
                  <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{property.location.city}, {property.location.country}</span>
              </div>
            </div>
          </div>
          <button 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Image Carousel */}
        <div className="relative">
          <div 
            className="relative h-64 lg:h-72 overflow-hidden cursor-pointer"
            onClick={nextImage}
          >
            <img
              src={property.images[currentImageIndex]}
              alt={property.title}
              className="w-full h-full object-cover"
            />
            
            {/* Image indicators */}
            {property.images.length > 1 && (
              <div className="absolute top-3 right-3 bg-black/50 rounded-full px-2 py-1">
                <span className="text-white text-xs">
                  {currentImageIndex + 1}/{property.images.length}
                </span>
              </div>
            )}

            {/* Property type badge */}
            <div className="absolute top-3 left-3">
              <span className="bg-white/90 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
                {property.propertyType}
              </span>
            </div>
          </div>

          {/* Navigation dots */}
          {property.images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1">
              {property.images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation()
                    setCurrentImageIndex(index)
                  }}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-4 pb-3">
          <div className="flex items-center gap-4">
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleLike()
              }}
              className="p-2 text-gray-700 hover:text-red-500 transition-colors"
            >
              <Heart 
                className={`w-6 h-6 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} 
              />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onShare?.(property)
              }}
              className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Share className="w-5 h-5" />
            </button>
          </div>
          <button 
            className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <Bookmark className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="pt-0 px-4 pb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{property.rating}</span>
              <span className="text-sm text-gray-500">({property.reviewCount})</span>
            </div>
            <span className="text-gray-300">•</span>
            <span className="text-sm text-gray-500">{property.distance}</span>
          </div>

          <h3 className="font-semibold text-gray-900 mb-2 truncate text-left">
            {property.title}
          </h3>

          <p className="text-gray-600 text-sm mb-3 line-clamp-2 text-left">
            {property.description}
          </p>

          <div className="flex items-center gap-4 mb-3 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{property.maxGuests} guests</span>
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

          <div className="flex items-center justify-between">
            <div>
              <span className="text-xl font-bold text-gray-900">
                ${property.price}
              </span>
              <span className="text-gray-500 text-sm ml-1">per night</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onBook?.(property)
              }}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors duration-200 shadow-sm"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Grid and List variants can be added here later
  return null
}

export default PropertyCard 