import { useState, useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet.markercluster'
import 'leaflet-routing-machine'

export interface MapState {
  center: [number, number]
  zoom: number
  isLoading: boolean
  error: string | null
}

export interface MapOptions {
  center?: [number, number]
  zoom?: number
  minZoom?: number
  maxZoom?: number
  enableClustering?: boolean
  enableRouting?: boolean
}

export interface UseMapReturn {
  mapState: MapState
  mapRef: React.MutableRefObject<L.Map | null>
  setCenter: (center: [number, number]) => void
  setZoom: (zoom: number) => void
  addMarker: (lat: number, lng: number, options?: L.MarkerOptions) => L.Marker
  removeMarker: (marker: L.Marker) => void
  addMarkerCluster: () => L.MarkerClusterGroup
  fitBounds: (bounds: L.LatLngBounds) => void
  clearMap: () => void
  getDirections: (from: [number, number], to: [number, number]) => void
  isReady: boolean
}

export const useMap = (options: MapOptions = {}): UseMapReturn => {
  const {
    center = [14.6937, -17.4441], // Dakar, Senegal (default center for West Africa)
    zoom = 13,
    minZoom = 3,
    maxZoom = 18,
    enableClustering = false,
    enableRouting = false
  } = options

  const [mapState, setMapState] = useState<MapState>({
    center,
    zoom,
    isLoading: true,
    error: null
  })

  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null)
  const routingControlRef = useRef<any>(null)
  const [isReady, setIsReady] = useState(false)

  // Initialize map
  useEffect(() => {
    setMapState(prev => ({ ...prev, isLoading: true, error: null }))
    
    // Add error handling for network issues
    const handleOnlineStatus = () => {
      if (!navigator.onLine) {
        setMapState(prev => ({ ...prev, error: 'Network connection lost', isLoading: false }))
        setIsReady(false)
      } else {
        setMapState(prev => ({ ...prev, error: null, isLoading: true }))
        // Retry initialization when back online
        const retryTimer = setTimeout(() => {
          setMapState(prev => ({ ...prev, isLoading: false }))
          setIsReady(true)
        }, 1000)
        return () => clearTimeout(retryTimer)
      }
    }

    // Check initial network status
    if (!navigator.onLine) {
      handleOnlineStatus()
      return
    }

    // Simulate initialization delay with error handling
    const timer = setTimeout(() => {
      try {
        setMapState(prev => ({ ...prev, isLoading: false }))
        setIsReady(true)
      } catch (error) {
        console.error('Map initialization error:', error)
        setMapState(prev => ({ 
          ...prev, 
          error: 'Failed to initialize map components', 
          isLoading: false 
        }))
        setIsReady(false)
      }
    }, 500)

    // Listen for network status changes
    window.addEventListener('online', handleOnlineStatus)
    window.addEventListener('offline', handleOnlineStatus)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('online', handleOnlineStatus)
      window.removeEventListener('offline', handleOnlineStatus)
    }
  }, [])

  // Fix Leaflet default icon path issues
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    })
  }, [])

  const setCenter = (newCenter: [number, number]) => {
    setMapState(prev => ({ ...prev, center: newCenter }))
    if (mapRef.current) {
      mapRef.current.setView(newCenter, mapState.zoom)
    }
  }

  const setZoom = (newZoom: number) => {
    setMapState(prev => ({ ...prev, zoom: newZoom }))
    if (mapRef.current) {
      mapRef.current.setZoom(newZoom)
    }
  }

  const addMarker = (lat: number, lng: number, options: L.MarkerOptions = {}): L.Marker => {
    if (!mapRef.current) {
      throw new Error('Map not initialized')
    }

    const marker = L.marker([lat, lng], options)
    
    if (enableClustering && clusterGroupRef.current) {
      clusterGroupRef.current.addLayer(marker)
    } else {
      marker.addTo(mapRef.current)
    }
    
    markersRef.current.push(marker)
    return marker
  }

  const removeMarker = (marker: L.Marker) => {
    if (!mapRef.current) return

    if (enableClustering && clusterGroupRef.current) {
      clusterGroupRef.current.removeLayer(marker)
    } else {
      mapRef.current.removeLayer(marker)
    }
    
    markersRef.current = markersRef.current.filter(m => m !== marker)
  }

  const addMarkerCluster = (): L.MarkerClusterGroup => {
    if (!mapRef.current) {
      throw new Error('Map not initialized')
    }

    if (clusterGroupRef.current) {
      return clusterGroupRef.current
    }

    const clusterGroup = L.markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true
    })

    clusterGroupRef.current = clusterGroup
    mapRef.current.addLayer(clusterGroup)
    
    return clusterGroup
  }

  const fitBounds = (bounds: L.LatLngBounds) => {
    if (!mapRef.current) return
    
    mapRef.current.fitBounds(bounds, {
      padding: [20, 20],
      maxZoom: 15
    })
  }

  const clearMap = () => {
    if (!mapRef.current) return

    // Clear all markers
    markersRef.current.forEach(marker => {
      if (enableClustering && clusterGroupRef.current) {
        clusterGroupRef.current.removeLayer(marker)
      } else {
        mapRef.current?.removeLayer(marker)
      }
    })
    markersRef.current = []

    // Clear cluster group
    if (clusterGroupRef.current) {
      clusterGroupRef.current.clearLayers()
    }

    // Clear routing control
    if (routingControlRef.current) {
      mapRef.current.removeControl(routingControlRef.current)
      routingControlRef.current = null
    }
  }

  const getDirections = (from: [number, number], to: [number, number]) => {
    if (!mapRef.current || !enableRouting) {
      console.warn('Map not ready or routing not enabled')
      return
    }

    // Clear existing routing
    if (routingControlRef.current) {
      mapRef.current.removeControl(routingControlRef.current)
    }

    // Create new routing control (using any type for now until proper types are available)
    const routingControl = (L as any).Routing.control({
      waypoints: [
        L.latLng(from[0], from[1]),
        L.latLng(to[0], to[1])
      ],
      routeWhileDragging: false,
      addWaypoints: false,
      createMarker: () => null, // Don't create default markers
      lineOptions: {
        styles: [{ color: '#3b82f6', weight: 4, opacity: 0.8 }]
      }
    })

    routingControlRef.current = routingControl
    routingControl.addTo(mapRef.current)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        clearMap()
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  return {
    mapState,
    mapRef,
    setCenter,
    setZoom,
    addMarker,
    removeMarker,
    addMarkerCluster,
    fitBounds,
    clearMap,
    getDirections,
    isReady
  }
} 