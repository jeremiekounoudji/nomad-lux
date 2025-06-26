import React, { useMemo } from 'react';
import { Input, Select, SelectItem, Textarea, Button, Card, CardBody } from '@heroui/react';
import { Wifi, Car, Utensils, Waves, Shield, Dumbbell, TreePine, Home, Flame, Heart, Tv, Gamepad2, Wind, Coffee, WashingMachine, Sparkles } from 'lucide-react';
import type { PropertySubmissionData } from '../../../../interfaces';
import type { PropertyType } from '../../../../interfaces/Settings';
import { useAdminSettings } from '../../../../hooks/useAdminSettings';

interface PropertyDetailsStepProps {
  formData: PropertySubmissionData;
  setFormData: React.Dispatch<React.SetStateAction<PropertySubmissionData>>;
}

// Property types will be loaded from admin settings

const AMENITIES = {
  basic: [
    { id: 'wifi', label: 'WiFi', icon: <Wifi className="w-5 h-5" />, description: 'High-speed internet' },
    { id: 'ac', label: 'Air Conditioning', icon: <Wind className="w-5 h-5" />, description: 'Climate control' },
    { id: 'kitchen', label: 'Kitchen', icon: <Utensils className="w-5 h-5" />, description: 'Fully equipped' },
    { id: 'parking', label: 'Parking', icon: <Car className="w-5 h-5" />, description: 'Free parking space' },
    { id: 'tv', label: 'TV', icon: <Tv className="w-5 h-5" />, description: 'Cable/Streaming' },
    { id: 'washer', label: 'Washer', icon: <WashingMachine className="w-5 h-5" />, description: 'Laundry facilities' },
  ],
  comfort: [
    { id: 'pool', label: 'Swimming Pool', icon: <Waves className="w-5 h-5" />, description: 'Private or shared pool' },
    { id: 'gym', label: 'Gym', icon: <Dumbbell className="w-5 h-5" />, description: 'Fitness center' },
    { id: 'garden', label: 'Garden', icon: <TreePine className="w-5 h-5" />, description: 'Outdoor space' },
    { id: 'balcony', label: 'Balcony', icon: <Home className="w-5 h-5" />, description: 'Private balcony' },
    { id: 'bbq', label: 'BBQ Area', icon: <Flame className="w-5 h-5" />, description: 'Outdoor grilling' },
    { id: 'hot_tub', label: 'Hot Tub', icon: <Heart className="w-5 h-5" />, description: 'Relaxation area' },
  ],
  safety: [
    { id: 'security', label: '24/7 Security', icon: <Shield className="w-5 h-5" />, description: 'Round-the-clock security' },
    { id: 'cctv', label: 'CCTV', icon: <Shield className="w-5 h-5" />, description: 'Video surveillance' },
    { id: 'fire_alarm', label: 'Fire Alarm', icon: <Shield className="w-5 h-5" />, description: 'Fire safety system' },
    { id: 'first_aid', label: 'First Aid Kit', icon: <Heart className="w-5 h-5" />, description: 'Emergency medical kit' },
    { id: 'safe', label: 'Safe Box', icon: <Shield className="w-5 h-5" />, description: 'Secure storage' },
  ],
  entertainment: [
    { id: 'gaming', label: 'Gaming Console', icon: <Gamepad2 className="w-5 h-5" />, description: 'PlayStation/Xbox' },
    { id: 'coffee_machine', label: 'Coffee Machine', icon: <Coffee className="w-5 h-5" />, description: 'Fresh coffee daily' },
    { id: 'cleaning_service', label: 'Cleaning Service', icon: <Sparkles className="w-5 h-5" />, description: 'Regular housekeeping' },
  ],
};

const CURRENCIES = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'XOF', label: 'XOF - West African CFA Franc' },
  { value: 'XAF', label: 'XAF - Central African CFA Franc' },
];

const PropertyDetailsStep: React.FC<PropertyDetailsStepProps> = ({ formData, setFormData }) => {
  // Use admin settings hook to get property types
  const { settings } = useAdminSettings();

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
    
    const enabledTypes = allowedTypes
      .map((type: PropertyType) => ({
        value: type.value,
        label: type.label
      }));

    console.log('✅ [PropertyDetailsStep] Found property types:', enabledTypes);
    return enabledTypes;
  }, [settings?.content?.propertyTypes]);
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
        <h2 className="text-2xl font-semibold mb-4">Property Details</h2>
        <p className="text-gray-600 mb-6">
          Provide information about your property, its location, and available amenities.
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <p className="text-gray-600 text-sm">Select all amenities available at your property</p>
          
          <div className="space-y-6">
            {Object.entries(AMENITIES).map(([category, items]) => (
              <div key={category} className="space-y-4">
                <h4 className="text-lg font-medium text-gray-800 capitalize flex items-center gap-2">
                  {category === 'basic' && <Home className="w-5 h-5 text-blue-600" />}
                  {category === 'comfort' && <Heart className="w-5 h-5 text-purple-600" />}
                  {category === 'safety' && <Shield className="w-5 h-5 text-green-600" />}
                  {category === 'entertainment' && <Gamepad2 className="w-5 h-5 text-orange-600" />}
                  {category} Amenities
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map(({ id, label, icon, description }) => (
                    <Card
                      key={id}
                      className={`cursor-pointer transition-all duration-200 border-2 hover:shadow-md ${
                        formData.amenities.includes(id)
                          ? 'border-primary-500 bg-primary-50 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      isPressable
                      onPress={() => {
                        if (formData.amenities.includes(id)) {
                          setFormData((prev: PropertySubmissionData) => ({
                            ...prev,
                            amenities: prev.amenities.filter((amenityId: string) => amenityId !== id),
                          }));
                        } else {
                          setFormData((prev: PropertySubmissionData) => ({
                            ...prev,
                            amenities: [...prev.amenities, id],
                          }));
                        }
                      }}
                    >
                      <CardBody className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${
                            formData.amenities.includes(id)
                              ? 'bg-primary-100 text-primary-600'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h5 className="font-medium text-gray-900 truncate">{label}</h5>
                              {formData.amenities.includes(id) && (
                                <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0 ml-2">
                                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{description}</p>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailsStep; 