import React, { useState, useMemo } from 'react'
import { Calendar, DateValue } from '@heroui/react'
import { today, getLocalTimeZone } from '@internationalized/date'
import { Calendar as CalendarIcon, Clock, MapPin, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { getTimezoneInfo } from '../../utils/propertyUtils'
import toast from 'react-hot-toast'
import { useTranslation } from '../../lib/stores/translationStore'

interface TimeSlot {
  id: string
  startTime: string // HH:MM format
  endTime: string // HH:MM format
  isAvailable: boolean
  bookingId?: string
  blockedReason?: 'booking' | 'maintenance' | 'host_blocked'
  price?: number
}

interface DayAvailability {
  date: string // YYYY-MM-DD
  isFullyAvailable: boolean
  isPartiallyAvailable: boolean
  isFullyBooked: boolean
  timeSlots: TimeSlot[]
  totalAvailableHours: number
}

interface TimeBasedBookingCalendarProps {
  propertyId: string
  bookingType: 'full_day' | 'time_slot' | 'both'
  availabilityData: DayAvailability[]
  timezone?: string
  city?: string
  country?: string
  selectedDate?: string
  selectedTimeSlots?: string[]
  onDateSelect: (date: string) => void
  onTimeSlotSelect: (date: string, timeSlotIds: string[]) => void
  onBookingTypeChange?: (type: 'full_day' | 'time_slot') => void
  className?: string
}

const TimeBasedBookingCalendar: React.FC<TimeBasedBookingCalendarProps> = ({
  propertyId,
  bookingType,
  availabilityData,
  timezone = 'UTC',
  city,
  country,
  selectedDate,
  selectedTimeSlots = [],
  onDateSelect,
  onTimeSlotSelect,
  onBookingTypeChange,
  className = ''
}) => {
  const { t } = useTranslation(['booking', 'common'])
  const [showCalendar, setShowCalendar] = useState(false)
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<DateValue | null>(null)
  const [currentBookingType, setCurrentBookingType] = useState<'full_day' | 'time_slot'>(
    bookingType === 'both' ? 'time_slot' : bookingType
  )

  // Create availability map for quick lookup
  const availabilityMap = useMemo(() => {
    const map = new Map<string, DayAvailability>()
    availabilityData.forEach(day => {
      map.set(day.date, day)
    })
    return map
  }, [availabilityData])

  // Get timezone info for display
  const timezoneInfo = useMemo(() => {
    return getTimezoneInfo(timezone)
  }, [timezone])

  // Get availability status for a date
  const getDateAvailabilityStatus = (dateString: string) => {
    const dayData = availabilityMap.get(dateString)
    if (!dayData) return 'unavailable'
    
    if (dayData.isFullyAvailable) return 'fully_available'
    if (dayData.isPartiallyAvailable) return 'partially_available'
    if (dayData.isFullyBooked) return 'fully_booked'
    return 'unavailable'
  }

  // Handle calendar date selection
  const handleCalendarDateSelect = (date: DateValue) => {
    const dateString = date.toString()
    const dayData = availabilityMap.get(dateString)
    
    if (!dayData || dayData.isFullyBooked) {
      toast.error(t('booking.messages.dateFullyBooked'))
      return
    }

    setSelectedCalendarDate(date)
    onDateSelect(dateString)
    
    // Auto-select all available slots if booking full day
    if (currentBookingType === 'full_day' && dayData.isFullyAvailable) {
      const allSlotIds = dayData.timeSlots.filter(slot => slot.isAvailable).map(slot => slot.id)
      onTimeSlotSelect(dateString, allSlotIds)
      toast.success(t('booking.messages.fullDaySelected'))
    } else {
      toast.success(t('booking.messages.dateSelected'))
    }
  }

  // Handle time slot selection
  const handleTimeSlotToggle = (date: string, slotId: string) => {
    const dayData = availabilityMap.get(date)
    const slot = dayData?.timeSlots.find(s => s.id === slotId)
    
    if (!slot || !slot.isAvailable) {
      toast.error(t('booking.messages.timeSlotUnavailable'))
      return
    }

    let newSelectedSlots: string[]
    
    if (currentBookingType === 'full_day') {
      // For full day, select all available slots
      newSelectedSlots = dayData.timeSlots.filter(s => s.isAvailable).map(s => s.id)
    } else {
      // For time slot, toggle individual slot
      if (selectedTimeSlots.includes(slotId)) {
        newSelectedSlots = selectedTimeSlots.filter(id => id !== slotId)
      } else {
        newSelectedSlots = [...selectedTimeSlots, slotId]
      }
    }
    
    onTimeSlotSelect(date, newSelectedSlots)
  }

  // Handle booking type change
  const handleBookingTypeChange = (type: 'full_day' | 'time_slot') => {
    setCurrentBookingType(type)
    onBookingTypeChange?.(type)
    
    // Clear selections when changing booking type
    if (selectedDate) {
      onTimeSlotSelect(selectedDate, [])
    }
  }

  // Format time slot display
  const formatTimeSlot = (slot: TimeSlot) => {
    return `${slot.startTime} - ${slot.endTime}`
  }

  // Get selected day data
  const selectedDayData = selectedDate ? availabilityMap.get(selectedDate) : null

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Timezone Information */}
      {(city || country) && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
          <div className="flex items-center gap-2 text-blue-800">
            <MapPin className="size-4" />
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
        </div>
      )}

      {/* Booking Type Selector */}
      {bookingType === 'both' && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            {t('booking.labels.bookingType')}
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => handleBookingTypeChange('full_day')}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                currentBookingType === 'full_day'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {t('booking.labels.fullDay')}
            </button>
            <button
              onClick={() => handleBookingTypeChange('time_slot')}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                currentBookingType === 'time_slot'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {t('booking.labels.timeSlots')}
            </button>
          </div>
        </div>
      )}

      {/* Calendar Toggle Button */}
      <button
        onClick={() => setShowCalendar(!showCalendar)}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100"
      >
        <CalendarIcon className="size-5" />
        <span className="font-medium">
          {showCalendar ? t('booking.calendar.hide') : t('booking.calendar.show')}
        </span>
      </button>

      {/* Calendar Component */}
      {showCalendar && (
        <div className="w-full rounded-lg border border-gray-200 bg-white p-4">
          <Calendar
            value={selectedCalendarDate}
            onChange={handleCalendarDateSelect}
            minValue={today(getLocalTimeZone())}
            isDateUnavailable={(date) => {
              const dateString = date.toString()
              const status = getDateAvailabilityStatus(dateString)
              return status === 'unavailable' || status === 'fully_booked'
            }}
            className="w-full"
            classNames={{
              base: "w-full",
              grid: "w-full",
              gridWrapper: "w-full",
              cell: "w-full relative",
              cellButton: "w-full h-full relative"
            }}
            // Custom cell rendering for availability indicators
            renderCell={(date) => {
              const dateString = date.toString()
              const status = getDateAvailabilityStatus(dateString)
              const dayData = availabilityMap.get(dateString)
              
              let bgColor = 'bg-white'
              let textColor = 'text-gray-900'
              let indicator = null
              
              switch (status) {
                case 'fully_available':
                  bgColor = 'bg-green-50 hover:bg-green-100'
                  textColor = 'text-green-800'
                  indicator = <CheckCircle className="absolute top-0 right-0 size-3 text-green-500" />
                  break
                case 'partially_available':
                  bgColor = 'bg-yellow-50 hover:bg-yellow-100'
                  textColor = 'text-yellow-800'
                  indicator = <AlertCircle className="absolute top-0 right-0 size-3 text-yellow-500" />
                  break
                case 'fully_booked':
                  bgColor = 'bg-red-50'
                  textColor = 'text-red-400'
                  indicator = <XCircle className="absolute top-0 right-0 size-3 text-red-500" />
                  break
                default:
                  bgColor = 'bg-gray-50'
                  textColor = 'text-gray-400'
              }
              
              return (
                <div className={`relative h-full w-full rounded p-2 ${bgColor} ${textColor}`}>
                  <span className="text-sm font-medium">{date.day}</span>
                  {indicator}
                  {dayData && (
                    <div className="absolute bottom-0 left-0 right-0 text-xs">
                      <div className="text-center">
                        {dayData.totalAvailableHours}h
                      </div>
                    </div>
                  )}
                </div>
              )
            }}
          />
          
          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-1">
              <CheckCircle className="size-3 text-green-500" />
              <span>{t('booking.calendar.fullyAvailable')}</span>
            </div>
            <div className="flex items-center gap-1">
              <AlertCircle className="size-3 text-yellow-500" />
              <span>{t('booking.calendar.partiallyAvailable')}</span>
            </div>
            <div className="flex items-center gap-1">
              <XCircle className="size-3 text-red-500" />
              <span>{t('booking.calendar.fullyBooked')}</span>
            </div>
          </div>
        </div>
      )}

      {/* Time Slots Display */}
      {selectedDate && selectedDayData && (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="mb-3 flex items-center gap-2">
            <Clock className="size-5 text-gray-600" />
            <h3 className="font-medium text-gray-900">
              {t('booking.labels.availableTimeSlots')} - {new Date(selectedDate).toLocaleDateString()}
            </h3>
          </div>
          
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {selectedDayData.timeSlots.map((slot) => {
              const isSelected = selectedTimeSlots.includes(slot.id)
              const isAvailable = slot.isAvailable
              
              let buttonClass = 'p-3 rounded-lg border text-sm font-medium transition-all '
              
              if (!isAvailable) {
                buttonClass += 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
              } else if (isSelected) {
                buttonClass += 'border-primary-500 bg-primary-500 text-white'
              } else {
                buttonClass += 'border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:bg-primary-50'
              }
              
              return (
                <button
                  key={slot.id}
                  onClick={() => handleTimeSlotToggle(selectedDate, slot.id)}
                  disabled={!isAvailable}
                  className={buttonClass}
                >
                  <div className="text-center">
                    <div>{formatTimeSlot(slot)}</div>
                    {slot.price && (
                      <div className="text-xs opacity-75">
                        ${slot.price}
                      </div>
                    )}
                    {!isAvailable && slot.blockedReason && (
                      <div className="text-xs text-red-500 mt-1">
                        {t(`booking.blockedReasons.${slot.blockedReason}`)}
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
          
          {/* Selection Summary */}
          {selectedTimeSlots.length > 0 && (
            <div className="mt-4 rounded-lg bg-primary-50 p-3">
              <div className="text-sm text-primary-800">
                <strong>{t('booking.labels.selectedSlots')}:</strong> {selectedTimeSlots.length}
                <span className="ml-2">
                  ({selectedTimeSlots.length * 2}h) {/* Assuming 2-hour slots */}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Helper Text */}
      <p className="text-center text-xs text-gray-500">
        {currentBookingType === 'full_day' 
          ? t('booking.calendar.fullDayHelperText')
          : t('booking.calendar.timeSlotHelperText')
        }
      </p>
    </div>
  )
}

export default TimeBasedBookingCalendar