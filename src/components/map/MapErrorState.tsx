import React from 'react'
import { AlertTriangle, RefreshCw, Wifi, Globe, MapPin } from 'lucide-react'
import { Button } from '@heroui/react'
import { useTranslation } from '../../lib/stores/translationStore'

export interface MapErrorStateProps {
  className?: string
  height?: string
  error: string | Error | null
  onRetry?: () => void
  showRetryButton?: boolean
  errorType?: 'network' | 'tiles' | 'initialization' | 'location' | 'unknown'
}

interface ErrorTypeConfig {
  icon: React.ReactNode
  title: string
  description: string
  suggestions: string[]
  color: string
}

const MapErrorState: React.FC<MapErrorStateProps> = ({
  className = '',
  height = '300px',
  error,
  onRetry,
  showRetryButton = true,
  errorType = 'unknown'
}) => {
  const { t } = useTranslation('common');
  // Determine error type based on error message if not provided
  const detectErrorType = (errorMessage: string): 'network' | 'tiles' | 'initialization' | 'location' | 'unknown' => {
    const lowerMessage = errorMessage.toLowerCase()
    
    if (lowerMessage.includes('network') || lowerMessage.includes('connection') || lowerMessage.includes('offline')) {
      return 'network'
    }
    if (lowerMessage.includes('tile') || lowerMessage.includes('404') || lowerMessage.includes('load')) {
      return 'tiles'
    }
    if (lowerMessage.includes('init') || lowerMessage.includes('leaflet') || lowerMessage.includes('container')) {
      return 'initialization'
    }
    if (lowerMessage.includes('location') || lowerMessage.includes('coordinates') || lowerMessage.includes('geolocation')) {
      return 'location'
    }
    return 'unknown'
  }

  const actualErrorType = errorType === 'unknown' && error 
    ? detectErrorType(error.toString()) 
    : errorType

  const errorConfigs: Record<string, ErrorTypeConfig> = {
    network: {
      icon: <Wifi className="w-8 h-8" />,
      title: t('map.error.network.title'),
      description: t('map.error.network.description'),
      suggestions: [
        t('map.error.network.suggestions.0'),
        t('map.error.network.suggestions.1'),
        t('map.error.network.suggestions.2')
      ],
      color: 'text-orange-600'
    },
    tiles: {
      icon: <Globe className="w-8 h-8" />,
      title: t('map.error.tiles.title'),
      description: t('map.error.tiles.description'),
      suggestions: [
        t('map.error.tiles.suggestions.0'),
        t('map.error.tiles.suggestions.1'),
        t('map.error.tiles.suggestions.2')
      ],
      color: 'text-blue-600'
    },
    initialization: {
      icon: <AlertTriangle className="w-8 h-8" />,
      title: t('map.error.initialization.title'),
      description: t('map.error.initialization.description'),
      suggestions: [
        t('map.error.initialization.suggestions.0'),
        t('map.error.initialization.suggestions.1'),
        t('map.error.initialization.suggestions.2')
      ],
      color: 'text-red-600'
    },
    location: {
      icon: <MapPin className="w-8 h-8" />,
      title: t('map.error.location.title'),
      description: t('map.error.location.description'),
      suggestions: [
        t('map.error.location.suggestions.0'),
        t('map.error.location.suggestions.1'),
        t('map.error.location.suggestions.2')
      ],
      color: 'text-purple-600'
    },
    unknown: {
      icon: <AlertTriangle className="w-8 h-8" />,
      title: t('map.error.unknown.title'),
      description: t('map.error.unknown.description'),
      suggestions: [
        t('map.error.unknown.suggestions.0'),
        t('map.error.unknown.suggestions.1'),
        t('map.error.unknown.suggestions.2')
      ],
      color: 'text-gray-600'
    }
  }

  const config = errorConfigs[actualErrorType] || errorConfigs.unknown
  const errorMessage = error ? error.toString() : 'Unknown error occurred'

  return (
    <div 
      className={`bg-red-50 border-2 border-red-200 rounded-xl flex items-center justify-center relative overflow-hidden ${className}`}
      style={{ height }}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="grid grid-cols-6 grid-rows-4 h-full w-full">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="border border-red-300"></div>
          ))}
        </div>
      </div>

      <div className="text-center p-6 relative z-10 max-w-md">
        {/* Error Icon */}
        <div className={`w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 ${config.color}`}>
          {config.icon}
        </div>

        {/* Error Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {config.title}
        </h3>

        {/* Error Description */}
        <p className="text-gray-600 mb-4 text-sm leading-relaxed">
          {config.description}
        </p>

        {/* Detailed Error Message (in development) */}
        {process.env.NODE_ENV === 'development' && error && (
          <details className="mb-4 text-left">
            <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700 mb-2">
              {t('map.labels.technicalDetails')}
            </summary>
            <div className="bg-gray-100 border border-gray-300 rounded p-2 text-xs font-mono text-gray-700 break-all">
              {errorMessage}
            </div>
          </details>
        )}

        {/* Suggestions */}
        <div className="mb-6 text-left">
          <p className="text-sm font-medium text-gray-700 mb-2">{t('map.labels.tryFollowing')}</p>
          <ul className="text-xs text-gray-600 space-y-1">
            {config.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-primary-500 mt-1">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          {showRetryButton && onRetry && (
            <Button
              color="primary"
              size="sm"
              onClick={onRetry}
              startContent={<RefreshCw className="w-4 h-4" />}
              className="w-full"
            >
              {t('map.actions.tryAgain')}
            </Button>
          )}
          
          <Button
            variant="light"
            size="sm"
            onClick={() => window.location.reload()}
            className="w-full text-gray-600 hover:text-gray-800"
          >
            {t('map.actions.reloadPage')}
          </Button>
        </div>

        {/* Fallback Map Link */}
        <div className="mt-4 pt-4 border-t border-red-200">
          <p className="text-xs text-gray-500 mb-2">
            {t('map.labels.needToViewLocation')}
          </p>
          <Button
            variant="light"
            size="sm"
            as="a"
            href="https://www.openstreetmap.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 text-xs"
          >
            {t('map.actions.openInOpenStreetMap')}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default MapErrorState 