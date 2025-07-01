import React, { useState, useMemo } from 'react'
import { Calendar, DateValue } from '@heroui/react'
import { today, getLocalTimeZone } from '@internationalized/date'
import { AlertCircle, CheckCircle, Calendar as CalendarIcon, MapPin } from 'lucide-react'
import { getTimezoneInfo } from '../../utils/propertyUtils'

interface BookingCalendarProps {
  propertyId: string
  unavailableDates?: string[] // Array of ISO datetime strings
  timezone?: string
  city?: string
  country?: string
  selectedCheckIn?: string
  selectedCheckOut?: string
  onDateChange: (checkIn: string, checkOut: string) => void
  onTimeChange?: (checkInTime: string, checkOutTime: string) => void
  className?: string
}

interface AvailabilityData {
  date: string
  isAvailable: boolean
  conflictReason?: string
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({
  propertyId,
  unavailableDates = [],
  timezone = 'UTC',
  city,
  country,
  selectedCheckIn,
  selectedCheckOut,
  onDateChange,
  onTimeChange,
  className = ''
}) => {
  const [showCalendar, setShowCalendar] = useState(false)
  const [selectedDate, setSelectedDate] = useState<DateValue | null>(null)

  // Process availability data for the next 6 months
  const availabilityData = useMemo(() => {
        const today = new Date()
        const endDate = new Date()
        endDate.setMonth(endDate.getMonth() + 6)
        
    // Create availability map from unavailable dates
    const unavailableMap = new Map<string, boolean>()
    unavailableDates.forEach((datetime: string) => {
      const dateOnly = datetime.split('T')[0] // Extract date part (YYYY-MM-DD)
      unavailableMap.set(dateOnly, true)
    })

    // Generate availability data for the calendar range
    const availability: AvailabilityData[] = []
    let currentDate = new Date(today)
    
    while (currentDate <= endDate) {
      const dateString = currentDate.toISOString().split('T')[0]
      const isUnavailable = unavailableMap.has(dateString)
      
      availability.push({
                date: dateString,
        isAvailable: !isUnavailable,
        conflictReason: isUnavailable ? 'Date is already booked' : undefined
      })
      
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    return availability
  }, [unavailableDates])

  // Create a map for quick lookup
  const availabilityMap = useMemo(() => {
    const map = new Map<string, AvailabilityData>()
    availabilityData.forEach(item => {
      map.set(item.date, item)
    })
    return map
  }, [availabilityData])

  // Get timezone info for display
  const timezoneInfo = useMemo(() => {
    return getTimezoneInfo(timezone)
  }, [timezone])

  // Handle calendar date selection
  const handleCalendarDateSelect = (date: DateValue) => {
    const dateString = date.toString()
    const availability = availabilityMap.get(dateString)
    
    if (availability && !availability.isAvailable) {
      console.log('Selected date is not available:', dateString)
      return
    }

    // Auto-fill date inputs based on current selection
    if (!selectedCheckIn || (selectedCheckIn && selectedCheckOut)) {
      // Start new selection with check-in
      onDateChange(dateString, '')
    } else if (selectedCheckIn && !selectedCheckOut) {
      // Set check-out date
      if (new Date(dateString) > new Date(selectedCheckIn)) {
        onDateChange(selectedCheckIn, dateString)
      } else {
        // If selected date is before check-in, make it the new check-in
        onDateChange(dateString, '')
      }
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Timezone Information */}
      {(city || country) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-blue-800">
            <MapPin className="w-4 h-4" />
            <div className="text-sm">
              {(city || country) && (
                <>
                  <span className="font-medium">
                    {city && country ? `${city}, ${country}` : city || country}
                  </span>
                  <span className="mx-2">•</span>
                </>
              )}
              <span>
                {timezoneInfo.displayName} ({timezoneInfo.offsetFromUTC})
              </span>
              <span className="mx-2">•</span>
              <span>Local time: {timezoneInfo.currentTime}</span>
            </div>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            All times shown are in the property's local timezone to avoid confusion
          </p>
        </div>
      )}

      {/* Primary Date Inputs */}
      <div className="grid grid-cols-2 gap-3">
        <div className="border-2 border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-all focus-within:border-primary-500">
          <label className="block text-xs font-semibold text-gray-700 mb-1">CHECK-IN</label>
          <input
            type="date"
            value={selectedCheckIn || ''}
            onChange={(e) => onDateChange(e.target.value, selectedCheckOut || '')}
            min={today(getLocalTimeZone()).toString()}
            className="w-full text-sm focus:outline-none bg-transparent text-gray-900"
          />
        </div>
        <div className="border-2 border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-all focus-within:border-primary-500">
          <label className="block text-xs font-semibold text-gray-700 mb-1">CHECK-OUT</label>
          <input
            type="date"
            value={selectedCheckOut || ''}
            onChange={(e) => onDateChange(selectedCheckIn || '', e.target.value)}
            min={selectedCheckIn ? new Date(new Date(selectedCheckIn).getTime() + 24*60*60*1000).toISOString().split('T')[0] : today(getLocalTimeZone()).toString()}
            className="w-full text-sm focus:outline-none bg-transparent text-gray-900"
          />
        </div>
      </div>

      {/* Toggle Calendar Button */}
      <button
        type="button"
        onClick={() => setShowCalendar(!showCalendar)}
        className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all text-gray-600 hover:text-primary-600"
      >
        <CalendarIcon className="w-4 h-4" />
        <span className="text-sm font-medium">
          {showCalendar ? 'Hide Calendar' : 'Show Availability Calendar'}
        </span>
      </button>

      {/* Visual Calendar (Collapsible) */}
      {showCalendar && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Property Availability</h4>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-gray-600">Available</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span className="text-gray-600">Booked</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-gray-600">Selected</span>
              </div>
            </div>
          </div>

            <Calendar
              value={selectedDate}
              onChange={(date) => {
                setSelectedDate(date)
                handleCalendarDateSelect(date)
              }}
              minValue={today(getLocalTimeZone())}
              classNames={{
              base: "w-full"
            }}
          />

          {/* Selected Date Info */}
          {selectedDate && (
            <div className="mt-4 p-3 bg-white rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <CalendarIcon className="w-4 h-4 text-primary-500" />
                <span className="font-medium text-gray-900">
                  {selectedDate.toDate(getLocalTimeZone()).toLocaleDateString()}
                </span>
                <span className="text-sm text-gray-500">
                  ({timezone})
                </span>
              </div>
              
              {(() => {
                const dateString = selectedDate.toString()
                const availability = availabilityMap.get(dateString)
                
                if (availability && !availability.isAvailable) {
                  return (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Not Available</span>
                      </div>
                      <p className="text-sm text-gray-600">{availability.conflictReason}</p>
                    </div>
                  )
                }
                
                return (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Available for booking</span>
                  </div>
                )
              })()}
            </div>
          )}
        </div>
      )}

      {/* Helper Text */}
      <p className="text-xs text-gray-500 text-center">
        Use the date inputs above or click on available dates in the calendar
      </p>
    </div>
  )
}

export default BookingCalendar 