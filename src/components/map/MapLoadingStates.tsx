import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardBody, 
  Button, 
  Progress, 
  Chip,
  Spinner
} from '@heroui/react';
import { 
  MapPin, 
  AlertTriangle, 
  RefreshCw, 
  Wifi, 
  WifiOff,
  Download,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface LoadingProgress {
  loaded: string[];
  total: number;
  current: string;
}

interface MapLoadingStateProps {
  progress?: LoadingProgress;
  loadingMessage?: string;
  showProgress?: boolean;
  className?: string;
}

interface MapErrorStateProps {
  error: Error;
  retry: () => void;
  canRetry?: boolean;
  errorType?: 'network' | 'import' | 'render' | 'unknown';
  className?: string;
}

interface ConnectionStatusProps {
  isOnline: boolean;
  connectionType?: string;
  effectiveType?: string;
}

// Enhanced loading skeleton with animations
export const MapLoadingSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative size-full overflow-hidden rounded-lg bg-gray-100 ${className}`}>
      {/* Animated background */}
      <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100" />
      
      {/* Map markers simulation */}
      <div className="absolute inset-0 p-4">
        <div className="flex h-full items-center justify-center">
          <div className="space-y-4 text-center">
            <div className="flex items-center justify-center space-x-2">
              <div className="size-3 animate-bounce rounded-full bg-blue-400" />
              <div className="size-3 animate-bounce rounded-full bg-green-400" style={{ animationDelay: '0.1s' }} />
              <div className="size-3 animate-bounce rounded-full bg-yellow-400" style={{ animationDelay: '0.2s' }} />
            </div>
            <div className="mx-auto h-4 w-32 animate-pulse rounded bg-gray-300" />
            <div className="mx-auto h-3 w-24 animate-pulse rounded bg-gray-300" />
          </div>
        </div>
      </div>
      
      {/* Corner indicators */}
      <div className="absolute left-4 top-4">
        <div className="size-8 animate-pulse rounded bg-gray-300" />
      </div>
      <div className="absolute right-4 top-4">
        <div className="h-6 w-16 animate-pulse rounded bg-gray-300" />
      </div>
      <div className="absolute bottom-4 right-4">
        <div className="h-8 w-12 animate-pulse rounded bg-gray-300" />
      </div>
    </div>
  );
};

// Connection status indicator
const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ 
  isOnline, 
  connectionType, 
  effectiveType 
}) => {
  const getConnectionIcon = () => {
    if (!isOnline) return <WifiOff className="size-4 text-red-500" />;
    if (effectiveType && ['slow-2g', '2g'].includes(effectiveType)) {
      return <Wifi className="size-4 text-yellow-500" />;
    }
    return <Wifi className="size-4 text-green-500" />;
  };

  const getConnectionLabel = () => {
    if (!isOnline) return 'Offline';
    if (effectiveType) {
      return effectiveType.toUpperCase();
    }
    return connectionType || 'Online';
  };

  return (
    <Chip
      size="sm"
      variant="flat"
      startContent={getConnectionIcon()}
      color={!isOnline ? 'danger' : effectiveType && ['slow-2g', '2g'].includes(effectiveType) ? 'warning' : 'success'}
    >
      {getConnectionLabel()}
    </Chip>
  );
};

// Progressive loading states
export const MapProgressiveLoading: React.FC<MapLoadingStateProps> = ({
  progress,
  loadingMessage = "Loading map...",
  showProgress = true,
  className = ''
}) => {
  const [connectionInfo, setConnectionInfo] = useState({
    isOnline: navigator.onLine,
    connectionType: '',
    effectiveType: ''
  });

  useEffect(() => {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    if (connection) {
      setConnectionInfo(prev => ({
        ...prev,
        connectionType: connection.type || '',
        effectiveType: connection.effectiveType || ''
      }));
    }

    const handleOnline = () => setConnectionInfo(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setConnectionInfo(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const progressPercentage = progress ? (progress.loaded.length / progress.total) * 100 : 0;

  return (
    <div className={`relative size-full ${className}`}>
      <MapLoadingSkeleton />
      
      {/* Loading overlay */}
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/90">
        <Card className="mx-4 w-80 max-w-full">
          <CardBody className="p-6 text-center">
            {/* Header */}
            <div className="mb-4 flex items-center justify-center gap-3">
              <div className="relative">
                <MapPin className="size-8 text-primary-500" />
                <div className="absolute -right-1 -top-1">
                  <Spinner size="sm" color="primary" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {loadingMessage}
                </h3>
                <div className="mt-1 flex items-center gap-2">
                  <ConnectionStatus {...connectionInfo} />
                  <Chip size="sm" variant="dot" color="primary">
                    Loading
                  </Chip>
                </div>
              </div>
            </div>

            {/* Progress section */}
            {showProgress && progress && (
              <div className="space-y-3">
                <div className="text-sm text-gray-600">
                  Loading {progress.current}...
                </div>
                
                <Progress 
                  value={progressPercentage} 
                  color="primary"
                  className="max-w-md"
                  showValueLabel
                />
                
                <div className="text-xs text-gray-500">
                  {progress.loaded.length} of {progress.total} components loaded
                </div>

                {/* Loaded components list */}
                <div className="flex flex-wrap justify-center gap-1">
                  {progress.loaded.map((item, index) => (
                    <Chip
                      key={index}
                      size="sm"
                      color="success"
                      variant="flat"
                      startContent={<CheckCircle className="size-3" />}
                    >
                      {item}
                    </Chip>
                  ))}
                </div>
              </div>
            )}

            {/* Tips for slow connections */}
            {connectionInfo.effectiveType && ['slow-2g', '2g'].includes(connectionInfo.effectiveType) && (
              <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                <div className="flex items-center gap-2 text-yellow-800">
                  <Clock className="size-4" />
                  <span className="text-sm">
                    Slow connection detected. Map features may be limited.
                  </span>
                </div>
              </div>
            )}

            {/* Offline indicator */}
            {!connectionInfo.isOnline && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
                <div className="flex items-center gap-2 text-red-800">
                  <WifiOff className="size-4" />
                  <span className="text-sm">
                    You're offline. Map will load when connection is restored.
                  </span>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

// Enhanced error states with detailed feedback
export const MapEnhancedErrorState: React.FC<MapErrorStateProps> = ({
  error,
  retry,
  canRetry = true,
  errorType = 'unknown',
  className = ''
}) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const handleRetry = async () => {
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);
    
    try {
      await retry();
    } catch (retryError) {
      console.error('Retry failed:', retryError);
    } finally {
      setTimeout(() => setIsRetrying(false), 1000);
    }
  };

  const getErrorDetails = () => {
    switch (errorType) {
      case 'network':
        return {
          title: 'Network Connection Error',
          description: 'Unable to load map data. Please check your internet connection.',
          icon: <WifiOff className="size-12 text-red-500" />,
          suggestions: [
            'Check your internet connection',
            'Try refreshing the page',
            'Contact support if the problem persists'
          ]
        };
      case 'import':
        return {
          title: 'Map Component Load Error',
          description: 'Failed to load map components. This might be a temporary issue.',
          icon: <Download className="size-12 text-red-500" />,
          suggestions: [
            'Try reloading the page',
            'Clear your browser cache',
            'Update your browser to the latest version'
          ]
        };
      case 'render':
        return {
          title: 'Map Rendering Error',
          description: 'The map component failed to render properly.',
          icon: <AlertTriangle className="size-12 text-red-500" />,
          suggestions: [
            'Your device might not support this map feature',
            'Try using a different browser',
            'Check if hardware acceleration is enabled'
          ]
        };
      default:
        return {
          title: 'Map Error',
          description: 'An unexpected error occurred while loading the map.',
          icon: <XCircle className="size-12 text-red-500" />,
          suggestions: [
            'Try refreshing the page',
            'Check browser console for more details',
            'Contact support with error details'
          ]
        };
    }
  };

  const errorDetails = getErrorDetails();

  return (
    <div className={`flex size-full items-center justify-center bg-gray-50 ${className}`}>
      <Card className="mx-4 w-96 max-w-full">
        <CardBody className="p-6 text-center">
          {/* Error icon and title */}
          <div className="mb-4 flex flex-col items-center">
            {errorDetails.icon}
            <h3 className="mt-3 text-xl font-semibold text-gray-900">
              {errorDetails.title}
            </h3>
            <p className="mt-2 text-gray-600">
              {errorDetails.description}
            </p>
          </div>

          {/* Error details */}
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
            <div className="text-sm text-red-800">
              <strong>Error:</strong> {error.message}
            </div>
            {retryCount > 0 && (
              <div className="mt-1 text-xs text-red-600">
                Retry attempts: {retryCount}
              </div>
            )}
          </div>

          {/* Suggestions */}
          <div className="mb-4 text-left">
            <h4 className="mb-2 text-sm font-semibold text-gray-700">Try these solutions:</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              {errorDetails.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-1 text-primary-500">•</span>
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>

          {/* Action buttons */}
          <div className="flex justify-center gap-3">
            {canRetry && (
              <Button
                color="primary"
                onClick={handleRetry}
                isLoading={isRetrying}
                startContent={!isRetrying && <RefreshCw className="size-4" />}
                disabled={retryCount >= 3} // Limit retry attempts
              >
                {isRetrying ? 'Retrying...' : 'Try Again'}
              </Button>
            )}
            
            <Button
              variant="light"
              onClick={() => window.location.reload()}
              startContent={<RefreshCw className="size-4" />}
            >
              Reload Page
            </Button>
          </div>

          {retryCount >= 3 && (
            <div className="mt-4 rounded-lg bg-gray-100 p-3">
              <p className="text-sm text-gray-600">
                Multiple retry attempts failed. Please reload the page or contact support.
              </p>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

// Export enhanced components as defaults for backwards compatibility
export const MapLoadingState = MapProgressiveLoading;
export const MapErrorState = MapEnhancedErrorState;

export default {
  MapLoadingSkeleton,
  MapProgressiveLoading,
  MapEnhancedErrorState,
  MapLoadingState,
  MapErrorState,
  ConnectionStatus
}; 