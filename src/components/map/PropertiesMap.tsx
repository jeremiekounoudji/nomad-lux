import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Property } from '../../interfaces/Property';
import { useNavigate } from 'react-router-dom';
import { Button } from '@heroui/react';
import { Star, MapPin } from 'lucide-react';
import { getPropertyCoordinates } from '../../utils/propertyUtils';
import { useTranslation } from '../../lib/stores/translationStore';

// Reuse the custom marker icon from PropertyMap
const createPropertyIcon = (property: Property, isSelected: boolean = false) => {
  const iconHtml = `
    <div style="position:relative;display:flex;flex-direction:column;align-items:center;">
      <div style="background:white;border:2px solid ${isSelected ? '#3b82f6' : '#d1d5db'};border-radius:16px;box-shadow:0 2px 8px rgba(0,0,0,0.10);padding:6px 12px;display:flex;align-items:center;gap:8px;min-width:70px;">
        <img src='${property.host.avatar_url}' alt='avatar' style="width:28px;height:28px;border-radius:50%;border:2px solid #e5e7eb;object-fit:cover;" />
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
  return new window.L.Icon({
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

export interface PropertiesMapProps {
  properties: Property[];
  className?: string;
  height?: string;
  onPropertyClick?: (property: Property) => void;
  selectedProperty?: Property | null;
  enableClustering?: boolean;
}

const PropertiesMap: React.FC<PropertiesMapProps> = ({
  properties,
  className = '',
  height = '400px',
  onPropertyClick,
  selectedProperty,
  enableClustering = false // Default to false since clustering is not available
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation('property');
  // Calculate map center and bounds
  const validProperties = useMemo(() => properties.filter(p => getPropertyCoordinates(p)), [properties]);
  const markers = useMemo(() => validProperties.map((property) => {
    const coords = getPropertyCoordinates(property);
    return coords ? { property, coords } : null;
  }).filter((marker): marker is { property: Property; coords: { lat: number; lng: number } } => marker !== null), [validProperties]);

  const center = useMemo(() => {
    if (!markers.length) return [0, 0];
    const lats = markers.map(m => m.coords.lat);
    const lngs = markers.map(m => m.coords.lng);
    return [
      lats.reduce((a, b) => a + b, 0) / lats.length,
      lngs.reduce((a, b) => a + b, 0) / lngs.length
    ];
  }, [markers]);

  return (
    <div className={`relative rounded-xl overflow-hidden border border-gray-200 ${className}`} style={{ height }}>
      <MapContainer
        center={center as [number, number]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map(({ property, coords }) => (
          <Marker
            key={property.id}
            position={[coords.lat, coords.lng] as [number, number]}
            icon={createPropertyIcon(property, selectedProperty?.id === property.id)}
            eventHandlers={{
              click: () => {
                if (onPropertyClick) onPropertyClick(property);
                else navigate(`/properties/${property.id}`);
              }
            }}
          >
            <Popup minWidth={260} maxWidth={320}>
              <div className="p-2">
                <div className="flex items-center gap-3 mb-2">
                  <img src={property.host.avatar_url} alt={property.host.display_name} className="w-10 h-10 rounded-full border-2 border-primary-200" />
                  <div>
                    <h3 className="font-semibold text-base mb-0.5">{property.title}</h3>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span>{property.rating.toFixed(1)}</span>
                      <span>({property.review_count})</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <MapPin className="w-4 h-4" />
                      <span>{property.location.city}, {property.location.country}</span>
                    </div>
                  </div>
                </div>
                <img src={property.images[0]} alt={property.title} className="w-full h-24 object-cover rounded-lg mb-2" />
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary-700">{property.currency} {property.price}</span>
                  <Button
                    size="sm"
                    color="primary"
                    onClick={() => navigate(`/properties/${property.id}`)}
                  >
                    {t('actions.viewDetails')}
                  </Button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default PropertiesMap; 