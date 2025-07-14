import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { Icon, LatLngBounds } from 'leaflet';
import { MapPin, Star, Users, Navigation, Phone, MessageCircle, Heart } from 'lucide-react';
import { Button } from '@heroui/react';
import type { Property } from '../../interfaces/Property';
import type { PropertyMapProps, MapCoordinates } from '../../interfaces/Map';
import { useMap } from '../../hooks/useMap';
import { useResponsiveMap } from '../../hooks/useResponsiveMap';
import { 
  validatePropertyCoordinates, 
  getPropertyCoordinates, 
  getDirectionsUrl,
  PropertyMapError,
  getPropertyMapErrorMessage 
} from '../../utils/propertyUtils';

// Custom property icon with avatar, price, and rating
const createPropertyIcon = (property: Property, isSelected: boolean = true) => {
  const iconHtml = `
    <div style="position:relative;display:flex;flex-direction:column;align-items:center;">
      <div style="background:white;border:2px solid ${isSelected ? '#3b82f6' : '#d1d5db'};border-radius:16px;box-shadow:0 2px 8px rgba(0,0,0,0.10);padding:6px 12px;display:flex;align-items:center;gap:8px;min-width:70px;">
        <img src='${property.host.avatar_url}' alt='avatar' style="width:28px;height:28px;border-radius:50%;border:2px solid #e5e7eb;object-fit:cover;" />
        <div style="display:flex;flex-direction:column;align-items:flex-start;">
          <span style="font-size:14px;font-weight:700;color:${isSelected ? '#2563eb' : '#374151'};line-height:1;">$${property.price}</span>
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
    isReady,
    setCenter,
    setZoom,
    addMarker,
    removeMarker,
    addMarkerCluster,
    fitBounds,
    clearMap,
    getDirections
  } = useMap({
    center: propertyCoords ? [propertyCoords.lat, propertyCoords.lng] : [0, 0],
    zoom: 15,
    onError: (error) => {
      console.error('PropertyMap error:', error);
    }
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
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-center p-6">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Map Unavailable</h3>
          <p className="text-gray-500 mb-4">{errorMessage}</p>
          {!coordinatesError && (
            <Button size="sm" variant="light" onClick={() => window.location.reload()}>
              Retry
            </Button>
          )}
          {showDirections && (
            <Button size="sm" variant="light" onClick={handleDirections} className="ml-2">
              Get Directions
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (!propertyCoords) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-center p-6">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Location Not Available</h3>
          <p className="text-gray-500">Property coordinates are not available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-lg overflow-hidden ${className}`} style={{ height: height || getResponsiveHeight() }}>
      <MapContainer
        ref={mapRef}
        center={[propertyCoords.lat, propertyCoords.lng]}
        zoom={15}
        className="w-full h-full"
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
            <div className="p-2 max-w-xs">
              {/* Property Image */}
              <div className="mb-3">
                <img
                  src={property.images[0]}
                  alt={property.title}
                  className="w-full h-32 object-cover rounded-lg"
                />
              </div>
              
              {/* Property Info */}
              <div className="mb-3">
                <h3 className="font-bold text-lg mb-1 line-clamp-2">{property.title}</h3>
                <div className="flex items-center gap-1 mb-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium">{property.rating}</span>
                  <span className="text-sm text-gray-500">({property.review_count})</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>{property.location.city}, {property.location.country}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
                  <Users className="w-4 h-4" />
                  <span>{property.max_guests} guests • {property.bedrooms} bedrooms</span>
                </div>
                <div className="text-xl font-bold text-primary-600">
                  ${property.price} <span className="text-sm font-normal text-gray-600">/ night</span>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2">
                {showDirections && (
                  <Button
                    size="sm"
                    variant="light"
                    startContent={<Navigation className="w-4 h-4" />}
                    onClick={handleDirections}
                    className="flex-1"
                  >
                    Directions
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="light"
                  startContent={<MessageCircle className="w-4 h-4" />}
                  onClick={handleContactHost}
                  className="flex-1"
                >
                  Contact
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
              <div className="text-center p-2">
                <h4 className="font-semibold">{amenity.name}</h4>
                <p className="text-sm text-gray-600 capitalize">{amenity.type}</p>
                <p className="text-xs text-gray-500">{amenity.distance} away</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Loading Overlay */}
      {(mapState.isLoading || isLoadingAmenities) && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-[1000]">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">
              {mapState.isLoading ? 'Loading map...' : 'Finding nearby amenities...'}
            </p>
          </div>
        </div>
      )}

      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        {showDirections && (
          <Button
            isIconOnly
            size="sm"
            color="primary"
            variant="solid"
            className="shadow-lg text-white"
            onClick={handleDirections}
          >
            <Navigation className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Info Panel */}
      <div className="absolute bottom-4 left-4 right-4 z-[1000]">
        <div className="bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-gray-900">{property.location.city}</h4>
              <p className="text-sm text-gray-600">{property.location.country}</p>
            </div>
            {showNearbyAmenities && (
              <div className="text-right">
                <p className="text-xs text-gray-500">Nearby amenities</p>
                <p className="text-sm font-medium text-gray-700">
                  {isLoadingAmenities ? 'Loading...' : `${nearbyAmenities.length} found`}
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