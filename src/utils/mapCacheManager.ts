import toast from 'react-hot-toast';

interface CacheInfo {
  tiles: {
    count: number;
    estimatedSize: number;
    maxTiles: number;
  };
  static: {
    count: number;
    estimatedSize: number;
  };
  config: {
    maxAge: number;
    maxTiles: number;
    maxSize: number;
  };
}

interface PreloadProgress {
  preloaded: number;
  total: number;
}

class MapCacheManager {
  private serviceWorker: ServiceWorker | null = null;
  private isRegistered = false;
  private listeners: Map<string, Set<Function>> = new Map();

  constructor() {
    this.initializeServiceWorker();
  }

  // Initialize service worker
  private async initializeServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw-map-cache.js', {
        scope: '/'
      });

      console.log('🚀 Map cache service worker registered:', registration);
      this.isRegistered = true;

      // Get the active service worker
      this.serviceWorker = registration.active || registration.waiting || registration.installing;

      // Listen for service worker updates
      registration.addEventListener('updatefound', () => {
        console.log('🔄 Map cache service worker updating...');
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'activated') {
              console.log('✅ Map cache service worker updated');
              this.serviceWorker = newWorker;
              this.emit('worker-updated', newWorker);
            }
          });
        }
      });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        this.handleServiceWorkerMessage(event.data);
      });

      // Get reference to the controlling service worker
      if (navigator.serviceWorker.controller) {
        this.serviceWorker = navigator.serviceWorker.controller;
      }

      this.emit('worker-ready', this.serviceWorker);
    } catch (error) {
      console.error('❌ Failed to register map cache service worker:', error);
    }
  }

  // Handle messages from service worker
  private handleServiceWorkerMessage(data: any) {
    switch (data.type) {
      case 'PRELOAD_PROGRESS':
        this.emit('preload-progress', data.progress);
        break;
      default:
        console.log('📨 Service worker message:', data);
    }
  }

  // Send message to service worker
  private async sendMessage(message: any): Promise<any> {
    if (!this.serviceWorker) {
      throw new Error('Service worker not available');
    }

    return new Promise((resolve, reject) => {
      const channel = new MessageChannel();
      
      channel.port1.onmessage = (event) => {
        if (event.data.error) {
          reject(new Error(event.data.error));
        } else {
          resolve(event.data);
        }
      };

      this.serviceWorker!.postMessage(message, [channel.port2]);
    });
  }

  // Event emitter methods
  private emit(event: string, data?: any) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(listener => listener(data));
    }
  }

  public on(event: string, listener: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
  }

  public off(event: string, listener: Function) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  // Public API methods

  // Check if service worker is ready
  public isReady(): boolean {
    return this.isRegistered && this.serviceWorker !== null;
  }

  // Get cache information
  public async getCacheInfo(): Promise<CacheInfo> {
    try {
      const info = await this.sendMessage({ type: 'GET_CACHE_INFO' });
      return info;
    } catch (error) {
      console.error('Failed to get cache info:', error);
      throw error;
    }
  }

  // Clear cache
  public async clearCache(type: 'tiles' | 'static' | 'all' = 'all'): Promise<void> {
    try {
      await this.sendMessage({ type: 'CLEAR_CACHE', payload: type });
      toast.success(`Cache cleared: ${type}`);
      this.emit('cache-cleared', type);
    } catch (error) {
      console.error('Failed to clear cache:', error);
      toast.error('Failed to clear cache');
      throw error;
    }
  }

  // Preload tiles for a specific area
  public async preloadTiles(bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }, zoomLevels: number[] = [10, 11, 12]): Promise<void> {
    try {
      console.log('🔄 Starting tile preload for bounds:', bounds);
      
      await this.sendMessage({
        type: 'PRELOAD_TILES',
        payload: { bounds, zoomLevels }
      });
      
      toast.success('Tile preloading started');
      this.emit('preload-started', { bounds, zoomLevels });
    } catch (error) {
      console.error('Failed to preload tiles:', error);
      toast.error('Failed to start tile preloading');
      throw error;
    }
  }

  // Preload tiles for current viewport
  public async preloadCurrentViewport(map: any, additionalZoomLevels: number = 2): Promise<void> {
    if (!map) {
      throw new Error('Map instance required');
    }

    const bounds = map.getBounds();
    const currentZoom = map.getZoom();
    
    const zoomLevels = [];
    for (let i = Math.max(1, currentZoom - 1); i <= Math.min(18, currentZoom + additionalZoomLevels); i++) {
      zoomLevels.push(i);
    }

    const boundsObj = {
      north: bounds.getNorth(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      west: bounds.getWest()
    };

    return this.preloadTiles(boundsObj, zoomLevels);
  }

  // Update cache configuration
  public async updateConfig(config: Partial<{
    maxAge: number;
    maxTiles: number;
    maxSize: number;
  }>): Promise<void> {
    try {
      await this.sendMessage({
        type: 'UPDATE_CONFIG',
        payload: config
      });
      
      toast.success('Cache configuration updated');
      this.emit('config-updated', config);
    } catch (error) {
      console.error('Failed to update cache config:', error);
      toast.error('Failed to update cache configuration');
      throw error;
    }
  }

  // Get cache statistics with human-readable sizes
  public async getCacheStatistics(): Promise<{
    tiles: { count: number; size: string; usage: string };
    static: { count: number; size: string };
    total: { size: string; usage: string };
  }> {
    const info = await this.getCacheInfo();
    
    const formatBytes = (bytes: number): string => {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const tilesSize = formatBytes(info.tiles.estimatedSize);
    const staticSize = formatBytes(info.static.estimatedSize);
    const totalSize = formatBytes(info.tiles.estimatedSize + info.static.estimatedSize);
    const maxSize = formatBytes(info.config.maxSize);
    
    const tilesUsage = `${info.tiles.count}/${info.tiles.maxTiles}`;
    const totalUsage = `${totalSize}/${maxSize}`;

    return {
      tiles: {
        count: info.tiles.count,
        size: tilesSize,
        usage: tilesUsage
      },
      static: {
        count: info.static.count,
        size: staticSize
      },
      total: {
        size: totalSize,
        usage: totalUsage
      }
    };
  }

  // Monitor cache performance
  public startPerformanceMonitoring() {
    const monitor = {
      cacheHits: 0,
      cacheMisses: 0,
      startTime: Date.now()
    };

    // Override fetch to monitor tile requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const request = args[0];
      const url = typeof request === 'string' ? request : (request as Request).url;
      
      // Check if it's a tile request
      const isTile = /tile\.openstreetmap\.org|basemaps\.cartocdn\.com/.test(url);
      
      if (isTile) {
        const start = performance.now();
        const response = await originalFetch(...args);
        const duration = performance.now() - start;
        
        // Estimate cache hit/miss based on response time
        if (duration < 50) { // Likely from cache
          monitor.cacheHits++;
        } else {
          monitor.cacheMisses++;
        }
        
        // Emit performance data periodically
        const total = monitor.cacheHits + monitor.cacheMisses;
        if (total > 0 && total % 10 === 0) {
          this.emit('performance-update', {
            cacheHitRate: (monitor.cacheHits / total) * 100,
            totalRequests: total,
            averageTime: duration
          });
        }
        
        return response;
      }
      
      return originalFetch(...args);
    };

    return monitor;
  }

  // Smart preloading based on user behavior
  public enableSmartPreloading(map: any, options: {
    preloadOnIdle?: boolean;
    preloadRadius?: number;
    maxPreloadZoom?: number;
  } = {}) {
    const {
      preloadOnIdle = true,
      // preloadRadius = 2, // tiles - commented out to avoid unused variable warning
      maxPreloadZoom = 15
    } = options;

    let idleTimer: NodeJS.Timeout;
    let lastBounds: any = null;

    const handleMapMove = () => {
      // Clear existing timer
      clearTimeout(idleTimer);
      
      if (preloadOnIdle) {
        idleTimer = setTimeout(async () => {
          const currentBounds = map.getBounds();
          const currentZoom = map.getZoom();
          
          // Only preload if bounds changed significantly or zoom is reasonable
          if (currentZoom <= maxPreloadZoom && 
              (!lastBounds || !currentBounds.equals(lastBounds))) {
            
            console.log('🎯 Smart preloading triggered');
            
            try {
              await this.preloadCurrentViewport(map, 1);
              lastBounds = currentBounds;
            } catch (error) {
              console.warn('Smart preload failed:', error);
            }
          }
        }, 2000); // 2 second delay
      }
    };

    // Attach listeners
    map.on('moveend', handleMapMove);
    map.on('zoomend', handleMapMove);

    // Return cleanup function
    return () => {
      clearTimeout(idleTimer);
      map.off('moveend', handleMapMove);
      map.off('zoomend', handleMapMove);
    };
  }
}

// Create singleton instance
const mapCacheManager = new MapCacheManager();

export default mapCacheManager;
export { MapCacheManager };
export type { CacheInfo, PreloadProgress }; 