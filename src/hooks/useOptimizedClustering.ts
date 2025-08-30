import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { DatabaseProperty } from '../interfaces/DatabaseProperty';
import { MapCoordinates } from '../interfaces/Map';

interface ClusteringOptions {
  minZoom: number;
  maxZoom: number;
  radius: number;
  extent: number;
  nodeSize: number;
  log: boolean;
  generate: (zoom: number, properties: DatabaseProperty[]) => ClusterNode[];
}

interface ClusterNode {
  id: string;
  type: 'marker' | 'cluster';
  properties: DatabaseProperty[];
  coordinates: MapCoordinates;
  numPoints: number;
  bounds?: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
}

interface UseOptimizedClusteringOptions {
  minClusterSize?: number;
  clusterRadius?: number;
  maxZoom?: number;
  debounceDelay?: number;
  enableAdaptiveRadius?: boolean;
  performanceMode?: 'high' | 'balanced' | 'mobile';
  onClusteringStart?: () => void;
  onClusteringComplete?: (clusters: ClusterNode[]) => void;
}

interface ClusteringPerformance {
  mobile: { radius: number; debounce: number; maxClusters: number };
  balanced: { radius: number; debounce: number; maxClusters: number };
  high: { radius: number; debounce: number; maxClusters: number };
}

const PERFORMANCE_PRESETS: ClusteringPerformance = {
  mobile: {
    radius: 80,
    debounce: 300,
    maxClusters: 100
  },
  balanced: {
    radius: 60,
    debounce: 200,
    maxClusters: 200
  },
  high: {
    radius: 40,
    debounce: 100,
    maxClusters: 500
  }
};

export const useOptimizedClustering = (
  properties: DatabaseProperty[],
  map: any,
  options: UseOptimizedClusteringOptions = {}
) => {
  const {
    minClusterSize = 2,
    clusterRadius = 60,
    maxZoom = 15,
    debounceDelay = 200,
    enableAdaptiveRadius = true,
    performanceMode = 'balanced',
    onClusteringStart,
    onClusteringComplete
  } = options;

  const [clusters, setClusters] = useState<ClusterNode[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(map?.getZoom() || 10);
  const [viewportBounds, setViewportBounds] = useState<any>(null);

  const preset = PERFORMANCE_PRESETS[performanceMode];
  const effectiveRadius = clusterRadius || preset.radius;
  const effectiveDebounce = debounceDelay || preset.debounce;

  // Refs for debouncing and caching
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();
  const lastClusteringParams = useRef<{
    zoom: number;
    bounds: string;
    propertiesHash: string;
  } | null>(null);
  const clusteringCacheRef = useRef<Map<string, ClusterNode[]>>(new Map());

  // Create a hash of properties for caching
  const propertiesHash = useMemo(() => {
    return properties
      .map(p => `${p.id}-${p.coordinates.lat}-${p.coordinates.lng}`)
      .join('|');
  }, [properties]);

  // Adaptive radius calculation based on zoom level and device
  const getAdaptiveRadius = useCallback((zoom: number): number => {
    if (!enableAdaptiveRadius) return effectiveRadius;

    // Base radius adjustment for zoom level
    const zoomFactor = Math.max(0.5, Math.min(2, (18 - zoom) / 8));
    let adaptiveRadius = effectiveRadius * zoomFactor;

    // Device-specific adjustments
    if (performanceMode === 'mobile') {
      // Larger radius on mobile for better performance
      adaptiveRadius *= 1.3;
    }

    // Viewport size adjustment
    if (map) {
      const containerSize = map.getSize();
      const screenFactor = Math.min(containerSize.x, containerSize.y) / 500;
      adaptiveRadius *= Math.max(0.7, Math.min(1.5, screenFactor));
    }

    return Math.round(adaptiveRadius);
  }, [effectiveRadius, enableAdaptiveRadius, performanceMode, map]);

  // Simple clustering algorithm optimized for performance
  const performClustering = useCallback((
    inputProperties: DatabaseProperty[],
    zoom: number,
    bounds: any
  ): ClusterNode[] => {
    if (inputProperties.length === 0) return [];

    const radius = getAdaptiveRadius(zoom);
    const clusters: ClusterNode[] = [];
    const processed = new Set<string>();

    // Convert radius from pixels to degrees (approximate)
    const pixelSize = 40075017 / Math.pow(2, zoom + 8); // meters per pixel
    const radiusInDegrees = (radius * pixelSize) / 111320; // degrees

    console.log(`🔄 Clustering ${inputProperties.length} properties with radius ${radius}px (${radiusInDegrees.toFixed(6)}°)`);

    inputProperties.forEach((property, index) => {
      if (processed.has(property.id)) return;

      const nearbyProperties: DatabaseProperty[] = [property];
      const center = { ...property.coordinates };

      // Find nearby properties within radius
      for (let i = index + 1; i < inputProperties.length; i++) {
        const other = inputProperties[i];
        if (processed.has(other.id)) continue;

        const distance = Math.sqrt(
          Math.pow(property.coordinates.lat - other.coordinates.lat, 2) +
          Math.pow(property.coordinates.lng - other.coordinates.lng, 2)
        );

        if (distance <= radiusInDegrees) {
          nearbyProperties.push(other);
          processed.add(other.id);
        }
      }

      processed.add(property.id);

      // Create cluster or marker
      if (nearbyProperties.length >= minClusterSize) {
        // Calculate weighted center for cluster
        const totalLat = nearbyProperties.reduce((sum, p) => sum + p.coordinates.lat, 0);
        const totalLng = nearbyProperties.reduce((sum, p) => sum + p.coordinates.lng, 0);
        
        center.lat = totalLat / nearbyProperties.length;
        center.lng = totalLng / nearbyProperties.length;

        clusters.push({
          id: `cluster-${clusters.length}-z${zoom}`,
          type: 'cluster',
          properties: nearbyProperties,
          coordinates: center,
          numPoints: nearbyProperties.length,
          bounds: {
            minX: Math.min(...nearbyProperties.map(p => p.coordinates.lng)),
            minY: Math.min(...nearbyProperties.map(p => p.coordinates.lat)),
            maxX: Math.max(...nearbyProperties.map(p => p.coordinates.lng)),
            maxY: Math.max(...nearbyProperties.map(p => p.coordinates.lat))
          }
        });
      } else {
        // Single marker
        clusters.push({
          id: `marker-${property.id}`,
          type: 'marker',
          properties: [property],
          coordinates: property.coordinates,
          numPoints: 1
        });
      }
    });

    return clusters;
  }, [getAdaptiveRadius, minClusterSize]);

  // Filter properties within viewport with buffer
  const getPropertiesInView = useCallback((bounds: any): DatabaseProperty[] => {
    if (!bounds) return properties;

    // Add buffer to reduce re-clustering on small movements
    const latBuffer = (bounds.getNorth() - bounds.getSouth()) * 0.1;
    const lngBuffer = (bounds.getEast() - bounds.getWest()) * 0.1;

    return properties.filter(property => {
      const lat = property.coordinates.lat;
      const lng = property.coordinates.lng;
      
      return lat >= bounds.getSouth() - latBuffer &&
             lat <= bounds.getNorth() + latBuffer &&
             lng >= bounds.getWest() - lngBuffer &&
             lng <= bounds.getEast() + lngBuffer;
    });
  }, [properties]);

  // Debounced clustering function
  const debouncedClustering = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(async () => {
      if (!map || isProcessing) return;

      const zoom = map.getZoom();
      const bounds = map.getBounds();
      const boundsString = `${bounds.getNorth()},${bounds.getSouth()},${bounds.getEast()},${bounds.getWest()}`;

      // Check if clustering is needed
      const currentParams = {
        zoom,
        bounds: boundsString,
        propertiesHash
      };

      if (lastClusteringParams.current &&
          lastClusteringParams.current.zoom === zoom &&
          lastClusteringParams.current.bounds === boundsString &&
          lastClusteringParams.current.propertiesHash === propertiesHash) {
        console.log('⚡ Skipping clustering - no significant changes');
        return;
      }

      // Check cache
      const cacheKey = `${zoom}-${boundsString}-${propertiesHash}`;
      const cached = clusteringCacheRef.current.get(cacheKey);
      if (cached) {
        console.log('📦 Using cached clustering result');
        setClusters(cached);
        return;
      }

      setIsProcessing(true);
      onClusteringStart?.();

      try {
        const startTime = performance.now();
        
        // Get properties in viewport
        const propertiesInView = getPropertiesInView(bounds);
        
        // Limit properties for performance
        const maxProperties = preset.maxClusters * 5;
        const limitedProperties = propertiesInView.length > maxProperties
          ? propertiesInView
              .sort((a, b) => (b.rating || 0) - (a.rating || 0))
              .slice(0, maxProperties)
          : propertiesInView;

        // Perform clustering
        const newClusters = performClustering(limitedProperties, zoom, bounds);
        
        const endTime = performance.now();
        console.log(`✅ Clustering completed in ${(endTime - startTime).toFixed(2)}ms - ${newClusters.length} clusters from ${limitedProperties.length} properties`);

        // Cache result (limit cache size)
        if (clusteringCacheRef.current.size > 20) {
          clusteringCacheRef.current.clear();
        }
        clusteringCacheRef.current.set(cacheKey, newClusters);

        // Update state
        setClusters(newClusters);
        lastClusteringParams.current = currentParams;
        onClusteringComplete?.(newClusters);

      } catch (error) {
        console.error('❌ Clustering error:', error);
      } finally {
        setIsProcessing(false);
      }
    }, effectiveDebounce);
  }, [
    map,
    isProcessing,
    propertiesHash,
    getPropertiesInView,
    performClustering,
    preset.maxClusters,
    effectiveDebounce,
    onClusteringStart,
    onClusteringComplete
  ]);

  // Smart update detection - only re-cluster on significant changes
  const shouldUpdateClustering = useCallback((newZoom: number, newBounds: any): boolean => {
    if (!lastClusteringParams.current) return true;

    const lastZoom = lastClusteringParams.current.zoom;
    const zoomDiff = Math.abs(newZoom - lastZoom);
    
    // Always update on zoom changes
    if (zoomDiff >= 1) return true;

    // Check bounds change significance
    if (newBounds && viewportBounds) {
      const latChange = Math.abs(newBounds.getNorth() - viewportBounds.getNorth()) +
                       Math.abs(newBounds.getSouth() - viewportBounds.getSouth());
      const lngChange = Math.abs(newBounds.getEast() - viewportBounds.getEast()) +
                       Math.abs(newBounds.getWest() - viewportBounds.getWest());
      
      const totalChange = latChange + lngChange;
      const viewport = (viewportBounds.getNorth() - viewportBounds.getSouth()) +
                      (viewportBounds.getEast() - viewportBounds.getWest());
      
      // Update if moved more than 20% of viewport
      return totalChange > viewport * 0.2;
    }

    return false;
  }, [lastClusteringParams, viewportBounds]);

  // Set up map event listeners
  useEffect(() => {
    if (!map) return;

    const handleMapChange = () => {
      const zoom = map.getZoom();
      const bounds = map.getBounds();
      
      setCurrentZoom(zoom);
      setViewportBounds(bounds);
      
      if (shouldUpdateClustering(zoom, bounds)) {
        debouncedClustering();
      }
    };

    // Initial clustering
    handleMapChange();

    // Attach listeners with appropriate throttling
    map.on('moveend', handleMapChange);
    map.on('zoomend', handleMapChange);
    map.on('resize', handleMapChange);

    return () => {
      map.off('moveend', handleMapChange);
      map.off('zoomend', handleMapChange);
      map.off('resize', handleMapChange);
      
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [map, debouncedClustering, shouldUpdateClustering]);

  // Re-cluster when properties change
  useEffect(() => {
    if (properties.length > 0) {
      debouncedClustering();
    }
  }, [properties, debouncedClustering]);

  // Clear cache when properties change significantly
  useEffect(() => {
    clusteringCacheRef.current.clear();
    lastClusteringParams.current = null;
  }, [propertiesHash]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Performance metrics
  const performanceMetrics = useMemo(() => ({
    totalProperties: properties.length,
    clustersCount: clusters.filter(c => c.type === 'cluster').length,
    markersCount: clusters.filter(c => c.type === 'marker').length,
    reductionRatio: properties.length > 0 ? 
      ((properties.length - clusters.length) / properties.length * 100).toFixed(1) + '%' : '0%',
    currentRadius: getAdaptiveRadius(currentZoom),
    cacheSize: clusteringCacheRef.current.size,
    performanceMode
  }), [properties.length, clusters, getAdaptiveRadius, currentZoom, performanceMode]);

  return {
    clusters,
    isProcessing,
    currentZoom,
    performanceMetrics,
    
    // Manual controls
    refreshClustering: debouncedClustering,
    clearCache: () => clusteringCacheRef.current.clear()
  };
};

export default useOptimizedClustering;
export type { ClusterNode, UseOptimizedClusteringOptions }; 