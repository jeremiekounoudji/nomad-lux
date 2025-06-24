import React from 'react'
import { PropertyCardProps } from '../../interfaces/PropertyCardProps'
import { Card, CardBody, Button } from '@heroui/react'
import { Heart, Star, MapPin } from 'lucide-react'

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

  const nextImage = () => {
    if (property.images && property.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % property.images.length)
    }
  }

  return (
    <Card className={`overflow-hidden ${className}`}>
      <div className="relative">
        {/* Image carousel */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={property.images[currentImageIndex]}
            alt={property.title}
            className="w-full h-full object-cover"
            onClick={nextImage}
          />
          {showActions && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onLike?.(property.id)
              }}
              className="absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white"
            >
              <Heart
                className={`w-5 h-5 ${property.is_liked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
              />
            </button>
          )}
        </div>

        <CardBody className="p-4">
          {/* Title and Description */}
          <h3 className="font-semibold text-gray-900 mb-2 truncate text-left">
            {property.title}
          </h3>

          <p className="text-gray-600 text-sm mb-3 line-clamp-1 text-left">
            {property.description}
          </p>

          <div className="flex items-center gap-4 mb-3 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4" />
              <span>{(property.rating || 0).toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{property.location.city}</span>
            </div>
          </div>

          {/* Stats if enabled */}
          {showStats && (
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center">
                <p className="text-sm text-gray-500">Views</p>
                <p className="font-semibold">{property.view_count}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Bookings</p>
                <p className="font-semibold">{property.booking_count}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Revenue</p>
                <p className="font-semibold">${property.total_revenue}</p>
              </div>
            </div>
          )}

          {/* Price and Action Button */}
          <div className="flex items-center justify-between mt-2">
            <div className="text-left">
              <p className="font-semibold text-gray-900">${property.price}</p>
              <p className="text-sm text-gray-500">per night</p>
            </div>
            {showActions && (
              <Button
                variant="light"
                onClick={() => onView?.(property.id)}
                className="text-sm"
              >
                View Details
              </Button>
            )}
          </div>
        </CardBody>
      </div>
    </Card>
  )
}

export default PropertyCard 