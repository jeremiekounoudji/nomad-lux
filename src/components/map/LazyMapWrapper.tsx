import React, { Suspense, lazy, useState, useEffect, useCallback } from 'react';
import MapLoadingState from './MapLoadingState';
import { MapErrorState } from './MapLoadingStates';
import type { MapContainerProps, PropertyMapProps, PropertiesMapProps } from '../../interfaces/Map';

// Dynamic import types for Leaflet
type LeafletModule = typeof import('leaflet');
type ReactLeafletModule = typeof import('react-leaflet');

interface LeafletLibraries {
  leaflet: LeafletModule;
  reactLeaflet: ReactLeafletModule;
  markerCluster?: any;
  routingMachine?: any;
}

// Global cache for loaded libraries
let leafletLibrariesCache: LeafletLibraries | null = null;
let leafletLoadPromise: Promise<LeafletLibraries> | null = null;

// Lazy load the map components to improve initial bundle size
const LazyMapContainer = lazy(() => 
  loadLeafletLibraries().then(() => import('./MapContainer'))
);
const LazyPropertyMap = lazy(() => 
  loadLeafletLibraries().then(() => import('./PropertyMap'))
);
const LazyPropertiesMap = lazy(() => 
  loadLeafletLibraries().then(() => import('./PropertiesMap'))
);

// Dynamic Leaflet library loader
async function loadLeafletLibraries(): Promise<LeafletLibraries> {
  // Return cached libraries if already loaded
  if (leafletLibrariesCache) {
    return leafletLibrariesCache;
  }

  // Return existing promise if loading is in progress
  if (leafletLoadPromise) {
    return leafletLoadPromise;
  }

  console.log('🚀 Loading Leaflet libraries dynamically...');
  
  leafletLoadPromise = (async () => {
    try {
      // Load core Leaflet and React-Leaflet libraries in parallel
      const [leafletModule, reactLeafletModule] = await Promise.all([
        import('leaflet'),
        import('react-leaflet')
      ]);

      // Load optional plugins
      const pluginPromises = [];
      
      // Load marker clustering plugin if needed
      pluginPromises.push(
        import('leaflet.markercluster').catch(err => {
          console.warn('Failed to load marker cluster plugin:', err);
          return null;
        })
      );

      // Load routing machine plugin if needed
      pluginPromises.push(
        import('leaflet-routing-machine').catch(err => {
          console.warn('Failed to load routing machine plugin:', err);
          return null;
        })
      );

      const [markerCluster, routingMachine] = await Promise.all(pluginPromises);

      // Initialize Leaflet icon fix for webpack/vite
      const L = leafletModule.default || leafletModule;
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });

      const libraries: LeafletLibraries = {
        leaflet: leafletModule,
        reactLeaflet: reactLeafletModule,
        markerCluster: markerCluster?.default || markerCluster,
        routingMachine: routingMachine?.default || routingMachine
      };

      leafletLibrariesCache = libraries;
      console.log('✅ Leaflet libraries loaded successfully');
      
      return libraries;
    } catch (error) {
      console.error('❌ Failed to load Leaflet libraries:', error);
      leafletLoadPromise = null; // Reset promise to allow retry
      throw error;
    }
  })();

  return leafletLoadPromise;
}

// Preload function for eager loading
export const preloadLeafletLibraries = () => {
  if (!leafletLibrariesCache && !leafletLoadPromise) {
    loadLeafletLibraries().catch(console.error);
  }
};

// Hook to check if Leaflet is loaded
export const useLeafletLoaded = () => {
  const [isLoaded, setIsLoaded] = useState(!!leafletLibrariesCache);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadLibraries = useCallback(async () => {
    if (leafletLibrariesCache) {
      setIsLoaded(true);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await loadLeafletLibraries();
      setIsLoaded(true);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load Leaflet'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isLoaded, isLoading, error, loadLibraries };
};

interface BaseLazyMapWrapperProps {
  /**
   * Loading component to show while map is loading
   */
  loadingComponent?: React.ComponentType;
  
  /**
   * Custom error boundary
   */
  errorComponent?: React.ComponentType<{ error: Error; retry: () => void }>;
  
  /**
   * Preload the map component on hover/focus
   */
  preloadOnHover?: boolean;
  
  /**
   * Delay before showing loading state (prevents flash)
   */
  loadingDelay?: number;

  /**
   * Enable eager loading of Leaflet libraries
   */
  eagerLoad?: boolean;

  /**
   * Loading progress callback
   */
  onLoadingProgress?: (progress: { loaded: string[]; total: number; current: string }) => void;
}

type LazyMapWrapperProps = 
  | (BaseLazyMapWrapperProps & MapContainerProps & { type?: 'container' })
  | (BaseLazyMapWrapperProps & PropertyMapProps & { type: 'property' })
  | (BaseLazyMapWrapperProps & PropertiesMapProps & { type: 'properties' });

class MapErrorBoundary extends React.Component<
  { 
    children: React.ReactNode; 
    onError?: (error: Error) => void;
    errorComponent?: React.ComponentType<{ error: Error; retry: () => void }>;
  },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Map component error:', error, errorInfo);
    this.props.onError?.(error);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    // Clear library cache to force reload
    leafletLibrariesCache = null;
    leafletLoadPromise = null;
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const ErrorComponent = this.props.errorComponent || MapErrorState;
      return <ErrorComponent error={this.state.error} retry={this.handleRetry} />;
    }

    return this.props.children;
  }
}

// Enhanced loading component with progress
const EnhancedLoadingComponent: React.FC<{ 
  originalComponent: React.ComponentType; 
  progress?: { loaded: string[]; total: number; current: string };
  loadingMessage?: string;
}> = ({ 
  originalComponent: OriginalComponent, 
  progress,
  loadingMessage = "Loading map..."
}) => {
  return (
    <div className="relative w-full h-full">
      <OriginalComponent />
      
      {/* Loading Progress Overlay */}
      {progress && (
        <div className="absolute inset-0 bg-white/90 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-3"></div>
            <p className="text-sm text-gray-600 mb-2">{loadingMessage}</p>
            <p className="text-xs text-gray-500">
              Loading {progress.current}... ({progress.loaded.length}/{progress.total})
            </p>
            <div className="w-48 bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(progress.loaded.length / progress.total) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const LazyMapWrapper: React.FC<LazyMapWrapperProps> = ({
  type = 'container',
  loadingComponent: LoadingComponent = MapLoadingState,
  errorComponent,
  preloadOnHover = true,
  loadingDelay = 200,
  eagerLoad = false,
  onLoadingProgress,
  onError,
  ...mapProps
}) => {
  const [isPreloaded, setIsPreloaded] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState<{ loaded: string[]; total: number; current: string } | null>(null);

  // Eager loading on mount if requested
  useEffect(() => {
    if (eagerLoad) {
      preloadLeafletLibraries();
    }
  }, [eagerLoad]);

  // Preload map component on hover/focus for better UX
  const handlePreload = useCallback(() => {
    if (!isPreloaded && preloadOnHover) {
      setIsPreloaded(true);
      
      // Set up progress tracking
      const progressData = {
        loaded: [] as string[],
        total: 4, // leaflet, react-leaflet, markerCluster, routingMachine
        current: 'Leaflet core'
      };
      
      setLoadingProgress(progressData);
      onLoadingProgress?.(progressData);

      // Trigger lazy loading by importing the component
      loadLeafletLibraries()
        .then(() => {
          // Update progress as libraries load
          const finalProgress = {
            loaded: ['leaflet', 'react-leaflet', 'plugins', 'component'],
            total: 4,
            current: 'Complete'
          };
          setLoadingProgress(finalProgress);
          onLoadingProgress?.(finalProgress);
          
          // Clear progress after a short delay
          setTimeout(() => {
            setLoadingProgress(null);
          }, 500);
        })
        .catch(console.error);
    }
  }, [isPreloaded, preloadOnHover, onLoadingProgress]);

  // Delayed loading state to prevent flash
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(true);
    }, loadingDelay);

    return () => clearTimeout(timer);
  }, [loadingDelay]);

  // Select the appropriate lazy component
  const getMapComponent = () => {
    switch (type) {
      case 'property':
        return LazyPropertyMap;
      case 'properties':
        return LazyPropertiesMap;
      default:
        return LazyMapContainer;
    }
  };

  const MapComponent = getMapComponent();

  return (
    <div
      onMouseEnter={handlePreload}
      onFocus={handlePreload}
      className="relative w-full h-full"
    >
      <MapErrorBoundary 
        onError={onError}
        errorComponent={errorComponent}
      >
        <Suspense
          fallback={
            showLoading ? (
              <EnhancedLoadingComponent 
                originalComponent={LoadingComponent}
                progress={loadingProgress}
                loadingMessage="Loading map libraries..."
              />
            ) : (
              <div className="w-full h-full bg-gray-100 animate-pulse rounded-lg" />
            )
          }
        >
          <MapComponent {...mapProps} />
        </Suspense>
      </MapErrorBoundary>
    </div>
  );
};

// Performance monitoring hook
export const useMapPerformance = () => {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    bundleSize: 0,
    isLeafletLoaded: !!leafletLibrariesCache
  });

  useEffect(() => {
    const startTime = performance.now();
    
    if (!leafletLibrariesCache) {
      loadLeafletLibraries()
        .then(() => {
          const loadTime = performance.now() - startTime;
          setMetrics(prev => ({
            ...prev,
            loadTime,
            isLeafletLoaded: true
          }));
        })
        .catch(console.error);
    }
  }, []);

  return metrics;
};

export default LazyMapWrapper; 