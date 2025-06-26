import React, { useState, useEffect } from 'react'
import {
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
import { Filter, DollarSign, MapPin, Users, Home, Settings, Star } from 'lucide-react'
import { useSearchFeed } from '../../../hooks/useSearchFeed'
import { useAdminSettings } from '../../../hooks/useAdminSettings'
import { PropertyType } from '../../../interfaces/Settings'

// Add onSearch prop to the component
interface SearchFiltersProps {
  onSearch: () => void;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({ onSearch }) => {
  // Use our search feed hook
  const { 
    filters, 
    sortBy, 
    applyFilters, 
    clearFilters,
    setSortBy,
    performSearch
  } = useSearchFeed()

  // Use admin settings hook to get property types
  const { settings } = useAdminSettings()

  // Local state for form inputs (initialized from store)
  const [priceRange, setPriceRange] = useState<[number, number]>([
    filters.price_min || 50, 
    filters.price_max || 500
  ])
  const [propertyTypes, setPropertyTypes] = useState<string[]>(filters.property_types || [])
  const [amenities, setAmenities] = useState<string[]>(filters.required_amenities || [])
  const [guests, setGuests] = useState(filters.guest_count || 1)
  const [bedrooms, setBedrooms] = useState(filters.min_bedrooms || 0)
  const [bathrooms, setBathrooms] = useState(filters.min_bathrooms || 0)
  const [location, setLocation] = useState(filters.search_city || '')
  const [country, setCountry] = useState(filters.search_country || '')
  const [rating, setRating] = useState(filters.min_rating || 0)
  const [localSortBy, setLocalSortBy] = useState(sortBy)
  const [isApplying, setIsApplying] = useState(false)

  // Calculate active filters count based on current local state (real-time)
  const activeFiltersCount = React.useMemo(() => {
    let count = 0
    
    // Location filters
    if (location.trim()) count++
    if (country.trim()) count++
    
    // Price filters (only if not default range)
    if (priceRange[0] !== 50 || priceRange[1] !== 500) count++
    
    // Property types
    if (propertyTypes.length > 0) count++
    
    // Amenities
    if (amenities.length > 0) count++
    
    // Guest/room filters
    if (guests > 1) count++
    if (bedrooms > 0) count++
    if (bathrooms > 0) count++
    
    // Rating filter
    if (rating > 0) count++
    
    // Sort (only if not default)
    if (localSortBy !== 'relevance') count++
    
    return count
  }, [location, country, priceRange, propertyTypes, amenities, guests, bedrooms, bathrooms, rating, localSortBy])

  // Update local state when store changes
  useEffect(() => {
    setPriceRange([filters.price_min || 50, filters.price_max || 500])
    setPropertyTypes(filters.property_types || [])
    setAmenities(filters.required_amenities || [])
    setGuests(filters.guest_count || 1)
    setBedrooms(filters.min_bedrooms || 0)
    setBathrooms(filters.min_bathrooms || 0)
    setLocation(filters.search_city || '')
    setCountry(filters.search_country || '')
    setRating(filters.min_rating || 0)
    setLocalSortBy(sortBy)
  }, [filters, sortBy])

  // Get property types from admin settings, filtered for enabled ones
  const propertyTypeOptions = React.useMemo(() => {
    console.log('🔍 [SearchFilters] Debugging admin settings:', {
      settings: settings,
      content: settings?.content,
      propertyTypes: settings?.content?.propertyTypes,
      settingsKeys: settings ? Object.keys(settings) : [],
      contentKeys: settings?.content ? Object.keys(settings.content) : []
    });

    const allowedTypes = settings?.content?.propertyTypes
    if (!allowedTypes || !Array.isArray(allowedTypes)) {
      console.log('❌ [SearchFilters] No property types found or not an array:', allowedTypes);
      return []
    }
    
    const enabledTypes = allowedTypes
      .map((type: PropertyType) => ({
        value: type.value,
        label: type.label
      }))

    console.log('✅ [SearchFilters] Found property types:', enabledTypes);
    return enabledTypes;
  }, [settings?.content?.propertyTypes])

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

  const handleApply = async () => {
    console.log('🎯 [FILTER] Apply button clicked!')
    setIsApplying(true)
    
    try {
      // Apply sort order first if changed
      if (localSortBy !== sortBy) {
        setSortBy(localSortBy)
      }

      // Notify parent that search is starting
      onSearch()

      // Apply filters to the search store (this already calls performSearch internally)
      await applyFilters({
        search_city: location || undefined,
        search_country: country || undefined,
        price_min: priceRange[0] !== 50 ? priceRange[0] : undefined,
        price_max: priceRange[1] !== 500 ? priceRange[1] : undefined,
        property_types: propertyTypes.length > 0 ? propertyTypes : undefined,
        required_amenities: amenities.length > 0 ? amenities : undefined,
        guest_count: guests > 1 ? guests : undefined,
        min_bedrooms: bedrooms > 0 ? bedrooms : undefined,
        min_bathrooms: bathrooms > 0 ? bathrooms : undefined,
        min_rating: rating > 0 ? rating : undefined
      })

      console.log('✅ [FILTER] Filters applied successfully!')
    } catch (error) {
      console.error('❌ [FILTER] Failed to apply filters:', error)
    } finally {
      setIsApplying(false)
    }
  }

  const handleReset = () => {
    console.log('🧹 Resetting filters')
    
    // Reset local state
    setPriceRange([50, 500])
    setPropertyTypes([])
    setAmenities([])
    setGuests(1)
    setBedrooms(0)
    setBathrooms(0)
    setLocation('')
    setCountry('')
    setRating(0)
    setLocalSortBy('relevance')
    
    // Clear filters in store
    clearFilters()
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
      {/* Location */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="City"
          placeholder="Enter city, neighborhood, or address"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          startContent={<MapPin className="w-4 h-4 text-gray-400" />}
          className="w-full"
        />
        <Input
          label="Country"
          placeholder="Enter country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          startContent={<MapPin className="w-4 h-4 text-gray-400" />}
          className="w-full"
        />
      </div>

      <Divider className="my-6" />

      {/* Price Range */}
      <div className="space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Price Range (per night)
        </h3>
        <Slider
          label="Price Range"
          step={10}
          minValue={0}
          maxValue={1000}
          value={priceRange}
          onChange={(value) => setPriceRange(value as [number, number])}
          className="max-w-md"
          color="primary"
          classNames={{
            track: "bg-gray-200",
            filler: "bg-primary-500",
            thumb: "bg-primary-500 border-primary-500"
          }}
        />
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>${priceRange[0]}</span>
          <Divider orientation="horizontal" className="flex-1" />
          <span>${priceRange[1]}</span>
        </div>
      </div>

      <Divider className="my-6" />

      {/* Property Type */}
      <div>
        <h3 className="font-semibold flex items-center gap-2 mb-3">
          <Home className="w-5 h-5" />
          Property Type
        </h3>
        <CheckboxGroup
          value={propertyTypes}
          onChange={setPropertyTypes}
          classNames={{
            wrapper: "grid grid-cols-2 md:grid-cols-3 gap-3"
          }}
        >
          {propertyTypeOptions.map((option) => (
            <Checkbox
              key={option.value}
              value={option.value}
              color="primary"
              className="text-sm"
              classNames={{
                wrapper: "before:!bg-white border-2 border-gray-300 data-[selected=true]:!border-primary-500 data-[selected=true]:before:!bg-white group-data-[selected=true]:after:!bg-primary-500",
                label: "text-gray-700"
              }}
            >
              {option.label}
            </Checkbox>
          ))}
        </CheckboxGroup>
      </div>

      <Divider />

      {/* Rooms & Guests */}
      <div>
        <h3 className="font-semibold flex items-center gap-2 mb-3">
          <Users className="w-5 h-5" />
          Rooms & Guests
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            type="number"
            label="Guests"
            placeholder="Number of guests"
            value={guests.toString()}
            onChange={(e) => {
              const value = parseInt(e.target.value) || 1
              setGuests(Math.max(1, Math.min(20, value))) // Min 1, Max 20 guests
            }}
            min={1}
            max={20}
            variant="bordered"
            size="md"
            className="w-full"
            startContent={<Users className="w-4 h-4 text-gray-400" />}
          />

          <Input
            type="number"
            label="Bedrooms"
            placeholder="0 = Any"
            value={bedrooms > 0 ? bedrooms.toString() : ''}
            onChange={(e) => {
              const value = parseInt(e.target.value) || 0
              setBedrooms(Math.max(0, Math.min(10, value))) // Min 0, Max 10 bedrooms
            }}
            min={0}
            max={10}
            variant="bordered"
            size="md"
            className="w-full"
            startContent={<Home className="w-4 h-4 text-gray-400" />}
          />

          <Input
            type="number"
            label="Bathrooms"
            placeholder="0 = Any"
            value={bathrooms > 0 ? bathrooms.toString() : ''}
            onChange={(e) => {
              const value = parseInt(e.target.value) || 0
              setBathrooms(Math.max(0, Math.min(10, value))) // Min 0, Max 10 bathrooms
            }}
            min={0}
            max={10}
            variant="bordered"
            size="md"
            className="w-full"
            startContent={<Home className="w-4 h-4 text-gray-400" />}
          />
        </div>
      </div>

      <Divider />

      {/* Amenities */}
      <div>
        <h3 className="font-semibold flex items-center gap-2 mb-3">
          <Settings className="w-5 h-5" />
          Amenities
        </h3>
        <CheckboxGroup
          value={amenities}
          onChange={setAmenities}
          classNames={{
            wrapper: "grid grid-cols-2 md:grid-cols-4 gap-2"
          }}
        >
          {amenityOptions.map((amenity) => (
            <Checkbox 
              key={amenity} 
              value={amenity}
              color="primary"
              className="text-sm"
              classNames={{
                wrapper: "before:!bg-white border-2 border-gray-300 data-[selected=true]:!border-primary-500 data-[selected=true]:before:!bg-white group-data-[selected=true]:after:!bg-primary-500",
                label: "text-gray-700"
              }}
            >
              {amenity}
            </Checkbox>
          ))}
        </CheckboxGroup>
      </div>

      <Divider />

      {/* Rating Filter */}
      <div className="flex flex-col items-start">
        <h3 className="font-semibold flex items-center gap-2 mb-3">
          <Star className="w-5 h-5" />
          Minimum Rating
        </h3>
        <Select
          label="Minimum Rating"
          placeholder="Select minimum rating"
          selectedKeys={rating > 0 ? new Set([rating.toString()]) : new Set()}
          onSelectionChange={(keys) => {
            const value = Array.from(keys)[0] as string
            if (value) {
              setRating(parseFloat(value))
            } else {
              setRating(0)
            }
          }}
          variant="bordered"
          size="md"
          className="max-w-xs w-full sm:w-64"
          classNames={{
            trigger: "bg-white",
            base: "min-w-[200px]"
          }}
        >
          <SelectItem key="0" textValue="Any rating">
            Any rating
          </SelectItem>
          <SelectItem key="3" textValue="3+ stars">
            <div className="flex items-center gap-2">
              <span>3+</span>
              <div className="flex">
                {[1, 2, 3].map((star) => (
                  <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </div>
          </SelectItem>
          <SelectItem key="4" textValue="4+ stars">
            <div className="flex items-center gap-2">
              <span>4+</span>
              <div className="flex">
                {[1, 2, 3, 4].map((star) => (
                  <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </div>
          </SelectItem>
          <SelectItem key="4.5" textValue="4.5+ stars">
            <div className="flex items-center gap-2">
              <span>4.5+</span>
              <div className="flex">
                {[1, 2, 3, 4].map((star) => (
                  <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
                <Star className="w-4 h-4 fill-yellow-400/50 text-yellow-400" />
              </div>
            </div>
          </SelectItem>
        </Select>
      </div>

      <Divider />

      {/* Sort Options */}
      <div className="flex flex-col items-start">
        <h3 className="font-semibold flex items-center gap-2 mb-3">
          <Filter className="w-5 h-5" />
          Sort by
        </h3>
        <Select
          label="Sort by"
          placeholder="Choose sort order"
          selectedKeys={new Set([localSortBy])}
          onSelectionChange={(keys) => {
            const value = Array.from(keys)[0] as string
            if (value) setLocalSortBy(value)
          }}
          variant="bordered"
          size="md"
          className="max-w-xs w-full sm:w-64"
          classNames={{
            trigger: "bg-white",
            base: "min-w-[200px]"
          }}
        >
          <SelectItem key="relevance" textValue="Relevance (Default)">
            Relevance (Default)
          </SelectItem>
          <SelectItem key="price_asc" textValue="Price: Low to High">
            Price: Low to High
          </SelectItem>
          <SelectItem key="price_desc" textValue="Price: High to Low">
            Price: High to Low
          </SelectItem>
          <SelectItem key="rating_desc" textValue="Rating: High to Low">
            Rating: High to Low
          </SelectItem>
          <SelectItem key="newest" textValue="Newest First">
            Newest First
          </SelectItem>
        </Select>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4">
        <Button
          color="default"
          variant="light"
          onPress={handleReset}
          className="text-gray-600"
          isDisabled={activeFiltersCount === 0}
        >
          Reset All
        </Button>

        <div className="flex items-center gap-3">
          {activeFiltersCount > 0 && (
            <Chip
              color="primary"
              variant="flat"
              className="bg-primary-50 text-primary-700"
            >
              {activeFiltersCount} {activeFiltersCount === 1 ? 'filter' : 'filters'} active
            </Chip>
          )}
          <Button
            color="primary"
            variant="solid"
            onPress={handleApply}
            isLoading={isApplying}
            className="bg-primary-500 hover:bg-primary-600 text-white"
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  )
} 