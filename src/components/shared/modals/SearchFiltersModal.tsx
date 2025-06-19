import React, { useState } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Slider,
  Select,
  SelectItem,
  Checkbox,
  CheckboxGroup,
  Input,
  Divider,
  Chip
} from '@heroui/react'
import { Filter, DollarSign, MapPin, Users, Home, Settings } from 'lucide-react'
import { SearchFiltersModalProps } from '../../../interfaces/Component'

export const SearchFiltersModal: React.FC<SearchFiltersModalProps> = ({
  isOpen,
  onClose,
  onApplyFilters
}) => {
  const [priceRange, setPriceRange] = useState<[number, number]>([50, 500])
  const [propertyTypes, setPropertyTypes] = useState<string[]>([])
  const [amenities, setAmenities] = useState<string[]>([])
  const [guests, setGuests] = useState(1)
  const [bedrooms, setBedrooms] = useState(0)
  const [bathrooms, setBathrooms] = useState(0)
  const [location, setLocation] = useState('')

  const propertyTypeOptions = [
    { value: 'apartment', label: 'Apartment' },
    { value: 'house', label: 'House' },
    { value: 'villa', label: 'Villa' },
    { value: 'condo', label: 'Condo' },
    { value: 'loft', label: 'Loft' },
    { value: 'studio', label: 'Studio' }
  ]

  const amenityOptions = [
    'WiFi',
    'Kitchen',
    'Parking',
    'Pool',
    'Hot tub',
    'Air conditioning',
    'Heating',
    'Washer',
    'Dryer',
    'TV',
    'Fireplace',
    'Gym',
    'Balcony',
    'Garden',
    'Pet friendly',
    'Smoking allowed'
  ]

  const handleApply = () => {
    onApplyFilters({
      priceRange,
      propertyType: propertyTypes,
      amenities,
      guests,
      bedrooms,
      bathrooms,
      location
    })
    onClose()
  }

  const handleReset = () => {
    setPriceRange([50, 500])
    setPropertyTypes([])
    setAmenities([])
    setGuests(1)
    setBedrooms(0)
    setBathrooms(0)
    setLocation('')
  }

  const activeFiltersCount = 
    (priceRange[0] !== 50 || priceRange[1] !== 500 ? 1 : 0) +
    propertyTypes.length +
    amenities.length +
    (guests > 1 ? 1 : 0) +
    (bedrooms > 0 ? 1 : 0) +
    (bathrooms > 0 ? 1 : 0) +
    (location ? 1 : 0)

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="2xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-6 h-6 text-primary-500" />
                <h2 className="text-xl font-bold">Filters</h2>
                {activeFiltersCount > 0 && (
                  <Chip size="sm" color="primary" variant="flat">
                    {activeFiltersCount} active
                  </Chip>
                )}
              </div>
              <Button
                variant="light"
                size="sm"
                onPress={handleReset}
                isDisabled={activeFiltersCount === 0}
              >
                Reset all
              </Button>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-6">
                {/* Location */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Location
                  </h4>
                  <Input
                    placeholder="Enter city, neighborhood, or address"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    startContent={<MapPin className="w-4 h-4 text-gray-400" />}
                  />
                </div>

                <Divider />

                {/* Price Range */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Price Range (per night)
                  </h4>
                  <Slider
                    label="Price Range"
                    step={10}
                    minValue={0}
                    maxValue={1000}
                    value={priceRange}
                    onChange={(value) => setPriceRange(value as [number, number])}
                    formatOptions={{ style: 'currency', currency: 'USD' }}
                    className="w-full"
                  />
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}+</span>
                  </div>
                </div>

                <Divider />

                {/* Property Type */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Home className="w-5 h-5" />
                    Property Type
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {propertyTypeOptions.map((option) => (
                      <Checkbox
                        key={option.value}
                        isSelected={propertyTypes.includes(option.value)}
                        onValueChange={(checked) => {
                          if (checked) {
                            setPropertyTypes([...propertyTypes, option.value])
                          } else {
                            setPropertyTypes(propertyTypes.filter(type => type !== option.value))
                          }
                        }}
                      >
                        {option.label}
                      </Checkbox>
                    ))}
                  </div>
                </div>

                <Divider />

                {/* Rooms & Guests */}
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Rooms & Guests
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Select
                      label="Guests"
                      selectedKeys={[guests.toString()]}
                      onSelectionChange={(keys) => setGuests(parseInt(Array.from(keys)[0] as string))}
                    >
                      {Array.from({ length: 10 }, (_, i) => (
                        <SelectItem key={`${i + 1}`} value={`${i + 1}`}>
                          {i + 1} guest{i > 0 ? 's' : ''}
                        </SelectItem>
                      ))}
                    </Select>

                    <Select
                      label="Bedrooms"
                      selectedKeys={[bedrooms.toString()]}
                      onSelectionChange={(keys) => setBedrooms(parseInt(Array.from(keys)[0] as string))}
                    >
                      <SelectItem key="0" value="0">Any</SelectItem>
                      {Array.from({ length: 6 }, (_, i) => (
                        <SelectItem key={`${i + 1}`} value={`${i + 1}`}>
                          {i + 1} bedroom{i > 0 ? 's' : ''}
                        </SelectItem>
                      ))}
                    </Select>

                    <Select
                      label="Bathrooms"
                      selectedKeys={[bathrooms.toString()]}
                      onSelectionChange={(keys) => setBathrooms(parseInt(Array.from(keys)[0] as string))}
                    >
                      <SelectItem key="0" value="0">Any</SelectItem>
                      {Array.from({ length: 4 }, (_, i) => (
                        <SelectItem key={`${i + 1}`} value={`${i + 1}`}>
                          {i + 1} bathroom{i > 0 ? 's' : ''}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>
                </div>

                <Divider />

                {/* Amenities */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Amenities
                  </h4>
                  <CheckboxGroup
                    value={amenities}
                    onValueChange={setAmenities}
                    classNames={{
                      wrapper: "grid grid-cols-2 gap-2"
                    }}
                  >
                    {amenityOptions.map((amenity) => (
                      <Checkbox key={amenity} value={amenity}>
                        {amenity}
                      </Checkbox>
                    ))}
                  </CheckboxGroup>
                </div>

                {/* Selected Filters Summary */}
                {activeFiltersCount > 0 && (
                  <>
                    <Divider />
                    <div className="space-y-3">
                      <h4 className="font-semibold">Active Filters</h4>
                      <div className="flex flex-wrap gap-2">
                        {(priceRange[0] !== 50 || priceRange[1] !== 500) && (
                          <Chip size="sm" variant="flat" color="primary">
                            ${priceRange[0]} - ${priceRange[1]}
                          </Chip>
                        )}
                        {propertyTypes.map((type) => (
                          <Chip key={type} size="sm" variant="flat" color="secondary">
                            {propertyTypeOptions.find(opt => opt.value === type)?.label}
                          </Chip>
                        ))}
                        {guests > 1 && (
                          <Chip size="sm" variant="flat" color="success">
                            {guests} guests
                          </Chip>
                        )}
                        {bedrooms > 0 && (
                          <Chip size="sm" variant="flat" color="warning">
                            {bedrooms} bedroom{bedrooms > 1 ? 's' : ''}
                          </Chip>
                        )}
                        {bathrooms > 0 && (
                          <Chip size="sm" variant="flat" color="danger">
                            {bathrooms} bathroom{bathrooms > 1 ? 's' : ''}
                          </Chip>
                        )}
                        {amenities.slice(0, 3).map((amenity) => (
                          <Chip key={amenity} size="sm" variant="flat" color="default">
                            {amenity}
                          </Chip>
                        ))}
                        {amenities.length > 3 && (
                          <Chip size="sm" variant="flat" color="default">
                            +{amenities.length - 3} more
                          </Chip>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="default" variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button color="primary" onPress={handleApply}>
                Apply Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
} 