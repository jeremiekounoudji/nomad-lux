import { useState, useEffect, useCallback } from 'react';

export interface ResponsiveMapOptions {
  enableMobileOptimization?: boolean;
  mobileBreakpoint?: number;
  touchZoomThreshold?: number;
  doubleTapDelay?: number;
}

export interface ResponsiveMapState {
  isMobile: boolean;
  isTablet: boolean;
  screenWidth: number;
  screenHeight: number;
  orientation: 'portrait' | 'landscape';
  touchSupported: boolean;
  devicePixelRatio: number;
}

export interface UseResponsiveMapReturn {
  mapState: ResponsiveMapState;
  mapOptions: {
    scrollWheelZoom: boolean;
    doubleClickZoom: boolean;
    touchZoom: boolean;
    dragging: boolean;
    zoomControl: boolean;
    attributionControl: boolean;
  };
  getResponsiveHeight: () => string;
  handleMobileInteraction: (event: React.TouchEvent) => void;
  isLandscapeMode: boolean;
}

export const useResponsiveMap = (options: ResponsiveMapOptions = {}): UseResponsiveMapReturn => {
  const {
    enableMobileOptimization = true,
    mobileBreakpoint = 768,
    touchZoomThreshold = 2,
    doubleTapDelay = 300,
  } = options;

  const [mapState, setMapState] = useState<ResponsiveMapState>({
    isMobile: false,
    isTablet: false,
    screenWidth: 0,
    screenHeight: 0,
    orientation: 'portrait',
    touchSupported: false,
    devicePixelRatio: 1,
  });

  // Last touch time for double-tap detection
  const [lastTouchTime, setLastTouchTime] = useState(0);
  // const [touchCount, setTouchCount] = useState(0) // Unused state
  // const setTouchCount = (/* _: number */) => {} // Placeholder function

  // Update screen dimensions and device info
  const updateMapState = useCallback(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isMobile = width < mobileBreakpoint;
    const isTablet = width >= mobileBreakpoint && width < 1024;
    const touchSupported = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const devicePixelRatio = window.devicePixelRatio || 1;
    const orientation = width > height ? 'landscape' : 'portrait';

    setMapState({
      isMobile,
      isTablet,
      screenWidth: width,
      screenHeight: height,
      orientation,
      touchSupported,
      devicePixelRatio,
    });

    console.log('📱 Map state updated:', {
      isMobile,
      isTablet,
      width,
      height,
      orientation,
      touchSupported,
    });
  }, [mobileBreakpoint]);

  // Handle window resize and orientation changes
  useEffect(() => {
    updateMapState();

    const handleResize = () => {
      updateMapState();
    };

    const handleOrientationChange = () => {
      // Delay to allow for proper orientation change
      setTimeout(updateMapState, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    // Listen for device pixel ratio changes (zoom)
    const mediaQuery = window.matchMedia('(resolution: 1dppx)');
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', updateMapState);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', updateMapState);
      }
    };
  }, [updateMapState]);

  // Generate responsive map options based on device
  const mapOptions = {
    scrollWheelZoom: !mapState.isMobile, // Disable scroll zoom on mobile to prevent accidental zooming
    doubleClickZoom: true,
    touchZoom: mapState.touchSupported,
    dragging: true,
    zoomControl: true,
    attributionControl: !mapState.isMobile || mapState.screenWidth > 480, // Hide attribution on very small screens
  };

  // Calculate responsive height based on screen size and orientation
  const getResponsiveHeight = useCallback((): string => {
    const { isMobile, isTablet, screenHeight, orientation } = mapState;

    if (isMobile) {
      if (orientation === 'landscape') {
        return '70vh'; // More height in landscape mode
      } else {
        return screenHeight < 600 ? '50vh' : '60vh'; // Adaptive height for small screens
      }
    } else if (isTablet) {
      return '450px';
    } else {
      return '400px'; // Desktop default
    }
  }, [mapState]);

  // Handle mobile-specific touch interactions
  const handleMobileInteraction = useCallback(
    (event: React.TouchEvent) => {
      if (!enableMobileOptimization || !mapState.touchSupported) return;

      const currentTime = Date.now();
      const touches = event.touches.length;

      // Handle multi-touch for zooming
      if (touches >= touchZoomThreshold) {
        console.log('🔍 Multi-touch zoom detected:', touches);
        // setTouchCount(touches) // Commented out as setTouchCount is placeholder
      }

      // Handle double-tap detection
      if (touches === 1) {
        const timeDiff = currentTime - lastTouchTime;
        if (timeDiff < doubleTapDelay) {
          console.log('👆 Double-tap detected');
          // Handle double-tap zoom or other interactions
          event.preventDefault();
        }
        setLastTouchTime(currentTime);
      }

      // Reset touch count when no touches
      if (touches === 0) {
        // setTouchCount(0) // Commented out as setTouchCount is placeholder
      }
    },
    [
      enableMobileOptimization,
      mapState.touchSupported,
      touchZoomThreshold,
      doubleTapDelay,
      lastTouchTime,
    ]
  );

  const isLandscapeMode = mapState.orientation === 'landscape';

  return {
    mapState,
    mapOptions,
    getResponsiveHeight,
    handleMobileInteraction,
    isLandscapeMode,
  };
};
