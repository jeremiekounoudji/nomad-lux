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
    <div className={`relative w-full h-full bg-gray-100 rounded-lg overflow-hidden ${className}`}>
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse" />
      
      {/* Map markers simulation */}
      <div className="absolute inset-0 p-4">
        <div className="flex items-center justify-center h-full">
          <div className="space-y-4 text-center">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" />
              <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
            <div className="w-32 h-4 bg-gray-300 rounded animate-pulse mx-auto" />
            <div className="w-24 h-3 bg-gray-300 rounded animate-pulse mx-auto" />
          </div>
        </div>
      </div>
      
      {/* Corner indicators */}
      <div className="absolute top-4 left-4">
        <div className="w-8 h-8 bg-gray-300 rounded animate-pulse" />
      </div>
      <div className="absolute top-4 right-4">
        <div className="w-16 h-6 bg-gray-300 rounded animate-pulse" />
      </div>
      <div className="absolute bottom-4 right-4">
        <div className="w-12 h-8 bg-gray-300 rounded animate-pulse" />
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
    if (!isOnline) return <WifiOff className="w-4 h-4 text-red-500" />;
    if (effectiveType && ['slow-2g', '2g'].includes(effectiveType)) {
      return <Wifi className="w-4 h-4 text-yellow-500" />;
    }
    return <Wifi className="w-4 h-4 text-green-500" />;
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
    <div className={`relative w-full h-full ${className}`}>
      <MapLoadingSkeleton />
      
      {/* Loading overlay */}
      <div className="absolute inset-0 bg-white/90 flex items-center justify-center z-10">
        <Card className="w-80 max-w-full mx-4">
          <CardBody className="text-center p-6">
            {/* Header */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="relative">
                <MapPin className="w-8 h-8 text-primary-500" />
                <div className="absolute -top-1 -right-1">
                  <Spinner size="sm" color="primary" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {loadingMessage}
                </h3>
                <div className="flex items-center gap-2 mt-1">
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
                <div className="flex flex-wrap gap-1 justify-center">
                  {progress.loaded.map((item, index) => (
                    <Chip
                      key={index}
                      size="sm"
                      color="success"
                      variant="flat"
                      startContent={<CheckCircle className="w-3 h-3" />}
                    >
                      {item}
                    </Chip>
                  ))}
                </div>
              </div>
            )}

            {/* Tips for slow connections */}
            {connectionInfo.effectiveType && ['slow-2g', '2g'].includes(connectionInfo.effectiveType) && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-800">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">
                    Slow connection detected. Map features may be limited.
                  </span>
                </div>
              </div>
            )}

            {/* Offline indicator */}
            {!connectionInfo.isOnline && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-800">
                  <WifiOff className="w-4 h-4" />
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
          icon: <WifiOff className="w-12 h-12 text-red-500" />,
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
          icon: <Download className="w-12 h-12 text-red-500" />,
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
          icon: <AlertTriangle className="w-12 h-12 text-red-500" />,
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
          icon: <XCircle className="w-12 h-12 text-red-500" />,
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
    <div className={`w-full h-full flex items-center justify-center bg-gray-50 ${className}`}>
      <Card className="w-96 max-w-full mx-4">
        <CardBody className="text-center p-6">
          {/* Error icon and title */}
          <div className="flex flex-col items-center mb-4">
            {errorDetails.icon}
            <h3 className="text-xl font-semibold text-gray-900 mt-3">
              {errorDetails.title}
            </h3>
            <p className="text-gray-600 mt-2">
              {errorDetails.description}
            </p>
          </div>

          {/* Error details */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div className="text-sm text-red-800">
              <strong>Error:</strong> {error.message}
            </div>
            {retryCount > 0 && (
              <div className="text-xs text-red-600 mt-1">
                Retry attempts: {retryCount}
              </div>
            )}
          </div>

          {/* Suggestions */}
          <div className="text-left mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Try these solutions:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {errorDetails.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary-500 mt-1">•</span>
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 justify-center">
            {canRetry && (
              <Button
                color="primary"
                onClick={handleRetry}
                isLoading={isRetrying}
                startContent={!isRetrying && <RefreshCw className="w-4 h-4" />}
                disabled={retryCount >= 3} // Limit retry attempts
              >
                {isRetrying ? 'Retrying...' : 'Try Again'}
              </Button>
            )}
            
            <Button
              variant="light"
              onClick={() => window.location.reload()}
              startContent={<RefreshCw className="w-4 h-4" />}
            >
              Reload Page
            </Button>
          </div>

          {retryCount >= 3 && (
            <div className="mt-4 p-3 bg-gray-100 rounded-lg">
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