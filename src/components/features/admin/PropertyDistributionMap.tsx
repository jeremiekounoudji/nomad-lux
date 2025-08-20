import React, { useMemo, useCallback } from 'react';
import { LazyMapWrapper } from '../../map';
import { DatabaseProperty } from '../../../interfaces/DatabaseProperty';
import { MapCoordinates } from '../../../interfaces/Map';
import { Card, CardBody, Chip, Button } from '@heroui/react';
import { MapPin, Building, TrendingUp, Users, Eye } from 'lucide-react';
import { useTranslation } from '../../../lib/stores/translationStore';

interface PropertyDistributionMapProps {
  properties: DatabaseProperty[];
  onPropertyClick?: (property: DatabaseProperty) => void;
  className?: string;
  height?: string;
}

interface LocationStats {
  city: string;
  country: string;
  count: number;
  approved: number;
  pending: number;
  rejected: number;
  suspended: number;
  coordinates: MapCoordinates;
}

export const PropertyDistributionMap: React.FC<PropertyDistributionMapProps> = ({
  properties,
  onPropertyClick,
  className = '',
  height = '500px'
}) => {
  const { t } = useTranslation(['admin', 'common']);
  // Calculate location statistics
  const locationStats = useMemo(() => {
    const statsMap = new Map<string, LocationStats>();

    properties.forEach(property => {
      const key = `${property.location.city},${property.location.country}`;
      
      if (!statsMap.has(key)) {
        statsMap.set(key, {
          city: property.location.city,
          country: property.location.country,
          count: 0,
          approved: 0,
          pending: 0,
          rejected: 0,
          suspended: 0,
          coordinates: property.coordinates
        });
      }

      const stats = statsMap.get(key)!;
      stats.count++;
      
      switch (property.status) {
        case 'approved':
          stats.approved++;
          break;
        case 'pending':
          stats.pending++;
          break;
        case 'rejected':
          stats.rejected++;
          break;
        case 'suspended':
          stats.suspended++;
          break;
      }
    });

    return Array.from(statsMap.values()).sort((a, b) => b.count - a.count);
  }, [properties]);

  // Calculate map bounds based on all properties
  const bounds = useMemo(() => {
    if (!properties.length) return undefined;

    const latitudes = properties.map(p => p.coordinates.lat);
    const longitudes = properties.map(p => p.coordinates.lng);

    return {
      north: Math.max(...latitudes) + 0.5,
      south: Math.min(...latitudes) - 0.5,
      east: Math.max(...longitudes) + 0.5,
      west: Math.min(...longitudes) - 0.5
    };
  }, [properties]);

  // Handle property click
  const handlePropertyClick = useCallback((property: DatabaseProperty) => {
    if (onPropertyClick) {
      onPropertyClick(property);
    }
  }, [onPropertyClick]);

  // Handle directions request
  const handleDirectionsRequest = useCallback((coordinates: MapCoordinates) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${coordinates.lat},${coordinates.lng}`;
    window.open(url, '_blank');
  }, []);

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'danger';
      case 'suspended': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Map Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">{t('admin.properties.distribution.title', { defaultValue: 'Property Distribution' })}</h3>
        </div>
        <div className="flex items-center gap-2">
          <Chip size="sm" variant="flat" color="default">
            <Building className="w-3 h-3 mr-1" />
            {t('admin.properties.distribution.propertiesCount', { count: properties.length, defaultValue: '{{count}} Properties' })}
          </Chip>
          <Chip size="sm" variant="flat" color="default">
            <MapPin className="w-3 h-3 mr-1" />
            {t('admin.properties.distribution.locationsCount', { count: locationStats.length, defaultValue: '{{count}} Locations' })}
          </Chip>
        </div>
      </div>

      {/* Map */}
      <div className="relative rounded-xl overflow-hidden border border-gray-200">
        <LazyMapWrapper
          type="properties"
          properties={properties}
          height={height}
          showNearbyAmenities={false}
          showDirections={false}
          showRadius={false}
          bounds={bounds}
          onPropertyClick={handlePropertyClick}
          onDirectionsRequest={handleDirectionsRequest}
          enableClustering={true}
          showPriceOnMarker={false}
        />
      </div>

      {/* Location Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Locations */}
        <Card className="shadow-sm border border-gray-200">
          <CardBody className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary-600" />
              <h4 className="font-semibold text-gray-900">{t('admin.properties.distribution.topLocations', { defaultValue: 'Top Locations' })}</h4>
            </div>
            <div className="space-y-3">
              {locationStats.slice(0, 5).map((location, index) => (
                <div key={`${location.city}-${location.country}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-primary-600">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{location.city}</p>
                      <p className="text-sm text-gray-600">{location.country}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{location.count}</p>
                    <p className="text-xs text-gray-500">{t('admin.properties.distribution.properties', { defaultValue: 'properties' })}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Status Distribution */}
        <Card className="shadow-sm border border-gray-200">
          <CardBody className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-primary-600" />
              <h4 className="font-semibold text-gray-900">{t('admin.properties.distribution.statusDistribution', { defaultValue: 'Status Distribution' })}</h4>
            </div>
            <div className="space-y-3">
              {[
                { 
                  status: 'approved', 
                  count: properties.filter(p => p.status === 'approved').length,
                  label: t('admin.properties.distribution.statusLabels.approved', { defaultValue: 'Approved Properties' }),
                  color: 'success' as const
                },
                { 
                  status: 'pending', 
                  count: properties.filter(p => p.status === 'pending').length,
                  label: t('admin.properties.distribution.statusLabels.pending', { defaultValue: 'Pending Review' }),
                  color: 'warning' as const
                },
                { 
                  status: 'rejected', 
                  count: properties.filter(p => p.status === 'rejected').length,
                  label: t('admin.properties.distribution.statusLabels.rejected', { defaultValue: 'Rejected Properties' }),
                  color: 'danger' as const
                },
                { 
                  status: 'suspended', 
                  count: properties.filter(p => p.status === 'suspended').length,
                  label: t('admin.properties.distribution.statusLabels.suspended', { defaultValue: 'Suspended Properties' }),
                  color: 'secondary' as const
                }
              ].map((item) => (
                <div key={item.status} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Chip size="sm" color={item.color} variant="flat">
                      {item.status}
                    </Chip>
                    <span className="text-sm font-medium text-gray-900">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">{item.count}</span>
                    <span className="text-xs text-gray-500">
                      ({properties.length > 0 ? Math.round((item.count / properties.length) * 100) : 0}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Detailed Location Breakdown */}
      <Card className="shadow-sm border border-gray-200">
        <CardBody className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary-600" />
              <h4 className="font-semibold text-gray-900">{t('admin.properties.distribution.locationBreakdown', { defaultValue: 'Location Breakdown' })}</h4>
            </div>
            <Button size="sm" variant="flat" color="primary" startContent={<Eye className="w-4 h-4" />}>
              {t('admin.properties.distribution.viewDetails', { defaultValue: 'View Details' })}
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 font-medium text-gray-700">{t('admin.properties.distribution.table.location', { defaultValue: 'Location' })}</th>
                  <th className="text-center py-3 px-2 font-medium text-gray-700">{t('admin.properties.distribution.table.total', { defaultValue: 'Total' })}</th>
                  <th className="text-center py-3 px-2 font-medium text-gray-700">{t('admin.properties.distribution.table.approved', { defaultValue: 'Approved' })}</th>
                  <th className="text-center py-3 px-2 font-medium text-gray-700">{t('admin.properties.distribution.table.pending', { defaultValue: 'Pending' })}</th>
                  <th className="text-center py-3 px-2 font-medium text-gray-700">{t('admin.properties.distribution.table.rejected', { defaultValue: 'Rejected' })}</th>
                  <th className="text-center py-3 px-2 font-medium text-gray-700">{t('admin.properties.distribution.table.suspended', { defaultValue: 'Suspended' })}</th>
                </tr>
              </thead>
              <tbody>
                {locationStats.map((location) => (
                  <tr key={`${location.city}-${location.country}`} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-2">
                      <div>
                        <p className="font-medium text-gray-900">{location.city}</p>
                        <p className="text-sm text-gray-600">{location.country}</p>
                      </div>
                    </td>
                    <td className="text-center py-3 px-2">
                      <span className="font-bold text-gray-900">{location.count}</span>
                    </td>
                    <td className="text-center py-3 px-2">
                      <Chip size="sm" color="success" variant="flat">
                        {location.approved}
                      </Chip>
                    </td>
                    <td className="text-center py-3 px-2">
                      <Chip size="sm" color="warning" variant="flat">
                        {location.pending}
                      </Chip>
                    </td>
                    <td className="text-center py-3 px-2">
                      <Chip size="sm" color="danger" variant="flat">
                        {location.rejected}
                      </Chip>
                    </td>
                    <td className="text-center py-3 px-2">
                      <Chip size="sm" color="secondary" variant="flat">
                        {location.suspended}
                      </Chip>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}; 