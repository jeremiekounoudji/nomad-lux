import React from 'react';
import { Input, Select, SelectItem, Textarea, Checkbox, Button } from '@heroui/react';
import type { PropertySubmissionData } from '../PropertySubmissionForm';

interface PropertyDetailsStepProps {
  formData: PropertySubmissionData;
  setFormData: React.Dispatch<React.SetStateAction<PropertySubmissionData>>;
}

const PROPERTY_TYPES = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'house', label: 'House' },
  { value: 'villa', label: 'Villa' },
  { value: 'condo', label: 'Condominium' },
  { value: 'studio', label: 'Studio' },
];

const AMENITIES = {
  basic: [
    { id: 'wifi', label: 'WiFi' },
    { id: 'ac', label: 'Air Conditioning' },
    { id: 'kitchen', label: 'Kitchen' },
    { id: 'parking', label: 'Parking' },
    { id: 'tv', label: 'TV' },
  ],
  comfort: [
    { id: 'pool', label: 'Swimming Pool' },
    { id: 'gym', label: 'Gym' },
    { id: 'garden', label: 'Garden' },
    { id: 'balcony', label: 'Balcony' },
    { id: 'bbq', label: 'BBQ Area' },
  ],
  safety: [
    { id: 'security', label: '24/7 Security' },
    { id: 'cctv', label: 'CCTV' },
    { id: 'fire_alarm', label: 'Fire Alarm' },
    { id: 'first_aid', label: 'First Aid Kit' },
    { id: 'safe', label: 'Safe Box' },
  ],
};

const CURRENCIES = [
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
  { value: 'GBP', label: 'GBP' },
];

const PropertyDetailsStep: React.FC<PropertyDetailsStepProps> = ({ formData, setFormData }) => {
  const handleInputChange = (field: keyof PropertySubmissionData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleSelectChange = (field: keyof PropertySubmissionData) => (value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLocationChange = (field: keyof typeof formData.location) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
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
    setFormData((prev) => ({
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
    setFormData((prev) => ({
      ...prev,
      [field]: Number(e.target.value),
    }));
  };



  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
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
          selectedKeys={formData.propertyType ? [formData.propertyType] : []}
          onSelectionChange={(keys) => {
            const selectedKey = Array.from(keys)[0] as string;
            handleSelectChange('propertyType')(selectedKey);
          }}
        >
          {PROPERTY_TYPES.map((type) => (
            <SelectItem key={type.value} value={type.value}>
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
              <SelectItem key={currency.value} value={currency.value}>
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
            value={formData.cleaningFee?.toString() || '0'}
            onChange={handleNumberInput('cleaningFee')}
            min={0}
          />
          <Input
            type="number"
            label="Service Fee"
            placeholder="Enter service fee"
            value={formData.serviceFee?.toString() || '0'}
            onChange={handleNumberInput('serviceFee')}
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
            value={formData.maxGuests.toString()}
            onChange={handleNumberInput('maxGuests')}
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

        <div className="space-y-4">
          <label className="block text-sm font-medium">Amenities</label>
          
          <div className="space-y-4">
            {Object.entries(AMENITIES).map(([category, items]) => (
              <div key={category} className="space-y-2">
                <h3 className="text-lg font-medium capitalize">{category}</h3>
                <div className="grid grid-cols-2 gap-3">
                  {items.map(({ id, label }) => (
                    <Checkbox
                      key={id}
                      isSelected={formData.amenities.includes(id)}
                      onValueChange={(isSelected) => {
                        if (isSelected) {
                          setFormData((prev) => ({
                            ...prev,
                            amenities: [...prev.amenities, id],
                          }));
                        } else {
                          setFormData((prev) => ({
                            ...prev,
                            amenities: prev.amenities.filter((amenityId) => amenityId !== id),
                          }));
                        }
                      }}
                      color="secondary"
                      className="text-gray-700 hover:text-secondary-600"
                      classNames={{
                        base: "inline-flex max-w-md w-full bg-content1 m-0 hover:bg-secondary-50 items-center justify-start cursor-pointer rounded-lg gap-2 p-4 border-2 border-transparent data-[selected=true]:border-secondary-500",
                        label: "w-full",
                      }}
                    >
                      {label}
                    </Checkbox>
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