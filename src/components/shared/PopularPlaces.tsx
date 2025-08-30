import React from 'react'
import { MapPin } from 'lucide-react'
import { useHomeFeed } from '../../hooks/useHomeFeed'
import { useTranslation } from '../../lib/stores/translationStore'

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
  const { t } = useTranslation(['property', 'common', 'home', 'labels'])

  // Transform RPC data to match component expectations
  const transformedPlaces = popularPlaces.map(place => ({
    id: place.id,
    name: place.name,
    country: place.country,
    image: place.featured_image,
    propertyCount: t('labels.propertiesCount', { count: place.property_count }),
    averagePrice: place.average_price
  }))

  if (popularPlacesLoading) {
    return (
      <div className="w-full">
        <div className="mb-4 flex items-center justify-between px-4">
          <h2 className="text-lg font-semibold text-gray-900">{t('home.popularPlaces')}</h2>
        </div>
        <div className="flex gap-3 px-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="shrink-0">
              <div className="size-24 animate-pulse rounded-xl bg-gray-200 md:size-28" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (popularPlacesError) {
    return (
      <div className="w-full">
        <div className="mb-4 flex items-center justify-between px-4">
          <h2 className="text-lg font-semibold text-gray-900">{t('home.popularPlaces')}</h2>
        </div>
        <div className="py-8 text-center text-gray-500">
          <p>{t('messages.failedToLoadPopular')}</p>
        </div>
      </div>
    )
  }
  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between px-4">
        <h2 className="text-lg font-semibold text-gray-900">{t('home.popularPlaces')}</h2>
        <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
          {t('common.buttons.view')}
        </button>
      </div>
      
      <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
        {transformedPlaces.map((place, index) => (
          <div
            key={place.id}
            className="group shrink-0 cursor-pointer"
            onClick={() => onPlaceClick?.(popularPlaces[index])}
          >
            <div className="relative size-24 cursor-pointer overflow-hidden rounded-xl border-2 border-gray-100 bg-white shadow-sm transition-transform duration-200 group-hover:scale-105 group-hover:border-primary-300 md:size-28">
              <img
                src={place.image}
                alt={place.name}
                className="size-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute inset-x-1 bottom-1">
                <p className="truncate text-xs font-medium text-white">
                  {place.name}
                </p>
                <p className="text-xs text-white/80">
                  {place.propertyCount}
                </p>
              </div>
            </div>
          </div>
        ))}
        
        {/* Explore button that links to search page */}
        <div 
          className="group shrink-0 cursor-pointer"
          onClick={onExploreClick}
        >
          <div className="flex size-24 items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 transition-colors duration-200 group-hover:border-primary-400 group-hover:bg-primary-50 md:size-28">
            <div className="text-center">
              <div className="mx-auto mb-1 flex size-8 items-center justify-center rounded-full bg-gray-200 group-hover:bg-primary-100">
                <MapPin className="size-4 text-gray-500 group-hover:text-primary-500" />
              </div>
              <p className="text-xs font-medium text-gray-600 group-hover:text-primary-600">{t('common.buttons.explore')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PopularPlaces 