import React, { useCallback, useState } from 'react';
import { LazyMapWrapper } from '../../map';
import { DatabaseProperty } from '../../../interfaces/DatabaseProperty';
import { MapCoordinates } from '../../../interfaces/Map';
import { Button, Chip } from '@heroui/react';
import { MapPin, Check, AlertTriangle, Search } from 'lucide-react';

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
        property.coordinates.lat >= -90 && 
        property.coordinates.lat <= 90 && 
        property.coordinates.lng >= -180 && 
        property.coordinates.lng <= 180;
      
      setIsVerified(isValid);
      onVerify(isValid);
    } catch (error) {
      console.error('Failed to verify location:', error);
      setIsVerified(false);
      onVerify(false);
    } finally {
      setIsChecking(false);
    }
  }, [property.coordinates, onVerify]);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Location Verification</h3>
        </div>
        {isVerified !== null && (
          <Chip
            color={isVerified ? 'success' : 'danger'}
            variant="flat"
            startContent={isVerified ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          >
            {isVerified ? 'Location Verified' : 'Location Invalid'}
          </Chip>
        )}
      </div>

      <div className="relative rounded-xl overflow-hidden border border-gray-200">
        <LazyMapWrapper
          type="property"
          property={property}
          height="300px"
          showNearbyAmenities={true}
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
          <p>Latitude: {property.coordinates.lat}</p>
          <p>Longitude: {property.coordinates.lng}</p>
        </div>
        <Button
          color="primary"
          variant="solid"
          startContent={<Search className="w-4 h-4" />}
          onPress={verifyLocation}
          isLoading={isChecking}
        >
          Verify Location
        </Button>
      </div>

      {/* Additional location information */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">City</span>
          <span className="text-sm text-gray-600">{property.location.city}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Country</span>
          <span className="text-sm text-gray-600">{property.location.country}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Neighborhood</span>
          <span className="text-sm text-gray-600">{property.location.neighborhood || 'Not specified'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Address</span>
          <span className="text-sm text-gray-600">{property.location.address || 'Not specified'}</span>
        </div>
      </div>
    </div>
  );
}; 