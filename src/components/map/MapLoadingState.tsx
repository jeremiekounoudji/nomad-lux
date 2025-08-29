import React from 'react'
import { useTranslation } from '../../lib/stores/translationStore'

export interface MapLoadingStateProps {
  className?: string
  height?: string
  message?: string
}

const MapLoadingState: React.FC<MapLoadingStateProps> = ({
  className = '',
  height = '300px',
  message
}) => {
  const { t } = useTranslation('common');
  const defaultMessage = t('map.loading');
  return (
    <div 
      className={`map-loading relative flex items-center justify-center overflow-hidden rounded-xl border border-gray-300 bg-gray-100 ${className}`}
      style={{ height }}
    >
      {/* Grid pattern background */}
      <div className="pointer-events-none absolute inset-0 opacity-10">
        <div className="grid size-full grid-cols-8 grid-rows-6">
          {Array.from({ length: 48 }).map((_, i) => (
            <div key={i} className="border border-gray-400"></div>
          ))}
        </div>
      </div>
      
      <div className="relative z-10 text-center">
        {/* Animated map icon */}
        <div className="relative mx-auto mb-4 flex size-16 items-center justify-center overflow-hidden rounded-full bg-blue-100">
          <div className="absolute inset-0 -translate-x-full animate-pulse bg-gradient-to-r from-transparent via-blue-200 to-transparent"></div>
          <div className="relative z-10 text-2xl">🗺️</div>
        </div>
        
        {/* Loading skeleton */}
        <div className="mb-3 space-y-2">
          <div className="mx-auto h-4 w-32 animate-pulse rounded bg-gray-300"></div>
          <div className="mx-auto h-3 w-24 animate-pulse rounded bg-gray-200 delay-75"></div>
          <div className="mx-auto h-3 w-20 animate-pulse rounded bg-gray-200 delay-150"></div>
        </div>
        
        {/* Loading message */}
        <p className="text-sm font-medium text-gray-600">{message || defaultMessage}</p>
        
        {/* Loading dots animation */}
        <div className="mt-2 flex items-center justify-center space-x-1">
          <div className="size-2 animate-bounce rounded-full bg-blue-500"></div>
          <div className="size-2 animate-bounce rounded-full bg-blue-500 delay-100"></div>
          <div className="size-2 animate-bounce rounded-full bg-blue-500 delay-200"></div>
        </div>
      </div>
    </div>
  )
}

export default MapLoadingState 