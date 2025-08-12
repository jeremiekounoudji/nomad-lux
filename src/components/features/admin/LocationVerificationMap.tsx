import React, { useCallback, useState } from 'react';
import { LazyMapWrapper } from '../../map';
import { DatabaseProperty } from '../../../interfaces';
import { MapCoordinates } from '../../../interfaces/Map';
import { Button, Chip } from '@heroui/react';
import { MapPin, Check, AlertTriangle, Search } from 'lucide-react';
import { convertDatabasePropertyToProperty } from '../../../utils/propertyUtils';
import { validatePropertyCoordinates, getPropertyCoordinates } from '../../../utils/propertyUtils';
import { useTranslation } from 'react-i18next';

interface LocationVerificationMapProps {
  property: DatabaseProperty;
  onVerify: (verified: boolean) => void;
  className?: string;
}

export const LocationVerificationMap: React.FC<LocationVerificationMapProps> = ({
  property,
  onVerify,
  className = ''
}) => {
  const { t } = useTranslation(['admin', 'common']);
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  // Function to verify location against external services
  const verifyLocation = useCallback(async () => {
    setIsChecking(true);
    try {
      // Simulate API call to verify location
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For now, we'll just check if coordinates are within reasonable bounds
      const isValid = 
        property.location.coordinates.lat >= -90 && 
        property.location.coordinates.lat <= 90 && 
        property.location.coordinates.lng >= -180 && 
        property.location.coordinates.lng <= 180;
      
      setIsVerified(isValid);
      onVerify(isValid);
    } catch (error) {
      console.error('Failed to verify location:', error);
      setIsVerified(false);
      onVerify(false);
    } finally {
      setIsChecking(false);
    }
  }, [property.location.coordinates, onVerify]);

  // Convert DatabaseProperty to Property for utility functions
  const propertyForMap = convertDatabasePropertyToProperty(property);
  const hasValidCoords = validatePropertyCoordinates(propertyForMap);
  const coords = getPropertyCoordinates(propertyForMap);

  if (!hasValidCoords || !coords) {
    console.warn('🗺️ Coordinates unavailable for property:', property.id, property.title, property.location);
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center h-[300px] ${className}`}>
        <div className="text-center p-6">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">{t('admin.locationVerification.coordsUnavailable.title', { defaultValue: 'Coordinates unavailable' })}</h3>
          <p className="text-gray-500 mb-4">{t('admin.locationVerification.coordsUnavailable.subtitle', { defaultValue: 'This property does not have valid location coordinates.' })}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">{t('admin.locationVerification.title', { defaultValue: 'Location Verification' })}</h3>
        </div>
        {isVerified !== null && (
          <Chip
            color={isVerified ? 'success' : 'danger'}
            variant="flat"
            startContent={isVerified ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          >
            {isVerified
              ? t('admin.locationVerification.verified', { defaultValue: 'Location Verified' })
              : t('admin.locationVerification.invalid', { defaultValue: 'Location Invalid' })}
          </Chip>
        )}
      </div>

      <div className="relative rounded-xl overflow-hidden border border-gray-200">
        <LazyMapWrapper
          type="property"
          property={propertyForMap}
          height="300px"
          showNearbyAmenities={false}
          showDirections={false}
          showRadius={true}
          onDirectionsRequest={(coordinates: MapCoordinates) => {
            const url = `https://www.google.com/maps/dir/?api=1&destination=${coordinates.lat},${coordinates.lng}`;
            window.open(url, '_blank');
          }}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          <p>{t('admin.locationVerification.latitude', { defaultValue: 'Latitude' })}: {coords.lat}</p>
          <p>{t('admin.locationVerification.longitude', { defaultValue: 'Longitude' })}: {coords.lng}</p>
        </div>
        <Button
          color="primary"
          variant="solid"
          startContent={<Search className="w-4 h-4" />}
          onPress={verifyLocation}
          isLoading={isChecking}
        >
          {t('admin.locationVerification.verifyButton', { defaultValue: 'Verify Location' })}
        </Button>
      </div>

      {/* Additional location information */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">{t('admin.locationVerification.city', { defaultValue: 'City' })}</span>
          <span className="text-sm text-gray-600">{property.location.city}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">{t('admin.locationVerification.country', { defaultValue: 'Country' })}</span>
          <span className="text-sm text-gray-600">{property.location.country}</span>
        </div>
        {/* Neighborhood not part of typed schema */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">{t('admin.locationVerification.address', { defaultValue: 'Address' })}</span>
          <span className="text-sm text-gray-600">{property.location.address || t('common.notSpecified', { defaultValue: 'Not specified' })}</span>
        </div>
      </div>
    </div>
  );
}; 