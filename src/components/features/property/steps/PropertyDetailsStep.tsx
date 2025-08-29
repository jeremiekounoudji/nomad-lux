import React, { useMemo } from 'react';
import { Input, Select, SelectItem, Textarea, Button, Card, CardBody } from '@heroui/react';
import { Wifi, Car, Utensils, Waves, Shield, Dumbbell, TreePine, Home, Flame, Heart, Tv, Gamepad2, Wind, Coffee, WashingMachine, Sparkles } from 'lucide-react';
import { useTranslation } from '../../../../lib/stores/translationStore';
import type { PropertySubmissionData } from '../../../../interfaces';
import type { PropertyType } from '../../../../interfaces/Settings';
import { useAdminSettings } from '../../../../hooks/useAdminSettings';
import { usePropertyTypes, useAmenities } from '../../../../hooks/useTranslatedContent';

interface PropertyDetailsStepProps {
  formData: PropertySubmissionData;
  setFormData: React.Dispatch<React.SetStateAction<PropertySubmissionData>>;
}

// Property types will be loaded from admin settings

// Amenity icon mapping
const AMENITY_ICONS: Record<string, React.ReactNode> = {
  wifi: <Wifi className="size-5" />,
  ac: <Wind className="size-5" />,
  kitchen: <Utensils className="size-5" />,
  parking: <Car className="size-5" />,
  tv: <Tv className="size-5" />,
  washer: <WashingMachine className="size-5" />,
  pool: <Waves className="size-5" />,
  gym: <Dumbbell className="size-5" />,
  garden: <TreePine className="size-5" />,
  balcony: <Home className="size-5" />,
  bbq: <Flame className="size-5" />,
  hot_tub: <Heart className="size-5" />,
  security: <Shield className="size-5" />,
  cctv: <Shield className="size-5" />,
  fire_alarm: <Shield className="size-5" />,
  first_aid: <Heart className="size-5" />,
  safe: <Shield className="size-5" />,
  gaming: <Gamepad2 className="size-5" />,
  coffee_machine: <Coffee className="size-5" />,
  cleaning_service: <Sparkles className="size-5" />,
};

// Amenity descriptions
const AMENITY_DESCRIPTIONS: Record<string, string> = {
  wifi: 'High-speed internet',
  ac: 'Climate control',
  kitchen: 'Fully equipped',
  parking: 'Free parking space',
  tv: 'Cable/Streaming',
  washer: 'Laundry facilities',
  pool: 'Private or shared pool',
  gym: 'Fitness center',
  garden: 'Outdoor space',
  balcony: 'Private balcony',
  bbq: 'Outdoor grilling',
  hot_tub: 'Relaxation area',
  security: 'Round-the-clock security',
  cctv: 'Video surveillance',
  fire_alarm: 'Fire safety system',
  first_aid: 'Emergency medical kit',
  safe: 'Secure storage',
  gaming: 'PlayStation/Xbox',
  coffee_machine: 'Fresh coffee daily',
  cleaning_service: 'Regular housekeeping',
};

const CURRENCIES = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'XOF', label: 'XOF - West African CFA Franc' },
  { value: 'XAF', label: 'XAF - Central African CFA Franc' },
];

const PropertyDetailsStep: React.FC<PropertyDetailsStepProps> = ({ formData, setFormData }) => {
  const { t } = useTranslation(['property', 'common']);
  // Use admin settings hook to get property types
  const { settings } = useAdminSettings();

  // Get translated property types and amenities
  const { propertyTypes: translatedPropertyTypes, isLoading: propertyTypesLoading } = usePropertyTypes();
  const { amenities: translatedAmenities, isLoading: amenitiesLoading } = useAmenities();

  // Get property types from admin settings, filtered for enabled ones
  const propertyTypes = useMemo(() => {
    console.log('🔍 [PropertyDetailsStep] Debugging admin settings:', {
      settings: settings,
      content: settings?.content,
      propertyTypes: settings?.content?.propertyTypes,
      settingsKeys: settings ? Object.keys(settings) : [],
      contentKeys: settings?.content ? Object.keys(settings.content) : []
    });

    const allowedTypes = settings?.content?.propertyTypes;
    if (!allowedTypes || !Array.isArray(allowedTypes)) {
      console.log('❌ [PropertyDetailsStep] No property types found or not an array:', allowedTypes);
      return [];
    }
    
    // Use translated property types if available, otherwise fall back to admin settings
    const enabledTypes = allowedTypes
      .map((type: PropertyType) => {
        const translatedType = translatedPropertyTypes.find(t => t.value === type.value);
        return {
          value: type.value,
          label: translatedType?.label || type.label
        };
      });

    console.log('✅ [PropertyDetailsStep] Found property types:', enabledTypes);
    return enabledTypes;
  }, [settings?.content?.propertyTypes, translatedPropertyTypes]);
  const handleInputChange = (field: keyof PropertySubmissionData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev: PropertySubmissionData) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleSelectChange = (field: keyof PropertySubmissionData) => (value: string) => {
    setFormData((prev: PropertySubmissionData) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLocationChange = (field: keyof typeof formData.location) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev: PropertySubmissionData) => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: e.target.value,
      },
    }));
  };

  const handleCoordinatesChange = (field: 'lat' | 'lng') => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev: PropertySubmissionData) => ({
      ...prev,
      location: {
        ...prev.location,
        coordinates: {
          ...prev.location.coordinates,
          [field]: Number(e.target.value),
        },
      },
    }));
  };

  const handleNumberInput = (field: keyof PropertySubmissionData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev: PropertySubmissionData) => ({
      ...prev,
      [field]: Number(e.target.value),
    }));
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev: PropertySubmissionData) => ({
            ...prev,
            location: {
              ...prev.location,
              coordinates: {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              },
            },
          }));
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-4 text-2xl font-semibold">{t('property.details.title')}</h2>
        <p className="mb-6 text-gray-600">
          {t('property.details.description')}
        </p>
      </div>

      <div className="space-y-4">
        <Input
          label="Property Title"
          placeholder="Enter property title"
          value={formData.title}
          onChange={handleInputChange('title')}
          required
        />

        <Select
          label="Property Type"
          placeholder="Select property type"
          selectedKeys={formData.property_type ? [formData.property_type] : []}
          onSelectionChange={(keys) => {
            const selectedKey = Array.from(keys)[0] as string;
            handleSelectChange('property_type')(selectedKey);
          }}
        >
          {propertyTypes.map((type) => (
            <SelectItem key={type.value}>
              {type.label}
            </SelectItem>
          ))}
        </Select>

        <div className="grid grid-cols-2 gap-4">
          <Input
            type="number"
            label="Price per Night"
            placeholder="Enter price"
            value={formData.price.toString()}
            onChange={handleNumberInput('price')}
            min={0}
            required
          />
          <Select
            label="Currency"
            placeholder="Select currency"
            selectedKeys={formData.currency ? [formData.currency] : []}
            onSelectionChange={(keys) => {
              const selectedKey = Array.from(keys)[0] as string;
              handleSelectChange('currency')(selectedKey);
            }}
          >
            {CURRENCIES.map((currency) => (
              <SelectItem key={currency.value}>
                {currency.label}
              </SelectItem>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            type="number"
            label="Cleaning Fee"
            placeholder="Enter cleaning fee"
            value={formData.cleaning_fee?.toString() || '0'}
            onChange={handleNumberInput('cleaning_fee')}
            min={0}
          />
          <Input
            type="number"
            label="Service Fee"
            placeholder="Enter service fee"
            value={formData.service_fee?.toString() || '0'}
            onChange={handleNumberInput('service_fee')}
            min={0}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Input
            type="number"
            label="Bedrooms"
            value={formData.bedrooms.toString()}
            onChange={handleNumberInput('bedrooms')}
            min={0}
            required
          />
          <Input
            type="number"
            label="Bathrooms"
            value={formData.bathrooms.toString()}
            onChange={handleNumberInput('bathrooms')}
            min={0}
            required
          />
          <Input
            type="number"
            label="Max Guests"
            value={formData.max_guests.toString()}
            onChange={handleNumberInput('max_guests')}
            min={1}
            required
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Location</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="City"
              placeholder="Enter city"
              value={formData.location.city}
              onChange={handleLocationChange('city')}
              required
            />
            <Input
              label="Country"
              placeholder="Enter country"
              value={formData.location.country}
              onChange={handleLocationChange('country')}
              required
            />
          </div>
          <Input
            label="Address"
            placeholder="Enter full address"
            value={formData.location.address || ''}
            onChange={handleLocationChange('address')}
          />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              type="number"
              label="Latitude"
              value={formData.location.coordinates.lat.toString()}
              onChange={handleCoordinatesChange('lat')}
              step="any"
              required
            />
            <Input
              type="number"
              label="Longitude"
              value={formData.location.coordinates.lng.toString()}
              onChange={handleCoordinatesChange('lng')}
              step="any"
              required
            />
          </div>
          <Button
            variant="bordered"
            onClick={getCurrentLocation}
            className="mt-2"
          >
            Get Current Location
          </Button>
          {/* TODO: Add map picker component */}
        </div>

        <Textarea
          label="Description"
          placeholder="Describe your property"
          value={formData.description}
          onChange={handleInputChange('description')}
          required
        />

        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-semibold text-gray-900">Amenities</h3>
            <span className="text-sm text-gray-500">({formData.amenities.length} selected)</span>
          </div>
          <p className="text-sm text-gray-600">Select all amenities available at your property</p>
          
          <div className="space-y-6">
            {amenitiesLoading ? (
              <div className="py-8 text-center">
                <div className="mx-auto size-8 animate-spin rounded-full border-b-2 border-primary-500"></div>
                <p className="mt-2 text-gray-600">Loading amenities...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {translatedAmenities.map((amenity) => (
                  <Card
                    key={amenity.value}
                    className={`cursor-pointer border-2 transition-all duration-200 hover:shadow-md ${
                      formData.amenities.includes(amenity.value)
                        ? 'border-primary-500 bg-primary-50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    isPressable
                    onPress={() => {
                      if (formData.amenities.includes(amenity.value)) {
                        setFormData((prev: PropertySubmissionData) => ({
                          ...prev,
                          amenities: prev.amenities.filter((amenityId: string) => amenityId !== amenity.value),
                        }));
                      } else {
                        setFormData((prev: PropertySubmissionData) => ({
                          ...prev,
                          amenities: [...prev.amenities, amenity.value],
                        }));
                      }
                    }}
                  >
                    <CardBody className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`rounded-lg p-2 ${
                          formData.amenities.includes(amenity.value)
                            ? 'bg-primary-100 text-primary-600'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {AMENITY_ICONS[amenity.value] || <Home className="size-5" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <h5 className="truncate font-medium text-gray-900">{amenity.label}</h5>
                            {formData.amenities.includes(amenity.value) && (
                              <div className="ml-2 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary-500">
                                <svg className="size-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-gray-600">{AMENITY_DESCRIPTIONS[amenity.value] || 'Amenity available'}</p>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailsStep; 