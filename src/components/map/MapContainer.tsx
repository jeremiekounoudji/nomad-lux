import React, { useEffect, useRef, useCallback, useState } from 'react'
import L from 'leaflet'
import { MapContainer as LeafletMapContainer, TileLayer, useMap as useLeafletMap } from 'react-leaflet'
import MapLoadingState from './MapLoadingState'
import MapErrorState from './MapErrorState'
import { DEFAULT_MAP_CONFIG } from '../../interfaces/Map'
import { useResponsiveMap } from '../../hooks/useResponsiveMap'
import 'leaflet/dist/leaflet.css'

export interface MapContainerProps {
  center?: [number, number]
  zoom?: number
  className?: string
  children?: React.ReactNode
  height?: string
  onMapReady?: (map: L.Map) => void
  scrollWheelZoom?: boolean
  zoomControl?: boolean
  attributionControl?: boolean
  onBoundsChange?: (bounds: L.LatLngBounds) => void
  onZoomChange?: (zoom: number) => void
  onClick?: (latlng: L.LatLng) => void
  enableMobileOptimization?: boolean
  responsive?: boolean
}

// Helper component to access the map instance and set up event listeners
const MapEventHandler: React.FC<{
  onMapReady?: (map: L.Map) => void
  onBoundsChange?: (bounds: L.LatLngBounds) => void
  onZoomChange?: (zoom: number) => void
  onClick?: (latlng: L.LatLng) => void
  onError?: (error: string) => void
}> = ({ onMapReady, onBoundsChange, onZoomChange, onClick, onError }) => {
  const map = useLeafletMap()

  useEffect(() => {
    if (map && onMapReady) {
      // Delay to ensure map is fully initialized
      const timer = setTimeout(() => {
        console.log('🗺️ Map initialized and ready')
        onMapReady(map)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [map, onMapReady])

  useEffect(() => {
    if (!map) return

    const handleMoveEnd = () => {
      if (onBoundsChange) {
        onBoundsChange(map.getBounds())
      }
    }

    const handleZoomEnd = () => {
      if (onZoomChange) {
        onZoomChange(map.getZoom())
      }
    }

    const handleClick = (e: L.LeafletMouseEvent) => {
      if (onClick) {
        onClick(e.latlng)
      }
    }

    const handleTileError = (e: any) => {
      console.warn('⚠️ Tile loading error:', e)
      if (onError) {
        onError(`Tile loading failed: ${e.message || 'Unknown tile error'}`)
      }
    }

    const handleTileLoadStart = () => {
      console.log('🔄 Tiles loading started')
    }

    const handleTileLoad = () => {
      console.log('✅ Tiles loaded successfully')
    }

    // Add event listeners
    map.on('moveend', handleMoveEnd)
    map.on('zoomend', handleZoomEnd)
    map.on('click', handleClick)
    map.on('tileerror', handleTileError)
    map.on('tileloadstart', handleTileLoadStart)
    map.on('tileload', handleTileLoad)

    // Cleanup
    return () => {
      map.off('moveend', handleMoveEnd)
      map.off('zoomend', handleZoomEnd)
      map.off('click', handleClick)
      map.off('tileerror', handleTileError)
      map.off('tileloadstart', handleTileLoadStart)
      map.off('tileload', handleTileLoad)
    }
  }, [map, onBoundsChange, onZoomChange, onClick])

  return null
}

const MapContainer: React.FC<MapContainerProps> = ({
  center = DEFAULT_MAP_CONFIG.defaultCenter,
  zoom = DEFAULT_MAP_CONFIG.defaultZoom,
  className = '',
  children,
  height = '300px',
  onMapReady,
  scrollWheelZoom = true,
  zoomControl = true,
  attributionControl = true,
  onBoundsChange,
  onZoomChange,
  onClick,
  enableMobileOptimization = true,
  responsive = true
}) => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [maxRetries] = useState(3)

  // Use responsive map hook if responsive mode is enabled
  const responsiveMap = useResponsiveMap({
    enableMobileOptimization
  })

  // Determine final map options
  const finalMapOptions = responsive ? {
    scrollWheelZoom: responsiveMap.mapOptions.scrollWheelZoom,
    zoomControl: responsiveMap.mapOptions.zoomControl,
    attributionControl: responsiveMap.mapOptions.attributionControl,
    touchZoom: responsiveMap.mapOptions.touchZoom,
    dragging: responsiveMap.mapOptions.dragging,
    doubleClickZoom: responsiveMap.mapOptions.doubleClickZoom
  } : {
    scrollWheelZoom,
    zoomControl,
    attributionControl,
    touchZoom: true,
    dragging: true,
    doubleClickZoom: true
  }

  // Determine final height
  const finalHeight = responsive ? responsiveMap.getResponsiveHeight() : height

  // Handle map ready event
  const handleMapReady = useCallback((map: L.Map) => {
    try {
      console.log('🗺️ MapContainer: Map ready with center:', center, 'zoom:', zoom)
      setIsLoading(false)
      setError(null)
      setRetryCount(0) // Reset retry count on successful load
      
      if (onMapReady) {
        onMapReady(map)
      }
    } catch (err) {
      console.error('❌ Error initializing map:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize map'
      setError(errorMessage)
      setIsLoading(false)
    }
  }, [center, zoom, onMapReady])

  // Handle retry functionality
  const handleRetry = useCallback(() => {
    if (retryCount < maxRetries) {
      console.log(`🔄 Retrying map load (${retryCount + 1}/${maxRetries})`)
      setRetryCount(prev => prev + 1)
      setError(null)
      setIsLoading(true)
      
      // Force re-render by briefly changing key would be ideal, but we'll simulate reset
      setTimeout(() => {
        if (error) { // Still has error after timeout
          setError('Map initialization failed after retry')
          setIsLoading(false)
        }
      }, 5000)
    } else {
      console.warn('⚠️ Maximum retry attempts reached')
      setError(`Failed to load map after ${maxRetries} attempts. Please refresh the page.`)
    }
  }, [retryCount, maxRetries, error])

  // Error boundary for map loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        console.warn('⚠️ Map taking longer than expected to load')
      }
    }, 5000)

    return () => clearTimeout(timer)
  }, [isLoading])

  if (error) {
    return (
      <MapErrorState
        className={className}
        height={finalHeight}
        error={error}
        onRetry={handleRetry}
        showRetryButton={retryCount < maxRetries}
      />
    )
  }

  return (
    <div 
      className={`relative overflow-hidden rounded-xl ${className} ${responsive && responsiveMap.mapState.isMobile ? 'map-container-mobile' : ''}`} 
      style={{ height: finalHeight }}
      onTouchStart={enableMobileOptimization ? responsiveMap.handleMobileInteraction : undefined}
      onTouchMove={enableMobileOptimization ? responsiveMap.handleMobileInteraction : undefined}
      onTouchEnd={enableMobileOptimization ? responsiveMap.handleMobileInteraction : undefined}
    >
      {isLoading && (
        <div className="absolute inset-0 z-10">
          <MapLoadingState height={finalHeight} className="rounded-xl" />
        </div>
      )}
      
      <LeafletMapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={finalMapOptions.scrollWheelZoom}
        zoomControl={finalMapOptions.zoomControl}
        attributionControl={finalMapOptions.attributionControl}
        touchZoom={finalMapOptions.touchZoom}
        dragging={finalMapOptions.dragging}
        doubleClickZoom={finalMapOptions.doubleClickZoom}
        className={`leaflet-container ${responsiveMap.mapState.isMobile ? 'mobile-optimized' : ''}`}
      >
        <TileLayer
          url={DEFAULT_MAP_CONFIG.tileLayerUrl}
          attribution={DEFAULT_MAP_CONFIG.attribution}
          maxZoom={DEFAULT_MAP_CONFIG.maxZoom}
          minZoom={DEFAULT_MAP_CONFIG.minZoom}
        />
        
        <MapEventHandler
          onMapReady={handleMapReady}
          onBoundsChange={onBoundsChange}
          onZoomChange={onZoomChange}
          onClick={onClick}
          onError={setError}
        />
        
        {children}
      </LeafletMapContainer>
    </div>
  )
}

export default MapContainer 