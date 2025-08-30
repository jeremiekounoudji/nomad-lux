import { Property } from './Property'

// Core map interfaces
export interface MapCoordinates {
  lat: number
  lng: number
}

export interface MapBounds {
  northeast: MapCoordinates
  southwest: MapCoordinates
}

export interface MapViewport {
  center: MapCoordinates
  zoom: number
  bounds?: MapBounds
}

// Marker interfaces
export interface MapMarker {
  id: string
  position: MapCoordinates
  title: string
  description?: string
  icon?: string
  isSelected?: boolean
  data?: any
}

export interface PropertyMarker extends MapMarker {
  property: Property
  price: number
  showPrice: boolean
  showImage: boolean
  imageUrl?: string
}

// Cluster interfaces
export interface MarkerCluster {
  id: string
  position: MapCoordinates
  count: number
  markers: MapMarker[]
  bounds: MapBounds
}

// Map state interfaces
export interface MapState {
  center: [number, number]
  zoom: number
  isLoading: boolean
  error: string | null
  markers: MapMarker[]
  selectedMarker?: MapMarker | null
  clustersEnabled: boolean
  routingEnabled: boolean
}

// Map configuration interfaces
export interface MapConfig {
  defaultCenter: [number, number]
  defaultZoom: number
  minZoom: number
  maxZoom: number
  tileLayerUrl: string
  attribution: string
  enableClustering: boolean
  enableRouting: boolean
  clusterOptions: {
    maxClusterRadius: number
    chunkedLoading: boolean
    spiderfyOnMaxZoom: boolean
    showCoverageOnHover: boolean
    zoomToBoundsOnClick: boolean
  }
}

// Routing interfaces
export interface RouteWaypoint {
  lat: number
  lng: number
  name?: string
}

export interface RouteOptions {
  waypoints: RouteWaypoint[]
  routeWhileDragging: boolean
  addWaypoints: boolean
  lineOptions: {
    styles: Array<{
      color: string
      weight: number
      opacity: number
    }>
  }
}

// Direction interfaces
export interface DirectionStep {
  instruction: string
  distance: number
  time: number
  maneuver: string
}

export interface Route {
  summary: {
    totalDistance: number
    totalTime: number
  }
  instructions: DirectionStep[]
  coordinates: MapCoordinates[]
}

// Search map interfaces
export interface MapSearchFilters {
  bounds: MapBounds
  propertyType?: string[]
  priceRange?: {
    min: number
    max: number
  }
  amenities?: string[]
  rating?: number
}

export interface MapSearchResult {
  properties: Property[]
  totalCount: number
  bounds: MapBounds
  searchCenter: MapCoordinates
}

// Map interaction interfaces
export interface MapEventHandlers {
  onMarkerClick?: (marker: MapMarker) => void
  onMarkerHover?: (marker: MapMarker) => void
  onMapClick?: (coordinates: MapCoordinates) => void
  onMapMove?: (viewport: MapViewport) => void
  onBoundsChange?: (bounds: MapBounds) => void
  onZoomChange?: (zoom: number) => void
}

// Map component props interfaces
export interface BaseMapProps {
  center?: [number, number]
  zoom?: number
  height?: string
  className?: string
}

export interface MapContainerProps extends BaseMapProps {
  /**
   * Map event handlers
   */
  onError?: (error: Error) => void;
  onMapReady?: (map: any) => void;
  
  /**
   * Additional map options
   */
  scrollWheelZoom?: boolean;
  dragging?: boolean;
  zoomControl?: boolean;
  doubleClickZoom?: boolean;
}

export interface PropertyMapProps extends BaseMapProps {
  /**
   * Property to display on the map
   */
  property: Property;
  
  /**
   * Show nearby amenities and points of interest
   */
  showNearbyAmenities?: boolean;
  
  /**
   * Show directions button
   */
  showDirections?: boolean;
  
  /**
   * Show radius circle around property
   */
  showRadius?: boolean;
  
  /**
   * Radius in meters for the circle
   */
  radiusMeters?: number;
  
  /**
   * Callback when directions are requested
   */
  onDirectionsRequest?: (coordinates: MapCoordinates) => void;
  
  /**
   * Callback when host contact is requested
   */
  onContactHost?: (property: Property) => void;
  
  /**
   * Error handler for map errors
   */
  onError?: (error: Error) => void;
}

export interface PropertiesMapProps extends BaseMapProps {
  properties: Property[]
  selectedProperty?: Property | null
  onPropertyClick?: (property: Property) => void
  enableClustering?: boolean
  showPriceMarkers?: boolean
  filters?: MapSearchFilters
}

export interface MapToggleProps {
  isMapView: boolean
  onToggle: (isMapView: boolean) => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

// Map utility types
export type MapProvider = 'openstreetmap' | 'mapbox' | 'google'

export type MarkerType = 'default' | 'property' | 'user-location' | 'destination'

export type ClusterSize = 'small' | 'medium' | 'large'

// Export default map configuration
export const DEFAULT_MAP_CONFIG: MapConfig = {
  defaultCenter: [14.6937, -17.4441], // Dakar, Senegal
  defaultZoom: 13,
  minZoom: 3,
  maxZoom: 18,
  tileLayerUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  enableClustering: true,
  enableRouting: true,
  clusterOptions: {
    maxClusterRadius: 50,
    chunkedLoading: true,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true
  }
} 