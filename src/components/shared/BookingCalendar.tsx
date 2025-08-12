import React, { useState, useMemo } from 'react'
import { Calendar, DateValue } from '@heroui/react'
import { today, getLocalTimeZone } from '@internationalized/date'
import { Calendar as CalendarIcon, MapPin } from 'lucide-react'
import { getTimezoneInfo } from '../../utils/propertyUtils'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

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
  // propertyId is reserved for future analytics and logging
  propertyId,
  unavailableDates = [],
  timezone = 'UTC',
  city,
  country,
  selectedCheckIn,
  selectedCheckOut,
  onDateChange,
  // onTimeChange is reserved for future time picking feature
  onTimeChange,
  className = ''
}) => {
  const { t } = useTranslation(['booking', 'common'])
  const [showCalendar, setShowCalendar] = useState(false)
  const [selectedDate, setSelectedDate] = useState<DateValue | null>(null)
  // Time fields reserved for future UI (time pickers)
  const [checkInTime] = useState('06:00')
  const [checkOutTime] = useState('12:00')
  // Reference otherwise-unused variables to satisfy linter while keeping API stable
  void propertyId
  void onTimeChange
  void checkInTime
  void checkOutTime

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
        conflictReason: isUnavailable ? t('booking.messages.unavailableDates') : undefined
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
      console.log('❌ Selected date is not available:', dateString)
      toast.error(t('booking.messages.dateUnavailableOn', { date: new Date(dateString).toLocaleDateString() }))
      return
    }

    console.log('🗓️ Calendar date selected:', dateString)
    console.log('Current state - Check-in:', selectedCheckIn, 'Check-out:', selectedCheckOut)

    if (!selectedCheckIn || (selectedCheckIn && selectedCheckOut)) {
      // Start new selection with check-in
      console.log('📅 Setting new check-in date:', dateString)
      onDateChange(dateString, '')
      setSelectedDate(date)
      toast.success(t('booking.messages.checkInSelected'))
    } else if (selectedCheckIn && !selectedCheckOut) {
      // Set check-out date if it's after check-in
      const checkInDate = new Date(selectedCheckIn)
      const selectedDate = new Date(dateString)
      
      if (selectedDate > checkInDate) {
        console.log('📅 Setting check-out date:', dateString)
        onDateChange(selectedCheckIn, dateString)
        toast.success(t('booking.messages.checkOutSelected'))
      } else {
        // If selected date is before check-in, make it the new check-in
        console.log('📅 Selected date is before current check-in, updating check-in:', dateString)
        onDateChange(dateString, '')
        toast.success(t('booking.messages.checkInUpdated'))
      }
      setSelectedDate(date)
    }
  }

  // Check if a date range has any unavailable dates
  const isDateRangeAvailable = (startDate: Date, endDate: Date): { isAvailable: boolean; conflictDate: string } => {
    let currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      const dateString = currentDate.toISOString().split('T')[0]
      const availability = availabilityMap.get(dateString)
      if (availability && !availability.isAvailable) {
        return { isAvailable: false, conflictDate: dateString }
      }
      currentDate.setDate(currentDate.getDate() + 1)
    }
    return { isAvailable: true, conflictDate: '' }
  }

  // Handle direct input changes
  const handleInputChange = (type: 'checkin' | 'checkout', value: string) => {
    console.log(`🔄 Handling ${type} input change:`, value)
    
    if (!value) {
      if (type === 'checkin') {
        console.log('🗑️ Clearing check-in date')
        onDateChange('', '')  // Clear both dates when check-in is cleared
        toast.success(t('booking.messages.datesCleared'))
      } else {
        console.log('🗑️ Clearing check-out date')
        onDateChange(selectedCheckIn || '', '')  // Only clear check-out
        toast.success(t('booking.messages.checkOutCleared'))
      }
      return
    }

    const newDate = new Date(value)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Validate date is not in the past
    if (newDate < today) {
      console.log('❌ Cannot select past date')
      toast.error(t('booking.messages.pastDateNotAllowed'))
      return
    }

    // Check if the individual date is available
    const availability = availabilityMap.get(value)
    if (availability && !availability.isAvailable) {
      console.log('❌ Selected date is not available:', value)
      toast.error(t('booking.messages.dateUnavailableOn', { date: new Date(value).toLocaleDateString() }))
      return
    }
    
    if (type === 'checkin') {
      const currentCheckOut = selectedCheckOut ? new Date(selectedCheckOut) : null
      
      if (currentCheckOut) {
        // Check if the new date range has any unavailable dates
        const { isAvailable, conflictDate } = isDateRangeAvailable(newDate, currentCheckOut)
        if (!isAvailable) {
          console.log('❌ Date range contains unavailable date:', conflictDate)
          toast.error(t('booking.messages.rangeIncludesUnavailableOn', { date: new Date(conflictDate).toLocaleDateString() }))
          return
        }

        if (currentCheckOut <= newDate) {
          // If new check-in is after or equal to current check-out, clear check-out
          console.log('📅 New check-in affects check-out, clearing check-out')
          onDateChange(value, '')
          toast.success(t('booking.messages.checkOutClearedDueToCheckIn'))
        } else {
          console.log('📅 Updating check-in date:', value)
          onDateChange(value, selectedCheckOut || '')
          toast.success(t('booking.messages.checkInUpdated'))
        }
      } else {
        console.log('📅 Setting new check-in date:', value)
        onDateChange(value, '')
        toast.success(t('booking.messages.checkInSelected'))
      }
    } else {
      if (!selectedCheckIn) {
        console.log('❌ Please select check-in date first')
        toast.error(t('booking.messages.selectCheckInFirst'))
        return
      }
      
      const checkInDate = new Date(selectedCheckIn)
      
      if (newDate <= checkInDate) {
        console.log('❌ Check-out must be after check-in')
        toast.error(t('booking.messages.checkoutAfterCheckin'))
        return
      }

      // Check if the new date range has any unavailable dates
      const { isAvailable, conflictDate } = isDateRangeAvailable(checkInDate, newDate)
      if (!isAvailable) {
        console.log('❌ Date range contains unavailable date:', conflictDate)
        toast.error(t('booking.messages.rangeIncludesUnavailableOn', { date: new Date(conflictDate).toLocaleDateString() }))
        return
      }

      console.log('📅 Updating check-out date:', value)
      onDateChange(selectedCheckIn, value)
      toast.success(t('booking.messages.checkOutUpdated'))
    }
  }

  // Handle time change
  // Time change handler is currently unused in UI. Keep minimal state and callback wiring if needed in future.

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
              <span>{t('booking.calendar.localTimeLabel')} {timezoneInfo.currentTime}</span>
            </div>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            {t('booking.calendar.timezoneNotice')}
          </p>
        </div>
      )}

      {/* Primary Date Inputs */}
      <div className="grid grid-cols-2 gap-3">
        <div className="border-2 border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-all focus-within:border-primary-500">
          <label className="block text-xs font-semibold text-gray-700 mb-1">{t('booking.labels.checkIn')}</label>
          <input
            type="date"
            value={selectedCheckIn || ''}
            onChange={(e) => handleInputChange('checkin', e.target.value)}
            min={today(getLocalTimeZone()).toString()}
            className="w-full text-sm focus:outline-none bg-transparent text-gray-900"
          />
        </div>
        <div className="border-2 border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-all focus-within:border-primary-500">
          <label className="block text-xs font-semibold text-gray-700 mb-1">{t('booking.labels.checkOut')}</label>
          <input
            type="date"
            value={selectedCheckOut || ''}
            onChange={(e) => handleInputChange('checkout', e.target.value)}
            min={selectedCheckIn ? new Date(new Date(selectedCheckIn).getTime() + 24*60*60*1000).toISOString().split('T')[0] : today(getLocalTimeZone()).toString()}
            className="w-full text-sm focus:outline-none bg-transparent text-gray-900"
          />
        </div>
      </div>

      {/* Calendar Toggle Button */}
      <button
        onClick={() => setShowCalendar(!showCalendar)}
        className="w-full flex items-center justify-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <CalendarIcon className="w-5 h-5" />
        <span className="font-medium">{showCalendar ? t('booking.calendar.hide') : t('booking.calendar.show')}</span>
      </button>

      {/* Calendar Component */}
      {showCalendar && (
        <div className="border border-gray-200 rounded-lg p-4 bg-white">
          <Calendar
            value={selectedDate}
            onChange={handleCalendarDateSelect}
            minValue={today(getLocalTimeZone())}
            isDateUnavailable={(date) => {
              const dateString = date.toString()
              const availability = availabilityMap.get(dateString)
              return availability ? !availability.isAvailable : false
            }}
            className="w-full"
          />
        </div>
      )}

      {/* Helper Text */}
      <p className="text-xs text-gray-500 text-center">
        {t('booking.calendar.helperText')}
      </p>
    </div>
  )
}

export default BookingCalendar 