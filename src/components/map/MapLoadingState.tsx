import React from 'react'

export interface MapLoadingStateProps {
  className?: string
  height?: string
  message?: string
}

const MapLoadingState: React.FC<MapLoadingStateProps> = ({
  className = '',
  height = '300px',
  message = 'Loading map...'
}) => {
  return (
    <div 
      className={`bg-gray-100 border border-gray-300 rounded-xl flex items-center justify-center map-loading relative overflow-hidden ${className}`}
      style={{ height }}
    >
      {/* Grid pattern background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="grid grid-cols-8 grid-rows-6 h-full w-full">
          {Array.from({ length: 48 }).map((_, i) => (
            <div key={i} className="border border-gray-400"></div>
          ))}
        </div>
      </div>
      
      <div className="text-center relative z-10">
        {/* Animated map icon */}
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-200 to-transparent -translate-x-full animate-pulse"></div>
          <div className="text-2xl relative z-10">🗺️</div>
        </div>
        
        {/* Loading skeleton */}
        <div className="space-y-2 mb-3">
          <div className="h-4 bg-gray-300 rounded w-32 mx-auto animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded w-24 mx-auto animate-pulse delay-75"></div>
          <div className="h-3 bg-gray-200 rounded w-20 mx-auto animate-pulse delay-150"></div>
        </div>
        
        {/* Loading message */}
        <p className="text-sm text-gray-600 font-medium">{message}</p>
        
        {/* Loading dots animation */}
        <div className="flex justify-center items-center mt-2 space-x-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200"></div>
        </div>
      </div>
    </div>
  )
}

export default MapLoadingState 