import React from 'react'
import { Card, CardBody } from '@heroui/react'

interface LoadingSkeletonProps {
  className?: string
}

export const PropertyCardSkeleton: React.FC = () => {
  return (
    <Card className="transition-shadow duration-200 hover:shadow-lg">
      <div className="relative">
        {/* Image skeleton */}
        <div className="h-48 w-full animate-pulse rounded-t-lg bg-gray-200"></div>
        
        {/* Status chip skeleton */}
        <div className="absolute left-3 top-3">
          <div className="h-6 w-16 animate-pulse rounded-full bg-gray-300"></div>
        </div>
        
        {/* Action button skeleton */}
        <div className="absolute right-3 top-3">
          <div className="h-8 w-16 animate-pulse rounded-lg bg-gray-300"></div>
        </div>
      </div>
      
      <CardBody className="p-4">
        <div className="space-y-3">
          {/* Title skeleton */}
          <div className="h-6 w-3/4 animate-pulse rounded bg-gray-200"></div>
          
          {/* Description skeleton */}
          <div className="space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
            <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200"></div>
          </div>
          
          {/* Rating skeleton */}
          <div className="flex items-center gap-2">
            <div className="size-4 animate-pulse rounded bg-gray-200"></div>
            <div className="h-4 w-8 animate-pulse rounded bg-gray-200"></div>
            <div className="h-4 w-16 animate-pulse rounded bg-gray-200"></div>
          </div>
          
          {/* Stats skeleton */}
          <div className="grid grid-cols-3 gap-2 text-center">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <div className="mx-auto mb-1 h-5 w-8 animate-pulse rounded bg-gray-200"></div>
                <div className="mx-auto h-3 w-12 animate-pulse rounded bg-gray-200"></div>
              </div>
            ))}
          </div>
          
          {/* Action buttons skeleton */}
          <div className="flex gap-2 pt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 flex-1 animate-pulse rounded-lg bg-gray-200"></div>
            ))}
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

export const PropertyListingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  className = "" 
}) => {
  return (
    <div className={`grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 ${className}`}>
      {Array.from({ length: 6 }, (_, i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </div>
  )
}

export const HeaderSkeleton: React.FC = () => {
  return (
    <div className="mb-8 animate-pulse rounded-lg bg-gradient-to-r from-gray-200 to-gray-300 p-8">
      <div className="text-left">
        <div className="mb-2 h-8 w-48 animate-pulse rounded bg-gray-300"></div>
        <div className="mb-4 h-5 w-64 animate-pulse rounded bg-gray-300"></div>
        <div className="h-10 w-32 animate-pulse rounded bg-gray-300"></div>
      </div>
    </div>
  )
}

export const TabsSkeleton: React.FC = () => {
  return (
    <div className="mb-6 w-full">
      <div className="flex gap-4 border-b border-gray-200">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-10 w-24 animate-pulse rounded-t-lg bg-gray-200"></div>
        ))}
      </div>
    </div>
  )
}

export const CityPropertySkeleton: React.FC = () => {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white">
      {/* Mobile-first responsive skeleton */}
      <div className="flex flex-col sm:flex-row sm:h-32">
        {/* Left side - Image skeleton - Full width on mobile, fixed width on desktop */}
        <div className="relative w-full shrink-0 sm:m-2 sm:w-40 sm:h-32">
          <div className="size-full animate-pulse rounded-lg bg-gray-200" />
        </div>

        {/* Right side - Details skeleton - Responsive padding */}
        <div className="flex min-w-0 flex-1 flex-col justify-between p-3 sm:p-4">
          {/* Top section */}
          <div className="space-y-2">
            {/* Title and location */}
            <div>
              <div className="mb-2 h-4 w-3/4 animate-pulse rounded bg-gray-200" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200" />
            </div>

            {/* Property specs */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
              <div className="h-3 w-14 animate-pulse rounded bg-gray-200" />
              <div className="h-3 w-14 animate-pulse rounded bg-gray-200" />
            </div>
          </div>

          {/* Bottom section - Price and button - Responsive layout */}
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="h-5 w-20 animate-pulse rounded bg-gray-200" />
            <div className="h-7 w-20 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      </div>
    </div>
  )
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ className = '' }) => {
  return (
    <div className={`animate-pulse overflow-hidden rounded-lg bg-white shadow ${className}`}>
      <div className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          {/* Property Image Skeleton */}
          <div className="h-32 w-full rounded-lg bg-gray-200 sm:w-48" />

          {/* Content Skeleton */}
          <div className="flex-1">
            {/* Guest Info */}
            <div className="mb-4 flex items-center gap-3">
              <div className="size-10 rounded-full bg-gray-200" />
              <div>
                <div className="mb-2 h-4 w-32 rounded bg-gray-200" />
                <div className="h-3 w-24 rounded bg-gray-200" />
              </div>
            </div>

            {/* Booking Details */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="h-4 w-32 rounded bg-gray-200" />
              <div className="h-4 w-24 rounded bg-gray-200" />
              <div className="h-4 w-28 rounded bg-gray-200" />
              <div className="h-4 w-20 rounded bg-gray-200" />
            </div>

            {/* Contact Info */}
            <div className="mt-4 flex gap-3">
              <div className="h-8 w-32 rounded bg-gray-200" />
              <div className="h-8 w-32 rounded bg-gray-200" />
            </div>

            {/* Status */}
            <div className="mt-4">
              <div className="h-6 w-20 rounded bg-gray-200" />
            </div>

            {/* Actions */}
            <div className="mt-4 flex gap-2">
              <div className="h-8 w-24 rounded bg-gray-200" />
              <div className="h-8 w-24 rounded bg-gray-200" />
              <div className="h-8 w-24 rounded bg-gray-200" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PropertyListingSkeleton 