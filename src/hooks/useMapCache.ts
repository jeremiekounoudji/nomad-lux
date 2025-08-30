import { useState, useEffect, useCallback, useRef } from 'react';
import mapCacheManager, { CacheInfo, PreloadProgress } from '../utils/mapCacheManager';

interface CacheStrategy {
  preloadOnMount: boolean;
  preloadOnHover: boolean;
  smartPreloading: boolean;
  autoCleanup: boolean;
  maxCacheAge: number; // days
  maxCacheSize: number; // MB
  preloadRadius: number; // zoom levels
}

interface CacheMetrics {
  hitRate: number;
  totalRequests: number;
  cacheSize: string;
  tileCount: number;
  lastCleanup: Date | null;
}

interface UseMapCacheOptions {
  strategy?: Partial<CacheStrategy>;
  mapType?: 'property' | 'properties' | 'container';
  enableMetrics?: boolean;
  autoOptimize?: boolean;
}

interface UseMapCacheReturn {
  // State
  isReady: boolean;
  isPreloading: boolean;
  preloadProgress: PreloadProgress | null;
  cacheMetrics: CacheMetrics;
  cacheInfo: CacheInfo | null;
  
  // Actions
  preloadArea: (bounds: any, zoomLevels?: number[]) => Promise<void>;
  preloadCurrentView: (map: any) => Promise<void>;
  clearCache: (type?: 'tiles' | 'static' | 'all') => Promise<void>;
  optimizeCache: () => Promise<void>;
  
  // Smart features
  enableSmartPreloading: (map: any) => () => void;
  startPerformanceMonitoring: () => void;
}

const defaultStrategy: CacheStrategy = {
  preloadOnMount: false,
  preloadOnHover: true,
  smartPreloading: true,
  autoCleanup: true,
  maxCacheAge: 7, // days
  maxCacheSize: 100, // MB
  preloadRadius: 2 // zoom levels
};

export const useMapCache = (options: UseMapCacheOptions = {}): UseMapCacheReturn => {
  const {
    strategy: userStrategy = {},
    // mapType = 'container', // Unused parameter
    enableMetrics = true,
    autoOptimize = true
  } = options;

  const strategy = { ...defaultStrategy, ...userStrategy };

  // State
  const [isReady, setIsReady] = useState(false);
  const [isPreloading, setIsPreloading] = useState(false);
  const [preloadProgress, setPreloadProgress] = useState<PreloadProgress | null>(null);
  const [cacheInfo, setCacheInfo] = useState<CacheInfo | null>(null);
  const [cacheMetrics, setCacheMetrics] = useState<CacheMetrics>({
    hitRate: 0,
    totalRequests: 0,
    cacheSize: '0 B',
    tileCount: 0,
    lastCleanup: null
  });

  // Refs
  const smartPreloadCleanup = useRef<(() => void) | null>(null);
  const performanceMonitor = useRef<any>(null);
  const cleanupInterval = useRef<NodeJS.Timeout | null>(null);

  // Initialize cache manager
  useEffect(() => {
    const handleWorkerReady = () => {
      console.log('🚀 Map cache worker ready');
      setIsReady(true);
      updateCacheInfo();
    };

    const handlePreloadProgress = (progress: PreloadProgress) => {
      setPreloadProgress(progress);
      
      if (progress.preloaded >= progress.total) {
        setIsPreloading(false);
        setPreloadProgress(null);
      }
    };

    const handlePerformanceUpdate = (metrics: any) => {
      setCacheMetrics(prev => ({
        ...prev,
        hitRate: metrics.cacheHitRate,
        totalRequests: metrics.totalRequests
      }));
    };

    // Set up event listeners
    mapCacheManager.on('worker-ready', handleWorkerReady);
    mapCacheManager.on('preload-progress', handlePreloadProgress);
    mapCacheManager.on('performance-update', handlePerformanceUpdate);

    // Check if already ready
    if (mapCacheManager.isReady()) {
      handleWorkerReady();
    }

    return () => {
      mapCacheManager.off('worker-ready', handleWorkerReady);
      mapCacheManager.off('preload-progress', handlePreloadProgress);
      mapCacheManager.off('performance-update', handlePerformanceUpdate);
    };
  }, []);

  // Set up automatic cleanup
  useEffect(() => {
    if (strategy.autoCleanup && isReady) {
      // Run cleanup every 6 hours
      cleanupInterval.current = setInterval(() => {
        performAutoCleanup();
      }, 6 * 60 * 60 * 1000);

      return () => {
        if (cleanupInterval.current) {
          clearInterval(cleanupInterval.current);
        }
      };
    }
  }, [strategy.autoCleanup, isReady]);

  // Performance monitoring
  useEffect(() => {
    if (enableMetrics && isReady && !performanceMonitor.current) {
      performanceMonitor.current = mapCacheManager.startPerformanceMonitoring();
    }
  }, [enableMetrics, isReady]);

  // Update cache info periodically
  const updateCacheInfo = useCallback(async () => {
    if (!isReady) return;

    try {
      const [info, stats] = await Promise.all([
        mapCacheManager.getCacheInfo(),
        mapCacheManager.getCacheStatistics()
      ]);

      setCacheInfo(info);
      setCacheMetrics(prev => ({
        ...prev,
        cacheSize: stats.total.size,
        tileCount: stats.tiles.count
      }));
    } catch (error) {
      console.warn('Failed to update cache info:', error);
    }
  }, [isReady]);

  // Auto-optimize cache based on usage
  const performAutoOptimization = useCallback(async () => {
    if (!autoOptimize || !cacheInfo) return;

    const config = cacheInfo.config;
    const tiles = cacheInfo.tiles;

    // Adjust max tiles based on usage
    let newMaxTiles = config.maxTiles;
    
    if (tiles.count > config.maxTiles * 0.9) {
      // Increase limit if frequently hitting max
      newMaxTiles = Math.min(config.maxTiles * 1.2, 2000);
    } else if (tiles.count < config.maxTiles * 0.3) {
      // Decrease limit if underutilized
      newMaxTiles = Math.max(config.maxTiles * 0.8, 500);
    }

    // Adjust cache age based on hit rate
    let newMaxAge = config.maxAge;
    if (cacheMetrics.hitRate > 80) {
      // High hit rate, keep tiles longer
      newMaxAge = Math.min(config.maxAge * 1.5, 14 * 24 * 60 * 60 * 1000);
    } else if (cacheMetrics.hitRate < 40) {
      // Low hit rate, expire tiles sooner
      newMaxAge = Math.max(config.maxAge * 0.7, 2 * 24 * 60 * 60 * 1000);
    }

    // Apply optimizations if significant changes
    if (Math.abs(newMaxTiles - config.maxTiles) > 50 || 
        Math.abs(newMaxAge - config.maxAge) > 24 * 60 * 60 * 1000) {
      
      console.log('🎯 Auto-optimizing cache configuration');
      await mapCacheManager.updateConfig({
        maxTiles: Math.round(newMaxTiles),
        maxAge: Math.round(newMaxAge)
      });
      
      updateCacheInfo();
    }
  }, [autoOptimize, cacheInfo, cacheMetrics]);

  // Automatic cleanup based on strategy
  const performAutoCleanup = useCallback(async () => {
    if (!isReady || !cacheInfo) return;

    // const now = Date.now(); // Unused variable
    // const maxAge = strategy.maxCacheAge * 24 * 60 * 60 * 1000; // Unused variable
    const maxSize = strategy.maxCacheSize * 1024 * 1024;

    // Check if cleanup is needed
    const needsCleanup = 
      cacheInfo.tiles.estimatedSize > maxSize ||
      cacheInfo.tiles.count > strategy.maxCacheAge * 100; // Rough estimate

    if (needsCleanup) {
      console.log('🧹 Performing automatic cache cleanup');
      
      // Clear old tiles
      await mapCacheManager.clearCache('tiles');
      
      setCacheMetrics(prev => ({
        ...prev,
        lastCleanup: new Date()
      }));
      
      updateCacheInfo();
    }
  }, [isReady, cacheInfo, strategy]);

  // Public methods
  const preloadArea = useCallback(async (bounds: any, zoomLevels?: number[]) => {
    if (!isReady) throw new Error('Cache manager not ready');
    
    setIsPreloading(true);
    try {
      await mapCacheManager.preloadTiles(bounds, zoomLevels);
    } catch (error) {
      setIsPreloading(false);
      throw error;
    }
  }, [isReady]);

  const preloadCurrentView = useCallback(async (map: any) => {
    if (!isReady || !map) throw new Error('Cache manager or map not ready');
    
    setIsPreloading(true);
    try {
      await mapCacheManager.preloadCurrentViewport(map, strategy.preloadRadius);
    } catch (error) {
      setIsPreloading(false);
      throw error;
    }
  }, [isReady, strategy.preloadRadius]);

  const clearCache = useCallback(async (type: 'tiles' | 'static' | 'all' = 'all') => {
    if (!isReady) throw new Error('Cache manager not ready');
    
    await mapCacheManager.clearCache(type);
    updateCacheInfo();
  }, [isReady, updateCacheInfo]);

  const optimizeCache = useCallback(async () => {
    if (!isReady) throw new Error('Cache manager not ready');
    
    console.log('🔧 Manual cache optimization triggered');
    await performAutoOptimization();
    await performAutoCleanup();
  }, [isReady, performAutoOptimization, performAutoCleanup]);

  const enableSmartPreloading = useCallback((map: any) => {
    if (!isReady || !map) {
      console.warn('Cannot enable smart preloading: cache manager or map not ready');
      return () => {};
    }

    // Clean up existing smart preloading
    if (smartPreloadCleanup.current) {
      smartPreloadCleanup.current();
    }

    console.log('🧠 Enabling smart preloading');
    
    smartPreloadCleanup.current = mapCacheManager.enableSmartPreloading(map, {
      preloadOnIdle: strategy.smartPreloading,
      preloadRadius: strategy.preloadRadius,
      maxPreloadZoom: 15
    });

    return smartPreloadCleanup.current;
  }, [isReady, strategy.smartPreloading, strategy.preloadRadius]);

  const startPerformanceMonitoring = useCallback(() => {
    if (!enableMetrics || performanceMonitor.current) return;
    
    console.log('📊 Starting cache performance monitoring');
    performanceMonitor.current = mapCacheManager.startPerformanceMonitoring();
  }, [enableMetrics]);

  // Run periodic optimizations
  useEffect(() => {
    if (autoOptimize && isReady) {
      const interval = setInterval(() => {
        performAutoOptimization();
      }, 30 * 60 * 1000); // Every 30 minutes

      return () => clearInterval(interval);
    }
  }, [autoOptimize, isReady, performAutoOptimization]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (smartPreloadCleanup.current) {
        smartPreloadCleanup.current();
      }
      if (cleanupInterval.current) {
        clearInterval(cleanupInterval.current);
      }
    };
  }, []);

  return {
    // State
    isReady,
    isPreloading,
    preloadProgress,
    cacheMetrics,
    cacheInfo,
    
    // Actions
    preloadArea,
    preloadCurrentView,
    clearCache,
    optimizeCache,
    
    // Smart features
    enableSmartPreloading,
    startPerformanceMonitoring
  };
};

// Specialized hooks for different map types
export const usePropertyMapCache = (options: Omit<UseMapCacheOptions, 'mapType'> = {}) => {
  return useMapCache({ ...options, mapType: 'property' });
};

export const usePropertiesMapCache = (options: Omit<UseMapCacheOptions, 'mapType'> = {}) => {
  return useMapCache({ 
    ...options, 
    mapType: 'properties',
    strategy: {
      preloadOnMount: true,
      smartPreloading: true,
      autoCleanup: true,
      maxCacheSize: 150, // Larger cache for properties view
      preloadRadius: 3,
      ...options.strategy
    }
  });
};

// Cache configuration hook for admin users
export const useMapCacheAdmin = () => {
  const [cacheInfo, setCacheInfo] = useState<CacheInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshCacheInfo = useCallback(async () => {
    setIsLoading(true);
    try {
      const info = await mapCacheManager.getCacheInfo();
      setCacheInfo(info);
    } catch (error) {
      console.error('Failed to get cache info:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateCacheConfig = useCallback(async (config: any) => {
    setIsLoading(true);
    try {
      await mapCacheManager.updateConfig(config);
      await refreshCacheInfo();
    } catch (error) {
      console.error('Failed to update cache config:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [refreshCacheInfo]);

  useEffect(() => {
    refreshCacheInfo();
  }, [refreshCacheInfo]);

  return {
    cacheInfo,
    isLoading,
    refreshCacheInfo,
    updateCacheConfig,
    clearCache: mapCacheManager.clearCache.bind(mapCacheManager)
  };
};

export default useMapCache; 