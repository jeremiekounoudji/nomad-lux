import React from 'react';
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  Pause,
  Star,
  Eye,
  TrendingUp,
  Users
} from 'lucide-react';
import { DatabaseProperty } from '../../interfaces/DatabaseProperty';
import { useTranslation } from '../../lib/stores/translationStore';

export interface MarkerStyleConfig {
  size: 'small' | 'medium' | 'large';
  showStatus: boolean;
  showPriority: boolean;
  showMetrics: boolean;
  animated: boolean;
  cluster: boolean;
}

export interface AdminMarkerStylesProps {
  property: DatabaseProperty;
  config?: Partial<MarkerStyleConfig>;
  selected?: boolean;
  priority?: 'high' | 'medium' | 'low';
  className?: string;
}

const defaultConfig: MarkerStyleConfig = {
  size: 'medium',
  showStatus: true,
  showPriority: false,
  showMetrics: false,
  animated: false,
  cluster: false
};

// Status configuration
const statusConfig = {
  approved: {
    color: '#10B981', // green
    bgColor: '#ECFDF5',
    borderColor: '#10B981',
    icon: CheckCircle,
    label: 'status.approved',
    pulseColor: '#10B981'
  },
  pending: {
    color: '#F59E0B', // amber
    bgColor: '#FFFBEB',
    borderColor: '#F59E0B',
    icon: Clock,
    label: 'status.pending',
    pulseColor: '#F59E0B'
  },
  rejected: {
    color: '#EF4444', // red
    bgColor: '#FEF2F2',
    borderColor: '#EF4444',
    icon: XCircle,
    label: 'status.rejected',
    pulseColor: '#EF4444'
  },
  suspended: {
    color: '#6B7280', // gray
    bgColor: '#F9FAFB',
    borderColor: '#6B7280',
    icon: Pause,
    label: 'status.suspended',
    pulseColor: '#6B7280'
  }
};

// Priority configuration
const priorityConfig = {
  high: {
    borderWidth: '3px',
    shadowColor: '#EF4444',
    indicator: '!',
    color: '#EF4444'
  },
  medium: {
    borderWidth: '2px',
    shadowColor: '#F59E0B',
    indicator: '⚠',
    color: '#F59E0B'
  },
  low: {
    borderWidth: '1px',
    shadowColor: '#6B7280',
    indicator: '',
    color: '#6B7280'
  }
};

// Size configuration
const sizeConfig = {
  small: {
    width: '24px',
    height: '24px',
    iconSize: '12px',
    fontSize: '10px'
  },
  medium: {
    width: '32px',
    height: '32px',
    iconSize: '16px',
    fontSize: '12px'
  },
  large: {
    width: '48px',
    height: '48px',
    iconSize: '24px',
    fontSize: '14px'
  }
};

export const AdminMarkerStyles: React.FC<AdminMarkerStylesProps> = ({
  property,
  config = {},
  selected = false,
  priority = 'low',
  className = ''
}) => {
  const { t } = useTranslation('admin');
  const finalConfig = { ...defaultConfig, ...config };
  const status = property.approval_status as keyof typeof statusConfig;
  const statusInfo = statusConfig[status] || statusConfig.pending;
  const priorityInfo = priorityConfig[priority];
  const sizeInfo = sizeConfig[finalConfig.size];

  const IconComponent = statusInfo.icon;

  // Calculate metrics for display
  const metrics = {
    rating: property.rating || 0,
    bookings: property.total_bookings || 0,
    views: property.view_count || 0,
    revenue: property.total_revenue || 0
  };

  return (
    <div className={`relative ${className}`}>
      {/* Main Marker */}
      <div
        className={`
          relative flex cursor-pointer items-center justify-center rounded-full border-2 transition-all duration-200
          ${selected ? 'ring-4 ring-blue-500 ring-opacity-50' : ''}
          ${finalConfig.animated ? 'hover:scale-110' : 'hover:scale-105'}
        `}
        style={{
          width: sizeInfo.width,
          height: sizeInfo.height,
          backgroundColor: statusInfo.bgColor,
          borderColor: selected ? '#3B82F6' : statusInfo.borderColor,
          borderWidth: selected ? '3px' : priorityInfo.borderWidth,
          boxShadow: selected 
            ? `0 0 20px rgba(59, 130, 246, 0.6)` 
            : finalConfig.showPriority 
              ? `0 0 10px ${priorityInfo.shadowColor}33`
              : `0 2px 8px rgba(0, 0, 0, 0.15)`
        }}
      >
        {/* Status Icon */}
        <IconComponent 
          style={{ 
            width: sizeInfo.iconSize, 
            height: sizeInfo.iconSize,
            color: statusInfo.color
          }}
        />

        {/* Priority Indicator */}
        {finalConfig.showPriority && priority !== 'low' && (
          <div
            className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full font-bold text-white"
            style={{ 
              backgroundColor: priorityInfo.color,
              fontSize: '10px'
            }}
          >
            {priorityInfo.indicator}
          </div>
        )}

        {/* Animation Pulse for Pending */}
        {finalConfig.animated && status === 'pending' && (
          <div
            className="absolute inset-0 animate-ping rounded-full"
            style={{
              backgroundColor: statusInfo.pulseColor,
              opacity: 0.3
            }}
          />
        )}
      </div>

      {/* Status Label */}
      {finalConfig.showStatus && (
        <div
          className="absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded px-2 py-1 text-xs font-medium text-white shadow-lg"
          style={{
            backgroundColor: statusInfo.color,
            fontSize: sizeInfo.fontSize
          }}
        >
          {t(statusInfo.label)}
          {/* Arrow pointing up */}
          <div
            className="absolute bottom-full left-1/2 size-0 -translate-x-1/2 border-x-2 border-b-2 border-transparent"
            style={{ borderBottomColor: statusInfo.color }}
          />
        </div>
      )}

      {/* Metrics Display */}
      {finalConfig.showMetrics && (
        <div className="absolute left-1/2 top-full mt-8 min-w-32 -translate-x-1/2 rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
          <div className="space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Star className="size-3 text-yellow-500" />
                <span>{metrics.rating.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="size-3 text-gray-500" />
                <span>{metrics.views}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Users className="size-3 text-blue-500" />
                <span>{metrics.bookings}</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="size-3 text-green-500" />
                <span>${metrics.revenue.toLocaleString()}</span>
              </div>
            </div>
          </div>
          {/* Arrow pointing up */}
          <div className="absolute bottom-full left-1/2 size-0 -translate-x-1/2 border-x-2 border-b-2 border-transparent border-b-white" />
        </div>
      )}

      {/* Property Info Card (for large markers) */}
      {finalConfig.size === 'large' && (
        <div className="absolute left-1/2 top-full mt-2 min-w-48 max-w-64 -translate-x-1/2 rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
          <div className="flex items-start gap-3">
            <img 
              src={property.images[0]} 
              alt={property.title}
              className="size-12 shrink-0 rounded-lg object-cover"
            />
            <div className="min-w-0 flex-1">
              <h4 className="line-clamp-1 text-sm font-medium">{property.title}</h4>
              <p className="line-clamp-1 text-xs text-gray-600">
                {property.location.city}, {property.location.country}
              </p>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-sm font-semibold text-primary-600">
                  ${property.currency} ${property.price}/night
                </span>
                <div className="flex items-center gap-1">
                  <Star className="size-3 fill-current text-yellow-500" />
                  <span className="text-xs">{metrics.rating.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>
          {/* Arrow pointing up */}
          <div className="absolute bottom-full left-6 size-0 border-x-2 border-b-2 border-transparent border-b-white" />
        </div>
      )}
    </div>
  );
};

// Cluster marker for grouped properties
export const AdminClusterMarker: React.FC<{
  count: number;
  statusBreakdown: Record<string, number>;
  size?: 'small' | 'medium' | 'large';
  selected?: boolean;
}> = ({ count, statusBreakdown, size = 'medium', selected = false }) => {
  const { t } = useTranslation('admin');
  const sizeInfo = sizeConfig[size];
  
  // Calculate dominant status
  const dominantStatus = Object.entries(statusBreakdown)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'pending';
  
  const statusInfo = statusConfig[dominantStatus as keyof typeof statusConfig];

  return (
    <div className="relative">
      {/* Main Cluster Circle */}
      <div
        className={`
          relative flex cursor-pointer items-center justify-center rounded-full border-3 font-bold text-white transition-all duration-200
          ${selected ? 'ring-4 ring-blue-500 ring-opacity-50' : ''}
          hover:scale-110
        `}
        style={{
          width: `${parseInt(sizeInfo.width) + Math.min(count * 2, 20)}px`,
          height: `${parseInt(sizeInfo.height) + Math.min(count * 2, 20)}px`,
          backgroundColor: statusInfo.color,
          borderColor: selected ? '#3B82F6' : '#FFFFFF',
          boxShadow: selected 
            ? `0 0 20px rgba(59, 130, 246, 0.6)` 
            : `0 4px 12px rgba(0, 0, 0, 0.2)`,
          fontSize: Math.max(12, parseInt(sizeInfo.fontSize))
        }}
      >
        {count}
      </div>

      {/* Status Breakdown Indicators */}
      <div className="absolute -bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
        {Object.entries(statusBreakdown).map(([status, statusCount]) => {
          if (statusCount === 0) return null;
          const info = statusConfig[status as keyof typeof statusConfig];
          return (
            <div
              key={status}
              className="size-2 rounded-full border border-white"
              style={{ backgroundColor: info.color }}
              title={`${t(info.label)}: ${statusCount}`}
            />
          );
        })}
      </div>

      {/* Pulse Animation */}
      <div
        className="absolute inset-0 animate-ping rounded-full opacity-30"
        style={{ backgroundColor: statusInfo.color }}
      />
    </div>
  );
};

// Helper function to create marker styles programmatically
export const createAdminMarkerStyle = (
  property: DatabaseProperty,
  options: {
    selected?: boolean;
    priority?: 'high' | 'medium' | 'low';
    config?: Partial<MarkerStyleConfig>;
  } = {}
) => {
  return {
    property,
    selected: options.selected || false,
    priority: options.priority || 'low',
    config: options.config || {}
  };
};

// Export marker style configurations for external use
export { statusConfig, priorityConfig, sizeConfig };

export default AdminMarkerStyles; 