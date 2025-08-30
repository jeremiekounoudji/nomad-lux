import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { DatabaseProperty } from '../../interfaces/DatabaseProperty';
import { MapCoordinates } from '../../interfaces/Map';
import { useTranslation } from '../../lib/stores/translationStore';

interface ViewportBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

interface VirtualizedMarkerProps {
  properties: DatabaseProperty[];
  map: any; // Leaflet map instance
  maxVisibleMarkers?: number;
  clusterThreshold?: number;
  renderMarker: (property: DatabaseProperty, isCluster?: boolean) => React.ReactNode;
  onMarkerClick?: (property: DatabaseProperty) => void;
  onClusterClick?: (properties: DatabaseProperty[], bounds: ViewportBounds) => void;
  enableClustering?: boolean;
  enableVirtualization?: boolean;
  performanceMode?: 'high' | 'medium' | 'low';
}

interface MarkerCluster {
  id: string;
  properties: DatabaseProperty[];
  center: MapCoordinates;
  bounds: ViewportBounds;
  count: number;
  zoom: number;
}

interface VirtualizationStrategy {
  maxMarkers: number;
  clusterDistance: number;
  updateThreshold: number;
  debounceDelay: number;
  enableLOD: boolean; // Level of Detail
}

const PERFORMANCE_STRATEGIES: Record<string, VirtualizationStrategy> = {
  high: {
    maxMarkers: 1000,
    clusterDistance: 50,
    updateThreshold: 0.1,
    debounceDelay: 100,
    enableLOD: true
  },
  medium: {
    maxMarkers: 500,
    clusterDistance: 60,
    updateThreshold: 0.2,
    debounceDelay: 150,
    enableLOD: true
  },
  low: {
    maxMarkers: 200,
    clusterDistance: 80,
    updateThreshold: 0.3,
    debounceDelay: 250,
    enableLOD: false
  }
};

export const VirtualizedMarkerRenderer: React.FC<VirtualizedMarkerProps> = ({
  properties,
  map,
  maxVisibleMarkers = 500,
  clusterThreshold = 10,
  renderMarker,
  onMarkerClick,
  onClusterClick,
  enableClustering = true,
  enableVirtualization = true,
  performanceMode = 'medium'
}) => {
  const { t } = useTranslation('common');
  const [viewportBounds, setViewportBounds] = useState<ViewportBounds | null>(null);
  const [currentZoom, setCurrentZoom] = useState<number>(10);
  const [visibleMarkers, setVisibleMarkers] = useState<DatabaseProperty[]>([]);
  const [clusters, setClusters] = useState<MarkerCluster[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const strategy = PERFORMANCE_STRATEGIES[performanceMode];
  const updateTimeoutRef = useRef<NodeJS.Timeout>();
  const lastUpdateRef = useRef<{ bounds: ViewportBounds | null; zoom: number }>({
    bounds: null,
    zoom: 10
  });

  // Spatial index for fast property lookup
  const spatialIndex = useMemo(() => {
    const index = new Map<string, DatabaseProperty[]>();
    const gridSize = 0.01; // ~1km at equator
    
    properties.forEach(property => {
      const gridX = Math.floor(property.coordinates.lat / gridSize);
      const gridY = Math.floor(property.coordinates.lng / gridSize);
      const key = `${gridX},${gridY}`;
      
      if (!index.has(key)) {
        index.set(key, []);
      }
      index.get(key)!.push(property);
    });
    
    return index;
  }, [properties]);

  // Check if property is within viewport bounds
  const isInViewport = useCallback((property: DatabaseProperty, bounds: ViewportBounds): boolean => {
    const { lat, lng } = property.coordinates;
    return lat >= bounds.south && lat <= bounds.north && 
           lng >= bounds.west && lng <= bounds.east;
  }, []);

  // Calculate distance between two coordinates
  const calculateDistance = useCallback((coord1: MapCoordinates, coord2: MapCoordinates): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
    const dLng = (coord2.lng - coord1.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }, []);

  // Create clusters from properties
  const createClusters = useCallback((
    propertiesInView: DatabaseProperty[], 
    zoom: number
  ): { clusters: MarkerCluster[]; unclusteredProperties: DatabaseProperty[] } => {
    if (!enableClustering) {
      return { clusters: [], unclusteredProperties: propertiesInView };
    }

    const clusters: MarkerCluster[] = [];
    const unclusteredProperties: DatabaseProperty[] = [];
    const processed = new Set<string>();
    
    // Adjust cluster distance based on zoom level
    const baseDistance = strategy.clusterDistance;
    const zoomFactor = Math.pow(2, 15 - zoom);
    const clusterDistance = baseDistance * zoomFactor / 1000; // Convert to degrees

    propertiesInView.forEach(property => {
      if (processed.has(property.id)) return;

      // Find nearby properties
      const nearbyProperties = propertiesInView.filter(other => {
        if (processed.has(other.id) || other.id === property.id) return false;
        
        const distance = Math.abs(property.coordinates.lat - other.coordinates.lat) +
                        Math.abs(property.coordinates.lng - other.coordinates.lng);
        return distance <= clusterDistance;
      });

      if (nearbyProperties.length >= clusterThreshold - 1) {
        // Create cluster
        const clusterProperties = [property, ...nearbyProperties];
        
        // Calculate cluster center
        const centerLat = clusterProperties.reduce((sum, p) => sum + p.coordinates.lat, 0) / clusterProperties.length;
        const centerLng = clusterProperties.reduce((sum, p) => sum + p.coordinates.lng, 0) / clusterProperties.length;
        
        // Calculate cluster bounds
        const lats = clusterProperties.map(p => p.coordinates.lat);
        const lngs = clusterProperties.map(p => p.coordinates.lng);
        
        const cluster: MarkerCluster = {
          id: `cluster_${clusters.length}_${zoom}`,
          properties: clusterProperties,
          center: { lat: centerLat, lng: centerLng },
          bounds: {
            north: Math.max(...lats),
            south: Math.min(...lats),
            east: Math.max(...lngs),
            west: Math.min(...lngs)
          },
          count: clusterProperties.length,
          zoom
        };
        
        clusters.push(cluster);
        clusterProperties.forEach(p => processed.add(p.id));
      } else {
        unclusteredProperties.push(property);
        processed.add(property.id);
      }
    });

    return { clusters, unclusteredProperties };
  }, [enableClustering, clusterThreshold, strategy.clusterDistance]);

  // Get properties in current viewport using spatial index
  const getPropertiesInViewport = useCallback((bounds: ViewportBounds): DatabaseProperty[] => {
    if (!enableVirtualization) {
      return properties.filter(property => isInViewport(property, bounds));
    }

    const result: DatabaseProperty[] = [];
    const gridSize = 0.01;
    
    // Calculate grid range for viewport
    const minGridX = Math.floor(bounds.south / gridSize);
    const maxGridX = Math.ceil(bounds.north / gridSize);
    const minGridY = Math.floor(bounds.west / gridSize);
    const maxGridY = Math.ceil(bounds.east / gridSize);
    
    // Check grid cells that intersect with viewport
    for (let x = minGridX; x <= maxGridX; x++) {
      for (let y = minGridY; y <= maxGridY; y++) {
        const key = `${x},${y}`;
        const gridProperties = spatialIndex.get(key) || [];
        
        gridProperties.forEach(property => {
          if (isInViewport(property, bounds) && result.length < strategy.maxMarkers) {
            result.push(property);
          }
        });
      }
    }
    
    // If still too many markers, prioritize by importance/rating
    if (result.length > maxVisibleMarkers) {
      return result
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, maxVisibleMarkers);
    }
    
    return result;
  }, [properties, spatialIndex, isInViewport, enableVirtualization, strategy.maxMarkers, maxVisibleMarkers]);

  // Update visible markers and clusters
  const updateVisibleContent = useCallback(async () => {
    if (!map || !viewportBounds || isProcessing) return;

    setIsProcessing(true);

    try {
      // Check if significant change occurred
      const lastUpdate = lastUpdateRef.current;
      const boundsChanged = !lastUpdate.bounds || 
        Math.abs(viewportBounds.north - lastUpdate.bounds.north) > strategy.updateThreshold ||
        Math.abs(viewportBounds.south - lastUpdate.bounds.south) > strategy.updateThreshold ||
        Math.abs(viewportBounds.east - lastUpdate.bounds.east) > strategy.updateThreshold ||
        Math.abs(viewportBounds.west - lastUpdate.bounds.west) > strategy.updateThreshold;
      
      const zoomChanged = Math.abs(currentZoom - lastUpdate.zoom) >= 1;

      if (!boundsChanged && !zoomChanged) {
        setIsProcessing(false);
        return;
      }

      console.log('🔄', t('map.virtualization.messages.updatingMarkers'), ':', viewportBounds);

      // Get properties in viewport
      const propertiesInView = getPropertiesInViewport(viewportBounds);
      
      // Create clusters if needed
      const { clusters: newClusters, unclusteredProperties } = createClusters(propertiesInView, currentZoom);
      
      // Apply Level of Detail (LOD) if enabled
      let finalVisibleMarkers = unclusteredProperties;
      if (strategy.enableLOD && currentZoom < 12) {
        // At lower zoom levels, show fewer individual markers
        const lodFactor = Math.max(0.1, (currentZoom - 5) / 10);
        const maxLodMarkers = Math.floor(strategy.maxMarkers * lodFactor);
        finalVisibleMarkers = unclusteredProperties
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, maxLodMarkers);
      }
      
      setVisibleMarkers(finalVisibleMarkers);
      setClusters(newClusters);
      
      // Update last update reference
      lastUpdateRef.current = {
        bounds: { ...viewportBounds },
        zoom: currentZoom
      };

      console.log('📍', t('map.virtualization.messages.renderedMarkers', { 
        markers: finalVisibleMarkers.length, 
        clusters: newClusters.length 
      }));
    } catch (error) {
      console.error('❌', t('map.virtualization.messages.errorUpdating'), ':', error);
    } finally {
      setIsProcessing(false);
    }
  }, [map, viewportBounds, currentZoom, isProcessing, strategy, getPropertiesInViewport, createClusters]);

  // Debounced update function
  const debouncedUpdate = useCallback(() => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    updateTimeoutRef.current = setTimeout(() => {
      updateVisibleContent();
    }, strategy.debounceDelay);
  }, [updateVisibleContent, strategy.debounceDelay]);

  // Set up map event listeners
  useEffect(() => {
    if (!map) return;

    const updateBounds = () => {
      const bounds = map.getBounds();
      const zoom = map.getZoom();
      
      setViewportBounds({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest()
      });
      
      setCurrentZoom(zoom);
    };

    // Initial bounds
    updateBounds();

    // Set up event listeners
    map.on('moveend', updateBounds);
    map.on('zoomend', updateBounds);
    map.on('resize', updateBounds);

    return () => {
      map.off('moveend', updateBounds);
      map.off('zoomend', updateBounds);
      map.off('resize', updateBounds);
    };
  }, [map]);

  // Update visible content when bounds or zoom change
  useEffect(() => {
    debouncedUpdate();
  }, [viewportBounds, currentZoom, debouncedUpdate]);

  // Handle marker clicks
  const handleMarkerClick = useCallback((property: DatabaseProperty) => {
    onMarkerClick?.(property);
  }, [onMarkerClick]);

  // Handle cluster clicks
  const handleClusterClick = useCallback((cluster: MarkerCluster) => {
    if (onClusterClick) {
      onClusterClick(cluster.properties, cluster.bounds);
    } else {
      // Default behavior: zoom to cluster bounds
      map.fitBounds([
        [cluster.bounds.south, cluster.bounds.west],
        [cluster.bounds.north, cluster.bounds.east]
      ]);
    }
  }, [onClusterClick, map]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  // Performance monitoring
  const performanceInfo = useMemo(() => ({
    totalProperties: properties.length,
    visibleMarkers: visibleMarkers.length,
    clusters: clusters.length,
    reductionRatio: properties.length > 0 ? 
      ((properties.length - visibleMarkers.length) / properties.length * 100).toFixed(1) + '%' : '0%',
    currentZoom,
    strategy: performanceMode
  }), [properties.length, visibleMarkers.length, clusters.length, currentZoom, performanceMode]);

  // Debug info (only in development)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🎯 Virtualization performance:', performanceInfo);
    }
  }, [performanceInfo]);

  return (
    <>
      {/* Render individual markers */}
      {visibleMarkers.map(property => (
        <div
          key={property.id}
          onClick={() => handleMarkerClick(property)}
          style={{
            position: 'absolute',
            transform: 'translate(-50%, -100%)',
            zIndex: 1000,
            cursor: 'pointer'
          }}
        >
          {renderMarker(property, false)}
        </div>
      ))}

      {/* Render clusters */}
      {clusters.map(cluster => (
        <div
          key={cluster.id}
          onClick={() => handleClusterClick(cluster)}
          style={{
            position: 'absolute',
            transform: 'translate(-50%, -50%)',
            zIndex: 1001,
            cursor: 'pointer'
          }}
        >
          {renderMarker(cluster.properties[0], true)}
        </div>
      ))}

      {/* Performance indicator (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          position: 'absolute',
          top: 10,
          right: 10,
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '8px',
          borderRadius: '4px',
          fontSize: '12px',
          zIndex: 2000,
          fontFamily: 'monospace'
        }}>
          <div>{t('map.virtualization.performance.total')}: {performanceInfo.totalProperties}</div>
          <div>{t('map.virtualization.performance.visible')}: {performanceInfo.visibleMarkers}</div>
          <div>{t('map.virtualization.performance.clusters')}: {performanceInfo.clusters}</div>
          <div>{t('map.virtualization.performance.reduction')}: {performanceInfo.reductionRatio}</div>
          <div>{t('map.virtualization.performance.zoom')}: {performanceInfo.currentZoom}</div>
          <div>{t('map.virtualization.performance.mode')}: {performanceInfo.strategy}</div>
        </div>
      )}
    </>
  );
};

export default VirtualizedMarkerRenderer;
export type { VirtualizedMarkerProps, MarkerCluster, ViewportBounds, VirtualizationStrategy }; 