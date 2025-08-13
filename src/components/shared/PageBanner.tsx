import React, { useState } from 'react'
import { useTranslation } from '../../lib/stores/translationStore'

interface PageBannerProps {
  backgroundImage: string
  title: string
  subtitle?: string
  children?: React.ReactNode
  overlayOpacity?: 'light' | 'medium' | 'dark'
  height?: 'small' | 'medium' | 'large'
  className?: string
  imageAlt?: string
}

const PageBanner: React.FC<PageBannerProps> = ({
  backgroundImage,
  title,
  subtitle,
  children,
  overlayOpacity = 'medium',
  height = 'medium',
  className = '',
  imageAlt
}) => {
  const { t } = useTranslation('common')
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  // Overlay opacity classes
  const overlayClasses = {
    light: 'bg-black/50',
    medium: 'bg-black/60',
    dark: 'bg-black/70'
  }

  // Height classes
  const heightClasses = {
    small: 'min-h-[160px] sm:min-h-[180px] lg:min-h-[200px]',
    medium: 'min-h-[200px] sm:min-h-[240px] lg:min-h-[280px]',
    large: 'min-h-[240px] sm:min-h-[300px] lg:min-h-[360px]'
  }

  const handleImageLoad = () => {
    setImageLoaded(true)
  }

  const handleImageError = () => {
    setImageError(true)
    setImageLoaded(true)
  }

  return (
    <div 
      className={`relative overflow-hidden rounded-none sm:rounded-xl ${heightClasses[height]} ${className}`}
      role="banner"
      aria-label={t('common.pageBanner.bannerLabel', { title })}
    >
      {/* Background Image */}
      {!imageError && (
        <img
          src={backgroundImage}
          alt={imageAlt || t('common.pageBanner.alt')}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading="eager"
        />
      )}

      {/* Fallback Background (when image fails to load) */}
      {imageError && (
        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-gray-600 to-gray-700" />
      )}

      {/* Loading Skeleton */}
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 w-full h-full bg-gray-300 animate-pulse" />
      )}

      {/* Black Transparent Overlay */}
      <div className={`absolute inset-0 ${overlayClasses[overlayOpacity]}`} />

      {/* Content Layer */}
      <div className="relative z-10 h-full flex flex-col justify-center p-4 sm:p-6 lg:p-8 text-white">
        <div className="max-w-4xl">
          {/* Title */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 leading-tight">
            {title}
          </h1>

          {/* Subtitle */}
          {subtitle && (
            <p className="text-white/90 text-sm sm:text-base lg:text-lg leading-relaxed mb-4 max-w-2xl">
              {subtitle}
            </p>
          )}

          {/* Additional Content */}
          {children && (
            <div className="mt-4 sm:mt-6">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PageBanner