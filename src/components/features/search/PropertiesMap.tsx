import React, { useCallback, useMemo } from 'react';
import { Property } from '../../../interfaces/Property';
import { LazyMapWrapper } from '../../map';
import { MapCoordinates } from '../../../interfaces/Map';
import { useNavigate } from 'react-router-dom';
import { usePropertyStore } from '../../../lib/stores/propertyStore';

interface PropertiesMapProps {
  properties: Property[];
  onPropertyClick?: (property: Property) => void;
  className?: string;
  height?: string;
}

export const PropertiesMap: React.FC<PropertiesMapProps> = ({
  properties,
  onPropertyClick,
  className = '',
  height = '600px'
}) => {
  const navigate = useNavigate();
  const { setSelectedProperty } = usePropertyStore();

  // Calculate map bounds based on property coordinates
  const bounds = useMemo(() => {
    if (!properties.length) return undefined;

    const coordinates = properties.map(property => ({
      lat: property.location.coordinates.lat,
      lng: property.location.coordinates.lng
    }));

    const latitudes = coordinates.map(coord => coord.lat);
    const longitudes = coordinates.map(coord => coord.lng);

    return {
      north: Math.max(...latitudes) + 0.1, // Add padding
      south: Math.min(...latitudes) - 0.1,
      east: Math.max(...longitudes) + 0.1,
      west: Math.min(...longitudes) - 0.1
    };
  }, [properties]);

  // Handle property click
  const handlePropertyClick = useCallback((property: Property) => {
    if (onPropertyClick) {
      onPropertyClick(property);
    } else {
      setSelectedProperty(property);
      navigate(`/properties/${property.id}`);
    }
  }, [onPropertyClick, setSelectedProperty, navigate]);

  // Handle directions request
  const handleDirectionsRequest = useCallback((coordinates: MapCoordinates) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${coordinates.lat},${coordinates.lng}`;
    window.open(url, '_blank');
  }, []);

  return (
    <div className={`relative overflow-hidden rounded-xl border border-gray-200 ${className}`}>
      <LazyMapWrapper
        type="properties"
        properties={properties}
        height={height}
        showNearbyAmenities={false}
        showDirections={true}
        showRadius={false}
        bounds={bounds}
        onPropertyClick={handlePropertyClick}
        onDirectionsRequest={handleDirectionsRequest}
        enableClustering={true}
        showPriceOnMarker={true}
      />
    </div>
  );
}; 