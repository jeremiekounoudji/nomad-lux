import React from 'react'
import { MapPin } from 'lucide-react'
import { useHomeFeed } from '../../hooks/useHomeFeed'

interface PopularPlace {
  id: string
  name: string
  country: string
  property_count: number
  average_price: number
  featured_image: string
  coordinates: {
    lat: number
    lng: number
  }
}

interface PopularPlacesProps {
  onPlaceClick?: (place: PopularPlace) => void
  onExploreClick?: () => void
}

const PopularPlaces: React.FC<PopularPlacesProps> = ({ 
  onPlaceClick,
  onExploreClick 
}) => {
  const { popularPlaces, popularPlacesLoading, popularPlacesError } = useHomeFeed()

  // Transform RPC data to match component expectations
  const transformedPlaces = popularPlaces.map(place => ({
    id: place.id,
    name: place.name,
    country: place.country,
    image: place.featured_image,
    propertyCount: `${place.property_count} properties`,
    averagePrice: place.average_price
  }))

  if (popularPlacesLoading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-4 px-4">
          <h2 className="text-lg font-semibold text-gray-900">Popular Places</h2>
        </div>
        <div className="flex gap-3 px-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex-shrink-0">
              <div className="w-24 h-24 md:w-28 md:h-28 bg-gray-200 rounded-xl animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (popularPlacesError) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-4 px-4">
          <h2 className="text-lg font-semibold text-gray-900">Popular Places</h2>
        </div>
        <div className="text-center py-8 text-gray-500">
          <p>Failed to load popular destinations</p>
        </div>
      </div>
    )
  }
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4 px-4">
        <h2 className="text-lg font-semibold text-gray-900">Popular Places</h2>
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          See all
        </button>
      </div>
      
      <div className="flex gap-3 overflow-x-auto scrollbar-hide px-4 pb-2">
        {transformedPlaces.map((place, index) => (
          <div
            key={place.id}
            className="flex-shrink-0 cursor-pointer group"
            onClick={() => onPlaceClick?.(popularPlaces[index])}
          >
            <div className="w-24 h-24 md:w-28 md:h-28 overflow-hidden rounded-xl group-hover:scale-105 transition-transform duration-200 cursor-pointer relative bg-white shadow-sm border-2 border-gray-100 group-hover:border-primary-300">
              <img
                src={place.image}
                alt={place.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-1 left-1 right-1">
                <p className="text-white text-xs font-medium truncate">
                  {place.name}
                </p>
                <p className="text-white/80 text-xs">
                  {place.propertyCount}
                </p>
              </div>
            </div>
          </div>
        ))}
        
        {/* Explore button that links to search page */}
        <div 
          className="flex-shrink-0 cursor-pointer group"
          onClick={onExploreClick}
        >
          <div className="w-24 h-24 md:w-28 md:h-28 border-2 border-dashed border-gray-300 group-hover:border-primary-400 transition-colors duration-200 rounded-xl flex items-center justify-center bg-gray-50 group-hover:bg-primary-50">
            <div className="text-center">
              <div className="w-8 h-8 rounded-full bg-gray-200 group-hover:bg-primary-100 flex items-center justify-center mx-auto mb-1">
                <MapPin className="w-4 h-4 text-gray-500 group-hover:text-primary-500" />
              </div>
              <p className="text-xs text-gray-600 group-hover:text-primary-600 font-medium">
                Explore
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PopularPlaces 