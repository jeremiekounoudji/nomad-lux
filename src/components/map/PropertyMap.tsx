import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { Icon, LatLngBounds } from 'leaflet';
import { MapPin, Star, Users, Navigation, MessageCircle } from 'lucide-react';
import { Button } from '@heroui/react';
import type { Property } from '../../interfaces/Property';
import type { PropertyMapProps, MapCoordinates } from '../../interfaces/Map';
import { useMap } from '../../hooks/useMap';
import { useResponsiveMap } from '../../hooks/useResponsiveMap';
import { useTranslation } from '../../lib/stores/translationStore';
import { 
  validatePropertyCoordinates, 
  getPropertyCoordinates, 
  getDirectionsUrl,
  PropertyMapError,
  getPropertyMapErrorMessage 
} from '../../utils/propertyUtils';

// Custom property icon with avatar, price, and rating
const createPropertyIcon = (property: Property, isSelected: boolean = true) => {
  const hasHost = property.host && property.host.avatar_url;
  const iconHtml = `
    <div style="position:relative;display:flex;flex-direction:column;align-items:center;">
      <div style="background:white;border:2px solid ${isSelected ? '#3b82f6' : '#d1d5db'};border-radius:16px;box-shadow:0 2px 8px rgba(0,0,0,0.10);padding:6px 12px;display:flex;align-items:center;gap:8px;min-width:70px;">
        ${hasHost ? `<img src='${property.host.avatar_url}' alt='avatar' style="width:28px;height:28px;border-radius:50%;border:2px solid #e5e7eb;object-fit:cover;" />` : ''}
        <div style="display:flex;flex-direction:column;align-items:flex-start;">
          <span style="font-size:14px;font-weight:700;color:${isSelected ? '#2563eb' : '#374151'};line-height:1;">${property.currency} ${property.price}</span>
          <span style="font-size:12px;color:#f59e42;font-weight:600;display:flex;align-items:center;gap:2px;">
            <svg width='12' height='12' viewBox='0 0 20 20' fill='#f59e42' xmlns='http://www.w3.org/2000/svg'><path d='M10 15.27L16.18 18l-1.64-7.03L20 7.24l-7.19-.61L10 0 7.19 6.63 0 7.24l5.46 3.73L3.82 18z'/></svg>
            ${property.rating.toFixed(1)}
          </span>
        </div>
      </div>
      <div style="position:absolute;top:100%;left:50%;transform:translate(-50%,0);width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:8px solid ${isSelected ? '#3b82f6' : '#d1d5db'};"></div>
    </div>
  `;

  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg width="90" height="60" xmlns="http://www.w3.org/2000/svg">
        <foreignObject width="90" height="60">
          <div xmlns="http://www.w3.org/1999/xhtml">
            ${iconHtml}
          </div>
        </foreignObject>
      </svg>
    `)}`,
    iconSize: [90, 60],
    iconAnchor: [45, 55],
    popupAnchor: [0, -55],
  });
};

// Nearby amenities mock data (in real implementation, this would come from a geocoding service)
const getNearbyAmenities = (coordinates: MapCoordinates) => {
  // Mock nearby points of interest
  return [
    {
      id: 'restaurant-1',
      name: 'Local Restaurant',
      type: 'restaurant',
      coordinates: {
        lat: coordinates.lat + 0.002,
        lng: coordinates.lng + 0.001
      },
      distance: '0.2 km'
    },
    {
      id: 'grocery-1',
      name: 'Grocery Store',
      type: 'grocery',
      coordinates: {
        lat: coordinates.lat - 0.001,
        lng: coordinates.lng + 0.003
      },
      distance: '0.3 km'
    },
    {
      id: 'transport-1',
      name: 'Bus Stop',
      type: 'transport',
      coordinates: {
        lat: coordinates.lat + 0.001,
        lng: coordinates.lng - 0.002
      },
      distance: '0.1 km'
    }
  ];
};

const PropertyMap: React.FC<PropertyMapProps> = ({
  property,
  showNearbyAmenities = true,
  showDirections = true,
  showRadius = false,
  radiusMeters = 1000,
  onDirectionsRequest,
  onContactHost,
  className = '',
  height = '400px',
  ...mapProps
}) => {
  const { mapState: responsiveMapState, getResponsiveHeight } = useResponsiveMap();
  const { t } = useTranslation('property');
  const [nearbyAmenities, setNearbyAmenities] = useState<any[]>([]);
  const [isLoadingAmenities, setIsLoadingAmenities] = useState(false);
  const [coordinatesError, setCoordinatesError] = useState<string | null>(null);

  // Validate and extract property coordinates
  const propertyCoords = getPropertyCoordinates(property);
  const hasValidCoords = validatePropertyCoordinates(property);

  // Set error if coordinates are invalid
  useEffect(() => {
    if (!hasValidCoords) {
      if (!propertyCoords) {
        setCoordinatesError(getPropertyMapErrorMessage(PropertyMapError.MISSING_COORDINATES));
      } else {
        setCoordinatesError(getPropertyMapErrorMessage(PropertyMapError.INVALID_COORDINATES));
      }
    } else {
      setCoordinatesError(null);
    }
  }, [hasValidCoords, propertyCoords]);

  const {
    mapRef,
    mapState,
    /* isReady, */ // Commented out unused variable
    /* setCenter, */ // Commented out unused variable
    /* setZoom, */ // Commented out unused variable
    /* addMarker, */ // Commented out unused variable
    /* removeMarker, */ // Commented out unused
    /* addMarkerCluster, */ // Commented out unused
    /* fitBounds, */ // Commented out unused
    /* clearMap, */ // Commented out unused
    /* getDirections */ // Commented out unused
  } = useMap({
    center: propertyCoords ? [propertyCoords.lat, propertyCoords.lng] : [0, 0],
    zoom: 15
  });

  // Load nearby amenities
  useEffect(() => {
    if (showNearbyAmenities && hasValidCoords && propertyCoords) {
      setIsLoadingAmenities(true);
      
      // Simulate API call delay
      const timer = setTimeout(() => {
        const amenities = getNearbyAmenities(propertyCoords);
        setNearbyAmenities(amenities);
        setIsLoadingAmenities(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [showNearbyAmenities, hasValidCoords, propertyCoords]);

  // Set map bounds to include property and nearby amenities
  useEffect(() => {
    if (mapRef.current && nearbyAmenities.length > 0 && propertyCoords) {
      const allPoints = [
        propertyCoords,
        ...nearbyAmenities.map(amenity => amenity.coordinates)
      ];
      
      const bounds = new LatLngBounds(
        allPoints.map(point => [point.lat, point.lng])
      );
      
      mapRef.current.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [mapRef, nearbyAmenities, propertyCoords]);

  const handleDirections = () => {
    if (onDirectionsRequest && propertyCoords) {
      onDirectionsRequest(propertyCoords);
    } else {
      // Use the utility function for directions URL
      const url = getDirectionsUrl(property);
      window.open(url, '_blank');
    }
  };

  const handleContactHost = () => {
    if (onContactHost) {
      onContactHost(property);
    }
  };

  // Show error if coordinates are invalid or missing
  if (coordinatesError || mapState.error) {
    const errorMessage = coordinatesError || getPropertyMapErrorMessage(PropertyMapError.MAP_LOAD_FAILED);
    return (
      <div className={`flex items-center justify-center rounded-lg bg-gray-100 ${className}`} style={{ height }}>
        <div className="p-6 text-center">
          <MapPin className="mx-auto mb-4 size-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-semibold text-gray-700">{t('messages.mapUnavailable')}</h3>
          <p className="mb-4 text-gray-500">{errorMessage}</p>
          {!coordinatesError && (
            <Button size="sm" variant="light" onClick={() => window.location.reload()}>
              {t('common.retry')}
            </Button>
          )}
          {showDirections && (
            <Button size="sm" variant="light" onClick={handleDirections} className="ml-2">
              {t('actions.getDirections')}
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (!propertyCoords) {
    return (
      <div className={`flex items-center justify-center rounded-lg bg-gray-100 ${className}`} style={{ height }}>
        <div className="p-6 text-center">
          <MapPin className="mx-auto mb-4 size-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-semibold text-gray-700">{t('messages.locationNotAvailable')}</h3>
          <p className="text-gray-500">{t('messages.propertyCoordinatesNotAvailable')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`} style={{ height: height || getResponsiveHeight() }}>
      <MapContainer
        ref={mapRef}
        center={[propertyCoords.lat, propertyCoords.lng]}
        zoom={15}
        className="size-full"
        zoomControl={!responsiveMapState.isMobile}
        scrollWheelZoom={!responsiveMapState.isMobile}
        {...mapProps}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Property Marker */}
        <Marker
          position={[propertyCoords.lat, propertyCoords.lng] as [number, number]}
          icon={createPropertyIcon(property, true)}
        >
          <Popup className="custom-popup" minWidth={280}>
            <div className="max-w-xs p-2">
              {/* Property Image */}
              <div className="mb-3">
                <img
                  src={property.images[0]}
                  alt={property.title}
                  className="h-32 w-full rounded-lg object-cover"
                />
              </div>
              
              {/* Property Info */}
              <div className="mb-3">
                <h3 className="mb-1 line-clamp-2 text-lg font-bold">{property.title}</h3>
                <div className="mb-2 flex items-center gap-1">
                  <Star className="size-4 fill-current text-yellow-500" />
                  <span className="text-sm font-medium">{property.rating}</span>
                  <span className="text-sm text-gray-500">({property.review_count})</span>
                </div>
                <div className="mb-2 flex items-center gap-1 text-sm text-gray-600">
                  <MapPin className="size-4" />
                  <span>{property.location.city}, {property.location.country}</span>
                </div>
                <div className="mb-3 flex items-center gap-1 text-sm text-gray-600">
                  <Users className="size-4" />
                  <span>{property.max_guests} guests • {property.bedrooms} bedrooms</span>
                </div>
                <div className="text-xl font-bold text-primary-600">
                  ${property.currency} ${property.price} <span className="text-sm font-normal text-gray-600">/ night</span>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2">
                {showDirections && (
                  <Button
                    size="sm"
                    variant="light"
                    startContent={<Navigation className="size-4" />}
                    onClick={handleDirections}
                    className="flex-1"
                  >
                    {t('actions.directions')}
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="light"
                  startContent={<MessageCircle className="size-4" />}
                  onClick={handleContactHost}
                  className="flex-1"
                >
                  {t('actions.contact')}
                </Button>
              </div>
            </div>
          </Popup>
        </Marker>

        {/* Radius Circle */}
        {showRadius && (
          <Circle
            center={[propertyCoords.lat, propertyCoords.lng]}
            radius={radiusMeters}
            fillColor="blue"
            fillOpacity={0.1}
            color="blue"
            weight={2}
            opacity={0.5}
          />
        )}

        {/* Nearby Amenities */}
        {showNearbyAmenities && nearbyAmenities.map((amenity) => (
          <Marker
            key={amenity.id}
            position={[amenity.coordinates.lat, amenity.coordinates.lng]}
            icon={new Icon({
              iconUrl: `data:image/svg+xml;base64,${btoa(`
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="8" fill="#6366f1" stroke="white" stroke-width="2"/>
                  <circle cx="12" cy="12" r="3" fill="white"/>
                </svg>
              `)}`,
              iconSize: [24, 24],
              iconAnchor: [12, 12],
              popupAnchor: [0, -12],
            })}
          >
            <Popup>
              <div className="p-2 text-center">
                <h4 className="font-semibold">{amenity.name}</h4>
                <p className="text-sm capitalize text-gray-600">{amenity.type}</p>
                <p className="text-xs text-gray-500">{amenity.distance} away</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Loading Overlay */}
      {(mapState.isLoading || isLoadingAmenities) && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-white/80">
          <div className="text-center">
            <div className="mx-auto mb-2 size-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
            <p className="text-sm text-gray-600">
              {mapState.isLoading ? t('messages.loadingMap') : t('messages.findingNearbyAmenities')}
            </p>
          </div>
        </div>
      )}

      {/* Map Controls */}
      <div className="absolute right-4 top-4 z-[1000] flex flex-col gap-2">
        {showDirections && (
          <Button
            isIconOnly
            size="sm"
            color="primary"
            variant="solid"
            className="text-white shadow-lg"
            onClick={handleDirections}
          >
            <Navigation className="size-4" />
          </Button>
        )}
      </div>

      {/* Info Panel */}
      <div className="absolute inset-x-4 bottom-4 z-[1000]">
        <div className="rounded-lg bg-white/95 p-3 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-gray-900">{property.location.city}</h4>
              <p className="text-sm text-gray-600">{property.location.country}</p>
            </div>
            {showNearbyAmenities && (
              <div className="text-right">
                <p className="text-xs text-gray-500">{t('messages.nearbyAmenities')}</p>
                <p className="text-sm font-medium text-gray-700">
                  {isLoadingAmenities ? t('messages.loadingMap') : t('messages.amenitiesFound', { count: nearbyAmenities.length })}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyMap; 