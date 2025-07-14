import { useState, useEffect, useCallback, useRef } from 'react';
import { preloadLeafletLibraries, useLeafletLoaded } from '../components/map/LazyMapWrapper';

interface DeviceCapabilities {
  isMobile: boolean;
  isSlowConnection: boolean;
  hasLimitedMemory: boolean;
  supportsWebGL: boolean;
  devicePixelRatio: number;
}

interface MapUsagePattern {
  hasUsedMaps: boolean;
  frequentMapUser: boolean;
  preferredMapType: 'property' | 'properties' | 'container' | null;
  lastMapInteraction: number;
  totalMapInteractions: number;
}

interface MapOptimizationStrategy {
  shouldPreload: boolean;
  shouldUseSimplifiedMarkers: boolean;
  maxMarkers: number;
  enableClustering: boolean;
  tileQuality: 'low' | 'medium' | 'high';
  cacheStrategy: 'aggressive' | 'moderate' | 'minimal';
}

// Local storage keys
const STORAGE_KEYS = {
  MAP_USAGE: 'nomad_map_usage',
  MAP_PREFERENCES: 'nomad_map_preferences',
  DEVICE_CAPABILITIES: 'nomad_device_capabilities'
};

// Detect device capabilities
const detectDeviceCapabilities = (): DeviceCapabilities => {
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  
  return {
    isMobile: /Mobi|Android/i.test(navigator.userAgent) || window.innerWidth < 768,
    isSlowConnection: connection ? 
      ['slow-2g', '2g'].includes(connection.effectiveType) || connection.downlink < 1.5 :
      false,
    hasLimitedMemory: (navigator as any).deviceMemory ? (navigator as any).deviceMemory < 4 : false,
    supportsWebGL: (() => {
      try {
        const canvas = document.createElement('canvas');
        return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
      } catch {
        return false;
      }
    })(),
    devicePixelRatio: window.devicePixelRatio || 1
  };
};

// Load usage pattern from storage
const loadUsagePattern = (): MapUsagePattern => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.MAP_USAGE);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to load map usage pattern:', error);
  }
  
  return {
    hasUsedMaps: false,
    frequentMapUser: false,
    preferredMapType: null,
    lastMapInteraction: 0,
    totalMapInteractions: 0
  };
};

// Save usage pattern to storage
const saveUsagePattern = (pattern: MapUsagePattern) => {
  try {
    localStorage.setItem(STORAGE_KEYS.MAP_USAGE, JSON.stringify(pattern));
  } catch (error) {
    console.warn('Failed to save map usage pattern:', error);
  }
};

// Calculate optimization strategy based on device and usage
const calculateOptimizationStrategy = (
  capabilities: DeviceCapabilities,
  usage: MapUsagePattern
): MapOptimizationStrategy => {
  const timeSinceLastUse = Date.now() - usage.lastMapInteraction;
  const isRecentUser = timeSinceLastUse < 24 * 60 * 60 * 1000; // 24 hours
  
  // Base strategy
  let strategy: MapOptimizationStrategy = {
    shouldPreload: false,
    shouldUseSimplifiedMarkers: false,
    maxMarkers: 100,
    enableClustering: true,
    tileQuality: 'medium',
    cacheStrategy: 'moderate'
  };

  // Adjust for device capabilities
  if (capabilities.isMobile) {
    strategy.maxMarkers = Math.min(strategy.maxMarkers, 50);
    strategy.shouldUseSimplifiedMarkers = true;
  }

  if (capabilities.isSlowConnection) {
    strategy.tileQuality = 'low';
    strategy.maxMarkers = Math.min(strategy.maxMarkers, 25);
    strategy.cacheStrategy = 'aggressive';
    strategy.shouldUseSimplifiedMarkers = true;
  }

  if (capabilities.hasLimitedMemory) {
    strategy.maxMarkers = Math.min(strategy.maxMarkers, 30);
    strategy.enableClustering = true;
    strategy.shouldUseSimplifiedMarkers = true;
  }

  // Adjust for usage patterns
  if (usage.frequentMapUser && isRecentUser) {
    strategy.shouldPreload = true;
    strategy.cacheStrategy = 'aggressive';
  }

  if (usage.totalMapInteractions > 10) {
    strategy.shouldPreload = true;
  }

  // High-end device optimizations
  if (!capabilities.isMobile && !capabilities.isSlowConnection && !capabilities.hasLimitedMemory) {
    strategy.maxMarkers = 200;
    strategy.tileQuality = 'high';
    strategy.shouldPreload = usage.hasUsedMaps;
  }

  return strategy;
};

export const useMapOptimizer = (mapType?: 'property' | 'properties' | 'container') => {
  const [capabilities] = useState<DeviceCapabilities>(() => detectDeviceCapabilities());
  const [usagePattern, setUsagePattern] = useState<MapUsagePattern>(() => loadUsagePattern());
  const [strategy, setStrategy] = useState<MapOptimizationStrategy>(() => 
    calculateOptimizationStrategy(capabilities, loadUsagePattern())
  );
  const [isOptimized, setIsOptimized] = useState(false);
  
  const { isLoaded, isLoading, loadLibraries } = useLeafletLoaded();
  const preloadTriggered = useRef(false);

  // Update strategy when usage pattern changes
  useEffect(() => {
    const newStrategy = calculateOptimizationStrategy(capabilities, usagePattern);
    setStrategy(newStrategy);
    
    // Save updated usage pattern
    saveUsagePattern(usagePattern);
  }, [capabilities, usagePattern]);

  // Handle preloading based on strategy
  useEffect(() => {
    if (strategy.shouldPreload && !preloadTriggered.current && !isLoaded && !isLoading) {
      preloadTriggered.current = true;
      console.log('🚀 Preloading Leaflet based on optimization strategy');
      preloadLeafletLibraries();
    }
  }, [strategy.shouldPreload, isLoaded, isLoading]);

  // Record map interaction
  const recordMapInteraction = useCallback((interactionType: 'view' | 'click' | 'zoom' | 'pan') => {
    setUsagePattern(prev => {
      const now = Date.now();
      const newPattern = {
        ...prev,
        hasUsedMaps: true,
        lastMapInteraction: now,
        totalMapInteractions: prev.totalMapInteractions + 1,
        preferredMapType: mapType || prev.preferredMapType,
        frequentMapUser: prev.totalMapInteractions > 5
      };
      
      console.log(`📊 Map interaction recorded: ${interactionType}`, newPattern);
      return newPattern;
    });
  }, [mapType]);

  // Get optimized map props
  const getOptimizedMapProps = useCallback(() => {
    const baseProps = {
      maxMarkers: strategy.maxMarkers,
      enableClustering: strategy.enableClustering,
      simplifiedMarkers: strategy.shouldUseSimplifiedMarkers,
      tileQuality: strategy.tileQuality,
      eagerLoad: strategy.shouldPreload
    };

    // Additional mobile optimizations
    if (capabilities.isMobile) {
      return {
        ...baseProps,
        zoomControl: false, // Save screen space
        attributionControl: false,
        preferCanvas: true, // Better mobile performance
        updateWhenZooming: false, // Reduce redraws
        updateWhenIdle: true
      };
    }

    // Desktop optimizations
    return {
      ...baseProps,
      preferCanvas: capabilities.supportsWebGL,
      updateWhenZooming: true,
      updateWhenIdle: false
    };
  }, [strategy, capabilities]);

  // Get cache configuration
  const getCacheConfig = useCallback(() => {
    const baseConfig = {
      maxZoom: strategy.tileQuality === 'high' ? 18 : strategy.tileQuality === 'medium' ? 16 : 14,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      maxSize: 50 * 1024 * 1024 // 50MB
    };

    switch (strategy.cacheStrategy) {
      case 'aggressive':
        return {
          ...baseConfig,
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          maxSize: 100 * 1024 * 1024, // 100MB
          preloadRadius: 2 // Preload tiles in 2-tile radius
        };
      case 'minimal':
        return {
          ...baseConfig,
          maxAge: 2 * 60 * 60 * 1000, // 2 hours
          maxSize: 10 * 1024 * 1024, // 10MB
          preloadRadius: 0
        };
      default:
        return {
          ...baseConfig,
          preloadRadius: 1
        };
    }
  }, [strategy]);

  // Smart loading function
  const loadMapLibraries = useCallback(async () => {
    if (isLoaded) return;

    // Record the interaction
    recordMapInteraction('view');

    // Load libraries if not already loading
    if (!isLoading) {
      await loadLibraries();
    }
  }, [isLoaded, isLoading, loadLibraries, recordMapInteraction]);

  // Performance monitoring
  const [performanceMetrics, setPerformanceMetrics] = useState({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    interactionLatency: 0
  });

  // Monitor performance
  useEffect(() => {
    if (isLoaded && !isOptimized) {
      const startTime = performance.now();
      
      // Measure render time
      requestAnimationFrame(() => {
        const renderTime = performance.now() - startTime;
        
        // Measure memory usage if available
        const memoryUsage = (performance as any).memory ? 
          (performance as any).memory.usedJSHeapSize : 0;
        
        setPerformanceMetrics(prev => ({
          ...prev,
          renderTime,
          memoryUsage
        }));
        
        setIsOptimized(true);
        console.log('📈 Map performance metrics:', { renderTime, memoryUsage });
      });
    }
  }, [isLoaded, isOptimized]);

  // Adaptive optimization based on performance
  useEffect(() => {
    if (performanceMetrics.renderTime > 1000) { // > 1 second render time
      console.warn('⚠️ Slow map rendering detected, applying additional optimizations');
      setStrategy(prev => ({
        ...prev,
        maxMarkers: Math.min(prev.maxMarkers, 25),
        shouldUseSimplifiedMarkers: true,
        tileQuality: 'low'
      }));
    }
  }, [performanceMetrics.renderTime]);

  return {
    // State
    isOptimized,
    capabilities,
    usagePattern,
    strategy,
    performanceMetrics,
    
    // Methods
    recordMapInteraction,
    loadMapLibraries,
    getOptimizedMapProps,
    getCacheConfig,
    
    // Library status
    isLoaded,
    isLoading
  };
};

// Hook for conditional map features
export const useConditionalMapFeatures = (mapType: 'property' | 'properties' | 'container') => {
  const { capabilities, strategy } = useMapOptimizer(mapType);
  
  const features = {
    // Core features always enabled
    basicMap: true,
    markers: true,
    
    // Conditional features based on device and performance
    clustering: strategy.enableClustering,
    routing: !capabilities.isMobile && !capabilities.isSlowConnection,
    directions: !capabilities.isMobile,
    streetView: !capabilities.isMobile && !capabilities.isSlowConnection,
    satellite: strategy.tileQuality === 'high',
    draw: !capabilities.isMobile,
    measurement: !capabilities.isMobile,
    fullscreen: true,
    
    // Admin features (more resource intensive)
    heatmaps: !capabilities.isMobile && !capabilities.hasLimitedMemory,
    analytics: !capabilities.isSlowConnection,
    export: true,
    
    // Advanced features for high-end devices
    animation: !capabilities.isMobile && strategy.tileQuality === 'high',
    transitions: !capabilities.isSlowConnection,
    clustering3D: false // Disabled for now, too experimental
  };
  
  return features;
};

export default useMapOptimizer; 