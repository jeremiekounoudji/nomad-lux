import React from 'react'
import { Card, CardBody } from '@heroui/react'

export interface LoadingSkeletonProps {
  count?: number
  className?: string
}

export const PropertyCardSkeleton: React.FC = () => {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <div className="relative">
        {/* Image skeleton */}
        <div className="w-full h-48 bg-gray-200 animate-pulse rounded-t-lg"></div>
        
        {/* Status chip skeleton */}
        <div className="absolute top-3 left-3">
          <div className="w-16 h-6 bg-gray-300 animate-pulse rounded-full"></div>
        </div>
        
        {/* Action button skeleton */}
        <div className="absolute top-3 right-3">
          <div className="w-16 h-8 bg-gray-300 animate-pulse rounded-lg"></div>
        </div>
      </div>
      
      <CardBody className="p-4">
        <div className="space-y-3">
          {/* Title skeleton */}
          <div className="w-3/4 h-6 bg-gray-200 animate-pulse rounded"></div>
          
          {/* Description skeleton */}
          <div className="space-y-2">
            <div className="w-full h-4 bg-gray-200 animate-pulse rounded"></div>
            <div className="w-2/3 h-4 bg-gray-200 animate-pulse rounded"></div>
          </div>
          
          {/* Rating skeleton */}
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-200 animate-pulse rounded"></div>
            <div className="w-8 h-4 bg-gray-200 animate-pulse rounded"></div>
            <div className="w-16 h-4 bg-gray-200 animate-pulse rounded"></div>
          </div>
          
          {/* Stats skeleton */}
          <div className="grid grid-cols-3 gap-2 text-center">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <div className="w-8 h-5 bg-gray-200 animate-pulse rounded mx-auto mb-1"></div>
                <div className="w-12 h-3 bg-gray-200 animate-pulse rounded mx-auto"></div>
              </div>
            ))}
          </div>
          
          {/* Action buttons skeleton */}
          <div className="flex gap-2 pt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-1 h-8 bg-gray-200 animate-pulse rounded-lg"></div>
            ))}
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

export const PropertyListingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  count = 6, 
  className = "" 
}) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {Array.from({ length: count }, (_, i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </div>
  )
}

export const HeaderSkeleton: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse p-8 rounded-lg mb-8">
      <div className="text-left">
        <div className="w-48 h-8 bg-gray-300 animate-pulse rounded mb-2"></div>
        <div className="w-64 h-5 bg-gray-300 animate-pulse rounded mb-4"></div>
        <div className="w-32 h-10 bg-gray-300 animate-pulse rounded"></div>
      </div>
    </div>
  )
}

export const TabsSkeleton: React.FC = () => {
  return (
    <div className="w-full mb-6">
      <div className="flex gap-4 border-b border-gray-200">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="w-24 h-10 bg-gray-200 animate-pulse rounded-t-lg"></div>
        ))}
      </div>
    </div>
  )
}

export const CityPropertySkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden w-full">
      <div className="flex h-32">
        {/* Left side - Image skeleton */}
        <div className="relative w-40 flex-shrink-0 m-2">
          <div className="w-full h-full bg-gray-200 animate-pulse rounded-lg" />
        </div>

        {/* Right side - Details skeleton */}
        <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
          {/* Top section */}
          <div className="space-y-2">
            {/* Title and location */}
            <div>
              <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded mb-2" />
              <div className="h-3 w-1/2 bg-gray-200 animate-pulse rounded" />
            </div>

            {/* Property specs */}
            <div className="flex items-center gap-3">
              <div className="h-3 w-16 bg-gray-200 animate-pulse rounded" />
              <div className="h-3 w-14 bg-gray-200 animate-pulse rounded" />
              <div className="h-3 w-14 bg-gray-200 animate-pulse rounded" />
            </div>
          </div>

          {/* Bottom section - Price and button */}
          <div className="flex items-center justify-between mt-2">
            <div className="h-5 w-20 bg-gray-200 animate-pulse rounded" />
            <div className="h-7 w-20 bg-gray-200 animate-pulse rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default PropertyListingSkeleton 